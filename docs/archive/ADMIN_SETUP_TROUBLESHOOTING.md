# Admin Setup Troubleshooting

## "Auth user not found in this Supabase project" Error

This error occurs when your environment variables point to different Supabase projects.

### Quick Fix

1. **Open your Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Get all credentials from the SAME project:**
   - Go to **Settings** → **API**
   - Copy these values:
     - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** (secret) → Use for `SUPABASE_SERVICE_ROLE_KEY`

3. **Update your `.env.local` file:**
   ```env
   # All three must be from the SAME Supabase project!
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Verify Your Setup

Check that all URLs match:
- `NEXT_PUBLIC_SUPABASE_URL` should be: `https://[PROJECT-REF].supabase.co`
- The project reference (the part before `.supabase.co`) should be the same for all three variables

### Common Mistakes

❌ **Wrong:** Using keys from different Supabase projects
✅ **Correct:** All keys from the same project

❌ **Wrong:** Missing `SUPABASE_SERVICE_ROLE_KEY`
✅ **Correct:** Service role key is required for admin operations

❌ **Wrong:** Using anon key instead of service_role key
✅ **Correct:** Service role key is different from anon key (it's the secret one)

### Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Check your terminal** where `npm run dev` is running for server logs
3. **Verify in Supabase Dashboard:**
   - Go to **Authentication** → **Users**
   - Check if the user was created (even if unconfirmed)

### Alternative: Disable Email Confirmation (Development Only)

If you're in development and want to skip email confirmation:

1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Under **Email Auth**, toggle **"Enable email confirmations"** to OFF
3. Try registering again

**Note:** Only do this in development! Always enable email confirmation in production.
