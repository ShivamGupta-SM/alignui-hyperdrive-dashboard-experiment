"use client"

import { Warning, Trash } from "@phosphor-icons/react"
import { ConfirmationModal } from "../confirmation-modal"

interface DeleteCampaignModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	campaignTitle: string
	enrollmentsCount: number
	onConfirm: () => void
	isLoading?: boolean
}

export function DeleteCampaignModal({
	open,
	onOpenChange,
	campaignTitle,
	enrollmentsCount,
	onConfirm,
	isLoading = false,
}: DeleteCampaignModalProps) {
	return (
		<ConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Campaign"
			description={`Are you sure you want to delete "${campaignTitle}"?`}
			variant="danger"
			icon={Trash}
			confirmLabel="Delete Campaign"
			loadingLabel="Deleting..."
			onConfirm={onConfirm}
			isLoading={isLoading}
		>
			<div className="rounded-10 bg-error-lighter/50 p-3 text-paragraph-sm text-error-base">
				<Warning weight="duotone" className="inline-block size-4 mr-2" />
				This action cannot be undone.
			</div>
			{enrollmentsCount > 0 && (
				<div className="mt-3 rounded-10 bg-warning-lighter p-3 text-paragraph-sm text-warning-base">
					<Warning weight="duotone" className="inline-block size-4 mr-2" />
					This campaign has {enrollmentsCount} active enrollment{enrollmentsCount !== 1 ? "s" : ""}.
					All enrollments will be cancelled.
				</div>
			)}
		</ConfirmationModal>
	)
}
