import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as SidePanelRoot,
	Trigger as SidePanelTrigger,
	Content as SidePanelContent,
	Header as SidePanelHeader,
	Title as SidePanelTitle,
	Description as SidePanelDescription,
	Body as SidePanelBody,
} from "@/components/ui/layout/side-panel"
import { ButtonRoot } from "@/components/ui/primitives"
import { User, Gear, Bell, ShoppingCart, Funnel, CaretRight, Package, MapPin } from "@phosphor-icons/react"

const meta: Meta<typeof SidePanelRoot> = {
	title: "Layout/SidePanel",
	component: SidePanelRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof SidePanelRoot>

// Basic side panel
export const Basic: Story = {
	render: function BasicSidePanel() {
		const [open, setOpen] = useState(false)

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="primary">Open Side Panel</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent>
					<SidePanelHeader>
						<SidePanelTitle>Side Panel</SidePanelTitle>
						<SidePanelDescription>This is a basic side panel example.</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<p className="text-paragraph-sm text-text-sub-600">
							Side panel content goes here. You can add any content you want.
						</p>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}

// Left side panel
export const LeftSide: Story = {
	render: function LeftSidePanel() {
		const [open, setOpen] = useState(false)

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="primary">Open Left Panel</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent side="left">
					<SidePanelHeader>
						<SidePanelTitle>Left Side Panel</SidePanelTitle>
						<SidePanelDescription>This panel slides in from the left.</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<p className="text-paragraph-sm text-text-sub-600">
							Content for the left side panel.
						</p>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}

// User profile panel
export const UserProfile: Story = {
	render: function UserProfilePanel() {
		const [open, setOpen] = useState(false)

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="basic">
						<User className="size-4" />
						View Profile
					</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent>
					<SidePanelHeader>
						<SidePanelTitle>User Profile</SidePanelTitle>
						<SidePanelDescription>Manage your account settings</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<div className="flex flex-col items-center mb-6">
							<div className="size-20 rounded-full bg-primary-base flex items-center justify-center mb-4">
								<span className="text-heading-lg text-static-white">JD</span>
							</div>
							<h3 className="text-label-lg text-text-strong-950">John Doe</h3>
							<p className="text-paragraph-sm text-text-sub-600">john.doe@example.com</p>
						</div>
						<div className="space-y-4">
							<div className="p-4 rounded-lg border border-stroke-soft-200">
								<h4 className="text-label-sm text-text-strong-950 mb-2">Account Information</h4>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-paragraph-sm text-text-sub-600">Member since</span>
										<span className="text-paragraph-sm text-text-strong-950">Jan 2024</span>
									</div>
									<div className="flex justify-between">
										<span className="text-paragraph-sm text-text-sub-600">Plan</span>
										<span className="text-paragraph-sm text-primary-base">Pro</span>
									</div>
								</div>
							</div>
							<ButtonRoot variant="primary" className="w-full">Edit Profile</ButtonRoot>
							<ButtonRoot variant="basic" className="w-full">Sign Out</ButtonRoot>
						</div>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}

// Settings panel
export const SettingsPanel: Story = {
	render: function SettingsPanelExample() {
		const [open, setOpen] = useState(false)

		const settingsItems = [
			{ icon: User, label: "Profile", description: "Manage your profile" },
			{ icon: Bell, label: "Notifications", description: "Configure alerts" },
			{ icon: Gear, label: "Preferences", description: "App settings" },
		]

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="basic">
						<Gear className="size-4" />
						Settings
					</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent>
					<SidePanelHeader>
						<SidePanelTitle>Settings</SidePanelTitle>
						<SidePanelDescription>Manage your preferences</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<div className="space-y-2">
							{settingsItems.map((item) => (
								<button
									key={item.label}
									className="w-full p-4 rounded-lg border border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors flex items-center justify-between"
								>
									<div className="flex items-center gap-3">
										<div className="size-10 rounded-full bg-bg-weak-50 flex items-center justify-center">
											<item.icon className="size-5 text-text-sub-600" />
										</div>
										<div className="text-left">
											<p className="text-label-sm text-text-strong-950">{item.label}</p>
											<p className="text-paragraph-xs text-text-sub-600">{item.description}</p>
										</div>
									</div>
									<CaretRight className="size-4 text-text-sub-600" />
								</button>
							))}
						</div>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}

// Shopping cart panel
export const ShoppingCartPanel: Story = {
	render: function ShoppingCartExample() {
		const [open, setOpen] = useState(false)

		const cartItems = [
			{ name: "Wireless Headphones", price: 199, quantity: 1 },
			{ name: "Smart Watch", price: 299, quantity: 1 },
			{ name: "Laptop Stand", price: 79, quantity: 2 },
		]

		const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="basic">
						<ShoppingCart className="size-4" />
						Cart (3)
					</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent>
					<SidePanelHeader>
						<SidePanelTitle>Shopping Cart</SidePanelTitle>
						<SidePanelDescription>3 items in your cart</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<div className="space-y-4 mb-6">
							{cartItems.map((item, index) => (
								<div key={index} className="flex gap-4 p-4 rounded-lg border border-stroke-soft-200">
									<div className="size-16 rounded-lg bg-bg-weak-50 flex items-center justify-center">
										<Package className="size-6 text-text-sub-600" />
									</div>
									<div className="flex-1">
										<p className="text-label-sm text-text-strong-950">{item.name}</p>
										<p className="text-paragraph-xs text-text-sub-600">Qty: {item.quantity}</p>
										<p className="text-label-sm text-primary-base">${item.price}</p>
									</div>
								</div>
							))}
						</div>
						<div className="border-t border-stroke-soft-200 pt-4">
							<div className="flex justify-between mb-4">
								<span className="text-label-md text-text-strong-950">Total</span>
								<span className="text-heading-sm text-text-strong-950">${total}</span>
							</div>
							<ButtonRoot variant="primary" className="w-full">Checkout</ButtonRoot>
						</div>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}

// Filter panel
export const FilterPanel: Story = {
	render: function FilterPanelExample() {
		const [open, setOpen] = useState(false)

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="basic">
						<Funnel className="size-4" />
						Filters
					</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent side="left">
					<SidePanelHeader>
						<SidePanelTitle>Filters</SidePanelTitle>
						<SidePanelDescription>Refine your search results</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<div className="space-y-6">
							<div>
								<h4 className="text-label-sm text-text-strong-950 mb-3">Category</h4>
								<div className="space-y-2">
									{["Electronics", "Clothing", "Home & Garden", "Sports"].map((cat) => (
										<label key={cat} className="flex items-center gap-2">
											<input type="checkbox" className="size-4 rounded border-stroke-soft-200" />
											<span className="text-paragraph-sm text-text-sub-600">{cat}</span>
										</label>
									))}
								</div>
							</div>
							<div>
								<h4 className="text-label-sm text-text-strong-950 mb-3">Price Range</h4>
								<div className="flex gap-2">
									<input
										type="number"
										placeholder="Min"
										className="flex-1 px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
									/>
									<input
										type="number"
										placeholder="Max"
										className="flex-1 px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
									/>
								</div>
							</div>
							<div>
								<h4 className="text-label-sm text-text-strong-950 mb-3">Rating</h4>
								<div className="space-y-2">
									{["4 stars & up", "3 stars & up", "2 stars & up"].map((rating) => (
										<label key={rating} className="flex items-center gap-2">
											<input type="radio" name="rating" className="size-4" />
											<span className="text-paragraph-sm text-text-sub-600">{rating}</span>
										</label>
									))}
								</div>
							</div>
							<div className="flex gap-2">
								<ButtonRoot variant="basic" className="flex-1">Reset</ButtonRoot>
								<ButtonRoot variant="primary" className="flex-1">Apply Filters</ButtonRoot>
							</div>
						</div>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}

// Notifications panel
export const NotificationsPanel: Story = {
	render: function NotificationsPanelExample() {
		const [open, setOpen] = useState(false)

		const notifications = [
			{ title: "New order received", time: "5 min ago", unread: true },
			{ title: "Payment processed", time: "1 hour ago", unread: true },
			{ title: "Shipment delivered", time: "3 hours ago", unread: false },
			{ title: "New review posted", time: "Yesterday", unread: false },
		]

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="basic">
						<Bell className="size-4" />
						Notifications
						<span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-error-base text-static-white">2</span>
					</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent>
					<SidePanelHeader>
						<SidePanelTitle>Notifications</SidePanelTitle>
						<SidePanelDescription>Stay updated with your activity</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<div className="space-y-2">
							{notifications.map((notification, index) => (
								<div
									key={index}
									className={`p-4 rounded-lg border ${
										notification.unread
											? "border-primary-base bg-primary-lighter"
											: "border-stroke-soft-200"
									}`}
								>
									<div className="flex items-start justify-between">
										<div>
											<p className="text-label-sm text-text-strong-950">{notification.title}</p>
											<p className="text-paragraph-xs text-text-sub-600">{notification.time}</p>
										</div>
										{notification.unread && (
											<div className="size-2 rounded-full bg-primary-base" />
										)}
									</div>
								</div>
							))}
						</div>
						<ButtonRoot variant="basic" className="w-full mt-4">
							Mark all as read
						</ButtonRoot>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}

// Address form panel
export const AddressFormPanel: Story = {
	render: function AddressFormExample() {
		const [open, setOpen] = useState(false)

		return (
			<SidePanelRoot open={open} onOpenChange={setOpen}>
				<SidePanelTrigger>
					<ButtonRoot variant="primary">
						<MapPin className="size-4" />
						Add Address
					</ButtonRoot>
				</SidePanelTrigger>
				<SidePanelContent>
					<SidePanelHeader>
						<SidePanelTitle>Add New Address</SidePanelTitle>
						<SidePanelDescription>Enter your shipping address details</SidePanelDescription>
					</SidePanelHeader>
					<SidePanelBody>
						<form className="space-y-4">
							<div>
								<label className="text-label-sm text-text-strong-950 mb-2 block">Full Name</label>
								<input
									type="text"
									placeholder="John Doe"
									className="w-full px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
								/>
							</div>
							<div>
								<label className="text-label-sm text-text-strong-950 mb-2 block">Street Address</label>
								<input
									type="text"
									placeholder="123 Main Street"
									className="w-full px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-label-sm text-text-strong-950 mb-2 block">City</label>
									<input
										type="text"
										placeholder="New York"
										className="w-full px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
									/>
								</div>
								<div>
									<label className="text-label-sm text-text-strong-950 mb-2 block">ZIP Code</label>
									<input
										type="text"
										placeholder="10001"
										className="w-full px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
									/>
								</div>
							</div>
							<div>
								<label className="text-label-sm text-text-strong-950 mb-2 block">Phone Number</label>
								<input
									type="tel"
									placeholder="+1 (555) 000-0000"
									className="w-full px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
								/>
							</div>
							<div className="flex gap-2 pt-4">
								<ButtonRoot variant="basic" className="flex-1">Cancel</ButtonRoot>
								<ButtonRoot variant="primary" className="flex-1">Save Address</ButtonRoot>
							</div>
						</form>
					</SidePanelBody>
				</SidePanelContent>
			</SidePanelRoot>
		)
	},
}
