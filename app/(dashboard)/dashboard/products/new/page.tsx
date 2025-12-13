'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Textarea from '@/components/ui/textarea'
import * as Select from '@/components/ui/select'
import * as FileUpload from '@/components/ui/file-upload'
import * as Breadcrumb from '@/components/ui/breadcrumb'
import { 
  ArrowLeft, 
  ArrowRight, 
  Package, 
  CloudArrowUp, 
  Globe, 
  Tag, 
  CurrencyInr, 
  Image as ImageIcon,
  CheckCircle,
  X,
  Plus
} from '@phosphor-icons/react'
import { cn } from '@/utils/cn'
import { useCategories } from '@/hooks/use-categories'
import { useCreateProduct } from '@/hooks/use-products'
import { toast } from 'sonner'
import { productFormSchema, type ProductFormInput } from '@/lib/validations'

export default function NewProductPage() {
  // Fetch categories from API
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories()
  const categories = categoriesData?.data ?? []
  const createProduct = useCreateProduct()
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ProductFormInput & { brand?: string }>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      categoryId: '',
      platformId: 'amazon', // Default platform
      price: 0,
      sku: '',
      productLink: '',
    },
  })

  const description = watch('description')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProductFormInput) => {
    try {
      await createProduct.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        sku: data.sku || `SKU-${Date.now()}`,
        categoryId: data.categoryId || undefined,
        platformId: data.platformId || 'amazon',
        price: data.price || 0,
        productLink: data.productLink || '',
        productImages: uploadedImage ? [uploadedImage] : undefined,
      })
      toast.success('Product created successfully')
      router.push('/dashboard/products')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
    }
  }

  const isLoading = createProduct.isPending

  return (
    <div className="min-h-full">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-10 bg-bg-white-0/80 backdrop-blur-sm border-b border-stroke-soft-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Button.Root
                variant="ghost"
                size="small"
                onClick={() => router.back()}
                className="-ml-2"
              >
                <Button.Icon as={ArrowLeft} />
                <span className="hidden sm:inline">Back</span>
              </Button.Root>
              
              <div className="hidden sm:block h-5 w-px bg-stroke-soft-200" />
              
              <Breadcrumb.Root className="hidden sm:flex">
                <Breadcrumb.Item asChild>
                  <Link href="/dashboard/products">Products</Link>
                </Breadcrumb.Item>
                <Breadcrumb.ArrowIcon as={ArrowRight} />
                <Breadcrumb.Item active>Add New</Breadcrumb.Item>
              </Breadcrumb.Root>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button.Root variant="basic" size="small" asChild className="hidden sm:flex">
                <Link href="/dashboard/products">Cancel</Link>
              </Button.Root>
              <Button.Root 
                type="submit"
                form="product-form"
                variant="primary" 
                size="small"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Button.Icon as={CheckCircle} />
                    <span className="hidden sm:inline">Save Product</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button.Root>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-base/10 to-purple-500/10 ring-1 ring-inset ring-primary-base/20 shrink-0">
              <Package weight="duotone" className="size-6 sm:size-7 text-primary-base" />
            </div>
            <div>
              <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Add New Product</h1>
              <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
                Add a product to use in your campaigns
              </p>
            </div>
          </div>
        </div>

        {/* Form Grid Layout */}
        <form id="product-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Column - Product Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-stroke-soft-200 bg-bg-weak-50">
                  <div className="flex items-center gap-2">
                    <Tag weight="duotone" className="size-5 text-primary-base" />
                    <h2 className="text-label-md text-text-strong-950 font-medium">Product Information</h2>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-5">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
                      Product Name
                      <span className="text-error-base">*</span>
                    </label>
                    <Input.Root>
                      <Input.Wrapper>
                        <Input.El
                          {...register('name')}
                          placeholder="e.g., Nike Air Max 270"
                        />
                      </Input.Wrapper>
                    </Input.Root>
                    {errors.name && (
                      <p className="text-paragraph-xs text-error-base">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Brand & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
                        Brand
                        <span className="text-error-base">*</span>
                      </label>
                      <Input.Root>
                        <Input.Wrapper>
                          <Input.El
                            {...register('brand')}
                            placeholder="e.g., Nike"
                          />
                        </Input.Wrapper>
                      </Input.Root>
                      {errors.brand && (
                        <p className="text-paragraph-xs text-error-base">{errors.brand.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
                        Category
                        <span className="text-error-base">*</span>
                      </label>
                      <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                          <Select.Root
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            disabled={isLoadingCategories}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                            </Select.Trigger>
                            <Select.Content>
                              {categories.map((cat) => (
                                <Select.Item key={cat.id} value={cat.id}>
                                  <span className="mr-2">{cat.icon || '📦'}</span>
                                  {cat.name}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        )}
                      />
                      {errors.categoryId && (
                        <p className="text-paragraph-xs text-error-base">{errors.categoryId.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-label-sm text-text-strong-950">
                      Description
                    </label>
                    <Textarea.Root
                      {...register('description')}
                      placeholder="Brief description of the product (helps shoppers understand what they're buying)..."
                      rows={4}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-paragraph-xs text-text-soft-400">
                        {(description || '').length}/500 characters
                      </span>
                      {errors.description && (
                        <span className="text-paragraph-xs text-error-base">{errors.description.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Links Card */}
              <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-stroke-soft-200 bg-bg-weak-50">
                  <div className="flex items-center gap-2">
                    <CurrencyInr weight="duotone" className="size-5 text-success-base" />
                    <h2 className="text-label-md text-text-strong-950 font-medium">Pricing & Links</h2>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
                        Retail Price (MRP)
                        <span className="text-error-base">*</span>
                      </label>
                      <Input.Root>
                        <Input.Wrapper>
                          <span className="text-text-sub-600 font-medium">₹</span>
                          <Input.El
                            {...register('price', { valueAsNumber: true })}
                            type="number"
                            placeholder="9,999"
                          />
                        </Input.Wrapper>
                      </Input.Root>
                      {errors.price && (
                        <p className="text-paragraph-xs text-error-base">{errors.price.message}</p>
                      )}
                    </div>

                    {/* Product URL */}
                    <div className="space-y-2">
                      <label className="text-label-sm text-text-strong-950">
                        Product URL
                        <span className="text-paragraph-xs text-text-soft-400 ml-1">(optional)</span>
                      </label>
                      <Input.Root>
                        <Input.Wrapper>
                          <Globe weight="duotone" className="size-4 text-text-soft-400" />
                          <Input.El
                            {...register('productLink')}
                            type="url"
                            placeholder="https://example.com/product"
                          />
                        </Input.Wrapper>
                      </Input.Root>
                      {errors.productLink && (
                        <p className="text-paragraph-xs text-error-base">{errors.productLink.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Product Image */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-stroke-soft-200 bg-bg-weak-50">
                    <div className="flex items-center gap-2">
                      <ImageIcon weight="duotone" className="size-5 text-information-base" />
                      <h2 className="text-label-md text-text-strong-950 font-medium">Product Image</h2>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    {uploadedImage ? (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Product preview"
                          className="w-full aspect-square object-contain rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200 hover:bg-error-lighter hover:text-error-base transition-colors"
                        >
                          <X weight="bold" className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <FileUpload.Root htmlFor="product-image" className="border-dashed aspect-square">
                        <FileUpload.Icon as={CloudArrowUp} />
                        <FileUpload.Button>Upload Image</FileUpload.Button>
                        <p className="text-paragraph-xs text-text-soft-400 text-center">
                          PNG, JPG or WebP<br />
                          Max 5MB, 500×500px recommended
                        </p>
                        <input
                          id="product-image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </FileUpload.Root>
                    )}
                  </div>
                </div>

                {/* Quick Tips Card */}
                <div className="mt-4 rounded-xl bg-information-lighter/50 p-4 ring-1 ring-inset ring-information-base/20">
                  <h3 className="text-label-sm text-information-base font-medium mb-2">💡 Quick Tips</h3>
                  <ul className="space-y-1.5 text-paragraph-xs text-text-sub-600">
                    <li>• Use high-quality product images</li>
                    <li>• Include accurate pricing for transparency</li>
                    <li>• Add detailed descriptions to boost engagement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Mobile Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-white-0 border-t border-stroke-soft-200 lg:hidden">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button.Root variant="basic" className="flex-1" asChild>
              <Link href="/dashboard/products">Cancel</Link>
            </Button.Root>
            <Button.Root 
              type="submit"
              form="product-form"
              variant="primary" 
              className="flex-1"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? 'Saving...' : 'Save Product'}
            </Button.Root>
          </div>
        </div>

        {/* Spacing for mobile footer */}
        <div className="h-24 lg:hidden" />
      </div>
    </div>
  )
}
