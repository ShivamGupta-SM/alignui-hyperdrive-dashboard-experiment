import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query"
import { get, post, put, patch, del } from "@/lib/axios"
import type { AxiosError } from "axios"

// Generic API error type
interface ApiError {
    message: string
    errors?: Record<string, string[]>
}

// ============================================
// Generic CRUD Hooks
// ============================================

/**
 * Hook for fetching a single resource
 */
export function useFetch<T>(
    key: string | string[],
    url: string,
    options?: Omit<UseQueryOptions<T, AxiosError<ApiError>>, "queryKey" | "queryFn">
) {
    return useQuery<T, AxiosError<ApiError>>({
        queryKey: Array.isArray(key) ? key : [key],
        queryFn: () => get<T>(url),
        ...options,
    })
}

/**
 * Hook for fetching a list of resources with pagination
 */
export function useFetchList<T>(
    key: string | string[],
    url: string,
    params?: Record<string, unknown>,
    options?: Omit<UseQueryOptions<T[], AxiosError<ApiError>>, "queryKey" | "queryFn">
) {
    const queryKey = Array.isArray(key) ? [...key, params] : [key, params]

    return useQuery<T[], AxiosError<ApiError>>({
        queryKey,
        queryFn: () => get<T[]>(url, { params }),
        ...options,
    })
}

/**
 * Hook for creating a resource
 */
export function useCreate<TData, TVariables>(
    url: string,
    options?: Omit<UseMutationOptions<TData, AxiosError<ApiError>, TVariables>, "mutationFn">
) {
    const queryClient = useQueryClient()

    return useMutation<TData, AxiosError<ApiError>, TVariables>({
        mutationFn: (data) => post<TData>(url, data),
        onSuccess: () => {
            // Invalidate related queries after creation
            queryClient.invalidateQueries()
        },
        ...options,
    })
}

/**
 * Hook for updating a resource
 */
export function useUpdate<TData, TVariables>(
    url: string,
    options?: Omit<UseMutationOptions<TData, AxiosError<ApiError>, TVariables>, "mutationFn">
) {
    const queryClient = useQueryClient()

    return useMutation<TData, AxiosError<ApiError>, TVariables>({
        mutationFn: (data) => put<TData>(url, data),
        onSuccess: () => {
            queryClient.invalidateQueries()
        },
        ...options,
    })
}

/**
 * Hook for partial updates
 */
export function usePatch<TData, TVariables>(
    url: string,
    options?: Omit<UseMutationOptions<TData, AxiosError<ApiError>, TVariables>, "mutationFn">
) {
    const queryClient = useQueryClient()

    return useMutation<TData, AxiosError<ApiError>, TVariables>({
        mutationFn: (data) => patch<TData>(url, data),
        onSuccess: () => {
            queryClient.invalidateQueries()
        },
        ...options,
    })
}

/**
 * Hook for deleting a resource
 */
export function useDelete<TData = void>(
    url: string,
    options?: Omit<UseMutationOptions<TData, AxiosError<ApiError>, void>, "mutationFn">
) {
    const queryClient = useQueryClient()

    return useMutation<TData, AxiosError<ApiError>, void>({
        mutationFn: () => del<TData>(url),
        onSuccess: () => {
            queryClient.invalidateQueries()
        },
        ...options,
    })
}

// ============================================
// Specialized Hooks Examples
// ============================================

// Example: Users API
interface User {
    id: string
    name: string
    email: string
    avatar?: string
    createdAt: string
}

export function useUsers(params?: { page?: number; limit?: number; search?: string }) {
    return useFetchList<User>("users", "/users", params)
}

export function useUser(id: string) {
    return useFetch<User>(["users", id], `/users/${id}`, {
        enabled: !!id,
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useCreate<User, Omit<User, "id" | "createdAt">>("/users", {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}

export function useUpdateUser(id: string) {
    const queryClient = useQueryClient()

    return useUpdate<User, Partial<User>>(`/users/${id}`, {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            queryClient.invalidateQueries({ queryKey: ["users", id] })
        },
    })
}

export function useDeleteUser(id: string) {
    const queryClient = useQueryClient()

    return useDelete(`/users/${id}`, {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
        },
    })
}

// ============================================
// Optimistic Update Example
// ============================================

interface Todo {
    id: string
    title: string
    completed: boolean
}

export function useToggleTodo() {
    const queryClient = useQueryClient()

    return useMutation<Todo, AxiosError<ApiError>, { id: string; completed: boolean }, { previousTodos?: Todo[] }>({
        mutationFn: ({ id, completed }) => patch<Todo>(`/todos/${id}`, { completed }),

        // Optimistic update
        onMutate: async ({ id, completed }) => {
            await queryClient.cancelQueries({ queryKey: ["todos"] })

            const previousTodos = queryClient.getQueryData<Todo[]>(["todos"])

            queryClient.setQueryData<Todo[]>(["todos"], (old) =>
                old?.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
            )

            return { previousTodos }
        },

        onError: (_err, _variables, context) => {
            if (context?.previousTodos) {
                queryClient.setQueryData(["todos"], context.previousTodos)
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
        },
    })
}

// ============================================
// Infinite Query Example
// ============================================

interface PaginatedResponse<T> {
    data: T[]
    nextCursor?: string
    hasMore: boolean
}

export function useInfiniteList<T>(key: string, url: string) {
    return useQuery<PaginatedResponse<T>, AxiosError<ApiError>>({
        queryKey: [key, "infinite"],
        queryFn: () => get<PaginatedResponse<T>>(url),
    })
}
