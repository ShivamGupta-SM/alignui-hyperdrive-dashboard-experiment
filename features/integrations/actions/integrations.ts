"use server"

/**
 * Integrations Server Actions
 *
 * NOTE: Platform management operations (create, update, delete, activate, deactivate, maintenance)
 * are admin-only operations and not available in the brand client.
 * These endpoints are only available in the admin client.
 *
 * For brand apps, only read operations are available via the hooks:
 * - usePlatforms() - list all platforms
 * - useActivePlatforms() - list active platforms
 * - usePlatform(id) - get platform by ID
 * - usePlatformByName(name) - get platform by name
 */

// No brand-facing platform actions available
// All platform management is done via admin portal
