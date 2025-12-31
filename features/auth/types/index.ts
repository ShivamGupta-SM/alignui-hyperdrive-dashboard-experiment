/**
 * Auth Feature Types
 *
 * @description
 * Single source of truth for all authentication-related types.
 * Note: Team/Member types are in team module (SSOT).
 */

import type { auth } from "@/brand-client"

// Re-export from Encore client - Auth-specific types only
export type MeResponse = auth.MeResponse
export type UserResponse = auth.UserResponse
export type SessionResponse = auth.SessionResponse
export type DeviceSession = auth.DeviceSession
export type OrganizationResponse = auth.OrganizationResponse
export type ActiveMemberResponse = auth.ActiveMemberResponse
export type PermissionsResponse = auth.PermissionsResponse
export type LinkedAccountResponse = auth.LinkedAccountResponse
export type SocialSignInResponse = auth.SocialSignInResponse
export type IdToken = auth.IdToken
export type AuthParams = auth.AuthParams

// Note: Team-related types (Member, Invitation, etc.) are in @/features/team/types
// Import from there directly - auth module only exports auth-specific types

// Session user type
export interface SessionUser {
	id: string
	name: string
	email: string
	emailVerified: boolean
	image?: string | null
	role: string
	organizationRole?: string
	organizationIds?: string[]
	createdAt: string
	updatedAt: string
}

// Feature-specific types
export interface SignInCredentials {
	email: string
	password: string
}

export interface SignUpCredentials {
	email: string
	password: string
	name: string
}

export interface ForgotPasswordInput {
	email: string
}

export interface ResetPasswordInput {
	token: string
	newPassword: string
}

export interface ChangePasswordInput {
	currentPassword: string
	newPassword: string
}

export interface AuthState {
	user: MeResponse | null
	isAuthenticated: boolean
	isLoading: boolean
}
