"use client"

import type { auth } from "@/lib/api/encore-browser"

// Re-export types from Encore for convenience
export type User = auth.MeResponse

// ============================================
// Types
// ============================================

export interface ProfileData {
	user: User
	sessions: auth.SessionResponse[]
}
