'use client'

/**
 * MSW DevTools
 *
 * A floating panel for debugging and controlling MSW mocks in development.
 * Features:
 * - View/reset database state
 * - Control network conditions
 * - View request logs
 * - Switch between data scenarios
 */

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'

// Types
interface NetworkPreset {
  name: string
  value: string
  description: string
}

interface DbStats {
  campaigns: number
  enrollments: number
  products: number
  invoices: number
  transactions: number
  teamMembers: number
  notifications: number
}

interface RequestLog {
  id: string
  method: string
  url: string
  status: number
  duration: number
  timestamp: Date
}

// Network presets
const NETWORK_PRESETS: NetworkPreset[] = [
  { name: 'Fast', value: 'fast', description: '50-150ms' },
  { name: 'Good', value: 'good', description: '100-300ms' },
  { name: '3G', value: '3g', description: '300-800ms' },
  { name: 'Slow 3G', value: 'slow-3g', description: '800-2000ms' },
  { name: 'Flaky', value: 'flaky', description: 'Random failures' },
  { name: 'Offline', value: 'offline', description: 'No connection' },
]

export function MSWDevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'database' | 'network' | 'requests'>('database')
  const [networkPreset, setNetworkPreset] = useState('fast')
  const [dbStats, setDbStats] = useState<DbStats | null>(null)
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Only show in development with mocking enabled
  const [isMockingEnabled, setIsMockingEnabled] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
      setIsMockingEnabled(true)
    }
  }, [])

  // Fetch DB stats
  const fetchDbStats = useCallback(async () => {
    try {
      // Access the global MSW DB if available
      const mswDb = (window as Window & { __MSW_DB__?: { getStats: () => Promise<DbStats> } }).__MSW_DB__
      if (mswDb?.getStats) {
        const stats = await mswDb.getStats()
        setDbStats(stats)
      }
    } catch (error) {
      console.error('[MSW DevTools] Failed to fetch DB stats:', error)
    }
  }, [])

  // Handle network preset change
  const handleNetworkChange = useCallback((preset: string) => {
    setNetworkPreset(preset)
    const mswNetwork = (window as Window & { __MSW_NETWORK__?: { setPreset: (p: string) => void } }).__MSW_NETWORK__
    if (mswNetwork?.setPreset) {
      mswNetwork.setPreset(preset)
    }
  }, [])

  // Reset database
  const handleResetDb = useCallback(async () => {
    setIsLoading(true)
    try {
      const mswDb = (window as Window & { __MSW_DB__?: { reset: (scenario: string) => Promise<void> } }).__MSW_DB__
      if (mswDb?.reset) {
        await mswDb.reset('full')
        await fetchDbStats()
      }
    } catch (error) {
      console.error('[MSW DevTools] Failed to reset DB:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchDbStats])

  // Clear database
  const handleClearDb = useCallback(async () => {
    setIsLoading(true)
    try {
      const mswDb = (window as Window & { __MSW_DB__?: { clear: () => Promise<void> } }).__MSW_DB__
      if (mswDb?.clear) {
        await mswDb.clear()
        await fetchDbStats()
      }
    } catch (error) {
      console.error('[MSW DevTools] Failed to clear DB:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchDbStats])

  // Fetch stats when opened
  useEffect(() => {
    if (isOpen) {
      fetchDbStats()
    }
  }, [isOpen, fetchDbStats])

  // Listen for request logs
  useEffect(() => {
    if (!isOpen) return

    const handleRequest = (event: CustomEvent<RequestLog>) => {
      setRequestLogs(prev => [event.detail, ...prev].slice(0, 50))
    }

    window.addEventListener('msw:request' as keyof WindowEventMap, handleRequest as EventListener)
    return () => {
      window.removeEventListener('msw:request' as keyof WindowEventMap, handleRequest as EventListener)
    }
  }, [isOpen])

  if (!isMockingEnabled) {
    return null
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'w-12 h-12 rounded-full',
          'bg-primary-base text-white',
          'shadow-lg hover:shadow-xl',
          'flex items-center justify-center',
          'transition-all duration-200',
          'hover:scale-110'
        )}
        title="MSW DevTools"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-20 right-4 z-50',
            'w-96 max-h-[70vh]',
            'bg-bg-white-0 dark:bg-bg-strong-950',
            'border border-stroke-soft-200 dark:border-stroke-soft-200/20',
            'rounded-20 shadow-custom-lg',
            'flex flex-col overflow-hidden'
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-stroke-soft-200 dark:border-stroke-soft-200/20">
            <div className="flex items-center justify-between">
              <h3 className="text-label-md font-semibold text-text-strong-950 dark:text-white">
                MSW DevTools
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-soft-400 hover:text-text-strong-950 dark:hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-3">
              {(['database', 'network', 'requests'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-1.5 rounded-10 text-label-sm capitalize transition-colors',
                    activeTab === tab
                      ? 'bg-primary-base text-white'
                      : 'bg-bg-weak-50 dark:bg-bg-surface-800 text-text-sub-600 dark:text-text-soft-400 hover:bg-bg-soft-200 dark:hover:bg-bg-surface-800/80'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Database Tab */}
            {activeTab === 'database' && (
              <div className="space-y-4">
                {/* Stats */}
                {dbStats ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(dbStats).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-2 rounded-10 bg-bg-weak-50 dark:bg-bg-surface-800"
                      >
                        <div className="text-label-xs text-text-soft-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-label-md font-semibold text-text-strong-950 dark:text-white">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-text-soft-400">
                    Loading stats...
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleResetDb}
                    disabled={isLoading}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-10',
                      'bg-primary-base text-white',
                      'hover:bg-primary-darker',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'text-label-sm font-medium'
                    )}
                  >
                    {isLoading ? 'Loading...' : 'Reset DB'}
                  </button>
                  <button
                    onClick={handleClearDb}
                    disabled={isLoading}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-10',
                      'bg-error-base text-white',
                      'hover:bg-error-darker',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'text-label-sm font-medium'
                    )}
                  >
                    {isLoading ? 'Loading...' : 'Clear DB'}
                  </button>
                </div>

                {/* Scenario Buttons */}
                <div className="space-y-2">
                  <div className="text-label-xs text-text-soft-400 uppercase tracking-wider">
                    Seed Scenario
                  </div>
                  <div className="flex gap-2">
                    {['empty', 'minimal', 'full'].map(scenario => (
                      <button
                        key={scenario}
                        onClick={async () => {
                          setIsLoading(true)
                          const mswDb = (window as Window & { __MSW_DB__?: { reset: (s: string) => Promise<void> } }).__MSW_DB__
                          if (mswDb?.reset) {
                            await mswDb.reset(scenario)
                            await fetchDbStats()
                          }
                          setIsLoading(false)
                        }}
                        disabled={isLoading}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-10',
                          'bg-bg-weak-50 dark:bg-bg-surface-800',
                          'hover:bg-bg-soft-200 dark:hover:bg-bg-surface-800/80',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'text-label-sm font-medium capitalize',
                          'text-text-strong-950 dark:text-white'
                        )}
                      >
                        {scenario}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Network Tab */}
            {activeTab === 'network' && (
              <div className="space-y-4">
                <div className="text-label-xs text-text-soft-400 uppercase tracking-wider">
                  Network Preset
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {NETWORK_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => handleNetworkChange(preset.value)}
                      className={cn(
                        'p-3 rounded-10 text-left transition-all',
                        networkPreset === preset.value
                          ? 'bg-primary-base text-white'
                          : 'bg-bg-weak-50 dark:bg-bg-surface-800 hover:bg-bg-soft-200 dark:hover:bg-bg-surface-800/80'
                      )}
                    >
                      <div className={cn(
                        'text-label-sm font-medium',
                        networkPreset === preset.value ? 'text-white' : 'text-text-strong-950 dark:text-white'
                      )}>
                        {preset.name}
                      </div>
                      <div className={cn(
                        'text-label-xs',
                        networkPreset === preset.value ? 'text-white/70' : 'text-text-soft-400'
                      )}>
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-2">
                {requestLogs.length === 0 ? (
                  <div className="text-center py-8 text-text-soft-400">
                    No requests logged yet
                  </div>
                ) : (
                  requestLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-2 rounded-10 bg-bg-weak-50 dark:bg-bg-surface-800 text-label-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded font-mono',
                          log.method === 'GET' ? 'bg-information-lighter text-information-dark' :
                          log.method === 'POST' ? 'bg-success-lighter text-success-dark' :
                          log.method === 'DELETE' ? 'bg-error-lighter text-error-dark' :
                          'bg-warning-lighter text-warning-dark'
                        )}>
                          {log.method}
                        </span>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded font-mono',
                          log.status >= 200 && log.status < 300 ? 'bg-success-lighter text-success-dark' :
                          log.status >= 400 ? 'bg-error-lighter text-error-dark' :
                          'bg-warning-lighter text-warning-dark'
                        )}>
                          {log.status}
                        </span>
                        <span className="text-text-soft-400">
                          {log.duration}ms
                        </span>
                      </div>
                      <div className="mt-1 truncate text-text-sub-600 dark:text-text-soft-400 font-mono">
                        {log.url}
                      </div>
                    </div>
                  ))
                )}
                {requestLogs.length > 0 && (
                  <button
                    onClick={() => setRequestLogs([])}
                    className="w-full px-3 py-2 rounded-10 bg-bg-weak-50 dark:bg-bg-surface-800 text-label-sm text-text-sub-600 dark:text-text-soft-400 hover:bg-bg-soft-200 dark:hover:bg-bg-surface-800/80"
                  >
                    Clear logs
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-stroke-soft-200 dark:border-stroke-soft-200/20 bg-bg-weak-50 dark:bg-bg-surface-800">
            <div className="flex items-center justify-between text-label-xs text-text-soft-400">
              <span>MSW {process.env.NODE_ENV}</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success-base animate-pulse" />
                Mocking Active
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
