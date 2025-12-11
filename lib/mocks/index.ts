// Centralized Mock Data for Hypedrive Dashboard
// This file consolidates all mock data used across the application

import {
  subDays,
  addDays,
  subHours,
  subMonths,
  format,
} from 'date-fns'

import type {
  Campaign,
  Enrollment,
  Product,
  Transaction,
  ActiveHold,
  WalletBalance,
  Organization,
  User,
  TeamMember,
  Invoice
} from '@/lib/types'

// ==========================================
// DATE UTILITIES FOR DYNAMIC MOCK DATA
// ==========================================

const now = new Date()

/** Get a date N days ago */
const daysAgo = (days: number): Date => subDays(now, days)

/** Get a date N days from now */
const daysFromNow = (days: number): Date => addDays(now, days)

/** Get a date N hours ago */
const hoursAgo = (hours: number): Date => subHours(now, hours)

/** Get a date N months ago */
const monthsAgo = (months: number): Date => subMonths(now, months)

/** Format date as YYYY-MM-DD for chart data */
const formatDateForChart = (date: Date): string => format(date, 'yyyy-MM-dd')

// ==========================================
// USER & ORGANIZATION MOCKS
// ==========================================

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@company.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  phone: '+91 98765 43210',
  role: 'Admin',
  createdAt: monthsAgo(23),
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
    createdAt: monthsAgo(18),
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
    createdAt: monthsAgo(16),
    updatedAt: new Date(),
  },
]

export const mockCurrentOrganization = mockOrganizations[0]

// ==========================================
// DASHBOARD STATS MOCKS (Per Organization)
// ==========================================

