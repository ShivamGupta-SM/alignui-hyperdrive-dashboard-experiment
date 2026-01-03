"use client"

import { Warning, Trash } from "@phosphor-icons/react"
import { ConfirmationModal } from "./confirmation-modal"

interface DeleteProductModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	productName: string
	activeCampaignsCount: number
	onConfirm: () => void
	isLoading?: boolean
}

export function DeleteProductModal({
	open,
	onOpenChange,
	productName,
	activeCampaignsCount,
	onConfirm,
	isLoading = false,
}: DeleteProductModalProps) {
	return (
		<ConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Product"
			description={`Are you sure you want to delete "${productName}"?`}
			variant="danger"
			icon={Trash}
			confirmLabel="Delete Product"
			loadingLabel="Deleting..."
			onConfirm={onConfirm}
			isLoading={isLoading}
		>
			<div className="rounded-10 bg-error-lighter/50 p-3 text-paragraph-sm text-error-base">
				<Warning weight="duotone" className="inline-block size-4 mr-2" />
				This action cannot be undone.
			</div>
			{activeCampaignsCount > 0 && (
				<div className="mt-3 rounded-10 bg-warning-lighter p-3 text-paragraph-sm text-warning-base">
					<Warning weight="duotone" className="inline-block size-4 mr-2" />
					This product is used in {activeCampaignsCount} active campaign{activeCampaignsCount !== 1 ? "s" : ""}.
					Those campaigns will need to be updated.
				</div>
			)}
		</ConfirmationModal>
	)
}
