import type { Meta, StoryObj } from "@storybook/react"
import * as SlideoutMenu from "@/components/ui/navigation/slideout-menu"
import * as Button from "@/components/ui/primitives/button"
import { House, Gear, User, Bell, CreditCard, ShieldCheck, X, ShoppingCart, Trash, Plus, Minus, Check, FileText, Package, Calendar, MapPin } from "@phosphor-icons/react"
import { useState } from "react"

const meta: Meta<typeof SlideoutMenu.Root> = {
	title: "Navigation/SlideoutMenu",
	component: SlideoutMenu.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof SlideoutMenu.Root>

// Basic slideout menu
export const Basic: Story = {
	render: () => (
		<SlideoutMenu.Root>
			<SlideoutMenu.Trigger asChild>
				<Button.Root>Open Menu</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header>
					<SlideoutMenu.Title>Menu Title</SlideoutMenu.Title>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						This is the body content of the slideout menu. You can put any content here.
					</p>
				</SlideoutMenu.Body>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}

// With description
export const WithDescription: Story = {
	render: () => (
		<SlideoutMenu.Root>
			<SlideoutMenu.Trigger asChild>
				<Button.Root>Open Menu</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header>
					<div className="flex-1">
						<SlideoutMenu.Title>Account Settings</SlideoutMenu.Title>
						<SlideoutMenu.Description>
							Manage your account preferences and settings
						</SlideoutMenu.Description>
					</div>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						Settings content goes here...
					</p>
				</SlideoutMenu.Body>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}

// With footer
export const WithFooter: Story = {
	render: () => (
		<SlideoutMenu.Root>
			<SlideoutMenu.Trigger asChild>
				<Button.Root>Open Menu</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header>
					<SlideoutMenu.Title>Edit Profile</SlideoutMenu.Title>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<div className="space-y-4">
						<div>
							<label className="text-label-sm text-text-strong-950">Name</label>
							<input
								type="text"
								className="mt-1 w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm"
								placeholder="Enter your name"
							/>
						</div>
						<div>
							<label className="text-label-sm text-text-strong-950">Email</label>
							<input
								type="email"
								className="mt-1 w-full rounded-lg border border-stroke-soft-200 px-3 py-2 text-paragraph-sm"
								placeholder="Enter your email"
							/>
						</div>
					</div>
				</SlideoutMenu.Body>
				<SlideoutMenu.Footer>
					<SlideoutMenu.Close asChild>
						<Button.Root variant="neutral">
							Cancel
						</Button.Root>
					</SlideoutMenu.Close>
					<Button.Root>Save Changes</Button.Root>
				</SlideoutMenu.Footer>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}

// Side variants
export const LeftSide: Story = {
	render: () => (
		<SlideoutMenu.Root side="left">
			<SlideoutMenu.Trigger asChild>
				<Button.Root>Open Left</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header>
					<SlideoutMenu.Title>Left Slideout</SlideoutMenu.Title>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						This slideout menu opens from the left side.
					</p>
				</SlideoutMenu.Body>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}

export const TopSide: Story = {
	render: () => (
		<SlideoutMenu.Root side="top">
			<SlideoutMenu.Trigger asChild>
				<Button.Root>Open Top</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header>
					<SlideoutMenu.Title>Top Slideout</SlideoutMenu.Title>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						This slideout menu opens from the top.
					</p>
				</SlideoutMenu.Body>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}

export const BottomSide: Story = {
	render: () => (
		<SlideoutMenu.Root side="bottom">
			<SlideoutMenu.Trigger asChild>
				<Button.Root>Open Bottom</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header>
					<SlideoutMenu.Title>Bottom Slideout</SlideoutMenu.Title>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						This slideout menu opens from the bottom.
					</p>
				</SlideoutMenu.Body>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}

// All sides comparison
export const AllSides: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<SlideoutMenu.Root side="right">
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="neutral">Right</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<SlideoutMenu.Title>Right Side</SlideoutMenu.Title>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						<p className="text-paragraph-sm text-text-sub-600">Default position</p>
					</SlideoutMenu.Body>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>

			<SlideoutMenu.Root side="left">
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="neutral">Left</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<SlideoutMenu.Title>Left Side</SlideoutMenu.Title>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						<p className="text-paragraph-sm text-text-sub-600">Opens from left</p>
					</SlideoutMenu.Body>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>

			<SlideoutMenu.Root side="top">
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="neutral">Top</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<SlideoutMenu.Title>Top Side</SlideoutMenu.Title>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						<p className="text-paragraph-sm text-text-sub-600">Opens from top</p>
					</SlideoutMenu.Body>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>

			<SlideoutMenu.Root side="bottom">
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="neutral">Bottom</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<SlideoutMenu.Title>Bottom Side</SlideoutMenu.Title>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						<p className="text-paragraph-sm text-text-sub-600">Opens from bottom</p>
					</SlideoutMenu.Body>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>
		</div>
	),
}

// Without close button
export const WithoutCloseButton: Story = {
	render: () => (
		<SlideoutMenu.Root>
			<SlideoutMenu.Trigger asChild>
				<Button.Root>Open Menu</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header showCloseButton={false}>
					<SlideoutMenu.Title>No Close Button</SlideoutMenu.Title>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<p className="text-paragraph-sm text-text-sub-600 mb-4">
						This slideout has no close button in the header. Use the button below to close.
					</p>
					<SlideoutMenu.Close asChild>
						<Button.Root variant="neutral">Close Menu</Button.Root>
					</SlideoutMenu.Close>
				</SlideoutMenu.Body>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}

// Shopping cart example
export const ShoppingCartExample: Story = {
	render: function ShoppingCartDemo() {
		const [items, setItems] = useState([
			{ id: 1, name: "Wireless Headphones", price: 99.99, quantity: 1, image: "🎧" },
			{ id: 2, name: "Laptop Stand", price: 49.99, quantity: 2, image: "💻" },
			{ id: 3, name: "USB-C Hub", price: 79.99, quantity: 1, image: "🔌" },
		])

		const updateQuantity = (id: number, delta: number) => {
			setItems(items.map(item =>
				item.id === id
					? { ...item, quantity: Math.max(1, item.quantity + delta) }
					: item
			))
		}

		const removeItem = (id: number) => {
			setItems(items.filter(item => item.id !== id))
		}

		const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

		return (
			<SlideoutMenu.Root>
				<SlideoutMenu.Trigger asChild>
					<Button.Root>
						<Button.Icon>
							<ShoppingCart />
						</Button.Icon>
						Cart ({items.length})
					</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<SlideoutMenu.Title>Shopping Cart</SlideoutMenu.Title>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						{items.length === 0 ? (
							<div className="text-center py-8">
								<ShoppingCart className="size-12 text-text-soft-400 mx-auto mb-3" />
								<p className="text-paragraph-sm text-text-sub-600">Your cart is empty</p>
							</div>
						) : (
							<div className="space-y-4">
								{items.map(item => (
									<div key={item.id} className="flex gap-3 p-3 bg-bg-weak-50 rounded-lg">
										<div className="text-3xl">{item.image}</div>
										<div className="flex-1">
											<p className="text-label-sm text-text-strong-950">{item.name}</p>
											<p className="text-paragraph-xs text-text-sub-600">${item.price}</p>
											<div className="flex items-center gap-2 mt-2">
												<button
													onClick={() => updateQuantity(item.id, -1)}
													className="size-6 rounded bg-bg-white-0 border border-stroke-soft-200 flex items-center justify-center"
												>
													<Minus className="size-3" />
												</button>
												<span className="text-label-sm w-6 text-center">{item.quantity}</span>
												<button
													onClick={() => updateQuantity(item.id, 1)}
													className="size-6 rounded bg-bg-white-0 border border-stroke-soft-200 flex items-center justify-center"
												>
													<Plus className="size-3" />
												</button>
											</div>
										</div>
										<button
											onClick={() => removeItem(item.id)}
											className="text-text-soft-400 hover:text-error-base"
										>
											<Trash className="size-5" />
										</button>
									</div>
								))}
							</div>
						)}
					</SlideoutMenu.Body>
					{items.length > 0 && (
						<SlideoutMenu.Footer className="flex-col gap-3">
							<div className="flex justify-between w-full">
								<span className="text-label-md text-text-sub-600">Total</span>
								<span className="text-label-lg text-text-strong-950">${total.toFixed(2)}</span>
							</div>
							<Button.Root className="w-full">
								Checkout
							</Button.Root>
						</SlideoutMenu.Footer>
					)}
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>
		)
	},
}

// Notifications panel example
export const NotificationsPanelExample: Story = {
	render: () => {
		const notifications = [
			{ id: 1, type: "success", title: "Order Confirmed", message: "Your order #12345 has been confirmed", time: "2 min ago", icon: Check },
			{ id: 2, type: "info", title: "New Feature", message: "Check out our new dashboard analytics", time: "1 hour ago", icon: Bell },
			{ id: 3, type: "warning", title: "Payment Due", message: "Your subscription will expire in 3 days", time: "2 hours ago", icon: CreditCard },
			{ id: 4, type: "info", title: "Team Invite", message: "John invited you to join the team", time: "5 hours ago", icon: User },
		]

		const getTypeStyles = (type: string) => {
			switch (type) {
				case "success": return "bg-success-lighter text-success-base"
				case "warning": return "bg-warning-lighter text-warning-base"
				default: return "bg-primary-lighter text-primary-base"
			}
		}

		return (
			<SlideoutMenu.Root>
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="ghost">
						<Button.Icon>
							<Bell />
						</Button.Icon>
					</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<div className="flex-1 flex items-center justify-between">
							<SlideoutMenu.Title>Notifications</SlideoutMenu.Title>
							<button className="text-label-sm text-primary-base hover:text-primary-dark">
								Mark all as read
							</button>
						</div>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body>
						<div className="divide-y divide-stroke-soft-200">
							{notifications.map(notification => (
								<div key={notification.id} className="p-4 hover:bg-bg-weak-50 cursor-pointer">
									<div className="flex gap-3">
										<div className={`size-8 rounded-full flex items-center justify-center ${getTypeStyles(notification.type)}`}>
											<notification.icon className="size-4" />
										</div>
										<div className="flex-1">
											<p className="text-label-sm text-text-strong-950">{notification.title}</p>
											<p className="text-paragraph-xs text-text-sub-600">{notification.message}</p>
											<p className="text-paragraph-xs text-text-soft-400 mt-1">{notification.time}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</SlideoutMenu.Body>
					<SlideoutMenu.Footer className="justify-center">
						<button className="text-label-sm text-primary-base hover:text-primary-dark">
							View all notifications
						</button>
					</SlideoutMenu.Footer>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>
		)
	},
}

// Settings panel example
export const SettingsPanelExample: Story = {
	render: function SettingsDemo() {
		const [settings, setSettings] = useState({
			emailNotifications: true,
			pushNotifications: false,
			darkMode: false,
			twoFactor: true,
		})

		const toggleSetting = (key: keyof typeof settings) => {
			setSettings(prev => ({ ...prev, [key]: !prev[key] }))
		}

		const settingItems = [
			{ key: "emailNotifications" as const, icon: Bell, label: "Email Notifications", description: "Receive updates via email" },
			{ key: "pushNotifications" as const, icon: Bell, label: "Push Notifications", description: "Receive push notifications" },
			{ key: "darkMode" as const, icon: Gear, label: "Dark Mode", description: "Use dark theme" },
			{ key: "twoFactor" as const, icon: ShieldCheck, label: "Two-Factor Auth", description: "Extra security for your account" },
		]

		return (
			<SlideoutMenu.Root>
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="neutral">
						<Button.Icon>
							<Gear />
						</Button.Icon>
						Settings
					</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<SlideoutMenu.Title>Settings</SlideoutMenu.Title>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						<div className="space-y-4">
							{settingItems.map(item => (
								<div
									key={item.key}
									className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-weak-50 cursor-pointer"
									onClick={() => toggleSetting(item.key)}
								>
									<div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center text-text-sub-600">
										<item.icon className="size-5" />
									</div>
									<div className="flex-1">
										<p className="text-label-sm text-text-strong-950">{item.label}</p>
										<p className="text-paragraph-xs text-text-sub-600">{item.description}</p>
									</div>
									<div className={`w-10 h-6 rounded-full transition-colors ${settings[item.key] ? 'bg-primary-base' : 'bg-bg-soft-200'}`}>
										<div className={`size-5 rounded-full bg-white shadow-md transition-transform mt-0.5 ${settings[item.key] ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} />
									</div>
								</div>
							))}
						</div>
					</SlideoutMenu.Body>
					<SlideoutMenu.Footer>
						<SlideoutMenu.Close asChild>
							<Button.Root variant="basic" className="flex-1">Cancel</Button.Root>
						</SlideoutMenu.Close>
						<Button.Root className="flex-1">Save Changes</Button.Root>
					</SlideoutMenu.Footer>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>
		)
	},
}

// Filter panel example
export const FilterPanelExample: Story = {
	render: function FilterDemo() {
		const [filters, setFilters] = useState({
			categories: [] as string[],
			priceRange: [0, 1000],
			inStock: true,
		})

		const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"]

		const toggleCategory = (category: string) => {
			setFilters(prev => ({
				...prev,
				categories: prev.categories.includes(category)
					? prev.categories.filter(c => c !== category)
					: [...prev.categories, category]
			}))
		}

		return (
			<SlideoutMenu.Root side="left">
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="neutral">
						Filters
					</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<SlideoutMenu.Title>Filters</SlideoutMenu.Title>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						<div className="space-y-6">
							<div>
								<h4 className="text-label-sm text-text-strong-950 mb-3">Categories</h4>
								<div className="space-y-2">
									{categories.map(category => (
										<label
											key={category}
											className="flex items-center gap-2 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={filters.categories.includes(category)}
												onChange={() => toggleCategory(category)}
												className="size-4 rounded border-stroke-soft-200"
											/>
											<span className="text-paragraph-sm text-text-sub-600">{category}</span>
										</label>
									))}
								</div>
							</div>

							<div>
								<h4 className="text-label-sm text-text-strong-950 mb-3">Price Range</h4>
								<div className="flex items-center gap-3">
									<input
										type="number"
										value={filters.priceRange[0]}
										onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [Number(e.target.value), prev.priceRange[1]] }))}
										className="w-24 px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
										placeholder="Min"
									/>
									<span className="text-text-soft-400">-</span>
									<input
										type="number"
										value={filters.priceRange[1]}
										onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], Number(e.target.value)] }))}
										className="w-24 px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
										placeholder="Max"
									/>
								</div>
							</div>

							<div>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={filters.inStock}
										onChange={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
										className="size-4 rounded border-stroke-soft-200"
									/>
									<span className="text-paragraph-sm text-text-sub-600">In Stock Only</span>
								</label>
							</div>
						</div>
					</SlideoutMenu.Body>
					<SlideoutMenu.Footer>
						<Button.Root
							variant="basic"
							className="flex-1"
							onClick={() => setFilters({ categories: [], priceRange: [0, 1000], inStock: true })}
						>
							Clear All
						</Button.Root>
						<SlideoutMenu.Close asChild>
							<Button.Root className="flex-1">
								Apply Filters
							</Button.Root>
						</SlideoutMenu.Close>
					</SlideoutMenu.Footer>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>
		)
	},
}

// Order detail example
export const OrderDetailExample: Story = {
	render: () => {
		const order = {
			id: "ORD-12345",
			status: "In Transit",
			date: "Dec 28, 2024",
			items: [
				{ name: "Wireless Mouse", quantity: 1, price: 49.99 },
				{ name: "Keyboard", quantity: 1, price: 129.99 },
				{ name: "Monitor Stand", quantity: 2, price: 39.99 },
			],
			shipping: {
				name: "John Doe",
				address: "123 Main St, San Francisco, CA 94105",
				method: "Express Shipping",
			},
		}

		const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

		return (
			<SlideoutMenu.Root>
				<SlideoutMenu.Trigger asChild>
					<Button.Root variant="neutral">
						<Button.Icon>
							<Package />
						</Button.Icon>
						View Order
					</Button.Root>
				</SlideoutMenu.Trigger>
				<SlideoutMenu.Content>
					<SlideoutMenu.Header>
						<div className="flex-1">
							<SlideoutMenu.Title>Order {order.id}</SlideoutMenu.Title>
							<SlideoutMenu.Description>
								Placed on {order.date}
							</SlideoutMenu.Description>
						</div>
					</SlideoutMenu.Header>
					<SlideoutMenu.Body className="p-5">
						<div className="space-y-6">
							{/* Status */}
							<div className="flex items-center gap-2">
								<span className="px-2 py-1 text-label-xs bg-primary-lighter text-primary-base rounded-full">
									{order.status}
								</span>
							</div>

							{/* Items */}
							<div>
								<h4 className="text-label-sm text-text-strong-950 mb-3">Items</h4>
								<div className="space-y-3">
									{order.items.map((item, index) => (
										<div key={index} className="flex justify-between">
											<div>
												<p className="text-paragraph-sm text-text-strong-950">{item.name}</p>
												<p className="text-paragraph-xs text-text-soft-400">Qty: {item.quantity}</p>
											</div>
											<p className="text-label-sm text-text-strong-950">${(item.price * item.quantity).toFixed(2)}</p>
										</div>
									))}
								</div>
								<div className="mt-4 pt-4 border-t border-stroke-soft-200">
									<div className="flex justify-between">
										<span className="text-label-sm text-text-sub-600">Subtotal</span>
										<span className="text-label-sm text-text-strong-950">${subtotal.toFixed(2)}</span>
									</div>
									<div className="flex justify-between mt-1">
										<span className="text-label-sm text-text-sub-600">Shipping</span>
										<span className="text-label-sm text-text-strong-950">$9.99</span>
									</div>
									<div className="flex justify-between mt-2 pt-2 border-t border-stroke-soft-200">
										<span className="text-label-md text-text-strong-950">Total</span>
										<span className="text-label-md text-text-strong-950">${(subtotal + 9.99).toFixed(2)}</span>
									</div>
								</div>
							</div>

							{/* Shipping */}
							<div>
								<h4 className="text-label-sm text-text-strong-950 mb-3">Shipping Address</h4>
								<div className="p-3 bg-bg-weak-50 rounded-lg">
									<p className="text-paragraph-sm text-text-strong-950">{order.shipping.name}</p>
									<p className="text-paragraph-xs text-text-sub-600">{order.shipping.address}</p>
									<p className="text-paragraph-xs text-text-soft-400 mt-2">{order.shipping.method}</p>
								</div>
							</div>
						</div>
					</SlideoutMenu.Body>
					<SlideoutMenu.Footer>
						<Button.Root variant="basic" className="flex-1">
							<Button.Icon>
								<MapPin />
							</Button.Icon>
							Track Order
						</Button.Root>
						<Button.Root variant="basic" className="flex-1">
							<Button.Icon>
								<FileText />
							</Button.Icon>
							Invoice
						</Button.Root>
					</SlideoutMenu.Footer>
				</SlideoutMenu.Content>
			</SlideoutMenu.Root>
		)
	},
}

// Event details example
export const EventDetailsExample: Story = {
	render: () => (
		<SlideoutMenu.Root>
			<SlideoutMenu.Trigger asChild>
				<Button.Root>
					<Button.Icon>
						<Calendar />
					</Button.Icon>
					View Event
				</Button.Root>
			</SlideoutMenu.Trigger>
			<SlideoutMenu.Content>
				<SlideoutMenu.Header>
					<div className="flex-1">
						<SlideoutMenu.Title>Team Standup</SlideoutMenu.Title>
						<SlideoutMenu.Description>
							Daily sync meeting
						</SlideoutMenu.Description>
					</div>
				</SlideoutMenu.Header>
				<SlideoutMenu.Body className="p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-lg bg-primary-lighter flex items-center justify-center text-primary-base">
								<Calendar className="size-5" />
							</div>
							<div>
								<p className="text-label-sm text-text-strong-950">Monday, Jan 6, 2025</p>
								<p className="text-paragraph-xs text-text-sub-600">9:00 AM - 9:30 AM</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center text-text-sub-600">
								<MapPin className="size-5" />
							</div>
							<div>
								<p className="text-label-sm text-text-strong-950">Conference Room A</p>
								<p className="text-paragraph-xs text-text-sub-600">Building 1, Floor 2</p>
							</div>
						</div>

						<div>
							<h4 className="text-label-sm text-text-strong-950 mb-2">Attendees (5)</h4>
							<div className="flex -space-x-2">
								{["JD", "AS", "MK", "RB", "PT"].map((initials, index) => (
									<div
										key={index}
										className="size-8 rounded-full bg-primary-base text-white text-label-xs flex items-center justify-center ring-2 ring-white"
									>
										{initials}
									</div>
								))}
							</div>
						</div>

						<div>
							<h4 className="text-label-sm text-text-strong-950 mb-2">Description</h4>
							<p className="text-paragraph-sm text-text-sub-600">
								Daily team standup to discuss progress, blockers, and priorities for the day.
							</p>
						</div>
					</div>
				</SlideoutMenu.Body>
				<SlideoutMenu.Footer>
					<Button.Root variant="error" className="flex-1">
						Decline
					</Button.Root>
					<Button.Root className="flex-1">
						Accept
					</Button.Root>
				</SlideoutMenu.Footer>
			</SlideoutMenu.Content>
		</SlideoutMenu.Root>
	),
}
