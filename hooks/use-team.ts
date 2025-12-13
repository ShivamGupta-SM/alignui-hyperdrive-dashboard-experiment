'use client'

import type { organizations, auth } from '@/lib/encore-browser'

// ============================================
// Types - Re-export from Encore client for convenience
// ============================================

export type Member = organizations.Member
export type Invitation = auth.Invitation

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
