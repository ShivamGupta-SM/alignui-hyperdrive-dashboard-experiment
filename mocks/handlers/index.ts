/**
 * MSW Request Handlers
 *
 * This file combines all mock API handlers.
 * Each handler mirrors the actual API route structure.
 */

import { dashboardHandlers } from './dashboard'
import { campaignsHandlers } from './campaigns'
import { enrollmentsHandlers } from './enrollments'
import { walletHandlers } from './wallet'
import { teamHandlers } from './team'
import { profileHandlers } from './profile'
import { authHandlers } from './auth'
import { notificationsHandlers } from './notifications'
import { productsHandlers } from './products'
import { invoicesHandlers } from './invoices'
import { deliverablesHandlers } from './deliverables'
import { platformsHandlers } from './platforms'
import { categoriesHandlers } from './categories'
import { storageHandlers } from './storage'
import { organizationsHandlers } from './organizations'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...campaignsHandlers,
  ...enrollmentsHandlers,
  ...walletHandlers,
  ...teamHandlers,
  ...profileHandlers,
  ...notificationsHandlers,
  ...productsHandlers,
  ...invoicesHandlers,
  ...deliverablesHandlers,
  ...platformsHandlers,
  ...categoriesHandlers,
  ...storageHandlers,
  ...organizationsHandlers,
]
