/**
 * Organizations API Mock Handlers - DB Only
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import { getAuthContext, encoreUrl, encoreResponse, encoreNotFoundResponse, encoreErrorResponse } from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

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

	// GET /organizations/:id - Get organization
	http.get(encoreUrl("/organizations/:id"), async ({ params }) => {
		const { id } = params as { id: string }
		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))

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

	// GET /organizations/current - Get current organization
	http.get(encoreUrl("/organizations/current"), async () => {
		await delay(DELAY.FAST)

		const auth = getAuthContext()
		const org =
			db.organizationSettings.findFirst((q) => q.where({ organizationId: auth.organizationId })) ||
			db.organizationSettings.findFirst((q) => q.where({}))

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
		const body = (await request.json()) as Record<string, unknown>

		let org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))

		// If organization doesn't exist, create it (for onboarding flow)
		// This can happen when auth.createOrganization creates it but update is called immediately
		if (!org) {
			// Create organization with basic data
			db.organizationSettings.create({
				organizationId: id,
				name: (body.name as string) || "New Organization",
				logo: (body.logo as string) || null,
			})
			org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		}

		if (!org) {
			return encoreNotFoundResponse("Organization")
		}

		// Update organization in database
		const updated = { ...org, ...body }
		db.organizationSettings.update({
			where: { organizationId: id },
			data: updated,
		})

		return encoreResponse({
			id: updated.organizationId,
			name: updated.name,
			slug: String(updated.name).toLowerCase().replace(/\s+/g, "-"),
			logo: updated.logo,
			description: (body.description as string) || null,
			website: (body.website as string) || null,
			businessType: (body.businessType as string) || null,
			industryCategory: (body.industryCategory as string) || null,
			contactPerson: (body.contactPerson as string) || null,
			phoneNumber: (body.phoneNumber as string) || null,
			address: (body.address as string) || null,
			city: (body.city as string) || null,
			state: (body.state as string) || null,
			postalCode: (body.postalCode as string) || null,
			country: (body.country as string) || "IN",
			cinNumber: (body.cinNumber as string) || null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
	}),

	// PUT /organizations/:id - Legacy support (redirects to PATCH)
	http.put(encoreUrl("/organizations/:id"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as Record<string, unknown>

		let org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))

		// If organization doesn't exist, create it (for onboarding flow)
		if (!org) {
			db.organizationSettings.create({
				organizationId: id,
				name: (body.name as string) || "New Organization",
				logo: (body.logo as string) || null,
			})
			org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		}

		if (!org) {
			return encoreNotFoundResponse("Organization")
		}

		const updated = { ...org, ...body }
		db.organizationSettings.update({
			where: { organizationId: id },
			data: updated,
		})

		return encoreResponse({
			id: updated.organizationId,
			name: updated.name,
			slug: String(updated.name).toLowerCase().replace(/\s+/g, "-"),
			logo: updated.logo,
		})
	}),

	// POST /organizations - Create organization
	http.post(encoreUrl("/organizations"), async ({ request }) => {
		const body = (await request.json()) as { name: string; logo?: string }

		const newOrg = {
			organizationId: `org-${Date.now()}`,
			name: body.name,
			logo: body.logo || null,
		}

		return encoreResponse({
			id: newOrg.organizationId,
			name: newOrg.name,
			slug: newOrg.name.toLowerCase().replace(/\s+/g, "-"),
			logo: newOrg.logo,
		})
	}),

	// POST /organizations/:id/verify-gst - Verify GST number
	http.post(encoreUrl("/organizations/:id/verify-gst"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as { gstNumber: string }

		if (!body.gstNumber || body.gstNumber.length !== 15) {
			return encoreErrorResponse("Invalid GST number format", 400)
		}

		// Mock GST verification response
		const gstDetails = {
			legalName: body.gstNumber.substring(0, 10).toUpperCase() + " Legal",
			tradeName: body.gstNumber.substring(0, 10).toLowerCase(),
			status: "Active",
			address: "123 Business Street, City, State - 123456",
			gstNumber: body.gstNumber,
			verifiedAt: new Date().toISOString(),
		}

		// Update organization with GST details
		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		if (org) {
			db.organizationSettings.update({
				where: { organizationId: id },
				data: {
					...org,
					gstNumber: body.gstNumber,
					gstVerified: true,
				},
			})
		}

		return encoreResponse(gstDetails)
	}),

	// POST /organizations/:id/verify-pan - Verify PAN number
	http.post(encoreUrl("/organizations/:id/verify-pan"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as { panNumber: string }

		if (!body.panNumber || body.panNumber.length !== 10) {
			return encoreErrorResponse("Invalid PAN number format", 400)
		}

		// Mock PAN verification response
		const panDetails = {
			panNumber: body.panNumber,
			name: body.panNumber.substring(0, 5).toUpperCase() + " NAME",
			verifiedAt: new Date().toISOString(),
		}

		// Update organization with PAN details
		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		if (org) {
			db.organizationSettings.update({
				where: { organizationId: id },
				data: {
					...org,
					panNumber: body.panNumber,
					panVerified: true,
				},
			})
		}

		return encoreResponse(panDetails)
	}),

	// POST /organizations/:id/submit-for-approval - Submit organization for approval
	http.post(encoreUrl("/organizations/:id/submit-for-approval"), async ({ params }) => {
		const { id } = params as { id: string }

		const org = db.organizationSettings.findFirst((q) => q.where({ organizationId: id }))
		if (!org) {
			return encoreNotFoundResponse("Organization")
		}

		// Update organization status to pending
		db.organizationSettings.update({
			where: { organizationId: id },
			data: {
				...org,
				approvalStatus: "pending",
			},
		})

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
