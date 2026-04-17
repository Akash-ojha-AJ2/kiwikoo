import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/email/supabase-email'

const schema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().email(),
    subject: z.string().trim().min(3).max(200),
    message: z.string().trim().min(10).max(4000),
    userType: z.enum(['Influencer', 'Brand', 'Other']),
  })
  .strict()

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const data = schema.parse(body)

    const supportEmail = process.env.SUPPORT_EMAIL || 'team@dridhatechnologies.com'
    const subject = `[Kiwikoo Support] ${data.subject}`

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <h2>New support request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>User type:</strong> ${data.userType}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br/>')}</p>
      </div>
    `

    const text = `New support request\n\nName: ${data.name}\nEmail: ${data.email}\nUser type: ${data.userType}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`

    await sendEmail({
      to: supportEmail,
      subject,
      html,
      text,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
