'use server'

import { getEncoreClient } from '@/lib/encore'
import { revalidatePath } from 'next/cache'
import type { OrganizationDraft } from '@/lib/types'
import type { organizations } from '@/lib/encore-client'

/**
 * Submit onboarding form - creates organization and submits for approval
 */
export async function submitOnboarding(formData: OrganizationDraft) {
  const client = getEncoreClient()

  try {
    // Map OrganizationDraft to CreateOrganizationRequest
    const createRequest: organizations.CreateOrganizationRequest = {
      name: formData.basicInfo?.name || '',
      description: formData.basicInfo?.description,
      website: formData.basicInfo?.website,
      gstNumber: formData.verification?.gstNumber,
      panNumber: formData.verification?.panNumber,
      cinNumber: formData.verification?.cinNumber,
      businessType: mapBusinessType(formData.businessDetails?.businessType),
      industryCategory: formData.businessDetails?.industryCategory,
      contactPerson: formData.businessDetails?.contactPerson,
      phoneNumber: formData.businessDetails?.phone,
      address: formData.businessDetails?.address,
      city: formData.businessDetails?.city,
      state: formData.businessDetails?.state,
      postalCode: formData.businessDetails?.pinCode,
      country: 'India',
    }

    // Create organization
    const organization = await client.organizations.createOrganization(createRequest)

    // Submit for approval
    await client.organizations.submitOrganizationForApproval(organization.id)

    revalidatePath('/onboarding')
    revalidatePath('/dashboard')

    return { 
      success: true, 
      organizationId: organization.id,
      message: 'Organization created and submitted for approval' 
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to submit onboarding application' 
    }
  }
}

/**
 * Map frontend BusinessType to backend businessType
 */
function mapBusinessType(
  type?: 'sole_proprietorship' | 'partnership' | 'llp' | 'private_limited' | 'public_limited'
): organizations.CreateOrganizationRequest['businessType'] {
  const mapping: Record<string, organizations.CreateOrganizationRequest['businessType']> = {
    'sole_proprietorship': 'proprietorship',
    'partnership': 'partnership',
    'llp': 'llp',
    'private_limited': 'pvt_ltd',
    'public_limited': 'public_ltd',
  }
  return type ? mapping[type] || 'other' : undefined
}
