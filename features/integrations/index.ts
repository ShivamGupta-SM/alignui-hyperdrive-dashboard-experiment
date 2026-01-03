/**
 * Integrations Feature - Public API
 *
 * NOTE: Platform admin operations are not available in the brand client.
 * Only read operations (list, get) are available via direct API calls.
 */

// Types - Note: Using 'platforms' namespace (not 'integrations')
export type {
	Platform,
	PlatformType,
	PlatformStatus,
	ListPlatformsParams,
	PlatformsResponse,
} from "./types"

// NOTE: Hooks removed - use direct API calls via client.platforms
// NOTE: Admin actions (createPlatform, updatePlatform, deletePlatform, etc.)
// are not available in the brand client
