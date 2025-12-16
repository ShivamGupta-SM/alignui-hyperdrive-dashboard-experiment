/**
 * Enrollments Query Keys Factory
 */

export const enrollmentsQueryKeys = {
	all: ['enrollments'] as const,
	lists: () => [...enrollmentsQueryKeys.all, 'list'] as const,
	list: (filters?: unknown) => [...enrollmentsQueryKeys.lists(), filters] as const,
	details: () => [...enrollmentsQueryKeys.all, 'detail'] as const,
	detail: (id: string) => [...enrollmentsQueryKeys.details(), id] as const,
} as const

