/**
 * Integrations Feature - Public API
 *
 * NOTE: Platform admin operations are not available in the brand client.
 * Only read operations (list, get) are available.
 */

// Types - Note: Using 'platforms' namespace (not 'integrations')
export type {
	Platform,
	PlatformType,
	PlatformStatus,
	ListPlatformsParams,
	PlatformsResponse,
} from "./types"

// Hooks
export {
	// Query Keys
	integrationKeys,
	// Queries
	usePlatforms,
	useActivePlatforms,
	usePlatform,
} from "./hooks/use-integrations"

// NOTE: Admin actions (createPlatform, updatePlatform, deletePlatform, etc.)
// are not available in the brand client
