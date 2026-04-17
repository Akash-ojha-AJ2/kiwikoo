import { joinPublicUrl } from '@/lib/site-url'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

const COLORS = {
  primary: '#1f2937',
  secondary: '#374151',
  accent: '#f5e6d3',
  muted: '#9ca3af',
  success: '#059669',
  error: '#dc2626',
  background: '#faf9f7',
}

function baseLayout(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 560px; border-collapse: collapse;">
          <tr>
            <td style="padding: 24px 32px; background: ${COLORS.primary}; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: white; letter-spacing: 0.5px;">
                Kiwikoo
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; background: white; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: ${COLORS.primary};">${title}</h2>
              <div style="font-size: 15px; line-height: 1.6; color: ${COLORS.secondary};">
                ${body}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background: ${COLORS.accent}; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: ${COLORS.muted};">
                (c) ${new Date().getFullYear()} Kiwikoo. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: ${COLORS.muted};">
                AI-powered fashion try-on marketplace
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function buttonStyle(color: string = COLORS.primary): string {
  return `display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 14px;`
}

export function buildInfluencerApprovalEmail(params: {
  name?: string | null
  baseUrl: string
}): EmailTemplate {
  const dashboardUrl = joinPublicUrl(params.baseUrl, '/influencer/dashboard')
  const greeting = params.name ? `Hi ${params.name},` : 'Hi there,'
  const body = `
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">
      Great news! Your influencer application has been <strong style="color: ${COLORS.success};">approved</strong>.
    </p>
    <p style="margin: 0 0 16px 0;">
      You can now access all influencer features including:
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: ${COLORS.secondary};">
      <li style="margin-bottom: 8px;">Virtual try-on studio</li>
      <li style="margin-bottom: 8px;">Brand collaborations</li>
      <li style="margin-bottom: 8px;">Analytics dashboard</li>
    </ul>
    <p style="margin: 0 0 24px 0;">
      <a href="${dashboardUrl}" style="${buttonStyle(COLORS.success)}">Go to Dashboard</a>
    </p>
  `
  return {
    subject: 'Your influencer application is approved',
    html: baseLayout('Application Approved', body),
    text: `${greeting}\n\nGreat news! Your influencer application has been approved. You can now access all influencer features.\n\nVisit your dashboard: ${dashboardUrl}\n`,
  }
}

export function buildInfluencerRejectionEmail(params: {
  name?: string | null
  baseUrl: string
  reviewNote?: string | null
}): EmailTemplate {
  const profileUrl = joinPublicUrl(params.baseUrl, '/profile')
  const greeting = params.name ? `Hi ${params.name},` : 'Hi there,'
  const note = params.reviewNote?.trim()
  const body = `
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">
      Thank you for your interest in becoming a Kiwikoo influencer. After careful review, we're unable to approve your application at this time.
    </p>
    ${note ? `
    <div style="margin: 0 0 16px 0; padding: 16px; background: ${COLORS.accent}; border-radius: 8px; border-left: 4px solid ${COLORS.primary};">
      <p style="margin: 0; font-weight: 600; font-size: 13px; color: ${COLORS.muted};">Feedback from our team:</p>
      <p style="margin: 8px 0 0 0; color: ${COLORS.primary};">${note}</p>
    </div>
    ` : ''}
    <p style="margin: 0 0 16px 0;">
      You are welcome to update your profile and reapply when you are ready.
    </p>
    <p style="margin: 0 0 24px 0;">
      <a href="${profileUrl}" style="${buttonStyle()}">Update Profile</a>
    </p>
  `
  return {
    subject: 'Update on your influencer application',
    html: baseLayout('Application Update', body),
    text: `${greeting}\n\nThank you for your interest in becoming a Kiwikoo influencer. After review, we are unable to approve your application at this time.${note ? `\n\nFeedback: ${note}` : ''}\n\nYou can update your profile and reapply: ${profileUrl}\n`,
  }
}

export function buildCollaborationRequestEmail(params: {
  baseUrl: string
  recipientName?: string | null
  senderName?: string | null
  senderRole: 'brand' | 'influencer'
  messagePreview?: string | null
}): EmailTemplate {
  const collabUrl =
    params.senderRole === 'brand'
      ? joinPublicUrl(params.baseUrl, '/influencer/collaborations')
      : joinPublicUrl(params.baseUrl, '/brand/collaborations')
  const greeting = params.recipientName ? `Hi ${params.recipientName},` : 'Hi there,'
  const senderLabel = params.senderRole === 'brand' ? 'a brand' : 'an influencer'
  const body = `
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">
      You have a new collaboration request from <strong>${params.senderName || senderLabel}</strong>.
    </p>
    ${params.messagePreview ? `
    <div style="margin: 0 0 20px 0; padding: 16px; background: ${COLORS.accent}; border-radius: 8px; border-left: 4px solid ${COLORS.primary};">
      <p style="margin: 0; font-weight: 600; font-size: 13px; color: ${COLORS.muted};">Message:</p>
      <p style="margin: 8px 0 0 0; color: ${COLORS.primary};">${params.messagePreview.length > 200 ? `${params.messagePreview.slice(0, 200)}...` : params.messagePreview}</p>
    </div>
    ` : ''}
    <p style="margin: 0 0 24px 0;">
      <a href="${collabUrl}" style="${buttonStyle()}">View Request</a>
    </p>
  `
  return {
    subject: `New collaboration request from ${params.senderName || senderLabel}`,
    html: baseLayout('New Collaboration Request', body),
    text: `${greeting}\n\nYou have a new collaboration request from ${params.senderName || senderLabel}.\n\n${params.messagePreview ? `Message: ${params.messagePreview}\n\n` : ''}View request: ${collabUrl}\n`,
  }
}

export function buildCollaborationAcceptedEmail(params: {
  baseUrl: string
  recipientName?: string | null
  counterpartName?: string | null
  recipientRole: 'brand' | 'influencer'
}): EmailTemplate {
  const collabUrl =
    params.recipientRole === 'brand'
      ? joinPublicUrl(params.baseUrl, '/brand/collaborations')
      : joinPublicUrl(params.baseUrl, '/influencer/collaborations')
  const greeting = params.recipientName ? `Hi ${params.recipientName},` : 'Hi there,'
  const counterpart = params.counterpartName || 'Your collaboration partner'
  const body = `
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">
      Great news! <strong>${counterpart}</strong> has <strong style="color: ${COLORS.success};">accepted</strong> your collaboration request.
    </p>
    <p style="margin: 0 0 16px 0;">
      You can now move forward with the collaboration and coordinate the next steps.
    </p>
    <p style="margin: 0 0 24px 0;">
      <a href="${collabUrl}" style="${buttonStyle(COLORS.success)}">View Collaboration</a>
    </p>
  `
  return {
    subject: `${counterpart} accepted your collaboration request`,
    html: baseLayout('Collaboration Accepted', body),
    text: `${greeting}\n\nGreat news! ${counterpart} accepted your collaboration request.\n\nView collaboration: ${collabUrl}\n`,
  }
}

export function buildCollaborationDeclinedEmail(params: {
  baseUrl: string
  recipientName?: string | null
  counterpartName?: string | null
  recipientRole: 'brand' | 'influencer'
}): EmailTemplate {
  const nextUrl =
    params.recipientRole === 'brand'
      ? joinPublicUrl(params.baseUrl, '/brand/influencers')
      : joinPublicUrl(params.baseUrl, '/marketplace')
  const greeting = params.recipientName ? `Hi ${params.recipientName},` : 'Hi there,'
  const counterpart = params.counterpartName || 'Your collaboration partner'
  const body = `
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">
      <strong>${counterpart}</strong> has declined your collaboration request.
    </p>
    <p style="margin: 0 0 16px 0;">
      You can explore other opportunities and send a fresh request whenever you are ready.
    </p>
    <p style="margin: 0 0 24px 0;">
      <a href="${nextUrl}" style="${buttonStyle()}">Explore Next Steps</a>
    </p>
  `
  return {
    subject: 'Update on your collaboration request',
    html: baseLayout('Collaboration Update', body),
    text: `${greeting}\n\n${counterpart} declined your collaboration request.\n\nExplore next steps: ${nextUrl}\n`,
  }
}

export function buildWelcomeEmail(params: {
  baseUrl: string
  name?: string | null
  role: 'BRAND' | 'INFLUENCER'
}): EmailTemplate {
  const dashboardUrl =
    params.role === 'BRAND'
      ? joinPublicUrl(params.baseUrl, '/brand/dashboard')
      : joinPublicUrl(params.baseUrl, '/influencer/dashboard')
  const greeting = params.name ? `Hi ${params.name},` : 'Hi there,'
  const roleText =
    params.role === 'BRAND'
      ? 'As a brand, you can discover influencers, manage products, and create powerful collaborations.'
      : 'As an influencer, you can try on products virtually, connect with brands, and grow your portfolio.'
  const body = `
    <p style="margin: 0 0 16px 0;">${greeting}</p>
    <p style="margin: 0 0 16px 0;">
      Welcome to Kiwikoo! We are excited to have you on board.
    </p>
    <p style="margin: 0 0 16px 0;">
      ${roleText}
    </p>
    <p style="margin: 0 0 16px 0;">
      Here is what you can do next:
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: ${COLORS.secondary};">
      ${params.role === 'BRAND' ? `
        <li style="margin-bottom: 8px;">Add your products to the marketplace</li>
        <li style="margin-bottom: 8px;">Browse and connect with influencers</li>
        <li style="margin-bottom: 8px;">Create collaboration campaigns</li>
      ` : `
        <li style="margin-bottom: 8px;">Complete your profile</li>
        <li style="margin-bottom: 8px;">Browse products in the marketplace</li>
        <li style="margin-bottom: 8px;">Try on products with our AI studio</li>
      `}
    </ul>
    <p style="margin: 0 0 24px 0;">
      <a href="${dashboardUrl}" style="${buttonStyle()}">Go to Dashboard</a>
    </p>
  `
  return {
    subject: 'Welcome to Kiwikoo',
    html: baseLayout('Welcome to Kiwikoo', body),
    text: `${greeting}\n\nWelcome to Kiwikoo! We are excited to have you.\n\n${roleText}\n\nGet started: ${dashboardUrl}\n`,
  }
}
