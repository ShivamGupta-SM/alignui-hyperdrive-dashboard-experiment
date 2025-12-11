// Query keys for React Query - shared between client and server
// This file does NOT have 'use client' so it can be imported in Server Components

import { QUERY_KEYS } from '@/lib/types'

// Dashboard
export const dashboardKeys = {
  all: [QUERY_KEYS.DASHBOARD] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
}

// Campaigns
export const campaignKeys = {
  all: [QUERY_KEYS.CAMPAIGNS] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  data: (status?: string) => [...campaignKeys.all, 'data', status ?? 'all'] as const,
}

// Enrollments
export const enrollmentKeys = {
  all: [QUERY_KEYS.ENROLLMENTS] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...enrollmentKeys.lists(), filters] as const,
  details: () => [...enrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
  pending: () => [...enrollmentKeys.all, 'pending'] as const,
  data: (status?: string) => [...enrollmentKeys.all, 'data', status ?? 'all'] as const,
}

// Wallet
export const walletKeys = {
  all: [QUERY_KEYS.WALLET] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
  summary: () => [...walletKeys.all, 'summary'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
  transactionList: (filters: Record<string, unknown>) => [...walletKeys.transactions(), filters] as const,
  data: () => [...walletKeys.all, 'data'] as const,
}

// Invoices
export const invoiceKeys = {
  all: [QUERY_KEYS.INVOICES] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  data: () => [...invoiceKeys.all, 'data'] as const,
}

// Team
export const teamKeys = {
  all: ['team'] as const,
  members: () => [...teamKeys.all, 'members'] as const,
  invitations: () => [...teamKeys.all, 'invitations'] as const,
  data: () => [...teamKeys.all, 'data'] as const,
}

// Products
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  data: () => [...productKeys.all, 'data'] as const,
}

// Profile
export const profileKeys = {
  all: ['profile'] as const,
  user: () => [...profileKeys.all, 'user'] as const,
  sessions: () => [...profileKeys.all, 'sessions'] as const,
  data: () => [...profileKeys.all, 'data'] as const,
}
