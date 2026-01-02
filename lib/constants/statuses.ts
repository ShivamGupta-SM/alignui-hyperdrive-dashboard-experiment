/**
 * Status Configurations
 *
 * Centralized status arrays, configs, and helper functions.
 */

import type { OrganizationStatus, BusinessType, IndustryCategory } from "@/features/organizations/types"
import type { CampaignStatus, CampaignType, DeliverableType } from "@/features/campaigns/types"
import type { EnrollmentStatus } from "@/features/enrollments/types"
import type { InvoiceStatus } from "@/features/invoices/types"
import type { UserRole } from "@/features/team/types"
import type { TransactionType } from "@/features/wallet/types"

// ============================================================================
// STATUS ARRAYS (for validation & filtering)
// ============================================================================

export const CAMPAIGN_STATUSES = [
	"draft",
	"pending_approval",
	"rejected",
	"approved",
	"active",
	"paused",
	"ended",
	"expired",
	"completed",
	"cancelled",
	"archived",
] as const satisfies readonly CampaignStatus[]

export const ENROLLMENT_STATUSES = [
	"awaiting_submission",
	"awaiting_review",
	"changes_requested",
	"approved",
	"permanently_rejected",
	"withdrawn",
	"expired",
] as const satisfies readonly EnrollmentStatus[]

export const INVOICE_STATUSES = [
	"draft",
	"sent",
	"viewed",
	"paid",
	"overdue",
	"cancelled",
	"unpaid",
	"partially_paid",
] as const satisfies readonly InvoiceStatus[]

export const ORGANIZATION_STATUSES = [
	"draft",
	"pending",
	"approved",
	"rejected",
	"banned",
] as const satisfies readonly OrganizationStatus[]

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

export const ORGANIZATION_STATUS_CONFIG: Record<
	OrganizationStatus,
	{ label: string; color: "yellow" | "green" | "red" | "gray"; description: string }
> = {
	draft: { label: "Draft", color: "gray", description: "Not yet submitted" },
	pending: { label: "Pending Approval", color: "yellow", description: "Awaiting admin review" },
	approved: { label: "Active", color: "green", description: "Fully operational" },
	rejected: { label: "Rejected", color: "red", description: "Application rejected" },
	banned: { label: "Banned", color: "red", description: "Account banned" },
}

export const CAMPAIGN_STATUS_CONFIG: Record<
	CampaignStatus,
	{
		label: string
		color: "yellow" | "orange" | "blue" | "green" | "gray" | "red"
		iconName: string
		description: string
		footerMessage: string
		footerColor: string
	}
> = {
	draft: { label: "Draft", color: "yellow", iconName: "draft", description: "Being edited", footerMessage: "Complete setup to launch", footerColor: "text-warning-base" },
	pending_approval: { label: "Pending Approval", color: "orange", iconName: "pending", description: "Awaiting admin review", footerMessage: "Under review", footerColor: "text-information-base" },
	rejected: { label: "Rejected", color: "red", iconName: "rejected", description: "Rejected by admin", footerMessage: "Rejected - review feedback", footerColor: "text-error-base" },
	approved: { label: "Approved", color: "blue", iconName: "approved", description: "Ready to activate", footerMessage: "Ready to activate", footerColor: "text-information-base" },
	active: { label: "Active", color: "green", iconName: "active", description: "Live and accepting enrollments", footerMessage: "Accepting enrollments", footerColor: "text-success-base" },
	paused: { label: "Paused", color: "gray", iconName: "paused", description: "Temporarily stopped", footerMessage: "Paused", footerColor: "text-text-soft-400" },
	ended: { label: "Ended", color: "gray", iconName: "ended", description: "Campaign period ended", footerMessage: "Campaign ended", footerColor: "text-text-sub-600" },
	expired: { label: "Expired", color: "gray", iconName: "expired", description: "Past end date without completion", footerMessage: "Expired", footerColor: "text-text-soft-400" },
	completed: { label: "Completed", color: "green", iconName: "completed", description: "Successfully completed", footerMessage: "Campaign ended", footerColor: "text-text-sub-600" },
	cancelled: { label: "Cancelled", color: "red", iconName: "cancelled", description: "Cancelled before completion", footerMessage: "Cancelled", footerColor: "text-error-base" },
	archived: { label: "Archived", color: "gray", iconName: "archived", description: "Historical record", footerMessage: "Archived", footerColor: "text-text-soft-400" },
}