// Define types to avoid circular references
interface DashboardStats {
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

interface EnrollmentChartItem {
  date: string
  enrollments: number
  approved: number
  rejected: number
  pending: number
}

interface TopCampaignItem {
  id: string
  name: string
  productImage: string | null
  enrollments: number
  approvalRate: number
  status: 'active' | 'ending' | 'paused'
  daysLeft: number
}

interface EnrollmentDistribution {
  total: number
  approved: number
  rejected: number
  pending: number
}

interface RecentActivityItem {
  id: string
  type: 'campaign' | 'enrollment' | 'wallet' | 'team'
  message: string
  time: string
  timestamp: Date
}

export const mockDashboardStatsByOrg: Record<string, DashboardStats> = {
  '1': {
    walletBalance: 245000,
    heldAmount: 85000,
    avgDailySpend: 8500,
    lowBalanceThreshold: 50000,
    totalCampaigns: 14,
    activeCampaigns: 8,
    draftCampaigns: 3,
    pausedCampaigns: 1,
    completedCampaigns: 2,
    endingSoon: 2,
    totalEnrollments: 856,
    pendingEnrollments: 45,
    approvedEnrollments: 678,
    rejectedEnrollments: 89,
    overdueEnrollments: 12,
    highValuePending: 5,
    enrollmentTrend: 12,
    approvalRateTrend: 3,
  },
  '2': {
    walletBalance: 180000,
    heldAmount: 42000,
    avgDailySpend: 5200,
    lowBalanceThreshold: 40000,
    totalCampaigns: 8,
    activeCampaigns: 4,
    draftCampaigns: 2,
    pausedCampaigns: 0,
    completedCampaigns: 2,
    endingSoon: 1,
    totalEnrollments: 395,
    pendingEnrollments: 28,
    approvedEnrollments: 312,
    rejectedEnrollments: 38,
    overdueEnrollments: 5,
    highValuePending: 3,
    enrollmentTrend: 8,
    approvalRateTrend: 2,
  },
}

export const mockDashboardStats = mockDashboardStatsByOrg['1']

export const mockEnrollmentChartDataByOrg: Record<string, EnrollmentChartItem[]> = {
  '1': [
    { date: formatDateForChart(daysAgo(6)), enrollments: 45, approved: 38, rejected: 4, pending: 3 },
    { date: formatDateForChart(daysAgo(5)), enrollments: 52, approved: 45, rejected: 5, pending: 2 },
    { date: formatDateForChart(daysAgo(4)), enrollments: 78, approved: 65, rejected: 8, pending: 5 },
    { date: formatDateForChart(daysAgo(3)), enrollments: 89, approved: 78, rejected: 6, pending: 5 },
    { date: formatDateForChart(daysAgo(2)), enrollments: 65, approved: 55, rejected: 5, pending: 5 },
    { date: formatDateForChart(daysAgo(1)), enrollments: 72, approved: 62, rejected: 6, pending: 4 },
    { date: formatDateForChart(new Date()), enrollments: 58, approved: 48, rejected: 5, pending: 5 },
  ],
  '2': [
    { date: formatDateForChart(daysAgo(6)), enrollments: 22, approved: 18, rejected: 2, pending: 2 },
    { date: formatDateForChart(daysAgo(5)), enrollments: 35, approved: 30, rejected: 3, pending: 2 },
    { date: formatDateForChart(daysAgo(4)), enrollments: 41, approved: 36, rejected: 3, pending: 2 },
    { date: formatDateForChart(daysAgo(3)), enrollments: 48, approved: 42, rejected: 4, pending: 2 },
    { date: formatDateForChart(daysAgo(2)), enrollments: 38, approved: 32, rejected: 3, pending: 3 },
    { date: formatDateForChart(daysAgo(1)), enrollments: 45, approved: 38, rejected: 4, pending: 3 },
    { date: formatDateForChart(new Date()), enrollments: 32, approved: 28, rejected: 2, pending: 2 },
  ],
}

export const mockEnrollmentChartData = mockEnrollmentChartDataByOrg['1']

export const mockTopCampaignsByOrg: Record<string, TopCampaignItem[]> = {
  '1': [
    { id: '1', name: 'Nike Summer Sale', productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', enrollments: 234, approvalRate: 92, status: 'active', daysLeft: 21 },
    { id: '4', name: 'Winter Collection', productImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=100&h=100&fit=crop', enrollments: 145, approvalRate: 95, status: 'ending', daysLeft: 5 },
    { id: '5', name: 'Diwali Special 2024', productImage: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=100&h=100&fit=crop', enrollments: 120, approvalRate: 91, status: 'active', daysLeft: 15 },
  ],
  '2': [
    { id: '6', name: 'Galaxy S24 Launch', productImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100&h=100&fit=crop', enrollments: 189, approvalRate: 88, status: 'active', daysLeft: 18 },
    { id: '7', name: 'Samsung TV Festival', productImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&h=100&fit=crop', enrollments: 98, approvalRate: 89, status: 'ending', daysLeft: 3 },
    { id: '8', name: 'Home Appliances Sale', productImage: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=100&h=100&fit=crop', enrollments: 76, approvalRate: 85, status: 'paused', daysLeft: 25 },
  ],
}

export const mockTopCampaigns = mockTopCampaignsByOrg['1']

export const mockEnrollmentDistributionByOrg: Record<string, EnrollmentDistribution> = {
  '1': {
    total: 856,
    approved: 678,
    rejected: 89,
    pending: 89,
  },
  '2': {
    total: 395,
    approved: 312,
    rejected: 38,
    pending: 45,
  },
}

export const mockEnrollmentDistribution = mockEnrollmentDistributionByOrg['1']

export const mockRecentActivityByOrg: Record<string, RecentActivityItem[]> = {
  '1': [
    { id: '1', type: 'campaign', message: 'Campaign "Winter Sale" approved by admin', time: '2 hours ago', timestamp: hoursAgo(2) },
    { id: '2', type: 'enrollment', message: '15 new enrollments received', time: 'Today', timestamp: new Date() },
    { id: '3', type: 'wallet', message: '₹50,000 credited to wallet', time: 'Yesterday', timestamp: daysAgo(1) },
    { id: '4', type: 'team', message: 'Team member "Sarah" joined', time: '2 days ago', timestamp: daysAgo(2) },
  ],
  '2': [
    { id: '1', type: 'campaign', message: 'Campaign "Galaxy S24 Launch" started', time: '3 hours ago', timestamp: hoursAgo(3) },
    { id: '2', type: 'enrollment', message: '8 new enrollments received', time: 'Today', timestamp: new Date() },
    { id: '3', type: 'wallet', message: '₹30,000 credited to wallet', time: 'Yesterday', timestamp: daysAgo(1) },
  ],
}

export const mockRecentActivity = mockRecentActivityByOrg['1']

// ==========================================
// CAMPAIGNS MOCKS
// ==========================================

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    organizationId: '1',
    productId: '1',
    title: 'Nike Summer Sale',
    description: 'Summer collection promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: daysAgo(10),
    endDate: daysFromNow(21),
    submissionDeadlineDays: 45,
    maxEnrollments: 500,
    currentEnrollments: 234,
    billRate: 18,
    platformFee: 50,
    approvedCount: 198,
    rejectedCount: 24,
    pendingCount: 12,
    totalPayout: 45000,
    deliverables: [
      {
        id: 'del_1_1',
        campaignId: '1',
        type: 'order_screenshot',
        title: 'Order Screenshot',
        description: 'Upload a screenshot of your order confirmation',
        instructions: 'Make sure the order ID and total amount are visible',
        isRequired: true,
        sortOrder: 1,
      },
      {
        id: 'del_1_2',
        campaignId: '1',
        type: 'delivery_photo',
        title: 'Delivery Photo',
        description: 'Photo of the delivered product',
        instructions: 'Show the product with the delivery package',
        isRequired: true,
        sortOrder: 2,
      },
      {
        id: 'del_1_3',
        campaignId: '1',
        type: 'product_review',
        title: 'Product Review',
        description: 'Write a review on the platform',
        instructions: 'Submit a screenshot of your review on Amazon/Flipkart',
        isRequired: false,
        sortOrder: 3,
      },
    ],
    createdAt: daysAgo(15),
    updatedAt: new Date(),
  },
  {
    id: '2',
    organizationId: '1',
    productId: '2',
    title: 'New Year Special',
    description: 'New year promotion',
    type: 'cashback',
    status: 'draft',
    isPublic: true,
    startDate: daysFromNow(20),
    endDate: daysFromNow(50),
    submissionDeadlineDays: 45,
    maxEnrollments: 1000,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: daysAgo(3),
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
    startDate: daysAgo(25),
    endDate: daysFromNow(5),
    submissionDeadlineDays: 45,
    maxEnrollments: 300,
    currentEnrollments: 189,
    billRate: 18,
    platformFee: 50,
    approvedCount: 156,
    rejectedCount: 18,
    pendingCount: 15,
    totalPayout: 33000,
    createdAt: daysAgo(30),
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
    startDate: daysFromNow(5),
    endDate: daysFromNow(35),
    submissionDeadlineDays: 45,
    maxEnrollments: 200,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: daysAgo(2),
    updatedAt: new Date(),
  },
  {
    id: '5',
    organizationId: '1',
    productId: '5',
    title: 'Festive Special',
    description: 'Festival promotion',
    type: 'cashback',
    status: 'completed',
    isPublic: true,
    startDate: daysAgo(60),
    endDate: daysAgo(30),
    submissionDeadlineDays: 45,
    maxEnrollments: 500,
    currentEnrollments: 456,
    billRate: 18,
    platformFee: 50,
    approvedCount: 412,
    rejectedCount: 32,
    pendingCount: 0,
    totalPayout: 85000,
    createdAt: daysAgo(65),
    updatedAt: daysAgo(30),
  },
  // More Nike (org 1) campaigns
  {
    id: '9',
    organizationId: '1',
    productId: '1',
    title: 'Air Jordan Retro Series',
    description: 'Classic Jordan sneakers promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: daysAgo(20),
    endDate: daysFromNow(10),
    submissionDeadlineDays: 45,
    maxEnrollments: 300,
    currentEnrollments: 178,
    billRate: 18,
    platformFee: 50,
    approvedCount: 145,
    rejectedCount: 18,
    pendingCount: 15,
    totalPayout: 42000,
    createdAt: daysAgo(25),
    updatedAt: new Date(),
  },
  {
    id: '10',
    organizationId: '1',
    productId: '2',
    title: 'Nike Running Gear',
    description: 'Running shoes and apparel',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: daysAgo(10),
    endDate: daysFromNow(35),
    submissionDeadlineDays: 45,
    maxEnrollments: 400,
    currentEnrollments: 89,
    billRate: 18,
    platformFee: 50,
    approvedCount: 72,
    rejectedCount: 8,
    pendingCount: 9,
    totalPayout: 18500,
    createdAt: daysAgo(15),
    updatedAt: new Date(),
  },
  {
    id: '11',
    organizationId: '1',
    productId: '3',
    title: 'Nike Training Bundle',
    description: 'Gym and training equipment',
    type: 'cashback',
    status: 'paused',
    isPublic: true,
    startDate: daysAgo(70),
    endDate: daysFromNow(20),
    submissionDeadlineDays: 45,
    maxEnrollments: 250,
    currentEnrollments: 156,
    billRate: 18,
    platformFee: 50,
    approvedCount: 142,
    rejectedCount: 12,
    pendingCount: 2,
    totalPayout: 35000,
    createdAt: daysAgo(75),
    updatedAt: daysAgo(5),
  },
  // Samsung (org 2) campaigns
  {
    id: '6',
    organizationId: '2',
    productId: '6',
    title: 'Galaxy S24 Launch',
    description: 'Galaxy S24 series launch promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: daysAgo(10),
    endDate: daysFromNow(18),
    submissionDeadlineDays: 45,
    maxEnrollments: 400,
    currentEnrollments: 189,
    billRate: 18,
    platformFee: 50,
    approvedCount: 156,
    rejectedCount: 18,
    pendingCount: 15,
    totalPayout: 38000,
    createdAt: daysAgo(15),
    updatedAt: new Date(),
  },
  {
    id: '7',
    organizationId: '2',
    productId: '7',
    title: 'Samsung TV Festival',
    description: 'Smart TV promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: daysAgo(25),
    endDate: daysFromNow(3),
    submissionDeadlineDays: 45,
    maxEnrollments: 200,
    currentEnrollments: 98,
    billRate: 18,
    platformFee: 50,
    approvedCount: 82,
    rejectedCount: 8,
    pendingCount: 8,
    totalPayout: 22000,
    createdAt: daysAgo(30),
    updatedAt: new Date(),
  },
  {
    id: '8',
    organizationId: '2',
    productId: '8',
    title: 'Home Appliances Sale',
    description: 'Washing machines & refrigerators',
    type: 'cashback',
    status: 'draft',
    isPublic: true,
    startDate: daysFromNow(20),
    endDate: daysFromNow(50),
    submissionDeadlineDays: 45,
    maxEnrollments: 300,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: daysAgo(3),
    updatedAt: new Date(),
  },
  {
    id: '12',
    organizationId: '2',
    productId: '6',
    title: 'Galaxy Buds Pro',
    description: 'Premium wireless earbuds',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: daysAgo(15),
    endDate: daysFromNow(15),
    submissionDeadlineDays: 45,
    maxEnrollments: 250,
    currentEnrollments: 134,
    billRate: 18,
    platformFee: 50,
    approvedCount: 112,
    rejectedCount: 12,
    pendingCount: 10,
    totalPayout: 26000,
    createdAt: daysAgo(20),
    updatedAt: new Date(),
  },
  {
    id: '13',
    organizationId: '2',
    productId: '7',
    title: 'Samsung Soundbar Special',
    description: 'Home theater soundbars',
    type: 'cashback',
    status: 'pending_approval',
    isPublic: true,
    startDate: daysFromNow(10),
    endDate: daysFromNow(40),
    submissionDeadlineDays: 45,
    maxEnrollments: 150,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: daysAgo(2),
    updatedAt: new Date(),
  },
  {
    id: '14',
    organizationId: '2',
    productId: '8',
    title: 'Samsung Refrigerator Fest',
    description: 'Double door refrigerators',
    type: 'cashback',
    status: 'completed',
    isPublic: true,
    startDate: daysAgo(70),
    endDate: daysAgo(10),
    submissionDeadlineDays: 45,
    maxEnrollments: 200,
    currentEnrollments: 187,
    billRate: 18,
    platformFee: 50,
    approvedCount: 168,
    rejectedCount: 15,
    pendingCount: 0,
    totalPayout: 52000,
    createdAt: daysAgo(75),
    updatedAt: daysAgo(10),
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
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
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
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
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
    createdAt: daysAgo(30),
    updatedAt: daysAgo(10),
  },
  // More Nike (org 1) products
  {
    id: '4',
    organizationId: '1',
    name: 'Nike Air Jordan 1',
    description: 'Classic retro basketball sneakers',
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop',
    category: 'Footwear',
    platform: 'Flipkart',
    productUrl: 'https://flipkart.com/nike-jordan',
    campaignCount: 2,
    createdAt: daysAgo(100),
    updatedAt: daysAgo(10),
  },
  {
    id: '5',
    organizationId: '1',
    name: 'Nike Dri-FIT Training Set',
    description: 'Professional training apparel',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop',
    category: 'Apparel',
    platform: 'Amazon',
    productUrl: 'https://amazon.in/nike-drifit',
    campaignCount: 1,
    createdAt: daysAgo(75),
    updatedAt: daysAgo(10),
  },
  // Samsung (org 2) products
  {
    id: '6',
    organizationId: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Flagship smartphone with S Pen',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Amazon',
    productUrl: 'https://amazon.in/dp/S24ULTRA',
    campaignCount: 2,
    createdAt: daysAgo(75),
    updatedAt: daysAgo(10),
  },
  {
    id: '7',
    organizationId: '2',
    name: 'Samsung Crystal 4K TV',
    description: '55 inch Smart TV with Crystal Display',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Flipkart',
    productUrl: 'https://flipkart.com/samsung-tv',
    campaignCount: 1,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
  },
  {
    id: '8',
    organizationId: '2',
    name: 'Samsung Washing Machine',
    description: 'Front load 8kg with AI Control',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop',
    category: 'Home Appliances',
    platform: 'Any Platform',
    productUrl: undefined,
    campaignCount: 2,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(10),
  },
  {
    id: '9',
    organizationId: '2',
    name: 'Samsung Galaxy Buds2 Pro',
    description: 'Hi-Fi sound with intelligent ANC',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Amazon',
    productUrl: 'https://amazon.in/galaxy-buds',
    campaignCount: 1,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
  {
    id: '10',
    organizationId: '2',
    name: 'Samsung Soundbar Q990D',
    description: '11.1.4 Channel premium soundbar',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Flipkart',
    productUrl: 'https://flipkart.com/samsung-soundbar',
    campaignCount: 1,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
  },
  {
    id: '11',
    organizationId: '2',
    name: 'Samsung Double Door Refrigerator',
    description: '653L with SpaceMax Technology',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop',
    category: 'Home Appliances',
    platform: 'Any Platform',
    productUrl: undefined,
    campaignCount: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },
]

// ==========================================
// ENROLLMENTS MOCKS
// ==========================================

export const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    organizationId: '1',
    campaignId: '1',
    shopperId: '1',
    status: 'awaiting_review',
    orderId: 'AMZ-1234567890',
    orderValue: 12999,
    orderDate: daysAgo(8),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(39),
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
      billRate: 18,
      platformFee: 50,
      product: {
        id: '1',
        name: 'Nike Air Max 2024',
        image: '/images/nike-shoe-product.png',
        category: 'Footwear',
        platform: 'Amazon',
        organizationId: '1',
        campaignCount: 1,
        createdAt: daysAgo(60),
        updatedAt: new Date(),
      },
    } as Campaign,
    ocrData: {
      extractedOrderId: 'AMZ-1234567890',
      extractedAmount: 12999,
      extractedDate: format(daysAgo(8), 'MMM d, yyyy'),
      extractedProduct: 'Nike Air Max 2024',
      confidence: 95,
      isVerified: true,
    },
    submissions: [
      {
        id: 'sub_1_1',
        enrollmentId: '1',
        deliverableId: 'del_1_1',
        fileUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        fileType: 'image/jpeg',
        status: 'pending',
        submittedAt: daysAgo(6),
      },
      {
        id: 'sub_1_2',
        enrollmentId: '1',
        deliverableId: 'del_1_2',
        fileUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        fileType: 'image/jpeg',
        status: 'pending',
        submittedAt: daysAgo(6),
      },
    ],
    history: [
      {
        id: '1',
        enrollmentId: '1',
        action: 'Submission received',
        description: 'Shopper submitted order proof',
        performedAt: daysAgo(6),
      },
      {
        id: '2',
        enrollmentId: '1',
        action: 'OCR verification',
        description: 'Automated verification passed (95% confidence)',
        performedAt: daysAgo(6),
      },
      {
        id: '3',
        enrollmentId: '1',
        action: 'Pending review',
        description: 'Awaiting manual approval',
        performedAt: daysAgo(6),
      },
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: '2',
    organizationId: '1',
    campaignId: '1',
    shopperId: '2',
    status: 'awaiting_review',
    orderId: 'FLK-9876543210',
    orderValue: 8499,
    orderDate: daysAgo(7),
    platform: 'Flipkart',
    submissionDeadline: daysFromNow(40),
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
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: '3',
    organizationId: '1',
    campaignId: '2',
    shopperId: '3',
    status: 'approved',
    orderId: 'AMZ-5678901234',
    orderValue: 15999,
    orderDate: daysAgo(10),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(36),
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
    createdAt: daysAgo(9),
    updatedAt: daysAgo(7),
  },
  {
    id: '4',
    organizationId: '1',
    campaignId: '1',
    shopperId: '4',
    status: 'changes_requested',
    orderId: 'AMZ-2345678901',
    orderValue: 9999,
    orderDate: daysAgo(9),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(38),
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
    createdAt: daysAgo(8),
    updatedAt: daysAgo(6),
  },
  {
    id: '5',
    organizationId: '1',
    campaignId: '1',
    shopperId: '5',
    status: 'rejected',
    orderId: 'FLK-3456789012',
    orderValue: 6999,
    orderDate: daysAgo(11),
    platform: 'Flipkart',
    submissionDeadline: daysFromNow(35),
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
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
  },
  // Samsung (org 2) enrollments
  {
    id: '6',
    organizationId: '2',
    campaignId: '6',
    shopperId: '6',
    status: 'awaiting_review',
    orderId: 'AMZ-6666666666',
    orderValue: 89999,
    orderDate: daysAgo(7),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(40),
    billAmount: 16200,
    platformFee: 50,
    gstAmount: 2916,
    totalCost: 19166,
    shopper: {
      id: '6',
      name: 'Rahul P.',
      email: 'rahul@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulP',
      previousEnrollments: 12,
      approvalRate: 92,
    },
    campaign: {
      id: '6',
      title: 'Galaxy S24 Launch',
    } as Campaign,
    ocrData: {
      extractedOrderId: 'AMZ-6666666666',
      extractedAmount: 89999,
      confidence: 98,
      isVerified: true,
    },
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: '7',
    organizationId: '2',
    campaignId: '7',
    shopperId: '7',
    status: 'approved',
    orderId: 'FLK-7777777777',
    orderValue: 54999,
    orderDate: daysAgo(9),
    platform: 'Flipkart',
    submissionDeadline: daysFromNow(38),
    billAmount: 9900,
    platformFee: 50,
    gstAmount: 1782,
    totalCost: 11732,
    shopper: {
      id: '7',
      name: 'Priya S.',
      email: 'priya@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaS',
      previousEnrollments: 6,
      approvalRate: 100,
    },
    campaign: {
      id: '7',
      title: 'Samsung TV Festival',
    } as Campaign,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(6),
  },
  // More Nike enrollments
  {
    id: '8',
    organizationId: '1',
    campaignId: '9',
    shopperId: '8',
    status: 'awaiting_review',
    orderId: 'AMZ-8888888888',
    orderValue: 18999,
    orderDate: daysAgo(6),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(41),
    billAmount: 3420,
    platformFee: 50,
    gstAmount: 616,
    totalCost: 4086,
    shopper: {
      id: '8',
      name: 'Vikram K.',
      email: 'vikram@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramK',
      previousEnrollments: 15,
      approvalRate: 93,
    },
    campaign: {
      id: '9',
      title: 'Air Jordan Retro Series',
    } as Campaign,
    ocrData: {
      extractedOrderId: 'AMZ-8888888888',
      extractedAmount: 18999,
      confidence: 97,
      isVerified: true,
    },
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: '9',
    organizationId: '1',
    campaignId: '10',
    shopperId: '9',
    status: 'approved',
    orderId: 'FLK-9999999999',
    orderValue: 7499,
    orderDate: daysAgo(8),
    platform: 'Flipkart',
    submissionDeadline: daysFromNow(39),
    billAmount: 1350,
    platformFee: 50,
    gstAmount: 243,
    totalCost: 1643,
    shopper: {
      id: '9',
      name: 'Neha R.',
      email: 'neha@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NehaR',
      previousEnrollments: 4,
      approvalRate: 100,
    },
    campaign: {
      id: '10',
      title: 'Nike Running Gear',
    } as Campaign,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
  },
  {
    id: '10',
    organizationId: '1',
    campaignId: '1',
    shopperId: '10',
    status: 'awaiting_review',
    orderId: 'AMZ-1010101010',
    orderValue: 11499,
    orderDate: daysAgo(5),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(42),
    billAmount: 2070,
    platformFee: 50,
    gstAmount: 373,
    totalCost: 2493,
    shopper: {
      id: '10',
      name: 'Arjun M.',
      email: 'arjun@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunM',
      previousEnrollments: 7,
      approvalRate: 86,
    },
    campaign: {
      id: '1',
      title: 'Nike Summer Sale',
    } as Campaign,
    ocrData: {
      extractedOrderId: 'AMZ-1010101010',
      extractedAmount: 11499,
      confidence: 94,
      isVerified: true,
    },
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  // More Samsung enrollments
  {
    id: '11',
    organizationId: '2',
    campaignId: '12',
    shopperId: '11',
    status: 'awaiting_review',
    orderId: 'AMZ-1111111111',
    orderValue: 12999,
    orderDate: daysAgo(6),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(41),
    billAmount: 2340,
    platformFee: 50,
    gstAmount: 421,
    totalCost: 2811,
    shopper: {
      id: '11',
      name: 'Deepak S.',
      email: 'deepak@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeepakS',
      previousEnrollments: 9,
      approvalRate: 89,
    },
    campaign: {
      id: '12',
      title: 'Galaxy Buds Pro',
    } as Campaign,
    ocrData: {
      extractedOrderId: 'AMZ-1111111111',
      extractedAmount: 12999,
      confidence: 96,
      isVerified: true,
    },
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: '12',
    organizationId: '2',
    campaignId: '6',
    shopperId: '12',
    status: 'rejected',
    orderId: 'FLK-1212121212',
    orderValue: 94999,
    orderDate: daysAgo(10),
    platform: 'Flipkart',
    submissionDeadline: daysFromNow(37),
    billAmount: 17100,
    platformFee: 50,
    gstAmount: 3078,
    totalCost: 20228,
    shopper: {
      id: '12',
      name: 'Kavya P.',
      email: 'kavya@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KavyaP',
      previousEnrollments: 2,
      approvalRate: 50,
    },
    campaign: {
      id: '6',
      title: 'Galaxy S24 Launch',
    } as Campaign,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(7),
  },
  {
    id: '13',
    organizationId: '2',
    campaignId: '7',
    shopperId: '13',
    status: 'changes_requested',
    orderId: 'AMZ-1313131313',
    orderValue: 48999,
    orderDate: daysAgo(7),
    platform: 'Amazon',
    submissionDeadline: daysFromNow(40),
    billAmount: 8820,
    platformFee: 50,
    gstAmount: 1588,
    totalCost: 10458,
    shopper: {
      id: '13',
      name: 'Rohan B.',
      email: 'rohan@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanB',
      previousEnrollments: 3,
      approvalRate: 67,
    },
    campaign: {
      id: '7',
      title: 'Samsung TV Festival',
    } as Campaign,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  },
]

export const mockPendingEnrollments = mockEnrollments.filter(e => e.status === 'awaiting_review')

// Dashboard pending enrollments in the new format
interface PendingEnrollmentItem {
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

export const mockDashboardPendingEnrollments: PendingEnrollmentItem[] = [
  {
    id: '1',
    orderId: 'AMZ-1234567890',
    orderValue: 12999,
    createdAt: daysAgo(6).toISOString(),
    campaign: {
      id: '1',
      title: 'Nike Summer Sale',
      product: {
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
      },
    },
    shopper: {
      id: '1',
      name: 'John Doe',
    },
  },
  {
    id: '2',
    orderId: 'FLK-9876543210',
    orderValue: 8499,
    createdAt: daysAgo(6).toISOString(),
    campaign: {
      id: '1',
      title: 'Nike Summer Sale',
      product: {
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
      },
    },
    shopper: {
      id: '2',
      name: 'Sarah K.',
    },
  },
  {
    id: '8',
    orderId: 'AMZ-8888888888',
    orderValue: 18999,
    createdAt: daysAgo(5).toISOString(),
    campaign: {
      id: '9',
      title: 'Air Jordan Retro Series',
      product: {
        image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=100&h=100&fit=crop',
      },
    },
    shopper: {
      id: '8',
      name: 'Vikram K.',
    },
  },
]

// ==========================================
// WALLET MOCKS
// ==========================================

export const mockWalletBalanceByOrg: Record<string, WalletBalance> = {
  '1': {
    availableBalance: 245000,
    heldAmount: 85000,
    creditLimit: 500000,
    creditUtilized: 170000,
  },
  '2': {
    availableBalance: 180000,
    heldAmount: 42000,
    creditLimit: 750000,
    creditUtilized: 95000,
  },
}

export const mockWalletBalance: WalletBalance = mockWalletBalanceByOrg['1']

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    organizationId: '1',
    type: 'hold_created',
    amount: 2500,
    description: 'Hold for Enrollment #E-123',
    enrollmentId: 'E-123',
    createdAt: hoursAgo(2),
  },
  {
    id: '2',
    organizationId: '1',
    type: 'hold_committed',
    amount: 1800,
    description: 'Approved Enrollment #E-119',
    enrollmentId: 'E-119',
    createdAt: hoursAgo(4),
  },
  {
    id: '3',
    organizationId: '1',
    type: 'credit',
    amount: 50000,
    description: 'Manual funding via bank transfer',
    reference: 'TXN-123456',
    createdAt: daysAgo(1),
  },
  {
    id: '4',
    organizationId: '1',
    type: 'hold_voided',
    amount: 2200,
    description: 'Rejected Enrollment #E-115',
    enrollmentId: 'E-115',
    createdAt: daysAgo(1),
  },
  {
    id: '5',
    organizationId: '1',
    type: 'hold_created',
    amount: 3100,
    description: 'Hold for Enrollment #E-118',
    enrollmentId: 'E-118',
    createdAt: daysAgo(2),
  },
  // Samsung (org 2) transactions
  {
    id: '6',
    organizationId: '2',
    type: 'hold_created',
    amount: 19166,
    description: 'Hold for Enrollment #E-201',
    enrollmentId: 'E-201',
    createdAt: hoursAgo(3),
  },
  {
    id: '7',
    organizationId: '2',
    type: 'credit',
    amount: 75000,
    description: 'Manual funding via bank transfer',
    reference: 'TXN-789012',
    createdAt: daysAgo(1),
  },
  {
    id: '8',
    organizationId: '2',
    type: 'hold_committed',
    amount: 11732,
    description: 'Approved Enrollment #E-195',
    enrollmentId: 'E-195',
    createdAt: daysAgo(2),
  },
]

export const mockActiveHoldsByOrg: Record<string, ActiveHold[]> = {
  '1': [
    {
      campaignId: '1',
      campaignName: 'Nike Summer Sale',
      enrollmentCount: 24,
      holdAmount: 52000,
    },
    {
      campaignId: '4',
      campaignName: 'Winter Collection',
      enrollmentCount: 12,
      holdAmount: 33000,
    },
  ],
  '2': [
    {
      campaignId: '6',
      campaignName: 'Galaxy S24 Launch',
      enrollmentCount: 15,
      holdAmount: 28000,
    },
    {
      campaignId: '7',
      campaignName: 'Samsung TV Festival',
      enrollmentCount: 8,
      holdAmount: 14000,
    },
  ],
}

export const mockActiveHolds: ActiveHold[] = mockActiveHoldsByOrg['1']

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
    joinedAt: monthsAgo(23),
    createdAt: monthsAgo(23),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@company.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    organizationId: '1',
    joinedAt: monthsAgo(21),
    createdAt: monthsAgo(21),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'viewer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    organizationId: '1',
    joinedAt: monthsAgo(18),
    createdAt: monthsAgo(18),
    updatedAt: new Date(),
  },
  // Samsung (org 2) team members
  {
    id: '4',
    name: 'Kim Lee',
    email: 'kim@samsung.com',
    role: 'owner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kim',
    organizationId: '2',
    joinedAt: monthsAgo(16),
    createdAt: monthsAgo(16),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Alex Chen',
    email: 'alex@samsung.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    organizationId: '2',
    joinedAt: monthsAgo(15),
    createdAt: monthsAgo(15),
    updatedAt: new Date(),
  },
]

// ==========================================
// SETTINGS MOCKS
// ==========================================

// Define types to avoid circular references
interface OrganizationSettingsData {
  name: string
  slug: string
  website: string
  logo: string
  email: string
  phone: string
  address: string
  industry: string
}

interface BankAccountData {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  ifscCode: string
  isDefault: boolean
  isVerified: boolean
}

interface GstDetailsData {
  gstNumber: string
  legalName: string
  tradeName: string
  state: string
  isVerified: boolean
}

export const mockOrganizationSettingsByOrg: Record<string, OrganizationSettingsData> = {
  '1': {
    name: 'Nike India Pvt. Ltd.',
    slug: '@nike-india',
    website: 'https://www.nike.com/in',
    logo: 'https://logo.clearbit.com/nike.com',
    email: 'hello@nike.com',
    phone: '+91 98765 43210',
    address: '123 Business Park, Mumbai, Maharashtra 400001',
    industry: 'retail',
  },
  '2': {
    name: 'Samsung Electronics India',
    slug: '@samsung-india',
    website: 'https://www.samsung.com/in',
    logo: 'https://logo.clearbit.com/samsung.com',
    email: 'contact@samsung.com',
    phone: '+91 11 2341 5678',
    address: '456 Tech Park, Gurgaon, Haryana 122001',
    industry: 'electronics',
  },
}

export const mockOrganizationSettings = mockOrganizationSettingsByOrg['1']

export const mockBankAccountsByOrg: Record<string, BankAccountData[]> = {
  '1': [
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
  ],
  '2': [
    {
      id: '3',
      bankName: 'State Bank of India',
      accountNumber: '****9012',
      accountHolder: 'Samsung Electronics India',
      ifscCode: 'SBIN0009012',
      isDefault: true,
      isVerified: true,
    },
  ],
}

export const mockBankAccounts = mockBankAccountsByOrg['1']

export const mockGstDetailsByOrg: Record<string, GstDetailsData> = {
  '1': {
    gstNumber: '27AAACN1234A1Z5',
    legalName: 'Nike India Private Limited',
    tradeName: 'Nike India',
    state: 'Maharashtra',
    isVerified: true,
  },
  '2': {
    gstNumber: '06AABCS5678B1Z9',
    legalName: 'Samsung India Electronics Pvt Ltd',
    tradeName: 'Samsung India',
    state: 'Haryana',
    isVerified: true,
  },
}

export const mockGstDetails = mockGstDetailsByOrg['1']

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
    signedIn: `${format(daysAgo(6), 'MMM d, yyyy')} at 9:30 AM`,
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone • Safari',
    iconType: 'smartphone' as const,
    ip: '103.21.xxx.xxx',
    location: 'Mumbai, India',
    lastActive: '2 hours ago',
    signedIn: `${format(daysAgo(7), 'MMM d, yyyy')} at 3:45 PM`,
    isCurrent: false,
  },
  {
    id: '3',
    device: 'MacOS • Firefox',
    iconType: 'mac' as const,
    ip: '49.36.xxx.xxx',
    location: 'Bengaluru, India',
    lastActive: '1 day ago',
    signedIn: `${format(daysAgo(8), 'MMM d, yyyy')} at 10:15 AM`,
    isCurrent: false,
  },
]

