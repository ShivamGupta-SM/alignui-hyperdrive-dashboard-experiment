// Server-side data fetching for settings
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type organizations as organizationsApi } from '@/lib/encore'
import {
  mockOrganizationSettings,
  mockBankAccounts,
  mockGstDetails,
  mockSessions,
  mockUser,
} from '@/lib/mocks'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

/**
 * Convert Encore Organization to settings format
 */
function toOrganizationSettings(org: organizationsApi.Organization) {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description || '',
    logo: org.logo,
    website: org.website || '',
    email: '', // Not in Encore model
    phone: '', // Not in Encore model
    address: org.address || '',
    city: org.city || '',
    state: org.state || '',
    country: org.country || 'India',
    postalCode: org.postalCode || '',
    gstNumber: org.gstNumber || '',
    panNumber: org.panNumber || '',
    businessType: org.businessType || '',
    industryCategory: org.industryCategory || '',
  }
}

/**
 * Convert Encore BankAccount to frontend format
 */
function toFrontendBankAccount(account: organizationsApi.OrganizationBankAccount) {
  return {
    id: account.id,
    accountHolderName: account.accountHolderName,
    accountNumber: account.accountNumber,
    bankName: account.bankName,
    ifscCode: account.ifscCode,
    accountType: account.accountType,
    isDefault: account.isDefault,
    isVerified: account.isVerified,
    createdAt: new Date(account.createdAt),
  }
}

export async function getOrganizationSettings(organizationId?: string) {
  if (USE_ENCORE && organizationId) {
    try {
      const client = getEncoreClient()
      const org = await client.organizations.getOrganization(organizationId)
      return toOrganizationSettings(org)
    } catch (error) {
      console.error('Failed to fetch organization settings from Encore:', error)
    }
  }
  return mockOrganizationSettings
}

export async function getBankAccounts(organizationId?: string) {
  if (USE_ENCORE && organizationId) {
    try {
      const client = getEncoreClient()
      const response = await client.organizations.listBankAccounts(organizationId)
      return response.data.map(toFrontendBankAccount)
    } catch (error) {
      console.error('Failed to fetch bank accounts from Encore:', error)
    }
  }
  return mockBankAccounts
}

export async function getGstDetails(organizationId?: string) {
  if (USE_ENCORE && organizationId) {
    try {
      const client = getEncoreClient()
      const response = await client.organizations.getGSTDetails(organizationId)
      const gst = response.gstDetails
      if (gst) {
        return {
          gstNumber: gst.gstNumber,
          legalName: gst.legalName,
          tradeName: gst.tradeName,
          status: gst.gstStatus,
          businessType: gst.businessType,
          registrationDate: gst.registrationDate,
          address: gst.address,
          isVerified: gst.isVerified,
        }
      }
    } catch (error) {
      console.error('Failed to fetch GST details from Encore:', error)
    }
  }
  return mockGstDetails
}

export function getSettingsSessions() {
  return mockSessions
}

export interface SettingsData {
  user: {
    name: string
    email: string
    phone: string
    avatar?: string
    role: string
  }
  organization: Awaited<ReturnType<typeof getOrganizationSettings>>
  bankAccounts: Awaited<ReturnType<typeof getBankAccounts>>
  gstDetails: Awaited<ReturnType<typeof getGstDetails>>
}

/**
 * Get all settings data for SSR hydration
 */
export async function getSettingsData(organizationId?: string): Promise<SettingsData> {
  const [organization, bankAccounts, gstDetails] = await Promise.all([
    getOrganizationSettings(organizationId),
    getBankAccounts(organizationId),
    getGstDetails(organizationId),
  ])

  // User data comes from auth, not organization
  const user = mockUser

  return {
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar,
      role: user.role,
    },
    organization,
    bankAccounts,
    gstDetails,
  }
}
