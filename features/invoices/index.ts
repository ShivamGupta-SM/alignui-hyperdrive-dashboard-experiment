/**
 * Invoices Feature - Public API
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	invoiceKeys,
	// Queries
	useInvoices,
	useInvoice,
	useInvoiceLineItems,
	// Mutations
	useGenerateInvoicePDF,
	useDownloadInvoicePDF,
	useGetInvoiceEnrollmentIds,
	useGetEnrollmentsByIds,
} from "./hooks/use-invoices"

// Server Actions
export {
	generateInvoicePDF,
	downloadInvoicePDF,
	getInvoiceEnrollmentIds,
	getEnrollmentsByIds,
} from "./actions/invoices"

// SSR Data Fetching - Import directly from @/features/invoices/ssr in server components
