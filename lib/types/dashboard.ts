// Dashboard Types
// Re-export from Encore (source of truth) for backwards compatibility

import type { organizations } from "@/brand-client"

// Re-export Encore types as source of truth
export type DashboardOverviewResponse = organizations.DashboardOverviewResponse
export type DashboardStats = organizations.DashboardStats
export type TopCampaign = organizations.TopCampaign
export type PendingEnrollmentItem = organizations.PendingEnrollmentItem
export type EnrollmentChartDataPoint = organizations.EnrollmentChartDataPoint
export type EnrollmentDistribution = organizations.EnrollmentDistribution

// Alias for backwards compatibility
export type EnrollmentChartData = EnrollmentChartDataPoint

// Frontend-only type for activity feed (not in backend yet)
export interface RecentActivity {
	id: string
	type: "campaign" | "enrollment" | "wallet" | "team"
	message: string
	time: string
	timestamp: Date
}

// Composite type for dashboard data (matches DashboardOverviewResponse)
export type DashboardData = DashboardOverviewResponse & {
	recentActivity?: RecentActivity[]
}
