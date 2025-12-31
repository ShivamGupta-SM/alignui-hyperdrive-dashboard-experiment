"use client"

import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import { Warning } from "@phosphor-icons/react"

interface UnsavedChangesModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onDiscard: () => void
	onSave: () => void
	isSaving?: boolean
}

export function UnsavedChangesModal({
	open,
	onOpenChange,
	onDiscard,
	onSave,
	isSaving = false,
}: UnsavedChangesModalProps) {
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<div className="flex items-start gap-4">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-lighter">
							<Warning className="size-5 text-warning-base" />
						</div>
						<div>
							<Modal.Title>Unsaved Changes</Modal.Title>
							<Modal.Description className="mt-1">
								You have unsaved changes. Do you want to save them before leaving?
							</Modal.Description>
						</div>
					</div>
				</Modal.Header>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={onDiscard}>
						Discard
					</Button.Root>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root variant="primary" onClick={onSave} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save Changes"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
