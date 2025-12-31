/**
 * Encore API Client - Unified Entry Point
 *
 * This file re-exports from the specialized client modules:
 * - Server-side: lib/api/server.ts
 * - Browser-side: lib/api/encore-browser.ts
 *
 * Architecture:
 * - brand-client.ts: Auto-generated Encore client (DO NOT EDIT)
 * - lib/api/server.ts: Server-side client factory (server-only)
 * - lib/api/encore-browser.ts: Browser client with singleton
 * - lib/api/encore-shared.ts: Base URL utilities (shared)
 * - lib/api/encore.ts: This file - unified exports
 *
 * URL-based Multi-tenancy:
 * - organizationId comes from URL path: /dashboard/[organizationId]/...
 * - Client is NOT session-scoped - auth token is for user, not org
 * - organizationId is passed explicitly to each API call
 */

// Re-export everything from brand-client for types
export {
	admin,
	auth,
	campaigns,
	coupons,
	enrollments,
	integrations,
	notifications,
	organizations,
	platforms,
	products,
	shared,
	shoppers,
	storage,
	wallets,
	webhooks,
	Local,
	Environment,
	PreviewEnv,
} from "@/brand-client"

export type { ClientOptions } from "@/brand-client"
export { default as Client } from "@/brand-client"

// Re-export shared utilities
export { getEncoreBaseUrl } from "./encore-shared"

// Note: For server-side usage, import from "@/lib/api/server"
// Note: For browser-side usage, import from "@/lib/api/encore-browser"
