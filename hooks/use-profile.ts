'use client'

import type { auth } from '@/lib/encore-browser'

// Re-export types from Encore for convenience
export type User = auth.User
export type Session = auth.Session

// ============================================
// Types
// ============================================

export interface ProfileData {
  user: User
  sessions: Session[]
}
