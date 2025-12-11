// Server-side data fetching for dashboard
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient } from '@/lib/encore'
import {
  mockDashboardStats,
  mockEnrollmentChartData,
  mockTopCampaigns,
  mockEnrollmentDistribution,
  mockRecentActivity,
  mockDashboardPendingEnrollments,
} from '@/lib/mocks'
import type { DashboardData } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

/**
 * Fetch dashboard data using the dedicated Encore dashboard endpoint
 */
async function fetchDashboardFromEncore(organizationId: string, days?: number): Promise<DashboardData> {
  const client = getEncoreClient()

  // Use the comprehensive dashboard endpoint
  const response = await client.organizations.getDashboardOverview(organizationId, { days })

  return {
    stats: response.stats,
    enrollmentChart: response.enrollmentChart,
    topCampaigns: response.topCampaigns,
    enrollmentDistribution: response.enrollmentDistribution,
    pendingEnrollments: response.pendingEnrollments,
  }
}

/**
 * Fetch all dashboard data in a single call.
 * This is the primary function used for both server-side prefetching and API routes.
 */
export async function getDashboardData(organizationId?: string): Promise<DashboardData> {
  if (USE_ENCORE && organizationId) {
    try {
      return await fetchDashboardFromEncore(organizationId)
    } catch (error) {
      console.error('Failed to fetch dashboard from Encore, falling back to mocks:', error)
    }
  }

  // Return mock data
  return {
    stats: mockDashboardStats,
    enrollmentChart: mockEnrollmentChartData,
    topCampaigns: mockTopCampaigns,
    enrollmentDistribution: mockEnrollmentDistribution,
    recentActivity: mockRecentActivity,
    pendingEnrollments: mockDashboardPendingEnrollments,
  }
}

// Individual getters for granular access (if needed)
export function getDashboardStats() {
  return mockDashboardStats
}

export function getEnrollmentChartData() {
  return mockEnrollmentChartData
}

export function getTopCampaigns() {
  return mockTopCampaigns
}

export function getEnrollmentDistribution() {
  return mockEnrollmentDistribution
}

export function getRecentActivity() {
  return mockRecentActivity
}
