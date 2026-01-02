/**
 * Storage React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, DEFAULT_RETRY_CONFIG, createMutationErrorHandler } from "@/lib/utils/query-config"
import { TIMEOUTS } from "@/lib/constants"
import type { storage } from "@/brand-client"

// ============================================
// Query Keys
// ============================================
export const storageKeys = {
	all: ["storage"] as const,
	// ✅ FIX Bug 26: Org-scoped query keys to prevent data leaks between orgs
	files: (orgId: string) => [...storageKeys.all, "files", orgId] as const,
	logoPreview: (domain: string) => [...storageKeys.all, "logo-preview", domain] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * List files for a specific organization
 * ✅ FIX Bug 26: Now requires orgId for cache isolation
 */
export function useFiles(orgId: string) {
	return useQuery({
		queryKey: storageKeys.files(orgId),
		queryFn: () => client.storage.listFiles(),
		enabled: !!orgId,
		staleTime: STALE_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Preview logo by domain
 * Used in org creation to show logo preview from CompanyEnrich
 * SSOT: Uses STALE_TIME.LONG for rarely changing logo data
 */
export function useLogoPreview(domain: string) {
	return useQuery({
		queryKey: storageKeys.logoPreview(domain),
		queryFn: () => client.storage.previewLogoByDomain({ domain }),
		enabled: !!domain && domain.length > 3, // Only fetch if domain is valid
		staleTime: STALE_TIME.LONG, // 10 minutes - centralized constant
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// MUTATIONS - Direct Client Usage
// ============================================

/**
 * Request upload URL
 */
export function useRequestUploadUrl() {
	return useMutation({
		mutationFn: (data: storage.UploadUrlRequest) => client.storage.requestUploadUrl(data),
		onError: createMutationErrorHandler("request upload URL"),
	})
}

/**
 * Request download URL
 */
export function useRequestDownloadUrl() {
	return useMutation({
		mutationFn: (data: storage.DownloadUrlRequest) => client.storage.requestDownloadUrl(data),
		onError: createMutationErrorHandler("request download URL"),
	})
}

/**
 * Request profile picture upload URL
 */
export function useRequestProfilePictureUploadUrl() {
	return useMutation({
		mutationFn: (filename: string) => client.storage.requestProfilePictureUploadUrl({ filename }),
		onError: createMutationErrorHandler("request profile picture upload URL"),
	})
}

/**
 * Request KYC document upload URL
 */
export function useRequestKycDocumentUploadUrl() {
	return useMutation({
		mutationFn: (filename: string) => client.storage.requestKycDocumentUploadUrl({ filename }),
		onError: createMutationErrorHandler("request KYC document upload URL"),
	})
}

/**
 * Request KYC document download URL
 */
export function useRequestKycDocumentDownloadUrl() {
	return useMutation({
		mutationFn: (key: string) => client.storage.requestKycDocumentDownloadUrl({ key }),
		onError: createMutationErrorHandler("request KYC document download URL"),
	})
}

/**
 * Request organization logo upload URL
 * Used for manually uploading org logo instead of auto-fetch from CompanyEnrich
 */
export function useRequestOrgLogoUploadUrl() {
	return useMutation({
		mutationFn: (data: { filename: string; orgId: string }) =>
			client.storage.requestOrgLogoUploadUrl(data),
		onError: createMutationErrorHandler("request org logo upload URL"),
	})
}

/**
 * Delete file
 * ✅ FIX Bug 26: Now requires orgId for proper cache invalidation
 */
export function useDeleteFile(orgId: string) {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (key: string) => client.storage.deleteFile(key),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: storageKeys.files(orgId) })
		},
		onError: createMutationErrorHandler("delete file"),
	})
}

/**
 * Upload profile picture (composite hook)
 * Handles the full flow: get presigned URL -> upload file -> return final URL
 * FIX: Improved error handling with detailed error messages
 */
export function useUploadProfilePicture() {
	return useMutation({
		mutationFn: async (file: File) => {
			// Step 1: Get presigned upload URL
			const { uploadUrl, fileUrl } = await client.storage.requestProfilePictureUploadUrl({
				filename: file.name,
			})

			// Step 2: Upload file to presigned URL with timeout
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.FILE_UPLOAD_TIMEOUT)

			try {
				const uploadResponse = await fetch(uploadUrl, {
					method: "PUT",
					body: file,
					headers: {
						"Content-Type": file.type,
					},
					signal: controller.signal,
				})

				clearTimeout(timeoutId)

				if (!uploadResponse.ok) {
					// FIX: Include HTTP status and more context in error message
					const errorText = await uploadResponse.text().catch(() => "")
					throw new Error(
						`Upload failed (HTTP ${uploadResponse.status}): ${errorText || uploadResponse.statusText}`
					)
				}

				// Step 3: Return the final file URL
				return { fileUrl }
			} catch (error) {
				clearTimeout(timeoutId)
				if (error instanceof Error && error.name === "AbortError") {
					throw new Error("Upload timed out after 30 seconds. Please try again.")
				}
				throw error
			}
		},
		...DEFAULT_RETRY_CONFIG,
		onError: createMutationErrorHandler("upload profile picture"),
	})
}
