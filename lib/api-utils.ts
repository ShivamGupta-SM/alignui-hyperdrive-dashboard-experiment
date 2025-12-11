import { NextResponse } from 'next/server'
import type { z } from 'zod'

/**
 * API Utilities
 * Shared helpers for API route handlers
 */

// ============================================
// Response Helpers
// ============================================

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Create a paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  meta: { total: number; page: number; pageSize: number; totalPages: number },
  status = 200
) {
  return NextResponse.json({ success: true, data, meta }, { status })
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status = 400,
  details?: Record<string, string[]>
) {
  return NextResponse.json(
    { success: false, error, ...(details && { details }) },
    { status }
  )
}

/**
 * Create a not found response
 */
export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404)
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500)
}

/**
 * Create a forbidden response (403)
 */
export function forbiddenResponse(message = 'Access forbidden') {
  return errorResponse(message, 403)
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Parse and validate request body with Zod schema
 * Returns parsed data or throws validation error response
 */
export async function parseBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten()
      const firstError = result.error.issues[0]?.message || 'Invalid request body'

      return {
        error: NextResponse.json(
          {
            success: false,
            error: firstError,
            details: errors.fieldErrors,
          },
          { status: 400 }
        ),
      }
    }

    return { data: result.data }
  } catch {
    return {
      error: NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Parse and validate query parameters with Zod schema
 */
export function parseQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { data: z.infer<T> } | { error: NextResponse } {
  const params = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(params)

  if (!result.success) {
    const errors = result.error.flatten()
    const firstError = result.error.issues[0]?.message || 'Invalid query parameters'

    return {
      error: NextResponse.json(
        {
          success: false,
          error: firstError,
          details: errors.fieldErrors,
        },
        { status: 400 }
      ),
    }
  }

  return { data: result.data }
}

// ============================================
// Pagination Helpers
// ============================================

/**
 * Calculate pagination metadata
 */
export function calculatePagination(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Paginate an array
 */
export function paginateArray<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize
  return items.slice(startIndex, startIndex + pageSize)
}

// ============================================
// Error Handling
// ============================================

/**
 * Wrap an API handler with error handling
 */
export function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch((error) => {
    console.error('API Error:', error)
    return serverErrorResponse(
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Internal server error'
    )
  })
}
