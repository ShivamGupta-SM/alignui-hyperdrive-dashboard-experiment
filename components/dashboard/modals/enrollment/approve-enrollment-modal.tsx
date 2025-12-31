"use client"

import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import { Check } from "@phosphor-icons/react"
import { formatCurrency } from "@/lib/utils/format"

interface ApproveEnrollmentModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	orderValue: number
	billRate: number
	platformFee: number
	gstRate?: number
	onConfirm: () => void
	isLoading?: boolean
}

export function ApproveEnrollmentModal({
	open,
	onOpenChange,
	orderValue,
	billRate,
	platformFee,
	gstRate = 18,
	onConfirm,
	isLoading = false,
}: ApproveEnrollmentModalProps) {
	const billAmount = orderValue * (billRate / 100)
	const gstAmount = billAmount * (gstRate / 100)
	const total = billAmount + gstAmount + platformFee

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<div className="flex flex-col items-center text-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-success-lighter mb-4">
							<Check weight="bold" className="size-6 text-success-base" />
						</div>
						<Modal.Title>Confirm Approval</Modal.Title>
						<Modal.Description className="mt-2">
							You are about to approve this enrollment. This will:
						</Modal.Description>
					</div>
				</Modal.Header>
				<Modal.Body>
					<ul className="space-y-2 text-paragraph-sm text-text-sub-600 mb-4">
						<li className="flex items-center gap-2">
							<Check className="size-4 text-success-base shrink-0" />
							Commit the held amount from your wallet
						</li>
						<li className="flex items-center gap-2">
							<Check className="size-4 text-success-base shrink-0" />
							Transfer payout to the shopper
						</li>
						<li className="flex items-center gap-2">
							<Check className="size-4 text-success-base shrink-0" />
							Mark the enrollment as completed
						</li>
					</ul>

					<div className="rounded-10 bg-bg-weak-50 p-4">
						<h4 className="text-label-sm text-text-strong-950 mb-3">Billing Summary</h4>
						<div className="space-y-2 text-paragraph-sm">
							<div className="flex justify-between">
								<span className="text-text-sub-600">Order Value</span>
								<span className="text-text-strong-950">{formatCurrency(orderValue)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-sub-600">Bill Rate ({billRate}%)</span>
								<span className="text-text-strong-950">{formatCurrency(billAmount)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-sub-600">Platform Fee</span>
								<span className="text-text-strong-950">{formatCurrency(platformFee)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-sub-600">GST ({gstRate}%)</span>
								<span className="text-text-strong-950">{formatCurrency(gstAmount)}</span>
							</div>
							<div className="border-t border-stroke-soft-200 pt-2 mt-2">
								<div className="flex justify-between font-medium">
									<span className="text-text-strong-950">Total Brand Cost</span>
									<span className="text-primary-base">{formatCurrency(total)}</span>
								</div>
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root variant="primary" onClick={onConfirm} disabled={isLoading}>
						{isLoading ? "Processing..." : `Approve & Pay ${formatCurrency(total)}`}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
