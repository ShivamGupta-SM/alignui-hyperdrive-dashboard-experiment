// API Response Types

// Standard API response wrapper for single items (discriminated union)
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: Record<string, string[]> }

// Standard API response for paginated lists
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// Standard API error response
export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

// Generic API error type (for axios/react-query)
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, string[]>
}
