/**
 * Identity Image Types for AI Try-On
 * 
 * These reference images are collected during onboarding and used
 * to improve face consistency in AI-generated try-on images.
 */

export type IdentityImageType = 
  | 'face_front'    // Front-facing portrait, neutral expression
  | 'face_left'     // Left side of face (3/4 angle)
  | 'face_right'    // Right side of face (3/4 angle)
  | 'face_smile'    // Smiling expression
  | 'body_front'    // Full body, front view
  | 'body_left'     // Full body, left side
  | 'body_right'    // Full body, right side

export interface IdentityImageRequirement {
  type: IdentityImageType
  label: string
  description: string
  tips: string[]
  required: boolean
  order: number
  icon: string // Emoji or icon name
}

/**
 * All required identity images for optimal AI try-on
 * These are displayed in the onboarding flow
 */
export const IDENTITY_IMAGE_REQUIREMENTS: IdentityImageRequirement[] = [
  {
    type: 'face_front',
    label: 'Front Portrait',
    description: 'Clear front-facing photo of your face',
    tips: [
      'Look directly at the camera',
      'Neutral expression',
      'Good lighting on your face',
      'No sunglasses or heavy filters',
    ],
    required: true,
    order: 1,
    icon: '👤',
  },
  {
    type: 'face_smile',
    label: 'Smiling',
    description: 'Natural smile showing your expression range',
    tips: [
      'Natural, genuine smile',
      'Eyes should be visible',
      'Face clearly lit',
    ],
    required: true,
    order: 2,
    icon: '😊',
  },
  {
    type: 'face_left',
    label: 'Left Side',
    description: 'Your face from the left angle (3/4 view)',
    tips: [
      'Turn head slightly left',
      'Both eyes should still be visible',
      'Show your jawline and cheekbone',
    ],
    required: true,
    order: 3,
    icon: '👈',
  },
  {
    type: 'face_right',
    label: 'Right Side',
    description: 'Your face from the right angle (3/4 view)',
    tips: [
      'Turn head slightly right',
      'Both eyes should still be visible',
      'Show your jawline and cheekbone',
    ],
    required: true,
    order: 4,
    icon: '👉',
  },
  {
    type: 'body_front',
    label: 'Full Body Front',
    description: 'Full body photo from the front',
    tips: [
      'Stand naturally',
      'Show your full body from head to toe',
      'Wear fitted clothing for accurate body shape',
    ],
    required: true,
    order: 5,
    icon: '🧍',
  },
  {
    type: 'body_left',
    label: 'Full Body Left',
    description: 'Full body from your left side',
    tips: [
      'Turn your body to show left side',
      'Arms relaxed at sides',
      'Full body visible',
    ],
    required: true,
    order: 6,
    icon: '🧍‍♂️',
  },
  {
    type: 'body_right',
    label: 'Full Body Right',
    description: 'Full body from your right side',
    tips: [
      'Turn your body to show right side',
      'Arms relaxed at sides',
      'Full body visible',
    ],
    required: true,
    order: 7,
    icon: '🧍‍♀️',
  },
]

/**
 * Get all required image types
 */
export function getRequiredImageTypes(): IdentityImageType[] {
  return IDENTITY_IMAGE_REQUIREMENTS
    .filter(req => req.required)
    .map(req => req.type)
}

/**
 * Get requirement by type
 */
export function getImageRequirement(type: IdentityImageType): IdentityImageRequirement | undefined {
  return IDENTITY_IMAGE_REQUIREMENTS.find(req => req.type === type)
}

/**
 * Check if all required images are uploaded
 */
export function isIdentitySetupComplete(uploadedTypes: IdentityImageType[]): boolean {
  const requiredTypes = getRequiredImageTypes()
  return requiredTypes.every(type => uploadedTypes.includes(type))
}

/**
 * Get missing required images
 */
export function getMissingImages(uploadedTypes: IdentityImageType[]): IdentityImageRequirement[] {
  return IDENTITY_IMAGE_REQUIREMENTS.filter(
    req => req.required && !uploadedTypes.includes(req.type)
  )
}

/**
 * Get upload progress percentage
 */
export function getUploadProgress(uploadedTypes: IdentityImageType[]): number {
  const requiredTypes = getRequiredImageTypes()
  const uploaded = requiredTypes.filter(type => uploadedTypes.includes(type)).length
  return Math.round((uploaded / requiredTypes.length) * 100)
}

