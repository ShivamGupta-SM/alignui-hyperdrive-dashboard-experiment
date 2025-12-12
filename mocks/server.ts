/**
 * MSW Server Setup for Node.js (SSR)
 * This runs on the server side during SSR/RSC
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
