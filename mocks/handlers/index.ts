/**
 * MSW Request Handlers
 *
 * This file combines all mock API handlers into a single array.
 * Each handler file mirrors the actual API route structure from the Encore backend.
 *
 * Handler Organization:
 * - Each handler file corresponds to a domain/feature (auth, campaigns, etc.)
 * - Handlers are organized by API endpoint structure
 * - All handlers use typed responses matching Encore API types
 *
 * Adding New Handlers:
 * 1. Create a new handler file in `mocks/handlers/`
 * 2. Export handlers array from that file
 * 3. Import and add to this array
 */

// Authentication & Authorization
import { authHandlers } from "./auth"

// Dashboard & Analytics
import { dashboardHandlers } from "./dashboard"

// Campaign Management
import { campaignsHandlers } from "./campaigns"

// Enrollment Management
import { enrollmentsHandlers } from "./enrollments"

// Product Management
import { productsHandlers } from "./products"
import { categoriesHandlers } from "./categories"
import { platformsHandlers } from "./platforms"

// Financial
import { walletHandlers } from "./wallet"
import { invoicesHandlers } from "./invoices"

// Organization & Team
import { organizationsHandlers } from "./organizations"
import { teamHandlers } from "./team"
import { profileHandlers } from "./profile"
import { settingsHandlers } from "./settings"

// Notifications & Activity
import { notificationsHandlers } from "./notifications"

// Deliverables & Storage
import { deliverablesHandlers } from "./deliverables"
import { deliverableSubmissionsHandlers } from "./deliverable-submissions"
import { campaignDeliverablesHandlers } from "./campaign-deliverables"
import { storageHandlers } from "./storage"

// Withdrawals
import { withdrawalMethodsHandlers } from "./withdrawal-methods"

/**
 * Combined array of all MSW handlers
 * Order matters: more specific routes should come before general ones
 */
export const handlers = [
	// Auth first (most general routes)
	...authHandlers,
	
	// Dashboard & Analytics
	...dashboardHandlers,
	
	// Core business logic
	...campaignsHandlers,
	...enrollmentsHandlers,
	...productsHandlers,
	
	// Financial
	...walletHandlers,
	...invoicesHandlers,
	...withdrawalMethodsHandlers,
	
	// Organization & Team
	...organizationsHandlers,
	...teamHandlers,
	...profileHandlers,
	...settingsHandlers,
	
	// Supporting features
	...notificationsHandlers,
	...deliverablesHandlers,
	...deliverableSubmissionsHandlers,
	...campaignDeliverablesHandlers,
	...categoriesHandlers,
	...platformsHandlers,
	...storageHandlers,
]

