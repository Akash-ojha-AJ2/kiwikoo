/**
 * Standardized API error codes for user-friendly error handling
 */
export const API_ERROR_CODES = {
    PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
    NOT_APPROVED: 'NOT_APPROVED',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    GENERATION_FAILED: 'GENERATION_FAILED',
} as const

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]

export interface StructuredApiError {
    code: ApiErrorCode
    message: string
    details?: Record<string, unknown>
}

/**
 * Create a structured error response
 */
export function createApiError(
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>
): StructuredApiError {
    return { code, message, details }
}

/**
 * Error messages for each code
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
    PROFILE_INCOMPLETE: 'Please complete your influencer profile setup first.',
    NOT_APPROVED: 'Your account is pending approval. Please wait for admin review.',
    USER_NOT_FOUND: 'User account not found. Please log out and register again.',
    GENERATION_FAILED: 'Image generation failed. Please try again.',
}
