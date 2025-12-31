import type { Meta, StoryObj } from "@storybook/react"
import { FeaturedIcon } from "@/components/ui/primitives/featured-icon"
import { Check, X, Warning, Info, Bell, Star, Heart, Lightning, Shield, Gear, User, Envelope, Phone, Lock, Trash, Download, Upload, Plus, Minus, Eye, MagnifyingGlass, House, Folder, File, Calendar, Clock, CreditCard, ShoppingCart } from "@phosphor-icons/react"

const meta: Meta<typeof FeaturedIcon> = {
	title: "Primitives/FeaturedIcon",
	component: FeaturedIcon,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["small", "medium", "large", "xlarge"],
		},
		theme: {
			control: "select",
			options: ["light", "gradient", "dark", "outline", "modern", "modern-neue"],
		},
		color: {
			control: "select",
			options: ["gray", "primary", "error", "warning", "success"],
		},
	},
}

export default meta
type Story = StoryObj<typeof FeaturedIcon>

// Basic featured icon
export const Basic: Story = {
	args: {
		icon: Check,
		size: "medium",
		theme: "light",
		color: "primary",
	},
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} size="small" theme="light" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Small</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} size="medium" theme="light" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Medium</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} size="large" theme="light" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Large</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} size="xlarge" theme="light" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">XLarge</span>
			</div>
		</div>
	),
}

// All colors - Light theme
export const LightThemeColors: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Info} theme="light" color="gray" />
				<span className="text-paragraph-xs text-text-soft-400">Gray</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="light" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Primary</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={X} theme="light" color="error" />
				<span className="text-paragraph-xs text-text-soft-400">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Warning} theme="light" color="warning" />
				<span className="text-paragraph-xs text-text-soft-400">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="light" color="success" />
				<span className="text-paragraph-xs text-text-soft-400">Success</span>
			</div>
		</div>
	),
}

// All colors - Gradient theme
export const GradientThemeColors: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Info} theme="gradient" color="gray" />
				<span className="text-paragraph-xs text-text-soft-400">Gray</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="gradient" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Primary</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={X} theme="gradient" color="error" />
				<span className="text-paragraph-xs text-text-soft-400">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Warning} theme="gradient" color="warning" />
				<span className="text-paragraph-xs text-text-soft-400">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="gradient" color="success" />
				<span className="text-paragraph-xs text-text-soft-400">Success</span>
			</div>
		</div>
	),
}

// All colors - Dark theme
export const DarkThemeColors: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Info} theme="dark" color="gray" />
				<span className="text-paragraph-xs text-text-soft-400">Gray</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="dark" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Primary</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={X} theme="dark" color="error" />
				<span className="text-paragraph-xs text-text-soft-400">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Warning} theme="dark" color="warning" />
				<span className="text-paragraph-xs text-text-soft-400">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="dark" color="success" />
				<span className="text-paragraph-xs text-text-soft-400">Success</span>
			</div>
		</div>
	),
}

// All colors - Outline theme
export const OutlineThemeColors: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Info} theme="outline" color="gray" />
				<span className="text-paragraph-xs text-text-soft-400">Gray</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="outline" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Primary</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={X} theme="outline" color="error" />
				<span className="text-paragraph-xs text-text-soft-400">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Warning} theme="outline" color="warning" />
				<span className="text-paragraph-xs text-text-soft-400">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="outline" color="success" />
				<span className="text-paragraph-xs text-text-soft-400">Success</span>
			</div>
		</div>
	),
}

// All colors - Modern theme
export const ModernThemeColors: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Info} theme="modern" color="gray" />
				<span className="text-paragraph-xs text-text-soft-400">Gray</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="modern" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Primary</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={X} theme="modern" color="error" />
				<span className="text-paragraph-xs text-text-soft-400">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Warning} theme="modern" color="warning" />
				<span className="text-paragraph-xs text-text-soft-400">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="modern" color="success" />
				<span className="text-paragraph-xs text-text-soft-400">Success</span>
			</div>
		</div>
	),
}

// All colors - Modern Neue theme
export const ModernNeueThemeColors: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Info} theme="modern-neue" color="gray" />
				<span className="text-paragraph-xs text-text-soft-400">Gray</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="modern-neue" color="primary" />
				<span className="text-paragraph-xs text-text-soft-400">Primary</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={X} theme="modern-neue" color="error" />
				<span className="text-paragraph-xs text-text-soft-400">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Warning} theme="modern-neue" color="warning" />
				<span className="text-paragraph-xs text-text-soft-400">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="modern-neue" color="success" />
				<span className="text-paragraph-xs text-text-soft-400">Success</span>
			</div>
		</div>
	),
}

