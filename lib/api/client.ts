"use client"

/**
 * Centralized Browser API Client
 *
 * SSOT: Import this in all client components instead of calling getEncoreBrowserClient()
 *
 * @example
 * import { client } from "@/lib/api/client"
 *
 * // In hooks
 * const data = await client.organizations.listCampaigns(orgId, params)
 */

import { getEncoreBrowserClient, resetEncoreBrowserClient } from "./encore-browser"

/**
 * Pre-initialized browser client singleton
 * Use this instead of calling getEncoreBrowserClient() in every file
 */
export const client = getEncoreBrowserClient()

/**
 * Reset client on sign-out
 */
export const resetClient = resetEncoreBrowserClient

// Re-export for cases where fresh instance or custom options needed
export { getEncoreBrowserClient, getAuthenticatedBrowserClient } from "./encore-browser"