export const ENROLLMENT_STATUS_CONFIG: Record<
	EnrollmentStatus,
	{ label: string; color: "yellow" | "blue" | "orange" | "green" | "red" | "gray"; description: string }
> = {
	awaiting_submission: { label: "Awaiting Submission", color: "yellow", description: "Waiting for proofs" },
	awaiting_review: { label: "Awaiting Review", color: "blue", description: "Ready for brand review" },
	changes_requested: { label: "Changes Requested", color: "orange", description: "Needs shopper action" },
	approved: { label: "Approved", color: "green", description: "Approved for payout" },
	permanently_rejected: { label: "Permanently Rejected", color: "red", description: "Permanently rejected" },
	withdrawn: { label: "Withdrawn", color: "gray", description: "Shopper withdrew" },
	expired: { label: "Expired", color: "gray", description: "Deadline passed" },
}

export const INVOICE_STATUS_CONFIG: Record<
	InvoiceStatus,
	{ label: string; color: "yellow" | "green" | "red" | "gray" | "blue" | "orange" }
> = {
	draft: { label: "Draft", color: "gray" },
	sent: { label: "Sent", color: "blue" },
	viewed: { label: "Viewed", color: "blue" },
	paid: { label: "Paid", color: "green" },
	overdue: { label: "Overdue", color: "red" },
	cancelled: { label: "Cancelled", color: "gray" },
	unpaid: { label: "Unpaid", color: "yellow" },
	partially_paid: { label: "Partially Paid", color: "orange" },
}

export const TRANSACTION_TYPE_CONFIG: Record<
	TransactionType,
	{ label: string; color: "green" | "red" | "blue" | "gray"; sign: "+" | "-" | "" }
> = {
	credit: { label: "Credit", color: "green", sign: "+" },
	debit: { label: "Debit", color: "red", sign: "-" },
	hold: { label: "Hold Created", color: "red", sign: "-" },
	release: { label: "Hold Released", color: "green", sign: "+" },
	hold_committed: { label: "Hold Committed", color: "red", sign: "-" },
}

// ============================================================================
// STATUS FILTER TABS
// ============================================================================

export const CAMPAIGN_STATUS_TABS = [
	{ value: "all", label: "All" },
	{ value: "draft", label: "Draft" },
	{ value: "pending_approval", label: "Pending" },
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
] as const

export const ENROLLMENT_STATUS_TABS = [
	{ value: "all", label: "All" },
	{ value: "awaiting_review", label: "Pending" },
	{ value: "changes_requested", label: "Changes" },
	{ value: "approved", label: "Approved" },
	{ value: "permanently_rejected", label: "Rejected" },
] as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEnrollmentBadgeStatus(
	status: EnrollmentStatus
): "warning" | "info" | "success" | "error" | "default" {
	const statusMap: Record<EnrollmentStatus, "warning" | "info" | "success" | "error" | "default"> = {
		awaiting_submission: "warning",
		awaiting_review: "info",
		changes_requested: "warning",
		approved: "success",
		permanently_rejected: "error",
		withdrawn: "default",
		expired: "default",
	}
	return statusMap[status] ?? "default"
}