// All themes comparison
export const AllThemesComparison: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Light</p>
				<div className="flex items-center gap-3">
					<FeaturedIcon icon={Check} theme="light" color="gray" size="small" />
					<FeaturedIcon icon={Check} theme="light" color="gray" size="medium" />
					<FeaturedIcon icon={Check} theme="light" color="gray" size="large" />
					<FeaturedIcon icon={Check} theme="light" color="gray" size="xlarge" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Gradient</p>
				<div className="flex items-center gap-3">
					<FeaturedIcon icon={Check} theme="gradient" color="primary" size="small" />
					<FeaturedIcon icon={Check} theme="gradient" color="primary" size="medium" />
					<FeaturedIcon icon={Check} theme="gradient" color="primary" size="large" />
					<FeaturedIcon icon={Check} theme="gradient" color="primary" size="xlarge" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Dark</p>
				<div className="flex items-center gap-3">
					<FeaturedIcon icon={Check} theme="dark" color="primary" size="small" />
					<FeaturedIcon icon={Check} theme="dark" color="primary" size="medium" />
					<FeaturedIcon icon={Check} theme="dark" color="primary" size="large" />
					<FeaturedIcon icon={Check} theme="dark" color="primary" size="xlarge" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Outline</p>
				<div className="flex items-center gap-4">
					<FeaturedIcon icon={Check} theme="outline" color="primary" size="small" />
					<FeaturedIcon icon={Check} theme="outline" color="primary" size="medium" />
					<FeaturedIcon icon={Check} theme="outline" color="primary" size="large" />
					<FeaturedIcon icon={Check} theme="outline" color="primary" size="xlarge" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Modern</p>
				<div className="flex items-center gap-3">
					<FeaturedIcon icon={Check} theme="modern" color="primary" size="small" />
					<FeaturedIcon icon={Check} theme="modern" color="primary" size="medium" />
					<FeaturedIcon icon={Check} theme="modern" color="primary" size="large" />
					<FeaturedIcon icon={Check} theme="modern" color="primary" size="xlarge" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Modern Neue</p>
				<div className="flex items-center gap-3">
					<FeaturedIcon icon={Check} theme="modern-neue" color="primary" size="small" />
					<FeaturedIcon icon={Check} theme="modern-neue" color="primary" size="medium" />
					<FeaturedIcon icon={Check} theme="modern-neue" color="primary" size="large" />
					<FeaturedIcon icon={Check} theme="modern-neue" color="primary" size="xlarge" />
				</div>
			</div>
		</div>
	),
}

// Common use cases - Status icons
export const StatusIcons: Story = {
	render: () => (
		<div className="flex items-center gap-6">
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Check} theme="light" color="success" />
				<span className="text-paragraph-xs text-text-sub-600">Success</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={X} theme="light" color="error" />
				<span className="text-paragraph-xs text-text-sub-600">Error</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Warning} theme="light" color="warning" />
				<span className="text-paragraph-xs text-text-sub-600">Warning</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<FeaturedIcon icon={Info} theme="light" color="primary" />
				<span className="text-paragraph-xs text-text-sub-600">Info</span>
			</div>
		</div>
	),
}

// Various icons
export const VariousIcons: Story = {
	render: () => (
		<div className="grid grid-cols-6 gap-4">
			<FeaturedIcon icon={Bell} theme="light" color="primary" />
			<FeaturedIcon icon={Star} theme="light" color="warning" />
			<FeaturedIcon icon={Heart} theme="light" color="error" />
			<FeaturedIcon icon={Lightning} theme="light" color="warning" />
			<FeaturedIcon icon={Shield} theme="light" color="success" />
			<FeaturedIcon icon={Gear} theme="light" color="gray" />
			<FeaturedIcon icon={User} theme="gradient" color="primary" />
			<FeaturedIcon icon={Envelope} theme="gradient" color="primary" />
			<FeaturedIcon icon={Phone} theme="gradient" color="success" />
			<FeaturedIcon icon={Lock} theme="gradient" color="gray" />
			<FeaturedIcon icon={Trash} theme="gradient" color="error" />
			<FeaturedIcon icon={Download} theme="gradient" color="primary" />
			<FeaturedIcon icon={Upload} theme="dark" color="primary" />
			<FeaturedIcon icon={Plus} theme="dark" color="success" />
			<FeaturedIcon icon={Minus} theme="dark" color="error" />
			<FeaturedIcon icon={Eye} theme="dark" color="gray" />
			<FeaturedIcon icon={MagnifyingGlass} theme="dark" color="primary" />
			<FeaturedIcon icon={House} theme="dark" color="primary" />
		</div>
	),
}

