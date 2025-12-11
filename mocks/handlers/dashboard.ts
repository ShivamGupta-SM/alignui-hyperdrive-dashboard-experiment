/**
 * Dashboard API Mock Handlers
 */

import { http } from 'msw'
import {
  mockEnrollments,
  mockCampaigns,
  mockWalletBalanceByOrg,
  mockDashboardStatsByOrg,
  mockEnrollmentChartDataByOrg,
  mockTopCampaignsByOrg,
  mockRecentActivityByOrg,
} from '@/lib/mocks'
import { THRESHOLDS, DURATIONS } from '@/lib/types/constants'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
} from './utils'

// Calculate stats dynamically from actual mock data
function calculateDashboardStats(orgId: string) {
  const orgEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)
  const orgCampaigns = mockCampaigns.filter(c => c.organizationId === orgId)
  const wallet = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

  // Count enrollments by status
  const pendingEnrollments = orgEnrollments.filter(e => e.status === 'awaiting_review').length
  const approvedEnrollments = orgEnrollments.filter(e => e.status === 'approved').length
  const rejectedEnrollments = orgEnrollments.filter(e => e.status === 'rejected').length

  // Count overdue enrollments
  const overdueThreshold = new Date(Date.now() - THRESHOLDS.ENROLLMENT_OVERDUE_HOURS * 60 * 60 * 1000)
  const overdueEnrollments = orgEnrollments.filter(
    e => e.status === 'awaiting_review' && new Date(e.createdAt) < overdueThreshold
  ).length

  // Count high value pending
  const pendingWithBills = orgEnrollments.filter(e => e.status === 'awaiting_review' && e.billAmount)
  const highValuePending = pendingWithBills.filter(e => (e.billAmount || 0) > 5000).length

  // Count campaigns by status
  const activeCampaigns = orgCampaigns.filter(c => c.status === 'active').length
  const draftCampaigns = orgCampaigns.filter(c => c.status === 'draft').length
  const pausedCampaigns = orgCampaigns.filter(c => c.status === 'paused').length
  const completedCampaigns = orgCampaigns.filter(c => c.status === 'completed').length

  // Count campaigns ending soon
  const endingSoonThreshold = new Date(Date.now() + DURATIONS.CAMPAIGN_ENDING_SOON_DAYS * 24 * 60 * 60 * 1000)
  const endingSoon = orgCampaigns.filter(
    c => c.status === 'active' && new Date(c.endDate) <= endingSoonThreshold
  ).length

  const baseStats = mockDashboardStatsByOrg[orgId] || mockDashboardStatsByOrg['1']

  return {
    walletBalance: wallet.availableBalance,
    heldAmount: wallet.heldAmount,
    avgDailySpend: baseStats.avgDailySpend,
    lowBalanceThreshold: THRESHOLDS.LOW_BALANCE_WARNING,
    totalCampaigns: orgCampaigns.length,
    activeCampaigns,
    draftCampaigns,
    pausedCampaigns,
    completedCampaigns,
    endingSoon,
    totalEnrollments: orgEnrollments.length,
    pendingEnrollments,
    approvedEnrollments,
    rejectedEnrollments,
    overdueEnrollments,
    highValuePending,
    enrollmentTrend: baseStats.enrollmentTrend,
    approvalRateTrend: baseStats.approvalRateTrend,
  }
}

function calculateEnrollmentDistribution(orgId: string) {
  const orgEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)

  return {
    total: orgEnrollments.length,
    approved: orgEnrollments.filter(e => e.status === 'approved').length,
    rejected: orgEnrollments.filter(e => e.status === 'rejected').length,
    pending: orgEnrollments.filter(e => e.status === 'awaiting_review').length,
  }
}

export const dashboardHandlers = [
  // GET /api/dashboard
  http.get('/api/dashboard', async () => {
    await delay(DELAY.STANDARD)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const stats = calculateDashboardStats(orgId)
    const enrollmentDistribution = calculateEnrollmentDistribution(orgId)
    const enrollmentChart = mockEnrollmentChartDataByOrg[orgId] || mockEnrollmentChartDataByOrg['1']
    const topCampaigns = mockTopCampaignsByOrg[orgId] || mockTopCampaignsByOrg['1']
    const recentActivity = mockRecentActivityByOrg[orgId] || mockRecentActivityByOrg['1']

    const pendingEnrollments = mockEnrollments
      .filter(e => e.organizationId === orgId && e.status === 'awaiting_review')
      .slice(0, 3)

    return successResponse({
      stats,
      enrollmentChart,
      topCampaigns,
      enrollmentDistribution,
      recentActivity,
      pendingEnrollments,
    })
  }),
]
