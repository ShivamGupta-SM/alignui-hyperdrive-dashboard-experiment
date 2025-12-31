"use server"

/**
 * Storage Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas
// =============================================================================

const deleteFileSchema = z.object({
	key: z.string().min(1),
})

const requestUploadUrlSchema = z.object({
	filename: z.string().min(1),
	contentType: z.string().min(1),
	folder: z.enum(["uploads", "profile-pictures", "kyc-documents"]).optional(),
})

const requestDownloadUrlSchema = z.object({
	key: z.string().min(1),
	folder: z.enum(["uploads", "profile-pictures", "kyc-documents"]).optional(),
})

const requestOrgLogoUploadUrlSchema = z.object({
	filename: z.string().min(1),
	orgId: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Delete file from storage
 */
export const deleteFile = authAction
	.inputSchema(deleteFileSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.storage.deleteFile(parsedInput.key)
		revalidateTag("storage")
		return result
	})

/**
 * Request upload URL
 */
export const requestUploadUrl = authAction
	.inputSchema(requestUploadUrlSchema)
	.action(async ({ parsedInput, ctx }) => {
		return ctx.client.storage.requestUploadUrl(parsedInput)
	})

/**
 * Request download URL
 */
export const requestDownloadUrl = authAction
	.inputSchema(requestDownloadUrlSchema)
	.action(async ({ parsedInput, ctx }) => {
		return ctx.client.storage.requestDownloadUrl(parsedInput)
	})

/**
 * Request organization logo upload URL
 */
export const requestOrgLogoUploadUrl = authAction
	.inputSchema(requestOrgLogoUploadUrlSchema)
	.action(async ({ parsedInput, ctx }) => {
		return ctx.client.storage.requestOrgLogoUploadUrl(parsedInput)
	})

/**
 * Request profile picture upload URL
 */
export const requestProfilePictureUploadUrl = authAction
	.inputSchema(z.object({ filename: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		return ctx.client.storage.requestProfilePictureUploadUrl(parsedInput)
	})

/**
 * Request KYC document upload URL
 */
export const requestKycDocumentUploadUrl = authAction
	.inputSchema(z.object({ filename: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		return ctx.client.storage.requestKycDocumentUploadUrl(parsedInput)
	})

/**
 * Request KYC document download URL
 */
export const requestKycDocumentDownloadUrl = authAction
	.inputSchema(z.object({ key: z.string().min(1) }))
	.action(async ({ parsedInput, ctx }) => {
		return ctx.client.storage.requestKycDocumentDownloadUrl(parsedInput)
	})