// Feature card example
export const FeatureCardExample: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-4 max-w-2xl">
			{[
				{ icon: Lightning, title: "Fast Performance", description: "Lightning fast load times and smooth interactions", color: "warning" as const },
				{ icon: Shield, title: "Secure", description: "Enterprise-grade security for your data", color: "success" as const },
				{ icon: Gear, title: "Customizable", description: "Tailor the experience to your needs", color: "primary" as const },
			].map((feature, index) => (
				<div key={index} className="p-6 border border-stroke-soft-200 rounded-xl">
					<FeaturedIcon icon={feature.icon} theme="light" color={feature.color} size="large" className="mb-4" />
					<h3 className="text-label-md text-text-strong-950 mb-2">{feature.title}</h3>
					<p className="text-paragraph-sm text-text-sub-600">{feature.description}</p>
				</div>
			))}
		</div>
	),
}

// Empty state example
export const EmptyStateExample: Story = {
	render: () => (
		<div className="w-80 text-center py-12 px-6 border border-stroke-soft-200 rounded-xl">
			<FeaturedIcon icon={Folder} theme="light" color="gray" size="xlarge" className="mx-auto mb-4" />
			<h3 className="text-label-lg text-text-strong-950 mb-2">No files yet</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">
				Upload your first file to get started
			</p>
			<button className="px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm">
				Upload File
			</button>
		</div>
	),
}

// Success state example
export const SuccessStateExample: Story = {
	render: () => (
		<div className="w-80 text-center py-12 px-6 border border-stroke-soft-200 rounded-xl">
			<FeaturedIcon icon={Check} theme="gradient" color="success" size="xlarge" className="mx-auto mb-4" />
			<h3 className="text-label-lg text-text-strong-950 mb-2">Payment Successful</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">
				Your order has been placed successfully. You will receive a confirmation email shortly.
			</p>
			<button className="px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm">
				View Order
			</button>
		</div>
	),
}

// Error state example
export const ErrorStateExample: Story = {
	render: () => (
		<div className="w-80 text-center py-12 px-6 border border-stroke-soft-200 rounded-xl">
			<FeaturedIcon icon={X} theme="dark" color="error" size="xlarge" className="mx-auto mb-4" />
			<h3 className="text-label-lg text-text-strong-950 mb-2">Upload Failed</h3>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">
				The file could not be uploaded. Please check your connection and try again.
			</p>
			<button className="px-4 py-2 bg-error-base text-white rounded-lg text-label-sm">
				Try Again
			</button>
		</div>
	),
}

// Notification card example
export const NotificationCardExample: Story = {
	render: () => (
		<div className="w-96 space-y-3">
			{[
				{ icon: Check, title: "Order Confirmed", message: "Your order #12345 has been confirmed", time: "2 min ago", color: "success" as const, theme: "light" as const },
				{ icon: Bell, title: "New Message", message: "You have a new message from John", time: "5 min ago", color: "primary" as const, theme: "light" as const },
				{ icon: Warning, title: "Payment Due", message: "Your subscription expires in 3 days", time: "1 hour ago", color: "warning" as const, theme: "light" as const },
				{ icon: X, title: "Upload Failed", message: "File upload failed. Try again.", time: "2 hours ago", color: "error" as const, theme: "light" as const },
			].map((notification, index) => (
				<div key={index} className="flex gap-3 p-4 border border-stroke-soft-200 rounded-xl hover:bg-bg-weak-50 cursor-pointer">
					<FeaturedIcon icon={notification.icon} theme={notification.theme} color={notification.color} size="medium" />
					<div className="flex-1">
						<h4 className="text-label-sm text-text-strong-950">{notification.title}</h4>
						<p className="text-paragraph-xs text-text-sub-600">{notification.message}</p>
						<p className="text-paragraph-xs text-text-soft-400 mt-1">{notification.time}</p>
					</div>
				</div>
			))}
		</div>
	),
}

// Step indicator example
export const StepIndicatorExample: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<div className="flex flex-col items-center">
				<FeaturedIcon icon={Check} theme="dark" color="success" size="medium" />
				<span className="text-paragraph-xs text-text-sub-600 mt-2">Cart</span>
			</div>
			<div className="h-px w-12 bg-success-base" />
			<div className="flex flex-col items-center">
				<FeaturedIcon icon={Check} theme="dark" color="success" size="medium" />
				<span className="text-paragraph-xs text-text-sub-600 mt-2">Shipping</span>
			</div>
			<div className="h-px w-12 bg-stroke-soft-200" />
			<div className="flex flex-col items-center">
				<FeaturedIcon icon={CreditCard} theme="dark" color="primary" size="medium" />
				<span className="text-paragraph-xs text-text-strong-950 mt-2">Payment</span>
			</div>
			<div className="h-px w-12 bg-stroke-soft-200" />
			<div className="flex flex-col items-center">
				<FeaturedIcon icon={ShoppingCart} theme="light" color="gray" size="medium" />
				<span className="text-paragraph-xs text-text-soft-400 mt-2">Review</span>
			</div>
		</div>
	),
}

