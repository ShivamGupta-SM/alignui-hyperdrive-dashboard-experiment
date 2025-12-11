// Organization Types

export type OrganizationStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type BusinessType =
  | 'sole_proprietorship'
  | 'partnership'
  | 'llp'
  | 'private_limited'
  | 'public_limited'

export type IndustryCategory =
  | 'electronics'
  | 'fashion'
  | 'fmcg'
  | 'beauty'
  | 'home_appliances'
  | 'sports'
  | 'automotive'
  | 'other'

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  website?: string
  status: OrganizationStatus

  // Business details
  businessType?: BusinessType
  industryCategory?: IndustryCategory
  contactPerson?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pinCode?: string

  // Verification
  gstNumber?: string
  gstVerified: boolean
  panNumber?: string
  panVerified: boolean
  cinNumber?: string

  // Billing
  creditLimit: number
  billRate: number
  platformFee: number

  // Stats
  campaignCount: number

  createdAt: Date
  updatedAt: Date
}

export interface OrganizationDraft {
  step: 1 | 2 | 3 | 4
  basicInfo?: {
    name: string
    description?: string
    website?: string
    logo?: string
  }
  businessDetails?: {
    businessType: BusinessType
    industryCategory: IndustryCategory
    contactPerson: string
    phone: string
    address: string
    city: string
    state: string
    pinCode: string
  }
  verification?: {
    gstNumber: string
    gstVerified: boolean
    panNumber?: string
    panVerified?: boolean
    cinNumber?: string
  }
}
