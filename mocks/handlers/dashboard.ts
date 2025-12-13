/**
 * Dashboard API Mock Handlers - Type-Safe, DB Only
 * 
 * Intercepts Encore API calls for dashboard
 * Uses MSW Data database - NO lib/mocks
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  encoreUrl,
  encoreResponse,
} from './utils'

export const dashboardHandlers = [
  // GET /organizations/:orgId/dashboard - Get dashboard overview
  http.get(encoreUrl('/organizations/:orgId/dashboard'), async ({ params }) => {
    const rawOrgId = params.orgId as string
    const orgId = (rawOrgId === 'default' || !rawOrgId) ? '1' : rawOrgId

    // Get wallet from db
    const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
      || db.walletBalances.findFirst((q) => q.where({ organizationId: '1' }))
    
    // Get dashboard stats from db
    const dashboardStats = db.dashboardStats.findFirst((q) => q.where({ organizationId: orgId }))
      || db.dashboardStats.findFirst((q) => q.where({ organizationId: '1' }))

    // Get campaigns and enrollments from db
    const orgCampaigns = db.campaigns.findMany((q) => q.where({ organizationId: orgId }))
    const orgEnrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))

    // Stats object matching DashboardStats interface
    const stats = {
      walletBalance: wallet?.availableBalance || 0,
      heldAmount: wallet?.heldAmount || 0,
      avgDailySpend: dashboardStats?.avgDailySpend || 15000,
      lowBalanceThreshold: 50000,
      totalCampaigns: orgCampaigns.length,
      activeCampaigns: orgCampaigns.filter(c => c.status === 'active').length,
      draftCampaigns: orgCampaigns.filter(c => c.status === 'draft').length,
      pausedCampaigns: orgCampaigns.filter(c => c.status === 'paused').length,
      completedCampaigns: orgCampaigns.filter(c => c.status === 'completed').length,
      endingSoon: orgCampaigns.filter(c => {
        const endDate = new Date(c.endDate)
        return c.status === 'active' && endDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }).length,
      totalEnrollments: orgEnrollments.length,
      pendingEnrollments: orgEnrollments.filter(e => e.status === 'awaiting_review').length,
      approvedEnrollments: orgEnrollments.filter(e => e.status === 'approved').length,
      rejectedEnrollments: orgEnrollments.filter(e => e.status === 'rejected').length,
      overdueEnrollments: 0,
      highValuePending: orgEnrollments.filter(e => e.status === 'awaiting_review' && (e.orderValue || 0) >= 25000).length,
      enrollmentTrend: dashboardStats?.enrollmentTrend || 12.5,
      approvalRateTrend: dashboardStats?.approvalRateTrend || 3.2,
    }

    // EnrollmentChartDataPoint[] - generate from recent enrollments
    const recentEnrollments = orgEnrollments.filter(e => {
      const created = new Date(e.createdAt)
      return created >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    })
    
    const enrollmentChart = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayEnrollments = recentEnrollments.filter(e => 
        typeof e.createdAt === 'string' && e.createdAt.startsWith(dateStr)
      )
      
      return {
        date: dateStr,
        enrollments: dayEnrollments.length,
        approved: dayEnrollments.filter(e => e.status === 'approved').length,
        rejected: dayEnrollments.filter(e => e.status === 'rejected').length,
        pending: dayEnrollments.filter(e => e.status === 'awaiting_review').length,
      }
    })

    // TopCampaign[] format
    const activeCamps = orgCampaigns.filter(c => c.status === 'active').slice(0, 5)
    const topCampaigns = activeCamps.map(c => {
      const campaignEnrollments = orgEnrollments.filter(e => e.campaignId === c.id)
      const approvedCount = campaignEnrollments.filter(e => e.status === 'approved').length
      const totalCount = campaignEnrollments.length || 1
      const product = db.products.findFirst((q) => q.where({ id: c.productId }))
      
      return {
        id: c.id,
        name: c.title,
        productImage: product?.productImages?.[0] || null,
        enrollments: c.currentEnrollments || campaignEnrollments.length,
        approvalRate: Math.round((approvedCount / totalCount) * 100),
        status: 'active' as const,
        daysLeft: Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      }
    })

    // EnrollmentDistribution
    const enrollmentDistribution = {
      total: orgEnrollments.length,
      approved: orgEnrollments.filter(e => e.status === 'approved').length,
      rejected: orgEnrollments.filter(e => e.status === 'rejected').length,
      pending: orgEnrollments.filter(e => e.status === 'awaiting_review').length,
    }

    // PendingEnrollmentItem[]
    const pendingEnrollments = orgEnrollments
      .filter(e => e.status === 'awaiting_review')
      .slice(0, 5)
      .map(e => {
        const campaign = db.campaigns.findFirst((q) => q.where({ id: e.campaignId }))
        const product = campaign ? db.products.findFirst((q) => q.where({ id: campaign.productId })) : null
        
        return {
          id: e.id,
          orderId: e.orderId || `ORD-${e.id}`,
          orderValue: e.orderValue || 0,
          createdAt: e.createdAt,
          campaign: {
            id: e.campaignId,
            title: campaign?.title || 'Unknown Campaign',
            product: product ? {
              image: product.productImages?.[0] || null,
            } : null,
          },
          shopper: {
            id: e.shopperId,
            name: e.shopper?.displayName || 'Unknown Shopper',
          },
        }
      })

    return encoreResponse({
      stats,
      enrollmentChart,
      topCampaigns,
      enrollmentDistribution,
      pendingEnrollments,
    })
  }),
]
