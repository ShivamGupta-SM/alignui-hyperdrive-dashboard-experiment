"use client"

import { useQuery } from "@tanstack/react-query"
import { getWallet } from "../lib/api"
import { walletQueryKeys } from "../lib/query-keys"
import { useOrganizationId } from "@/contexts/organization-context"

/**
 * Hook: Fetch wallet data
 */
export function useWallet() {
	const organizationId = useOrganizationId()
	
	return useQuery({
		queryKey: walletQueryKeys.balance(),
		queryFn: () => {
			if (!organizationId) throw new Error('Organization ID required')
			return getWallet()
		},
		enabled: !!organizationId,
		staleTime: 30 * 1000,
	})
}

// Re-export types for convenience
export type * from '../types'
