/**
 * Notifications API Mock Handlers
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import {
	getAuthContext,
	encoreUrl,
	encoreResponse,
	encoreListResponse,
	encoreNotFoundResponse,
	encoreErrorResponse,
} from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

export const notificationsHandlers = [
	// GET /notifications
	http.get(encoreUrl("/notifications"), async ({ request }) => {
		const url = new URL(request.url)
		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		const auth = getAuthContext()
		const notifications = db.notifications
			.findMany((q) => q.where({ organizationId: auth.organizationId || "1" }))
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

		return encoreListResponse(
			notifications.slice(skip, skip + take).map((n) => ({
				...n,
				createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt, // Already ISO string from db
			})),
			notifications.length,
			skip,
			take
		)
	}),

	// GET /notifications/unread-count
	http.get(encoreUrl("/notifications/unread-count"), async () => {
		const auth = getAuthContext()
		const notifications = db.notifications.findMany((q) =>
			q.where({ organizationId: auth.organizationId || "1" })
		)
		const unreadCount = notifications.filter((n) => !n.isRead).length
		return encoreResponse({ count: unreadCount })
	}),

	// POST /notifications/:id/read
	http.post(encoreUrl("/notifications/:id/read"), async ({ params }) => {
		await delay(DELAY.FAST)
		const { id } = params
		const notificationId = Array.isArray(id) ? id[0] : id
		if (!notificationId) {
			return encoreNotFoundResponse("Notification")
		}
		const auth = getAuthContext()
		const notification = db.notifications.findFirst((q) =>
			q.where({ id: notificationId as string, organizationId: auth.organizationId || "1" })
		)
		if (!notification) return encoreNotFoundResponse("Notification")
		return encoreResponse({ ...notification, isRead: true })
	}),

	// POST /notifications/read-all
	http.post(encoreUrl("/notifications/read-all"), async () => {
		const auth = getAuthContext()
		const notifications = db.notifications.findMany((q) =>
			q.where({ organizationId: auth.organizationId || "1" })
		)

		// Mark all as read - use findFirst + manual update pattern
		for (const notification of notifications) {
			const updated = { ...notification, isRead: true }
			db.notifications.delete((q) => q.where({ id: notification.id }))
			db.notifications.create(updated)
		}

		return encoreResponse({ success: true })
	}),

	// POST /notifications - Create notification
	http.post(encoreUrl("/notifications"), async ({ request }) => {
		const auth = getAuthContext()
		const body = (await request.json()) as {
			title: string
			message: string
			type?: "info" | "success" | "warning" | "error"
			organizationId?: string
			userId?: string
		}

		if (!body.title || !body.message) {
			return encoreErrorResponse("title and message are required", 400)
		}

		const now = new Date().toISOString()
		const newNotification = {
			id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			organizationId: body.organizationId || auth.organizationId || "1",
			userId: body.userId || auth.userId || "1",
			title: body.title,
			message: body.message,
			type: body.type || "info",
			isRead: false,
			createdAt: now,
			updatedAt: now,
		}

		// Save to database
		db.notifications.create(newNotification)

		return encoreResponse({
			...newNotification,
			createdAt: newNotification.createdAt,
		})
	}),

	// DELETE /notifications/:id - Delete notification
	http.delete(encoreUrl("/notifications/:id"), async ({ params }) => {
		const auth = getAuthContext()
		const { id } = params
		const notificationId = Array.isArray(id) ? id[0] : id
		if (!notificationId) {
			return encoreNotFoundResponse("Notification")
		}

		const notification = db.notifications.findFirst((q) =>
			q.where({ id: notificationId as string, organizationId: auth.organizationId || "1" })
		)
		if (!notification) {
			return encoreNotFoundResponse("Notification")
		}

		// Delete notification from database
		db.notifications.delete((q) => q.where({ id: notificationId as string }))

		return encoreResponse({ deleted: true })
	}),
]

