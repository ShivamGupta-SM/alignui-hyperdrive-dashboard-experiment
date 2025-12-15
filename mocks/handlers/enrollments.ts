/**
 * Enrollments API Mock Handlers
 *
 * Intercepts Encore API calls at localhost:4000/enrollments
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

// Enrollment already in Encore format from database - return as-is
function toEnrollmentWithRelations(enrollment: any) {
  return enrollment
}

export const enrollmentsHandlers = [
  // GET /enrollments - List enrollments
  http.get(encoreUrl("/enrollments"), async ({ request }) => {
    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
    const take = Number.parseInt(url.searchParams.get("take") || "20", 10)
    const status = url.searchParams.get("status")
    const campaignId = url.searchParams.get("campaignId")

    let enrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))

    if (status && status !== "all") {
      enrollments = enrollments.filter((e) => e.status === status)
    }
    if (campaignId) {
      enrollments = enrollments.filter((e) => e.campaignId === campaignId)
    }

    enrollments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = enrollments.length
    const paginatedEnrollments = enrollments.slice(skip, skip + take)

    return encoreListResponse(
      paginatedEnrollments.map(toEnrollmentWithRelations),
      total,
      skip,
      take
    )
  }),

  // GET /enrollments/me - My enrollments (alias)
  http.get(encoreUrl("/enrollments/me"), async ({ request }) => {
    const auth = getAuthContext()
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
    const take = Number.parseInt(url.searchParams.get("take") || "20", 10)
    const status = url.searchParams.get("status")

    let enrollments = db.enrollments.findMany((q) =>
      q.where({ organizationId: auth.organizationId })
    )

    if (status && status !== "all") {
      enrollments = enrollments.filter((e) => e.status === status)
    }

    const total = enrollments.length
    const paginatedEnrollments = enrollments.slice(skip, skip + take)

    return encoreListResponse(
      paginatedEnrollments.map(toEnrollmentWithRelations),
      total,
      skip,
      take
    )
  }),

  // GET /enrollments/:id - Get enrollment (with detail including submissions)
  http.get(encoreUrl("/enrollments/:id"), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id

    if (!enrollmentId) {
      return encoreNotFoundResponse("Enrollment")
    }

    const enrollment = db.enrollments.findFirst((q) =>
      q.where({ id: enrollmentId as string, organizationId: auth.organizationId })
    )
    if (!enrollment) {
      return encoreNotFoundResponse("Enrollment")
    }

    // Get campaign for additional info
    const campaign = db.campaigns.findFirst((q) => q.where({ id: enrollment.campaignId }))

    // Get campaign deliverables
    const campaignDeliverables = db.campaignDeliverables.findMany((q) =>
      q.where({ campaignId: enrollment.campaignId })
    )

    // Get deliverable submissions for this enrollment
    const submissions = db.deliverableSubmissions.findMany((q) =>
      q.where({ enrollmentId: enrollmentId as string })
    )

    // Build submissions array (include both submitted and not-yet-submitted deliverables)
    const submissionsArray = campaignDeliverables.map((cd) => {
      const submitted = submissions.find((s) => s.campaignDeliverableId === cd.id)
      return {
        id: submitted?.id ?? "",
        campaignDeliverableId: cd.id,
        deliverableName: submitted?.lockedDeliverableName ?? cd.title,
        deliverableDescription: submitted?.lockedDeliverableDescription ?? cd.description,
        isRequired: submitted?.lockedIsRequired ?? cd.isRequired,
        requireLink: submitted?.lockedRequireLink ?? true,
        requireScreenshot: submitted?.lockedRequireScreenshot ?? true,
        instructions: submitted?.lockedInstructions ?? cd.instructions,
        proofLink: submitted?.proofLink,
        proofScreenshot: submitted?.proofScreenshot,
        submittedAt: submitted?.createdAt,
      }
    })

    // Build enrollment detail response
    const enrollmentDetail = {
      ...toEnrollmentWithRelations(enrollment),
      submissions: submissionsArray,
      campaign: campaign
        ? {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          type: campaign.campaignType,
        }
        : undefined,
    }

    return encoreResponse(enrollmentDetail)
  }),

  // POST /enrollments/:id/approve
  http.post(encoreUrl("/enrollments/:id/approve"), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id
    if (!enrollmentId) {
      return encoreNotFoundResponse("Enrollment")
    }

    const enrollment = db.enrollments.findFirst((q) =>
      q.where({ id: enrollmentId as string, organizationId: auth.organizationId })
    )
    if (!enrollment) {
      return encoreNotFoundResponse("Enrollment")
    }

    if (enrollment.status !== "awaiting_review") {
      return encoreErrorResponse("Only enrollments awaiting review can be approved", 400)
    }

    // Update enrollment in database - use findFirst + manual update pattern
    const updated = {
      ...enrollment,
      status: "approved" as const,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payoutAmount: enrollment.lockedBillRate || 0, // Set payout amount
    }
    db.enrollments.delete((q) => q.where({ id: enrollmentId as string }))
    db.enrollments.create(updated)

    // Update campaign stats
    const campaign = db.campaigns.findFirst((q) => q.where({ id: enrollment.campaignId }))
    if (campaign) {
      const approvedCount = db.enrollments
        .findMany((q) => q.where({ campaignId: campaign.id }))
        .filter((e) => e.status === "approved").length

      // Update campaign stats - use findFirst + manual update pattern
      const updatedCampaign = {
        ...campaign,
        approvedCount,
        currentEnrollments: campaign.currentEnrollments || 0,
        updatedAt: new Date().toISOString(),
      }
      db.campaigns.delete((q) => q.where({ id: campaign.id }))
      db.campaigns.create(updatedCampaign)
    }

    return encoreResponse(toEnrollmentWithRelations(updated))
  }),

  // POST /enrollments/:id/reject
  http.post(encoreUrl("/enrollments/:id/reject"), async ({ params, request }) => {
    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id
    if (!enrollmentId) {
      return encoreNotFoundResponse("Enrollment")
    }
    await request.json().catch(() => ({}))

    const enrollment = db.enrollments.findFirst((q) =>
      q.where({ id: enrollmentId as string, organizationId: auth.organizationId })
    )
    if (!enrollment) {
      return encoreNotFoundResponse("Enrollment")
    }

    if (enrollment.status !== "awaiting_review") {
      return encoreErrorResponse("Only enrollments awaiting review can be rejected", 400)
    }

    return encoreResponse({
      ...toEnrollmentWithRelations(enrollment),
      status: "rejected",
    })
  }),

  // POST /enrollments/:id/request-changes
  http.post(encoreUrl("/enrollments/:id/request-changes"), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id
    if (!enrollmentId) {
      return encoreNotFoundResponse("Enrollment")
    }

    const enrollment = db.enrollments.findFirst((q) =>
      q.where({ id: enrollmentId as string, organizationId: auth.organizationId })
    )
    if (!enrollment) {
      return encoreNotFoundResponse("Enrollment")
    }

    // Update enrollment in database - use findFirst + manual update pattern
    const updated = {
      ...enrollment,
      status: "changes_requested" as const,
      canResubmit: true,
      updatedAt: new Date().toISOString(),
    }
    db.enrollments.delete((q) => q.where({ id: enrollmentId as string }))
    db.enrollments.create(updated)

    return encoreResponse(toEnrollmentWithRelations(updated))
  }),

  // POST /enrollments/batch/approve - Bulk approve
  http.post(encoreUrl("/enrollments/batch/approve"), async ({ request }) => {
    const auth = getAuthContext()
    const body = (await request.json()) as { enrollmentIds: string[] }

    if (!body.enrollmentIds?.length) {
      return encoreErrorResponse("At least one enrollment ID is required", 400)
    }

    let approved = 0
    const errors: Record<string, string> = {}

    for (const enrollmentId of body.enrollmentIds) {
      const enrollment = db.enrollments.findFirst((q) =>
        q.where({ id: enrollmentId, organizationId: auth.organizationId })
      )
      if (!enrollment) {
        errors[enrollmentId] = "Not found"
      } else if (enrollment.status !== "awaiting_review") {
        errors[enrollmentId] = "Not awaiting review"
      } else {
        // Update enrollment in database - use findFirst + manual update pattern
        const updated = {
          ...enrollment,
          status: "approved" as const,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          payoutAmount: enrollment.lockedBillRate || 0,
        }
        db.enrollments.delete((q) => q.where({ id: enrollmentId }))
        db.enrollments.create(updated)
        approved++
      }
    }

    return encoreResponse({ approved, failed: Object.keys(errors).length, errors })
  }),

  // POST /enrollments/batch/reject - Bulk reject
  http.post(encoreUrl("/enrollments/batch/reject"), async ({ request }) => {
    const auth = getAuthContext()
    const body = (await request.json()) as { enrollmentIds: string[]; reason: string }

    if (!body.enrollmentIds?.length) {
      return encoreErrorResponse("At least one enrollment ID is required", 400)
    }

    let rejected = 0
    const errors: Record<string, string> = {}

    for (const enrollmentId of body.enrollmentIds) {
      const enrollment = db.enrollments.findFirst((q) =>
        q.where({ id: enrollmentId, organizationId: auth.organizationId })
      )
      if (!enrollment) {
        errors[enrollmentId] = "Not found"
      } else if (enrollment.status !== "awaiting_review") {
        errors[enrollmentId] = "Not awaiting review"
      } else {
        // Update enrollment in database - use findFirst + manual update pattern
        const updated = {
          ...enrollment,
          status: "rejected" as const,
          updatedAt: new Date().toISOString(),
        }
        db.enrollments.delete((q) => q.where({ id: enrollmentId }))
        db.enrollments.create(updated)
        rejected++
      }
    }

    return encoreResponse({ rejected, failed: Object.keys(errors).length, errors })
  }),

  // GET /campaigns/:campaignId/enrollments
  http.get(encoreUrl("/campaigns/:campaignId/enrollments"), async ({ params, request }) => {
    const auth = getAuthContext()
    const { campaignId } = params
    const campaignIdStr = Array.isArray(campaignId) ? campaignId[0] : campaignId
    if (!campaignIdStr) {
      return encoreNotFoundResponse("Campaign")
    }
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
    const take = Number.parseInt(url.searchParams.get("take") || "20", 10)
    const status = url.searchParams.get("status")

    const campaign = db.campaigns.findFirst((q) =>
      q.where({ id: campaignIdStr as string, organizationId: auth.organizationId })
    )
    if (!campaign) {
      return encoreNotFoundResponse("Campaign")
    }

    let enrollments = db.enrollments.findMany((q) => q.where({ campaignId: campaignIdStr as string }))

    if (status && status !== "all") {
      enrollments = enrollments.filter((e) => e.status === status)
    }

    const total = enrollments.length
    const paginatedEnrollments = enrollments.slice(skip, skip + take)

    return encoreListResponse(
      paginatedEnrollments.map(toEnrollmentWithRelations),
      total,
      skip,
      take
    )
  }),

  // GET /campaigns/:campaignId/enrollment-stats
  http.get(encoreUrl("/campaigns/:campaignId/enrollment-stats"), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { campaignId } = params
    const campaignIdStr = Array.isArray(campaignId) ? campaignId[0] : campaignId
    if (!campaignIdStr) {
      return encoreNotFoundResponse("Campaign")
    }

    const campaign = db.campaigns.findFirst((q) =>
      q.where({ id: campaignIdStr as string, organizationId: auth.organizationId })
    )
    if (!campaign) {
      return encoreNotFoundResponse("Campaign")
    }

    const enrollments = db.enrollments.findMany((q) => q.where({ campaignId: campaignIdStr as string }))

    return encoreResponse({
      total: enrollments.length,
      awaitingSubmission: enrollments.filter((e) => e.status === "awaiting_submission").length,
      awaitingReview: enrollments.filter((e) => e.status === "awaiting_review").length,
      changesRequested: enrollments.filter((e) => e.status === "changes_requested").length,
      approved: enrollments.filter((e) => e.status === "approved").length,
      rejected: enrollments.filter((e) => e.status === "rejected").length,
      totalOrderValue: enrollments.reduce((sum, e) => sum + (e.orderValue || 0), 0),
      totalPayouts: enrollments
        .filter((e) => e.status === "approved")
        .reduce((sum, e) => sum + (e.lockedBillRate || 0), 0),
    })
  }),

  // POST /enrollments - Create enrollment
  http.post(encoreUrl("/enrollments"), async ({ request }) => {
    const auth = getAuthContext()
    const body = (await request.json()) as {
      campaignId: string
      shopperId?: string
      orderValue?: number
      orderId?: string
    }

    if (!body.campaignId) {
      return encoreErrorResponse("campaignId is required", 400)
    }

    // Verify campaign exists
    const campaign = db.campaigns.findFirst((q) =>
      q.where({ id: body.campaignId, organizationId: auth.organizationId })
    )
    if (!campaign) {
      return encoreNotFoundResponse("Campaign")
    }

    // Check if campaign is active
    if (campaign.status !== "active") {
      return encoreErrorResponse("Campaign is not active", 400)
    }

    // Check enrollment limit
    const existingEnrollments = db.enrollments.findMany((q) =>
      q.where({ campaignId: body.campaignId })
    )
    if (campaign.maxEnrollments && existingEnrollments.length >= campaign.maxEnrollments) {
      return encoreErrorResponse("Campaign enrollment limit reached", 400)
    }

    const now = new Date().toISOString()
    const newEnrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      organizationId: auth.organizationId,
      campaignId: body.campaignId,
      shopperId: body.shopperId || `shopper-${Date.now()}`,
      status: "awaiting_submission" as const,
      orderValue: body.orderValue || 0,
      orderId: body.orderId || "",
      lockedBillRate: campaign.billRate || 0,
      lockedPlatformFee: campaign.platformFee || 0,
      lockedRebatePercentage: campaign.rebatePercentage || 0,
      lockedBonusAmount: campaign.bonusAmount || 0,
      billAmount: campaign.billRate || 0,
      payoutAmount: 0,
      canResubmit: false,
      rejectionCount: 0,
      submittedAt: "",
      approvedAt: "",
      rejectedAt: "",
      rejectionReason: "",
      createdAt: now,
      updatedAt: now,
    }

    // Save to database
    db.enrollments.create(newEnrollment)

    // Update campaign enrollment count - use findFirst + manual update pattern
    const updatedCampaign = {
      ...campaign,
      currentEnrollments: (campaign.currentEnrollments || 0) + 1,
      updatedAt: now,
    }
    db.campaigns.delete((q) => q.where({ id: campaign.id }))
    db.campaigns.create(updatedCampaign)

    return encoreResponse(toEnrollmentWithRelations(newEnrollment))
  }),

  // PUT /enrollments/:id - Update enrollment
  http.put(encoreUrl("/enrollments/:id"), async ({ params, request }) => {
    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id
    if (!enrollmentId) {
      return encoreNotFoundResponse("Enrollment")
    }
    const body = (await request.json()) as {
      orderValue?: number
      orderId?: string
      status?: string
    }

    const enrollment = db.enrollments.findFirst((q) =>
      q.where({ id: enrollmentId as string, organizationId: auth.organizationId })
    )
    if (!enrollment) {
      return encoreNotFoundResponse("Enrollment")
    }

    // Update enrollment in database - use findFirst + manual update pattern
    const updated = {
      ...enrollment,
      ...body,
      status: body.status ? (body.status as "rejected" | "approved" | "expired" | "enrolled" | "awaiting_submission" | "awaiting_review" | "changes_requested" | "withdrawn") : enrollment.status,
      updatedAt: new Date().toISOString(),
    }
    db.enrollments.delete((q) => q.where({ id: enrollmentId as string }))
    db.enrollments.create(updated)

    return encoreResponse(toEnrollmentWithRelations(updated))
  }),

  // PATCH /enrollments/:id - Partial update enrollment
  http.patch(encoreUrl("/enrollments/:id"), async ({ params, request }) => {
    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id
    if (!enrollmentId) {
      return encoreNotFoundResponse("Enrollment")
    }
    const body = (await request.json()) as Record<string, unknown>

    const enrollment = db.enrollments.findFirst((q) =>
      q.where({ id: enrollmentId as string, organizationId: auth.organizationId })
    )
    if (!enrollment) {
      return encoreNotFoundResponse("Enrollment")
    }

    // Update enrollment in database - use findFirst + manual update pattern
    const updated = {
      ...enrollment,
      ...body,
      status: body.status ? (body.status as "rejected" | "approved" | "expired" | "enrolled" | "awaiting_submission" | "awaiting_review" | "changes_requested" | "withdrawn") : enrollment.status,
      updatedAt: new Date().toISOString(),
    }
    db.enrollments.delete((q) => q.where({ id: enrollmentId as string }))
    db.enrollments.create(updated)

    return encoreResponse(toEnrollmentWithRelations(updated))
  }),

  // DELETE /enrollments/:id - Delete enrollment
  http.delete(encoreUrl("/enrollments/:id"), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id
    if (!enrollmentId) {
      return encoreNotFoundResponse("Enrollment")
    }

    const enrollment = db.enrollments.findFirst((q) =>
      q.where({ id: enrollmentId as string, organizationId: auth.organizationId })
    )
    if (!enrollment) {
      return encoreNotFoundResponse("Enrollment")
    }

    // Cannot delete approved enrollments
    if (enrollment.status === "approved") {
      return encoreErrorResponse("Cannot delete approved enrollment", 400)
    }

    // Delete enrollment from database
    db.enrollments.delete((q) => q.where({ id: enrollmentId as string }))

    // Update campaign enrollment count - use findFirst + manual update pattern
    const campaign = db.campaigns.findFirst((q) => q.where({ id: enrollment.campaignId }))
    if (campaign) {
      const updatedCampaign = {
        ...campaign,
        currentEnrollments: Math.max(0, (campaign.currentEnrollments || 0) - 1),
        updatedAt: new Date().toISOString(),
      }
      db.campaigns.delete((q) => q.where({ id: campaign.id }))
      db.campaigns.create(updatedCampaign)
    }

    return encoreResponse({ deleted: true })
  }),
]

