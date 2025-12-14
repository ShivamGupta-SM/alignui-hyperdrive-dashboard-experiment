/**
 * Type-safe type exports from Encore generated client
 * This file provides a single source of truth for all Encore API types
 */

// Re-export all type namespaces from the generated client
export type {
	// Admin types
	admin,
	// Auth types
	auth,
	// Campaign types
	campaigns,
	// Coupon types
	coupons,
	// Enrollment types
	enrollments,
	// Integration types
	integrations,
	// Invoice types
	invoices,
	// Notification types
	notifications,
	// Organization types
	organizations,
	// Product types
	products,
	// Shared types
	shared,
	// Shopper types
	shoppers,
	// Storage types
	storage,
	// Wallet types
	wallets,
	// Webhook types
	webhooks,
} from "./encore-client"

// Re-export error types
export type { APIError, ErrCode } from "./encore-client"
export { isAPIError } from "./encore-client"

// Re-export client types
export type { ClientOptions, BaseURL } from "./encore-client"
export { Local, Environment, PreviewEnv } from "./encore-client"
export type { default as Client } from "./encore-client"

