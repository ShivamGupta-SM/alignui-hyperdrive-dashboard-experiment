import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

// Custom error class with additional context for callers to handle
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
        public isNetworkError = false,
        public isAuthError = false
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

// Create axios instance with defaults
// Note: baseURL is empty because hooks already use full paths like '/api/...'
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
})

// Request interceptor - only for external API auth
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Only add auth token for external APIs (not /api routes - those use cookies)
        const isInternalApi = config.url?.startsWith('/api')
        if (!isInternalApi) {
            const token = typeof window !== "undefined" ? localStorage.getItem("api_token") : null
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - transforms errors without side effects
// Callers are responsible for handling redirects, toasts, and UI feedback
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; error?: string }>) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "An unexpected error occurred"

        const status = error.response?.status
        const isNetworkError = !error.response
        const isAuthError = status === 401 || status === 403

        // Create enhanced error for callers to handle appropriately
        const apiError = new ApiError(
            message,
            status,
            error.code,
            isNetworkError,
            isAuthError
        )

        // Attach original response data for validation errors etc.
        Object.assign(apiError, {
            response: error.response,
            originalError: error
        })

        return Promise.reject(apiError)
    }
)

// Typed request helpers
export async function get<T>(url: string, config?: Parameters<typeof api.get>[1]) {
    const response = await api.get<T>(url, config)
    return response.data
}

export async function post<T>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]) {
    const response = await api.post<T>(url, data, config)
    return response.data
}

export async function put<T>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]) {
    const response = await api.put<T>(url, data, config)
    return response.data
}

export async function patch<T>(url: string, data?: unknown, config?: Parameters<typeof api.patch>[2]) {
    const response = await api.patch<T>(url, data, config)
    return response.data
}

export async function del<T>(url: string, config?: Parameters<typeof api.delete>[1]) {
    const response = await api.delete<T>(url, config)
    return response.data
}

export default api