// ==========================================
// INVOICES MOCKS
// ==========================================

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-012',
    organizationId: '1',
    periodStart: daysAgo(10),
    periodEnd: daysAgo(4),
    dueDate: daysAgo(3),
    status: 'paid',
    subtotal: 91250,
    gstAmount: 16425,
    totalAmount: 107675,
    enrollmentCount: 45,
    createdAt: daysAgo(3),
    paidAt: daysAgo(3),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-011',
    organizationId: '1',
    periodStart: daysAgo(17),
    periodEnd: daysAgo(11),
    dueDate: daysAgo(10),
    status: 'paid',
    subtotal: 77500,
    gstAmount: 13950,
    totalAmount: 91450,
    enrollmentCount: 38,
    createdAt: daysAgo(10),
    paidAt: daysAgo(10),
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-010',
    organizationId: '1',
    periodStart: daysAgo(24),
    periodEnd: daysAgo(18),
    dueDate: daysAgo(17),
    status: 'paid',
    subtotal: 104000,
    gstAmount: 18720,
    totalAmount: 122720,
    enrollmentCount: 52,
    createdAt: daysAgo(17),
    paidAt: daysAgo(17),
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-009',
    organizationId: '1',
    periodStart: daysAgo(31),
    periodEnd: daysAgo(25),
    dueDate: daysAgo(24),
    status: 'paid',
    subtotal: 68500,
    gstAmount: 12330,
    totalAmount: 80830,
    enrollmentCount: 34,
    createdAt: daysAgo(24),
    paidAt: daysAgo(24),
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-008',
    organizationId: '1',
    periodStart: daysAgo(38),
    periodEnd: daysAgo(32),
    dueDate: daysAgo(31),
    status: 'paid',
    subtotal: 55200,
    gstAmount: 9936,
    totalAmount: 65136,
    enrollmentCount: 28,
    createdAt: daysAgo(31),
    paidAt: daysAgo(31),
  },
  // Samsung (org 2) invoices
  {
    id: '6',
    invoiceNumber: 'INV-2024-S006',
    organizationId: '2',
    periodStart: daysAgo(10),
    periodEnd: daysAgo(4),
    dueDate: daysAgo(3),
    status: 'pending',
    subtotal: 68500,
    gstAmount: 12330,
    totalAmount: 80830,
    enrollmentCount: 32,
    createdAt: daysAgo(3),
  },
  {
    id: '7',
    invoiceNumber: 'INV-2024-S005',
    organizationId: '2',
    periodStart: daysAgo(17),
    periodEnd: daysAgo(11),
    dueDate: daysAgo(10),
    status: 'paid',
    subtotal: 52000,
    gstAmount: 9360,
    totalAmount: 61360,
    enrollmentCount: 26,
    createdAt: daysAgo(10),
    paidAt: daysAgo(9),
  },
  {
    id: '8',
    invoiceNumber: 'INV-2024-S004',
    organizationId: '2',
    periodStart: daysAgo(24),
    periodEnd: daysAgo(18),
    dueDate: daysAgo(17),
    status: 'paid',
    subtotal: 45800,
    gstAmount: 8244,
    totalAmount: 54044,
    enrollmentCount: 22,
    createdAt: daysAgo(17),
    paidAt: daysAgo(16),
  },
]

