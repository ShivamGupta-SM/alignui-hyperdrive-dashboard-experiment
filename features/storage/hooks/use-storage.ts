/**
 * Storage React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { storage } from "@/lib/api/encore-client"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const storageKeys = {
	all: ["storage"] as const,
	files: () => [...storageKeys.all, "files"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * List files
 */
export function useFiles() {
	return useQuery({
		queryKey: storageKeys.files(),
		queryFn: () => client.storage.listFiles(),
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
	})
}

/**
 * Request download URL
 */
export function useRequestDownloadUrl() {
	return useMutation({
		mutationFn: (data: storage.DownloadUrlRequest) => client.storage.requestDownloadUrl(data),
	})
}

/**
 * Request profile picture upload URL
 */
export function useRequestProfilePictureUploadUrl() {
	return useMutation({
		mutationFn: (filename: string) => client.storage.requestProfilePictureUploadUrl({ filename }),
	})
}

/**
 * Request KYC document upload URL
 */
export function useRequestKycDocumentUploadUrl() {
	return useMutation({
		mutationFn: (filename: string) => client.storage.requestKycDocumentUploadUrl({ filename }),
	})
}

/**
 * Request KYC document download URL
 */
export function useRequestKycDocumentDownloadUrl() {
	return useMutation({
		mutationFn: (key: string) => client.storage.requestKycDocumentDownloadUrl({ key }),
	})
}

/**
 * Delete file
 */
export function useDeleteFile() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (key: string) => client.storage.deleteFile(key),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: storageKeys.files() })
		},
	})
}

/**
 * Upload profile picture (composite hook)
 * Handles the full flow: get presigned URL -> upload file -> return final URL
 */
export function useUploadProfilePicture() {
	return useMutation({
		mutationFn: async (file: File) => {
			// Step 1: Get presigned upload URL
			const { uploadUrl, fileUrl } = await client.storage.requestProfilePictureUploadUrl({
				filename: file.name,
			})

			// Step 2: Upload file to presigned URL
			const uploadResponse = await fetch(uploadUrl, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type,
				},
			})

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload file")
			}

			// Step 3: Return the final file URL
			return { fileUrl }
		},
	})
}
