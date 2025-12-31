import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as DrawerRoot,
	Trigger as DrawerTrigger,
	Content as DrawerContent,
	Header as DrawerHeader,
	Title as DrawerTitle,
	Body as DrawerBody,
	Footer as DrawerFooter,
	Close as DrawerClose,
} from "@/components/ui/layout/drawer"
import { ButtonRoot } from "@/components/ui/primitives"
import { User, Gear, Bell, ShieldCheck, CreditCard, SignOut } from "@phosphor-icons/react"

const meta: Meta<typeof DrawerRoot> = {
	title: "Layout/Drawer",
	component: DrawerRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof DrawerRoot>

// Basic drawer
export const Basic: Story = {
	render: () => (
		<DrawerRoot>
			<DrawerTrigger asChild>
				<ButtonRoot variant="primary">Open Drawer</ButtonRoot>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Drawer Title</DrawerTitle>
				</DrawerHeader>
				<DrawerBody className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						This is the drawer body content. You can put any content here including forms, lists,
						or any other components.
					</p>
				</DrawerBody>
				<DrawerFooter>
					<DrawerClose asChild>
						<ButtonRoot variant="basic" className="flex-1">
							Cancel
						</ButtonRoot>
					</DrawerClose>
					<ButtonRoot variant="primary" className="flex-1">
						Save
					</ButtonRoot>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	),
}

// Without close button
export const WithoutCloseButton: Story = {
	render: () => (
		<DrawerRoot>
			<DrawerTrigger asChild>
				<ButtonRoot variant="primary">Open Drawer</ButtonRoot>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader showCloseButton={false}>
					<DrawerTitle>No Close Button</DrawerTitle>
				</DrawerHeader>
				<DrawerBody className="p-5">
					<p className="text-paragraph-sm text-text-sub-600">
						This drawer does not have a close button in the header. Use the footer buttons to close
						it.
					</p>
				</DrawerBody>
				<DrawerFooter>
					<DrawerClose asChild>
						<ButtonRoot variant="basic" className="flex-1">
							Close
						</ButtonRoot>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	),
}

// Settings drawer
export const SettingsDrawer: Story = {
	render: () => (
		<DrawerRoot>
			<DrawerTrigger asChild>
				<ButtonRoot variant="primary">
					<Gear className="size-4" />
					Settings
				</ButtonRoot>
			</DrawerTrigger>
			<DrawerContent accessibilityTitle="Settings">
				<DrawerHeader>
					<DrawerTitle>Settings</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<div className="flex flex-col">
						<button className="flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-weak-50 transition-colors border-b border-stroke-soft-200">
							<User className="size-5 text-text-sub-600" />
							<div>
								<p className="text-label-sm text-text-strong-950">Profile</p>
								<p className="text-paragraph-xs text-text-sub-600">Manage your profile</p>
							</div>
						</button>
						<button className="flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-weak-50 transition-colors border-b border-stroke-soft-200">
							<Bell className="size-5 text-text-sub-600" />
							<div>
								<p className="text-label-sm text-text-strong-950">Notifications</p>
								<p className="text-paragraph-xs text-text-sub-600">Configure alerts</p>
							</div>
						</button>
						<button className="flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-weak-50 transition-colors border-b border-stroke-soft-200">
							<ShieldCheck className="size-5 text-text-sub-600" />
							<div>
								<p className="text-label-sm text-text-strong-950">Security</p>
								<p className="text-paragraph-xs text-text-sub-600">Password & 2FA</p>
							</div>
						</button>
						<button className="flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-weak-50 transition-colors border-b border-stroke-soft-200">
							<CreditCard className="size-5 text-text-sub-600" />
							<div>
								<p className="text-label-sm text-text-strong-950">Billing</p>
								<p className="text-paragraph-xs text-text-sub-600">Manage subscription</p>
							</div>
						</button>
						<button className="flex items-center gap-3 px-5 py-4 text-left hover:bg-error-lighter transition-colors text-error-base">
							<SignOut className="size-5" />
							<div>
								<p className="text-label-sm">Sign out</p>
							</div>
						</button>
					</div>
				</DrawerBody>
			</DrawerContent>
		</DrawerRoot>
	),
}

// Form drawer
export const FormDrawer: Story = {
	render: () => (
		<DrawerRoot>
			<DrawerTrigger asChild>
				<ButtonRoot variant="primary">Add New User</ButtonRoot>
			</DrawerTrigger>
			<DrawerContent accessibilityTitle="Add New User">
				<DrawerHeader>
					<DrawerTitle>Add New User</DrawerTitle>
				</DrawerHeader>
				<DrawerBody className="p-5">
					<form className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<label className="text-label-sm text-text-sub-600">Full Name</label>
							<input
								type="text"
								placeholder="John Doe"
								className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label className="text-label-sm text-text-sub-600">Email</label>
							<input
								type="email"
								placeholder="john@example.com"
								className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label className="text-label-sm text-text-sub-600">Role</label>
							<select className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm">
								<option>Select role</option>
								<option>Admin</option>
								<option>Editor</option>
								<option>Viewer</option>
							</select>
						</div>
						<div className="flex flex-col gap-2">
							<label className="text-label-sm text-text-sub-600">Department</label>
							<select className="px-3 py-2.5 rounded-lg border border-stroke-soft-200 text-paragraph-sm">
								<option>Select department</option>
								<option>Engineering</option>
								<option>Design</option>
								<option>Marketing</option>
								<option>Sales</option>
							</select>
						</div>
					</form>
				</DrawerBody>
				<DrawerFooter>
					<DrawerClose asChild>
						<ButtonRoot variant="basic" className="flex-1">
							Cancel
						</ButtonRoot>
					</DrawerClose>
					<ButtonRoot variant="primary" className="flex-1">
						Add User
					</ButtonRoot>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	),
}

// Notifications drawer
export const NotificationsDrawer: Story = {
	render: () => (
		<DrawerRoot>
			<DrawerTrigger asChild>
				<button className="relative p-2 rounded-lg hover:bg-bg-weak-50 transition-colors">
					<Bell className="size-5 text-text-sub-600" />
					<span className="absolute top-1 right-1 size-2 bg-error-base rounded-full" />
				</button>
			</DrawerTrigger>
			<DrawerContent accessibilityTitle="Notifications">
				<DrawerHeader>
					<DrawerTitle>Notifications</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<div className="flex flex-col">
						<div className="flex items-start gap-3 px-5 py-4 border-b border-stroke-soft-200 bg-primary-alpha-10">
							<div className="size-10 rounded-full bg-primary-base flex items-center justify-center text-white text-sm font-medium shrink-0">
								JD
							</div>
							<div className="flex-1">
								<p className="text-label-sm text-text-strong-950">John Doe mentioned you</p>
								<p className="text-paragraph-xs text-text-sub-600">
									&quot;Hey, can you review this PR?&quot;
								</p>
								<p className="text-paragraph-xs text-text-soft-400 mt-1">2 minutes ago</p>
							</div>
						</div>
						<div className="flex items-start gap-3 px-5 py-4 border-b border-stroke-soft-200">
							<div className="size-10 rounded-full bg-success-base flex items-center justify-center text-white text-sm font-medium shrink-0">
								✓
							</div>
							<div className="flex-1">
								<p className="text-label-sm text-text-strong-950">Build completed</p>
								<p className="text-paragraph-xs text-text-sub-600">
									Your build has completed successfully.
								</p>
								<p className="text-paragraph-xs text-text-soft-400 mt-1">1 hour ago</p>
							</div>
						</div>
						<div className="flex items-start gap-3 px-5 py-4 border-b border-stroke-soft-200">
							<div className="size-10 rounded-full bg-warning-base flex items-center justify-center text-white text-sm font-medium shrink-0">
								!
							</div>
							<div className="flex-1">
								<p className="text-label-sm text-text-strong-950">Subscription expiring</p>
								<p className="text-paragraph-xs text-text-sub-600">
									Your subscription expires in 3 days.
								</p>
								<p className="text-paragraph-xs text-text-soft-400 mt-1">Yesterday</p>
							</div>
						</div>
					</div>
				</DrawerBody>
				<DrawerFooter>
					<ButtonRoot variant="basic" className="flex-1">
						Mark all as read
					</ButtonRoot>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	),
}

// Long content drawer
export const LongContentDrawer: Story = {
	render: () => (
		<DrawerRoot>
			<DrawerTrigger asChild>
				<ButtonRoot variant="primary">View Details</ButtonRoot>
			</DrawerTrigger>
			<DrawerContent accessibilityTitle="Product Details">
				<DrawerHeader>
					<DrawerTitle>Product Details</DrawerTitle>
				</DrawerHeader>
				<DrawerBody className="p-5">
					<div className="flex flex-col gap-6">
						<div className="aspect-video bg-bg-soft-200 rounded-lg" />
						<div>
							<h4 className="text-label-lg text-text-strong-950 mb-2">Sony WH-1000XM5</h4>
							<p className="text-heading-sm text-primary-base">$399.00</p>
						</div>
						<div>
							<h5 className="text-label-sm text-text-strong-950 mb-2">Description</h5>
							<p className="text-paragraph-sm text-text-sub-600">
								Industry-leading noise cancellation with Auto NC Optimizer. Crystal-clear hands-free
								calling with 4 beamforming microphones. Up to 30-hour battery life with quick
								charging. Multipoint connection allows you to quickly switch between devices.
							</p>
						</div>
						<div>
							<h5 className="text-label-sm text-text-strong-950 mb-2">Specifications</h5>
							<div className="flex flex-col gap-2 text-paragraph-sm">
								<div className="flex justify-between">
									<span className="text-text-sub-600">Driver Size</span>
									<span className="text-text-strong-950">30mm</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-sub-600">Frequency Response</span>
									<span className="text-text-strong-950">4Hz - 40,000Hz</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-sub-600">Battery Life</span>
									<span className="text-text-strong-950">30 hours</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-sub-600">Weight</span>
									<span className="text-text-strong-950">250g</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-sub-600">Bluetooth</span>
									<span className="text-text-strong-950">5.2</span>
								</div>
							</div>
						</div>
						<div>
							<h5 className="text-label-sm text-text-strong-950 mb-2">Features</h5>
							<ul className="list-disc list-inside text-paragraph-sm text-text-sub-600 space-y-1">
								<li>Industry-leading noise cancellation</li>
								<li>Speak-to-Chat automatically pauses music</li>
								<li>Multipoint connection</li>
								<li>Touch sensor controls</li>
								<li>Wearing detection</li>
								<li>Fast charging (3 min = 3 hours playback)</li>
							</ul>
						</div>
					</div>
				</DrawerBody>
				<DrawerFooter>
					<DrawerClose asChild>
						<ButtonRoot variant="basic" className="flex-1">
							Close
						</ButtonRoot>
					</DrawerClose>
					<ButtonRoot variant="primary" className="flex-1">
						Add to Cart
					</ButtonRoot>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	),
}
