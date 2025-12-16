/**
 * Products Feature Types
 */

import type { products } from "@/lib/api/encore-client"

// Re-export from Encore client
export type Product = products.Product
export type ProductWithStats = products.ProductWithStats

// Feature-specific types
export interface ProductFilters {
	search?: string
	category?: string
	platform?: string
	page?: number
	limit?: number
	[key: string]: string | number | undefined
}

export interface ProductStats {
	total: number
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
	productImages?: string[]
}

export interface BulkImportProduct {
	name: string
	description?: string
	sku: string
	categoryId?: string
	platformId?: string
	price: number
	productLink: string
	productImages?: string[]
}

export interface BulkImportResult {
	imported: number
	failed: number
	errors: string[]
	message: string
	success: boolean
}

export interface ProductCampaignSummary {
	id: string
	title: string
	status: string
	startDate: string
	endDate: string
}
