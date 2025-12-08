// Centralized Mock Data for Hypedrive Dashboard
// This file consolidates all mock data used across the application

import type { 
  Campaign, 
  CampaignStatus,
  Enrollment, 
  EnrollmentStatus,
  Product, 
  Transaction, 
  ActiveHold, 
  WalletBalance,
  Organization,
  User,
  TeamMember
} from '@/lib/types'

// ==========================================
// USER & ORGANIZATION MOCKS
// ==========================================

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@company.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date(),
}

export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Nike India Pvt. Ltd.',
    slug: '@nike-india',
    logo: 'https://logo.clearbit.com/nike.com',
    status: 'approved',
    gstVerified: true,
    panVerified: true,
    creditLimit: 500000,
    billRate: 18,
    platformFee: 50,
    campaignCount: 5,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Samsung Electronics',
    slug: '@samsung-india',
    logo: 'https://logo.clearbit.com/samsung.com',
    status: 'approved',
    gstVerified: true,
    panVerified: true,
    creditLimit: 750000,
    billRate: 18,
    platformFee: 50,
    campaignCount: 3,
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date(),
  },
]

export const mockCurrentOrganization = mockOrganizations[0]

// ==========================================
// DASHBOARD STATS MOCKS
// ==========================================

export const mockDashboardStats = {
  walletBalance: 245000,
  heldAmount: 85000,
  activeCampaigns: 8,
  draftCampaigns: 3,
  pendingEnrollments: 45,
  enrollmentTrend: 12,
  monthlyPayout: 125000,
  paidEnrollments: 156,
}

export const mockEnrollmentChartData = [
  { name: 'Week 1', enrollments: 45, approved: 38 },
  { name: 'Week 2', enrollments: 52, approved: 45 },
  { name: 'Week 3', enrollments: 78, approved: 65 },
  { name: 'Week 4', enrollments: 89, approved: 78 },
]

export const mockTopCampaigns = [
  { id: '1', name: 'Nike Summer Sale', enrollments: 234, approvalRate: 92 },
  { id: '2', name: 'Samsung Galaxy Fest', enrollments: 189, approvalRate: 88 },
  { id: '3', name: 'Sony Audio Week', enrollments: 145, approvalRate: 95 },
  { id: '4', name: 'Adidas Sports', enrollments: 120, approvalRate: 91 },
  { id: '5', name: 'LG Electronics', enrollments: 98, approvalRate: 89 },
]

export const mockEnrollmentDistribution = {
  approved: 678,
  pending: 89,
  rejected: 89,
  total: 856,
}

export const mockRecentActivity = [
  { id: '1', type: 'campaign' as const, message: 'Campaign "Winter Sale" approved by admin', time: '2 hours ago', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: '2', type: 'enrollment' as const, message: '15 new enrollments received', time: 'Today', timestamp: new Date() },
  { id: '3', type: 'wallet' as const, message: '₹50,000 credited to wallet', time: 'Yesterday', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: '4', type: 'team' as const, message: 'Team member "Sarah" joined', time: '2 days ago', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
]

// ==========================================
// CAMPAIGNS MOCKS
// ==========================================

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    organizationId: '1',
    productId: '1',
    title: 'Nike Summer Sale 2024',
    description: 'Summer collection promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    submissionDeadlineDays: 45,
    maxEnrollments: 500,
    currentEnrollments: 234,
    billRate: 18,
    platformFee: 50,
    approvedCount: 198,
    rejectedCount: 24,
    pendingCount: 12,
    totalPayout: 45000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    organizationId: '1',
    productId: '2',
    title: 'New Year Special 2025',
    description: 'New year promotion',
    type: 'cashback',
    status: 'draft',
    isPublic: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
    submissionDeadlineDays: 45,
    maxEnrollments: 1000,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    organizationId: '1',
    productId: '3',
    title: 'Samsung Galaxy Fest',
    description: 'Galaxy series promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-12-15'),
    submissionDeadlineDays: 45,
    maxEnrollments: 300,
    currentEnrollments: 189,
    billRate: 18,
    platformFee: 50,
    approvedCount: 156,
    rejectedCount: 18,
    pendingCount: 15,
    totalPayout: 33000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    organizationId: '1',
    productId: '4',
    title: 'Winter Collection',
    description: 'Winter apparel promotion',
    type: 'cashback',
    status: 'pending_approval',
    isPublic: true,
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-01-15'),
    submissionDeadlineDays: 45,
    maxEnrollments: 200,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    organizationId: '1',
    productId: '5',
    title: 'Diwali Special 2024',
    description: 'Diwali promotion',
    type: 'cashback',
    status: 'completed',
    isPublic: true,
    startDate: new Date('2024-10-15'),
    endDate: new Date('2024-11-15'),
    submissionDeadlineDays: 45,
    maxEnrollments: 500,
    currentEnrollments: 456,
    billRate: 18,
    platformFee: 50,
    approvedCount: 412,
    rejectedCount: 32,
    pendingCount: 0,
    totalPayout: 85000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ==========================================
