"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Textarea from "@/components/ui/forms/textarea"
import { Info } from "@phosphor-icons/react"

interface ExtendDeadlineModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	shopperName: string
	campaignTitle: string
	currentDeadline: Date
	onConfirm: (newDeadline: Date, reason: string) => void
	isLoading?: boolean
}

export function ExtendDeadlineModal({
	open,
	onOpenChange,
	shopperName,
	campaignTitle,
	currentDeadline,
	onConfirm,
	isLoading = false,
}: ExtendDeadlineModalProps) {
	const [newDeadline, setNewDeadline] = React.useState("")
	const [reason, setReason] = React.useState("")

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
			year: "numeric",
		})
	}

	const handleConfirm = () => {
		onConfirm(new Date(newDeadline), reason)
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Extend Submission Deadline</Modal.Title>
				</Modal.Header>
				<Modal.Body className="space-y-4">
					<div className="text-paragraph-sm text-text-sub-600">
						<div>
							Shopper: <span className="text-text-strong-950">{shopperName}</span>
						</div>
						<div>
							Campaign: <span className="text-text-strong-950">{campaignTitle}</span>
						</div>
					</div>

					<div className="rounded-10 bg-bg-weak-50 p-3">
						<span className="text-paragraph-sm text-text-sub-600">Current Deadline:</span>
						<div className="text-label-sm text-text-strong-950">{formatDate(currentDeadline)}</div>
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							New Deadline <span className="text-error-base">*</span>
						</label>
						<Input.Root>
							<Input.Wrapper>
								<Input.El
									type="date"
									value={newDeadline}
									onChange={(e) => setNewDeadline(e.target.value)}
									min={new Date().toISOString().split("T")[0]}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Extension Reason (optional)
						</label>
						<Textarea.Root
							placeholder="Shopper requested additional time due to delivery delay"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							rows={3}
						/>
					</div>

					<div className="flex items-start gap-2 text-paragraph-xs text-text-soft-400">
						<Info className="size-4 shrink-0" />
						<span>Shopper will be notified of the new deadline via email and app</span>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root
						variant="primary"
						onClick={handleConfirm}
						disabled={!newDeadline || isLoading}
					>
						{isLoading ? "Processing..." : "Extend Deadline"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
