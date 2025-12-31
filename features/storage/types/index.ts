/**
 * Storage Types
 *
 * Re-exports types from brand-client for consistency
 */

import type { storage } from "@/brand-client"

// Re-export namespace types
export type { storage }

// Convenience type aliases
export type UploadUrlRequest = storage.UploadUrlRequest
export type UploadUrlResponse = storage.UploadUrlResponse
export type DownloadUrlRequest = storage.DownloadUrlRequest
export type DownloadUrlResponse = storage.DownloadUrlResponse

// Folder types
export type StorageFolder = "uploads" | "profile-pictures" | "kyc-documents"
