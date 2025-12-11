'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { storage } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'

// Re-export types from Encore for convenience
export type UploadUrlRequest = storage.UploadUrlRequest
export type UploadUrlResponse = storage.UploadUrlResponse
export type DownloadUrlRequest = storage.DownloadUrlRequest
export type DownloadUrlResponse = storage.DownloadUrlResponse

// ============================================
// Query Keys
// ============================================

export const storageKeys = {
  all: ['storage'] as const,
  files: () => [...storageKeys.all, 'files'] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * List user's files in uploads bucket
 */
export function useFiles() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: storageKeys.files(),
    queryFn: async () => {
      const result = await client.storage.listFiles()
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
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: UploadUrlRequest) =>
      client.storage.requestUploadUrl(data),
  })
}

/**
 * Get a pre-signed download URL
 */
export function useGetDownloadUrl() {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: DownloadUrlRequest) =>
      client.storage.requestDownloadUrl(data),
  })
}

/**
 * Get a pre-signed upload URL for profile pictures
 */
export function useGetProfilePictureUploadUrl() {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (filename: string) =>
      client.storage.requestProfilePictureUploadUrl({ filename }),
  })
}

/**
 * Get a pre-signed upload URL for KYC documents
 */
export function useGetKycDocumentUploadUrl() {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (filename: string) =>
      client.storage.requestKycDocumentUploadUrl({ filename }),
  })
}

/**
 * Get a pre-signed download URL for KYC documents
 */
export function useGetKycDocumentDownloadUrl() {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (key: string) =>
      client.storage.requestKycDocumentDownloadUrl({ key }),
  })
}

/**
 * Delete a file from storage
 */
export function useDeleteFile() {
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (key: string) =>
      client.storage.deleteFile(key),
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
      folder?: UploadUrlRequest['folder']
    }) => {
      // Get the pre-signed upload URL
      const urlResponse = await getUploadUrl.mutateAsync({
        filename: file.name,
        contentType: file.type,
        folder,
      })

      // Upload the file to the pre-signed URL
      await fetch(urlResponse.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
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
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
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
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
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
