"use client"

import { Warning, Bank } from "@phosphor-icons/react"
import { ConfirmationModal } from "../confirmation-modal"

interface DeleteBankAccountModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	bankName: string
	accountNumber: string
	isDefault: boolean
	onConfirm: () => void
	isLoading?: boolean
}

export function DeleteBankAccountModal({
	open,
	onOpenChange,
	bankName,
	accountNumber,
	isDefault,
	onConfirm,
	isLoading = false,
}: DeleteBankAccountModalProps) {
	return (
		<ConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Bank Account"
			description="Are you sure you want to remove this bank account?"
			variant="danger"
			icon={Bank}
			confirmLabel="Remove Account"
			loadingLabel="Removing..."
			onConfirm={onConfirm}
			isLoading={isLoading}
		>
			<div className="rounded-10 bg-bg-weak-50 p-4">
				<div className="flex items-center gap-3">
					<Bank weight="duotone" className="size-5 text-text-sub-600" />
					<div>
						<p className="text-label-sm text-text-strong-950">{bankName}</p>
						<p className="text-paragraph-xs text-text-sub-600">
							****{accountNumber.slice(-4)}
							{isDefault && (
								<span className="ml-2 text-primary-base">(Default)</span>
							)}
						</p>
					</div>
				</div>
			</div>
			{isDefault && (
				<div className="mt-3 rounded-10 bg-warning-lighter p-3 text-paragraph-sm text-warning-base">
					<Warning weight="duotone" className="inline-block size-4 mr-2" />
					This is your default withdrawal account. You&apos;ll need to set another account as default.
				</div>
			)}
		</ConfirmationModal>
	)
}
