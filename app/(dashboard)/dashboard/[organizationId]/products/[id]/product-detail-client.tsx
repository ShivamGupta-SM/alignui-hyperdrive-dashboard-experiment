"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useCurrentOrganization } from "@/hooks/shared/use-current-organization"
import { useQueryClient } from "@tanstack/react-query"
import * as Button from "@/components/ui/primitives/button"
import * as Badge from "@/components/ui/data-display/badge"
import * as StatusBadge from "@/components/ui/data-display/status-badge"
import * as Dropdown from "@/components/ui/layout/dropdown"
import * as LinkButton from "@/components/ui/primitives/link-button"
import { ConfirmationModal } from "@/components/dashboard/modals"
import { cn, getErrorMessage, formatCurrency, formatDateMedium } from "@/lib/utils"
import {
	PencilSimple,
	DotsThree,
	Trash,
	CaretRight,
	CaretLeft,
	Package,
	Tag,
	Link as LinkIcon,
	Barcode,
	Megaphone,
	CalendarBlank,
	ArrowSquareOut,
	ShoppingCart,
	ChartLineUp,
	Plus,
} from "@phosphor-icons/react"
import { CAMPAIGN_STATUS_CONFIG, getCampaignStatusBadgeStatus } from "@/lib/constants"
import type { CampaignStatus } from "@/features/campaigns/types"
import { deleteProduct, productKeys, type ProductWithStats } from "@/features/products"
import type { products, platforms } from "@/brand-client"
import { toast } from "sonner"

interface ProductCampaign {
	id: string
	title: string
	status: string
	startDate: string
	endDate: string
}

interface ProductDetailClientProps {
	productId: string
	initialData?: ProductWithStats & {
		campaigns?: ProductCampaign[]
		categories?: products.ProductCategory[]
		platforms?: platforms.Platform[]
	}
}

