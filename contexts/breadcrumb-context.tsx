'use client'

import * as React from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbContextType {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([])
  
  return (
    <BreadcrumbContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

/**
 * Hook to set breadcrumbs from a page component.
 * 
 * @example
 * // In a page component:
 * useBreadcrumbs([
 *   { label: 'Dashboard', href: '/dashboard' },
 *   { label: 'Campaigns', href: '/dashboard/campaigns' },
 *   { label: 'Nike Summer Sale 2024' } // Current page (no href)
 * ])
 */
export function useBreadcrumbs(items: BreadcrumbItem[]) {
  const context = React.useContext(BreadcrumbContext)
  
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider')
  }
  
  React.useEffect(() => {
    context.setItems(items)
    
    // Clear breadcrumbs on unmount
    return () => {
      context.setItems([])
    }
  }, [JSON.stringify(items)]) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook to read current breadcrumbs (used by layout/header).
 */
export function useBreadcrumbItems() {
  const context = React.useContext(BreadcrumbContext)
  
  if (!context) {
    throw new Error('useBreadcrumbItems must be used within a BreadcrumbProvider')
  }
  
  return context.items
}

export { BreadcrumbContext }
