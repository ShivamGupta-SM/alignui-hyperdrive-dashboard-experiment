'use client'

import { useMutation } from '@tanstack/react-query'
import { post, del } from '@/lib/axios'
import type { ApiResponse } from '@/lib/types'

// ============================================
// Types
// ============================================

interface UploadUrlRequest {
  filename: string
  contentType: string
  folder?: 'avatars' | 'logos' | 'bills' | 'deliverables' | 'products'
}

interface UploadUrlResponse {
  uploadUrl: string
  key: string
  expiresIn: number
}

interface DownloadUrlResponse {
  downloadUrl: string
  expiresIn: number
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Get a pre-signed upload URL
 */
export function useGetUploadUrl() {
  return useMutation({
    mutationFn: (data: UploadUrlRequest) =>
      post<ApiResponse<UploadUrlResponse>>('/api/storage/upload-url', data),
  })
}

/**
 * Get a pre-signed download URL
 */
export function useGetDownloadUrl() {
  return useMutation({
    mutationFn: (key: string) =>
      post<ApiResponse<DownloadUrlResponse>>('/api/storage/download-url', { key }),
  })
}

/**
 * Delete a file from storage
 */
export function useDeleteFile() {
  return useMutation({
    mutationFn: (key: string) =>
      del<ApiResponse<{ message: string; key: string }>>(`/api/storage/files/${encodeURIComponent(key)}`),
  })
}

/**
 * Upload a file using pre-signed URL
 * This is a helper that combines getting the URL and uploading
 */
export function useUploadFile() {
  const getUploadUrl = useGetUploadUrl()

  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: UploadUrlRequest['folder'] }) => {
      // Get the pre-signed upload URL
      const urlResponse = await getUploadUrl.mutateAsync({
        filename: file.name,
        contentType: file.type,
        folder,
      })

      if (!urlResponse.success) {
        throw new Error(urlResponse.error || 'Failed to get upload URL')
      }

      // In production, you would actually upload to the pre-signed URL
      // For mock, we just return the key
      // await fetch(urlResponse.data.uploadUrl, {
      //   method: 'PUT',
      //   body: file,
      //   headers: { 'Content-Type': file.type },
      // })

      return {
        key: urlResponse.data.key,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }
    },
  })
}
