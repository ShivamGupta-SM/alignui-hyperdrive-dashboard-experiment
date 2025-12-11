/**
 * MSW Database Seeder
 *
 * Seeds the database with realistic mock data using @faker-js/faker.
 * Supports different scenarios (empty, minimal, full).
 */

import { faker } from '@faker-js/faker'
import { db } from './collections'
import type {
  Campaign,
  Enrollment,
  Product,
  Invoice,
  Transaction,
  TeamMember,
  Notification,
  RecentActivity,
} from './schemas'

// Seed faker for reproducible data
faker.seed(123)

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_ORG_ID = '1'
const DEFAULT_USER_ID = '1'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateId(prefix: string): string {
  return `${prefix}-${faker.string.nanoid(10)}`
}

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedCategories() {
  const existingCategories = db.categories.findMany()
  if (existingCategories.length > 0) return

  const categoriesData = [
    { id: 'cat-1', name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices' },
    { id: 'cat-2', name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories' },
    { id: 'cat-3', name: 'Beauty', slug: 'beauty', description: 'Skincare and makeup' },
    { id: 'cat-4', name: 'Home & Living', slug: 'home-living', description: 'Home decor and furniture' },
    { id: 'cat-5', name: 'Food & Beverages', slug: 'food-beverages', description: 'Food products' },
    { id: 'cat-6', name: 'Health & Fitness', slug: 'health-fitness', description: 'Supplements and equipment' },
  ]

  for (const category of categoriesData) {
    await db.categories.create(category)
  }
}

async function seedPlatforms() {
  const existingPlatforms = db.platforms.findMany()
  if (existingPlatforms.length > 0) return

  const platformsData = [
    { id: 'plat-1', name: 'Amazon', slug: 'amazon', icon: '🛒' },
    { id: 'plat-2', name: 'Flipkart', slug: 'flipkart', icon: '🛍️' },
    { id: 'plat-3', name: 'Myntra', slug: 'myntra', icon: '👗' },
    { id: 'plat-4', name: 'Nykaa', slug: 'nykaa', icon: '💄' },
    { id: 'plat-5', name: 'Meesho', slug: 'meesho', icon: '📦' },
    { id: 'plat-6', name: 'Ajio', slug: 'ajio', icon: '👕' },
  ]

  for (const platform of platformsData) {
    await db.platforms.create(platform)
  }
}

async function seedProducts(orgId: string, count: number = 10) {
  const existingProducts = db.products.findMany((q) => q.where({ organizationId: orgId }))
  if (existingProducts.length > 0) return existingProducts

  const productsData: Product[] = []
  const platformSlugs = ['amazon', 'flipkart', 'myntra', 'nykaa']
  const categories = ['Electronics', 'Fashion', 'Beauty', 'Home & Living']

  for (let i = 0; i < count; i++) {
    const product: Product = {
      id: generateId('prod'),
      organizationId: orgId,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 500, max: 10000 }),
      mrp: faker.number.int({ min: 600, max: 12000 }),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      category: randomElement(categories),
      images: [
        faker.image.urlLoremFlickr({ category: 'product' }),
        faker.image.urlLoremFlickr({ category: 'product' }),
      ],
      platforms: faker.helpers.arrayElements(platformSlugs, { min: 1, max: 3 }),
      isActive: faker.datatype.boolean(0.9),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    }
    await db.products.create(product)
    productsData.push(product)
  }

  return productsData
}

async function seedCampaigns(orgId: string, products: Product[], count: number = 8) {
  const existingCampaigns = db.campaigns.findMany((q) => q.where({ organizationId: orgId }))
  if (existingCampaigns.length > 0) return existingCampaigns

  const campaignsData: Campaign[] = []
  const statuses: Campaign['status'][] = ['active', 'active', 'active', 'draft', 'pending_approval', 'completed', 'paused', 'ended']
  const types: Campaign['type'][] = ['cashback', 'barter', 'hybrid']

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length]
    const product = products[i % products.length]
    const startDate = status === 'draft' ? faker.date.future({ years: 0.5 }) : faker.date.past({ years: 0.5 })
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 14, max: 90 }) * 24 * 60 * 60 * 1000)
    const maxEnrollments = faker.number.int({ min: 50, max: 500 })
    const currentEnrollments = status === 'draft' ? 0 : faker.number.int({ min: 0, max: maxEnrollments })
    const approvedCount = Math.floor(currentEnrollments * faker.number.float({ min: 0.5, max: 0.8 }))
    const rejectedCount = Math.floor((currentEnrollments - approvedCount) * 0.3)
    const pendingCount = currentEnrollments - approvedCount - rejectedCount

    const campaign: Campaign = {
      id: generateId('camp'),
      organizationId: orgId,
      productId: product.id,
      title: `${product.name} - ${faker.company.catchPhrase()}`,
      description: faker.lorem.paragraph(),
      type: randomElement(types),
      status,
      isPublic: faker.datatype.boolean(0.7),
      startDate,
      endDate,
      submissionDeadlineDays: faker.number.int({ min: 3, max: 14 }),
      maxEnrollments,
      currentEnrollments,
      billRate: faker.number.int({ min: 100, max: 500 }),
      platformFee: faker.number.int({ min: 10, max: 50 }),
      approvedCount,
      rejectedCount,
      pendingCount,
      totalPayout: approvedCount * faker.number.int({ min: 200, max: 1000 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }
    await db.campaigns.create(campaign)
    campaignsData.push(campaign)
  }

  return campaignsData
}

