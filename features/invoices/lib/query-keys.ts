/**
 * Invoices Query Keys Factory
 */

export const invoiceQueryKeys = {
	all: ['invoices'] as const,
	lists: () => [...invoiceQueryKeys.all, 'list'] as const,
	list: (filters?: unknown) => [...invoiceQueryKeys.lists(), filters] as const,
	details: () => [...invoiceQueryKeys.all, 'detail'] as const,
	detail: (id: string) => [...invoiceQueryKeys.details(), id] as const,
} as const

