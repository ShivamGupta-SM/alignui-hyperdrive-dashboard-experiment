/**
 * Settings Mutation Hooks
 * 
 * @description
 * React Query mutation hooks for settings operations.
 * Uses centralized server actions with Result pattern.
 */

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsQueryKeys } from '../lib/query-keys'
import {
	updateOrganization,
	addBankAccount,
	removeBankAccount,
	setDefaultBankAccount,
	verifyBankAccount,
} from '../actions/settings'
import { verifyGST } from '../lib/api'
import type {
	OrganizationSettings,
	AddBankAccountInput,
	VerifyGstInput,
} from '../types'

/**
 * Hook: Update organization settings mutation
 * 
 * @description
 * Updates organization settings and invalidates related queries.
 * 
 * @param organizationId - Organization ID
 * @returns Mutation object with mutate function
 */
export function useUpdateOrganizationSettings(organizationId: string) {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: (data: Partial<OrganizationSettings>) =>
			updateOrganization(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: settingsQueryKeys.organization(organizationId) })
		},
	})
}

/**
 * Hook: Add bank account mutation
 * 
 * @description
 * Adds a new bank account and invalidates related queries.
 * 
 * @param organizationId - Organization ID
 * @returns Mutation object with mutate function
 */
export function useAddBankAccount(organizationId: string) {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: (data: AddBankAccountInput) =>
			addBankAccount(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: settingsQueryKeys.bankAccounts() })
		},
	})
}

/**
 * Hook: Delete bank account mutation
 * 
 * @description
 * Deletes a bank account and invalidates related queries.
 * 
 * @param organizationId - Organization ID
 * @returns Mutation object with mutate function
 */
export function useDeleteBankAccount(organizationId: string) {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: (id: string) => removeBankAccount(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: settingsQueryKeys.bankAccounts() })
		},
	})
}

/**
 * Hook: Set default bank account mutation
 * 
 * @description
 * Sets a bank account as default and invalidates related queries.
 * 
 * @param organizationId - Organization ID
 * @returns Mutation object with mutate function
 */
export function useSetDefaultBankAccount(organizationId: string) {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: (id: string) => setDefaultBankAccount(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: settingsQueryKeys.bankAccounts() })
		},
	})
}

/**
 * Hook: Verify GST mutation
 * 
 * @description
 * Verifies GST number and invalidates related queries.
 * 
 * @param organizationId - Organization ID
 * @returns Mutation object with mutate function
 */
export function useVerifyGst(organizationId: string) {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: (data: VerifyGstInput) => verifyGST(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: settingsQueryKeys.gst() })
			queryClient.invalidateQueries({ queryKey: settingsQueryKeys.organization(organizationId) })
		},
	})
}

/**
 * Hook: Verify bank account mutation
 * 
 * @description
 * Verifies bank account and invalidates related queries.
 * 
 * @param organizationId - Organization ID
 * @returns Mutation object with mutate function
 */
export function useVerifyBankAccount(organizationId: string) {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: (bankAccountId: string) =>
			verifyBankAccount(bankAccountId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: settingsQueryKeys.bankAccounts() })
		},
	})
}

