/**
 * Products Feature - Public API
 */

// Types
export type * from "./types"

// Hooks
export {
	// Query Keys
	productKeys,
	// Queries
	useProducts,
	useProduct,
	useCategories,
	useCategory,
	useCategoryByName,
	useCategoryProducts,
	// Mutations
	useCreateProduct,
	useUpdateProduct,
	useDeleteProduct,
	useBulkImportProducts,
} from "./hooks/use-products"

// Server Actions
export { createProduct, updateProduct, deleteProduct, bulkImportProducts } from "./actions/products"

// SSR Data Fetching - Import directly from @/features/products/ssr in server components
