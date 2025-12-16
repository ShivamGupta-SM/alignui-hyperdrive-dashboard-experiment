/**
 * Team Feature Types
 */

import type { auth } from "@/lib/api/encore-client"

// Re-export from Encore client
export type Member = auth.MemberResponse
export type Invitation = auth.InvitationResponse

// Feature-specific types
export interface TeamStats {
	total: number
	admins: number
	viewers: number
}

export interface TeamData {
	members: Member[]
	invitations: Invitation[]
	stats: TeamStats
}

