/**
 * Profile API Mock Handlers
 */

import { http } from 'msw'
import { mockUser, mockSessions, mockOrganizationSettingsByOrg, mockBankAccountsByOrg, mockGstDetailsByOrg } from '@/lib/mocks'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  notFoundResponse,
  errorResponse,
} from './utils'

export const profileHandlers = [
  // GET /api/profile/data
  http.get('/api/profile/data', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()

    return successResponse({
      user: {
        ...mockUser,
        id: auth.userId,
        email: auth.user.email,
        name: auth.user.name,
      },
    })
  }),

  // PATCH /api/profile/data
  http.patch('/api/profile/data', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const body = await request.json() as Record<string, unknown>

    const { name, phone } = body as { name?: string; phone?: string }

    if (name && name.length < 2) {
      return errorResponse('Name must be at least 2 characters', 400)
    }

    const updatedUser = {
      ...mockUser,
      id: auth.userId,
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      updatedAt: new Date(),
    }

    return successResponse(updatedUser)
  }),

  // GET /api/profile/sessions
  http.get('/api/profile/sessions', async () => {
    await delay(DELAY.FAST)
    return successResponse(mockSessions)
  }),

  // DELETE /api/profile/sessions/:id
  http.delete('/api/profile/sessions/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params
    const session = mockSessions.find(s => s.id === id)

    if (!session) {
      return notFoundResponse('Session')
    }

    if (session.isCurrent) {
      return errorResponse('Cannot terminate current session', 400)
    }

    return successResponse({ message: 'Session terminated successfully' })
  }),

  // GET /api/user
  http.get('/api/user', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()

    return successResponse({
      ...mockUser,
      id: auth.userId,
      email: auth.user.email,
      name: auth.user.name,
    })
  }),

  // PATCH /api/user
  http.patch('/api/user', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const body = await request.json() as Record<string, unknown>

    const updatedUser = {
      ...mockUser,
      id: auth.userId,
      ...body,
      updatedAt: new Date(),
    }

    return successResponse(updatedUser)
  }),

  // POST /api/user/avatar
  http.post('/api/user/avatar', async () => {
    await delay(DELAY.SLOW)

    // In real app, would handle file upload
    return successResponse({
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
    })
  }),

  // POST /api/user/password
  http.post('/api/user/password', async ({ request }) => {
    await delay(DELAY.SLOW)

    const body = await request.json() as Record<string, unknown>
    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return errorResponse('Current and new password are required', 400)
    }

    if (newPassword.length < 8) {
      return errorResponse('New password must be at least 8 characters', 400)
    }

    // Simulate password validation
    if (currentPassword === 'wrong') {
      return errorResponse('Current password is incorrect', 400)
    }

    return successResponse({ message: 'Password updated successfully' })
  }),

  // GET /api/user/data - SSR hydration endpoint for profile page
  http.get('/api/user/data', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()

    return successResponse({
      user: {
        ...mockUser,
        id: auth.userId,
        email: auth.user.email,
        name: auth.user.name,
      },
      sessions: mockSessions,
    })
  }),

  // GET /api/user/sessions
  http.get('/api/user/sessions', async () => {
    await delay(DELAY.FAST)
    return successResponse(mockSessions)
  }),

  // PATCH /api/user/sessions/:id/revoke - Revoke session (used by useRevokeSession)
  http.patch('/api/user/sessions/:id/revoke', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params
    const session = mockSessions.find(s => s.id === id)

    if (!session) {
      return notFoundResponse('Session')
    }

    if (session.isCurrent) {
      return errorResponse('Cannot revoke current session', 400)
    }

    return successResponse({ message: 'Session revoked successfully' })
  }),

  // DELETE /api/user/sessions/:id
  http.delete('/api/user/sessions/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params
    const session = mockSessions.find(s => s.id === id)

    if (!session) {
      return notFoundResponse('Session')
    }

    if (session.isCurrent) {
      return errorResponse('Cannot terminate current session', 400)
    }

    return successResponse({ message: 'Session terminated successfully' })
  }),

  // GET /api/user/notifications
  http.get('/api/user/notifications', async () => {
    await delay(DELAY.FAST)

    // User notification preferences
    return successResponse({
      emailNotifications: true,
      pushNotifications: true,
      enrollmentUpdates: true,
      campaignUpdates: true,
      walletAlerts: true,
      teamUpdates: true,
      marketingEmails: false,
    })
  }),

  // PATCH /api/user/notifications
  http.patch('/api/user/notifications', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const body = await request.json() as Record<string, unknown>

    return successResponse({
      ...body,
      updatedAt: new Date(),
    })
  }),

  // GET /api/user/2fa
  http.get('/api/user/2fa', async () => {
    await delay(DELAY.FAST)

    return successResponse({
      enabled: false,
      methods: [],
    })
  }),

  // POST /api/user/2fa
  http.post('/api/user/2fa', async ({ request }) => {
    await delay(DELAY.SLOW)

    const body = await request.json() as Record<string, unknown>
    const { method } = body as { method?: string }

    if (!method) {
      return errorResponse('2FA method is required', 400)
    }

    // Return setup data (in real app, would generate secret)
    return successResponse({
      method,
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      backupCodes: ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345'],
    })
  }),

  // GET /api/settings/organization
  http.get('/api/settings/organization', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const settings = mockOrganizationSettingsByOrg[orgId] || mockOrganizationSettingsByOrg['1']

    return successResponse(settings)
  }),

  // PATCH /api/settings/organization
  http.patch('/api/settings/organization', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const currentSettings = mockOrganizationSettingsByOrg[orgId] || mockOrganizationSettingsByOrg['1']

    const updatedSettings = {
      ...currentSettings,
      ...body,
    }

    return successResponse(updatedSettings)
  }),

  // POST /api/settings/organization/logo
  http.post('/api/settings/organization/logo', async () => {
    await delay(DELAY.SLOW)

    return successResponse({
      logoUrl: `https://logo.clearbit.com/example.com?t=${Date.now()}`,
    })
  }),

  // GET /api/settings/gst
  http.get('/api/settings/gst', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const gstDetails = mockGstDetailsByOrg[orgId] || mockGstDetailsByOrg['1']

    return successResponse(gstDetails)
  }),

  // PATCH /api/settings/gst
  http.patch('/api/settings/gst', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const currentGst = mockGstDetailsByOrg[orgId] || mockGstDetailsByOrg['1']

    const updatedGst = {
      ...currentGst,
      ...body,
    }

    return successResponse(updatedGst)
  }),

  // GET /api/settings/bank-accounts
  http.get('/api/settings/bank-accounts', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']

    return successResponse(bankAccounts)
  }),

  // POST /api/settings/bank-accounts
  http.post('/api/settings/bank-accounts', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const body = await request.json() as Record<string, unknown>

    const newAccount = {
      id: `ba-${Date.now()}`,
      ...body,
      isVerified: false,
      isDefault: false,
    }

    return successResponse(newAccount, 201)
  }),

  // PATCH /api/settings/bank-accounts/:id
  http.patch('/api/settings/bank-accounts/:id', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>
    const orgId = auth.organizationId

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find(a => a.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    const updatedAccount = {
      ...account,
      ...body,
    }

    return successResponse(updatedAccount)
  }),

  // DELETE /api/settings/bank-accounts/:id
  http.delete('/api/settings/bank-accounts/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const orgId = auth.organizationId

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find(a => a.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    if (account.isDefault) {
      return errorResponse('Cannot delete the default bank account', 400)
    }

    return successResponse({ message: 'Bank account deleted successfully' })
  }),

  // POST /api/settings/bank-accounts/:id/default
  http.post('/api/settings/bank-accounts/:id/default', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const orgId = auth.organizationId

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find(a => a.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    return successResponse({
      ...account,
      isDefault: true,
    })
  }),

  // GET /api/settings/data
  http.get('/api/settings/data', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const organization = mockOrganizationSettingsByOrg[orgId] || mockOrganizationSettingsByOrg['1']
    const gstDetails = mockGstDetailsByOrg[orgId] || mockGstDetailsByOrg['1']
    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']

    // User data for settings page
    const user = {
      name: auth.user.name,
      email: auth.user.email,
      phone: mockUser.phone || '',
      avatar: auth.user.avatar,
      role: mockUser.role || 'Admin',
    }

    return successResponse({
      user,
      organization,
      bankAccounts,
      gstDetails,
    })
  }),

  // POST /api/settings/gst/verify - Verify GST number
  http.post('/api/settings/gst/verify', async ({ request }) => {
    await delay(DELAY.SLOW)

    const body = await request.json() as Record<string, unknown>
    const { gstNumber } = body as { gstNumber?: string }

    if (!gstNumber || gstNumber.length !== 15) {
      return errorResponse('Invalid GST number', 400)
    }

    // Mock GST database
    const mockGstData: Record<string, {
      gstNumber: string
      legalName: string
      tradeName: string
      state: string
      status: 'active' | 'inactive' | 'cancelled'
      registrationDate: string
      businessType: string
    }> = {
      '27AABCT1234M1Z5': {
        gstNumber: '27AABCT1234M1Z5',
        legalName: 'HYPRIVE TECHNOLOGIES PRIVATE LIMITED',
        tradeName: 'Hyprive',
        state: 'Maharashtra',
        status: 'active',
        registrationDate: '2020-07-01',
        businessType: 'Private Limited Company',
      },
    }

    const gstData = mockGstData[gstNumber]

    if (gstData) {
      return successResponse({
        ...gstData,
        isVerified: true,
      })
    }

    // For unknown GST numbers, generate mock data based on state code
    const stateCode = gstNumber.substring(0, 2)
    const stateNames: Record<string, string> = {
      '27': 'Maharashtra',
      '29': 'Karnataka',
      '07': 'Delhi',
      '33': 'Tamil Nadu',
    }

    return successResponse({
      gstNumber,
      legalName: 'VERIFIED BUSINESS ENTITY',
      tradeName: 'Verified Business',
      state: stateNames[stateCode] || 'Unknown',
      status: 'active' as const,
      isVerified: true,
      registrationDate: '2021-01-01',
      businessType: 'Private Limited Company',
    })
  }),

  // POST /api/settings/pan/verify - Verify PAN number
  http.post('/api/settings/pan/verify', async ({ request }) => {
    await delay(DELAY.SLOW)

    const body = await request.json() as Record<string, unknown>
    const { panNumber, name } = body as { panNumber?: string; name?: string }

    if (!panNumber || panNumber.length !== 10) {
      return errorResponse('Invalid PAN number', 400)
    }

    if (!name || name.length < 2) {
      return errorResponse('Name is required', 400)
    }

    // Mock PAN database
    const mockPanData: Record<string, {
      panNumber: string
      registeredName: string
      panType: 'individual' | 'company' | 'trust' | 'other'
    }> = {
      'AABCT1234M': {
        panNumber: 'AABCT1234M',
        registeredName: 'HYPRIVE TECHNOLOGIES PRIVATE LIMITED',
        panType: 'company',
      },
    }

    const panData = mockPanData[panNumber]

    if (panData) {
      const normalizedName = name.toUpperCase().trim()
      const registeredName = panData.registeredName.toUpperCase()
      const nameMatch = registeredName.includes(normalizedName) || normalizedName.includes(registeredName.split(' ')[0])

      return successResponse({
        panNumber: panData.panNumber,
        name: panData.registeredName,
        nameMatch,
        isValid: true,
        panType: panData.panType,
      })
    }

    // For unknown PAN numbers, determine type from 4th character
    const fourthChar = panNumber.charAt(3)
    const panTypeMap: Record<string, 'individual' | 'company' | 'trust' | 'other'> = {
      'P': 'individual',
      'C': 'company',
      'T': 'trust',
    }

    return successResponse({
      panNumber,
      name: name.toUpperCase(),
      nameMatch: true,
      isValid: true,
      panType: panTypeMap[fourthChar] || 'other',
    })
  }),

  // POST /api/settings/bank-accounts/verify - Verify bank account
  http.post('/api/settings/bank-accounts/verify', async ({ request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>
    const { bankAccountId } = body as { bankAccountId?: string }

    if (!bankAccountId) {
      return errorResponse('Bank account ID is required', 400)
    }

    // Find the bank account
    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find((acc: { id: string }) => acc.id === bankAccountId)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    // Mock successful verification (penny drop)
    return successResponse({
      id: account.id,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      bankName: account.bankName,
      ifscCode: account.ifscCode,
      isVerified: true,
      verificationStatus: 'verified' as const,
      verificationMessage: 'Bank account verified successfully via penny drop',
    })
  }),
]