export function ProductDetailClient({ productId, initialData }: ProductDetailClientProps) {
	const router = useRouter()
	const { organizationId } = useCurrentOrganization()
	const queryClient = useQueryClient()

	const product = initialData
	const campaigns = initialData?.campaigns ?? []
	const categories = initialData?.categories ?? []
	const platformsList = initialData?.platforms ?? []

	const [isPending, startTransition] = React.useTransition()
	const [confirmModal, setConfirmModal] = React.useState<{
		open: boolean
		title: string
		description: string
		variant: "danger" | "warning" | "info"
		action: () => void
	} | null>(null)

	// Find category and platform names
	const categoryName = React.useMemo(() => {
		if (!product?.categoryId) return null
		const cat = categories.find((c) => c.id === product.categoryId)
		return cat?.name || null
	}, [product?.categoryId, categories])

	const platformName = React.useMemo(() => {
		if (!product?.platformId) return null
		const plat = platformsList.find((p) => p.id === product.platformId)
		return plat?.name || null
	}, [product?.platformId, platformsList])

	const handleDelete = () => {
		setConfirmModal({
			open: true,
			title: "Delete Product",
			description: "Are you sure you want to delete this product? This action cannot be undone.",
			variant: "danger",
			action: () => {
				startTransition(async () => {
					try {
						await deleteProduct({ organizationId, id: productId })
						toast.success("Product deleted successfully")
						setConfirmModal(null)
						queryClient.invalidateQueries({ queryKey: productKeys.lists(organizationId) })
						router.push(`/dashboard/${organizationId}/products`)
					} catch (error) {
						toast.error(getErrorMessage(error, "Failed to delete product"))
					}
				})
			},
		})
	}

	if (!product) {
		return (
			<div className="max-w-2xl mx-auto py-12">
				<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-8 text-center">
					<div className="size-16 rounded-2xl bg-error-lighter flex items-center justify-center mx-auto mb-4">
						<Package weight="duotone" className="size-8 text-error-base" />
					</div>
					<h2 className="text-title-h5 text-text-strong-950 mb-2">Product not found</h2>
					<p className="text-paragraph-sm text-text-sub-600 mb-6">
						The product you&apos;re looking for doesn&apos;t exist or has been deleted.
					</p>
					<Button.Root variant="neutral" size="small" asChild>
						<Link href={`/dashboard/${organizationId}/products`}>
							<Button.Icon><CaretLeft className="size-5" /></Button.Icon>
							Back to Products
						</Link>
					</Button.Root>
				</div>
			</div>
		)
	}

	const primaryImage = product.productImages?.find((img) => img.isPrimary) || product.productImages?.[0]
	const activeCampaigns = campaigns.filter((c) => c.status === "active").length

	return (
		<div className="space-y-6">
			{/* Back Button */}
			<Button.Root variant="ghost" size="small" asChild>
				<Link href={`/dashboard/${organizationId}/products`}>
					<Button.Icon><CaretLeft className="size-5" /></Button.Icon>
					Products
				</Link>
			</Button.Root>

			{/* Hero Section - Product Header */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
				<div className="p-5 sm:p-6">
					<div className="flex flex-col lg:flex-row gap-6">
						{/* Product Image - Large */}
						<div className="shrink-0 lg:w-72">
							<div className="aspect-square rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
								{primaryImage?.imageUrl ? (
									<Image
										src={primaryImage.imageUrl}
										alt={primaryImage.altText || product.name}
										width={288}
										height={288}
										className="size-full object-contain p-4"
									/>
								) : (
									<div className="size-full flex items-center justify-center">
										<Package weight="duotone" className="size-20 text-text-soft-400" />
									</div>
								)}
							</div>

							{/* Additional Images */}
							{product.productImages && product.productImages.length > 1 && (
								<div className="flex gap-2 mt-3">
									{product.productImages.slice(0, 4).map((img) => (
										<div
											key={img.imageUrl}
											className={cn(
												"size-14 rounded-lg bg-bg-weak-50 ring-1 ring-inset overflow-hidden cursor-pointer",
												img.isPrimary ? "ring-primary-base ring-2" : "ring-stroke-soft-200"
											)}
										>
											<Image
												src={img.imageUrl}
												alt={img.altText || product.name}
												width={56}
												height={56}
												className="size-full object-cover"
											/>
										</div>
									))}
									{product.productImages.length > 4 && (
										<div className="size-14 rounded-lg bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200 flex items-center justify-center">
											<span className="text-label-sm text-text-sub-600">+{product.productImages.length - 4}</span>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Product Info */}
						<div className="flex-1 min-w-0">
							{/* Badges */}
							<div className="flex flex-wrap items-center gap-2 mb-3">
								{categoryName && (
									<Badge.Root color="blue" variant="lighter" size="medium">
										<Badge.Icon as={Tag} />
										{categoryName}
									</Badge.Root>
								)}
								{platformName && (
									<Badge.Root color="gray" variant="lighter" size="medium">
										<Badge.Icon as={Package} />
										{platformName}
									</Badge.Root>
								)}
							</div>

							{/* Title & Actions */}
							<div className="flex items-start justify-between gap-4 mb-2">
								<h1 className="text-title-h4 sm:text-title-h3 text-text-strong-950">{product.name}</h1>
								<div className="flex items-center gap-2 shrink-0">
									{product.productLink && (
										<Button.Root variant="neutral" size="small" asChild>
											<a href={product.productLink} target="_blank" rel="noopener noreferrer">
												<Button.Icon><ArrowSquareOut className="size-5" /></Button.Icon>
												<span className="hidden sm:inline">View Listing</span>
											</a>
										</Button.Root>
									)}
									<Button.Root variant="neutral" size="small" asChild>
										<Link href={`/dashboard/${organizationId}/products?edit=${productId}`}>
											<Button.Icon><PencilSimple className="size-5" /></Button.Icon>
											<span className="hidden sm:inline">Edit</span>
										</Link>
									</Button.Root>
									<Dropdown.Root>
										<Dropdown.Trigger asChild>
											<Button.Root variant="ghost" size="small" aria-label="More actions">
												<Button.Icon><DotsThree weight="bold" className="size-5" /></Button.Icon>
											</Button.Root>
										</Dropdown.Trigger>
										<Dropdown.Content align="end">
											<Dropdown.Item onClick={handleDelete} className="text-error-base" disabled={isPending}>
												<Dropdown.ItemIcon as={Trash} />
												Delete Product
											</Dropdown.Item>
										</Dropdown.Content>
									</Dropdown.Root>
								</div>
							</div>
							<div className="text-title-h5 text-primary-base font-semibold mb-4">
								{formatCurrency(product.price)}
							</div>

							{/* Description */}
							{product.description && (
								<p className="text-paragraph-sm text-text-sub-600 mb-5 max-w-2xl">
									{product.description}
								</p>
							)}

							{/* Quick Info Pills */}
							<div className="flex flex-wrap gap-3 mb-6">
								<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-weak-50">
									<Barcode weight="duotone" className="size-4 text-text-sub-600" />
									<span className="text-label-sm text-text-strong-950 font-mono">{product.sku}</span>
								</div>
								{product.productLink && (
									<a
										href={product.productLink}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-weak-50 hover:bg-bg-soft-200 transition-colors"
									>
										<LinkIcon weight="duotone" className="size-4 text-primary-base" />
										<span className="text-label-sm text-primary-base">Product Link</span>
									</a>
								)}
							</div>

							{/* Stats Row */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								<div className="p-3 rounded-xl bg-bg-weak-50">
									<div className="flex items-center gap-2 mb-1">
										<Megaphone weight="duotone" className="size-4 text-primary-base" />
										<span className="text-label-xs text-text-soft-400 uppercase tracking-wide">Campaigns</span>
									</div>
									<div className="text-title-h6 text-text-strong-950 font-semibold">
										{campaigns.length}
									</div>
								</div>
								<div className="p-3 rounded-xl bg-bg-weak-50">
									<div className="flex items-center gap-2 mb-1">
										<ChartLineUp weight="duotone" className="size-4 text-success-base" />
										<span className="text-label-xs text-text-soft-400 uppercase tracking-wide">Active</span>
									</div>
									<div className="text-title-h6 text-success-base font-semibold">
										{activeCampaigns}
									</div>
								</div>
								<div className="p-3 rounded-xl bg-bg-weak-50">
									<div className="flex items-center gap-2 mb-1">
										<ShoppingCart weight="duotone" className="size-4 text-information-base" />
										<span className="text-label-xs text-text-soft-400 uppercase tracking-wide">Status</span>
									</div>
									<div className="text-title-h6 text-text-strong-950 font-semibold">
										{product.isActive ? "Active" : "Inactive"}
									</div>
								</div>
								<div className="p-3 rounded-xl bg-bg-weak-50">
									<div className="flex items-center gap-2 mb-1">
										<ChartLineUp weight="duotone" className="size-4 text-warning-base" />
										<span className="text-label-xs text-text-soft-400 uppercase tracking-wide">Price</span>
									</div>
									<div className="text-title-h6 text-text-strong-950 font-semibold">
										{formatCurrency(product.price ?? 0)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Campaigns Section */}
			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-stroke-soft-200">
					<div className="flex items-center gap-3">
						<div className="size-10 rounded-xl bg-primary-alpha-10 flex items-center justify-center">
							<Megaphone weight="duotone" className="size-5 text-primary-base" />
						</div>
						<div>
							<h2 className="text-label-md text-text-strong-950">Associated Campaigns</h2>
							<p className="text-paragraph-xs text-text-sub-600">{campaigns.length} total campaigns</p>
						</div>
					</div>
					<Button.Root variant="primary" size="small" asChild>
						<Link href={`/dashboard/${organizationId}/campaigns/create?productId=${productId}`}>
							<Button.Icon><Plus className="size-5" /></Button.Icon>
							New Campaign
						</Link>
					</Button.Root>
				</div>

				{/* Content */}
				{campaigns.length > 0 ? (
					<div className="divide-y divide-stroke-soft-200">
						{campaigns.map((campaign) => {
							const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status as keyof typeof CAMPAIGN_STATUS_CONFIG]
							return (
								<div
									key={campaign.id}
									className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-bg-weak-50 cursor-pointer transition-colors"
									onClick={() => router.push(`/dashboard/${organizationId}/campaigns/${campaign.id}`)}
								>
									<div className="flex items-center gap-4 min-w-0 flex-1">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-3 mb-1">
												<h3 className="text-label-sm text-text-strong-950 font-medium truncate">
													{campaign.title}
												</h3>
												<StatusBadge.Root
													status={getCampaignStatusBadgeStatus(campaign.status as CampaignStatus)}
													variant="light"
												>
													<StatusBadge.Dot />
													{statusConfig?.label || campaign.status}
												</StatusBadge.Root>
											</div>
											<div className="flex items-center gap-1.5 text-paragraph-xs text-text-sub-600">
												<CalendarBlank weight="duotone" className="size-3.5" />
												{formatDateMedium(campaign.startDate)} — {formatDateMedium(campaign.endDate)}
											</div>
										</div>
									</div>
									<LinkButton.Root variant="gray" size="medium">
										View
										<LinkButton.Icon as={CaretRight} weight="bold" />
									</LinkButton.Root>
								</div>
							)
						})}
					</div>
				) : (
					<div className="px-5 sm:px-6 py-12 text-center">
						<div className="size-16 rounded-2xl bg-bg-weak-50 flex items-center justify-center mx-auto mb-4">
							<Megaphone weight="duotone" className="size-8 text-text-soft-400" />
						</div>
						<h3 className="text-label-md text-text-strong-950 mb-1">No campaigns yet</h3>
						<p className="text-paragraph-sm text-text-sub-600 mb-5 max-w-sm mx-auto">
							Create your first campaign to start promoting this product and tracking enrollments.
						</p>
						<Button.Root variant="primary" size="small" asChild>
							<Link href={`/dashboard/${organizationId}/campaigns/create?productId=${productId}`}>
								<Button.Icon><Plus className="size-5" /></Button.Icon>
								Create Campaign
							</Link>
						</Button.Root>
					</div>
				)}
			</div>

			{/* Confirmation Modal */}
			{confirmModal && (
				<ConfirmationModal
					open={confirmModal.open}
					onOpenChange={(open: boolean) => !open && setConfirmModal(null)}
					title={confirmModal.title}
					description={confirmModal.description}
					variant={confirmModal.variant}
					confirmLabel="Confirm"
					onConfirm={confirmModal.action}
				/>
			)}
		</div>
	)
}
