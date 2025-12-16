"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import {
	listFiles,
	requestUploadUrl,
	requestDownloadUrl,
	requestProfilePictureUploadUrl,
	requestKycDocumentUploadUrl,
	requestKycDocumentDownloadUrl,
	deleteFile,
} from "@/features/storage/lib/api"
import type { storage } from "@/lib/api/encore-browser"
import { STALE_TIMES } from "@/lib/types"

// Re-export types from Encore for convenience
export type UploadUrlRequest = storage.UploadUrlRequest
export type UploadUrlResponse = storage.UploadUrlResponse
export type DownloadUrlRequest = storage.DownloadUrlRequest
export type DownloadUrlResponse = storage.DownloadUrlResponse

// ============================================
// Query Keys
// ============================================

export const storageKeys = {
	all: ["storage"] as const,
	files: () => [...storageKeys.all, "files"] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * List user's files in uploads bucket
 */
export function useFiles() {
	return useQuery({
		queryKey: storageKeys.files(),
		queryFn: async () => {
			const result = await listFiles()
			return result.files
		},
		staleTime: STALE_TIMES.STANDARD,
	})
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Get a pre-signed upload URL
 */
export function useGetUploadUrl() {
	return useMutation({
		mutationFn: (data: UploadUrlRequest) => requestUploadUrl(data),
	})
}

/**
 * Get a pre-signed download URL
 */
export function useGetDownloadUrl() {
	return useMutation({
		mutationFn: (data: DownloadUrlRequest) => requestDownloadUrl(data),
	})
}

/**
 * Get a pre-signed upload URL for profile pictures
 */
export function useGetProfilePictureUploadUrl() {
	return useMutation({
		mutationFn: (filename: string) => requestProfilePictureUploadUrl(filename),
	})
}

/**
 * Get a pre-signed upload URL for KYC documents
 */
export function useGetKycDocumentUploadUrl() {
	return useMutation({
		mutationFn: (filename: string) => requestKycDocumentUploadUrl(filename),
	})
}

/**
 * Get a pre-signed download URL for KYC documents
 */
export function useGetKycDocumentDownloadUrl() {
	return useMutation({
		mutationFn: (key: string) => requestKycDocumentDownloadUrl(key),
	})
}

/**
 * Delete a file from storage
 */
export function useDeleteFile() {
	return useMutation({
		mutationFn: (key: string) => deleteFile(key),
	})
}

/**
 * Upload a file using pre-signed URL
 * This is a helper that combines getting the URL and uploading
 */
export function useUploadFile() {
	const getUploadUrl = useGetUploadUrl()

	return useMutation({
		mutationFn: async ({
			file,
			folder,
		}: {
			file: File
			folder?: UploadUrlRequest["folder"]
		}) => {
			// Get the pre-signed upload URL
			const urlResponse = await getUploadUrl.mutateAsync({
				filename: file.name,
				contentType: file.type,
				folder,
			})

			// Upload the file to the pre-signed URL
			await fetch(urlResponse.uploadUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			})

			return {
				key: urlResponse.key,
				fileUrl: urlResponse.fileUrl,
				filename: file.name,
				contentType: file.type,
				size: file.size,
			}
		},
	})
}

/**
 * Upload a profile picture
 * This is a helper that combines getting the URL and uploading
 */
export function useUploadProfilePicture() {
	const getUploadUrl = useGetProfilePictureUploadUrl()

	return useMutation({
		mutationFn: async (file: File) => {
			// Get the pre-signed upload URL
			const urlResponse = await getUploadUrl.mutateAsync(file.name)

			// Upload the file to the pre-signed URL
			await fetch(urlResponse.uploadUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			})

			return {
				key: urlResponse.key,
				fileUrl: urlResponse.fileUrl,
				filename: file.name,
				contentType: file.type,
				size: file.size,
			}
		},
	})
}

/**
 * Upload a KYC document
 * This is a helper that combines getting the URL and uploading
 */
export function useUploadKycDocument() {
	const getUploadUrl = useGetKycDocumentUploadUrl()

	return useMutation({
		mutationFn: async (file: File) => {
			// Get the pre-signed upload URL
			const urlResponse = await getUploadUrl.mutateAsync(file.name)

			// Upload the file to the pre-signed URL
			await fetch(urlResponse.uploadUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			})

			return {
				key: urlResponse.key,
				fileUrl: urlResponse.fileUrl,
				filename: file.name,
				contentType: file.type,
				size: file.size,
			}
		},
	})
}
