import 'server-only'

import nodemailer from 'nodemailer'

export interface SendEmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

let cachedTransporter: nodemailer.Transporter | null = null

function getSmtpTransporter() {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST?.trim()
  const port = Number(process.env.SMTP_PORT || '0')
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    return null
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user,
      pass,
    },
  })

  return cachedTransporter
}

function getFromAddress() {
  return process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Kiwikoo <no-reply@kiwikoo.com>'
}

async function sendWithSmtp(payload: SendEmailPayload): Promise<SendEmailResult> {
  const transporter = getSmtpTransporter()
  if (!transporter) {
    return { ok: false, skipped: true, error: 'SMTP transport not configured' }
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    })

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn('SMTP send error:', message)
    return { ok: false, error: message }
  }
}

async function sendWithResend(payload: SendEmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, skipped: true, error: 'RESEND_API_KEY missing' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.warn('Failed to send email with Resend:', response.status, errorBody)
      return { ok: false, error: errorBody || `HTTP ${response.status}` }
    }

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn('Resend send error:', message)
    return { ok: false, error: message }
  }
}

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const smtpResult = await sendWithSmtp(payload)
  if (smtpResult.ok) return smtpResult

  const resendResult = await sendWithResend(payload)
  if (resendResult.ok) return resendResult

  if (smtpResult.skipped && resendResult.skipped) {
    console.warn('No SMTP or Resend email transport configured, skipping email send')
    return { ok: false, skipped: true, error: 'No email transport configured' }
  }

  const parts = [
    smtpResult.skipped ? null : `SMTP: ${smtpResult.error || 'Unknown failure'}`,
    resendResult.skipped ? null : `Resend: ${resendResult.error || 'Unknown failure'}`,
  ].filter(Boolean)

  return {
    ok: false,
    error: parts.join(' | ') || resendResult.error || smtpResult.error || 'Failed to send email',
  }
}
