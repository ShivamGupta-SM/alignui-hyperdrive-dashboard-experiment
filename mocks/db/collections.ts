/**
 * MSW Data Collections
 *
 * Uses @msw/data with Zod schemas for type-safe, reactive data management.
 * Includes IndexedDB persistence for data to survive page refreshes.
 */

import { Collection } from "@msw/data"
import { persist } from "@msw/data/extensions/persist"
import {
	CampaignSchema,
	CampaignDeliverableSchema,
	EnrollmentSchema,
	ProductSchema,
	InvoiceSchema,
	TransactionSchema,
	WalletBalanceSchema,
	ActiveHoldSchema,
	TeamMemberSchema,
	InvitationSchema,
	NotificationSchema,
	CategorySchema,
	PlatformSchema,
	OrganizationSettingsSchema,
	BankAccountSchema,
	GstDetailsSchema,
	DashboardStatsSchema,
	RecentActivitySchema,
	DeliverableSubmissionSchema,
	DeliverableSchema,
	WithdrawalSchema,
	WithdrawalMethodSchema,
} from "./schemas"

// =============================================================================
// COLLECTION INSTANCES WITH PERSISTENCE
// =============================================================================

/**
 * Campaigns Collection
 */
export const campaigns = new Collection({
	schema: CampaignSchema,
	extensions: [persist()],
})

/**
 * Campaign Deliverables Collection
 */
export const campaignDeliverables = new Collection({
	schema: CampaignDeliverableSchema,
	extensions: [persist()],
})

/**
 * Enrollments Collection
 */
export const enrollments = new Collection({
	schema: EnrollmentSchema,
	extensions: [persist()],
})

/**
 * Products Collection
 */
export const products = new Collection({
	schema: ProductSchema,
	extensions: [persist()],
})

/**
 * Invoices Collection
 */
export const invoices = new Collection({
	schema: InvoiceSchema,
	extensions: [persist()],
})

/**
 * Transactions Collection
 */
export const transactions = new Collection({
	schema: TransactionSchema,
	extensions: [persist()],
})

/**
 * Wallet Balances Collection (one per org)
 */
export const walletBalances = new Collection({
	schema: WalletBalanceSchema,
	extensions: [persist()],
})

/**
 * Active Holds Collection
 */
export const activeHolds = new Collection({
	schema: ActiveHoldSchema,
	extensions: [persist()],
})

/**
 * Team Members Collection
 */
export const teamMembers = new Collection({
	schema: TeamMemberSchema,
	extensions: [persist()],
})

/**
 * Invitations Collection
 */
export const invitations = new Collection({
	schema: InvitationSchema,
	extensions: [persist()],
})

/**
 * Notifications Collection
 */
export const notifications = new Collection({
	schema: NotificationSchema,
	extensions: [persist()],
})

/**
 * Categories Collection
 */
export const categories = new Collection({
	schema: CategorySchema,
	extensions: [persist()],
})

/**
 * Platforms Collection
 */
export const platforms = new Collection({
	schema: PlatformSchema,
	extensions: [persist()],
})

/**
 * Organization Settings Collection
 */
export const organizationSettings = new Collection({
	schema: OrganizationSettingsSchema,
	extensions: [persist()],
})

/**
 * Bank Accounts Collection
 */
export const bankAccounts = new Collection({
	schema: BankAccountSchema,
	extensions: [persist()],
})

/**
 * GST Details Collection
 */
export const gstDetails = new Collection({
	schema: GstDetailsSchema,
	extensions: [persist()],
})

/**
 * Dashboard Stats Collection (cached per org)
 */
export const dashboardStats = new Collection({
	schema: DashboardStatsSchema,
	extensions: [persist()],
})

/**
 * Recent Activity Collection
 */
export const recentActivity = new Collection({
	schema: RecentActivitySchema,
	extensions: [persist()],
})

/**
 * Deliverable Submissions Collection
 */
export const deliverableSubmissions = new Collection({
	schema: DeliverableSubmissionSchema,
	extensions: [persist()],
})

/**
 * Deliverables (Base) Collection
 */
export const deliverables = new Collection({
	schema: DeliverableSchema,
	extensions: [persist()],
})

/**
 * Withdrawals Collection
 */
export const withdrawals = new Collection({
	schema: WithdrawalSchema,
	extensions: [persist()],
})

/**
 * Withdrawal Methods Collection
 */
export const withdrawalMethods = new Collection({
	schema: WithdrawalMethodSchema,
	extensions: [persist()],
})

// =============================================================================
// DATABASE OBJECT
// =============================================================================

/**
 * Main database object containing all collections
 *
 * Usage:
 * ```ts
 * import { db } from '@/mocks/db'
 *
 * // Query data
 * const campaigns = db.campaigns.findMany()
 * const enrollment = db.enrollments.findFirst((q) => q.where({ id: '123' }))
 *
 * // Create data
 * db.products.create({ name: 'Product', ... })
 *
 * // Update data
 * db.campaigns.update({ where: { id: '123' }, data: { status: 'active' } })
 *
 * // Delete data
 * db.enrollments.delete({ where: { id: '123' } })
 * ```
 */
export const db = {
	// Campaign Management
	campaigns,
	campaignDeliverables,
	deliverables, // Base deliverable definitions

	// Enrollment Management
	enrollments,
	deliverableSubmissions, // Deliverable submissions for enrollments

	// Product Management
	products,
	categories,
	platforms,

	// Financial
	invoices,
	transactions,
	walletBalances,
	activeHolds,
	withdrawals, // Withdrawal requests
	withdrawalMethods, // Withdrawal methods (bank, UPI, wallet)

	// Organization & Team
	organizationSettings,
	teamMembers,
	invitations,
	bankAccounts,
	gstDetails,

	// Analytics & Activity
	dashboardStats,
	recentActivity,

	// Notifications
	notifications,
}

/**
 * TypeScript type for the database object
 * Use this for type-safe database access
 */
export type Database = typeof db
