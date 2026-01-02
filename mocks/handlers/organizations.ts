/**
 * Organizations API Mock Handlers - DB Only
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import { getAuthContext, encoreUrl, encoreResponse, encoreNotFoundResponse, encoreErrorResponse } from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

// ============================================================================
// HELPER: Update organization (shared by PUT and PATCH)
// ============================================================================

interface UpdateOrgBody {
	name?: string
	email?: string
	logo?: string
	description?: string
	website?: string
	businessType?: string
	industryCategory?: string
	contactPerson?: string
	phoneNumber?: string
	address?: string
	city?: string
	state?: string
	postalCode?: string
	country?: string
	cinNumber?: string
}

/**
 * Shared helper for updating organization
 * Used by both PUT and PATCH handlers to avoid duplication
 * @param id - Organization ID
 * @param body - Update body
 * @param includeFullResponse - Whether to include all fields in response (PATCH) or minimal (PUT)
 */
function updateOrganization(id: string, body: UpdateOrgBody, includeFullResponse: boolean) {
	let org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))

	// If organization doesn't exist, create it (for onboarding flow)
	if (!org) {
		db.organizationSettings.create({
			organizationId: id,
			name: body.name || "New Organization",
			email: body.email || "",
			logo: body.logo || undefined,
		})
		org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
	}

	if (!org) {
		return { success: false, response: encoreNotFoundResponse("Organization") }
	}

	// Update organization in database
	const updated = { ...org, ...body }
	db.organizationSettings.delete((q) => q.where({ organizationId: id }))
	db.organizationSettings.create(updated)

	// Build response based on handler type
	const baseResponse = {
		id: updated.organizationId,
		name: updated.name,
		slug: String(updated.name).toLowerCase().replace(/\s+/g, "-"),
		logo: updated.logo,
	}

	if (includeFullResponse) {
		return {
			success: true,
			response: encoreResponse({
				...baseResponse,
				description: body.description || null,
				website: body.website || null,
				businessType: body.businessType || null,
				industryCategory: body.industryCategory || null,
				contactPerson: body.contactPerson || null,
				phoneNumber: body.phoneNumber || null,
				address: body.address || null,
				city: body.city || null,
				state: body.state || null,
				postalCode: body.postalCode || null,
				country: body.country || "IN",
				cinNumber: body.cinNumber || null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}),
		}
	}

	return { success: true, response: encoreResponse(baseResponse) }
}

