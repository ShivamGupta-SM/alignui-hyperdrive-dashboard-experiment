/**
 * Network Condition Simulation
 *
 * Simulates various network conditions for realistic testing:
 * - Different speeds (fast, 3G, slow 3G, offline)
 * - Random failures
 * - Latency spikes
 */

// =============================================================================
// TYPES
// =============================================================================

export type NetworkPreset = 'fast' | 'good' | '3g' | 'slow-3g' | 'offline' | 'flaky'

export interface NetworkConfig {
  /** Minimum delay in ms */
  minDelay: number
  /** Maximum delay in ms */
  maxDelay: number
  /** Chance of failure (0-1) */
  failureRate: number
  /** Chance of timeout (0-1) */
  timeoutRate: number
  /** Whether network is completely offline */
  offline: boolean
}

// =============================================================================
// PRESETS
// =============================================================================

export const NETWORK_PRESETS: Record<NetworkPreset, NetworkConfig> = {
  fast: {
    minDelay: 50,
    maxDelay: 150,
    failureRate: 0,
    timeoutRate: 0,
    offline: false,
  },
  good: {
    minDelay: 100,
    maxDelay: 300,
    failureRate: 0.01,
    timeoutRate: 0,
    offline: false,
  },
  '3g': {
    minDelay: 300,
    maxDelay: 800,
    failureRate: 0.02,
    timeoutRate: 0.01,
    offline: false,
  },
  'slow-3g': {
    minDelay: 800,
    maxDelay: 2000,
    failureRate: 0.05,
    timeoutRate: 0.02,
    offline: false,
  },
  offline: {
    minDelay: 0,
    maxDelay: 0,
    failureRate: 1,
    timeoutRate: 0,
    offline: true,
  },
  flaky: {
    minDelay: 100,
    maxDelay: 1500,
    failureRate: 0.15,
    timeoutRate: 0.05,
    offline: false,
  },
}

// =============================================================================
// STATE
// =============================================================================

let currentConfig: NetworkConfig = NETWORK_PRESETS.fast
let currentPreset: NetworkPreset = 'fast'
let isEnabled = true

// =============================================================================
// API
// =============================================================================

/**
 * Set the network simulation preset
 */
export function setNetworkPreset(preset: NetworkPreset): void {
  currentPreset = preset
  currentConfig = NETWORK_PRESETS[preset]
  console.log(`[MSW Network] Preset changed to "${preset}"`, currentConfig)
}

/**
 * Get the current network preset
 */
export function getNetworkPreset(): NetworkPreset {
  return currentPreset
}

/**
 * Get the current network configuration
 */
export function getNetworkConfig(): NetworkConfig {
  return { ...currentConfig }
}

/**
 * Set custom network configuration
 */
export function setNetworkConfig(config: Partial<NetworkConfig>): void {
  currentConfig = { ...currentConfig, ...config }
  currentPreset = 'fast' // Reset to custom
  console.log('[MSW Network] Custom config set', currentConfig)
}

/**
 * Enable/disable network simulation
 */
export function setNetworkSimulationEnabled(enabled: boolean): void {
  isEnabled = enabled
  console.log(`[MSW Network] Simulation ${enabled ? 'enabled' : 'disabled'}`)
}

/**
 * Check if network simulation is enabled
 */
export function isNetworkSimulationEnabled(): boolean {
  return isEnabled
}

/**
 * Simulate network delay based on current config
 */
export async function simulateNetworkDelay(): Promise<void> {
  if (!isEnabled || currentConfig.offline) return

  const delay = currentConfig.minDelay +
    Math.random() * (currentConfig.maxDelay - currentConfig.minDelay)

  await new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Check if request should fail based on current config
 */
export function shouldFailRequest(): boolean {
  if (!isEnabled) return false
  if (currentConfig.offline) return true
  return Math.random() < currentConfig.failureRate
}

/**
 * Check if request should timeout based on current config
 */
export function shouldTimeout(): boolean {
  if (!isEnabled) return false
  return Math.random() < currentConfig.timeoutRate
}

/**
 * Get a random delay value based on current config
 */
export function getRandomDelay(): number {
  if (!isEnabled) return 100 // Default fast delay

  return Math.round(
    currentConfig.minDelay +
    Math.random() * (currentConfig.maxDelay - currentConfig.minDelay)
  )
}

// =============================================================================
// HANDLER HELPER
// =============================================================================

export interface NetworkSimulationResult {
  shouldProceed: boolean
  error?: {
    status: number
    message: string
  }
}

/**
 * Apply network simulation to a request
 * Returns whether the request should proceed or return an error
 */
export async function applyNetworkSimulation(): Promise<NetworkSimulationResult> {
  if (!isEnabled) {
    return { shouldProceed: true }
  }

  // Check offline
  if (currentConfig.offline) {
    return {
      shouldProceed: false,
      error: {
        status: 0,
        message: 'Network offline',
      },
    }
  }

  // Check timeout
  if (shouldTimeout()) {
    // Simulate a long delay then timeout
    await new Promise(resolve => setTimeout(resolve, 30000))
    return {
      shouldProceed: false,
      error: {
        status: 408,
        message: 'Request timeout',
      },
    }
  }

  // Check failure
  if (shouldFailRequest()) {
    await simulateNetworkDelay()
    return {
      shouldProceed: false,
      error: {
        status: 503,
        message: 'Service temporarily unavailable',
      },
    }
  }

  // Apply delay
  await simulateNetworkDelay()

  return { shouldProceed: true }
}

// =============================================================================
// STATISTICS
// =============================================================================

interface NetworkStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  timeoutRequests: number
  averageLatency: number
  latencies: number[]
}

const stats: NetworkStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  timeoutRequests: 0,
  averageLatency: 0,
  latencies: [],
}

/**
 * Record request statistics
 */
export function recordRequestStats(options: {
  success: boolean
  timeout?: boolean
  latency: number
}): void {
  stats.totalRequests++

  if (options.timeout) {
    stats.timeoutRequests++
  } else if (options.success) {
    stats.successfulRequests++
  } else {
    stats.failedRequests++
  }

  stats.latencies.push(options.latency)
  if (stats.latencies.length > 100) {
    stats.latencies.shift() // Keep last 100
  }

  stats.averageLatency = stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
}

/**
 * Get network statistics
 */
export function getNetworkStats(): NetworkStats {
  return { ...stats }
}

/**
 * Reset network statistics
 */
export function resetNetworkStats(): void {
  stats.totalRequests = 0
  stats.successfulRequests = 0
  stats.failedRequests = 0
  stats.timeoutRequests = 0
  stats.averageLatency = 0
  stats.latencies = []
}

// =============================================================================
// GLOBAL EXPOSURE FOR DEVTOOLS
// =============================================================================

if (typeof window !== 'undefined') {
  // Expose to window for devtools and debugging
  (window as Window & { __MSW_NETWORK__?: unknown }).__MSW_NETWORK__ = {
    setPreset: setNetworkPreset,
    getPreset: getNetworkPreset,
    setConfig: setNetworkConfig,
    getConfig: getNetworkConfig,
    setEnabled: setNetworkSimulationEnabled,
    isEnabled: isNetworkSimulationEnabled,
    getStats: getNetworkStats,
    resetStats: resetNetworkStats,
    PRESETS: NETWORK_PRESETS,
  }
}
