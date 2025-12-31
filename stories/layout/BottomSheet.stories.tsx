import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as BottomSheetRoot,
	Trigger as BottomSheetTrigger,
	Content as BottomSheetContent,
	Header as BottomSheetHeader,
	Title as BottomSheetTitle,
	Description as BottomSheetDescription,
	Body as BottomSheetBody,
	Footer as BottomSheetFooter,
	Close as BottomSheetClose,
} from "@/components/ui/layout/bottom-sheet"
import { ButtonRoot } from "@/components/ui/primitives"
import { MapPin, Clock, Star, Heart, Share, Phone } from "@phosphor-icons/react"

const meta: Meta = {
	title: "Layout/BottomSheet",
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj

// Basic bottom sheet
export const Basic: Story = {
	render: function BasicBottomSheet() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Open Bottom Sheet
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen}>
					<BottomSheetContent>
						<BottomSheetHeader>
							<BottomSheetTitle>Bottom Sheet Title</BottomSheetTitle>
							<BottomSheetDescription>
								This is a description of the bottom sheet content.
							</BottomSheetDescription>
						</BottomSheetHeader>
						<BottomSheetBody>
							<p className="text-paragraph-sm text-text-sub-600">
								This is the body content of the bottom sheet. It can contain any content you need
								to display. The sheet is swipeable on mobile devices.
							</p>
						</BottomSheetBody>
						<BottomSheetFooter>
							<BottomSheetClose asChild>
								<ButtonRoot variant="primary" className="w-full">
									Close
								</ButtonRoot>
							</BottomSheetClose>
						</BottomSheetFooter>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}

// Without handle
export const WithoutHandle: Story = {
	render: function NoHandleBottomSheet() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Open (No Handle)
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen}>
					<BottomSheetContent showHandle={false}>
						<BottomSheetHeader>
							<BottomSheetTitle>No Drag Handle</BottomSheetTitle>
							<BottomSheetDescription>
								This sheet doesn&apos;t show the drag handle indicator.
							</BottomSheetDescription>
						</BottomSheetHeader>
						<BottomSheetBody>
							<p className="text-paragraph-sm text-text-sub-600">
								You can still close this sheet by clicking outside or using the close button.
							</p>
						</BottomSheetBody>
						<BottomSheetFooter>
							<BottomSheetClose asChild>
								<ButtonRoot variant="primary" className="w-full">
									Done
								</ButtonRoot>
							</BottomSheetClose>
						</BottomSheetFooter>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}

// Location picker example
export const LocationPicker: Story = {
	render: function LocationPickerSheet() {
		const [open, setOpen] = useState(false)

		const locations = [
			{ name: "Current Location", address: "Using GPS", icon: MapPin },
			{ name: "Home", address: "123 Main Street, City", icon: MapPin },
			{ name: "Work", address: "456 Business Ave, Downtown", icon: MapPin },
			{ name: "Gym", address: "789 Fitness Blvd", icon: MapPin },
		]

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Select Location
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen}>
					<BottomSheetContent>
						<BottomSheetHeader>
							<BottomSheetTitle>Choose Location</BottomSheetTitle>
							<BottomSheetDescription>
								Select a pickup location
							</BottomSheetDescription>
						</BottomSheetHeader>
						<BottomSheetBody>
							<div className="flex flex-col gap-2">
								{locations.map((location, i) => (
									<button
										key={i}
										type="button"
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-weak-50 transition-colors text-left"
										onClick={() => setOpen(false)}
									>
										<div className="flex size-10 items-center justify-center rounded-full bg-primary-lighter">
											<location.icon className="size-5 text-primary-base" />
										</div>
										<div>
											<p className="text-label-sm text-text-strong-950">{location.name}</p>
											<p className="text-paragraph-xs text-text-sub-600">{location.address}</p>
										</div>
									</button>
								))}
							</div>
						</BottomSheetBody>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}

// Actions sheet
export const ActionsSheet: Story = {
	render: function ActionsBottomSheet() {
		const [open, setOpen] = useState(false)

		const actions = [
			{ label: "Add to favorites", icon: Heart },
			{ label: "Share", icon: Share },
			{ label: "Rate this item", icon: Star },
			{ label: "Contact support", icon: Phone },
		]

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Show Actions
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen}>
					<BottomSheetContent showClose={false}>
						<BottomSheetBody>
							<div className="flex flex-col gap-1">
								{actions.map((action, i) => (
									<button
										key={i}
										type="button"
										className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-weak-50 transition-colors text-left"
										onClick={() => setOpen(false)}
									>
										<action.icon className="size-5 text-text-sub-600" />
										<span className="text-label-sm text-text-strong-950">{action.label}</span>
									</button>
								))}
							</div>
						</BottomSheetBody>
						<BottomSheetFooter>
							<BottomSheetClose asChild>
								<ButtonRoot variant="basic" className="w-full">
									Cancel
								</ButtonRoot>
							</BottomSheetClose>
						</BottomSheetFooter>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}

