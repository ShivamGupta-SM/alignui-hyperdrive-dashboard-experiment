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
	title: "Feedback/Notification",
	component: Notification,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		status: {
			control: "select",
			options: ["success", "warning", "error", "information", "feature"],
		},
		variant: {
			control: "select",
			options: ["filled", "lighter", "stroke"],
		},
	},
}

export default meta
type Story = StoryObj<typeof Notification>

// Interactive notification demo
export const Interactive: Story = {
	render: function InteractiveNotification() {
		const [open, setOpen] = useState(false)

		return (
			<NotificationProvider>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show Notification
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="success"
					variant="filled"
					title="Changes saved"
					description="Your profile has been updated successfully."
				/>
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// All statuses - filled variant
export const AllStatusesFilled: Story = {
	render: function AllStatusesFilledDemo() {
		const [notifications, setNotifications] = useState<string[]>([])

		const showNotification = (status: string) => {
			setNotifications((prev) => [...prev, status])
			setTimeout(() => {
				setNotifications((prev) => prev.filter((s) => s !== status))
			}, 5000)
		}

		return (
			<NotificationProvider>
				<div className="flex flex-wrap gap-3">
					<ButtonRoot variant="primary" onClick={() => showNotification("success")}>
						Success
					</ButtonRoot>
					<ButtonRoot variant="primary" onClick={() => showNotification("warning")}>
						Warning
					</ButtonRoot>
					<ButtonRoot variant="primary" onClick={() => showNotification("error")}>
						Error
					</ButtonRoot>
					<ButtonRoot variant="primary" onClick={() => showNotification("information")}>
						Information
					</ButtonRoot>
					<ButtonRoot variant="primary" onClick={() => showNotification("feature")}>
						Feature
					</ButtonRoot>
				</div>

				{notifications.includes("success") && (
					<Notification
						open
						status="success"
						variant="filled"
						title="Success!"
						description="Your action was completed successfully."
					/>
				)}
				{notifications.includes("warning") && (
					<Notification
						open
						status="warning"
						variant="filled"
						title="Warning"
						description="Please review your changes before continuing."
					/>
				)}
				{notifications.includes("error") && (
					<Notification
						open
						status="error"
						variant="filled"
						title="Error"
						description="Something went wrong. Please try again."
					/>
				)}
				{notifications.includes("information") && (
					<Notification
						open
						status="information"
						variant="filled"
						title="Information"
						description="Here's some helpful information for you."
					/>
				)}
				{notifications.includes("feature") && (
					<Notification
						open
						status="feature"
						variant="filled"
						title="New Feature"
						description="Check out our latest feature update!"
					/>
				)}
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// With action buttons
export const WithActions: Story = {
	render: function WithActionsDemo() {
		const [open, setOpen] = useState(false)

		return (
			<NotificationProvider>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show With Actions
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="warning"
					variant="filled"
					title="Unsaved changes"
					description="You have unsaved changes that will be lost if you leave."
					action={
						<>
							<NotificationAction asChild altText="Discard">
								<ButtonRoot size="xsmall" variant="basic">
									Discard
								</ButtonRoot>
							</NotificationAction>
							<NotificationAction asChild altText="Save">
								<ButtonRoot size="xsmall" variant="primary">
									Save
								</ButtonRoot>
							</NotificationAction>
						</>
					}
				/>
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// Lighter variant
export const LighterVariant: Story = {
	render: function LighterVariantDemo() {
		const [open, setOpen] = useState(false)

		return (
			<NotificationProvider>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show Lighter Notification
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="success"
					variant="lighter"
					title="Payment received"
					description="We've received your payment of $99.00."
				/>
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// Stroke variant
export const StrokeVariant: Story = {
	render: function StrokeVariantDemo() {
		const [open, setOpen] = useState(false)

		return (
			<NotificationProvider>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show Stroke Notification
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="information"
					variant="stroke"
					title="System update"
					description="A new version is available. Restart to apply updates."
				/>
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// Without dismiss button
export const NoDismiss: Story = {
	render: function NoDismissDemo() {
		const [open, setOpen] = useState(false)

		return (
			<NotificationProvider>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show Non-Dismissible
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="error"
					variant="filled"
					title="Connection required"
					description="Please check your internet connection."
					disableDismiss
					action={
						<NotificationAction asChild altText="Retry">
							<ButtonRoot size="xsmall" variant="basic" onClick={() => setOpen(false)}>
								Retry
							</ButtonRoot>
						</NotificationAction>
					}
				/>
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// Multiple notifications
export const MultipleNotifications: Story = {
	render: function MultipleNotificationsDemo() {
		const [notifications, setNotifications] = useState<
			Array<{ id: number; status: "success" | "warning" | "error" | "information"; title: string; description: string }>
		>([])
		let idCounter = 0

		const addNotification = (
			status: "success" | "warning" | "error" | "information",
			title: string,
			description: string
		) => {
			const id = ++idCounter
			setNotifications((prev) => [...prev, { id, status, title, description }])
		}

		const removeNotification = (id: number) => {
			setNotifications((prev) => prev.filter((n) => n.id !== id))
		}

		return (
			<NotificationProvider>
				<div className="flex flex-wrap gap-3">
					<ButtonRoot
						variant="primary"
						onClick={() => addNotification("success", "File uploaded", "document.pdf was uploaded successfully.")}
					>
						Upload File
					</ButtonRoot>
					<ButtonRoot
						variant="primary"
						onClick={() => addNotification("information", "New message", "You have 3 new messages in your inbox.")}
					>
						New Message
					</ButtonRoot>
					<ButtonRoot
						variant="primary"
						onClick={() => addNotification("warning", "Low storage", "You're running low on storage space.")}
					>
						Low Storage
					</ButtonRoot>
					<ButtonRoot
						variant="primary"
						onClick={() => addNotification("error", "Upload failed", "Failed to upload image.png.")}
					>
						Upload Error
					</ButtonRoot>
				</div>

				{notifications.map((notification) => (
					<Notification
						key={notification.id}
						open
						onOpenChange={(open) => {
							if (!open) removeNotification(notification.id)
						}}
						status={notification.status}
						variant="filled"
						title={notification.title}
						description={notification.description}
					/>
				))}
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// Feature announcement
export const FeatureAnnouncement: Story = {
	render: function FeatureAnnouncementDemo() {
		const [open, setOpen] = useState(false)

		return (
			<NotificationProvider>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Announce Feature
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					status="feature"
					variant="filled"
					title="Introducing Dark Mode"
					description="Switch to dark mode for a comfortable viewing experience in low light."
					action={
						<>
							<NotificationAction asChild altText="Later">
								<ButtonRoot size="xsmall" variant="basic">
									Later
								</ButtonRoot>
							</NotificationAction>
							<NotificationAction asChild altText="Try it now">
								<ButtonRoot size="xsmall" variant="primary">
									Try it now
								</ButtonRoot>
							</NotificationAction>
						</>
					}
				/>
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// Form submission example
export const FormSubmissionExample: Story = {
	render: function FormSubmissionDemo() {
		const [notifications, setNotifications] = useState<Array<{ id: number; status: "success" | "error"; title: string; description: string }>>([])
		let idCounter = 0

		const handleSubmit = () => {
			const success = Math.random() > 0.3
			const id = ++idCounter
			if (success) {
				setNotifications((prev) => [
					...prev,
					{ id, status: "success", title: "Form submitted", description: "We'll get back to you within 24 hours." },
				])
			} else {
				setNotifications((prev) => [
					...prev,
					{ id, status: "error", title: "Submission failed", description: "Please check your inputs and try again." },
				])
			}
		}

		return (
			<NotificationProvider>
				<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
					<h3 className="text-label-md text-text-strong-950 mb-4">Contact Us</h3>
					<form
						className="flex flex-col gap-4"
						onSubmit={(e) => {
							e.preventDefault()
							handleSubmit()
						}}
					>
						<input
							type="email"
							placeholder="Email"
							className="px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
						/>
						<textarea
							placeholder="Message"
							rows={3}
							className="px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
						/>
						<ButtonRoot type="submit" variant="primary">
							Submit
						</ButtonRoot>
					</form>
				</div>

				{notifications.map((notification) => (
					<Notification
						key={notification.id}
						open
						onOpenChange={(open) => {
							if (!open) setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
						}}
						status={notification.status}
						variant="filled"
						title={notification.title}
						description={notification.description}
					/>
				))}
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}

// Auto-dismiss example
export const AutoDismissExample: Story = {
	render: function AutoDismissDemo() {
		const [open, setOpen] = useState(false)

		return (
			<NotificationProvider>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show Auto-Dismiss (5s)
				</ButtonRoot>
				<Notification
					open={open}
					onOpenChange={setOpen}
					duration={5000}
					status="success"
					variant="filled"
					title="Copied to clipboard"
					description="The link has been copied to your clipboard."
				/>
				<NotificationViewport />
			</NotificationProvider>
		)
	},
}
