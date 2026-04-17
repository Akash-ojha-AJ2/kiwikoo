/**
 * API Utilities - Safe Response Parsing
 * 
 * Fixes "Unexpected token 'R'" and similar JSON parse errors by
 * checking Content-Type before parsing and handling non-JSON responses gracefully.
 */

/**
 * Safely parse an API response, handling non-JSON responses gracefully.
 * 
 * @param res - Fetch Response object
 * @param context - Optional context string for better error messages (e.g. "tryon generation")
 * @returns Parsed JSON data
 * @throws Error with descriptive message for non-OK or non-JSON responses
 */
export async function safeParseResponse<T = any>(res: Response, context?: string): Promise<T> {
    const contentType = res.headers.get("content-type") || ""
    const prefix = context ? `[${context}] ` : ""

    // Handle non-OK responses
    if (!res.ok) {
        let errorBody = ""
        const retryAfterHeader = res.headers.get('Retry-After')
        const retryAfterFromHeader = Number(retryAfterHeader ?? 0) || undefined
        try {
            errorBody = await res.text()
            // Log first 200 chars of error response (avoid logging huge HTML pages)
            const snippet = `${errorBody.slice(0, 200)}${errorBody.length > 200 ? '...' : ''}`
            if (res.status === 429 || (res.status >= 400 && res.status < 500)) {
                // 4xx is usually user/actionable state, not an app crash.
                console.warn(`${prefix}API ${res.status}: ${snippet}`)
            } else {
                console.error(`${prefix}API Error ${res.status}: ${snippet}`)
            }
        } catch {
            errorBody = "Unable to read error response"
        }

        // Provide user-friendly error messages for common status codes
        const friendlyMessages: Record<number, string> = {
            400: "Invalid request. Please check your input.",
            401: "Authentication required. Please log in again.",
            403: "Access denied. You don't have permission for this action.",
            404: "Resource not found.",
            413: "Request too large. Please use a smaller image or reduce data size.",
            429: "Too many requests. Please wait a moment and try again.",
            500: "Server error. Please try again later.",
            502: "Server temporarily unavailable. Please try again.",
            503: "Service unavailable. Please try again later.",
            504: "Request timed out. This often happens when the service is busy or you've hit the limit. Please wait a minute and try again.",
        }

        const friendlyMessage = friendlyMessages[res.status] || `Server error (${res.status})`
        // For 504 (gateway timeout), suggest retry after 60s so client can show wait UI
        const defaultRetryFor504 = res.status === 504 ? 60 : undefined

        // Try to extract error message from JSON response if available
        if (contentType.includes("application/json")) {
            try {
                const errorJson = JSON.parse(errorBody)
                const serverMessage = errorJson.error || errorJson.message || errorJson.details
                const retryAfterSeconds =
                    Number(errorJson.retryAfterSeconds ?? retryAfterHeader ?? 0) ||
                    (res.status === 504 ? 60 : undefined)

                const message = serverMessage || friendlyMessage
                const err = new Error(`${prefix}${message}`) as Error & {
                    status?: number
                    retryAfterSeconds?: number
                    code?: string
                }
                err.status = res.status
                err.retryAfterSeconds = retryAfterSeconds
                err.code = errorJson.code
                throw err
            } catch (parseError) {
                // Re-throw structured errors we created above.
                if (parseError instanceof Error && `${parseError.message}`.startsWith(prefix)) {
                    throw parseError
                }
                // JSON parse failed, use friendly message below.
            }
        }

        const fallbackErr = new Error(`${prefix}${friendlyMessage}`) as Error & { status?: number; retryAfterSeconds?: number }
        fallbackErr.status = res.status
        fallbackErr.retryAfterSeconds = retryAfterFromHeader ?? defaultRetryFor504
        throw fallbackErr
    }

    // Handle successful responses
    if (contentType.includes("application/json")) {
        try {
            return await res.json()
        } catch (parseError) {
            console.error(`${prefix}JSON Parse Error:`, parseError)
            throw new Error(`${prefix}Invalid response format from server.`)
        }
    }

    // Non-JSON successful response (unexpected)
    const text = await res.text()
    console.warn(`${prefix}Non-JSON Response (${contentType}): ${text.slice(0, 200)}${text.length > 200 ? '...' : ''}`)

    // If it's empty, might be a 204 No Content equivalent
    if (!text.trim()) {
        return {} as T
    }

    throw new Error(`${prefix}Unexpected response format from server.`)
}

/**
 * Helper to wrap fetch with safe parsing
 */
export async function safeFetch<T = any>(url: string, options?: RequestInit, context?: string): Promise<T> {
    try {
        const res = await fetch(url, options)
        return await safeParseResponse<T>(res, context)
    } catch (error) {
        // Re-throw with context if not already added
        if (error instanceof Error && context && !error.message.startsWith(`[${context}]`)) {
            throw new Error(`[${context}] ${error.message}`)
        }
        throw error
    }
}

