# TRIA - AI Fashion Try-On Marketplace

AI-powered platform connecting influencers and brands with virtual try-on capabilities, intelligent ad generation, campaign management, and collaboration features.

## Features

- **Virtual Try-On Generation**: AI-powered virtual try-on with face preservation
- **Ad Generation**: Intelligent ad composition with quality rating
- **Campaign Management**: Create and manage marketing campaigns
- **Collaboration System**: Connect brands with influencers
- **Product Management**: Manage product catalogs
- **AI Recommendations**: Product recommendations based on influencer profiles
- **Fashion Buddy**: AI fashion assistant for styling advice

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI Services**: OpenAI, Nano Banana, Google Gemini
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- API keys for:
  - OpenAI
  - Nano Banana
  - Google Gemini

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tria-production-pilot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (influencer)/      # Influencer dashboard pages
│   ├── (brand)/           # Brand dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                   # Utility libraries
│   ├── openai.ts         # OpenAI integration
│   ├── nanobanana.ts     # Nano Banana integration
│   ├── gemini.ts         # Gemini integration
│   ├── storage.ts        # Supabase Storage utilities
│   ├── rate-limit.ts     # Rate limiting
│   └── ...
└── prisma/               # Prisma schema and migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Try-On
- `POST /api/tryon` - Generate virtual try-on

### Ads
- `POST /api/ads/generate` - Generate ad creative
- `POST /api/ads/rate` - Rate ad quality
- `POST /api/ads/improve` - Get improvement suggestions

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - List campaigns

### Collaborations
- `POST /api/collaborations` - Send collaboration request
- `GET /api/collaborations` - List collaborations
- `PATCH /api/collaborations` - Accept/decline collaboration

### Products
- `POST /api/products` - Create product
- `GET /api/products` - List/search products
- `PATCH /api/products` - Update product
- `DELETE /api/products` - Delete product
- `GET /api/products/recommend` - Get AI recommendations

### Fashion Buddy
- `POST /api/fashion-buddy/analyze` - Analyze outfit
- `POST /api/fashion-buddy/chat` - Chat with AI assistant

### Analytics
- `GET /api/analytics/influencer` - Influencer analytics
- `GET /api/analytics/brand` - Brand analytics

## Environment Variables

Required environment variables (add to `.env.local`):

### Database & Auth
- `DATABASE_URL`: PostgreSQL connection string (Supabase Session Pooler URL)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for server-side operations)
- `ADMIN_SIGNUP_CODE`: Secret code for creating admin accounts (minimum 6 characters, required for admin registration)

### AI Services
- `OPENAI_API_KEY`: OpenAI API key (for GPT-4o mini prompt generation and GPT-4o image analysis)
- `GEMINI_API_KEY`: Google Gemini API key (for image generation - Nano Banana / Gemini 3 Pro Image Preview)
- `GEMINI_IMAGE_MODEL`: (Optional) Default: `gemini-3-pro-image-preview`. Options:
  - `gemini-2.5-flash-image` - Fast, 1024px, up to 3 images
  - `gemini-3-pro-image-preview` - Professional, up to 4K, up to 14 images

### AI Model Configuration
The try-on system uses:
- **GPT-4o mini**: Intelligent prompt generation that analyzes images and creates optimized prompts
- **Gemini 3 Pro Image Preview (Nano Banana Pro)**: High-quality image generation with up to 4K resolution
- **Reference Prompts**: Stored in `src/lib/prompts/reference-prompts.ts` for training the prompt generator

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:

- `User` - User accounts
- `InfluencerProfile` - Influencer profiles
- `BrandProfile` - Brand profiles
- `Product` - Products
- `GenerationJob` - Try-on generation jobs
- `Campaign` - Marketing campaigns
- `AdCreative` - Generated ad creatives
- `CollaborationRequest` - Collaboration requests
- `Portfolio` - Portfolio items
- `Notification` - User notifications

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- etc.

## License

MIT