// Form sheet
export const FormSheet: Story = {
	render: function FormBottomSheet() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Add New Item
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen}>
					<BottomSheetContent>
						<BottomSheetHeader>
							<BottomSheetTitle>Add New Item</BottomSheetTitle>
							<BottomSheetDescription>Fill in the details below</BottomSheetDescription>
						</BottomSheetHeader>
						<BottomSheetBody>
							<form className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<label className="text-label-sm text-text-strong-950">Name</label>
									<input
										type="text"
										placeholder="Enter name"
										className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label className="text-label-sm text-text-strong-950">Description</label>
									<textarea
										rows={3}
										placeholder="Enter description"
										className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm resize-none"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label className="text-label-sm text-text-strong-950">Category</label>
									<select className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm">
										<option>Select category</option>
										<option>Category 1</option>
										<option>Category 2</option>
										<option>Category 3</option>
									</select>
								</div>
							</form>
						</BottomSheetBody>
						<BottomSheetFooter>
							<BottomSheetClose asChild>
								<ButtonRoot variant="basic" className="flex-1">
									Cancel
								</ButtonRoot>
							</BottomSheetClose>
							<ButtonRoot variant="primary" className="flex-1" onClick={() => setOpen(false)}>
								Add Item
							</ButtonRoot>
						</BottomSheetFooter>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}

// Confirmation sheet
export const ConfirmationSheet: Story = {
	render: function ConfirmationBottomSheet() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="error" onClick={() => setOpen(true)}>
					Delete Account
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen}>
					<BottomSheetContent>
						<BottomSheetHeader>
							<BottomSheetTitle>Delete Account?</BottomSheetTitle>
							<BottomSheetDescription>This action cannot be undone</BottomSheetDescription>
						</BottomSheetHeader>
						<BottomSheetBody>
							<p className="text-paragraph-sm text-text-sub-600">
								Are you sure you want to delete your account? All your data will be permanently
								removed and cannot be recovered.
							</p>
						</BottomSheetBody>
						<BottomSheetFooter>
							<BottomSheetClose asChild>
								<ButtonRoot variant="basic" className="flex-1">
									Cancel
								</ButtonRoot>
							</BottomSheetClose>
							<ButtonRoot variant="error" className="flex-1" onClick={() => setOpen(false)}>
								Delete
							</ButtonRoot>
						</BottomSheetFooter>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}

// Non-dismissible
export const NonDismissible: Story = {
	render: function NonDismissibleSheet() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Open Non-Dismissible
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen} dismissible={false}>
					<BottomSheetContent showClose={false}>
						<BottomSheetHeader>
							<BottomSheetTitle>Accept Terms</BottomSheetTitle>
							<BottomSheetDescription>
								You must accept the terms to continue
							</BottomSheetDescription>
						</BottomSheetHeader>
						<BottomSheetBody>
							<p className="text-paragraph-sm text-text-sub-600">
								This sheet cannot be dismissed by swiping or clicking outside. You must use the
								button below to close it.
							</p>
						</BottomSheetBody>
						<BottomSheetFooter>
							<ButtonRoot variant="primary" className="w-full" onClick={() => setOpen(false)}>
								I Accept
							</ButtonRoot>
						</BottomSheetFooter>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}

// Schedule picker
export const SchedulePicker: Story = {
	render: function SchedulePickerSheet() {
		const [open, setOpen] = useState(false)

		const times = [
			"9:00 AM",
			"10:00 AM",
			"11:00 AM",
			"12:00 PM",
			"1:00 PM",
			"2:00 PM",
			"3:00 PM",
			"4:00 PM",
		]

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Schedule Appointment
				</ButtonRoot>
				<BottomSheetRoot open={open} onOpenChange={setOpen}>
					<BottomSheetContent>
						<BottomSheetHeader>
							<BottomSheetTitle>Select Time</BottomSheetTitle>
							<BottomSheetDescription>Choose your preferred time slot</BottomSheetDescription>
						</BottomSheetHeader>
						<BottomSheetBody>
							<div className="grid grid-cols-2 gap-2">
								{times.map((time, i) => (
									<button
										key={i}
										type="button"
										className="flex items-center justify-center gap-2 p-3 rounded-lg border border-stroke-soft-200 hover:border-primary-base hover:bg-primary-lighter transition-colors"
										onClick={() => setOpen(false)}
									>
										<Clock className="size-4 text-text-sub-600" />
										<span className="text-label-sm text-text-strong-950">{time}</span>
									</button>
								))}
							</div>
						</BottomSheetBody>
					</BottomSheetContent>
				</BottomSheetRoot>
			</>
		)
	},
}
