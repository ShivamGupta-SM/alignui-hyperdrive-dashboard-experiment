import { headers, cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { mockUser, mockOrganizations } from '@/lib/mocks'

// Cookie name for active organization ID
export const ACTIVE_ORG_COOKIE = 'active-organization-id'

// ============================================
// Types
// ============================================

export interface AuthContext {
  userId: string
  organizationId: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  organization: {
    id: string
    name: string
    slug: string
  }
}

interface AuthResult {
  success: true
  context: AuthContext
}

interface AuthError {
  success: false
  error: string
  status: 401 | 403
}

type AuthCheckResult = AuthResult | AuthError

// ============================================
// Server-side Auth Helpers (for API routes)
// ============================================

/**
 * Get authenticated user context for API routes
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const auth = await getAuthContext(request)
 *   if (!auth.success) {
 *     return unauthorizedResponse(auth.error)
 *   }
 *   // Use auth.context.userId, auth.context.organizationId
 * }
 */
export async function getAuthContext(_request?: NextRequest): Promise<AuthCheckResult> {
  // In a real app, this would:
  // 1. Extract the session token from cookies/headers
  // 2. Verify the token with Better Auth
  // 3. Return the user and organization info

  // For now, return mock data for development
  // TODO: Integrate with Better Auth server-side session verification

  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  // Simulate authentication check
  // In production, verify JWT/session token here
  if (authHeader === 'Bearer invalid') {
    return {
      success: false,
      error: 'Invalid authentication token',
      status: 401,
    }
  }

  // Get active organization ID from cookie (set by client-side dashboard-shell)
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

  // Find the organization by ID, fallback to first organization
  const organization = activeOrgId
    ? mockOrganizations.find(org => org.id === activeOrgId) || mockOrganizations[0]
    : mockOrganizations[0]

  return {
    success: true,
    context: {
      userId: mockUser.id,
      organizationId: organization.id,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    },
  }
}

/**
 * Higher-order function to protect API routes
 *
 * @example
 * export const GET = withAuth(async (request, context) => {
 *   const campaigns = await getCampaigns(context.organizationId)
 *   return successResponse(campaigns)
 * })
 */
export function withAuth<T extends NextRequest>(
  handler: (request: T, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: T): Promise<NextResponse> => {
    const auth = await getAuthContext(request)

    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    return handler(request, auth.context)
  }
}

// ============================================
// Server Action Auth Helpers
// ============================================

/**
 * Get authenticated context for server actions
 *
 * @example
 * export async function createCampaign(data: unknown) {
 *   const auth = await getServerActionAuth()
 *   if (!auth.success) {
 *     return { success: false, error: auth.error }
 *   }
 *   // Use auth.context.organizationId
 * }
 */
export async function getServerActionAuth(): Promise<AuthCheckResult> {
  // Server actions use the same authentication mechanism
  // In production, this would verify the session from cookies
  return getAuthContext()
}

// ============================================
// Response Helpers
// ============================================

/**
 * Return 401 Unauthorized response
 */
export function unauthorizedResponse(message = 'Authentication required') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  )
}

/**
 * Return 403 Forbidden response
 */
export function forbiddenResponse(message = 'Access denied') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  )
}

// ============================================
// Type Guards
// ============================================

export function isAuthSuccess(result: AuthCheckResult): result is AuthResult {
  return result.success === true
}

export function isAuthError(result: AuthCheckResult): result is AuthError {
  return result.success === false
}
