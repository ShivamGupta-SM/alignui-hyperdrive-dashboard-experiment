// Product Types

export interface Product {
  id: string
  organizationId: string
  name: string
  description?: string
  sku?: string
  price?: number
  image?: string
  imageUrl?: string
  images?: string[]
  category: string
  platform: string
  productUrl?: string
  campaignCount: number
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}
