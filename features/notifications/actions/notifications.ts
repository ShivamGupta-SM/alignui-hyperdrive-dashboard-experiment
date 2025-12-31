"use server"

/**
 * Notification Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { z } from "zod"
import { revalidateTag } from "next/cache"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Actions
// =============================================================================

/**
 * Mark all notifications as read
 * RESTful: Added input schema for consistency with other actions
 */
export const markAllNotificationsAsRead = authAction
	.inputSchema(z.object({}))
	.action(async ({ ctx }) => {
		const result = await ctx.client.notifications.markAllAsRead()
		revalidateTag("notifications")
		return { ...result, success: true }
	})
