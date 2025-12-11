// Server-side data fetching for user and organization data
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type auth as authApi, type organizations as organizationsApi } from '@/lib/encore'
// Note: authApi.Session type not used - sessions fetched client-side via Better-Auth
import { mockUser, mockOrganizations, mockCurrentOrganization, mockSessions } from '@/lib/mocks'
import type { User, Organization } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

/**
 * Convert Encore User to Frontend User type
 */
function toFrontendUser(user: authApi.User): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    avatar: user.image || undefined,
    phone: '', // Not in Encore auth model
    role: user.role || 'user',
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled || false,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  }
}

/**
 * Convert Encore Organization to Frontend Organization type
 */
function toFrontendOrganization(org: organizationsApi.Organization): Organization {
  // Map Encore approvalStatus to frontend OrganizationStatus
  const statusMap: Record<string, Organization['status']> = {
    pending_review: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    suspended: 'suspended',
  }

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description,
    logo: org.logo || undefined,
    website: org.website,
    gstNumber: org.gstNumber,
    gstVerified: org.gstVerified,
    panNumber: org.panNumber,
    panVerified: org.panVerified,
    cinNumber: org.cinNumber,
    businessType: org.businessType as Organization['businessType'],
    industryCategory: org.industryCategory as Organization['industryCategory'],
    contactPerson: org.contactPerson,
    phone: org.phoneNumber,
    address: org.address,
    city: org.city,
    state: org.state,
    pinCode: org.postalCode,
    status: statusMap[org.approvalStatus] || 'pending',
    creditLimit: org.creditLimit || 0,
    billRate: 0,
    platformFee: 0,
    campaignCount: 0,
    createdAt: new Date(org.createdAt),
    updatedAt: new Date(org.updatedAt),
  }
}

export async function getUser(): Promise<User> {
  if (USE_ENCORE) {
    try {
      const client = getEncoreClient()
      const user = await client.auth.getMe()
      return toFrontendUser(user)
    } catch (error) {
      console.error('Failed to fetch user from Encore:', error)
    }
  }
  return mockUser
}

export async function getOrganizations(): Promise<Organization[]> {
  if (USE_ENCORE) {
    try {
      const client = getEncoreClient()
      const response = await client.organizations.getMyOrganizations()
      return response.data.map(toFrontendOrganization)
    } catch (error) {
      console.error('Failed to fetch organizations from Encore:', error)
    }
  }
  return mockOrganizations
}

export async function getCurrentOrganization(organizationId?: string): Promise<Organization> {
  if (USE_ENCORE && organizationId) {
    try {
      const client = getEncoreClient()
      const org = await client.organizations.getOrganization(organizationId)
      return toFrontendOrganization(org)
    } catch (error) {
      console.error('Failed to fetch organization from Encore:', error)
    }
  }
  return mockCurrentOrganization
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  if (USE_ENCORE) {
    try {
      const client = getEncoreClient()
      const org = await client.organizations.getOrganization(id)
      return toFrontendOrganization(org)
    } catch (error) {
      console.error('Failed to fetch organization from Encore:', error)
    }
  }
  return mockOrganizations.find(org => org.id === id) || null
}

export async function getSessions(): Promise<typeof mockSessions> {
  // Sessions require auth token which is only available client-side
  // Using mock data for SSR, real sessions are fetched client-side via Better-Auth
  return mockSessions
}

export interface ProfileData {
  user: User
  sessions: typeof mockSessions
}

/**
 * Get all profile data for SSR hydration
 */
export async function getProfileData(): Promise<ProfileData> {
  const [user, sessions] = await Promise.all([
    getUser(),
    getSessions(),
  ])

  return {
    user,
    sessions,
  }
}
