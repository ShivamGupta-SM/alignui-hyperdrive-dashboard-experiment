import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	ModalRoot,
	ModalTrigger,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalDescription,
	ModalBody,
	ModalFooter,
	ModalClose,
} from "@/components/ui/layout"
import { ButtonRoot } from "@/components/ui/primitives"
import { Root as InputRoot, Wrapper as InputWrapper, El as InputEl } from "@/components/ui/forms/input"
import { Warning, Trash, CheckCircle } from "@phosphor-icons/react"

const meta: Meta<typeof ModalRoot> = {
	title: "Layout/Modal",
	component: ModalRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof ModalRoot>

// Basic modal
export const Basic: Story = {
	render: () => (
		<ModalRoot>
			<ModalTrigger asChild>
				<ButtonRoot>Open Modal</ButtonRoot>
			</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<ModalTitle>Modal Title</ModalTitle>
					<ModalDescription>
						This is a description of the modal content.
					</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<p className="text-paragraph-sm text-text-sub-600">
						Your modal content goes here. This can be any content you need to display.
					</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose asChild>
						<ButtonRoot variant="basic">Cancel</ButtonRoot>
					</ModalClose>
					<ButtonRoot variant="primary">Confirm</ButtonRoot>
				</ModalFooter>
			</ModalContent>
		</ModalRoot>
	),
}

// Large variant
export const Large: Story = {
	render: () => (
		<ModalRoot>
			<ModalTrigger asChild>
				<ButtonRoot>Open Large Modal</ButtonRoot>
			</ModalTrigger>
			<ModalContent variant="large">
				<ModalHeader>
					<ModalTitle>Large Modal</ModalTitle>
					<ModalDescription>
						This modal has more space for content.
					</ModalDescription>
				</ModalHeader>
				<ModalBody>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-label-sm text-text-sub-600">Name</label>
							<InputRoot>
								<InputWrapper>
									<InputEl placeholder="Enter your name" />
								</InputWrapper>
							</InputRoot>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-label-sm text-text-sub-600">Email</label>
							<InputRoot>
								<InputWrapper>
									<InputEl placeholder="Enter your email" type="email" />
								</InputWrapper>
							</InputRoot>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-label-sm text-text-sub-600">Message</label>
							<InputRoot>
								<InputWrapper>
									<InputEl placeholder="Enter your message" />
								</InputWrapper>
							</InputRoot>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<ModalClose asChild>
						<ButtonRoot variant="basic">Cancel</ButtonRoot>
					</ModalClose>
					<ButtonRoot variant="primary">Submit</ButtonRoot>
				</ModalFooter>
			</ModalContent>
		</ModalRoot>
	),
}

// Confirmation modal
export const Confirmation: Story = {
	render: () => (
		<ModalRoot>
			<ModalTrigger asChild>
				<ButtonRoot variant="error">Delete Item</ButtonRoot>
			</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-full bg-error-lighter">
							<Trash className="size-5 text-error-base" weight="fill" />
						</div>
						<div>
							<ModalTitle>Delete Item</ModalTitle>
							<ModalDescription>This action cannot be undone.</ModalDescription>
						</div>
					</div>
				</ModalHeader>
				<ModalBody>
					<p className="text-paragraph-sm text-text-sub-600">
						Are you sure you want to delete this item? All associated data will be
						permanently removed from our servers.
					</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose asChild>
						<ButtonRoot variant="basic">Cancel</ButtonRoot>
					</ModalClose>
					<ButtonRoot variant="error">Delete</ButtonRoot>
				</ModalFooter>
			</ModalContent>
		</ModalRoot>
	),
}

// Warning modal
export const WarningModal: Story = {
	render: () => (
		<ModalRoot>
			<ModalTrigger asChild>
				<ButtonRoot variant="basic">Show Warning</ButtonRoot>
			</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-full bg-warning-lighter">
							<Warning className="size-5 text-warning-base" weight="fill" />
						</div>
						<div>
							<ModalTitle>Unsaved Changes</ModalTitle>
							<ModalDescription>You have unsaved changes.</ModalDescription>
						</div>
					</div>
				</ModalHeader>
				<ModalBody>
					<p className="text-paragraph-sm text-text-sub-600">
						You are about to leave this page with unsaved changes. Do you want to save
						your changes before leaving?
					</p>
				</ModalBody>
				<ModalFooter>
					<ModalClose asChild>
						<ButtonRoot variant="ghost">Discard</ButtonRoot>
					</ModalClose>
					<ModalClose asChild>
						<ButtonRoot variant="basic">Cancel</ButtonRoot>
					</ModalClose>
					<ButtonRoot variant="primary">Save Changes</ButtonRoot>
				</ModalFooter>
			</ModalContent>
		</ModalRoot>
	),
}

// Success modal
export const Success: Story = {
	render: () => (
		<ModalRoot>
			<ModalTrigger asChild>
				<ButtonRoot>Show Success</ButtonRoot>
			</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<div className="flex flex-col items-center text-center">
						<div className="flex size-16 items-center justify-center rounded-full bg-success-lighter mb-4">
							<CheckCircle className="size-8 text-success-base" weight="fill" />
						</div>
						<ModalTitle>Payment Successful!</ModalTitle>
						<ModalDescription>Your payment has been processed.</ModalDescription>
					</div>
				</ModalHeader>
				<ModalBody>
					<div className="text-center">
						<p className="text-paragraph-sm text-text-sub-600">
							Thank you for your purchase. A confirmation email has been sent to your
							email address.
						</p>
					</div>
				</ModalBody>
				<ModalFooter className="justify-center">
					<ModalClose asChild>
						<ButtonRoot variant="primary">Continue</ButtonRoot>
					</ModalClose>
				</ModalFooter>
			</ModalContent>
		</ModalRoot>
	),
}

// Controlled modal
export const Controlled: Story = {
	render: function ControlledModal() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot onClick={() => setOpen(true)}>Open Controlled Modal</ButtonRoot>
				<ModalRoot open={open} onOpenChange={setOpen}>
					<ModalContent>
						<ModalHeader>
							<ModalTitle>Controlled Modal</ModalTitle>
							<ModalDescription>
								This modal is controlled programmatically.
							</ModalDescription>
						</ModalHeader>
						<ModalBody>
							<p className="text-paragraph-sm text-text-sub-600">
								Open state: <strong>{open ? "true" : "false"}</strong>
							</p>
						</ModalBody>
						<ModalFooter>
							<ButtonRoot variant="basic" onClick={() => setOpen(false)}>
								Close Programmatically
							</ButtonRoot>
						</ModalFooter>
					</ModalContent>
				</ModalRoot>
			</>
		)
	},
}
