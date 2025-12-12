'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

/**
 * Route labels mapping - add custom labels for routes here
 */
const ROUTE_LABELS: Record<string, string> = {
  'dashboard': 'Dashboard',
  'campaigns': 'Campaigns',
  'enrollments': 'Enrollments',
  'wallet': 'Wallet',
  'products': 'Products',
  'invoices': 'Invoices',
  'team': 'Team',
  'settings': 'Settings',
  'profile': 'Profile',
  'create': 'Create New',
  'edit': 'Edit',
  'new': 'New',
}

/**
 * Hook to get breadcrumb items based on current pathname.
 * Automatically generates breadcrumbs from URL segments.
 * 
 * @example
 * const breadcrumbs = useBreadcrumbs()
 * // For pathname: /dashboard/campaigns/123
 * // Returns: [
 * //   { label: 'Dashboard', href: '/dashboard' },
 * //   { label: 'Campaigns', href: '/dashboard/campaigns' },
 * //   { label: 'Details' }
 * // ]
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  
  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []
    
    let currentPath = ''
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`
      const isLast = i === segments.length - 1
      
      // Check if it's a dynamic ID segment (numeric or UUID-like)
      const isIdSegment = /^[\d]+$/.test(segment) || /^[a-f0-9-]{36}$/i.test(segment)
      
      if (isIdSegment) {
        // For ID segments, show "Details" without link
        items.push({ label: 'Details' })
      } else {
        // Get label from mapping or format the segment
        const label = ROUTE_LABELS[segment] || formatSegment(segment)
        
        items.push({
          label,
          href: isLast ? undefined : currentPath,
        })
      }
    }
    
    return items
  }, [pathname])
}

/**
 * Format a URL segment into a readable label
 * e.g., "new-campaign" -> "New Campaign"
 */
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
