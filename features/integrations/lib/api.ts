/**
 * Integrations API - Single source of truth for all integration operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { integrations } from "@/lib/api/encore-client"

/**
 * List platforms
 * 
 * @param params - List parameters (pagination)
 * @returns Platforms response
 */
export async function listPlatforms(params?: { skip?: number; take?: number }) {
	const client = getEncoreBrowserClient()
	return client.integrations.listPlatforms(params || {})
}

/**
 * List active platforms only
 * 
 * @returns Active platforms
 */
export async function listActivePlatforms() {
	const client = getEncoreBrowserClient()
	return client.integrations.listActivePlatforms()
}

/**
 * Get platform by ID
 * 
 * @param id - Platform ID
 * @returns Platform data
 */
export async function getPlatform(id: string) {
	const client = getEncoreBrowserClient()
	return client.integrations.getPlatform(id)
}

/**
 * Get platform by name
 * 
 * @param name - Platform name/slug
 * @returns Platform data
 */
export async function getPlatformByName(name: string) {
	const client = getEncoreBrowserClient()
	return client.integrations.getPlatformByName(name)
}
