/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js at startup.
 * Used to initialize MSW for server-side mocking during development.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only enable mocking in development when explicitly enabled
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'
    ) {
      const { server } = await import('./mocks/server')
      server.listen({
        onUnhandledRequest: 'bypass',
      })
      console.log('[MSW] Server-side mocking enabled')
    }
  }
}
