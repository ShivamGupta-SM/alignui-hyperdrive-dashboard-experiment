// Dashboard Types

export interface DashboardStats {
  // Wallet
  walletBalance: number
  heldAmount: number
  avgDailySpend: number
  lowBalanceThreshold: number
  // Campaigns
  totalCampaigns: number
  activeCampaigns: number
  draftCampaigns: number
  pausedCampaigns: number
  completedCampaigns: number
  endingSoon: number
  // Enrollments
  totalEnrollments: number
  pendingEnrollments: number
  approvedEnrollments: number
  rejectedEnrollments: number
  overdueEnrollments: number
  highValuePending: number
  // Trends
  enrollmentTrend: number
  approvalRateTrend: number
}

export interface EnrollmentChartData {
  date: string
  enrollments: number
  approved: number
  rejected: number
  pending: number
}

export interface TopCampaign {
  id: string
  name: string
  productImage: string | null
  enrollments: number
  approvalRate: number
  status: 'active' | 'ending' | 'paused'
  daysLeft: number
}

export interface EnrollmentDistribution {
  total: number
  approved: number
  rejected: number
  pending: number
}

export interface PendingEnrollmentItem {
  id: string
  orderId: string
  orderValue: number
  createdAt: string
  campaign: {
    id: string
    title: string
    product: {
      image: string | null
    } | null
  }
  shopper: {
    id: string
    name: string
  }
}

export interface RecentActivity {
  id: string
  type: 'campaign' | 'enrollment' | 'wallet' | 'team'
  message: string
  time: string
  timestamp: Date
}

export interface DashboardData {
  stats: DashboardStats
  enrollmentChart: EnrollmentChartData[]
  topCampaigns: TopCampaign[]
  enrollmentDistribution: EnrollmentDistribution
  pendingEnrollments: PendingEnrollmentItem[]
  recentActivity?: RecentActivity[]
}