export function getEnrollmentStatusBadgeStatus(
	status: EnrollmentStatus
): "completed" | "pending" | "failed" | "disabled" {
	switch (status) {
		case "approved":
			return "completed"
		case "awaiting_review":
		case "awaiting_submission":
		case "changes_requested":
			return "pending"
		case "permanently_rejected":
		case "withdrawn":
		case "expired":
			return "failed"
		default:
			return "disabled"
	}
}

export function getCampaignStatusBadgeStatus(
	status: CampaignStatus
): "completed" | "pending" | "failed" | "disabled" {
	switch (status) {
		case "active":
		case "completed":
			return "completed"
		case "draft":
		case "pending_approval":
		case "approved":
			return "pending"
		case "rejected":
		case "cancelled":
			return "failed"
		case "paused":
		case "ended":
		case "expired":
		case "archived":
			return "disabled"
		default:
			return "disabled"
	}
}

export function getEnrollmentStatusLabel(status: EnrollmentStatus): string {
	return ENROLLMENT_STATUS_CONFIG[status]?.label ?? status
}

export function getCampaignStatusLabel(status: CampaignStatus): string {
	return CAMPAIGN_STATUS_CONFIG[status]?.label ?? status
}

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

export const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
	{ value: "owner", label: "Owner", description: "Full access, cannot be removed" },
	{ value: "admin", label: "Admin", description: "Manage campaigns, enrollments, wallet, team" },
	{ value: "manager", label: "Manager", description: "Manage campaigns and review enrollments" },
	{ value: "viewer", label: "Viewer", description: "View-only access to dashboard" },
]

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
	{ value: "proprietorship", label: "Sole Proprietorship" },
	{ value: "partnership", label: "Partnership" },
	{ value: "llp", label: "LLP" },
	{ value: "pvt_ltd", label: "Private Limited" },
	{ value: "public_ltd", label: "Public Limited" },
	{ value: "trust", label: "Trust" },
	{ value: "society", label: "Society" },
	{ value: "other", label: "Other" },
]

export const INDUSTRY_CATEGORY_OPTIONS: { value: IndustryCategory; label: string }[] = [
	{ value: "electronics", label: "Electronics" },
	{ value: "fashion", label: "Fashion & Apparel" },
	{ value: "fmcg", label: "FMCG" },
	{ value: "beauty", label: "Beauty & Personal Care" },
	{ value: "home_appliances", label: "Home Appliances" },
	{ value: "sports", label: "Sports & Fitness" },
	{ value: "automotive", label: "Automotive" },
	{ value: "other", label: "Other" },
]

export const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType; label: string; description: string }[] = [
	{ value: "cashback", label: "Cashback", description: "Shoppers receive cashback on purchase" },
	{ value: "barter", label: "Barter", description: "Product exchange for content" },
	{ value: "hybrid", label: "Hybrid", description: "Combination of cashback and barter" },
]

export const DELIVERABLE_TYPE_OPTIONS: { value: DeliverableType; label: string; description: string }[] = [
	{ value: "order_screenshot", label: "Order Screenshot", description: "Screenshot of order confirmation" },
	{ value: "delivery_photo", label: "Delivery Photo", description: "Photo of received product" },
	{ value: "product_review", label: "Product Review", description: "Written review on platform" },
	{ value: "social_media_post", label: "Social Media Post", description: "Post on social media" },
	{ value: "unboxing_video", label: "Unboxing Video", description: "Video of product unboxing" },
	{ value: "custom", label: "Custom", description: "Custom deliverable" },
]

export const REJECTION_REASONS = [
	{ id: "fraudulent_screenshot", label: "Fraudulent order screenshot" },
	{ id: "wrong_platform", label: "Order not from approved platform" },
	{ id: "value_mismatch", label: "Order value mismatch" },
	{ id: "fake_review", label: "Fake/plagiarized review" },
	{ id: "wrong_date", label: "Order date outside campaign period" },
	{ id: "max_rejections", label: "Exceeded maximum rejection attempts" },
	{ id: "other", label: "Other" },
]
