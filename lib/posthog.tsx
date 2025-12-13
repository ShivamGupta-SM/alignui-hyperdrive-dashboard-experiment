'use client'

import { ReactNode } from 'react'

// PostHog provider stub - analytics disabled for now
export function PostHogProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
