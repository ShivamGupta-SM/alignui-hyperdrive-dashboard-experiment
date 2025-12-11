import {
  mockDashboardStatsByOrg,
  mockEnrollmentChartDataByOrg,
  mockTopCampaignsByOrg,
  mockRecentActivityByOrg,
  mockEnrollments,
  mockCampaigns,
  mockWalletBalanceByOrg,
} from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { THRESHOLDS, DURATIONS } from '@/lib/types/constants'

// Calculate stats dynamically from actual mock data
function calculateDashboardStats(orgId: string) {
  // Get enrollments for this org
  const orgEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)
  const orgCampaigns = mockCampaigns.filter(c => c.organizationId === orgId)
  const wallet = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

  // Count enrollments by status
  const pendingEnrollments = orgEnrollments.filter(e => e.status === 'awaiting_review').length
  const approvedEnrollments = orgEnrollments.filter(e => e.status === 'approved').length
  const rejectedEnrollments = orgEnrollments.filter(e => e.status === 'rejected').length

  // Count overdue enrollments (awaiting_review for more than threshold hours)
  const overdueThreshold = new Date(Date.now() - THRESHOLDS.ENROLLMENT_OVERDUE_HOURS * 60 * 60 * 1000)
  const overdueEnrollments = orgEnrollments.filter(
    e => e.status === 'awaiting_review' && new Date(e.createdAt) < overdueThreshold
  ).length

  // Count high value pending (using bill amount > median as "high value")
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

  // Get base stats for wallet info (these are intentionally mock values for wallet)
  const baseStats = mockDashboardStatsByOrg[orgId] || mockDashboardStatsByOrg['1']

  return {
    // Wallet stats (keep these as mock data since wallet balance is separate)
    walletBalance: wallet.availableBalance,
    heldAmount: wallet.heldAmount,
    avgDailySpend: baseStats.avgDailySpend,
    lowBalanceThreshold: THRESHOLDS.LOW_BALANCE_WARNING,
    // Campaign stats (calculated dynamically)
    totalCampaigns: orgCampaigns.length,
    activeCampaigns,
    draftCampaigns,
    pausedCampaigns,
    completedCampaigns,
    endingSoon,
    // Enrollment stats (calculated dynamically)
    totalEnrollments: orgEnrollments.length,
    pendingEnrollments,
    approvedEnrollments,
    rejectedEnrollments,
    overdueEnrollments,
    highValuePending,
    // Trends (keep as mock data - would come from time-series analysis in production)
    enrollmentTrend: baseStats.enrollmentTrend,
    approvalRateTrend: baseStats.approvalRateTrend,
  }
}

// Calculate enrollment distribution dynamically
function calculateEnrollmentDistribution(orgId: string) {
  const orgEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)

  return {
    total: orgEnrollments.length,
    approved: orgEnrollments.filter(e => e.status === 'approved').length,
    rejected: orgEnrollments.filter(e => e.status === 'rejected').length,
    pending: orgEnrollments.filter(e => e.status === 'awaiting_review').length,
  }
}

export async function GET() {
  try {
    // Authenticate request
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.STANDARD)

    const orgId = auth.context.organizationId

    // Calculate stats dynamically from actual mock data
    const stats = calculateDashboardStats(orgId)
    const enrollmentDistribution = calculateEnrollmentDistribution(orgId)

    // Get organization-specific data with fallback to org '1'
    const enrollmentChart = mockEnrollmentChartDataByOrg[orgId] || mockEnrollmentChartDataByOrg['1']
    const topCampaigns = mockTopCampaignsByOrg[orgId] || mockTopCampaignsByOrg['1']
    const recentActivity = mockRecentActivityByOrg[orgId] || mockRecentActivityByOrg['1']

    // Filter pending enrollments by organization
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
  } catch (error) {
    console.error('Dashboard GET error:', error)
    return serverErrorResponse('Failed to fetch dashboard data')
  }
}
