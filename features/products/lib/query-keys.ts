/**
 * Products Query Keys Factory
 */

export const productsQueryKeys = {
	all: ['products'] as const,
	lists: () => [...productsQueryKeys.all, 'list'] as const,
	list: (filters?: unknown) => [...productsQueryKeys.lists(), filters] as const,
	details: () => [...productsQueryKeys.all, 'detail'] as const,
	detail: (id: string) => [...productsQueryKeys.details(), id] as const,
} as const

