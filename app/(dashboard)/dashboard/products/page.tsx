'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Select from '@/components/ui/select'
import * as Modal from '@/components/ui/modal'
import * as Textarea from '@/components/ui/textarea'
import * as StatusBadge from '@/components/ui/status-badge'
import * as List from '@/components/ui/list'
import { Metric, MetricGroup } from '@/components/ui/metric'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import * as FileUpload from '@/components/ui/file-upload'
import {
  RiAddLine,
  RiSearchLine,
  RiShoppingBag3Line,
  RiEditLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiImageLine,
  RiUploadCloud2Line,
  RiMegaphoneLine,
} from '@remixicon/react'
import { cn } from '@/utils/cn'
import type { Product } from '@/lib/types'
import { E_COMMERCE_PLATFORMS, PRODUCT_CATEGORIES } from '@/lib/constants'

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    organizationId: '1',
    name: 'Nike Air Max 2024',
    description: 'Latest Air Max sneakers with advanced cushioning',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'Footwear',
    platform: 'Amazon',
    productUrl: 'https://amazon.in/dp/B0123456',
    campaignCount: 3,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    organizationId: '1',
    name: 'Samsung Galaxy S24',
    description: 'Flagship smartphone with AI features',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Flipkart',
    productUrl: 'https://flipkart.com/samsung-s24',
    campaignCount: 2,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: '3',
    organizationId: '1',
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-cancelling headphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
    category: 'Electronics',
    platform: 'Any Platform',
    productUrl: undefined,
    campaignCount: 1,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-01'),
  },
]

// Get stats from products
const getStats = (products: Product[]) => {
  const total = products.length
  const withCampaigns = products.filter(p => p.campaignCount > 0).length
  const totalCampaigns = products.reduce((acc, p) => acc + p.campaignCount, 0)
  const categories = new Set(products.map(p => p.category)).size
  
  return { total, withCampaigns, totalCampaigns, categories }
}

export default function ProductsPage() {
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [platformFilter, setPlatformFilter] = React.useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)

  const filteredProducts = React.useMemo(() => {
    let result = mockProducts

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter)
    }

    if (platformFilter !== 'all') {
      result = result.filter((p) => p.platform === platformFilter)
    }

    return result
  }, [search, categoryFilter, platformFilter])

  const stats = React.useMemo(() => getStats(mockProducts), [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Products</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-1">
            Manage your product catalog for campaigns
          </p>
        </div>
        <Button.Root variant="primary" onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Button.Icon as={RiAddLine} />
          Add Product
        </Button.Root>
      </div>

      {/* Stats Overview */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <MetricGroup columns={4} className="grid-cols-2 sm:grid-cols-4">
          <Metric label="Total Products" value={stats.total} size="sm" />
          <Metric label="With Campaigns" value={stats.withCampaigns} size="sm" />
          <Metric label="Total Campaigns" value={stats.totalCampaigns} size="sm" />
          <Metric label="Categories" value={stats.categories} size="sm" />
        </MetricGroup>
      </div>

      {/* Filters */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="flex-1 w-full sm:max-w-xs">
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={RiSearchLine} />
                <Input.El
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:gap-4">
            <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger className="w-full sm:w-40">
                <Select.Value placeholder="Category" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Categories</Select.Item>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <Select.Item key={cat} value={cat}>{cat}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Select.Root value={platformFilter} onValueChange={setPlatformFilter}>
              <Select.Trigger className="w-full sm:w-40">
                <Select.Value placeholder="Platform" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Platforms</Select.Item>
                {E_COMMERCE_PLATFORMS.map((platform) => (
                  <Select.Item key={platform} value={platform}>{platform}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState.Root size="large">
          <EmptyState.Header>
            <EmptyState.Icon color="gray">
              <RiShoppingBag3Line className="size-full" />
            </EmptyState.Icon>
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>
              {search || categoryFilter !== 'all' || platformFilter !== 'all'
                ? 'No products found'
                : 'No products yet'}
            </EmptyState.Title>
            <EmptyState.Description>
              {search || categoryFilter !== 'all' || platformFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add products to create campaigns. Products help shoppers understand what they\'re purchasing.'}
            </EmptyState.Description>
          </EmptyState.Content>
          <EmptyState.Footer>
            <Button.Root variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <Button.Icon as={RiAddLine} />
              Add First Product
            </Button.Root>
          </EmptyState.Footer>
        </EmptyState.Root>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditingProduct(product)}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <ProductModal
        open={isAddModalOpen || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false)
            setEditingProduct(null)
          }
        }}
        product={editingProduct}
      />
    </div>
  )
}

// Product Card Component - Improved
interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
}

