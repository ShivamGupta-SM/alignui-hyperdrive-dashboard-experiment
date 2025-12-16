/**
 * Storage API - Single source of truth for all storage operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { storage } from "@/lib/api/encore-client"

/**
 * List files
 * 
 * @returns Files list
 */
export async function listFiles() {
	const client = getEncoreBrowserClient()
	return client.storage.listFiles()
}

/**
 * Request upload URL
 * 
 * @param data - Upload request data
 * @returns Upload URL response
 */
export async function requestUploadUrl(data: storage.UploadUrlRequest) {
	const client = getEncoreBrowserClient()
	return client.storage.requestUploadUrl(data)
}

/**
 * Request download URL
 * 
 * @param data - Download request data
 * @returns Download URL response
 */
export async function requestDownloadUrl(data: storage.DownloadUrlRequest) {
	const client = getEncoreBrowserClient()
	return client.storage.requestDownloadUrl(data)
}

/**
 * Request profile picture upload URL
 * 
 * @param filename - File name
 * @returns Upload URL response
 */
export async function requestProfilePictureUploadUrl(filename: string) {
	const client = getEncoreBrowserClient()
	return client.storage.requestProfilePictureUploadUrl({ filename })
}

/**
 * Request KYC document upload URL
 * 
 * @param filename - File name
 * @returns Upload URL response
 */
export async function requestKycDocumentUploadUrl(filename: string) {
	const client = getEncoreBrowserClient()
	return client.storage.requestKycDocumentUploadUrl({ filename })
}

/**
 * Request KYC document download URL
 * 
 * @param key - File key
 * @returns Download URL response
 */
export async function requestKycDocumentDownloadUrl(key: string) {
	const client = getEncoreBrowserClient()
	return client.storage.requestKycDocumentDownloadUrl({ key })
}

/**
 * Delete file
 * 
 * @param key - File key
 */
export async function deleteFile(key: string) {
	const client = getEncoreBrowserClient()
	return client.storage.deleteFile(key)
}
