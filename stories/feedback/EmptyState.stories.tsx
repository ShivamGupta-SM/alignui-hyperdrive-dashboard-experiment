import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as EmptyStateRoot,
	Header as EmptyStateHeader,
	Icon as EmptyStateIcon,
	Content as EmptyStateContent,
	Title as EmptyStateTitle,
	Description as EmptyStateDescription,
	Footer as EmptyStateFooter,
} from "@/components/ui/feedback/empty-state"
import { ButtonRoot } from "@/components/ui/primitives"
import {
	Package,
	MagnifyingGlass,
	FolderOpen,
	Users,
	Image,
	ShoppingCart,
	Bell,
	ChatCircle,
	Plus,
} from "@phosphor-icons/react"

const meta: Meta<typeof EmptyStateRoot> = {
	title: "Feedback/EmptyState",
	component: EmptyStateRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof EmptyStateRoot>

// Basic empty state
export const Basic: Story = {
	render: () => (
		<EmptyStateRoot>
			<EmptyStateHeader>
				<EmptyStateIcon>
					<Package className="size-full" />
				</EmptyStateIcon>
			</EmptyStateHeader>
			<EmptyStateContent>
				<EmptyStateTitle>No items found</EmptyStateTitle>
				<EmptyStateDescription>
					Get started by creating a new item in your collection.
				</EmptyStateDescription>
			</EmptyStateContent>
			<EmptyStateFooter>
				<ButtonRoot variant="primary">
					<Plus className="size-4" />
					Create Item
				</ButtonRoot>
			</EmptyStateFooter>
		</EmptyStateRoot>
	),
}

// Search empty state
export const SearchEmpty: Story = {
	render: () => (
		<EmptyStateRoot>
			<EmptyStateHeader>
				<EmptyStateIcon>
					<MagnifyingGlass className="size-full" />
				</EmptyStateIcon>
			</EmptyStateHeader>
			<EmptyStateContent>
				<EmptyStateTitle>No results found</EmptyStateTitle>
				<EmptyStateDescription>
					Try adjusting your search or filter to find what you&apos;re looking for.
				</EmptyStateDescription>
			</EmptyStateContent>
			<EmptyStateFooter>
				<ButtonRoot variant="basic">Clear search</ButtonRoot>
			</EmptyStateFooter>
		</EmptyStateRoot>
	),
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-12">
			<div className="border border-stroke-soft-200 rounded-xl p-8">
				<EmptyStateRoot size="small">
					<EmptyStateHeader patternSize="small">
						<EmptyStateIcon>
							<Package className="size-full" />
						</EmptyStateIcon>
					</EmptyStateHeader>
					<EmptyStateContent>
						<EmptyStateTitle>Small Size</EmptyStateTitle>
						<EmptyStateDescription>This is a small empty state.</EmptyStateDescription>
					</EmptyStateContent>
					<EmptyStateFooter>
						<ButtonRoot variant="primary" size="small">
							Action
						</ButtonRoot>
					</EmptyStateFooter>
				</EmptyStateRoot>
			</div>
			<div className="border border-stroke-soft-200 rounded-xl p-8">
				<EmptyStateRoot size="medium">
					<EmptyStateHeader patternSize="medium">
						<EmptyStateIcon>
							<Package className="size-full" />
						</EmptyStateIcon>
					</EmptyStateHeader>
					<EmptyStateContent>
						<EmptyStateTitle>Medium Size</EmptyStateTitle>
						<EmptyStateDescription>This is a medium empty state.</EmptyStateDescription>
					</EmptyStateContent>
					<EmptyStateFooter>
						<ButtonRoot variant="primary">Action</ButtonRoot>
					</EmptyStateFooter>
				</EmptyStateRoot>
			</div>
			<div className="border border-stroke-soft-200 rounded-xl p-8">
				<EmptyStateRoot size="large">
					<EmptyStateHeader patternSize="large">
						<EmptyStateIcon>
							<Package className="size-full" />
						</EmptyStateIcon>
					</EmptyStateHeader>
					<EmptyStateContent>
						<EmptyStateTitle>Large Size</EmptyStateTitle>
						<EmptyStateDescription>This is a large empty state.</EmptyStateDescription>
					</EmptyStateContent>
					<EmptyStateFooter>
						<ButtonRoot variant="primary" size="medium">
							Action
						</ButtonRoot>
					</EmptyStateFooter>
				</EmptyStateRoot>
			</div>
		</div>
	),
}

