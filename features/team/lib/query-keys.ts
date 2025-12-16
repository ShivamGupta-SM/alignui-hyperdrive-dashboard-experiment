/**
 * Team Query Keys Factory
 */

export const teamQueryKeys = {
	all: ['team'] as const,
	members: () => [...teamQueryKeys.all, 'members'] as const,
	invitations: () => [...teamQueryKeys.all, 'invitations'] as const,
} as const

