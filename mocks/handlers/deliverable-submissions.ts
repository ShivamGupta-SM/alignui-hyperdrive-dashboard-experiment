/**
 * Deliverable Submissions API Mock Handlers
 *
 * Intercepts Encore API calls for deliverable submissions
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import {
	getAuthContext,
	encoreUrl,
	encoreResponse,
	encoreListResponse,
	encoreErrorResponse,
	encoreNotFoundResponse,
} from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

export const deliverableSubmissionsHandlers = [
	// GET /deliverable-submissions/:id - Get submission by ID
	http.get(encoreUrl("/deliverable-submissions/:id"), async ({ params }) => {
		await delay(DELAY.FAST)

		const { id } = params
		const submissionId = Array.isArray(id) ? id[0] : id

		if (!submissionId) {
			return encoreNotFoundResponse("DeliverableSubmission")
		}

		const submission = db.deliverableSubmissions.findFirst((q) =>
			q.where({ id: submissionId as string })
		)

		if (!submission) {
			return encoreNotFoundResponse("DeliverableSubmission")
		}

		return encoreResponse(submission)
	}),

	// GET /enrollments/:enrollmentId/submissions - List submissions for enrollment
	http.get(encoreUrl("/enrollments/:enrollmentId/submissions"), async ({ params, request }) => {
		await delay(DELAY.FAST)

		const { enrollmentId } = params
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		if (!enrollmentId || Array.isArray(enrollmentId)) {
			return encoreErrorResponse("Invalid enrollment ID", 400)
		}

		const submissions = db.deliverableSubmissions.findMany((q) =>
			q.where({ enrollmentId: enrollmentId as string })
		)

		// Sort by createdAt descending
		submissions.sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)

		const total = submissions.length
		const paginatedSubmissions = submissions.slice(skip, skip + take)

		return encoreListResponse(paginatedSubmissions, total, skip, take)
	}),

	// POST /deliverable-submissions - Create submission
	http.post(encoreUrl("/deliverable-submissions"), async ({ request }) => {
		await delay(DELAY.MEDIUM)

		const auth = getAuthContext()
		const body = (await request.json()) as {
			enrollmentId: string
			campaignDeliverableId: string
			proofLink?: string
			proofScreenshot?: string
		}

		if (!body.enrollmentId || !body.campaignDeliverableId) {
			return encoreErrorResponse("enrollmentId and campaignDeliverableId are required", 400)
		}

		// Verify enrollment exists
		const enrollment = db.enrollments.findFirst((q) =>
			q.where({ id: body.enrollmentId })
		)

		if (!enrollment) {
			return encoreNotFoundResponse("Enrollment")
		}

		// Verify campaign deliverable exists
		const campaignDeliverable = db.campaignDeliverables.findFirst((q) =>
			q.where({ id: body.campaignDeliverableId })
		)

		if (!campaignDeliverable) {
			return encoreNotFoundResponse("CampaignDeliverable")
		}

		// Get deliverable details for locked snapshot
		const deliverable = db.deliverables.findFirst((q) =>
			q.where({ id: campaignDeliverable.type }) // Using type as deliverable ID for now
		)

		const now = new Date().toISOString()
		const submission = db.deliverableSubmissions.create({
			id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			enrollmentId: body.enrollmentId,
			campaignDeliverableId: body.campaignDeliverableId,
			proofLink: body.proofLink,
			proofScreenshot: body.proofScreenshot,
			// Lock deliverable snapshot
			lockedDeliverableName: campaignDeliverable.title,
			lockedDeliverableDescription: campaignDeliverable.description,
			lockedIsRequired: campaignDeliverable.isRequired,
			lockedInstructions: campaignDeliverable.instructions,
			lockedRequireLink: deliverable?.requireLink ?? true,
			lockedRequireScreenshot: deliverable?.requireScreenshot ?? true,
			createdAt: now,
			updatedAt: now,
		})

		return encoreResponse(submission)
	}),

	// POST /deliverable-submissions/:id/submit - Submit proof for deliverable
	http.post(encoreUrl("/deliverable-submissions/:id/submit"), async ({ params, request }) => {
		await delay(DELAY.MEDIUM)

		const { id } = params
		const submissionId = Array.isArray(id) ? id[0] : id

		if (!submissionId) {
			return encoreNotFoundResponse("DeliverableSubmission")
		}

		const body = (await request.json()) as {
			proofLink?: string
			proofScreenshot?: string
		}

		const submission = db.deliverableSubmissions.findFirst((q) =>
			q.where({ id: submissionId as string })
		)

		if (!submission) {
			return encoreNotFoundResponse("DeliverableSubmission")
		}

		// Update submission with proof
		const updated = db.deliverableSubmissions.update({
			where: { id: submissionId as string },
			data: {
				proofLink: body.proofLink ?? submission.proofLink,
				proofScreenshot: body.proofScreenshot ?? submission.proofScreenshot,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// PATCH /deliverable-submissions/:id - Update submission
	http.patch(encoreUrl("/deliverable-submissions/:id"), async ({ params, request }) => {
		await delay(DELAY.MEDIUM)

		const { id } = params
		const submissionId = Array.isArray(id) ? id[0] : id

		if (!submissionId) {
			return encoreNotFoundResponse("DeliverableSubmission")
		}

		const body = (await request.json()) as {
			proofLink?: string
			proofScreenshot?: string
		}

		const submission = db.deliverableSubmissions.findFirst((q) =>
			q.where({ id: submissionId as string })
		)

		if (!submission) {
			return encoreNotFoundResponse("DeliverableSubmission")
		}

		const updated = db.deliverableSubmissions.update({
			where: { id: submissionId as string },
			data: {
				...body,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// GET /submissions/pending - List pending submissions for review (organization)
	http.get(encoreUrl("/submissions/pending"), async ({ request }) => {
		await delay(DELAY.FAST)

		const auth = getAuthContext()
		const orgId = auth.organizationId
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)
		const campaignId = url.searchParams.get("campaignId")

		// Get all enrollments for this organization
		let enrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))

		if (campaignId) {
			enrollments = enrollments.filter((e) => e.campaignId === campaignId)
		}

		const enrollmentIds = enrollments.map((e) => e.id)

		// Get submissions for these enrollments that have proof but are pending review
		const allSubmissions = db.deliverableSubmissions.findMany()

		const pendingSubmissions = allSubmissions.filter(
			(s) =>
				enrollmentIds.includes(s.enrollmentId) &&
				(s.proofLink || s.proofScreenshot) &&
				// Consider pending if proof is submitted but enrollment is awaiting review
				enrollments.find((e) => e.id === s.enrollmentId)?.status === "awaiting_review"
		)

		// Sort by createdAt descending
		pendingSubmissions.sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)

		const total = pendingSubmissions.length
		const paginatedSubmissions = pendingSubmissions.slice(skip, skip + take)

		return encoreListResponse(paginatedSubmissions, total, skip, take)
	}),
]
