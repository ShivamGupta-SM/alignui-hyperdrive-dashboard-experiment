/**
 * MSW Server Setup (for SSR/Node.js environments)
 *
 * This file sets up the Mock Service Worker for Node.js environments.
 * Used during SSR/server-side data fetching in Next.js.
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Create the server with all handlers
export const server = setupServer(...handlers)
