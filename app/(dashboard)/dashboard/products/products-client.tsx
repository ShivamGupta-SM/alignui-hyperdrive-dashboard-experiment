'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Button from '@/components/ui/button'
import * as Badge from '@/components/ui/badge'
import * as Input from '@/components/ui/input'
import * as Select from '@/components/ui/select'
import * as Modal from '@/components/ui/modal'
import * as Textarea from '@/components/ui/textarea'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import * as FileUpload from '@/components/ui/file-upload'
import { FileDropzone } from '@/components/ui/file-dropzone'
import Image from 'next/image'
import {
  Plus,
  MagnifyingGlass,
  ShoppingBag,
  PencilSimple,
  Trash,
  ArrowSquareOut,
  Image as ImageIcon,
  CloudArrowUp,
  Megaphone,
  Tag,
  ChartBar,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import type { products } from '@/lib/encore-browser'
import { createProduct, updateProduct, deleteProduct, bulkImportProducts } from '@/app/actions/products'

type Product = products.ProductWithStats

// Get stats from products
const getStats = (productList: Product[]) => {
  const total = productList.length
  const withCampaigns = productList.filter((p) => (p.campaignCount || 0) > 0).length
  const totalCampaigns = productList.reduce((acc, p) => acc + (p.campaignCount || 0), 0)
  const categories = new Set(productList.map(p => p.categoryId).filter(Boolean)).size

  return { total, withCampaigns, totalCampaigns, categories }
}

interface ProductsClientProps {
  initialData?: {
    data: Product[]
    total?: number
    categories?: { id: string; name: string }[]
    platforms?: { id: string; name: string }[]
  }
}

export function ProductsClient({ initialData }: ProductsClientProps = {}) {
  // Use server data directly
  const products = (initialData?.data ?? []) as Product[]
  const categories = initialData?.categories ?? []
  const platforms = initialData?.platforms ?? []

  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [platformFilter, setPlatformFilter] = React.useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  
  const [isPending, startTransition] = React.useTransition()

  const filteredProducts = React.useMemo(() => {
    let result = products

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.categoryId === categoryFilter)
    }

    if (platformFilter !== 'all') {
      result = result.filter((p) => p.platformId === platformFilter)
    }

    return result
  }, [products, search, categoryFilter, platformFilter])

  const stats = React.useMemo(() => getStats(products), [products])

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        startTransition(async () => {
            try {
                const res = await deleteProduct(productId)
                if (res.success) {
                    toast.success('Product deleted successfully')
                } else {
                    toast.error(res.error || 'Failed to delete product')
                }
            } catch (e) {
                toast.error('An error occurred')
            }
        })
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Products</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button.Root variant="basic" size="small" onClick={() => setIsBulkImportModalOpen(true)}>
            <Button.Icon as={CloudArrowUp} />
            <span className="hidden sm:inline">Import</span>
          </Button.Root>
          <Button.Root variant="primary" size="small" onClick={() => setIsAddModalOpen(true)}>
            <Button.Icon as={Plus} />
            <span className="hidden sm:inline">Add Product</span>
          </Button.Root>
        </div>
      </div>

      {/* Stats - Horizontal scroll on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:overflow-visible">
        {[
          { label: 'Total', shortLabel: 'Total', value: stats.total, icon: ShoppingBag },
          { label: 'With Campaigns', shortLabel: 'Active', value: stats.withCampaigns, icon: Megaphone },
          { label: 'Campaigns', shortLabel: 'Campaigns', value: stats.totalCampaigns, icon: ChartBar },
          { label: 'Categories', shortLabel: 'Categories', value: stats.categories, icon: Tag },
        ].map((stat) => (
          <div
            key={stat.label}
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
                {categories.map((cat) => (
                  <Select.Item key={cat.id} value={cat.name}>{cat.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Select.Root value={platformFilter} onValueChange={setPlatformFilter}>
              <Select.Trigger className="flex-1 sm:w-40">
                <Select.Value placeholder="Platform" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Platforms</Select.Item>
                {platforms.map((platform) => (
                  <Select.Item key={platform.id} value={platform.name}>{platform.name}</Select.Item>
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
                  onDelete={() => handleDeleteProduct(product.id)}
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
        categories={categories}
        platforms={platforms}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={isBulkImportModalOpen}
        onOpenChange={setIsBulkImportModalOpen}
        categories={categories}
        platforms={platforms}
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

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(new Date(date))
  }

  return (
    <div className="group rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden hover:ring-primary-base/50 hover:shadow-lg transition-all duration-200">
      {/* Image Container - 4:3 on mobile, square on desktop */}
      <div className="aspect-[4/3] sm:aspect-square bg-bg-weak-50 relative overflow-hidden">
        {product.productImages?.[0] ? (
          <>
            <Image
              src={product.productImages[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-text-soft-400">
              <ImageIcon className="size-10" />
              <span className="text-paragraph-xs">No image</span>
            </div>
          </div>
        )}

        {/* Campaign badge - top left */}
        {(product.campaignCount || 0) > 0 && (
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
            platformColors[product.platformId || ''] || 'bg-gray-100 text-gray-600'
          )}>
            {product.platformId || 'N/A'}
          </span>
        </div>

        {/* Hover actions - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-1.5">
            <Button.Root variant="basic" size="xsmall" onClick={onEdit} className="flex-1 bg-white/95 backdrop-blur-sm shadow-sm">
              <Button.Icon as={PencilSimple} />
              Edit
            </Button.Root>
            {product.productLink && (
              <Button.Root variant="basic" size="xsmall" asChild className="bg-white/95 backdrop-blur-sm shadow-sm">
                <a href={product.productLink} target="_blank" rel="noopener noreferrer">
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
          <Badge.Root color="blue" variant="soft" size="small">
            {product.categoryId || 'Uncategorized'}
          </Badge.Root>
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
          {product.productLink ? (
            <a
              href={product.productLink}
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
  categories: Array<{ id: string; name: string; icon?: string }>
  platforms: Array<{ id: string; name: string }>
}

function ProductModal({ open, onOpenChange, product, categories, platforms }: ProductModalProps) {
  const [isPending, startTransition] = React.useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      categoryId: product?.categoryId || '',
      platformId: product?.platformId || '',
      productLink: product?.productLink || '',
      price: product?.price || 0,
      sku: product?.sku || '',
    },
  })

  const description = watch('description')

  // Reset form when product changes
  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        categoryId: product.categoryId || '',
        platformId: product.platformId || '',
        productLink: product.productLink || '',
        price: product.price || 0,
        sku: product.sku || '',
      })
    } else {
      reset({
        name: '',
        description: '',
        categoryId: '',
        platformId: '',
        productLink: '',
        price: 0,
        sku: '',
      })
    }
  }, [product, reset])

  const onSubmit = async (data: ProductFormInput) => {
    startTransition(async () => {
      try {
        const submitData = {
          name: data.name,
          description: data.description || undefined,
          categoryId: data.categoryId || undefined,
          platformId: data.platformId || undefined,
          productLink: data.productLink || '',
          price: data.price || 0,
          sku: data.sku || `SKU-${Date.now()}`,
        }

        if (product) {
          const res = await updateProduct(product.id, submitData)
          if (res.success) {
            toast.success('Product updated successfully')
            onOpenChange(false)
          } else {
            toast.error(res.error || 'Failed to update product')
          }
        } else {
          const res = await createProduct(submitData)
          if (res.success) {
            toast.success('Product created successfully')
            reset()
            onOpenChange(false)
          } else {
            toast.error(res.error || 'Failed to create product')
          }
        }
      } catch (e) {
        toast.error('An error occurred')
      }
    })
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{product ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)} id="product-form">
            <div className="space-y-4">
              <div>
                <label className="block text-label-sm text-text-strong-950 mb-2">
                  Product Name <span className="text-error-base">*</span>
                </label>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.El
                      {...register('name')}
                      placeholder="e.g., Nike Air Max 2024"
                    />
                  </Input.Wrapper>
                </Input.Root>
                {errors.name && (
                  <p className="mt-1 text-paragraph-xs text-error-base">{errors.name.message}</p>
                )}
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
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select.Root value={field.value || ''} onValueChange={field.onChange}>
                        <Select.Trigger>
                          <Select.Value placeholder="Select category" />
                        </Select.Trigger>
                        <Select.Content>
                          {categories.length > 0 ? categories.map((cat) => (
                            <Select.Item key={cat.id} value={cat.id}>{cat.name}</Select.Item>
                          )) : (
                            <Select.Item value="">No categories</Select.Item>
                          )}
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                  {errors.categoryId && (
                    <p className="mt-1 text-paragraph-xs text-error-base">{errors.categoryId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-label-sm text-text-strong-950 mb-2">
                    Platform <span className="text-error-base">*</span>
                  </label>
                  <Controller
                    name="platformId"
                    control={control}
                    render={({ field }) => (
                      <Select.Root value={field.value || ''} onValueChange={field.onChange}>
                        <Select.Trigger>
                          <Select.Value placeholder="Select platform" />
                        </Select.Trigger>
                        <Select.Content>
                          {platforms.length > 0 ? platforms.map((p) => (
                            <Select.Item key={p.id} value={p.id}>{p.name}</Select.Item>
                          )) : (
                            <Select.Item value="">No platforms</Select.Item>
                          )}
                        </Select.Content>
                      </Select.Root>
                    )}
                  />
                  {errors.platformId && (
                    <p className="mt-1 text-paragraph-xs text-error-base">{errors.platformId.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm text-text-strong-950 mb-2">
                    Price (₹) <span className="text-error-base">*</span>
                  </label>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.El
                        {...register('price', { valueAsNumber: true })}
                        type="number"
                        placeholder="999"
                      />
                    </Input.Wrapper>
                  </Input.Root>
                  {errors.price && (
                    <p className="mt-1 text-paragraph-xs text-error-base">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-label-sm text-text-strong-950 mb-2">
                    SKU (Optional)
                  </label>
                  <Input.Root>
                    <Input.Wrapper>
                      <Input.El
                        {...register('sku')}
                        placeholder="Auto-generated if empty"
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
              </div>

              <div>
                <label className="block text-label-sm text-text-strong-950 mb-2">
                  Product URL (Optional)
                </label>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.El
                      {...register('productLink')}
                      placeholder="https://amazon.in/dp/..."
                    />
                  </Input.Wrapper>
                </Input.Root>
                {errors.productLink && (
                  <p className="mt-1 text-paragraph-xs text-error-base">{errors.productLink.message}</p>
                )}
              </div>

              <div>
                <label className="block text-label-sm text-text-strong-950 mb-2">
                  Description (Optional)
                </label>
                <Textarea.Root
                  {...register('description')}
                  placeholder="Brief description..."
                  rows={3}
                />
                <p className="mt-1 text-paragraph-xs text-text-soft-400 text-right">
                  {(description || '').length}/500 characters
                </p>
                {errors.description && (
                  <p className="mt-1 text-paragraph-xs text-error-base">{errors.description.message}</p>
                )}
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root type="button" variant="basic" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button.Root>
          <Button.Root
            type="submit"
            form="product-form"
            variant="primary"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// Bulk Import Modal Component
interface BulkImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Array<{ id: string; name: string }>
  platforms: Array<{ id: string; name: string }>
}

function BulkImportModal({ open, onOpenChange, categories, platforms }: BulkImportModalProps) {
  const [importData, setImportData] = React.useState<any[]>([])
  const [result, setResult] = React.useState<any | null>(null)
  const [step, setStep] = React.useState<'upload' | 'preview' | 'result'>('upload')
  const [isPending, startTransition] = React.useTransition()

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setImportData([])
      setResult(null)
      setStep('upload')
    }
  }, [open])

  const handleFileUpload = (files: File[]) => {
    const file = files[0]
    if (!file) return

    // Parse CSV file
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        toast.error('CSV file must have a header row and at least one data row')
        return
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const nameIdx = headers.findIndex(h => h === 'name' || h === 'product name')
      const descIdx = headers.findIndex(h => h === 'description')
      const categoryIdx = headers.findIndex(h => h === 'category')
      const platformIdx = headers.findIndex(h => h === 'platform')
      const urlIdx = headers.findIndex(h => h === 'url' || h === 'product url')

      if (nameIdx === -1) {
        toast.error('CSV must have a "name" column')
        return
      }

      // Parse data rows
      const products: Partial<products.CreateProductRequest>[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        if (values[nameIdx]) {
          products.push({
            name: values[nameIdx],
            description: descIdx >= 0 ? values[descIdx] : undefined,
            categoryId: categoryIdx >= 0 && values[categoryIdx] ? values[categoryIdx] : categories[0]?.id || undefined,
            platformId: platformIdx >= 0 && values[platformIdx] ? values[platformIdx] : platforms[0]?.id || undefined,
            productLink: urlIdx >= 0 ? values[urlIdx] || '' : '',
            sku: `SKU-${Date.now()}-${i}`,
            price: 0, // Default price, can be updated later
          })
        }
      }

      if (products.length === 0) {
        toast.error('No valid products found in CSV')
        return
      }

      setImportData(products)
      setStep('preview')
      toast.success(`Found ${products.length} products to import`)
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    startTransition(async () => {
        try {
            const response = await bulkImportProducts(importData)
            if (response.success) {
                setResult(response)
                setStep('result')
                toast.success(`Successfully imported ${response.imported} products`)
            } else {
                toast.error(response.error || 'Failed to import products')
            }
        } catch(e) {
            toast.error('An error occurred')
        }
    })
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="sm:max-w-lg">
        <Modal.Header>
          <Modal.Title>
            {step === 'upload' && 'Import Products'}
            {step === 'preview' && 'Preview Import'}
            {step === 'result' && 'Import Complete'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-paragraph-sm text-text-sub-600">
                Upload a CSV file with your products. The file should have columns for: name, description, category, platform, and product URL.
              </p>
              <FileDropzone
                onFilesSelected={handleFileUpload}
                accept={{ 'text/csv': ['.csv'] }}
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
              />
              <div className="rounded-lg bg-bg-weak-50 p-3">
                <p className="text-label-xs text-text-strong-950 mb-2">CSV Format Example:</p>
                <code className="block text-paragraph-xs text-text-sub-600 font-mono whitespace-pre">
{`name,description,category,platform,url
Nike Air Max,Running shoes,Footwear,Amazon,https://...
Adidas Tee,Cotton t-shirt,Apparel,Flipkart,https://...`}
                </code>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-paragraph-sm text-text-sub-600">
                Review the products to be imported ({importData.length} items)
              </p>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-stroke-soft-200 divide-y divide-stroke-soft-200">
                {importData.slice(0, 10).map((product, idx) => (
                  <div key={`${product.name}-${idx}`} className="p-3 text-paragraph-sm">
                    <div className="font-medium text-text-strong-950">{product.name}</div>
                    <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
                      {product.categoryId || 'N/A'} • {product.platformId || 'N/A'}
                    </div>
                  </div>
                ))}
                {importData.length > 10 && (
                  <div className="p-3 text-paragraph-xs text-text-soft-400 text-center">
                    + {importData.length - 10} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'result' && result && (
             <div className="space-y-4">
                <div className="rounded-lg bg-success-lighter p-4 text-center">
                    <div className="mx-auto size-12 rounded-full bg-success-base flex items-center justify-center mb-3">
                         <CloudArrowUp className="size-6 text-white" />
                    </div>
                    <h3 className="text-label-lg font-semibold text-text-strong-950">Import Successful</h3>
                    <p className="text-paragraph-sm text-text-sub-600 mt-1">
                        {result.message}
                    </p>
                </div>
                {result.errors && result.errors.length > 0 && (
                     <div className="rounded-lg bg-error-lighter p-4">
                        <h4 className="text-label-sm font-medium text-error-base mb-2">Errors</h4>
                        <ul className="list-disc list-inside text-paragraph-xs text-text-sub-600">
                             {result.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                        </ul>
                     </div>
                )}
             </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {step === 'upload' && (
            <Button.Root variant="basic" onClick={() => onOpenChange(false)}>
              Cancel
            </Button.Root>
          )}
          {step === 'preview' && (
            <>
              <Button.Root variant="basic" onClick={() => setStep('upload')} disabled={isPending}>
                Back
              </Button.Root>
              <Button.Root variant="primary" onClick={handleImport} disabled={isPending}>
                {isPending ? 'Importing...' : 'Import Products'}
              </Button.Root>
            </>
          )}
           {step === 'result' && (
              <Button.Root variant="primary" onClick={() => onOpenChange(false)}>
                  Done
              </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
