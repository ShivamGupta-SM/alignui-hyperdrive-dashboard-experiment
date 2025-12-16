/**
 * UI Utility Hooks
 * 
 * @description
 * Hooks for UI interactions and behaviors.
 */

export * from './use-media-query'
export * from './use-clipboard'
// use-keyboard-shortcut.ts is empty, skip it
export * from './use-tab-observer'
export * from './use-notification'
export * from './use-breadcrumbs'

// Re-export for convenience
export { useIsDesktop, useIsTablet, useIsMobile } from './use-media-query'

