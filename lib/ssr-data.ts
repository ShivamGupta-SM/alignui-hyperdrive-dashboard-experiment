/**
 * SSR Data Fetching Utilities
 * 
 * These functions fetch data on the server side using the Encore client.
 * MSW intercepts these requests during development (via instrumentation.ts).
 */

import { getEncoreClient } from '@/lib/encore'
import { cookies } from 'next/headers'

// Cookie name for active organization
const ACTIVE_ORG_COOKIE = 'active-organization-id'

/**
 * Get current organization ID from cookies
 */
async function getOrganizationId(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_ORG_COOKIE)?.value || '1'
}

// ===========================================
// DASHBOARD
// ===========================================

export async function getDashboardData() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const response = await client.organizations.getDashboard(orgId)
  return response
}

// ===========================================
// WALLET
// ===========================================

export async function getWalletData() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const [balance, transactions, holds] = await Promise.all([
    client.wallets.getBalance(orgId),
    client.wallets.listTransactions(orgId, { skip: 0, take: 10 }),
    client.wallets.listActiveHolds(orgId, { skip: 0, take: 10 }),
  ])
  
  return {
    balance,
    transactions: transactions.data,
    activeHolds: holds.data,
  }
}

// ===========================================
// CAMPAIGNS
// ===========================================

export async function getCampaignsData(status?: string) {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const params: { skip: number; take: number; status?: string } = {
    skip: 0,
    take: 50,
  }
  
  if (status && status !== 'all') {
    params.status = status
  }
  
  const response = await client.campaigns.listCampaigns(orgId, params)
  return response
}

export async function getCampaignDetailData(campaignId: string) {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const campaign = await client.campaigns.getCampaign(orgId, campaignId)
  return campaign
}

// ===========================================
// ENROLLMENTS
// ===========================================

export async function getEnrollmentsData(status?: string) {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const params: { skip: number; take: number; status?: string } = {
    skip: 0,
    take: 50,
  }
  
  if (status && status !== 'all') {
    params.status = status
  }
  
  const response = await client.enrollments.listEnrollments(orgId, params)
  return response
}

export async function getEnrollmentDetailData(enrollmentId: string) {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const enrollment = await client.enrollments.getEnrollment(orgId, enrollmentId)
  return enrollment
}

// ===========================================
// PRODUCTS
// ===========================================

export async function getProductsData() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const response = await client.products.listProducts(orgId, { skip: 0, take: 100 })
  return response
}

// ===========================================
// INVOICES
// ===========================================

export async function getInvoicesData() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const response = await client.invoices.listInvoices(orgId, { skip: 0, take: 50 })
  return response
}

// ===========================================
// TEAM
// ===========================================

export async function getTeamData() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const [members, invitations] = await Promise.all([
    client.organizations.listMembers(orgId, { skip: 0, take: 50 }),
    client.organizations.listInvitations(orgId, { skip: 0, take: 50 }),
  ])
  
  return {
    members: members.data,
    invitations: invitations.data,
  }
}

// ===========================================
// SETTINGS
// ===========================================

export async function getSettingsData() {
  const client = getEncoreClient()
  const orgId = await getOrganizationId()
  
  const [organization, bankAccounts, gstDetails] = await Promise.all([
    client.organizations.getOrganization(orgId),
    client.organizations.listBankAccounts(orgId),
    client.organizations.getGSTDetails(orgId).catch(() => ({ gstDetails: null })),
  ])
  
  return {
    organization,
    bankAccounts: bankAccounts.data,
    gstDetails: gstDetails.gstDetails,
  }
}

// ===========================================
// PROFILE  
// ===========================================

export async function getProfileData() {
  const client = getEncoreClient()
  
  // Profile would typically come from auth session
  // For now returning mock data
  return {
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@hypedrive.io',
      phone: '+91 98765 43210',
      role: 'admin',
    },
    sessions: [],
  }
}
