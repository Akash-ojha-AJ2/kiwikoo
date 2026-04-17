TRIA - Complete Setup Guide

This guide will help you set up the TRIA project from scratch after a fresh OS installation.

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **Git** installed (usually comes with Node.js or [download separately](https://git-scm.com/))
- [ ] **Supabase Account** ([Sign up here](https://supabase.com))
- [ ] **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- [ ] **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

---

## 🔧 Step-by-Step Setup

### Step 1: Verify Node.js Installation

Open PowerShell or Command Prompt and run:

```bash
node --version
npm --version
```

You should see version numbers. If you get an error, install Node.js from [nodejs.org](https://nodejs.org/).

**Recommended:** Install Node.js LTS version (20.x or higher)

**⚠️ PowerShell Note:** If Node.js works in CMD but not in PowerShell:
1. Add Node.js to PATH for this session:
   ```powershell
   $env:PATH += ";C:\Program Files\nodejs"
   ```
2. Fix PowerShell execution policy (if npm doesn't work):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
   ```
3. Or restart your IDE/terminal after installing Node.js

---

### Step 2: Install Project Dependencies

Navigate to your project directory (if not already there):

```bash
cd "C:\Users\Tamada\Desktop\Tria Production\Tria"
```

Install all dependencies:

```bash
npm install
```

This will install all packages listed in `package.json`. It may take a few minutes.

---

### Step 3: Set Up Supabase

1. **Create a Supabase Project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Fill in project details and wait for it to be created

2. **Get Your Supabase Credentials:**
   - Go to **Settings** → **API**
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)
     - **service_role key** (starts with `eyJ...` - keep this secret!)

3. **Get Your Database Connection String:**
   - Go to **Settings** → **Database**
   - Under "Connection string", select **"Session mode"**
   - Copy the connection string (it will look like: `postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true`)
   - Replace `[PASSWORD]` with your database password (found in project settings)

4. **Create Storage Buckets:**
   - Go to **Storage** in your Supabase dashboard
   - Create the following buckets (all should be **public**):
     - `uploads` - For general file uploads
     - `try-ons` - For try-on generated images
     - `ads` - For ad creatives
     - `products` - For product images
     - `portfolios` - For portfolio items

---

### Step 4: Configure Environment Variables

1. **Create `.env.local` file:**
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     copy .env.example .env.local
     ```
   - Or manually create a new file named `.env.local` in the project root

2. **Fill in your environment variables:**
   Open `.env.local` and replace all `[YOUR_...]` placeholders with your actual values:

   ```env
   # Database
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@xxxxx.supabase.co:6543/postgres?pgbouncer=true"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   
   # OpenAI
   OPENAI_API_KEY="[YOUR_OPENAI_API_KEY]"
   
   # Gemini
   GEMINI_API_KEY="[YOUR_GEMINI_API_KEY]"
   
   # Admin (Required for admin registration)
   ADMIN_SIGNUP_CODE="your-secure-admin-code-here"
   ```

   **⚠️ Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

---

### Step 5: Set Up the Database

Generate Prisma client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate the Prisma Client based on your schema
- Create all tables in your Supabase database

**Note:** If you encounter connection errors, double-check your `DATABASE_URL` in `.env.local`.

---

### Step 6: Verify Installation

Test that everything is set up correctly:

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.0.3
- Local:        http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the TRIA homepage.

---

## 🐛 Troubleshooting

### Node.js Not Found
- **Error:** `node: command not found`
- **Solution:** Install Node.js from [nodejs.org](https://nodejs.org/) and restart your terminal

### npm install Fails
- **Error:** Various dependency errors
- **Solution:** 
  - Delete `node_modules` folder and `package-lock.json`
  - Run `npm install` again
  - If still failing, try `npm install --legacy-peer-deps`

### Database Connection Errors
- **Error:** `Can't reach database server` or `Connection refused`
- **Solution:**
  - Verify `DATABASE_URL` is correct (use Session mode connection string)
  - Check that your Supabase project is active
  - Ensure you're using the correct password

### Prisma Errors
- **Error:** `PrismaClient is not configured`
- **Solution:**
  - Run `npx prisma generate` again
  - Check that `DATABASE_URL` is set correctly

### Environment Variables Not Loading
- **Error:** `OPENAI_API_KEY not configured`
- **Solution:**
  - Ensure `.env.local` exists in the project root (not in `src/`)
  - Restart the dev server after changing `.env.local`
  - Check for typos in variable names

### Supabase Storage Errors
- **Error:** `Bucket not found` or `Permission denied`
- **Solution:**
  - Verify all 5 storage buckets are created in Supabase
  - Ensure buckets are set to **public**
  - Check `SUPABASE_SERVICE_ROLE_KEY` is correct

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Node.js and npm are installed
- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] `.env.local` file created with all variables filled
- [ ] Supabase project created and credentials obtained
- [ ] All 5 storage buckets created in Supabase
- [ ] Database schema pushed successfully
- [ ] Dev server starts without errors
- [ ] Website loads at http://localhost:3000

---

## 📚 Next Steps

Once everything is set up:

1. **Explore the codebase:**
   - Check `README.md` for project overview
   - Review `PROJECT_SUMMARY.md` for feature details
   - Read `AI_MODELS_GUIDE.md` for AI integration details

2. **Test the features:**
   - Register a new account
   - Try the virtual try-on feature
   - Create a product (if you're a brand)
   - Test the AI ad generation

3. **Development:**
   - Make changes to the code
   - Test locally with `npm run dev`
   - Build for production with `npm run build`

---

## 🆘 Need Help?

If you encounter issues not covered here:

1. Check the error messages carefully
2. Review the relevant documentation files in the project
3. Verify all environment variables are set correctly
4. Ensure all prerequisites are installed

---

## 📝 Quick Reference Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# View database in Prisma Studio
npx prisma studio
```

---

**Happy coding! 🎉**

