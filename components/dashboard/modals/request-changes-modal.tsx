"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Textarea from "@/components/ui/forms/textarea"

interface RequestChangesModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (message: string) => void
	isLoading?: boolean
}

export function RequestChangesModal({
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
}: RequestChangesModalProps) {
	const [message, setMessage] = React.useState("")

	const handleConfirm = () => {
		onConfirm(message)
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Request Changes</Modal.Title>
					<Modal.Description>
						Please specify what changes are required from the shopper.
					</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<Textarea.Root
						placeholder="e.g., 'Please upload a clearer screenshot of the order ID.' or 'The order date does not match the campaign period.'"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						rows={5}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root
						variant="primary"
						onClick={handleConfirm}
						disabled={!message.trim() || isLoading}
					>
						{isLoading ? "Sending..." : "Request Changes"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
