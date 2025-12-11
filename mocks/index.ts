/**
 * MSW Entry Point
 *
 * Provides utilities to start MSW in different environments.
 * This module handles the dynamic import of browser/server workers.
 */

export async function initMocks() {
  // Only initialize mocks in development
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Check if mocking is enabled via environment variable
  // This allows easily toggling mocks on/off
  if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
    console.log('[MSW] Mocking disabled (set NEXT_PUBLIC_API_MOCKING=enabled to enable)')
    return
  }

  if (typeof window === 'undefined') {
    // Server-side: use Node.js server
    const { server } = await import('./server')
    server.listen({
      onUnhandledRequest: 'bypass',
    })
    console.log('[MSW] Server mocking enabled')
  } else {
    // Client-side: use Service Worker
    const { worker, startOptions } = await import('./browser')
    await worker.start(startOptions)
    console.log('[MSW] Browser mocking enabled')
  }
}

// Re-export handlers for testing
export { handlers } from './handlers'
