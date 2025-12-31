"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import { Warning, Info } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface ConfirmationModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	variant?: "danger" | "warning" | "info"
	confirmLabel?: string
	cancelLabel?: string
	onConfirm: () => void
	isLoading?: boolean
	children?: React.ReactNode
	/** Custom icon component to override default based on variant */
	icon?: React.ComponentType<{ className?: string; weight?: "regular" | "duotone" | "bold" }>
	/** Loading text shown during isLoading state */
	loadingLabel?: string
}

export function ConfirmationModal({
	open,
	onOpenChange,
	title,
	description,
	variant = "info",
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	onConfirm,
	isLoading = false,
	children,
	icon: CustomIcon,
	loadingLabel = "Processing...",
}: ConfirmationModalProps) {
	const variantConfig = {
		danger: {
			icon: Warning,
			iconClass: "text-error-base bg-error-lighter",
			buttonVariant: "error" as const,
		},
		warning: {
			icon: Warning,
			iconClass: "text-warning-base bg-warning-lighter",
			buttonVariant: "primary" as const,
		},
		info: {
			icon: Info,
			iconClass: "text-info-base bg-info-lighter",
			buttonVariant: "primary" as const,
		},
	}

	const config = variantConfig[variant]
	const Icon = CustomIcon || config.icon

	// Handle confirm with error boundary
	const handleConfirm = React.useCallback(() => {
		try {
			onConfirm()
		} catch (error) {
			console.error("Confirmation action failed:", error)
			toast.error("Action failed. Please try again.")
		}
	}, [onConfirm])

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="max-w-md"
				role="alertdialog"
				aria-labelledby="confirmation-title"
				aria-describedby="confirmation-description"
				accessibilityTitle={title}
			>
				<Modal.Header>
					<div className="flex items-start gap-4">
						<div
							className={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-full",
								config.iconClass
							)}
							aria-hidden="true"
						>
							<Icon className="size-5" />
						</div>
						<div>
							<Modal.Title id="confirmation-title">{title}</Modal.Title>
							<Modal.Description id="confirmation-description" className="mt-1">{description}</Modal.Description>
						</div>
					</div>
				</Modal.Header>
				{children && <Modal.Body>{children}</Modal.Body>}
				<Modal.Footer>
					<Button.Root
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						{cancelLabel}
					</Button.Root>
					<Button.Root
						variant={config.buttonVariant}
						onClick={handleConfirm}
						disabled={isLoading}
						aria-busy={isLoading}
					>
						{isLoading ? loadingLabel : confirmLabel}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
