import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockBankAccountsByOrg } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateBankAccountSchema = z.object({
  isDefault: z.boolean().optional(),
})

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find((acc: { id: string }) => acc.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    return successResponse(account)
  } catch (error) {
    console.error('Bank account GET error:', error)
    return serverErrorResponse('Failed to fetch bank account')
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const parsed = await parseBody(request, updateBankAccountSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { isDefault } = parsed.data

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find((acc: { id: string }) => acc.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    await delay(DELAY.FAST)

    // In production, update in database
    // If setting as default, unset other defaults
    const updatedAccount = {
      ...account,
      isDefault: isDefault ?? account.isDefault,
    }

    return successResponse(updatedAccount)
  } catch (error) {
    console.error('Bank account PATCH error:', error)
    return serverErrorResponse('Failed to update bank account')
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find((acc: { id: string }) => acc.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    // Cannot delete default account if there are other accounts
    if (account.isDefault && bankAccounts.length > 1) {
      return errorResponse('Cannot delete default account. Set another account as default first.', 400)
    }

    await delay(DELAY.FAST)

    return successResponse({
      message: 'Bank account removed successfully',
      id,
    })
  } catch (error) {
    console.error('Bank account DELETE error:', error)
    return serverErrorResponse('Failed to remove bank account')
  }
}