// ==========================================
// CATEGORIES MOCKS
// ==========================================

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  productCount: number
  isActive: boolean
  icon?: string
  createdAt: Date
  updatedAt: Date
}

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets',
    productCount: 125,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '2',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Mobile phones and accessories',
    parentId: '1',
    productCount: 45,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '3',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, footwear and accessories',
    productCount: 230,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '4',
    name: 'Footwear',
    slug: 'footwear',
    description: 'Shoes, sneakers and sandals',
    parentId: '3',
    productCount: 85,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '5',
    name: 'Sportswear',
    slug: 'sportswear',
    description: 'Athletic and sports clothing',
    parentId: '3',
    productCount: 67,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '6',
    name: 'Home Appliances',
    slug: 'home-appliances',
    description: 'Home and kitchen appliances',
    productCount: 78,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '7',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Cosmetics and personal care products',
    productCount: 112,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '8',
    name: 'Home & Furniture',
    slug: 'home-furniture',
    description: 'Home decor and furniture',
    productCount: 56,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '9',
    name: 'Books',
    slug: 'books',
    description: 'Books and educational materials',
    productCount: 34,
    isActive: false,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
]

// ==========================================
// PLATFORMS MOCKS
// ==========================================

export interface Platform {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const mockPlatforms: Platform[] = [
  {
    id: '1',
    name: 'Amazon',
    slug: 'amazon',
    logo: 'https://logo.clearbit.com/amazon.in',
    website: 'https://amazon.in',
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '2',
    name: 'Flipkart',
    slug: 'flipkart',
    logo: 'https://logo.clearbit.com/flipkart.com',
    website: 'https://flipkart.com',
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '3',
    name: 'Myntra',
    slug: 'myntra',
    logo: 'https://logo.clearbit.com/myntra.com',
    website: 'https://myntra.com',
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '4',
    name: 'Ajio',
    slug: 'ajio',
    logo: 'https://logo.clearbit.com/ajio.com',
    website: 'https://ajio.com',
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '5',
    name: 'Nykaa',
    slug: 'nykaa',
    logo: 'https://logo.clearbit.com/nykaa.com',
    website: 'https://nykaa.com',
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '6',
    name: 'Tata CLiQ',
    slug: 'tata-cliq',
    logo: 'https://logo.clearbit.com/tatacliq.com',
    website: 'https://tatacliq.com',
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '7',
    name: 'Snapdeal',
    slug: 'snapdeal',
    logo: 'https://logo.clearbit.com/snapdeal.com',
    website: 'https://snapdeal.com',
    isActive: false,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
]

// ==========================================
// DELIVERABLE TYPES MOCKS
// ==========================================

export interface DeliverableType {
  id: string
  name: string
  slug: string
  description: string
  requiresProof: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const mockDeliverableTypes: DeliverableType[] = [
  {
    id: '1',
    name: 'Bill/Invoice Upload',
    slug: 'bill-upload',
    description: 'Upload purchase bill or invoice as proof of purchase',
    requiresProof: true,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '2',
    name: 'Product Review',
    slug: 'product-review',
    description: 'Write a review on the e-commerce platform',
    requiresProof: true,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '3',
    name: 'Social Media Post',
    slug: 'social-media-post',
    description: 'Share product on social media',
    requiresProof: true,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '4',
    name: 'Instagram Story',
    slug: 'instagram-story',
    description: 'Post a story featuring the product on Instagram',
    requiresProof: true,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '5',
    name: 'Instagram Reel',
    slug: 'instagram-reel',
    description: 'Create a reel featuring the product on Instagram',
    requiresProof: true,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '6',
    name: 'YouTube Video',
    slug: 'youtube-video',
    description: 'Create a video review or unboxing on YouTube',
    requiresProof: true,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
  {
    id: '7',
    name: 'Unboxing Photo',
    slug: 'unboxing-photo',
    description: 'Share unboxing photos of the product',
    requiresProof: true,
    isActive: true,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(12),
  },
]

// ==========================================
// NOTIFICATIONS MOCKS
// ==========================================

export interface MockNotification {
  id: string
  organizationId: string
  userId?: string
  type: 'enrollment_new' | 'enrollment_approved' | 'enrollment_rejected' | 'campaign_approved' | 'campaign_rejected' | 'wallet_credit' | 'wallet_low_balance' | 'team_member_joined' | 'invoice_generated'
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  actionLabel?: string
  createdAt: Date
}

export const mockNotifications: MockNotification[] = [
  {
    id: '1',
    organizationId: '1',
    userId: '1',
    type: 'campaign_approved',
    title: 'Campaign Approved',
    message: 'Your campaign "Winter Sale 2024" has been approved and is now active.',
    isRead: false,
    actionUrl: '/dashboard/campaigns/1',
    actionLabel: 'View Campaign',
    createdAt: hoursAgo(2),
  },
  {
    id: '2',
    organizationId: '1',
    userId: '1',
    type: 'enrollment_new',
    title: 'New Enrollments',
    message: '15 new enrollments received for "Nike Summer Sale" campaign.',
    isRead: false,
    actionUrl: '/dashboard/enrollments?campaignId=1',
    actionLabel: 'Review Now',
    createdAt: hoursAgo(4),
  },
  {
    id: '3',
    organizationId: '1',
    userId: '1',
    type: 'wallet_credit',
    title: 'Funds Added',
    message: '₹50,000 has been credited to your wallet.',
    isRead: true,
    actionUrl: '/dashboard/wallet',
    actionLabel: 'View Wallet',
    createdAt: daysAgo(1),
  },
  {
    id: '4',
    organizationId: '1',
    userId: '1',
    type: 'team_member_joined',
    title: 'New Team Member',
    message: 'Sarah Wilson has joined your team as Admin.',
    isRead: true,
    actionUrl: '/dashboard/team',
    actionLabel: 'View Team',
    createdAt: daysAgo(2),
  },
  {
    id: '5',
    organizationId: '1',
    userId: '1',
    type: 'invoice_generated',
    title: 'Invoice Generated',
    message: 'New invoice #INV-2024-001 has been generated for ₹45,000.',
    isRead: true,
    actionUrl: '/dashboard/invoices/1',
    actionLabel: 'View Invoice',
    createdAt: daysAgo(3),
  },
  {
    id: '6',
    organizationId: '1',
    userId: '1',
    type: 'enrollment_new',
    title: 'Enrollment Review Pending',
    message: '8 enrollments are awaiting your review for "Winter Collection" campaign.',
    isRead: false,
    actionUrl: '/dashboard/enrollments?status=awaiting_review',
    actionLabel: 'Review Now',
    createdAt: hoursAgo(5),
  },
  {
    id: '7',
    organizationId: '2',
    userId: '2',
    type: 'campaign_approved',
    title: 'Campaign Started',
    message: 'Your campaign "Galaxy S24 Launch" is now live.',
    isRead: false,
    actionUrl: '/dashboard/campaigns/6',
    actionLabel: 'View Campaign',
    createdAt: hoursAgo(3),
  },
  {
    id: '8',
    organizationId: '2',
    userId: '2',
    type: 'wallet_low_balance',
    title: 'Low Balance Warning',
    message: 'Your wallet balance is running low. Consider adding funds.',
    isRead: false,
    actionUrl: '/dashboard/wallet',
    actionLabel: 'Add Funds',
    createdAt: hoursAgo(6),
  },
]

// ==========================================
// SHOPPER PROFILES MOCKS
// ==========================================

export interface ShopperProfile {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  totalEnrollments: number
  approvedEnrollments: number
  rejectedEnrollments: number
  approvalRate: number
  totalEarnings: number
  joinedAt: Date
}

export const mockShopperProfiles: ShopperProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    phone: '+91 98765 43210',
    totalEnrollments: 15,
    approvedEnrollments: 12,
    rejectedEnrollments: 2,
    approvalRate: 80,
    totalEarnings: 8500,
    joinedAt: monthsAgo(9),
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulK',
    totalEnrollments: 8,
    approvedEnrollments: 7,
    rejectedEnrollments: 1,
    approvalRate: 88,
    totalEarnings: 5200,
    joinedAt: monthsAgo(7),
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AmitP',
    totalEnrollments: 22,
    approvedEnrollments: 20,
    rejectedEnrollments: 2,
    approvalRate: 91,
    totalEarnings: 12800,
    joinedAt: monthsAgo(11),
  },
]

// ==========================================
// TESTIMONIALS MOCKS (For Marketing Page)
// ==========================================

export interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
  avatar: string
}

export const mockTestimonials: Testimonial[] = [
  {
    quote: "Hypedrive reduced our campaign management time by 80%. The OCR verification is a game-changer.",
    author: 'Priya Sharma',
    role: 'Marketing Head',
    company: 'Fashion Brand',
    avatar: 'PS',
  },
  {
    quote: "We've seen a 3x increase in influencer participation since switching to Hypedrive.",
    author: 'Rahul Verma',
    role: 'Growth Lead',
    company: 'Tech Startup',
    avatar: 'RV',
  },
  {
    quote: "The automated payout system saves our finance team hours every week. Highly recommended!",
    author: 'Anita Desai',
    role: 'CFO',
    company: 'E-commerce Co.',
    avatar: 'AD',
  },
]

// ==========================================
// UPI PAYMENT MOCKS
// ==========================================

export const mockUpiConfig = {
  merchantName: 'Hypedrive Technologies',
  merchantVpa: 'hypedrive@upi',
  merchantCode: 'HD12345',
}
