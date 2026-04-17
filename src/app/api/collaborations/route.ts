import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { collaborationSchema } from '@/lib/validation'
import { generateCollaborationProposal } from '@/lib/openai'
import { sendEmail } from '@/lib/email/supabase-email'
import {
  buildCollaborationAcceptedEmail,
  buildCollaborationDeclinedEmail,
  buildCollaborationRequestEmail,
} from '@/lib/email/templates'
import { getPublicSiteUrlFromRequest } from '@/lib/site-url'
import { z } from 'zod'

const requestSchema = collaborationSchema
  .extend({
    influencerId: z.string().min(1).max(100).optional(),
    brandId: z.string().min(1).max(100).optional(),
    productId: z.string().min(1).max(100).optional(),
  })
  .strict()

type UserRole = 'brand' | 'influencer'
type CollaborationStatus = 'pending' | 'accepted' | 'declined'

function normalizeRole(value: unknown): UserRole | null {
  const role = typeof value === 'string' ? value.toLowerCase() : ''
  if (role === 'brand' || role === 'influencer') return role
  return null
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function normalizeInfluencerProfile(value: unknown) {
  if (Array.isArray(value)) return value[0] || null
  return value || null
}

function getCollaborationMeta(collab: any) {
  const details = asObject(collab?.proposal_details)
  const explicitInitiatedBy = typeof details.initiated_by === 'string' ? details.initiated_by : null
  const explicitInitiatedRole = normalizeRole(details.initiated_role)
  const explicitReceiverId = typeof details.receiver_id === 'string' ? details.receiver_id : null
  const hasExplicitInitiator = Boolean(explicitInitiatedBy && explicitInitiatedRole)

  const initiatedBy = explicitInitiatedBy || collab.brand_id
  const initiatedRole = explicitInitiatedRole || 'brand'
  const receiverId = explicitReceiverId || (initiatedBy === collab.brand_id ? collab.influencer_id : collab.brand_id)
  const senderId = initiatedBy
  const senderRole: UserRole = initiatedRole
  const receiverRole: UserRole = senderRole === 'brand' ? 'influencer' : 'brand'

  return {
    details,
    hasExplicitInitiator,
    isLegacyFallback: !hasExplicitInitiator,
    initiatedBy,
    initiatedRole,
    receiverId,
    senderId,
    senderRole,
    receiverRole,
  }
}

function isCollaborationSender(
  collab: any,
  meta: ReturnType<typeof getCollaborationMeta>,
  viewerId: string,
  viewerRole: UserRole | null
) {
  if (meta.hasExplicitInitiator) return meta.senderId === viewerId

  // Legacy rows predate explicit metadata and historically behaved as brand -> influencer requests.
  return viewerRole === 'brand' && collab.brand_id === viewerId
}

function isCollaborationReceiver(
  collab: any,
  meta: ReturnType<typeof getCollaborationMeta>,
  viewerId: string,
  viewerRole: UserRole | null
) {
  if (meta.hasExplicitInitiator) return meta.receiverId === viewerId

  // Keep fallback rules narrow and predictable for pre-metadata rows.
  return viewerRole === 'influencer' && collab.influencer_id === viewerId
}

function getBrandDisplayName(profile: any) {
  return (profile?.brand_data?.companyName as string | undefined) || profile?.full_name || 'Brand'
}

function getInfluencerDisplayName(profile: any) {
  return profile?.full_name || 'Influencer'
}

function serializeCollaboration(collab: any) {
  return {
    id: collab.id,
    message: collab.message,
    status: collab.status,
    createdAt: collab.created_at,
    updatedAt: collab.updated_at,
    proposalDetails: asObject(collab.proposal_details),
    brand: collab.brand
      ? {
          id: collab.brand.id,
          name: collab.brand.full_name || null,
          brandProfile: asObject(collab.brand.brand_data),
        }
      : null,
    influencer: collab.influencer
      ? {
          id: collab.influencer.id,
          name: collab.influencer.full_name || null,
          influencerProfile: normalizeInfluencerProfile(collab.influencer.influencer_profiles),
        }
      : null,
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, influencer_profiles(*)')
      .eq('id', authUser.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    const parsed = requestSchema.parse(body)
    const { influencerId, brandId, productId, budget, timeline, goals, notes } = parsed

    let targetBrandId: string
    let targetInfluencerId: string
    const service = createServiceClient()
    const role = normalizeRole(profile.role)

    if (role === 'brand') {
      if (!influencerId) {
        return NextResponse.json({ error: 'Influencer ID required' }, { status: 400 })
      }

      targetBrandId = profile.id
      targetInfluencerId = influencerId

      const { data: influencer } = await service
        .from('profiles')
        .select('*, influencer_profiles(*)')
        .eq('id', influencerId)
        .single()

      if (!influencer || normalizeRole(influencer.role) !== 'influencer') {
        return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
      }

      const brandData = profile.brand_data || {}
      const message = await generateCollaborationProposal(
        {
          companyName: brandData.companyName || profile.full_name || 'Our Brand',
          vertical: brandData.vertical || undefined,
          budgetRange: brandData.budgetRange || undefined,
        },
        {
          bio: influencer.influencer_profiles?.bio || undefined,
          niches: (influencer.influencer_profiles?.niches as string[]) || [],
          followers: influencer.influencer_profiles?.followers || undefined,
        },
        { budget, timeline, goals, notes }
      )

      const { data: collaboration, error: createError } = await service
        .from('collaboration_requests')
        .insert({
          brand_id: targetBrandId,
          influencer_id: targetInfluencerId,
          product_id: productId || null,
          message,
          proposal_details: {
            budget,
            timeline,
            goals,
            notes,
            productId,
            initiated_by: profile.id,
            initiated_role: 'brand',
            receiver_id: targetInfluencerId,
          },
          status: 'pending',
        })
        .select(`
          *,
          brand:brand_id(id, full_name, brand_data),
          influencer:influencer_id(id, full_name, influencer_profiles(*))
        `)
        .single()

      if (createError) throw createError

      await service.from('notifications').insert({
        user_id: targetInfluencerId,
        type: 'collab_request',
        content: `New collaboration request from ${getBrandDisplayName(profile)}`,
        metadata: { requestId: collaboration.id },
      })

      try {
        if (influencer.email) {
          const baseUrl = getPublicSiteUrlFromRequest(request)
          const template = buildCollaborationRequestEmail({
            baseUrl,
            recipientName: influencer.full_name,
            senderName: getBrandDisplayName(profile),
            senderRole: 'brand',
            messagePreview: message,
          })

          await sendEmail({
            to: influencer.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          })
        }
      } catch (error) {
        console.warn('Collaboration request email failed:', error)
      }

      return NextResponse.json(serializeCollaboration(collaboration), { status: 201 })
    }

    if (role === 'influencer') {
      if (!brandId && !productId) {
        return NextResponse.json({ error: 'Brand ID or Product ID required' }, { status: 400 })
      }

      targetInfluencerId = profile.id

      if (productId) {
        const { data: product } = await service
          .from('products')
          .select('brand_id')
          .eq('id', productId)
          .single()

        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        targetBrandId = product.brand_id
      } else {
        targetBrandId = brandId!
      }

      const { data: brand } = await service
        .from('profiles')
        .select('*')
        .eq('id', targetBrandId)
        .single()

      if (!brand || normalizeRole(brand.role) !== 'brand') {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
      }

      const message = notes || `I'm interested in collaborating with ${getBrandDisplayName(brand)}.`

      const { data: collaboration, error: createError } = await service
        .from('collaboration_requests')
        .insert({
          brand_id: targetBrandId,
          influencer_id: targetInfluencerId,
          product_id: productId || null,
          message,
          proposal_details: {
            budget,
            timeline,
            goals: goals || [],
            notes,
            productId,
            initiated_by: profile.id,
            initiated_role: 'influencer',
            receiver_id: targetBrandId,
          },
          status: 'pending',
        })
        .select(`
          *,
          brand:brand_id(id, full_name, brand_data),
          influencer:influencer_id(id, full_name, influencer_profiles(*))
        `)
        .single()

      if (createError) throw createError

      await service.from('notifications').insert({
        user_id: targetBrandId,
        type: 'collab_request',
        content: `New collaboration request from ${getInfluencerDisplayName(profile)}`,
        metadata: { requestId: collaboration.id },
      })

      try {
        if (brand.email) {
          const baseUrl = getPublicSiteUrlFromRequest(request)
          const template = buildCollaborationRequestEmail({
            baseUrl,
            recipientName: brand.full_name || 'Brand',
            senderName: getInfluencerDisplayName(profile),
            senderRole: 'influencer',
            messagePreview: message,
          })

          await sendEmail({
            to: brand.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          })
        }
      } catch (error) {
        console.warn('Collaboration request email failed:', error)
      }

      return NextResponse.json(serializeCollaboration(collaboration), { status: 201 })
    }

    return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 })
  } catch (error) {
    console.error('Collaboration creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const { data: viewerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()
    const viewerRole = normalizeRole(viewerProfile?.role)

    const { data: collaborations, error } = await supabase
      .from('collaboration_requests')
      .select(`
        *,
        brand:brand_id(id, full_name, brand_data),
        influencer:influencer_id(id, full_name, influencer_profiles(*))
      `)
      .or(`brand_id.eq.${authUser.id},influencer_id.eq.${authUser.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    const filtered = (collaborations || []).filter((collab: any) => {
      const meta = getCollaborationMeta(collab)

      if (type === 'sent') {
        return isCollaborationSender(collab, meta, authUser.id, viewerRole)
      }

      if (type === 'received') {
        return isCollaborationReceiver(collab, meta, authUser.id, viewerRole)
      }

      return collab.brand_id === authUser.id || collab.influencer_id === authUser.id
    })

    return NextResponse.json(filtered.map(serializeCollaboration), {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Collaboration fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const { id, status } = z
      .object({
        id: z.string(),
        status: z.enum(['accepted', 'declined']),
      })
      .parse(body)

    const service = createServiceClient()
    const { data: collab, error: collabError } = await service
      .from('collaboration_requests')
      .select(`
        *,
        brand:brand_id(id, email, full_name, brand_data),
        influencer:influencer_id(id, email, full_name, influencer_profiles(*))
      `)
      .eq('id', id)
      .single()

    if (collabError) throw collabError
    if (!collab) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const meta = getCollaborationMeta(collab)
    const viewerRole: UserRole | null =
      collab.brand_id === authUser.id
        ? 'brand'
        : collab.influencer_id === authUser.id
          ? 'influencer'
          : null

    if (!isCollaborationReceiver(collab, meta, authUser.id, viewerRole)) {
      return NextResponse.json({ error: 'Only the receiving side can update this request' }, { status: 403 })
    }

    if ((collab.status as CollaborationStatus) !== 'pending') {
      return NextResponse.json({ error: 'This collaboration request has already been resolved' }, { status: 409 })
    }

    const { error: updateError } = await service
      .from('collaboration_requests')
      .update({ status })
      .eq('id', id)

    if (updateError) throw updateError

    const responderName =
      meta.receiverRole === 'brand'
        ? getBrandDisplayName(collab.brand)
        : getInfluencerDisplayName(collab.influencer)
    const initiatorName =
      meta.senderRole === 'brand'
        ? getBrandDisplayName(collab.brand)
        : getInfluencerDisplayName(collab.influencer)

    await service.from('notifications').insert({
      user_id: meta.senderId,
      type: `collab_${status}`,
      content: `${responderName} ${status} your collaboration request`,
      metadata: { requestId: id },
    })

    const initiatorEmail = meta.senderRole === 'brand' ? collab.brand?.email : collab.influencer?.email
    if (initiatorEmail) {
      try {
        const baseUrl = getPublicSiteUrlFromRequest(request)
        const template =
          status === 'accepted'
            ? buildCollaborationAcceptedEmail({
                baseUrl,
                recipientName: initiatorName,
                counterpartName: responderName,
                recipientRole: meta.senderRole,
              })
            : buildCollaborationDeclinedEmail({
                baseUrl,
                recipientName: initiatorName,
                counterpartName: responderName,
                recipientRole: meta.senderRole,
              })

        await sendEmail({
          to: initiatorEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })
      } catch (emailError) {
        console.warn(`Collaboration ${status} email failed:`, emailError)
      }
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Collaboration update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
