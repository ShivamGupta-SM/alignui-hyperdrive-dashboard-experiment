/**
 * Hooks - Public API
 * 
 * @description
 * Centralized exports for all hooks.
 * Organized by category for better discoverability.
 */

// ============================================
// Feature Hooks (Re-exports from features)
// ============================================

// Auth hooks
export * from '@/features/auth'

// Organization hooks - export explicitly to avoid conflicts with auth
export {
	useOrganizations as useOrganizationsFromOrgs,
	useSwitchOrganization as useSwitchOrganizationFromOrgs,
	useActiveOrganization,
	useActiveOrganizationId,
} from '@/features/organizations'

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

// ============================================
// Re-export useful hooks from usehooks-ts
// ============================================
export {
	useDebounceValue,
	useDebounceCallback,
	useSessionStorage,
	useOnClickOutside,
	useEventListener,
	useInterval,
	useIsClient,
	useIsMounted,
	useToggle,
	useBoolean,
	useCounter,
	useDocumentTitle,
	useHover,
	useIntersectionObserver,
	useReadLocalStorage,
	useScreen,
	useScrollLock,
	useStep,
	useWindowSize,
} from "usehooks-ts"

// Note: useLocalStorage is exported from ./state (custom implementation)
