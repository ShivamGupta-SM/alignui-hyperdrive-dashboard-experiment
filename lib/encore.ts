// Server-only Encore client wrapper
// This file can only be imported on the server-side
import 'server-only'

import Client, { Local, Environment } from './encore-client'
import type { ClientOptions } from './encore-client'

// Determine the base URL based on environment
function getEncoreBaseUrl() {
  // In production, use the environment-specific URL
  if (process.env.NODE_ENV === 'production') {
    const envName = process.env.ENCORE_ENVIRONMENT || 'production'
    return Environment(envName)
  }

  // In development, use local Encore server
  return process.env.ENCORE_API_URL || Local
}

// Create a singleton client instance for server-side use
let clientInstance: Client | null = null

/**
 * Get the Encore client for server-side use.
 * This should only be used in server components and API routes.
 */
export function getEncoreClient(options?: ClientOptions): Client {
  if (!clientInstance) {
    clientInstance = new Client(getEncoreBaseUrl(), options)
  }

  // If options are provided, return a new client with those options
  if (options) {
    return clientInstance.with(options)
  }

  return clientInstance
}

/**
 * Get an authenticated Encore client.
 * Pass the auth token from the request context.
 */
export function getAuthenticatedEncoreClient(authToken: string): Client {
  return getEncoreClient({
    requestInit: {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    },
  })
}

// Re-export types from the generated client for convenience
export type {
  ClientOptions,
} from './encore-client'

// Re-export namespaces for type access
export {
  campaigns,
  enrollments,
  wallets,
  organizations,
  products,
  invoices,
  notifications,
  shared,
  admin,
  auth,
  shoppers,
} from './encore-client'
