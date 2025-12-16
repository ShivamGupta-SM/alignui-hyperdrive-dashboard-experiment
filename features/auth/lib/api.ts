/**
 * Auth API - Single source of truth for all auth operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"

/**
 * Get current user
 * 
 * @returns Current user data
 */
export async function getCurrentUser() {
	const client = getEncoreBrowserClient()
	return client.auth.me()
}

/**
 * List user's organizations
 * 
 * @returns List of organizations
 */
export async function listOrganizations() {
	const client = getEncoreBrowserClient()
	return client.auth.listOrganizations()
}

