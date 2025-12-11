// Re-export all hooks for easy imports

// Data fetching hooks (using Encore client directly)
export * from './use-campaigns'
export * from './use-enrollments'
export * from './use-wallet'
export * from './use-dashboard'
export * from './use-invoices'
export * from './use-categories'
export * from './use-platforms'
export * from './use-notifications'
export * from './use-storage'
export * from './use-novu'
export * from './use-products'
export * from './use-profile'
export * from './use-team'
export * from './use-settings'
export * from './use-organizations'
export * from './use-deliverables'

// URL state management (nuqs)
export * from './use-search-params'

// Utility hooks
export * from './use-clipboard'

// Re-export useful hooks from usehooks-ts
export {
  useDebounceValue,
  useDebounceCallback,
  useLocalStorage,
  useSessionStorage,
  useMediaQuery,
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
} from 'usehooks-ts'
