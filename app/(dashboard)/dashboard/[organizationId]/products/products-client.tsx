"use client"

import { useState, useEffect, useMemo, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Button from "@/components/ui/primitives/button"
import * as Badge from "@/components/ui/data-display/badge"
import * as Input from "@/components/ui/forms/input"
import * as Select from "@/components/ui/forms/select"
import * as Modal from "@/components/ui/layout/modal"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Dropdown from "@/components/ui/layout/dropdown"
import * as CompactButton from "@/components/ui/primitives/compact-button"
import * as LinkButton from "@/components/ui/primitives/link-button"
import { NoProductsEmptyState, OrganizationSetupRequiredEmptyState } from "@/components/dashboard/empty-states"
import { ConfirmationModal } from "@/components/dashboard"
import * as FileUpload from "@/components/ui/forms/file-upload"
import { FileDropzone } from "@/components/ui/forms/file-dropzone"
import Image from "next/image"
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
	ArrowRight,
	DotsThree,
	CaretRight,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/utils/format"
import { toast } from "sonner"
import { useLocalStorage, useProductSearchParams } from "@/hooks/state"
import { CalloutWithActions } from "@/components/ui/feedback/callout"
import { useCurrentOrganization } from "@/hooks/shared/use-current-organization"
import * as Tooltip from "@/components/ui/layout/tooltip"
import type { products, organizations } from "@/brand-client"
import {
	createProduct,
	updateProduct,
	deleteProduct,
	bulkImportProducts,
} from "@/features/products"
import { productFormSchema, type ProductFormInput } from "@/lib/utils/validations"
import { nanoid } from "nanoid"
import { FILE_SIZES } from "@/lib/types/constants"
import { getPlatformColor, DISPLAY_LIMITS } from "@/lib/constants"

type Product = products.ProductWithStats

// Get stats from products
const getStats = (productList: Product[]) => {
	const total = productList.length
	const withCampaigns = productList.filter((p) => (p.campaignCount || 0) > 0).length
	const totalCampaigns = productList.reduce((acc, p) => acc + (p.campaignCount || 0), 0)
	const categories = new Set(productList.map((p) => p.categoryId).filter(Boolean)).size

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

// URL-based multi-tenancy: Get organizationId from URL params
export function ProductsClient({ initialData = { data: [] } }: ProductsClientProps) {
	const router = useRouter()

	// SSOT: Use centralized hook for organization lookup
	const { organization, organizationId, isApproved } = useCurrentOrganization()

	const [dismissedOnboardingAlert, setDismissedOnboardingAlert] = useLocalStorage<boolean>(
		"products-onboarding-alert-dismissed",
		false
	)

	// URL state via nuqs - must be called before any early returns
	const [searchParams, setSearchParams] = useProductSearchParams()
	const { search, category: categoryFilter, platform: platformFilter } = searchParams

	// All useState hooks must be called before early returns
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false)
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [isPending, startTransition] = useTransition()

	// Use server data directly
	const products = (initialData?.data ?? []) as Product[]
	const categories = initialData?.categories ?? []
	const platforms = initialData?.platforms ?? []

	// Memoized values - must be called before early returns
	const filteredProducts = useMemo(() => {
		let result = products

		if (search) {
			const searchLower = search.toLowerCase()
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(searchLower) ||
					p.description?.toLowerCase().includes(searchLower)
			)
		}

		if (categoryFilter !== "all") {
			result = result.filter((p) => p.categoryId === categoryFilter)
		}

		if (platformFilter !== "all") {
			result = result.filter((p) => p.platformId === platformFilter)
		}

		return result
	}, [products, search, categoryFilter, platformFilter])

	const stats = useMemo(() => getStats(products), [products])

	// Callbacks must be defined before any early returns to maintain React hooks order
	const handleDeleteProduct = useCallback((productId: string) => {
		setDeletingProductId(productId)
		setIsDeleteModalOpen(true)
	}, [])

	const confirmDeleteProduct = useCallback(async () => {
		if (!deletingProductId) return

		startTransition(async () => {
			try {
				await deleteProduct({ organizationId, id: deletingProductId })
				toast.success("Product deleted successfully")
				setIsDeleteModalOpen(false)
				setDeletingProductId(null)
				// React Query cache invalidation handles UI update - no router.refresh() needed
			} catch (error) {
				toast.error(getErrorMessage(error, "Failed to delete product"))
			} finally {
				setDeletingProductId(null)
			}
		})
	}, [deletingProductId, organizationId])

	// Show onboarding alert if no organization
	const showOnboardingAlert = !organizationId && !dismissedOnboardingAlert

	// If no organization, show alert
	if (!organizationId) {
		return (
			<div className="space-y-5 sm:space-y-6">
				{/* ONBOARDING ALERT */}
				{showOnboardingAlert && (
					<CalloutWithActions
						variant="warning"
						title="Complete Your Organization Setup"
						dismissible
						onDismiss={() => setDismissedOnboardingAlert(true)}
						actions={
							<>
								<Button.Root
									variant="primary"
									size="small"
									onClick={() => router.push(routes.onboarding.root)}
								>
									<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
									Start Onboarding
								</Button.Root>
								<Button.Root
									variant="ghost"
									size="small"
									onClick={() => setDismissedOnboardingAlert(true)}
								>
									Maybe Later
								</Button.Root>
							</>
						}
					>
						To add and manage products, you need to complete your organization setup. This will only take a few minutes.
					</CalloutWithActions>
				)}

				{/* HEADER */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Products</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
							Manage your product catalog
						</p>
					</div>
				</div>

				{/* EMPTY STATE */}
				{dismissedOnboardingAlert && (
					<OrganizationSetupRequiredEmptyState
						description="Complete your organization setup to add and manage products."
					/>
				)}
			</div>
		)
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
					<Button.Root
						variant="neutral"
						size="small"
						onClick={() => setIsBulkImportModalOpen(true)}
					>
						<Button.Icon><CloudArrowUp className="size-5" /></Button.Icon>
						<span className="hidden sm:inline">Import</span>
					</Button.Root>
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<div>
									<Button.Root 
										variant="primary" 
										size="small" 
										disabled={!isApproved}
										onClick={() => setIsAddModalOpen(true)}
									>
										<Button.Icon><Plus className="size-5" /></Button.Icon>
										<span className="hidden sm:inline">Add Product</span>
									</Button.Root>
								</div>
							</Tooltip.Trigger>
							{!isApproved && (
								<Tooltip.Content>
									{organization?.approvalStatus === "draft" 
										? "Complete onboarding and wait for admin approval"
										: organization?.approvalStatus === "pending"
										? "Your application is under review"
										: "Organization approval required"}
								</Tooltip.Content>
							)}
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			</div>

			{/* Stats - 4 column grid on all screens */}
			<div className="grid grid-cols-4 gap-2 sm:gap-3">
				{[
					{ label: "Total", shortLabel: "Total", value: stats.total, icon: ShoppingBag },
					{
						label: "With Campaigns",
						shortLabel: "Active",
						value: stats.withCampaigns,
						icon: Megaphone,
					},
					{
						label: "Campaigns",
						shortLabel: "Camp",
						value: stats.totalCampaigns,
						icon: ChartBar,
					},
					{ label: "Categories", shortLabel: "Categ", value: stats.categories, icon: Tag },
				].map((stat) => (
					<div
						key={stat.label}
						className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-2 sm:p-3 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm"
					>
						<div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-bg-weak-50 shrink-0">
							<stat.icon weight="duotone" className="size-3.5 sm:size-4 text-text-sub-600" />
						</div>
						<div className="min-w-0">
							<div className="text-label-sm sm:text-label-lg text-text-strong-950 font-semibold">
								{stat.value}
							</div>
							<div className="text-[10px] sm:text-label-xs text-text-soft-400 truncate">
								<span className="sm:hidden">{stat.shortLabel}</span>
								<span className="hidden sm:inline">{stat.label}</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Search & Filters - Compact layout */}
			<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-3">
				<div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
					{/* Left: Search */}
					<div className="flex-1 lg:max-w-sm">
						<Input.Root>
							<Input.Wrapper>
								<Input.Icon as={MagnifyingGlass} />
								<Input.El
									placeholder="Search..."
									value={search}
									onChange={(e) => setSearchParams({ search: e.target.value })}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					{/* Right: Filters - Side by side on all screens */}
					<div className="flex items-center gap-2">
						<Select.Root value={categoryFilter} onValueChange={(v) => setSearchParams({ category: v })}>
							<Select.Trigger className="flex-1 sm:w-40">
								<Select.Value placeholder="Category" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">All Categories</Select.Item>
								{categories.map((cat) => (
									<Select.Item key={cat.id} value={cat.id}>
										{cat.name}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
						<Select.Root value={platformFilter} onValueChange={(v) => setSearchParams({ platform: v })}>
							<Select.Trigger className="flex-1 sm:w-40">
								<Select.Value placeholder="Platform" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">All Platforms</Select.Item>
								{platforms.map((platform) => (
									<Select.Item key={platform.id} value={platform.id}>
										{platform.name}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Root>
						{(search || categoryFilter !== "all" || platformFilter !== "all") && (
							<Button.Root
								variant="ghost"
								size="xsmall"
								onClick={() => setSearchParams({ search: "", category: "all", platform: "all" })}
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
				<div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-stroke-soft-200">
					<span className="text-label-sm text-text-sub-600">
						{filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
					</span>
				</div>

				{/* Content */}
				{filteredProducts.length === 0 ? (
					<div className="p-8 sm:p-12">
						{search || categoryFilter !== "all" || platformFilter !== "all" ? (
							// Filtered state - use custom empty state
							<div className="text-center">
								<ShoppingBag weight="duotone" className="size-12 mx-auto mb-4 text-text-soft-400" />
								<h3 className="text-label-lg text-text-strong-950 mb-2">No products found</h3>
								<p className="text-paragraph-sm text-text-sub-600 mb-6">
									Try adjusting your search or filters
								</p>
								<Button.Root
									variant="neutral"
									size="small"
									onClick={() => setSearchParams({ search: "", category: "all", platform: "all" })}
								>
									Clear Filters
								</Button.Root>
							</div>
						) : (
							// No products at all - use pre-built component
							<NoProductsEmptyState organizationId={organizationId} />
						)}
					</div>
				) : (
					<div className="p-3 sm:p-4">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{filteredProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									categories={categories}
									platforms={platforms}
									organizationId={organizationId}
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
				organizationId={organizationId}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
				variant="danger"
				title="Delete Product"
				description="Are you sure you want to delete this product? This action cannot be undone and will affect all associated campaigns."
				confirmLabel="Delete Product"
				cancelLabel="Cancel"
				onConfirm={confirmDeleteProduct}
				isLoading={isPending}
			/>

			{/* Bulk Import Modal */}
			<BulkImportModal
				open={isBulkImportModalOpen}
				onOpenChange={setIsBulkImportModalOpen}
				categories={categories}
				platforms={platforms}
				organizationId={organizationId}
			/>
		</div>
	)
}

// Product Card Component - Clean SaaS Design
interface ProductCardProps {
	product: Product
	categories: Array<{ id: string; name: string }>
	platforms: Array<{ id: string; name: string }>
	organizationId: string
	onEdit: () => void
	onDelete: () => void
}

function ProductCard({ product, categories, platforms, organizationId, onEdit, onDelete }: ProductCardProps) {
	const router = useRouter()
	const [imageError, setImageError] = useState(false)
	const productImage = product.productImages?.[0]?.imageUrl || null
	const hasImage = productImage && !imageError

	// Look up category and platform names
	const categoryName = categories.find((c) => c.id === product.categoryId)?.name || null
	const platformName = platforms.find((p) => p.id === product.platformId)?.name || null

	// Format price
	const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`

	const handleCardClick = () => {
		router.push(`/dashboard/${organizationId}/products/${product.id}`)
	}

	return (
		<div
			className="flex flex-col h-full rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden cursor-pointer"
			onClick={handleCardClick}
		>
			{/* Header - Product Identity */}
			<div className="p-4 pb-3">
				<div className="flex gap-3">
					{/* Product Thumbnail */}
					<div className="shrink-0">
						{hasImage ? (
							<div className="relative size-14 rounded-xl overflow-hidden bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200">
								<Image
									src={productImage}
									alt={product.name}
									fill
									sizes="56px"
									className="object-contain p-1.5"
									onError={() => setImageError(true)}
								/>
							</div>
						) : (
							<div className="size-14 rounded-xl bg-bg-weak-50 flex items-center justify-center ring-1 ring-inset ring-stroke-soft-200">
								<ImageIcon className="size-6 text-text-soft-400" />
							</div>
						)}
					</div>

					{/* Title & Badge */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0 flex-1">
								<h3 className="text-label-md text-text-strong-950 font-semibold truncate">
									{product.name}
								</h3>
								<div className="flex items-center gap-2 mt-1.5 flex-wrap">
									{categoryName && (
										<Badge.Root color="blue" variant="lighter" size="small">
											{categoryName}
										</Badge.Root>
									)}
									{platformName && (
										<Badge.Root color="gray" variant="lighter" size="small">
											{platformName}
										</Badge.Root>
									)}
								</div>
							</div>

							{/* Actions Dropdown */}
							<Dropdown.Root>
								<Dropdown.Trigger asChild>
									<CompactButton.Root
										variant="ghost"
										size="medium"
										className="-mr-1"
										aria-label="Product actions"
										onClick={(e) => e.stopPropagation()}
									>
										<CompactButton.Icon><DotsThree weight="bold" /></CompactButton.Icon>
									</CompactButton.Root>
								</Dropdown.Trigger>
								<Dropdown.Content align="end">
									<Dropdown.Item onClick={(e) => { e.stopPropagation(); onEdit(); }}>
										<Dropdown.ItemIcon as={PencilSimple} />
										Edit Product
									</Dropdown.Item>
									{product.productLink && (
										<Dropdown.Item asChild>
											<a
												href={product.productLink}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(e) => e.stopPropagation()}
											>
												<Dropdown.ItemIcon as={ArrowSquareOut} />
												View Listing
											</a>
										</Dropdown.Item>
									)}
									<Dropdown.Separator />
									<Dropdown.Item onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-error-base">
										<Dropdown.ItemIcon as={Trash} />
										Delete
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className="px-4 pb-4 flex-1">
				<div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-bg-weak-50">
					<div>
						<div className="text-title-h6 text-text-strong-950 font-semibold">
							{formatPrice(product.price || 0)}
						</div>
						<div className="text-label-xs text-text-soft-400 uppercase tracking-wide">
							Price
						</div>
					</div>
					<div className="text-right">
						<div className="text-title-h6 text-primary-base font-semibold">
							{product.campaignCount || 0}
						</div>
						<div className="text-label-xs text-text-soft-400 uppercase tracking-wide">
							Campaigns
						</div>
					</div>
				</div>

				{/* Description */}
				{product.description && (
					<p className="text-paragraph-xs text-text-sub-600 line-clamp-2 mt-3">
						{product.description}
					</p>
				)}
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-stroke-soft-200 mt-auto">
				<div className="text-paragraph-xs text-text-soft-400">
					{product.sku && <span className="font-mono">{product.sku}</span>}
				</div>

				<LinkButton.Root variant="primary" size="medium" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
					View
					<LinkButton.Icon as={CaretRight} weight="bold" />
				</LinkButton.Root>
			</div>
		</div>
	)
}

// Product Modal Component - Clean SaaS Design
interface ProductModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	product?: Product | null
	categories: Array<{ id: string; name: string; icon?: string }>
	platforms: Array<{ id: string; name: string }>
	organizationId: string
}

function ProductModal({ open, onOpenChange, product, categories, platforms, organizationId }: ProductModalProps) {
	const [isPending, startTransition] = useTransition()
	const [uploadedImage, setUploadedImage] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		control,
	} = useForm<ProductFormInput>({
		resolver: zodResolver(productFormSchema),
		defaultValues: {
			name: product?.name || "",
			description: product?.description || "",
			categoryId: product?.categoryId || "",
			platformId: product?.platformId || "",
			productLink: product?.productLink || "",
			price: product?.price || 0,
			sku: product?.sku || "",
		},
	})

	const description = watch("description")

	// Handle image upload
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (evt) => {
				setUploadedImage(evt.target?.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	// Reset form when product changes
	useEffect(() => {
		if (product) {
			reset({
				name: product.name,
				description: product.description || "",
				categoryId: product.categoryId || "",
				platformId: product.platformId || "",
				productLink: product.productLink || "",
				price: product.price || 0,
				sku: product.sku || "",
			})
			// Set existing image if available
			setUploadedImage(product.productImages?.[0]?.imageUrl || null)
		} else {
			reset({
				name: "",
				description: "",
				categoryId: "",
				platformId: "",
				productLink: "",
				price: 0,
				sku: "",
			})
			setUploadedImage(null)
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
					productLink: data.productLink || "",
					price: data.price || 0,
					sku: data.sku || `SKU-${nanoid(8)}`,
					productImages: uploadedImage ? [{ imageUrl: uploadedImage, isPrimary: true }] : undefined,
				}

				if (product) {
					await updateProduct({ organizationId, id: product.id, ...submitData })
					toast.success("Product updated successfully")
					onOpenChange(false)
				} else {
					// URL-based multi-tenancy: pass organizationId
					await createProduct({ organizationId, ...submitData })
					toast.success("Product created successfully")
					reset()
					setUploadedImage(null)
					onOpenChange(false)
				}
			} catch (error) {
				toast.error(getErrorMessage(error, "An error occurred"))
			}
		})
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="sm:max-w-3xl">
				<Modal.Header>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-primary-alpha-10">
							<ShoppingBag weight="duotone" className="size-5 text-primary-base" />
						</div>
						<div>
							<Modal.Title>{product ? "Edit Product" : "Add New Product"}</Modal.Title>
							<p className="text-paragraph-xs text-text-sub-600 mt-0.5">
								{product ? "Update your product details" : "Add a product to use in your campaigns"}
							</p>
						</div>
					</div>
				</Modal.Header>
				<Modal.Body className="p-0">
					<form onSubmit={handleSubmit(onSubmit)} id="product-form">
						<div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-stroke-soft-200">
							{/* Left Column - Image Upload */}
							<div className="sm:col-span-2 p-5 sm:p-6">
								<label className="flex items-center gap-2 text-label-sm text-text-strong-950 mb-3">
									<ImageIcon weight="duotone" className="size-4 text-primary-base" />
									Product Image
								</label>
								{uploadedImage ? (
									<div className="relative group">
										<img
											src={uploadedImage}
											alt="Product preview"
											className="w-full aspect-square object-contain rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200"
										/>
										<button
											type="button"
											onClick={() => setUploadedImage(null)}
											className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-lg bg-bg-white-0/90 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200 hover:bg-error-lighter hover:text-error-base transition-colors opacity-0 group-hover:opacity-100"
										>
											<Trash weight="bold" className="size-4" />
										</button>
									</div>
								) : (
									<FileUpload.Root htmlFor="product-image-modal" className="aspect-square border-dashed rounded-xl">
										<FileUpload.Icon as={CloudArrowUp} />
										<FileUpload.Button>Upload Image</FileUpload.Button>
										<p className="text-paragraph-xs text-text-soft-400 text-center mt-1">
											PNG, JPG or WebP<br />Max 5MB
										</p>
										<input
											id="product-image-modal"
											type="file"
											accept="image/*"
											className="sr-only"
											onChange={handleImageUpload}
										/>
									</FileUpload.Root>
								)}

								{/* Quick Tips */}
								<div className="mt-4 rounded-lg bg-information-lighter/50 p-3 ring-1 ring-inset ring-information-base/20">
									<p className="text-paragraph-xs text-text-sub-600">
										<strong className="text-information-base">Tip:</strong> Use high-quality images for better engagement. Square images work best.
									</p>
								</div>
							</div>

							{/* Right Column - Form Fields */}
							<div className="sm:col-span-3 p-5 sm:p-6 space-y-5">
								{/* Product Name */}
								<div className="space-y-1.5">
									<label className="flex items-center gap-1 text-label-sm text-text-strong-950">
										Product Name
										<span className="text-error-base">*</span>
									</label>
									<Input.Root>
										<Input.Wrapper>
											<Input.El {...register("name")} placeholder="e.g., Nike Air Max 270" />
										</Input.Wrapper>
									</Input.Root>
									{errors.name && (
										<p className="text-paragraph-xs text-error-base">{errors.name.message}</p>
									)}
								</div>

								{/* Category & Platform - Side by side */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<label className="flex items-center gap-1 text-label-sm text-text-strong-950">
											Category
											<span className="text-error-base">*</span>
										</label>
										<Controller
											name="categoryId"
											control={control}
											render={({ field }) => (
												<Select.Root value={field.value || ""} onValueChange={field.onChange}>
													<Select.Trigger>
														<Select.Value placeholder="Select category" />
													</Select.Trigger>
													<Select.Content>
														{categories.length > 0 ? (
															categories.map((cat) => (
																<Select.Item key={cat.id} value={cat.id}>
																	{cat.name}
																</Select.Item>
															))
														) : (
															<Select.Item value="_none" disabled>No categories</Select.Item>
														)}
													</Select.Content>
												</Select.Root>
											)}
										/>
										{errors.categoryId && (
											<p className="text-paragraph-xs text-error-base">{errors.categoryId.message}</p>
										)}
									</div>
									<div className="space-y-1.5">
										<label className="flex items-center gap-1 text-label-sm text-text-strong-950">
											Platform
											<span className="text-error-base">*</span>
										</label>
										<Controller
											name="platformId"
											control={control}
											render={({ field }) => (
												<Select.Root value={field.value || ""} onValueChange={field.onChange}>
													<Select.Trigger>
														<Select.Value placeholder="Select platform" />
													</Select.Trigger>
													<Select.Content>
														{platforms.length > 0 ? (
															platforms.map((p) => (
																<Select.Item key={p.id} value={p.id}>
																	{p.name}
																</Select.Item>
															))
														) : (
															<Select.Item value="_none" disabled>No platforms</Select.Item>
														)}
													</Select.Content>
												</Select.Root>
											)}
										/>
										{errors.platformId && (
											<p className="text-paragraph-xs text-error-base">{errors.platformId.message}</p>
										)}
									</div>
								</div>

								{/* Price & SKU - Side by side */}
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<label className="flex items-center gap-1 text-label-sm text-text-strong-950">
											Price (₹)
											<span className="text-error-base">*</span>
										</label>
										<Input.Root>
											<Input.Wrapper>
												<span className="text-text-sub-600 font-medium pl-1">₹</span>
												<Input.El
													{...register("price", { valueAsNumber: true })}
													type="number"
													placeholder="9,999"
													className="pl-1"
												/>
											</Input.Wrapper>
										</Input.Root>
										{errors.price && (
											<p className="text-paragraph-xs text-error-base">{errors.price.message}</p>
										)}
									</div>
									<div className="space-y-1.5">
										<label className="text-label-sm text-text-strong-950">
											SKU <span className="text-text-soft-400 font-normal">(optional)</span>
										</label>
										<Input.Root>
											<Input.Wrapper>
												<Input.El {...register("sku")} placeholder="Auto-generated" />
											</Input.Wrapper>
										</Input.Root>
									</div>
								</div>

								{/* Product URL */}
								<div className="space-y-1.5">
									<label className="text-label-sm text-text-strong-950">
										Product URL <span className="text-text-soft-400 font-normal">(optional)</span>
									</label>
									<Input.Root>
										<Input.Wrapper>
											<ArrowSquareOut weight="duotone" className="size-4 text-text-soft-400 shrink-0" />
											<Input.El {...register("productLink")} placeholder="https://amazon.in/dp/..." />
										</Input.Wrapper>
									</Input.Root>
									{errors.productLink && (
										<p className="text-paragraph-xs text-error-base">{errors.productLink.message}</p>
									)}
								</div>

								{/* Description */}
								<div className="space-y-1.5">
									<label className="text-label-sm text-text-strong-950">
										Description <span className="text-text-soft-400 font-normal">(optional)</span>
									</label>
									<Textarea.Root
										{...register("description")}
										placeholder="Brief description of the product..."
										rows={3}
									/>
									<div className="flex justify-between items-center">
										<span className="text-paragraph-xs text-text-soft-400">
											{(description || "").length}/500 characters
										</span>
										{errors.description && (
											<span className="text-paragraph-xs text-error-base">{errors.description.message}</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer className="border-t border-stroke-soft-200">
					<Button.Root
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button.Root>
					<Button.Root type="submit" form="product-form" variant="primary" disabled={isPending}>
						{isPending ? "Saving..." : product ? "Save Changes" : "Add Product"}
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
	organizationId: string
}

// Industry Standard: Proper TypeScript types instead of any
interface ImportRow {
	name: string
	description?: string
	categoryId?: string
	platformId?: string
	productLink?: string
	sku: string
	price: number
}

// Match actual return type from bulkImportProducts action
type ImportResult = 
	| { success: true; message: string; imported: number; errors?: string[] }
	| { success: false; error: string }

function BulkImportModal({ open, onOpenChange, categories, platforms, organizationId }: BulkImportModalProps) {
	const [importData, setImportData] = useState<ImportRow[]>([])
	const [result, setResult] = useState<ImportResult | null>(null)
	const [step, setStep] = useState<"upload" | "preview" | "result">("upload")
	const [isPending, startTransition] = useTransition()

	// Reset state when modal closes
	useEffect(() => {
		if (!open) {
			setImportData([])
			setResult(null)
			setStep("upload")
		}
	}, [open])

	const handleFileUpload = (files: File[]) => {
		const file = files[0]
		if (!file) return

		// Parse CSV file
		const reader = new FileReader()
		reader.onload = (e) => {
			const text = e.target?.result as string
			const lines = text.split("\n").filter((line) => line.trim())

			if (lines.length < 2) {
				toast.error("CSV file must have a header row and at least one data row")
				return
			}

			// Parse header
			const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
			const nameIdx = headers.findIndex((h) => h === "name" || h === "product name")
			const descIdx = headers.findIndex((h) => h === "description")
			const categoryIdx = headers.findIndex((h) => h === "category")
			const platformIdx = headers.findIndex((h) => h === "platform")
			const urlIdx = headers.findIndex((h) => h === "url" || h === "product url")

			if (nameIdx === -1) {
				toast.error('CSV must have a "name" column')
				return
			}

			// Parse data rows
			// Industry Standard: Use proper types instead of Partial
			const products: Array<{
				name: string
				description?: string
				categoryId?: string
				platformId?: string
				productLink?: string
				sku: string
				price: number
			}> = []
			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
				if (values[nameIdx]) {
					products.push({
						name: values[nameIdx],
						description: descIdx >= 0 ? values[descIdx] : undefined,
						categoryId:
							categoryIdx >= 0 && values[categoryIdx]
								? values[categoryIdx]
								: categories[0]?.id || undefined,
						platformId:
							platformIdx >= 0 && values[platformIdx]
								? values[platformIdx]
								: platforms[0]?.id || undefined,
						productLink: urlIdx >= 0 ? values[urlIdx] || "" : "",
						sku: `SKU-${nanoid(8)}-${i}`,
						price: 0, // Default price, can be updated later
					})
				}
			}

			if (products.length === 0) {
				toast.error("No valid products found in CSV")
				return
			}

			setImportData(products)
			setStep("preview")
			toast.success(`Found ${products.length} products to import`)
		}
		reader.readAsText(file)
	}

	const handleImport = () => {
		startTransition(async () => {
			try {
				// Industry Standard: Type-safe conversion
				const productsToImport: Array<Partial<organizations.BulkProductInput>> = importData.map((row) => ({
					name: row.name,
					description: row.description,
					categoryId: row.categoryId,
					platformId: row.platformId,
					productLink: row.productLink,
					sku: row.sku,
					price: row.price,
				}))
				// URL-based multi-tenancy: pass organizationId
				const response = await bulkImportProducts({ organizationId, products: productsToImport })

				const typedResponse: ImportResult = {
					success: true,
					message: typeof response === 'string' ? response : "Import completed",
					imported: importData.length,
					errors: []
				}

				setResult(typedResponse)
				setStep("result")
				toast.success(`Successfully imported ${typedResponse.imported} products`)
			} catch (error) {
				const errorMessage = getErrorMessage(error, "Failed to import products")
				const typedResponse: ImportResult = {
					success: false,
					error: errorMessage
				}
				setResult(typedResponse)
				setStep("result")
				toast.error(errorMessage)
			}
		})
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="sm:max-w-lg">
				<Modal.Header>
					<Modal.Title>
						{step === "upload" && "Import Products"}
						{step === "preview" && "Preview Import"}
						{step === "result" && "Import Complete"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{step === "upload" && (
						<div className="space-y-4">
							<p className="text-paragraph-sm text-text-sub-600">
								Upload a CSV file with your products. The file should have columns for: name,
								description, category, platform, and product URL.
							</p>
							<FileDropzone
								onFilesSelected={handleFileUpload}
								accept={{ "text/csv": [".csv"] }}
								maxFiles={1}
								maxSize={FILE_SIZES.MAX_PRODUCT_IMAGE_SIZE}
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

					{step === "preview" && (
						<div className="space-y-4">
							<p className="text-paragraph-sm text-text-sub-600">
								Review the products to be imported ({importData.length} items)
							</p>
							<div className="max-h-64 overflow-y-auto rounded-lg border border-stroke-soft-200 divide-y divide-stroke-soft-200">
								{importData.slice(0, DISPLAY_LIMITS.PRODUCT_PREVIEW).map((product, idx) => (
									<div key={product.sku || `product-${product.name}-${product.price}-${idx}`} className="p-3 text-paragraph-sm">
										<div className="font-medium text-text-strong-950">{product.name}</div>
										<div className="text-paragraph-xs text-text-sub-600 mt-0.5">
											{product.categoryId || "N/A"} • {product.platformId || "N/A"}
										</div>
									</div>
								))}
								{importData.length > DISPLAY_LIMITS.PRODUCT_PREVIEW && (
									<div className="p-3 text-paragraph-xs text-text-soft-400 text-center">
										+ {importData.length - DISPLAY_LIMITS.PRODUCT_PREVIEW} more items
									</div>
								)}
							</div>
						</div>
					)}

					{step === "result" && result && (
						<div className="space-y-4">
							{result.success ? (
								<>
									<div className="rounded-lg bg-success-lighter p-4 text-center">
										<div className="mx-auto size-12 rounded-full bg-success-base flex items-center justify-center mb-3">
											<CloudArrowUp className="size-6 text-white" />
										</div>
										<h3 className="text-label-lg font-semibold text-text-strong-950">
											Import Successful
										</h3>
										<p className="text-paragraph-sm text-text-sub-600 mt-1">{result.message}</p>
									</div>
									{result.errors && result.errors.length > 0 && (
										<div className="rounded-lg bg-error-lighter p-4">
											<h4 className="text-label-sm font-medium text-error-base mb-2">Errors</h4>
											<ul className="list-disc list-inside text-paragraph-xs text-text-sub-600">
												{result.errors.map((error: string, i: number) => (
													<li key={`error-${error}-${i}`}>{error}</li>
												))}
											</ul>
										</div>
									)}
								</>
							) : (
								<div className="rounded-lg bg-error-lighter p-4 text-center">
									<h3 className="text-label-lg font-semibold text-error-base">Import Failed</h3>
									<p className="text-paragraph-sm text-text-sub-600 mt-1">{result.error}</p>
								</div>
							)}
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					{step === "upload" && (
						<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
							Cancel
						</Button.Root>
					)}
					{step === "preview" && (
						<>
							<Button.Root variant="ghost" onClick={() => setStep("upload")} disabled={isPending}>
								Back
							</Button.Root>
							<Button.Root variant="primary" onClick={handleImport} disabled={isPending}>
								{isPending ? "Importing..." : "Import Products"}
							</Button.Root>
						</>
					)}
					{step === "result" && (
						<Button.Root variant="primary" onClick={() => onOpenChange(false)}>
							Done
						</Button.Root>
					)}
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
