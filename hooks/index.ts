/**
 * Hooks - Public API
 *
 * @description
 * Centralized exports for all hooks.
 * Organized by category for better discoverability.
 *
 * NOTE: For usehooks-ts hooks, import directly from "usehooks-ts"
 */

// ============================================
// Feature Hooks (Re-exports from features)
// ============================================

// Auth hooks
export * from '@/features/auth'

// Organization hooks
export {
	useOrganization,
	useOrganizations,
	useOrganizationById,
	useUpdateOrganization,
} from '@/features/organizations/hooks/use-organizations'

// Onboarding status
export { useOnboardingStatus } from '@/features/organizations/hooks/use-onboarding-status'

// ============================================
// UI Utility Hooks
// ============================================
export * from './ui'

// ============================================
// State Management Hooks
// ============================================
export * from './state'

// ============================================
// Shared Data Hooks (Cross-feature)
// ============================================
export * from './shared'

