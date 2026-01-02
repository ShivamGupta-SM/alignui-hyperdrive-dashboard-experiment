/**
 * UI Constants
 *
 * Default UI preferences and view modes.
 */

// ============================================================================
// UI DEFAULTS
// ============================================================================

export const UI_DEFAULTS = {
	VIEW_MODE: "grid" as const,
	TABLE_PAGE_SIZE: 50,
	SHOW_ADVANCED_FILTERS: false,
} as const

export type ViewMode = "grid" | "list"
