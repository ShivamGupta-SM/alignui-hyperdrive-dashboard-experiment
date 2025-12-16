"use client"

import { useQuery } from "@tanstack/react-query"
import { listEnrollments, getEnrollment } from "../lib/api"
import { enrollmentsQueryKeys } from "../lib/query-keys"
import type { EnrollmentFilters, EnrollmentStatus } from "../types"

/**
 * Hook: Fetch enrollments with filters
 */
export function useEnrollments(filters: EnrollmentFilters = {}) {
	return useQuery({
		queryKey: enrollmentsQueryKeys.list(filters),
		queryFn: () => listEnrollments({
			status: filters.status as EnrollmentStatus | undefined,
			campaignId: filters.campaignId,
			skip: ((filters.page || 1) - 1) * (filters.limit || 10),
			take: filters.limit || 10,
		}),
		staleTime: 60 * 1000,
	})
}

/**
 * Hook: Fetch single enrollment
 */
export function useEnrollment(id: string) {
	return useQuery({
		queryKey: enrollmentsQueryKeys.detail(id),
		queryFn: () => getEnrollment(id),
		enabled: !!id,
	})
}

// Re-export types for convenience
export type * from '../types'
