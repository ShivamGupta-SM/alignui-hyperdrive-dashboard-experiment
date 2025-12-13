'use client'

import { AvatarWithFallback } from '@/components/ui/avatar'
import type { auth } from '@/lib/encore-client'

interface UserAvatarProps {
  user?: auth.MeResponse | null
  className?: string
  size?: '20' | '24' | '32' | '40' | '48' | '56' | '64' | '72' | '80'
}

/**
 * Custom UserAvatar component using Encore client
 */
export function UserAvatar({ user, className, size = '40' }: UserAvatarProps) {
  if (!user) {
    return (
      <AvatarWithFallback
        size={size}
        className={className}
        name="User"
      />
    )
  }

  const name = user.name || user.email || 'User'
  const imageUrl = user.image || undefined

  return (
    <AvatarWithFallback
      src={imageUrl}
      alt={name}
      name={name}
      size={size}
      className={className}
    />
  )
}
