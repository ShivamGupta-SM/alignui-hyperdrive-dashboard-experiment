"use client"

import type { organizations, auth } from "@/lib/encore-browser"

// ============================================
// Types - Re-export from Encore client for convenience
// ============================================

export type Member = auth.MemberResponse
export type Invitation = auth.InvitationResponse

// ============================================
// Types
// ============================================

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
