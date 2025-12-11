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
  authToken?: string
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
 * Used by Novu routes for subscriber authentication
 */
export async function getAuthContext(_request?: NextRequest): Promise<AuthCheckResult> {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  // Simulate authentication check
  if (authHeader === 'Bearer invalid') {
    return {
      success: false,
      error: 'Invalid authentication token',
      status: 401,
    }
  }

  // Get active organization ID from cookie
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
      authToken: authHeader?.replace('Bearer ', ''),
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
 * Get authenticated context for server actions
 */
export async function getServerActionAuth(): Promise<AuthCheckResult> {
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
