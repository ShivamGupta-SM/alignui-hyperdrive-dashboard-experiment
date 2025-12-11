'use client'

import { useEffect, useState } from 'react'
import { MSWDevTools } from './msw-devtools'

/**
 * MSW Initialization Component
 *
 * This component initializes MSW in the browser with:
 * - Service Worker setup
 * - Database initialization with persistence (IndexedDB)
 * - Network simulation
 * - DevTools panel
 *
 * Note: MSW is only initialized in development when NEXT_PUBLIC_API_MOCKING=enabled
 */
export function MSWInit({ children }: { children: React.ReactNode }) {
  const [mockingReady, setMockingReady] = useState(false)

  useEffect(() => {
    async function enableMocking() {
      // Only mock in development
      if (process.env.NODE_ENV !== 'development') {
        setMockingReady(true)
        return
      }

      // Check if mocking is enabled
      if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
        setMockingReady(true)
        return
      }

      try {
        // Initialize MSW handlers
        const { initMocks } = await import('@/mocks')
        await initMocks()

        // Initialize database with seeding
        const { db, seedDatabase, clearDatabase, resetDatabase } = await import('@/mocks/db')

        // Seed database if empty (findMany is synchronous in @msw/data)
        const campaigns = db.campaigns.findMany()
        if (campaigns.length === 0) {
          console.log('[MSW] Seeding database...')
          await seedDatabase('full')
        }

        // Expose database utilities globally for DevTools
        const win = window as Window & {
          __MSW_DB__?: {
            db: typeof db
            seed: typeof seedDatabase
            clear: typeof clearDatabase
            reset: typeof resetDatabase
            getStats: () => {
              campaigns: number
              enrollments: number
              products: number
              invoices: number
              transactions: number
              teamMembers: number
              notifications: number
            }
          }
        }

        win.__MSW_DB__ = {
          db,
          seed: seedDatabase,
          clear: clearDatabase,
          reset: resetDatabase,
          getStats: () => ({
            campaigns: db.campaigns.findMany().length,
            enrollments: db.enrollments.findMany().length,
            products: db.products.findMany().length,
            invoices: db.invoices.findMany().length,
            transactions: db.transactions.findMany().length,
            teamMembers: db.teamMembers.findMany().length,
            notifications: db.notifications.findMany().length,
          }),
        }

        console.log('[MSW] Database ready')
      } catch (error) {
        console.warn('[MSW] Failed to initialize mocking:', error)
      }

      setMockingReady(true)
    }

    enableMocking()
  }, [])

  // In production or when mocking is disabled, render children immediately
  if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
    return <>{children}</>
  }

  // In development with mocking, wait for MSW to be ready
  if (!mockingReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-white-0 dark:bg-bg-strong-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-base border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-label-sm text-text-soft-400">Initializing mock API...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <MSWDevTools />
    </>
  )
}
