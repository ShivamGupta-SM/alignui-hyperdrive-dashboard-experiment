"use client"

import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import { Warning, Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export type CampaignStatusAction = "pause" | "resume" | "end" | "complete"

interface CampaignStatusModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	action: CampaignStatusAction
	campaignTitle: string
	onConfirm: () => void
	isLoading?: boolean
}

const statusActionConfig: Record<CampaignStatusAction, {
	title: string
	description: string
	icon: typeof Warning
	iconClass: string
	buttonLabel: string
	buttonVariant: "primary" | "error"
	consequences: string[]
}> = {
	pause: {
		title: "Pause Campaign",
		description: "Temporarily stop this campaign from accepting new enrollments.",
		icon: Warning,
		iconClass: "text-warning-base bg-warning-lighter",
		buttonLabel: "Pause Campaign",
		buttonVariant: "primary",
		consequences: [
			"No new shoppers can enroll",
			"Existing enrollments will continue",
			"Campaign can be resumed anytime",
		],
	},
	resume: {
		title: "Resume Campaign",
		description: "Reactivate this campaign to accept new enrollments.",
		icon: Check,
		iconClass: "text-success-base bg-success-lighter",
		buttonLabel: "Resume Campaign",
		buttonVariant: "primary",
		consequences: [
			"Shoppers can enroll again",
			"Campaign will be visible to shoppers",
			"All settings will be preserved",
		],
	},
	end: {
		title: "End Campaign",
		description: "Permanently close this campaign. This cannot be undone.",
		icon: Warning,
		iconClass: "text-error-base bg-error-lighter",
		buttonLabel: "End Campaign",
		buttonVariant: "error",
		consequences: [
			"No new enrollments will be accepted",
			"Pending enrollments must be completed or cancelled",
			"Campaign cannot be reactivated",
		],
	},
	complete: {
		title: "Mark as Complete",
		description: "Mark this campaign as successfully completed.",
		icon: Check,
		iconClass: "text-success-base bg-success-lighter",
		buttonLabel: "Mark Complete",
		buttonVariant: "primary",
		consequences: [
			"Campaign will be archived",
			"All stats will be preserved",
			"Can be viewed in campaign history",
		],
	},
}

export function CampaignStatusModal({
	open,
	onOpenChange,
	action,
	campaignTitle,
	onConfirm,
	isLoading = false,
}: CampaignStatusModalProps) {
	const config = statusActionConfig[action]
	const Icon = config.icon

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<div className="flex items-start gap-4">
						<div
							className={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-full",
								config.iconClass
							)}
						>
							<Icon className="size-5" />
						</div>
						<div>
							<Modal.Title>{config.title}</Modal.Title>
							<Modal.Description className="mt-1">{config.description}</Modal.Description>
						</div>
					</div>
				</Modal.Header>
				<Modal.Body>
					<div className="rounded-10 bg-bg-weak-50 p-4">
						<h4 className="text-label-sm text-text-strong-950 mb-2">Campaign</h4>
						<p className="text-paragraph-sm text-text-sub-600">{campaignTitle}</p>
					</div>
					<div className="mt-4">
						<h4 className="text-label-sm text-text-strong-950 mb-2">What will happen:</h4>
						<ul className="space-y-2">
							{config.consequences.map((consequence) => (
								<li key={consequence} className="flex items-center gap-2 text-paragraph-sm text-text-sub-600">
									<Check className="size-4 text-text-soft-400 shrink-0" />
									{consequence}
								</li>
							))}
						</ul>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root
						variant={config.buttonVariant}
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? "Processing..." : config.buttonLabel}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