export const organizationsHandlers = [
	// GET /organizations/me - Get my organizations
	http.get(encoreUrl("/organizations/me"), async () => {
		const orgs = db.organizationSettings.findMany()

		return encoreResponse({
			organizations: orgs.map((o) => ({
				id: o.organizationId,
				name: o.name,
				slug: o.name.toLowerCase().replace(/\s+/g, "-"),
				logo: o.logo,
			})),
		})
	}),

	// GET /organizations/:id - Get organization (with all fields for draft loading)
	http.get(encoreUrl("/organizations/:id"), async ({ params }) => {
		const { id } = params as { id: string }
		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))

		if (!org) {
			return encoreNotFoundResponse("Organization")
		}

		// Return full organization data (needed for draft loading)
		return encoreResponse({
			id: org.organizationId,
			name: org.name,
			slug: org.name.toLowerCase().replace(/\s+/g, "-"),
			logo: org.logo,
			description: org.description || undefined,
			website: org.website || undefined,
			businessType: org.businessType || undefined,
			industryCategory: org.industryCategory || undefined,
			contactPerson: org.contactPerson || undefined,
			phoneNumber: org.phone || undefined,
			address: org.address || undefined,
			city: org.city || undefined,
			state: org.state || undefined,
			postalCode: org.postalCode || undefined,
			country: org.country || "IN",
			cinNumber: org.cinNumber || undefined,
			gstNumber: org.gstNumber || undefined,
			gstVerified: org.gstVerified || false,
			approvalStatus: org.approvalStatus || "draft",
			createdAt: new Date().toISOString(), // Not in schema, use current time
			updatedAt: new Date().toISOString(), // Not in schema, use current time
		})
	}),

	// GET /organizations/current - Get current organization
	http.get(encoreUrl("/organizations/current"), async () => {
		await delay(DELAY.FAST)

		const auth = getAuthContext()
		const org =
			db.organizationSettings.findFirst((q) => q.where({ organizationId: auth.organizationId })) ||
			db.organizationSettings.findFirst()

		if (!org) {
			return encoreNotFoundResponse("Organization")
		}

		return encoreResponse({
			id: org.organizationId,
			name: org.name,
			slug: org.name.toLowerCase().replace(/\s+/g, "-"),
			logo: org.logo,
		})
	}),

	// PATCH /organizations/:id - Update organization (Encore uses PATCH, not PUT)
	http.patch(encoreUrl("/organizations/:id"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as UpdateOrgBody
		const result = updateOrganization(id, body, true)
		return result.response
	}),

	// PUT /organizations/:id - Legacy support (minimal response)
	http.put(encoreUrl("/organizations/:id"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as UpdateOrgBody
		const result = updateOrganization(id, body, false)
		return result.response
	}),

	// POST /organizations - Create organization
	http.post(encoreUrl("/organizations"), async ({ request }) => {
		const body = (await request.json()) as { name: string; logo?: string }

		const now = new Date().toISOString()
		const newOrgId = `org-${Date.now()}`

		// Create organization in database with draft status
		db.organizationSettings.create({
			organizationId: newOrgId,
			name: body.name,
			logo: body.logo || undefined,
			email: "", // Will be updated later
			approvalStatus: "draft", // Start as draft for resumable forms
		})

		const newOrg = db.organizationSettings.findFirst((q) => q.where({ organizationId: newOrgId }))

		return encoreResponse({
			id: newOrgId,
			name: body.name,
			slug: body.name.toLowerCase().replace(/\s+/g, "-"),
			logo: body.logo || undefined,
			approvalStatus: "draft",
		})
	}),

	// POST /organizations/:id/verify-gst - Verify GST number
	http.post(encoreUrl("/organizations/:id/verify-gst"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as { gstNumber: string }

		if (!body.gstNumber || body.gstNumber.length !== 15) {
			return encoreErrorResponse("Invalid GST number format", 400)
		}

		// Mock GST verification response (simulating SurePass API response)
		const stateCode = body.gstNumber.substring(0, 2)
		const stateNames: Record<string, string> = {
			"01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
			"04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana", "07": "Delhi",
			"08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "27": "Maharashtra",
			"29": "Karnataka", "32": "Kerala", "33": "Tamil Nadu", "36": "Telangana",
		}
		const gstDetails = {
			legalName: "SHIVAM GUPTA",
			tradeName: "SHARKS MARKETING",
			gstStatus: "Active",
			address: "286/1, Kanti Factory Road, Near Anjali Gas Agency, Mahatma Gandhi Nagar",
			city: "Bengaluru",
			state: stateNames[stateCode] || "Karnataka",
			stateCode: stateCode,
			pinCode: "560001",
			phone: "+91 9876543210",
			contactPerson: "Shivam Gupta",
			gstNumber: body.gstNumber,
			verifiedAt: new Date().toISOString(),
		}

		// Update organization with GST details
		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		if (org) {
			// Update organization - use findFirst + manual update pattern
			const updated = { ...org, gstNumber: body.gstNumber, gstVerified: true }
			db.organizationSettings.delete((q) => q.where({ organizationId: id }))
			db.organizationSettings.create(updated)
		}

		return encoreResponse(gstDetails)
	}),

	// POST /organizations/:id/submit-for-approval - Submit organization for approval
	http.post(encoreUrl("/organizations/:id/submit-for-approval"), async ({ params }) => {
		const { id } = params as { id: string }

		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		if (!org) {
			return encoreNotFoundResponse("Organization")
		}

		// Update organization status to pending
		// Update organization - use findFirst + manual update pattern
		const updated = { ...org, approvalStatus: "pending" as const }
		db.organizationSettings.delete((q) => q.where({ organizationId: id }))
		db.organizationSettings.create(updated)

		return encoreResponse({
			success: true,
			message: "Organization submitted for approval successfully",
		})
	}),

	// GET /organizations/:id/gst - Get GST details
	http.get(encoreUrl("/organizations/:id/gst"), async ({ params }) => {
		const { id } = params as { id: string }

		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		if (!org) {
			return encoreNotFoundResponse("Organization")
		}

		if (!org.gstNumber || !org.gstVerified) {
			return encoreErrorResponse("GST not verified for this organization", 404)
		}

		return encoreResponse({
			gstDetails: {
				legalName: org.gstNumber.substring(0, 10).toUpperCase() + " Legal",
				tradeName: org.gstNumber.substring(0, 10).toLowerCase(),
				status: "Active",
				address: "123 Business Street, City, State - 123456",
				gstNumber: org.gstNumber,
				verifiedAt: new Date().toISOString(),
			},
		})
	}),
]