// PRODUCTS MOCKS
// ==========================================

export const mockProducts: Product[] = [
  {
    id: '1',
    organizationId: '1',
    name: 'Nike Air Max 2024',
    description: 'Latest Air Max sneakers with advanced cushioning',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'Footwear',
    platform: 'Amazon',
    productUrl: 'https://amazon.in/dp/B0123456',
    campaignCount: 3,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    organizationId: '1',
    name: 'Samsung Galaxy S24',
    description: 'Flagship smartphone with AI features',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Flipkart',
    productUrl: 'https://flipkart.com/samsung-s24',
    campaignCount: 2,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: '3',
    organizationId: '1',
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-cancelling headphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Any Platform',
    productUrl: undefined,
    campaignCount: 1,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-01'),
  },
]

// ==========================================
// ENROLLMENTS MOCKS
// ==========================================

export const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    campaignId: '1',
    shopperId: '1',
    status: 'awaiting_review',
    orderId: 'AMZ-1234567890',
    orderValue: 12999,
    orderDate: new Date('2024-12-03'),
    platform: 'Amazon',
    submissionDeadline: new Date('2025-01-19'),
    billAmount: 2340,
    platformFee: 50,
    gstAmount: 421,
    totalCost: 2811,
    shopper: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
      previousEnrollments: 5,
      approvalRate: 100,
    },
    campaign: {
      id: '1',
      title: 'Nike Summer Sale',
    } as Campaign,
    ocrData: {
      extractedOrderId: 'AMZ-1234567890',
      extractedAmount: 12999,
      confidence: 95,
      isVerified: true,
    },
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '2',
    campaignId: '1',
    shopperId: '2',
    status: 'awaiting_review',
    orderId: 'FLK-9876543210',
    orderValue: 8499,
    orderDate: new Date('2024-12-04'),
    platform: 'Flipkart',
    submissionDeadline: new Date('2025-01-20'),
    billAmount: 1530,
    platformFee: 50,
    gstAmount: 275,
    totalCost: 1855,
    shopper: {
      id: '2',
      name: 'Sarah K.',
      email: 'sarah@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahK',
      previousEnrollments: 3,
      approvalRate: 100,
    },
    campaign: {
      id: '1',
      title: 'Nike Summer Sale',
    } as Campaign,
    ocrData: {
      extractedOrderId: 'FLK-9876543210',
      extractedAmount: 8499,
      confidence: 92,
      isVerified: true,
    },
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '3',
    campaignId: '2',
    shopperId: '3',
    status: 'approved',
    orderId: 'AMZ-5678901234',
    orderValue: 15999,
    orderDate: new Date('2024-12-01'),
    platform: 'Amazon',
    submissionDeadline: new Date('2025-01-16'),
    billAmount: 2880,
    platformFee: 50,
    gstAmount: 518,
    totalCost: 3448,
    shopper: {
      id: '3',
      name: 'Mike R.',
      email: 'mike@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MikeR',
      previousEnrollments: 8,
      approvalRate: 87,
    },
    campaign: {
      id: '2',
      title: 'Samsung Galaxy Fest',
    } as Campaign,
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date('2024-12-04'),
  },
  {
    id: '4',
    campaignId: '1',
    shopperId: '4',
    status: 'changes_requested',
    orderId: 'AMZ-2345678901',
    orderValue: 9999,
    orderDate: new Date('2024-12-02'),
    platform: 'Amazon',
    submissionDeadline: new Date('2025-01-18'),
    billAmount: 1800,
    platformFee: 50,
    gstAmount: 324,
    totalCost: 2174,
    shopper: {
      id: '4',
      name: 'Emily T.',
      email: 'emily@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyT',
      previousEnrollments: 2,
      approvalRate: 50,
    },
    campaign: {
      id: '1',
      title: 'Nike Summer Sale',
    } as Campaign,
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '5',
    campaignId: '1',
    shopperId: '5',
    status: 'rejected',
    orderId: 'FLK-3456789012',
    orderValue: 6999,
    orderDate: new Date('2024-11-30'),
    platform: 'Flipkart',
    submissionDeadline: new Date('2025-01-15'),
    billAmount: 1260,
    platformFee: 50,
    gstAmount: 227,
    totalCost: 1537,
    shopper: {
      id: '5',
      name: 'Anna W.',
      email: 'anna@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnnaW',
      previousEnrollments: 1,
      approvalRate: 0,
    },
    campaign: {
      id: '1',
      title: 'Nike Summer Sale',
    } as Campaign,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-03'),
  },
]

