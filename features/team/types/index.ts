/**
 * Team Feature Types
 *
 * @description
 * Single source of truth for all team-related types.
 */

import type { auth } from "@/brand-client"
import type { BaseStats } from "@/lib/types/base"

// Re-export from Encore client
export type Member = auth.MemberResponse
export type Invitation = auth.InvitationResponse
export type InvitationsListResponse = auth.InvitationsListResponse
export type RoleResponse = auth.RoleResponse
export type TeamMetadata = auth.TeamMetadata

// User types for team context
export type UserResponse = auth.UserResponse

// User role type (covers all possible roles in the system)
export type UserRole = "owner" | "admin" | "manager" | "viewer"

// Feature-specific types
export interface TeamStats extends BaseStats {
	admins: number
	members: number
	owners: number
}

export interface TeamData {
	members: Member[]
	invitations: Invitation[]
	stats: TeamStats
}

export type TeamMemberRole = "owner" | "admin" | "member"

export interface InviteMemberInput {
	email: string
	role: TeamMemberRole
}

export interface UpdateMemberRoleInput {
	memberId: string
	role: TeamMemberRole
}
