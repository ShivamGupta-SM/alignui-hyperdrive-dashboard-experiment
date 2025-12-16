"use client"

import { useQuery } from "@tanstack/react-query"
import { listMembers } from "../lib/api"
import { teamQueryKeys } from "../lib/query-keys"
import { useOrganizationId } from "@/contexts/organization-context"

/**
 * Hook: Fetch team members
 * Uses active organization from session (listMembersAuth)
 */
export function useTeam() {
	const organizationId = useOrganizationId()
	
	return useQuery({
		queryKey: teamQueryKeys.members(),
		queryFn: () => listMembers(),
		enabled: !!organizationId, // Still check for organizationId to ensure we have an active org
		staleTime: 60 * 1000,
	})
}

// Re-export types for convenience
export type * from '../types'