function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden hover:ring-primary-base transition-all">
      {/* Image */}
      <div className="aspect-video bg-bg-weak-50 flex items-center justify-center relative">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <RiImageLine className="size-12 text-text-soft-400" />
        )}
        {product.campaignCount > 0 && (
          <div className="absolute top-2 right-2">
            <StatusBadge.Root status="completed" variant="light">
              <StatusBadge.Icon as={RiMegaphoneLine} />
              {product.campaignCount} campaigns
            </StatusBadge.Root>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-label-md text-text-strong-950 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-paragraph-sm text-text-sub-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        
        {/* Meta info using List */}
        <List.Root size="sm" className="mb-4">
          <List.Item>
            <List.ItemContent>
              <List.ItemDescription>Category</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <span className="text-paragraph-xs text-text-strong-950">{product.category}</span>
            </List.ItemAction>
          </List.Item>
          <List.Item>
            <List.ItemContent>
              <List.ItemDescription>Platform</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <span className="text-paragraph-xs text-text-strong-950">{product.platform}</span>
            </List.ItemAction>
          </List.Item>
        </List.Root>

        <div className="flex items-center gap-2">
          <Button.Root variant="basic" size="small" onClick={onEdit}>
            <Button.Icon as={RiEditLine} />
            Edit
          </Button.Root>
          {product.productUrl && (
            <Button.Root variant="ghost" size="small" asChild>
              <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                <Button.Icon as={RiExternalLinkLine} />
                View
              </a>
            </Button.Root>
          )}
        </div>
      </div>
    </div>
  )
}

// Product Modal Component - Using List
interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

function ProductModal({ open, onOpenChange, product }: ProductModalProps) {
  const [name, setName] = React.useState(product?.name || '')
  const [description, setDescription] = React.useState(product?.description || '')
  const [category, setCategory] = React.useState(product?.category || '')
  const [platform, setPlatform] = React.useState(product?.platform || '')
  const [productUrl, setProductUrl] = React.useState(product?.productUrl || '')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description || '')
      setCategory(product.category)
      setPlatform(product.platform)
      setProductUrl(product.productUrl || '')
    } else {
      setName('')
      setDescription('')
      setCategory('')
      setPlatform('')
      setProductUrl('')
    }
  }, [product])

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{product ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">
                Product Name <span className="text-error-base">*</span>
              </label>
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    placeholder="e.g., Nike Air Max 2024"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">
                Product Image
              </label>
              <FileUpload.Root htmlFor="product-image">
                <FileUpload.Icon as={RiUploadCloud2Line} />
                <FileUpload.Button>Choose file</FileUpload.Button>
                <p className="text-paragraph-xs text-text-soft-400">
                  PNG, JPG up to 5MB
                </p>
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                />
              </FileUpload.Root>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm text-text-strong-950 mb-2">
                  Category <span className="text-error-base">*</span>
                </label>
                <Select.Root value={category} onValueChange={setCategory}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select category" />
                  </Select.Trigger>
                  <Select.Content>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <Select.Item key={cat} value={cat}>{cat}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
              <div>
                <label className="block text-label-sm text-text-strong-950 mb-2">
                  Platform <span className="text-error-base">*</span>
                </label>
                <Select.Root value={platform} onValueChange={setPlatform}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select platform" />
                  </Select.Trigger>
                  <Select.Content>
                    {E_COMMERCE_PLATFORMS.map((p) => (
                      <Select.Item key={p} value={p}>{p}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            </div>

            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">
                Product URL (Optional)
              </label>
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    placeholder="https://amazon.in/dp/..."
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">
                Description (Optional)
              </label>
              <Textarea.Root
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <p className="mt-1 text-paragraph-xs text-text-soft-400 text-right">
                {description.length}/500 characters
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="basic" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !name || !category || !platform}
          >
            {isLoading ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
