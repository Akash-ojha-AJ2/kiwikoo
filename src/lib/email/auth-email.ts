import 'server-only'

import type { EmailTemplate } from './templates'
import { joinPublicUrl } from '@/lib/site-url'

const BRAND_NAME = 'Kiwikoo'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderLayout(title: string, intro: string, ctaLabel: string, ctaUrl: string, outro: string) {
  const safeTitle = escapeHtml(title)
  const safeIntro = escapeHtml(intro)
  const safeLabel = escapeHtml(ctaLabel)
  const safeOutro = escapeHtml(outro)

  return {
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#fdf6ec;font-family:Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" style="border-collapse:collapse;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;border-collapse:collapse;background:#ffffff;border:3px solid #111827;">
          <tr>
            <td style="padding:24px 28px;background:#111827;color:#ffffff;">
              <div style="font-size:24px;font-weight:700;">${BRAND_NAME}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;">${safeTitle}</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">${safeIntro}</p>
              <p style="margin:24px 0;">
                <a href="${ctaUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;font-weight:700;border-radius:10px;">${safeLabel}</a>
              </p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#4b5563;">${safeOutro}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim(),
    text: `${title}\n\n${intro}\n\n${ctaLabel}: ${ctaUrl}\n\n${outro}`,
  }
}

export function buildVerifyOtpUrl(baseUrl: string, params: { tokenHash: string; type: string; nextPath?: string }) {
  const url = new URL(joinPublicUrl(baseUrl, '/auth/confirm'))
  url.searchParams.set('token_hash', params.tokenHash)
  url.searchParams.set('type', params.type)
  if (params.nextPath) {
    url.searchParams.set('next', params.nextPath)
  }
  return url.toString()
}

export function buildEmailConfirmationEmail(params: { confirmUrl: string }): EmailTemplate {
  const content = renderLayout(
    'Confirm your email',
    'Use the button below to confirm your email address and finish setting up your access.',
    'Confirm email',
    params.confirmUrl,
    'If you did not request this account action, you can ignore this email.'
  )

  return {
    subject: 'Confirm your Kiwikoo email',
    ...content,
  }
}

export function buildPasswordResetEmail(params: { resetUrl: string }): EmailTemplate {
  const content = renderLayout(
    'Reset your password',
    'Use the button below to choose a new password for your Kiwikoo account.',
    'Reset password',
    params.resetUrl,
    'If you did not request a password reset, you can ignore this email.'
  )

  return {
    subject: 'Reset your Kiwikoo password',
    ...content,
  }
}

export function buildEmailChangeCurrentEmail(params: { confirmUrl: string; newEmail: string }): EmailTemplate {
  const content = renderLayout(
    'Approve your email change',
    `We received a request to change your sign-in email to ${params.newEmail}. Confirm from your current inbox to continue.`,
    'Approve change',
    params.confirmUrl,
    'If you did not request this change, ignore this email and your current sign-in email will remain unchanged.'
  )

  return {
    subject: 'Approve your Kiwikoo email change',
    ...content,
  }
}

export function buildEmailChangeNewEmail(params: { confirmUrl: string; newEmail: string }): EmailTemplate {
  const content = renderLayout(
    'Confirm your new email address',
    `This inbox was added as your new Kiwikoo sign-in email: ${params.newEmail}. Confirm it below to finish the change.`,
    'Confirm new email',
    params.confirmUrl,
    'If you were not expecting this, you can ignore this message.'
  )

  return {
    subject: 'Confirm your new Kiwikoo email',
    ...content,
  }
}
