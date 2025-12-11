import { parseAsString, parseAsInteger, parseAsStringEnum, useQueryState, useQueryStates } from 'nuqs'

// Campaign status options
const campaignStatuses = ['all', 'draft', 'pending_approval', 'active', 'paused', 'completed', 'ended', 'cancelled', 'archived']
type CampaignStatus = typeof campaignStatuses[number]

// Enrollment status options
const enrollmentStatuses = ['all', 'enrolled', 'awaiting_submission', 'awaiting_review', 'changes_requested', 'approved', 'rejected', 'withdrawn', 'expired']
type EnrollmentStatus = typeof enrollmentStatuses[number]

// Invoice status options
const invoiceStatuses = ['all', 'pending', 'paid', 'overdue', 'cancelled']
type InvoiceStatus = typeof invoiceStatuses[number]

// Transaction type options
const transactionTypes = ['all', 'credit', 'hold_created', 'hold_committed', 'hold_voided', 'withdrawal', 'refund']
type TransactionType = typeof transactionTypes[number]

// Period filter options
const periodFilters = ['all', 'this_month', 'last_month', 'last_3_months', 'last_6_months', 'this_year']
type PeriodFilter = typeof periodFilters[number]

// Settings sections
const settingsSections = ['profile', 'organization', 'billing', 'gst', 'notifications', 'security']
type SettingsSection = typeof settingsSections[number]

/**
 * Hook for campaign list page URL state
 */
export function useCampaignSearchParams() {
  return useQueryStates({
    status: parseAsStringEnum<CampaignStatus>(campaignStatuses).withDefault('all'),
    search: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),
  })
}

/**
 * Hook for enrollment list page URL state
 */
export function useEnrollmentSearchParams() {
  return useQueryStates({
    status: parseAsStringEnum<EnrollmentStatus>(enrollmentStatuses).withDefault('all'),
    search: parseAsString.withDefault(''),
    campaign: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),
  })
}

/**
 * Hook for invoice list page URL state
 */
export function useInvoiceSearchParams() {
  return useQueryStates({
    status: parseAsStringEnum<InvoiceStatus>(invoiceStatuses).withDefault('all'),
    period: parseAsStringEnum<PeriodFilter>(periodFilters).withDefault('all'),
    search: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),
  })
}

/**
 * Hook for wallet/transactions page URL state
 */
export function useWalletSearchParams() {
  return useQueryStates({
    type: parseAsStringEnum<TransactionType>(transactionTypes).withDefault('all'),
    period: parseAsStringEnum<PeriodFilter>(periodFilters).withDefault('all'),
    page: parseAsInteger.withDefault(1),
  })
}

/**
 * Hook for settings page URL state
 */
export function useSettingsSearchParams() {
  return useQueryState(
    'section',
    parseAsStringEnum<SettingsSection>(settingsSections).withDefault('profile')
  )
}

/**
 * Generic search hook - use for simple search inputs
 */
export function useSearchParam() {
  return useQueryState('search', parseAsString.withDefault(''))
}

/**
 * Generic pagination hook
 */
export function usePaginationParams() {
  return useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  })
}
