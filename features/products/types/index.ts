/**
 * Products Feature Types
 *
 * @description
 * Single source of truth for all product-related types.
 * Product types are in 'organizations' namespace (used in org-scoped endpoints)
 */

import type { organizations, products } from "@/brand-client"
import type { BaseFilters, BaseStats } from "@/lib/types/base"

// Core product types - from organizations namespace (org-scoped endpoints)
export type Product = organizations.Product
export type ProductWithStats = organizations.ProductWithStats
export type ProductImageItem = organizations.ProductImageItem
export type ProductImageInput = organizations.ProductImageInput

// Request/Response types - from organizations namespace
export type CreateProductRequest = organizations.CreateProductRequest
export type UpdateProductRequest = organizations.UpdateProductRequest
export type BulkProductInput = organizations.BulkProductInput
export type ListOrganizationProductsParams = organizations.ListOrganizationProductsParams

// Category types - from products namespace (platform-level)
export type ProductCategory = products.ProductCategory
export type ListCategoriesParams = products.ListCategoriesParams
export type ProductCategoriesResponse = products.ProductCategoriesResponse
export type ListProductsParams = products.ListProductsParams
// ProductWithStats also available in products namespace
export type ProductsProductWithStats = products.ProductWithStats

// Feature-specific types
export interface ProductFilters extends BaseFilters {
	category?: string
	categoryId?: string
	platform?: string
	platformId?: string
	[key: string]: string | number | undefined
}

export interface ProductStats extends BaseStats {
	withCampaigns: number
	totalCampaigns: number
	categories: number
}

export interface ProductsData {
	products: ProductWithStats[]
	stats: ProductStats
}

export interface CreateProductData {
	name: string
	description?: string
	sku: string
	categoryId?: string
	platformId?: string
	price: number
	productLink: string
	productImages?: ProductImageInput[]
}

export interface BulkImportResult {
	imported: number
	failed: number
	errors: string[]
	message?: string
	success?: boolean
}

export interface ProductCampaignSummary {
	id: string
	title: string
	status: string
	startDate: string
	endDate: string
}
