/**
 * UI Utility Hooks
 *
 * @description
 * Hooks for UI interactions and behaviors.
 * Explicit exports for better tree-shaking and clarity.
 */

// Media Query hooks
export { useMediaQuery, useIsDesktop, useIsTablet, useIsMobile } from './use-media-query'

// Clipboard hooks
export { useCopyToClipboard, useCopyWithField } from './use-clipboard'
export type { UseClipboardOptions } from './use-clipboard'

// Tab observer
export { useTabObserver } from './use-tab-observer'

// Breadcrumbs
export { useBreadcrumbs } from './use-breadcrumbs'
export type { BreadcrumbItem } from './use-breadcrumbs'

// Hydration-safe hooks
export {
	useIsMounted,
	useHydratedTime,
	useStableTime,
	useFormattedDate
} from './use-mounted'

// Pagination hooks
export { usePagination, calculatePagination, generatePageNumbers } from './use-pagination'
export type {
	PaginationState,
	PaginationActions,
	PaginationMeta,
	UsePaginationOptions,
	UsePaginationReturn
} from './use-pagination'

// Modal state hooks (unified - supports both tuple and object patterns)
export { useModal, useMultiModal } from './use-modal'
export type { UseModalReturn, UseMultiModalReturn } from './use-modal'
