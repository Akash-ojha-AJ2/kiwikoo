# ⚡ Quick Start Guide

## 🎯 First Steps (5 minutes)

### 1. Install Node.js (if not already installed)
- Download from: https://nodejs.org/
- Install the **LTS version** (20.x or higher)
- Restart your terminal after installation

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
copy .env.example .env.local
```

Then edit `.env.local` and fill in your API keys and database credentials.

### 4. Set Up Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📝 Required Environment Variables

You need to set these in `.env.local`:

### Supabase (Required)
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### AI Services (Required)
- `OPENAI_API_KEY` - OpenAI API key
- `GEMINI_API_KEY` - Google Gemini API key

### Admin (Required for admin registration)
- `ADMIN_SIGNUP_CODE` - Secret code for creating admin accounts (minimum 6 characters)

### Optional
- `GEMINI_MODEL_VERSION` - Default: `gemini-2.5-flash`
- `GEMINI_IMAGE_MODEL` - Default: `gemini-3-pro-image-preview`

---

## 🚨 Common Issues

**"node: command not found"**
→ Install Node.js from nodejs.org

**"OPENAI_API_KEY not configured"**
→ Check `.env.local` exists and has all variables filled

**"Can't reach database server"**
→ Verify `DATABASE_URL` is correct (use Supabase Session mode)

**Dependencies won't install**
→ Delete `node_modules` and `package-lock.json`, then run `npm install` again

---

## 📚 Full Documentation

For detailed setup instructions, see: **SETUP_GUIDE.md**

For project overview, see: **README.md**

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created and filled
- [ ] Supabase project created
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Dev server running (`npm run dev`)

