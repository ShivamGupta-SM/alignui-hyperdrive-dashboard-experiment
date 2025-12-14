/**
 * Auth API Mock Handlers - DB Only
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import { encoreUrl, encoreResponse, encoreErrorResponse } from "./utils"

// Static user for auth - matches seeded organization owner
const mockUser = {
	id: "1",
	email: "rajesh@techstyle.in",
	name: "Rajesh Kumar",
	role: "user", // Regular user role
	avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh",
}

export const authHandlers = [
	// POST /auth/sign-in/email - Encore client endpoint
	http.post(encoreUrl("/auth/sign-in/email"), async ({ request }) => {
		console.log("[MSW Auth] ✅ Intercepted POST /auth/sign-in/email")
		const body = (await request.json()) as { email: string; password: string; rememberMe?: boolean }

		console.log("[MSW Auth] Request body:", { email: body.email, hasPassword: !!body.password })

		if (!body.email || !body.password) {
			console.log("[MSW Auth] ❌ Missing email or password")
			return encoreErrorResponse("Email and password are required", 400)
		}

		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		const orgs = db.organizationSettings.findMany()
		console.log("[MSW Auth] ✅ Returning mock user response")

		return encoreResponse({
			redirect: false,
			token: "mock-jwt-token",
			url: null,
			user: {
				id: mockUser.id,
				email: mockUser.email,
				name: mockUser.name,
				emailVerified: true,
				image: mockUser.avatar,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			twoFactorRedirect: false,
		})
	}),

	// POST /auth/login - Legacy endpoint (for compatibility)
	http.post(encoreUrl("/auth/login"), async ({ request }) => {
		const body = (await request.json()) as { email: string; password: string }

		if (!body.email || !body.password) {
			return encoreErrorResponse("Email and password are required", 400)
		}

		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		const orgs = db.organizationSettings.findMany()

		return encoreResponse({
			user: mockUser,
			organizations: orgs.map((o) => ({
				id: o.organizationId,
				name: o.name,
				slug: o.name.toLowerCase().replace(/\s+/g, "-"),
			})),
			token: "mock-jwt-token",
		})
	}),

	// POST /auth/sign-in/social - Encore client endpoint for social sign-in
	http.post(encoreUrl("/auth/sign-in/social"), async ({ request }) => {
		const body = (await request.json()) as { provider: string; disableRedirect?: boolean }

		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		const orgs = db.organizationSettings.findMany()

		// If redirect is disabled, return user data directly
		if (body.disableRedirect) {
			return encoreResponse({
				redirect: false,
				token: "mock-jwt-token",
				url: null,
				user: {
					id: mockUser.id,
					email: mockUser.email,
					name: mockUser.name,
					emailVerified: true,
					image: mockUser.avatar,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			})
		}

		// Otherwise, return redirect URL (for OAuth flow)
		return encoreResponse({
			redirect: true,
			url: `https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=${encodeURIComponent("http://localhost:3000/auth/callback/google")}`,
			token: null,
			user: null,
		})
	}),

	// POST /auth/logout
	http.post(encoreUrl("/auth/logout"), async () => {
		return encoreResponse({ success: true })
	}),

	// POST /auth/sign-up/email - Encore client endpoint
	http.post(encoreUrl("/auth/sign-up/email"), async ({ request }) => {
		const body = (await request.json()) as { email: string; password: string; name: string; rememberMe?: boolean }

		if (!body.email || !body.password || !body.name) {
			return encoreErrorResponse("Email, password, and name are required", 400)
		}

		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		return encoreResponse({
			token: "mock-jwt-token",
			user: {
				id: mockUser.id,
				email: body.email,
				name: body.name,
				emailVerified: false,
				image: mockUser.avatar,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		})
	}),

	// POST /auth/register - Legacy endpoint (for compatibility)
	http.post(encoreUrl("/auth/register"), async ({ request }) => {
		const body = (await request.json()) as { email: string; password: string; name: string }

		if (!body.email || !body.password || !body.name) {
			return encoreErrorResponse("Email, password, and name are required", 400)
		}

		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		return encoreResponse({
			user: { ...mockUser, email: body.email, name: body.name },
			token: "mock-jwt-token",
		})
	}),

	// GET /auth/session
	http.get(encoreUrl("/auth/session"), async () => {
		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		const orgs = db.organizationSettings.findMany()

		return encoreResponse({
			user: mockUser,
			organizations: orgs.map((o) => ({
				id: o.organizationId,
				name: o.name,
				slug: o.name.toLowerCase().replace(/\s+/g, "-"),
			})),
		})
	}),

	// GET /auth/get-session - Better Auth session endpoint (used by client.auth.me())
	http.get(encoreUrl("/auth/get-session"), async () => {
		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		const orgs = db.organizationSettings.findMany()
		const activeOrg = orgs[0] || null

		return encoreResponse({
			session: {
				id: "session-1",
				userId: mockUser.id,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				token: "mock-session-token",
				ipAddress: "127.0.0.1",
				userAgent: "Mozilla/5.0",
			},
			user: {
				id: mockUser.id,
				email: mockUser.email,
				name: mockUser.name,
				emailVerified: true,
				image: mockUser.avatar,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				activeOrganizationId: activeOrg?.organizationId || "1", // Default to org "1" (seeded org)
			},
		})
	}),

	// GET /auth/organization/list - List user's organizations
	http.get(encoreUrl("/auth/organization/list"), async () => {
		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", "1").catch(() => {
			// Ignore if already seeded
		})

		const orgs = db.organizationSettings.findMany()

		return encoreResponse({
			organizations: orgs.map((o) => ({
				id: o.organizationId,
				name: o.name,
				slug: o.name.toLowerCase().replace(/\s+/g, "-"),
				logo: o.logo,
				approvalStatus: o.approvalStatus || "draft", // Include approvalStatus for draft detection
				createdAt: new Date().toISOString(),
			})),
		})
	}),

	// POST /auth/organization/create - Create organization (Better Auth)
	http.post(encoreUrl("/auth/organization/create"), async ({ request }) => {
		const body = (await request.json()) as {
			name: string
			slug?: string
			logo?: string
			keepCurrentActiveOrganization?: boolean
		}

		if (!body.name) {
			return encoreErrorResponse("Organization name is required", 400)
		}

		const newOrgId = `org-${Date.now()}`
		const newOrg = {
			id: newOrgId,
			name: body.name,
			slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
			logo: body.logo || null,
			createdAt: new Date().toISOString(),
			members: [
				{
					id: "member-1",
					userId: mockUser.id,
					organizationId: newOrgId,
					role: "owner",
					createdAt: new Date().toISOString(),
				},
			],
		}

		// Add to mock database - ensure it's created immediately
		// Use upsert pattern to avoid duplicates
		const existing = db.organizationSettings.findFirst((q) => q.where({ organizationId: newOrgId }))
		if (!existing) {
			db.organizationSettings.create({
				organizationId: newOrgId,
				name: body.name,
				logo: body.logo || null,
				email: `${body.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
				approvalStatus: "draft", // New orgs start as draft
			})
		}

		// Verify it was created
		const created = db.organizationSettings.findFirst((q) => q.where({ organizationId: newOrgId }))
		if (!created) {
			console.error("[MSW] Failed to create organization in database:", newOrgId)
		}

		return encoreResponse(newOrg)
	}),

	// POST /auth/organization/set-active - Set active organization
	http.post(encoreUrl("/auth/organization/set-active"), async ({ request }) => {
		const body = (await request.json()) as { organizationId: string | null }

		// Ensure database is seeded
		const { seedDatabase } = await import("@/mocks/db/seed")
		await seedDatabase("full", body.organizationId || "1").catch(() => {
			// Ignore if already seeded
		})

		// In a real app, this would set a cookie or session variable
		// For mocking, we just return success
		return encoreResponse({
			success: true,
		})
	}),

	// POST /auth/refresh
	http.post(encoreUrl("/auth/refresh"), async () => {
		return encoreResponse({ token: "mock-refreshed-jwt-token" })
	}),

	// GET /shoppers/:id (shopper profile)
	http.get(encoreUrl("/shoppers/:id"), async ({ params }) => {
		const { id } = params

		// Find shopper from enrollments
		const enrollment = db.enrollments.findFirst((q) => q.where({ shopperId: id as string }))

		if (!enrollment?.shopper) {
			return encoreResponse({
				id,
				displayName: "Unknown Shopper",
				avatarUrl: null,
				previousEnrollments: 0,
				approvalRate: 0,
			})
		}

		return encoreResponse(enrollment.shopper)
	}),

	// GET /deliverables/types
	http.get(encoreUrl("/deliverables/types"), async () => {
		const types = [
			{
				id: "order_screenshot",
				name: "Order Screenshot",
				description: "Screenshot of confirmed order",
			},
			{ id: "delivery_photo", name: "Delivery Photo", description: "Photo of delivered product" },
			{ id: "product_review", name: "Product Review", description: "Written or video review" },
			{
				id: "social_media_post",
				name: "Social Media Post",
				description: "Post on social platform",
			},
			{ id: "unboxing_video", name: "Unboxing Video", description: "Video of product unboxing" },
		]

		return encoreResponse({ types })
	}),
]

