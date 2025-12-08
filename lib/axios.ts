import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { toast } from "sonner"

// Create axios instance with defaults
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
})

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add auth token if available (for external APIs)
        // For Next.js API routes, cookies are sent automatically
        const token = typeof window !== "undefined" ? localStorage.getItem("api_token") : null
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error: AxiosError<{ message?: string; error?: string }>) => {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "An unexpected error occurred"

        // Handle specific status codes
        switch (error.response?.status) {
            case 401:
                // Unauthorized - redirect to login
                if (typeof window !== "undefined") {
                    window.location.href = "/auth/sign-in"
                }
                break
            case 403:
                toast.error("You don't have permission to perform this action")
                break
            case 404:
                toast.error("Resource not found")
                break
            case 422:
                // Validation error - let the caller handle it
                break
            case 429:
                toast.error("Too many requests. Please try again later.")
                break
            case 500:
            case 502:
            case 503:
                toast.error("Server error. Please try again later.")
                break
            default:
                if (!error.response) {
                    toast.error("Network error. Please check your connection.")
                }
        }

        return Promise.reject(error)
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