// Dashboard widget example
export const DashboardWidgetExample: Story = {
	render: () => (
		<div className="grid grid-cols-2 gap-4 w-[500px]">
			{[
				{ icon: User, label: "Total Users", value: "12,345", change: "+12%", positive: true, color: "primary" as const },
				{ icon: ShoppingCart, label: "Orders", value: "1,234", change: "+8%", positive: true, color: "success" as const },
				{ icon: CreditCard, label: "Revenue", value: "$45,678", change: "-3%", positive: false, color: "warning" as const },
				{ icon: Eye, label: "Page Views", value: "89,012", change: "+25%", positive: true, color: "primary" as const },
			].map((stat, index) => (
				<div key={index} className="p-4 border border-stroke-soft-200 rounded-xl">
					<div className="flex items-center justify-between mb-3">
						<FeaturedIcon icon={stat.icon} theme="modern" color={stat.color} size="small" />
						<span className={`text-label-xs ${stat.positive ? 'text-success-base' : 'text-error-base'}`}>
							{stat.change}
						</span>
					</div>
					<p className="text-paragraph-xs text-text-sub-600">{stat.label}</p>
					<p className="text-heading-md text-text-strong-950">{stat.value}</p>
				</div>
			))}
		</div>
	),
}

// Onboarding checklist example
export const OnboardingChecklistExample: Story = {
	render: () => (
		<div className="w-80 p-4 border border-stroke-soft-200 rounded-xl">
			<h3 className="text-label-md text-text-strong-950 mb-4">Getting Started</h3>
			<div className="space-y-3">
				{[
					{ icon: Check, label: "Create account", completed: true },
					{ icon: Check, label: "Verify email", completed: true },
					{ icon: User, label: "Complete profile", completed: false },
					{ icon: CreditCard, label: "Add payment method", completed: false },
					{ icon: Gear, label: "Configure settings", completed: false },
				].map((step, index) => (
					<div key={index} className="flex items-center gap-3">
						<FeaturedIcon
							icon={step.icon}
							theme={step.completed ? "dark" : "light"}
							color={step.completed ? "success" : "gray"}
							size="small"
						/>
						<span className={`text-paragraph-sm ${step.completed ? 'text-text-sub-600 line-through' : 'text-text-strong-950'}`}>
							{step.label}
						</span>
					</div>
				))}
			</div>
		</div>
	),
}

// Modal header example
export const ModalHeaderExample: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-6 text-center border-b border-stroke-soft-200">
				<FeaturedIcon icon={Warning} theme="gradient" color="warning" size="xlarge" className="mx-auto mb-4" />
				<h2 className="text-label-lg text-text-strong-950 mb-2">Delete Item?</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					This action cannot be undone. Are you sure you want to delete this item?
				</p>
			</div>
			<div className="p-4 bg-bg-weak-50 flex gap-3">
				<button className="flex-1 px-4 py-2 border border-stroke-soft-200 rounded-lg text-label-sm text-text-sub-600 hover:bg-bg-white-0">
					Cancel
				</button>
				<button className="flex-1 px-4 py-2 bg-error-base text-white rounded-lg text-label-sm hover:bg-error-dark">
					Delete
				</button>
			</div>
		</div>
	),
}

// Timeline example
export const TimelineExample: Story = {
	render: () => (
		<div className="w-80 space-y-4">
			{[
				{ icon: Check, title: "Order placed", time: "Dec 28, 2024", description: "Order #12345 was placed", color: "success" as const, theme: "dark" as const },
				{ icon: Clock, title: "Processing", time: "Dec 29, 2024", description: "Order is being processed", color: "primary" as const, theme: "dark" as const },
				{ icon: Calendar, title: "Shipped", time: "Dec 30, 2024", description: "Package handed to carrier", color: "primary" as const, theme: "light" as const },
				{ icon: House, title: "Delivered", time: "Est. Jan 2, 2025", description: "Expected delivery date", color: "gray" as const, theme: "light" as const },
			].map((event, index) => (
				<div key={index} className="flex gap-3">
					<div className="flex flex-col items-center">
						<FeaturedIcon icon={event.icon} theme={event.theme} color={event.color} size="small" />
						{index < 3 && <div className="w-px h-8 bg-stroke-soft-200 mt-2" />}
					</div>
					<div>
						<p className="text-label-sm text-text-strong-950">{event.title}</p>
						<p className="text-paragraph-xs text-text-sub-600">{event.description}</p>
						<p className="text-paragraph-xs text-text-soft-400 mt-1">{event.time}</p>
					</div>
				</div>
			))}
		</div>
	),
}
