/**
 * Integrations Types
 *
 * Re-exports types from brand-client for consistency
 * Platform types are in the 'platforms' namespace
 */

import type { platforms } from "@/brand-client"

// Convenience type aliases - Platform types are in platforms namespace
export type Platform = platforms.Platform
export type PlatformType = platforms.PlatformType
export type PlatformStatus = platforms.PlatformStatus
export type ListPlatformsParams = platforms.ListPlatformsParams
export type PlatformsResponse = platforms.PlatformsResponse
