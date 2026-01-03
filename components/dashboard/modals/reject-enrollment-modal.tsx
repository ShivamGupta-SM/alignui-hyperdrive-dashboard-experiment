"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Checkbox from "@/components/ui/forms/checkbox"
import { Warning } from "@phosphor-icons/react"
import { cn, formatCurrency } from "@/lib/utils"
import { logError } from "@/lib/logging/error-logger-simple"
import { REJECTION_REASONS } from "@/lib/constants"
import { toast } from "sonner"

interface RejectEnrollmentModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	holdAmount: number
	onConfirm: (reason: string, comments: string) => void
	isLoading?: boolean
}

export function RejectEnrollmentModal({
	open,
	onOpenChange,
	holdAmount,
	onConfirm,
	isLoading = false,
}: RejectEnrollmentModalProps) {
	const [selectedReason, setSelectedReason] = React.useState<string>("")
	const [comments, setComments] = React.useState("")
	const commentsId = React.useId()

	const handleConfirm = React.useCallback(() => {
		if (!selectedReason) {
			toast.error("Please select a rejection reason")
			return
		}
		try {
			onConfirm(selectedReason, comments)
		} catch (error) {
			logError(error, { source: "RejectEnrollmentModal", data: { action: "reject", selectedReason } })
			toast.error("Failed to reject enrollment. Please try again.")
		}
	}, [selectedReason, comments, onConfirm])

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="max-w-md"
				role="alertdialog"
				accessibilityTitle="Reject Enrollment"
			>
				<Modal.Header>
					<Modal.Title>Reject Enrollment</Modal.Title>
				</Modal.Header>
				<Modal.Body className="space-y-4">
					<div className="rounded-10 bg-warning-lighter p-3 text-paragraph-sm text-warning-base" role="alert">
						<Warning weight="duotone" className="inline-block size-4 mr-2" aria-hidden="true" />
						This action cannot be undone. The shopper will be notified and the hold amount will be
						released.
					</div>

					<fieldset>
						<legend className="block text-label-sm text-text-strong-950 mb-2">
							Reason for Rejection <span className="text-error-base" aria-label="required">*</span>
						</legend>
						<div className="space-y-2" role="radiogroup" aria-required="true">
							{REJECTION_REASONS.map((reason) => (
								<label
									key={reason.id}
									className={cn(
										"flex items-center gap-3 p-3 rounded-10 border cursor-pointer transition-colors",
										selectedReason === reason.id
											? "border-primary-base bg-primary-alpha-10"
											: "border-stroke-soft-200 hover:bg-bg-weak-50"
									)}
								>
									<Checkbox.Root
										checked={selectedReason === reason.id}
										onCheckedChange={() => setSelectedReason(reason.id)}
										aria-describedby={`reason-${reason.id}`}
									/>
									<span id={`reason-${reason.id}`} className="text-paragraph-sm text-text-strong-950">{reason.label}</span>
								</label>
							))}
						</div>
					</fieldset>

					<div>
						<label htmlFor={commentsId} className="block text-label-sm text-text-strong-950 mb-2">
							Additional Comments (visible to shopper)
						</label>
						<Textarea.Root
							id={commentsId}
							placeholder="Provide additional context for the rejection..."
							value={comments}
							onChange={(e) => setComments(e.target.value)}
							rows={3}
						/>
					</div>

					<div className="rounded-10 bg-bg-weak-50 p-3 text-paragraph-sm">
						<span className="text-text-sub-600">Financial Impact:</span>
						<div className="text-text-strong-950">
							Hold Amount: {formatCurrency(holdAmount)} → Will be released to your wallet
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
						Cancel
					</Button.Root>
					<Button.Root
						variant="error"
						onClick={handleConfirm}
						disabled={!selectedReason || isLoading}
						aria-busy={isLoading}
					>
						{isLoading ? "Processing..." : "Confirm Rejection"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
