/**
 * Settings API Mock Handlers
 *
 * Handles organization settings, GST/PAN verification, and bank accounts
 */

import { http } from 'msw'
import {
  mockOrganizationSettings,
  mockBankAccounts,
  mockGstDetails,
  mockSessions,
  mockUser,
} from '@/lib/mocks'
import {
  delay,
  DELAY,
  successResponse,
  notFoundResponse,
  errorResponse,
} from './utils'

// GST number validation regex (Indian format)
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

// PAN number validation regex (Indian format)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

// IFSC code validation regex
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

// Clone mock bank accounts for mutation
const mutableBankAccounts = [...mockBankAccounts]

export const settingsHandlers = [
  // GET /api/settings/data - Get all settings data
  http.get('/api/settings/data', async () => {
    await delay(DELAY.FAST)

    return successResponse({
      user: {
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone || '',
        avatar: mockUser.avatar,
        role: mockUser.role,
      },
      organization: mockOrganizationSettings,
      bankAccounts: mutableBankAccounts, // All bank accounts for mock org
      gstDetails: mockGstDetails,
    })
  }),

  // GET /api/settings/organization - Get organization settings
  http.get('/api/settings/organization', async () => {
    await delay(DELAY.FAST)

    return successResponse(mockOrganizationSettings)
  }),

  // PATCH /api/settings/organization - Update organization settings
  // Schema: { name?, slug?, website?, email?, phone?, address?, industry?, description? }
  http.patch('/api/settings/organization', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const body = (await request.json()) as Record<string, unknown>

    const { name, slug, website, email, phone, address, industry, description } =
      body as {
        name?: string
        slug?: string
        website?: string
        email?: string
        phone?: string
        address?: string
        industry?: string
        description?: string
      }

    // Validate name length
    if (name !== undefined) {
      if (name.length < 2) {
        return errorResponse('Name must be at least 2 characters', 400)
      }
      if (name.length > 100) {
        return errorResponse('Name must be at most 100 characters', 400)
      }
    }

    // Validate slug format
    if (slug !== undefined) {
      if (slug.length < 3) {
        return errorResponse('Slug must be at least 3 characters', 400)
      }
      if (slug.length > 50) {
        return errorResponse('Slug must be at most 50 characters', 400)
      }
      if (!/^@?[a-z0-9-]+$/.test(slug)) {
        return errorResponse('Invalid slug format', 400)
      }
    }

    // Validate website URL
    if (website && website !== '') {
      try {
        new URL(website)
      } catch {
        return errorResponse('Invalid website URL', 400)
      }
    }

    // Validate email
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('Invalid email address', 400)
    }

    // Validate phone
    if (phone !== undefined && phone !== '') {
      if (phone.length < 10 || phone.length > 15) {
        return errorResponse('Invalid phone number', 400)
      }
    }

    // Validate description length
    if (description !== undefined && description.length > 1000) {
      return errorResponse('Description must be at most 1000 characters', 400)
    }

    const updatedSettings = {
      ...mockOrganizationSettings,
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(website !== undefined && { website }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(industry !== undefined && { industry }),
      ...(description !== undefined && { description }),
      updatedAt: new Date().toISOString(),
    }

    return successResponse(updatedSettings)
  }),

  // GET /api/settings/gst - Get GST details
  http.get('/api/settings/gst', async () => {
    await delay(DELAY.FAST)

    return successResponse(mockGstDetails)
  }),

  // POST /api/settings/gst - Update GST number
  // Schema: { gstNumber: string (15 chars, regex validated) }
  http.post('/api/settings/gst', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const body = (await request.json()) as Record<string, unknown>
    const { gstNumber } = body as { gstNumber?: string }

    if (!gstNumber) {
      return errorResponse('GST number is required', 400)
    }

    if (gstNumber.length !== 15) {
      return errorResponse('GST number must be 15 characters', 400)
    }

    if (!GST_REGEX.test(gstNumber)) {
      return errorResponse('Invalid GST number format', 400)
    }

    // Return verified GST details (simulating Encore verifyGst response)
    return successResponse({
      gstNumber,
      legalName: 'Acme Corporation Pvt Ltd',
      tradeName: 'Acme Corp',
      gstStatus: 'Active',
      businessType: 'Private Limited Company',
      registrationDate: '2020-04-01',
      address: '123 Business Park, Mumbai, Maharashtra - 400001',
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    })
  }),

  // POST /api/settings/gst/verify - Verify GST number
  // Schema: { gstNumber: string (15 chars, regex validated) }
  http.post('/api/settings/gst/verify', async ({ request }) => {
    await delay(DELAY.SLOW) // Verification takes time

    const body = (await request.json()) as Record<string, unknown>
    const { gstNumber } = body as { gstNumber?: string }

    if (!gstNumber) {
      return errorResponse('GST number is required', 400)
    }

    if (gstNumber.length !== 15) {
      return errorResponse('GST number must be 15 characters', 400)
    }

    if (!GST_REGEX.test(gstNumber)) {
      return errorResponse('Invalid GST number format', 400)
    }

    // Simulate verification result (matching Encore GSTDetails type)
    return successResponse({
      gstNumber,
      legalName: 'Acme Corporation Pvt Ltd',
      tradeName: 'Acme Corp',
      gstStatus: 'Active',
      businessType: 'Private Limited Company',
      registrationDate: '2020-04-01',
      address: '123 Business Park, Mumbai, Maharashtra - 400001',
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    })
  }),

  // POST /api/settings/pan/verify - Verify PAN number
  // Schema: { panNumber: string (10 chars, regex validated), name: string }
  http.post('/api/settings/pan/verify', async ({ request }) => {
    await delay(DELAY.SLOW) // Verification takes time

    const body = (await request.json()) as Record<string, unknown>
    const { panNumber, name } = body as { panNumber?: string; name?: string }

    if (!panNumber) {
      return errorResponse('PAN number is required', 400)
    }

    if (panNumber.length !== 10) {
      return errorResponse('PAN number must be 10 characters', 400)
    }

    if (!PAN_REGEX.test(panNumber)) {
      return errorResponse('Invalid PAN number format', 400)
    }

    if (!name || name.length < 2) {
      return errorResponse('Name is required', 400)
    }

    // Simulate verification result (matching Encore PANDetails type)
    return successResponse({
      panNumber,
      name,
      nameMatch: true,
      panStatus: 'Active',
      panHolderType: 'Company',
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    })
  }),

  // GET /api/settings/bank-accounts - List bank accounts
  http.get('/api/settings/bank-accounts', async () => {
    await delay(DELAY.FAST)

    // Return all mock bank accounts (they're all for the same org)
    return successResponse(mutableBankAccounts)
  }),

  // POST /api/settings/bank-accounts - Add bank account
  // Schema: { bankName, accountNumber, confirmAccountNumber, accountHolder, ifscCode }
  http.post('/api/settings/bank-accounts', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const body = (await request.json()) as Record<string, unknown>

    const { bankName, accountNumber, confirmAccountNumber, accountHolder, ifscCode } =
      body as {
        bankName?: string
        accountNumber?: string
        confirmAccountNumber?: string
        accountHolder?: string
        ifscCode?: string
      }

    // Validate bank name
    if (!bankName || bankName.length < 2) {
      return errorResponse('Bank name is required', 400)
    }

    // Validate account number
    if (!accountNumber) {
      return errorResponse('Account number is required', 400)
    }
    if (accountNumber.length < 9 || accountNumber.length > 18) {
      return errorResponse(
        'Account number must be between 9 and 18 digits',
        400
      )
    }

    // Validate confirm account number matches
    if (accountNumber !== confirmAccountNumber) {
      return errorResponse("Account numbers don't match", 400)
    }

    // Validate account holder
    if (!accountHolder || accountHolder.length < 2) {
      return errorResponse('Account holder name is required', 400)
    }

    // Validate IFSC code
    if (!ifscCode) {
      return errorResponse('IFSC code is required', 400)
    }
    if (ifscCode.length !== 11) {
      return errorResponse('IFSC code must be 11 characters', 400)
    }
    if (!IFSC_REGEX.test(ifscCode)) {
      return errorResponse('Invalid IFSC code format', 400)
    }

    // Create new bank account (matching BankAccountData mock type)
    const newAccount = {
      id: `ba-${Date.now()}`,
      bankName,
      accountNumber,
      accountHolder, // BankAccountData uses accountHolder
      ifscCode,
      isDefault: mutableBankAccounts.length === 0,
      isVerified: false,
    }

    mutableBankAccounts.push(newAccount)

    return successResponse(newAccount, 201)
  }),

  // POST /api/settings/bank-accounts/verify - Verify bank account
  // Schema: { bankAccountId: string }
  http.post('/api/settings/bank-accounts/verify', async ({ request }) => {
    await delay(DELAY.SLOW)

    const body = (await request.json()) as Record<string, unknown>
    const { bankAccountId } = body as { bankAccountId?: string }

    if (!bankAccountId) {
      return errorResponse('Bank account ID is required', 400)
    }

    const account = mutableBankAccounts.find((a) => a.id === bankAccountId)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    // Mark as verified
    account.isVerified = true

    return successResponse({
      ...account,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    })
  }),

  // GET /api/settings/bank-accounts/:id - Get bank account by ID
  http.get('/api/settings/bank-accounts/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params

    const account = mutableBankAccounts.find((a) => a.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    return successResponse(account)
  }),

  // PATCH /api/settings/bank-accounts/:id - Update bank account
  // Schema: { isDefault?: boolean }
  http.patch('/api/settings/bank-accounts/:id', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params
    const body = (await request.json()) as Record<string, unknown>
    const { isDefault } = body as { isDefault?: boolean }

    const account = mutableBankAccounts.find((a) => a.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      mutableBankAccounts.forEach((a) => {
        a.isDefault = a.id === id
      })
    }

    return successResponse({
      ...account,
      isDefault: isDefault ?? account.isDefault,
    })
  }),

  // DELETE /api/settings/bank-accounts/:id - Delete bank account
  http.delete('/api/settings/bank-accounts/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params

    const accountIndex = mutableBankAccounts.findIndex((a) => a.id === id)

    if (accountIndex === -1) {
      return notFoundResponse('Bank account')
    }

    const account = mutableBankAccounts[accountIndex]

    // Cannot delete default account if there are other accounts
    if (account.isDefault) {
      const otherAccounts = mutableBankAccounts.filter((a) => a.id !== id)
      if (otherAccounts.length > 0) {
        return errorResponse(
          'Cannot delete default account. Set another account as default first.',
          400
        )
      }
    }

    mutableBankAccounts.splice(accountIndex, 1)

    return successResponse({
      message: 'Bank account removed successfully',
      id,
    })
  }),

  // POST /api/settings/bank-accounts/:id/default - Set bank account as default
  http.post('/api/settings/bank-accounts/:id/default', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params

    const account = mutableBankAccounts.find((a) => a.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    // Unset all other defaults and set this one
    mutableBankAccounts.forEach((a) => {
      a.isDefault = a.id === id
    })

    return successResponse({
      ...account,
      isDefault: true,
    })
  }),

  // GET /api/settings/sessions - Get active sessions (for security page)
  http.get('/api/settings/sessions', async () => {
    await delay(DELAY.FAST)

    return successResponse(mockSessions)
  }),
]
