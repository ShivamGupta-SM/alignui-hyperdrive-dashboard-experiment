"use client"

/**
 * CreditLimitRequestModal - Modal for requesting credit limit increase
 *
 * ✅ FIX Bug 22 & 27: Uses shared useCurrencyForm hook
 */

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Textarea from "@/components/ui/forms/textarea"
import { Info } from "@phosphor-icons/react"
import { formatCurrency } from "@/lib/utils"
import { useCurrencyForm } from "@/hooks/forms"

interface CreditLimitRequestModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentLimit: number
	onConfirm: (requestedLimit: number, reason: string) => void
	isLoading?: boolean
}

export function CreditLimitRequestModal({
	open,
	onOpenChange,
	currentLimit,
	onConfirm,
	isLoading = false,
}: CreditLimitRequestModalProps) {
	// ✅ FIX Bug 22 & 27: Using shared currency form hook
	const { amount: requestedLimit, setAmount: setRequestedLimit, amountNumber, isValidAmount, errorMessage, reset } = useCurrencyForm({
		minAmount: currentLimit + 1, // Must be greater than current limit
	})
	const [reason, setReason] = React.useState("")

	// Reset form when modal closes
	React.useEffect(() => {
		if (!open) {
			reset()
			setReason("")
		}
	}, [open, reset])

	const handleConfirm = () => {
		onConfirm(amountNumber, reason)
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Request Credit Limit Increase</Modal.Title>
				</Modal.Header>
				<Modal.Body className="space-y-4">
					<div className="rounded-10 bg-bg-weak-50 p-3">
						<span className="text-paragraph-sm text-text-sub-600">Current Credit Limit:</span>
						<div className="text-label-lg text-text-strong-950">{formatCurrency(currentLimit)}</div>
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Requested Credit Limit <span className="text-error-base">*</span>
						</label>
						<Input.Root>
							<Input.Wrapper>
								<span className="pl-3 text-text-sub-600">₹</span>
								<Input.El
									type="number"
									placeholder="2,50,000"
									value={requestedLimit}
									onChange={(e) => setRequestedLimit(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						{errorMessage && (
							<p className="mt-1 text-paragraph-xs text-error-base">{errorMessage}</p>
						)}
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Reason for Request <span className="text-error-base">*</span>
						</label>
						<Textarea.Root
							placeholder="We are planning to run multiple large campaigns during the upcoming festive season and need additional credit to support higher enrollment volumes."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							rows={4}
						/>
					</div>

					<div className="flex items-start gap-2 text-paragraph-xs text-text-soft-400">
						<Info className="size-4 shrink-0" />
						<span>
							Credit limit increases are reviewed within 2-3 business days. You'll receive an email
							notification once a decision is made.
						</span>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root
						variant="primary"
						onClick={handleConfirm}
						disabled={!isValidAmount || !reason.trim() || isLoading}
					>
						{isLoading ? "Submitting..." : "Submit Request"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
