# Email Setup Guide for Kiwikoo

This guide covers setting up email notifications for the Kiwikoo platform.

## Overview

Kiwikoo uses **Resend** for transactional emails. The system sends emails for:

- **Influencer Applications**: Approval/rejection notifications
- **Collaborations**: New requests, accepted, declined notifications
- **Welcome Emails**: New user registration (optional)
- **Password Reset**: Handled by Supabase Auth

## Quick Setup

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address

### 2. Add Your Domain

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `kiwikoo.com`
4. Add the DNS records Resend provides to your domain (GoDaddy/Vercel)

**Required DNS Records (example):**
| Type | Name | Value |
|------|------|-------|
| TXT | @ | v=spf1 include:resend.com ~all |
| TXT | resend._domainkey | (provided by Resend) |
| MX | bounces | feedback-smtp.us-east-1.amazonses.com |

### 3. Create API Key

1. In Resend, go to **API Keys**
2. Click **Create API Key**
3. Name it (e.g., "Kiwikoo Production")
4. Copy the key (starts with `re_`)

### 4. Add Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

```env
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (defaults shown)
RESEND_FROM_EMAIL=Kiwikoo <no-reply@kiwikoo.com>
```

**Important:** The `RESEND_FROM_EMAIL` must use a verified domain in Resend.

### 5. Verify Setup

After adding the DNS records:
1. Wait for DNS propagation (can take up to 48 hours, usually faster)
2. Check Resend dashboard - domain should show "Verified"
3. Test by triggering an email action (e.g., approve an influencer)

---

## Email Types

### 1. Influencer Application Emails

**Trigger:** Admin approves or rejects an influencer application

| Status | Email Sent | Recipient |
|--------|------------|-----------|
| Approved | Approval email with dashboard link | Influencer |
| Rejected | Rejection email with feedback | Influencer |

**API Route:** `PATCH /api/admin/influencers`

### 2. Collaboration Request Emails

**Trigger:** Brand or influencer sends a collaboration request

| Action | Email Sent | Recipient |
|--------|------------|-----------|
| Brand → Influencer | New request notification | Influencer |
| Influencer → Brand | New request notification | Brand |

**API Route:** `POST /api/collaborations`

### 3. Collaboration Response Emails

**Trigger:** Influencer accepts or declines a collaboration

| Status | Email Sent | Recipient |
|--------|------------|-----------|
| Accepted | Acceptance notification | Brand |
| Declined | Decline notification | Brand |

**API Route:** `PATCH /api/collaborations`

---

## Email Templates

All email templates are in `src/lib/email/templates.ts`:

| Function | Purpose |
|----------|---------|
| `buildInfluencerApprovalEmail` | Influencer approved |
| `buildInfluencerRejectionEmail` | Influencer rejected |
| `buildCollaborationRequestEmail` | New collab request |
| `buildCollaborationAcceptedEmail` | Collab accepted |
| `buildCollaborationDeclinedEmail` | Collab declined |
| `buildWelcomeEmail` | Welcome new users |

### Customizing Templates

Templates use inline CSS for email client compatibility. Key colors are defined at the top of the file:

```typescript
const COLORS = {
  primary: '#1f2937',    // charcoal
  secondary: '#374151',  // dark gray
  accent: '#f5e6d3',     // cream/peach
  success: '#059669',    // green
  error: '#dc2626',      // red
}
```

---

## Supabase Auth Emails

Supabase handles authentication emails (confirmation, password reset) separately.

### Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Configure these templates:

| Template | Purpose |
|----------|---------|
| Confirm signup | Email verification link |
| Reset Password | Password reset link |
| Change Email | Email change confirmation |

### Important Settings

In **Authentication** → **URL Configuration**:

- **Site URL**: `https://kiwikoo.com`
- **Redirect URLs**: Add your allowed redirect URLs

In **Authentication** → **Email**:

- Enable **Confirm email** for secure signups
- Set **Mailer OTP Expiration** (default: 1 hour)

---

## Testing Emails

### Local Development

During development without a Resend API key, emails are logged to console instead:

```
RESEND_API_KEY not set, skipping email send
```

### Testing in Production

1. Use a test account with a real email
2. Trigger actions that send emails
3. Check the Resend dashboard for delivery status
4. Check spam folders if emails don't arrive

### Common Issues

**Emails not sending:**
- Check `RESEND_API_KEY` is set in Vercel
- Verify domain is verified in Resend
- Check Resend dashboard for errors

**Emails going to spam:**
- Ensure all DNS records are properly configured
- Wait for full DNS propagation
- Check SPF/DKIM records are valid

**Wrong sender address:**
- Update `RESEND_FROM_EMAIL` environment variable
- Ensure the domain in the sender address is verified

---

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Your Resend API key |
| `RESEND_FROM_EMAIL` | No | Sender address (default: `Kiwikoo <no-reply@kiwikoo.com>`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your site URL for email links (e.g., `https://kiwikoo.com`) |

---

## Architecture

```
User Action
    ↓
API Route (e.g., /api/collaborations)
    ↓
sendEmail() function
    ↓
Resend API
    ↓
Email Delivered
```

**Files:**
- `src/lib/email/supabase-email.ts` - Email sending utility
- `src/lib/email/templates.ts` - Email templates
- `src/lib/site-url.ts` - URL utilities for email links

---

## Monitoring

### Resend Dashboard

Monitor email delivery in the Resend dashboard:
- **Sent**: Email accepted by Resend
- **Delivered**: Email delivered to recipient
- **Bounced**: Email bounced
- **Complained**: Marked as spam

### Application Logs

Check Vercel logs for email sending errors:
- Look for `Failed to send email` warnings
- Check for `RESEND_API_KEY not set` messages