// Icon colors
export const IconColors: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-8">
			<EmptyStateRoot size="small">
				<EmptyStateHeader patternSize="small">
					<EmptyStateIcon color="gray">
						<Package className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>Gray</EmptyStateTitle>
				</EmptyStateContent>
			</EmptyStateRoot>
			<EmptyStateRoot size="small">
				<EmptyStateHeader patternSize="small">
					<EmptyStateIcon color="primary">
						<Package className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>Primary</EmptyStateTitle>
				</EmptyStateContent>
			</EmptyStateRoot>
			<EmptyStateRoot size="small">
				<EmptyStateHeader patternSize="small">
					<EmptyStateIcon color="error">
						<Package className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>Error</EmptyStateTitle>
				</EmptyStateContent>
			</EmptyStateRoot>
			<EmptyStateRoot size="small">
				<EmptyStateHeader patternSize="small">
					<EmptyStateIcon color="warning">
						<Package className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>Warning</EmptyStateTitle>
				</EmptyStateContent>
			</EmptyStateRoot>
			<EmptyStateRoot size="small">
				<EmptyStateHeader patternSize="small">
					<EmptyStateIcon color="success">
						<Package className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>Success</EmptyStateTitle>
				</EmptyStateContent>
			</EmptyStateRoot>
		</div>
	),
}

// Without pattern
export const WithoutPattern: Story = {
	render: () => (
		<EmptyStateRoot>
			<EmptyStateHeader showPattern={false}>
				<EmptyStateIcon>
					<FolderOpen className="size-full" />
				</EmptyStateIcon>
			</EmptyStateHeader>
			<EmptyStateContent>
				<EmptyStateTitle>No files</EmptyStateTitle>
				<EmptyStateDescription>
					This folder is empty. Upload files to get started.
				</EmptyStateDescription>
			</EmptyStateContent>
			<EmptyStateFooter>
				<ButtonRoot variant="primary">Upload Files</ButtonRoot>
			</EmptyStateFooter>
		</EmptyStateRoot>
	),
}

// Team members empty state
export const TeamMembers: Story = {
	render: () => (
		<div className="w-[600px] border border-stroke-soft-200 rounded-xl p-12">
			<EmptyStateRoot>
				<EmptyStateHeader>
					<EmptyStateIcon color="primary">
						<Users className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>No team members yet</EmptyStateTitle>
					<EmptyStateDescription>
						Invite team members to collaborate on projects and share resources.
					</EmptyStateDescription>
				</EmptyStateContent>
				<EmptyStateFooter>
					<ButtonRoot variant="basic">Learn more</ButtonRoot>
					<ButtonRoot variant="primary">Invite members</ButtonRoot>
				</EmptyStateFooter>
			</EmptyStateRoot>
		</div>
	),
}

// Media gallery empty state
export const MediaGallery: Story = {
	render: () => (
		<div className="w-[600px] border border-dashed border-stroke-sub-300 rounded-xl p-12">
			<EmptyStateRoot>
				<EmptyStateHeader>
					<EmptyStateIcon>
						<Image className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>No media uploaded</EmptyStateTitle>
					<EmptyStateDescription>
						Drag and drop images here or click to browse your files.
					</EmptyStateDescription>
				</EmptyStateContent>
				<EmptyStateFooter>
					<ButtonRoot variant="primary">Browse files</ButtonRoot>
				</EmptyStateFooter>
			</EmptyStateRoot>
		</div>
	),
}

// Shopping cart empty state
export const ShoppingCartEmpty: Story = {
	render: () => (
		<div className="w-[600px] p-12">
			<EmptyStateRoot>
				<EmptyStateHeader>
					<EmptyStateIcon>
						<ShoppingCart className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>Your cart is empty</EmptyStateTitle>
					<EmptyStateDescription>
						Looks like you haven&apos;t added anything to your cart yet. Browse our products and
						find something you love!
					</EmptyStateDescription>
				</EmptyStateContent>
				<EmptyStateFooter>
					<ButtonRoot variant="primary">Start shopping</ButtonRoot>
				</EmptyStateFooter>
			</EmptyStateRoot>
		</div>
	),
}

// Notifications empty state
export const NotificationsEmpty: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl p-8">
			<EmptyStateRoot size="small">
				<EmptyStateHeader patternSize="small">
					<EmptyStateIcon>
						<Bell className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>All caught up!</EmptyStateTitle>
					<EmptyStateDescription>
						You have no new notifications at this time.
					</EmptyStateDescription>
				</EmptyStateContent>
			</EmptyStateRoot>
		</div>
	),
}

// Messages empty state
export const MessagesEmpty: Story = {
	render: () => (
		<div className="w-[600px] h-96 flex items-center justify-center border border-stroke-soft-200 rounded-xl">
			<EmptyStateRoot>
				<EmptyStateHeader>
					<EmptyStateIcon color="primary">
						<ChatCircle className="size-full" />
					</EmptyStateIcon>
				</EmptyStateHeader>
				<EmptyStateContent>
					<EmptyStateTitle>No messages yet</EmptyStateTitle>
					<EmptyStateDescription>
						Start a conversation by sending a message to your contacts.
					</EmptyStateDescription>
				</EmptyStateContent>
				<EmptyStateFooter>
					<ButtonRoot variant="primary">New message</ButtonRoot>
				</EmptyStateFooter>
			</EmptyStateRoot>
		</div>
	),
}
