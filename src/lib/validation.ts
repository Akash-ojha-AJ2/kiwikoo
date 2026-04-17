import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(320)

const passwordSchema = z.string().min(8).max(128)

const nameSchema = z.string().trim().min(1).max(120)

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9._-]+$/)

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(['INFLUENCER', 'BRAND']),
    name: nameSchema.optional(),
  })
  .strict()


export const loginSchema = z
  .object({
    identifier: z.string().trim().min(1).max(320),
    // Allow short passwords so Supabase can return a consistent auth error, but cap length.
    password: z.string().min(1).max(128),
    rememberMe: z.boolean().optional(),
    portalRole: z.enum(['influencer', 'brand']).optional(),
  })
  .strict()

const base64ImageSchema = z.string().min(1).max(15_000_000)

export const tryOnSchema = z
  .object({
  // Base64 images can be large; cap to avoid abuse while remaining functional.
  personImage: base64ImageSchema,
  personImages: z.array(base64ImageSchema).max(5).optional(),
  editType: z
    .enum(['clothing_change', 'background_change', 'lighting_change', 'pose_change', 'camera_change'])
    .optional()
    .default('clothing_change'),
  clothingImage: base64ImageSchema.optional(),
  backgroundImage: base64ImageSchema.optional(),
  // NEW: Accessory support for edit mode
  accessoryImages: z.array(base64ImageSchema).max(10).optional(), // Array of base64 accessory images
  accessoryTypes: z
    .array(z.enum(['purse', 'shoes', 'hat', 'jewelry', 'bag', 'watch', 'sunglasses', 'scarf', 'other']))
    .max(10)
    .optional(),
  model: z.enum(['flash', 'production']).optional().default('production'),
  stylePreset: z.string().trim().max(80).optional(),
  userRequest: z.string().trim().max(2000).optional(),
  background: z.string().trim().max(200).optional(),
  pose: z.string().trim().max(200).optional(),
  expression: z.string().trim().max(200).optional(),
  camera: z.string().trim().max(200).optional(),
  lighting: z.string().trim().max(200).optional(),
  addOns: z.array(z.string().trim().max(80)).max(20).optional(),
  // New fields for user-configurable quality
  aspectRatio: z.enum(['1:1', '4:5', '3:4', '9:16']).optional().default('4:5'),
  resolution: z.enum(['1K', '2K']).optional().default('2K'),
})
  .strict()

export const presetlessTryOnSchema = z
  .object({
    productId: z.string().trim().min(1).max(100).optional(),
    clothingImage: base64ImageSchema.optional(),
    garmentImageUrl: z.string().trim().min(1).max(4096).optional(),
    selectedReferenceImageIds: z
      .array(z.string().trim().min(1).max(120))
      .length(3)
      .refine((ids) => new Set(ids).size === ids.length, 'Select 3 different reference photos.')
      .optional(),
    autoSelect: z.boolean().optional().default(false),
    polishNotes: z.string().trim().max(240).optional(),
    aspectRatio: z.enum(['1:1', '4:5', '3:4', '9:16']).optional().default('4:5'),
    resolution: z.enum(['1K', '2K']).optional().default('2K'),
    model: z.enum(['flash', 'production']).optional().default('production'),
  })
  .refine((value) => Boolean(value.productId || value.clothingImage || value.garmentImageUrl), {
    message: 'Either productId or clothingImage is required.',
    path: ['productId'],
  })

export const adGenerationSchema = z
  .object({
    productImage: z.string().min(1).max(15_000_000).optional(),
    influencerImage: z.string().min(1).max(15_000_000).optional(),
    stylePreferences: z.string().trim().max(2000).optional(),
    campaignGoals: z.array(z.string().trim().max(80)).max(20).optional(),
  })
  .strict()

export const campaignSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    goals: z.array(z.string().trim().max(80)).max(20).optional(),
    targetAudience: z.string().trim().max(200).optional(),
    budget: z.number().nonnegative().max(1_000_000_000).optional(),
    timeline: z.string().trim().max(200).optional(),
  })
  .strict()

export const collaborationSchema = z
  .object({
    influencerId: z.string().min(1).max(100),
    budget: z.number().nonnegative().max(1_000_000_000).optional(),
    timeline: z.string().trim().max(200).optional(),
    goals: z.array(z.string().trim().max(80)).max(20).optional(),
    notes: z.string().trim().max(4000).optional(),
  })
  .strict()

export const productSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(5000).optional(),
    category: z.string().trim().max(80).optional(),
    price: z.number().nonnegative().max(1_000_000_000).optional(),
    link: z.string().url().max(2048).optional(),
    imagePath: z.string().trim().max(1024).optional(),
    tags: z.string().trim().max(200).optional(),
    audience: z.string().trim().max(40).optional(),
    images: z
      .array(
        z
          .object({
            imagePath: z.string().trim().min(1).max(1024),
            order: z.number().int().min(0).max(1000),
            isTryOnReference: z.boolean(),
            isCoverImage: z.boolean(),
          })
          .strict()
      )
      .max(20)
      .optional(),
  })
  .strict()

export const createLinkSchema = z
  .object({
    productId: z.string().min(1).max(100),
  })
  .strict()

export const linkAnalyticsQuerySchema = z
  .object({
    productId: z.string().max(100).optional(),
    startDate: z.string().max(40).optional(),
    endDate: z.string().max(40).optional(),
  })
  .strict()
