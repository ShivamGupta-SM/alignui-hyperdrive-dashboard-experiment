'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { cn } from '@/utils/cn'

interface LogoProps {
  /** Width of the logo */
  width?: number
  /** Height of the logo */
  height?: number
  /** Additional CSS classes */
  className?: string
  /** Whether to show just the icon (first letter/symbol) or full logo */
  variant?: 'full' | 'icon'
  /** Force a specific theme variant */
  forceTheme?: 'light' | 'dark'
}

/**
 * Hypedrive Logo Component
 * Automatically switches between light and dark variants based on theme
 */
export function Logo({
  width = 120,
  height = 28,
  className,
  variant = 'full',
  forceTheme,
}: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to show based on theme
  const isDark = forceTheme ? forceTheme === 'dark' : resolvedTheme === 'dark'
  
  // Full logo sources (with text)
  const logoSrc = isDark
    ? '/images/hypedrive-logo-dark.svg'
    : '/images/hypedrive-logo.svg'
  
  // Icon-only sources (just the arrow symbol)
  const iconSrc = isDark
    ? '/images/hypedrive-icon-dark.svg'
    : '/images/hypedrive-icon.svg'

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn('animate-pulse bg-bg-weak-50 rounded', className)}
        style={{ width: variant === 'icon' ? height : width, height }}
      />
    )
  }

  if (variant === 'icon') {
    return (
      <Image
        src={iconSrc}
        alt="Hypedrive"
        width={height}
        height={height}
        className={cn('object-contain', className)}
        priority
      />
    )
  }

  return (
    <Image
      src={logoSrc}
      alt="Hypedrive"
      width={width}
      height={height}
      className={cn('object-contain', className)}
      priority
    />
  )
}

/**
 * Logo Icon - Just the arrow symbol
 * Uses the actual SVG icon file
 */
export function LogoIcon({
  size = 32,
  className,
  forceTheme,
}: {
  size?: number
  className?: string
  forceTheme?: 'light' | 'dark'
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which icon to show based on theme
  const isDark = forceTheme ? forceTheme === 'dark' : resolvedTheme === 'dark'
  const iconSrc = isDark
    ? '/images/hypedrive-icon-dark.svg'
    : '/images/hypedrive-icon.svg'

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn('animate-pulse bg-bg-weak-50 rounded', className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <Image
      src={iconSrc}
      alt="Hypedrive"
      width={size}
      height={size}
      className={cn('object-contain', className)}
      priority
    />
  )
}

export default Logo

