/**
 * Organizations Query Keys Factory
 */

export const organizationsQueryKeys = {
	all: ['organizations'] as const,
	lists: () => [...organizationsQueryKeys.all, 'list'] as const,
	list: () => [...organizationsQueryKeys.lists()] as const,
	details: () => [...organizationsQueryKeys.all, 'detail'] as const,
	detail: (id: string) => [...organizationsQueryKeys.details(), id] as const,
} as const

