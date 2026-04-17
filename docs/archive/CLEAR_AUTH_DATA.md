# Clear Authentication Data - Fresh Start

## ⚠️ WARNING

This operation will **permanently delete** all authentication data:
- All Supabase Auth users
- All Supabase tables (influencer_applications, admin_users)
- Optionally: All Prisma user data

**This cannot be undone!**

## 🚀 Methods

### Method 1: Admin API Endpoint (Recommended)

Use the admin API endpoint from your admin account:

```bash
curl -X POST http://localhost:3000/api/admin/clear-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "confirm": true,
    "includePrisma": true
  }'
```

**Or use the browser console:**
```javascript
fetch('/api/admin/clear-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    confirm: true,
    includePrisma: true // Set to false to keep Prisma data
  })
})
.then(r => r.json())
.then(console.log)
```

### Method 2: Script (Direct)

Run the cleanup script directly:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the script
npx tsx scripts/clear-auth-data.ts

# To also clear Prisma data
npx tsx scripts/clear-auth-data.ts --prisma
```

**Note:** For Prisma clearing, you'll need to manually run SQL:
```sql
DELETE FROM "User";
```

### Method 3: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Select all users and delete them
4. Navigate to **Table Editor**
5. Clear the following tables:
   - `influencer_applications`
   - `admin_users`

### Method 4: Direct Database (Advanced)

If you have direct database access:

```sql
-- Clear Supabase Auth users (via Supabase dashboard or API)
-- This must be done via Supabase Admin API, not SQL

-- Clear Supabase tables
DELETE FROM influencer_applications;
DELETE FROM admin_users;

-- Clear Prisma data (optional)
DELETE FROM "User"; -- This will cascade delete related records
```

## 📋 What Gets Deleted

### Always Deleted:
- ✅ All Supabase Auth users
- ✅ All `influencer_applications` records
- ✅ All `admin_users` records

### Optional (if `includePrisma: true`):
- ✅ All `User` records in Prisma
- ✅ All related records (cascade):
  - `InfluencerProfile`
  - `BrandProfile`
  - `UserProfileImage`
  - `GenerationJob`
  - `Campaign`
  - `AdCreative`
  - `Portfolio`
  - `Notification`
  - `CollaborationRequest`
  - `Favorite`

## ✅ After Clearing

1. **Verify cleanup:**
   - Check Supabase Auth: Should show 0 users
   - Check Supabase tables: Should be empty
   - Check Prisma (if cleared): Should have no users

2. **Test registration:**
   - Try registering a new user
   - Verify they can complete onboarding
   - Verify they can access the dashboard

3. **Recreate admin (if needed):**
   - Register a new admin account
   - Add to `admin_users` table manually or via admin panel

## 🔒 Security Notes

- Only admins can use the API endpoint
- The script requires `SUPABASE_SERVICE_ROLE_KEY`
- Always backup data before clearing if you might need it later
- Consider exporting data before deletion if needed for migration

## 📝 Example: Complete Fresh Start

```bash
# 1. Clear all auth data via API
curl -X POST http://localhost:3000/api/admin/clear-auth \
  -H "Content-Type: application/json" \
  -H "Cookie: your-admin-cookie" \
  -d '{"confirm": true, "includePrisma": true}'

# 2. Verify cleanup
# Check Supabase dashboard

# 3. Register first admin user
# Use registration page, then add to admin_users table

# 4. Test the system
# Register a new influencer user
# Complete onboarding
# Verify everything works
```

---

**Status**: Ready to use
**Last Updated**: After creating cleanup tools