export const mockPendingEnrollments = mockEnrollments.filter(e => e.status === 'awaiting_review')

// ==========================================
// WALLET MOCKS
// ==========================================

export const mockWalletBalance: WalletBalance = {
  availableBalance: 245000,
  heldAmount: 85000,
  creditLimit: 500000,
  creditUtilized: 170000,
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    organizationId: '1',
    type: 'hold_created',
    amount: 2500,
    description: 'Hold for Enrollment #E-123',
    enrollmentId: 'E-123',
    createdAt: new Date('2024-12-05T10:30:00'),
  },
  {
    id: '2',
    organizationId: '1',
    type: 'hold_committed',
    amount: 1800,
    description: 'Approved Enrollment #E-119',
    enrollmentId: 'E-119',
    createdAt: new Date('2024-12-05T09:15:00'),
  },
  {
    id: '3',
    organizationId: '1',
    type: 'credit',
    amount: 50000,
    description: 'Manual funding via bank transfer',
    reference: 'TXN-123456',
    createdAt: new Date('2024-12-04T14:00:00'),
  },
  {
    id: '4',
    organizationId: '1',
    type: 'hold_voided',
    amount: 2200,
    description: 'Rejected Enrollment #E-115',
    enrollmentId: 'E-115',
    createdAt: new Date('2024-12-04T11:30:00'),
  },
  {
    id: '5',
    organizationId: '1',
    type: 'hold_created',
    amount: 3100,
    description: 'Hold for Enrollment #E-118',
    enrollmentId: 'E-118',
    createdAt: new Date('2024-12-03T16:45:00'),
  },
]

export const mockActiveHolds: ActiveHold[] = [
  {
    campaignId: '1',
    campaignName: 'Nike Summer Sale',
    enrollmentCount: 24,
    holdAmount: 52000,
  },
  {
    campaignId: '2',
    campaignName: 'Samsung Galaxy Fest',
    enrollmentCount: 18,
    holdAmount: 33000,
  },
]

// ==========================================
// TEAM MOCKS
// ==========================================

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'owner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    organizationId: '1',
    joinedAt: new Date('2023-01-15'),
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    organizationId: '1',
    joinedAt: new Date('2023-03-20'),
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'viewer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    organizationId: '1',
    joinedAt: new Date('2023-06-10'),
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date(),
  },
]

// ==========================================
// SETTINGS MOCKS
// ==========================================

export const mockOrganizationSettings = {
  name: 'Nike India Pvt. Ltd.',
  slug: '@nike-india',
  website: 'https://www.nike.com/in',
  logo: 'https://logo.clearbit.com/nike.com',
}

export const mockBankAccounts = [
  {
    id: '1',
    bankName: 'HDFC Bank',
    accountNumber: '****1234',
    accountHolder: 'Nike India Pvt. Ltd.',
    ifscCode: 'HDFC0001234',
    isDefault: true,
    isVerified: true,
  },
  {
    id: '2',
    bankName: 'ICICI Bank',
    accountNumber: '****5678',
    accountHolder: 'Nike India Pvt. Ltd.',
    ifscCode: 'ICIC0005678',
    isDefault: false,
    isVerified: true,
  },
]

export const mockGstDetails = {
  gstNumber: '27AAACN1234A1Z5',
  legalName: 'Nike India Private Limited',
  tradeName: 'Nike India',
  state: 'Maharashtra',
  isVerified: true,
}

// ==========================================
// PROFILE MOCKS
// ==========================================

export const mockSessions = [
  {
    id: '1',
    device: 'Windows • Chrome',
    iconType: 'computer' as const,
    ip: '103.21.xxx.xxx',
    location: 'Mumbai, India',
    lastActive: 'Just now',
    signedIn: 'Dec 5, 2024 at 9:30 AM',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone • Safari',
    iconType: 'smartphone' as const,
    ip: '103.21.xxx.xxx',
    location: 'Mumbai, India',
    lastActive: '2 hours ago',
    signedIn: 'Dec 4, 2024 at 3:45 PM',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'MacOS • Firefox',
    iconType: 'mac' as const,
    ip: '49.36.xxx.xxx',
    location: 'Bengaluru, India',
    lastActive: '1 day ago',
    signedIn: 'Dec 3, 2024 at 10:15 AM',
    isCurrent: false,
  },
]