async function seedEnrollments(orgId: string, campaigns: Campaign[], count: number = 50) {
  const existingEnrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))
  if (existingEnrollments.length > 0) return existingEnrollments

  const enrollmentsData: Enrollment[] = []
  const statuses: Enrollment['status'][] = [
    'awaiting_review', 'awaiting_review', 'awaiting_review',
    'approved', 'approved',
    'awaiting_submission',
    'changes_requested',
    'rejected',
  ]
  const platformNames = ['Amazon', 'Flipkart', 'Myntra', 'Nykaa', 'Meesho']

  const activeCampaigns = campaigns.filter(c => ['active', 'completed'].includes(c.status))

  for (let i = 0; i < count; i++) {
    const campaign = randomElement(activeCampaigns.length > 0 ? activeCampaigns : campaigns)
    const status = randomElement(statuses)
    const orderValue = faker.number.int({ min: 500, max: 5000 })
    const billAmount = Math.round(orderValue * 0.1)
    const platformFee = Math.round(billAmount * 0.05)
    const gstAmount = Math.round(billAmount * 0.18)
    const totalCost = billAmount + platformFee + gstAmount

    const enrollment: Enrollment = {
      id: generateId('enr'),
      organizationId: orgId,
      campaignId: campaign.id,
      shopperId: generateId('shopper'),
      status,
      orderId: `ORD-${faker.string.alphanumeric(10).toUpperCase()}`,
      orderValue,
      orderDate: faker.date.recent({ days: 30 }),
      platform: randomElement(platformNames),
      submissionDeadline: faker.date.future({ years: 0.1 }),
      billAmount,
      platformFee,
      gstAmount,
      totalCost,
      payoutAmount: status === 'approved' ? billAmount - platformFee : 0,
      ocrData: {
        extractedOrderId: `ORD-${faker.string.alphanumeric(10).toUpperCase()}`,
        extractedAmount: orderValue,
        extractedDate: faker.date.recent({ days: 30 }).toISOString(),
        confidence: faker.number.float({ min: 0.85, max: 0.99 }),
        isVerified: status === 'approved',
      },
      shopper: {
        id: generateId('shopper'),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        previousEnrollments: faker.number.int({ min: 0, max: 20 }),
        approvalRate: faker.number.float({ min: 0.6, max: 1 }),
      },
      history: [
        {
          id: generateId('hist'),
          enrollmentId: '',
          action: 'Enrolled',
          description: 'Shopper enrolled in campaign',
          performedAt: faker.date.recent({ days: 30 }),
        },
      ],
      createdAt: faker.date.recent({ days: 30 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }
    await db.enrollments.create(enrollment)
    enrollmentsData.push(enrollment)
  }

  return enrollmentsData
}

async function seedTransactions(orgId: string, count: number = 30) {
  const existingTransactions = db.transactions.findMany((q) => q.where({ organizationId: orgId }))
  if (existingTransactions.length > 0) return existingTransactions

  const transactionsData: Transaction[] = []
  const types: Transaction['type'][] = ['credit', 'hold_created', 'hold_committed', 'hold_voided', 'withdrawal', 'refund']

  for (let i = 0; i < count; i++) {
    const type = randomElement(types)
    const transaction: Transaction = {
      id: generateId('txn'),
      organizationId: orgId,
      type,
      amount: faker.number.int({ min: 100, max: 50000 }),
      description: type === 'credit'
        ? 'Wallet top-up'
        : type === 'hold_created'
          ? 'Hold for campaign enrollment'
          : type === 'hold_committed'
            ? 'Payout released'
            : type === 'withdrawal'
              ? 'Withdrawal to bank account'
              : faker.lorem.sentence(3),
      reference: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
      createdAt: faker.date.recent({ days: 60 }),
    }
    await db.transactions.create(transaction)
    transactionsData.push(transaction)
  }

  return transactionsData
}

async function seedInvoices(orgId: string, count: number = 12) {
  const existingInvoices = db.invoices.findMany((q) => q.where({ organizationId: orgId }))
  if (existingInvoices.length > 0) return existingInvoices

  const invoicesData: Invoice[] = []
  const statuses: Invoice['status'][] = ['paid', 'paid', 'paid', 'pending', 'pending', 'overdue']

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length]
    const totalAmount = faker.number.int({ min: 5000, max: 100000 })
    const invoice: Invoice = {
      id: generateId('inv'),
      organizationId: orgId,
      invoiceNumber: `INV-${faker.date.recent().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      status,
      dueDate: status === 'overdue' ? faker.date.past({ years: 0.2 }) : faker.date.future({ years: 0.1 }),
      totalAmount,
      paidAmount: status === 'paid' ? totalAmount : status === 'pending' ? 0 : faker.number.int({ min: 0, max: totalAmount }),
      lineItems: [
        {
          id: generateId('item'),
          description: 'Campaign management fee',
          quantity: faker.number.int({ min: 1, max: 10 }),
          unitPrice: faker.number.int({ min: 500, max: 5000 }),
          amount: faker.number.int({ min: 5000, max: 50000 }),
        },
      ],
      createdAt: faker.date.recent({ days: 90 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }
    await db.invoices.create(invoice)
    invoicesData.push(invoice)
  }

  return invoicesData
}

async function seedTeamMembers(orgId: string) {
  const existingMembers = db.teamMembers.findMany((q) => q.where({ organizationId: orgId }))
  if (existingMembers.length > 0) return existingMembers

  const membersData: TeamMember[] = [
    {
      id: DEFAULT_USER_ID,
      organizationId: orgId,
      userId: DEFAULT_USER_ID,
      name: 'Demo User',
      email: 'demo@hypedrive.test',
      role: 'owner',
      avatar: faker.image.avatar(),
      joinedAt: faker.date.past({ years: 2 }),
      lastActive: new Date(),
    },
    {
      id: generateId('member'),
      organizationId: orgId,
      userId: generateId('user'),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'admin',
      avatar: faker.image.avatar(),
      joinedAt: faker.date.past({ years: 1 }),
      lastActive: faker.date.recent({ days: 3 }),
    },
    {
      id: generateId('member'),
      organizationId: orgId,
      userId: generateId('user'),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'manager',
      avatar: faker.image.avatar(),
      joinedAt: faker.date.past({ years: 0.5 }),
      lastActive: faker.date.recent({ days: 7 }),
    },
  ]

  for (const member of membersData) {
    await db.teamMembers.create(member)
  }

  return membersData
}

async function seedWalletBalance(orgId: string) {
  const existing = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
  if (existing) return existing

  const balance = {
    organizationId: orgId,
    availableBalance: faker.number.int({ min: 50000, max: 500000 }),
    heldAmount: faker.number.int({ min: 10000, max: 100000 }),
    creditLimit: 200000,
    creditUtilized: faker.number.int({ min: 0, max: 50000 }),
  }

  await db.walletBalances.create(balance)
  return balance
}

async function seedOrganizationSettings(orgId: string) {
  const existing = db.organizationSettings.findFirst((q) => q.where({ organizationId: orgId }))
  if (existing) return existing

  const settings = {
    organizationId: orgId,
    name: 'Demo Brand Co.',
    email: 'contact@demobrand.com',
    phone: '+91 98765 43210',
    website: 'https://demobrand.com',
    logo: faker.image.urlLoremFlickr({ category: 'business' }),
    address: faker.location.streetAddress(),
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    gstNumber: '27AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    businessType: 'Private Limited',
    industry: 'E-commerce',
  }

  await db.organizationSettings.create(settings)
  return settings
}

async function seedNotifications(orgId: string, userId: string, count: number = 10) {
  const existing = db.notifications.findMany((q) => q.where({ organizationId: orgId }))
  if (existing.length > 0) return existing

  const notificationsData: Notification[] = []
  const types: Notification['type'][] = ['info', 'success', 'warning', 'error']
  const messages = [
    { title: 'New enrollment received', message: 'A new shopper has enrolled in your campaign' },
    { title: 'Campaign approved', message: 'Your campaign has been approved and is now live' },
    { title: 'Payout processed', message: 'Payout of ₹5,000 has been processed' },
    { title: 'Low wallet balance', message: 'Your wallet balance is running low' },
    { title: 'Invoice due soon', message: 'Invoice INV-2024-0012 is due in 3 days' },
  ]

  for (let i = 0; i < count; i++) {
    const msg = randomElement(messages)
    const notification: Notification = {
      id: generateId('notif'),
      organizationId: orgId,
      userId,
      type: randomElement(types),
      title: msg.title,
      message: msg.message,
      link: '/dashboard',
      isRead: faker.datatype.boolean(0.6),
      createdAt: faker.date.recent({ days: 14 }),
    }
    await db.notifications.create(notification)
    notificationsData.push(notification)
  }

  return notificationsData
}

async function seedRecentActivity(orgId: string, count: number = 10) {
  const existing = db.recentActivity.findMany((q) => q.where({ organizationId: orgId }))
  if (existing.length > 0) return existing

  const activities: RecentActivity[] = []
  const activityTypes: RecentActivity['type'][] = ['campaign', 'enrollment', 'wallet', 'team']
  const activityMessages = [
    'New campaign "Summer Sale" created',
    'Enrollment approved for shopper Priya Sharma',
    'Wallet topped up with ₹25,000',
    'New team member added: Rahul Kumar',
    'Campaign "Flash Deal" ended successfully',
    'Enrollment rejected - Invalid order ID',
    'Withdrawal of ₹15,000 processed',
  ]

  for (let i = 0; i < count; i++) {
    const activity: RecentActivity = {
      id: generateId('activity'),
      organizationId: orgId,
      type: randomElement(activityTypes),
      message: randomElement(activityMessages),
      time: i === 0 ? 'Just now' : i < 3 ? `${i} hours ago` : `${i} days ago`,
      timestamp: faker.date.recent({ days: i + 1 }),
    }
    await db.recentActivity.create(activity)
    activities.push(activity)
  }

  return activities
}

async function seedDashboardStats(orgId: string) {
  const existing = db.dashboardStats.findFirst((q) => q.where({ organizationId: orgId }))
  if (existing) return existing

  // Calculate from actual data
  const allCampaigns = db.campaigns.findMany((q) => q.where({ organizationId: orgId }))
  const allEnrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))
  const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))

  const stats = {
    organizationId: orgId,
    activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
    totalEnrollments: allEnrollments.length,
    pendingReviews: allEnrollments.filter(e => e.status === 'awaiting_review').length,
    totalPayout: allEnrollments.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.payoutAmount, 0),
    walletBalance: wallet?.availableBalance || 0,
    monthlyGrowth: faker.number.float({ min: 5, max: 25 }),
  }

  await db.dashboardStats.create(stats)
  return stats
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

export type SeedScenario = 'empty' | 'minimal' | 'full'

export async function seedDatabase(scenario: SeedScenario = 'full', orgId: string = DEFAULT_ORG_ID) {
  console.log(`[MSW DB] Seeding database with "${scenario}" scenario...`)

  if (scenario === 'empty') {
    console.log('[MSW DB] Empty scenario - no data seeded')
    return
  }

  // Always seed reference data
  await seedCategories()
  await seedPlatforms()

  if (scenario === 'minimal') {
    // Just basic data for testing
    const products = await seedProducts(orgId, 3)
    await seedCampaigns(orgId, products, 2)
    await seedWalletBalance(orgId)
    await seedOrganizationSettings(orgId)
    await seedTeamMembers(orgId)
    console.log('[MSW DB] Minimal scenario complete')
    return
  }

  // Full scenario
  const products = await seedProducts(orgId, 10)
  const campaigns = await seedCampaigns(orgId, products, 8)
  await seedEnrollments(orgId, campaigns, 50)
  await seedTransactions(orgId, 30)
  await seedInvoices(orgId, 12)
  await seedTeamMembers(orgId)
  await seedWalletBalance(orgId)
  await seedOrganizationSettings(orgId)
  await seedNotifications(orgId, DEFAULT_USER_ID, 10)
  await seedRecentActivity(orgId, 10)
  await seedDashboardStats(orgId)

  console.log('[MSW DB] Full scenario complete')
}

/**
 * Clear all data from the database
 */
export function clearDatabase() {
  console.log('[MSW DB] Clearing database...')

  db.campaigns.clear()
  db.campaignDeliverables.clear()
  db.enrollments.clear()
  db.products.clear()
  db.invoices.clear()
  db.transactions.clear()
  db.walletBalances.clear()
  db.activeHolds.clear()
  db.teamMembers.clear()
  db.invitations.clear()
  db.notifications.clear()
  db.categories.clear()
  db.platforms.clear()
  db.organizationSettings.clear()
  db.bankAccounts.clear()
  db.gstDetails.clear()
  db.dashboardStats.clear()
  db.recentActivity.clear()

  console.log('[MSW DB] Database cleared')
}

/**
 * Reset database to initial state with fresh seed data
 */
export async function resetDatabase(scenario: SeedScenario = 'full') {
  clearDatabase()
  await seedDatabase(scenario)
}
