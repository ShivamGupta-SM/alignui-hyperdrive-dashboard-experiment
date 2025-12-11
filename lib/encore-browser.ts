/**
 * Browser-safe Encore client
 *
 * This file can be imported in 'use client' components.
 * For server-only usage, use lib/encore.ts instead.
 */

import Client, { Local, Environment } from "./encore-client";
import type { ClientOptions } from "./encore-client";

// Get base URL based on environment
function getBaseUrl(): string {
  // Server-side rendering - use env variable or local
  if (typeof window === "undefined") {
    return process.env.ENCORE_API_URL || Local;
  }

  // Client-side - use public env variable or local
  return process.env.NEXT_PUBLIC_ENCORE_URL || Local;
}

// Singleton client instance
let clientInstance: Client | null = null;

/**
 * Get the Encore client for browser/client-side use.
 * Uses a singleton pattern to reuse the client instance.
 */
export function getEncoreBrowserClient(options?: ClientOptions): Client {
  if (!clientInstance) {
    clientInstance = new Client(getBaseUrl(), {
      // Include credentials for cookie-based auth
      requestInit: {
        credentials: "include",
      },
      ...options,
    });
  }

  // If options are provided, create a new client with merged options
  if (options) {
    return clientInstance.with(options);
  }

  return clientInstance;
}

/**
 * Get an authenticated Encore client with a bearer token.
 * Use this when you have an explicit auth token (e.g., from localStorage).
 */
export function getAuthenticatedBrowserClient(token: string): Client {
  return getEncoreBrowserClient({
    requestInit: {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Reset the client instance (useful for testing or sign-out)
 */
export function resetEncoreBrowserClient(): void {
  clientInstance = null;
}

// Re-export everything from encore-client for convenience
export { Local, Environment } from "./encore-client";
export type { ClientOptions } from "./encore-client";

// Re-export all service namespaces for type access
export {
  admin,
  auth,
  campaigns,
  coupons,
  enrollments,
  integrations,
  invoices,
  notifications,
  organizations,
  products,
  shared,
  shoppers,
  storage,
  wallets,
  webhooks,
} from "./encore-client";

// Re-export the Client class as default
export default Client;
