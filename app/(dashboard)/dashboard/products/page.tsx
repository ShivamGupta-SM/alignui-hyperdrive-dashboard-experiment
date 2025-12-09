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
  Plus,
  MagnifyingGlass,
  ShoppingBag,
  PencilSimple,
  Trash,
  ArrowSquareOut,
  Image,
  CloudArrowUp,
  Megaphone,
  Tag,
  ChartBar,
} from '@phosphor-icons/react/dist/ssr'
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
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Products</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <Button.Root variant="primary" size="small" onClick={() => setIsAddModalOpen(true)} className="shrink-0">
          <Button.Icon as={Plus} />
          <span className="hidden sm:inline">Add Product</span>
        </Button.Root>
      </div>

      {/* Stats - Horizontal scroll on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:overflow-visible">
        {[
          { label: 'Total', shortLabel: 'Total', value: stats.total, icon: ShoppingBag },
          { label: 'With Campaigns', shortLabel: 'Active', value: stats.withCampaigns, icon: Megaphone },
          { label: 'Campaigns', shortLabel: 'Campaigns', value: stats.totalCampaigns, icon: ChartBar },
          { label: 'Categories', shortLabel: 'Categories', value: stats.categories, icon: Tag },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="shrink-0 w-[110px] sm:w-auto flex items-center gap-2 sm:gap-3 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-2.5 sm:p-4"
          >
            <div className="flex size-8 sm:size-10 items-center justify-center rounded-full bg-bg-weak-50 shrink-0">
              <stat.icon weight="duotone" className="size-4 sm:size-5 text-text-sub-600" />
            </div>
            <div className="min-w-0">
              <div className="text-label-md sm:text-title-h5 text-text-strong-950 font-semibold">{stat.value}</div>
              <div className="text-[10px] sm:text-paragraph-xs text-text-soft-400 truncate">
                <span className="sm:hidden">{stat.shortLabel}</span>
                <span className="hidden sm:inline">{stat.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters - Compact layout */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Search */}
          <div className="flex-1 lg:max-w-sm">
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={MagnifyingGlass} />
                <Input.El
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          {/* Right: Filters - Side by side on all screens */}
          <div className="flex items-center gap-2">
            <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger className="flex-1 sm:w-40">
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
              <Select.Trigger className="flex-1 sm:w-40">
                <Select.Value placeholder="Platform" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Platforms</Select.Item>
                {E_COMMERCE_PLATFORMS.map((platform) => (
                  <Select.Item key={platform} value={platform}>{platform}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {(search || categoryFilter !== 'all' || platformFilter !== 'all') && (
              <Button.Root 
                variant="ghost" 
                size="xsmall"
                onClick={() => {
                  setSearch('')
                  setCategoryFilter('all')
                  setPlatformFilter('all')
                }}
              >
                Clear
              </Button.Root>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid or Empty State */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
        {/* Header with count */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200">
          <span className="text-label-sm text-text-sub-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>
        </div>

        {/* Content */}
        {filteredProducts.length === 0 ? (
          <div className="p-8 sm:p-12">
            <EmptyState.Root size="medium">
              <EmptyState.Header>
                <EmptyState.Icon color="gray">
                  <ShoppingBag className="size-full" />
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
                    : 'Add products to create campaigns'}
                </EmptyState.Description>
              </EmptyState.Content>
              <EmptyState.Footer>
                <Button.Root variant="primary" size="small" onClick={() => setIsAddModalOpen(true)}>
                  <Button.Icon as={Plus} />
                  Add Product
                </Button.Root>
              </EmptyState.Footer>
            </EmptyState.Root>
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>

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

// Product Card Component - Premium Design
interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
}

function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const platformColors: Record<string, string> = {
    'Amazon': 'bg-orange-100 text-orange-700',
    'Flipkart': 'bg-yellow-100 text-yellow-700',
    'Myntra': 'bg-pink-100 text-pink-700',
    'Any Platform': 'bg-gray-100 text-gray-600',
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(date)
  }

  return (
    <div className="group rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden hover:ring-primary-base/50 hover:shadow-lg transition-all duration-200">
      {/* Image Container - 4:3 on mobile, square on desktop */}
      <div className="aspect-[4/3] sm:aspect-square bg-bg-weak-50 relative overflow-hidden">
        {product.image ? (
          <>
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-text-soft-400">
              <Image className="size-10" />
              <span className="text-paragraph-xs">No image</span>
            </div>
          </div>
        )}

        {/* Campaign badge - top left */}
        {product.campaignCount > 0 && (
          <div className="absolute top-2 left-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white">
              <Megaphone weight="duotone" className="size-3.5" />
              <span className="text-label-xs font-medium">{product.campaignCount}</span>
            </div>
          </div>
        )}

        {/* Platform badge - top right */}
        <div className="absolute top-2 right-2">
          <span className={cn(
            "px-2 py-1 rounded-lg text-label-xs font-medium backdrop-blur-sm",
            platformColors[product.platform] || 'bg-gray-100 text-gray-600'
          )}>
            {product.platform}
          </span>
        </div>

        {/* Hover actions - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-1.5">
            <Button.Root variant="basic" size="xsmall" onClick={onEdit} className="flex-1 bg-white/95 backdrop-blur-sm shadow-sm">
              <Button.Icon as={PencilSimple} />
              Edit
            </Button.Root>
            {product.productUrl && (
              <Button.Root variant="basic" size="xsmall" asChild className="bg-white/95 backdrop-blur-sm shadow-sm">
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                  <Button.Icon as={ArrowSquareOut} />
                </a>
              </Button.Root>
            )}
            <Button.Root variant="basic" size="xsmall" onClick={onDelete} className="bg-white/95 backdrop-blur-sm shadow-sm text-error-base hover:bg-error-lighter">
              <Button.Icon as={Trash} />
            </Button.Root>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col">
        {/* Category tag */}
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide bg-primary-alpha-10 text-primary-base">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-label-sm text-text-strong-950 font-medium line-clamp-1 mb-1">
          {product.name}
        </h3>

        {/* Description - Always show area for consistent height */}
        <p className="text-paragraph-xs text-text-sub-600 line-clamp-2 min-h-[2.5rem] mb-2">
          {product.description || '\u00A0'}
        </p>

        {/* Footer: Date + Link */}
        <div className="flex items-center justify-between pt-2 border-t border-stroke-soft-200 mt-auto">
          <span className="text-paragraph-xs text-text-soft-400">
            Added {formatDate(product.createdAt)}
          </span>
          {product.productUrl ? (
            <a 
              href={product.productUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-paragraph-xs text-primary-base hover:underline"
            >
              View listing →
            </a>
          ) : (
            <span className="text-paragraph-xs text-text-soft-400">No link</span>
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
                <FileUpload.Icon as={CloudArrowUp} />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
