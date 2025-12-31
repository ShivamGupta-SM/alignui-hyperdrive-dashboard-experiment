import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as Notification,
	Provider as NotificationProvider,
	Action as NotificationAction,
	Viewport as NotificationViewport,
} from "@/components/ui/feedback/notification"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof Notification> = {
	title: "Feedback/Toast",
	component: Notification,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<NotificationProvider>
				<Story />
				<NotificationViewport />
			</NotificationProvider>
		),
	],
}

export default meta
type Story = StoryObj<typeof Notification>

// Interactive demo with trigger
function ToastDemo({
	status,
	variant,
	title,
	description,
}: {
	status: "success" | "error" | "warning" | "information" | "feature"
	variant?: "filled" | "light" | "lighter" | "stroke"
	title?: string
	description?: string
}) {
	const [open, setOpen] = useState(false)

	return (
		<>
			<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
				Show {status} toast
			</ButtonRoot>
			<Notification
				open={open}
				onOpenChange={setOpen}
				status={status}
				variant={variant}
				title={title}
				description={description}
			/>
		</>
	)
}

// Success toast
export const Success: Story = {
	render: () => (
		<ToastDemo
			status="success"
			title="Changes saved"
			description="Your changes have been saved successfully."
		/>
	),
}

// Error toast
export const Error: Story = {
	render: () => (
		<ToastDemo
			status="error"
			title="Error occurred"
			description="An error occurred while processing your request."
		/>
	),
}

// Warning toast
export const Warning: Story = {
	render: () => (
		<ToastDemo
			status="warning"
			title="Warning"
			description="Your session will expire in 5 minutes."
		/>
	),
}

// Information toast
export const Information: Story = {
	render: () => (
		<ToastDemo
			status="information"
			title="Information"
			description="New features are available in the latest update."
		/>
	),
}

// Feature toast
export const Feature: Story = {
	render: () => (
		<ToastDemo
			status="feature"
			title="New Feature"
			description="Try our new AI-powered assistant!"
		/>
	),
}

// Light variant
export const LightVariant: Story = {
	render: () => (
		<ToastDemo
			status="success"
			variant="light"
			title="Light variant"
			description="This is a light variant toast."
		/>
	),
}

// Lighter variant
export const LighterVariant: Story = {
	render: () => (
		<ToastDemo
			status="success"
			variant="lighter"
			title="Lighter variant"
			description="This is a lighter variant toast."
		/>
	),
}

// With action
export const WithAction: Story = {
	render: function WithActionStory() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show toast with action
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="error"
					variant="lighter"
					title="Upload failed"
					description="Failed to upload file. Please try again."
					action={
						<NotificationAction altText="Retry" asChild>
							<ButtonRoot variant="error" size="xsmall">
								Retry
							</ButtonRoot>
						</NotificationAction>
					}
				/>
			</>
		)
	},
}

// Multiple toasts demo
export const MultipleToasts: Story = {
	render: function MultipleToastsStory() {
		const [toasts, setToasts] = useState<
			Array<{ id: number; status: "success" | "error" | "warning" | "information"; open: boolean }>
		>([])

		const addToast = (status: "success" | "error" | "warning" | "information") => {
			const id = Date.now()
			setToasts((prev) => [...prev, { id, status, open: true }])
		}

		const handleOpenChange = (id: number, open: boolean) => {
			if (!open) {
				setToasts((prev) => prev.filter((t) => t.id !== id))
			}
		}

		const statusMessages = {
			success: { title: "Success!", description: "Operation completed successfully." },
			error: { title: "Error", description: "Something went wrong." },
			warning: { title: "Warning", description: "Please review this action." },
			information: { title: "Info", description: "Here is some information." },
		}

		return (
			<>
				<div className="flex gap-2">
					<ButtonRoot variant="basic" onClick={() => addToast("success")}>
						Success
					</ButtonRoot>
					<ButtonRoot variant="basic" onClick={() => addToast("error")}>
						Error
					</ButtonRoot>
					<ButtonRoot variant="basic" onClick={() => addToast("warning")}>
						Warning
					</ButtonRoot>
					<ButtonRoot variant="basic" onClick={() => addToast("information")}>
						Info
					</ButtonRoot>
				</div>
				{toasts.map((toast) => (
					<Notification
						key={toast.id}
						open={toast.open}
						onOpenChange={(open) => handleOpenChange(toast.id, open)}
						status={toast.status}
						variant="lighter"
						title={statusMessages[toast.status].title}
						description={statusMessages[toast.status].description}
					/>
				))}
			</>
		)
	},
}

// Auto-dismiss (default behavior)
export const AutoDismiss: Story = {
	render: function AutoDismissStory() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show auto-dismiss toast (5s)
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					duration={5000}
					status="success"
					variant="lighter"
					title="Auto-dismiss"
					description="This toast will dismiss in 5 seconds."
				/>
			</>
		)
	},
}

// Non-dismissible
export const NonDismissible: Story = {
	render: function NonDismissibleStory() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show non-dismissible toast
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="information"
					variant="lighter"
					title="Non-dismissible"
					description="This toast cannot be dismissed manually."
					disableDismiss
					duration={3000}
				/>
			</>
		)
	},
}
