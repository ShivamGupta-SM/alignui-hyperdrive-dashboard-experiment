/**
 * MSW Handler Utilities
 *
 * Shared utilities for mock handlers including response helpers,
 * authentication simulation, and delay functions.
 */

import { HttpResponse, delay as mswDelay } from 'msw'

// Simulated delays (in ms)
export const DELAY = {
  INSTANT: 0,
  FAST: 150,
  STANDARD: 300,
  MEDIUM: 500,
  SLOW: 800,
  LONG_VERIFICATION: 1500,
} as const

// Helper to add realistic network delay
export async function delay(ms: number = DELAY.STANDARD) {
  await mswDelay(ms)
}

// Mock authenticated user context
export interface AuthContext {
  userId: string
  organizationId: string
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}

// Simulated auth context (in real app, this would come from session)
export function getAuthContext(): AuthContext {
  // Default mock user - in production MSW could read from cookies/localStorage
  return {
    userId: '1',
    organizationId: '1',
    user: {
      id: '1',
      email: 'demo@hypedrive.test',
      name: 'Demo User',
      avatar: undefined,
    },
  }
}

// Response helpers that match your API utils
export function successResponse<T>(data: T, status = 200) {
  return HttpResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return HttpResponse.json({ success: false, error: message }, { status })
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return HttpResponse.json({ success: false, error: message }, { status: 401 })
}

export function notFoundResponse(entity = 'Resource') {
  return HttpResponse.json(
    { success: false, error: `${entity} not found` },
    { status: 404 }
  )
}

export function serverErrorResponse(message = 'Internal server error') {
  return HttpResponse.json({ success: false, error: message }, { status: 500 })
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export function paginatedResponse<T>(data: T[], meta: PaginationMeta) {
  return HttpResponse.json({
    success: true,
    data,
    meta,
  })
}

export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  }
}

export function paginateArray<T>(array: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit
  return array.slice(start, start + limit)
}
