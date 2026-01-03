/**
 * State Management Hooks
 *
 * @description
 * Hooks for managing component and application state.
 * Explicit exports for better tree-shaking and clarity.
 */

// Local Storage hooks
export { useLocalStorage } from './use-local-storage'

// URL Search Params hooks (nuqs-based)
export {
	useCampaignSearchParams,
	useEnrollmentSearchParams,
	useInvoiceSearchParams,
	useWalletSearchParams,
	useSettingsSearchParams,
	useProductSearchParams,
} from './use-search-params'
