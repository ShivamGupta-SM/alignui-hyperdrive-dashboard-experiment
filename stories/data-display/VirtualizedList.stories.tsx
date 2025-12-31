import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { VirtualizedList, VirtualizedGrid } from "@/components/ui/data-display/virtualized-list"
import { User, Envelope, Phone, MapPin, Star, Heart, ShoppingCart } from "@phosphor-icons/react"

const meta: Meta<typeof VirtualizedList> = {
	title: "DataDisplay/VirtualizedList",
	component: VirtualizedList,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof VirtualizedList>

// Generate sample data
const generateUsers = (count: number) =>
	Array.from({ length: count }, (_, i) => ({
		id: i + 1,
		name: `User ${i + 1}`,
		email: `user${i + 1}@example.com`,
		role: ["Admin", "Editor", "Viewer"][i % 3],
	}))

const generateProducts = (count: number) =>
	Array.from({ length: count }, (_, i) => ({
		id: i + 1,
		name: `Product ${i + 1}`,
		price: Math.floor(Math.random() * 1000) + 10,
		category: ["Electronics", "Clothing", "Food", "Books"][i % 4],
		rating: (Math.random() * 2 + 3).toFixed(1),
	}))

// Basic list
export const Basic: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-lg overflow-hidden">
			<VirtualizedList
				items={generateUsers(100)}
				height={400}
				estimatedItemHeight={60}
				renderItem={(user) => (
					<div className="p-4 border-b border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-full bg-primary-base/10 flex items-center justify-center">
								<User className="size-5 text-primary-base" />
							</div>
							<div>
								<p className="text-label-sm text-text-strong-950">{user.name}</p>
								<p className="text-paragraph-xs text-text-sub-600">{user.email}</p>
							</div>
						</div>
					</div>
				)}
			/>
		</div>
	),
}

// With custom gap
export const WithGap: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-lg overflow-hidden p-2">
			<VirtualizedList
				items={generateUsers(50)}
				height={400}
				estimatedItemHeight={72}
				gap={8}
				renderItem={(user) => (
					<div className="p-4 bg-bg-white-0 border border-stroke-soft-200 rounded-lg shadow-sm">
						<div className="flex items-center gap-3">
							<div className="size-10 rounded-full bg-success-base/10 flex items-center justify-center">
								<User className="size-5 text-success-base" />
							</div>
							<div>
								<p className="text-label-sm text-text-strong-950">{user.name}</p>
								<p className="text-paragraph-xs text-text-sub-600">{user.role}</p>
							</div>
						</div>
					</div>
				)}
			/>
		</div>
	),
}

// Empty state
export const EmptyState: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-lg overflow-hidden">
			<VirtualizedList
				items={[]}
				height={300}
				estimatedItemHeight={60}
				renderItem={() => null}
				emptyState={
					<div className="flex flex-col items-center justify-center h-full py-12">
						<User className="size-12 text-text-soft-400 mb-4" />
						<p className="text-label-md text-text-strong-950 mb-1">No users found</p>
						<p className="text-paragraph-sm text-text-sub-600">Try adjusting your filters</p>
					</div>
				}
			/>
		</div>
	),
}

// Loading state
export const LoadingState: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-lg overflow-hidden">
			<VirtualizedList
				items={[]}
				height={300}
				estimatedItemHeight={60}
				renderItem={() => null}
				isLoading
			/>
		</div>
	),
}

// Large dataset
export const LargeDataset: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-lg overflow-hidden">
			<div className="p-3 bg-bg-weak-50 border-b border-stroke-soft-200">
				<p className="text-label-sm text-text-strong-950">10,000 Items</p>
				<p className="text-paragraph-xs text-text-sub-600">Smoothly scroll through all items</p>
			</div>
			<VirtualizedList
				items={generateUsers(10000)}
				height={400}
				estimatedItemHeight={50}
				renderItem={(user, index) => (
					<div className="px-4 py-3 border-b border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<span className="text-paragraph-xs text-text-soft-400 w-12">#{index + 1}</span>
								<p className="text-label-sm text-text-strong-950">{user.name}</p>
							</div>
							<span className="text-paragraph-xs text-text-sub-600">{user.role}</span>
						</div>
					</div>
				)}
			/>
		</div>
	),
}

// Variable height items
export const VariableHeight: Story = {
	render: () => {
		const messages = Array.from({ length: 100 }, (_, i) => ({
			id: i + 1,
			sender: `User ${(i % 5) + 1}`,
			content: i % 3 === 0
				? "Short message"
				: i % 3 === 1
					? "This is a medium length message that spans across multiple lines and contains more content."
					: "This is a very long message that contains a lot of text. It demonstrates how the virtualized list handles items with variable heights. The list will automatically measure and adjust for different item sizes.",
			time: `${9 + (i % 12)}:${String(i % 60).padStart(2, "0")} AM`,
		}))

		return (
			<div className="w-96 border border-stroke-soft-200 rounded-lg overflow-hidden">
				<VirtualizedList
					items={messages}
					height={400}
					estimatedItemHeight={80}
					renderItem={(message) => (
						<div className="p-4 border-b border-stroke-soft-200">
							<div className="flex items-start justify-between mb-1">
								<p className="text-label-sm text-text-strong-950">{message.sender}</p>
								<span className="text-paragraph-xs text-text-soft-400">{message.time}</span>
							</div>
							<p className="text-paragraph-sm text-text-sub-600">{message.content}</p>
						</div>
					)}
				/>
			</div>
		)
	},
}

// Grid layout
export const GridLayout: Story = {
	render: () => (
		<div className="w-[600px] border border-stroke-soft-200 rounded-lg overflow-hidden">
			<VirtualizedGrid
				items={generateProducts(100)}
				height={500}
				columns={3}
				estimatedItemHeight={180}
				gap={12}
				renderItem={(product) => (
					<div className="p-4 bg-bg-white-0 border border-stroke-soft-200 rounded-lg">
						<div className="h-20 bg-bg-weak-50 rounded-md mb-3 flex items-center justify-center">
							<ShoppingCart className="size-8 text-text-soft-400" />
						</div>
						<p className="text-label-sm text-text-strong-950 mb-1 truncate">{product.name}</p>
						<p className="text-paragraph-xs text-text-sub-600 mb-2">{product.category}</p>
						<div className="flex items-center justify-between">
							<span className="text-label-sm text-primary-base">${product.price}</span>
							<div className="flex items-center gap-1">
								<Star className="size-3 text-warning-base" weight="fill" />
								<span className="text-paragraph-xs text-text-sub-600">{product.rating}</span>
							</div>
						</div>
					</div>
				)}
			/>
		</div>
	),
}

// Grid with 2 columns
export const GridTwoColumns: Story = {
	render: () => (
		<div className="w-96 border border-stroke-soft-200 rounded-lg overflow-hidden p-3">
			<VirtualizedGrid
				items={generateProducts(50)}
				height={400}
				columns={2}
				estimatedItemHeight={160}
				gap={8}
				renderItem={(product) => (
					<div className="p-3 bg-bg-white-0 border border-stroke-soft-200 rounded-lg">
						<div className="h-16 bg-bg-weak-50 rounded-md mb-2 flex items-center justify-center">
							<ShoppingCart className="size-6 text-text-soft-400" />
						</div>
						<p className="text-label-xs text-text-strong-950 truncate">{product.name}</p>
						<p className="text-label-sm text-primary-base mt-1">${product.price}</p>
					</div>
				)}
			/>
		</div>
	),
}

// Contact list example
export const ContactListExample: Story = {
	render: () => {
		const contacts = Array.from({ length: 200 }, (_, i) => ({
			id: i + 1,
			name: `Contact ${i + 1}`,
			phone: `+1 555-${String(i).padStart(4, "0")}`,
			email: `contact${i + 1}@example.com`,
			location: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][i % 5],
			isFavorite: i % 7 === 0,
		}))

		return (
			<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
					<h3 className="text-label-md text-text-strong-950">Contacts</h3>
					<p className="text-paragraph-sm text-text-sub-600">{contacts.length} contacts</p>
				</div>
				<VirtualizedList
					items={contacts}
					height={400}
					estimatedItemHeight={80}
					renderItem={(contact) => (
						<div className="p-4 border-b border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors">
							<div className="flex items-start gap-3">
								<div className="size-10 rounded-full bg-primary-base/10 flex items-center justify-center shrink-0">
									<User className="size-5 text-primary-base" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-label-sm text-text-strong-950">{contact.name}</p>
										{contact.isFavorite && (
											<Heart className="size-4 text-error-base" weight="fill" />
										)}
									</div>
									<div className="flex items-center gap-2 mt-1">
										<Phone className="size-3 text-text-soft-400" />
										<span className="text-paragraph-xs text-text-sub-600">{contact.phone}</span>
									</div>
									<div className="flex items-center gap-2 mt-0.5">
										<MapPin className="size-3 text-text-soft-400" />
										<span className="text-paragraph-xs text-text-sub-600">{contact.location}</span>
									</div>
								</div>
							</div>
						</div>
					)}
				/>
			</div>
		)
	},
}

// Email inbox example
export const EmailInboxExample: Story = {
	render: () => {
		const emails = Array.from({ length: 500 }, (_, i) => ({
			id: i + 1,
			from: `sender${(i % 20) + 1}@example.com`,
			subject: [
				"Meeting tomorrow at 10am",
				"Project update needed",
				"Quick question about the report",
				"Invitation to company event",
				"Your order has shipped",
				"Weekly newsletter",
				"Action required: Review document",
				"Thank you for your purchase",
			][i % 8],
			preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			time: i < 10 ? `${i + 1}m ago` : i < 24 ? `${i}h ago` : `${Math.floor(i / 24)}d ago`,
			isRead: i > 5,
			isStarred: i % 10 === 0,
		}))

		return (
			<div className="w-[500px] border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200 flex items-center justify-between">
					<div>
						<h3 className="text-label-md text-text-strong-950">Inbox</h3>
						<p className="text-paragraph-sm text-text-sub-600">{emails.filter(e => !e.isRead).length} unread</p>
					</div>
					<Envelope className="size-5 text-text-sub-600" />
				</div>
				<VirtualizedList
					items={emails}
					height={450}
					estimatedItemHeight={90}
					renderItem={(email) => (
						<div className={`p-4 border-b border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors ${!email.isRead ? "bg-primary-base/5" : ""}`}>
							<div className="flex items-start gap-3">
								<div className="flex flex-col items-center gap-1 pt-1">
									{!email.isRead && (
										<div className="size-2 rounded-full bg-primary-base" />
									)}
									{email.isStarred && (
										<Star className="size-4 text-warning-base" weight="fill" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-1">
										<p className={`text-label-sm truncate ${!email.isRead ? "text-text-strong-950" : "text-text-sub-600"}`}>
											{email.from}
										</p>
										<span className="text-paragraph-xs text-text-soft-400 shrink-0 ml-2">{email.time}</span>
									</div>
									<p className={`text-paragraph-sm truncate ${!email.isRead ? "text-text-strong-950" : "text-text-sub-600"}`}>
										{email.subject}
									</p>
									<p className="text-paragraph-xs text-text-soft-400 truncate mt-0.5">
										{email.preview}
									</p>
								</div>
							</div>
						</div>
					)}
				/>
			</div>
		)
	},
}

// Product catalog grid
export const ProductCatalogExample: Story = {
	render: () => {
		const products = Array.from({ length: 200 }, (_, i) => ({
			id: i + 1,
			name: ["Wireless Headphones", "Smart Watch", "Laptop Stand", "USB-C Hub", "Mechanical Keyboard", "Gaming Mouse", "Monitor Light", "Webcam HD"][i % 8],
			price: [99, 249, 49, 79, 149, 69, 39, 89][i % 8],
			originalPrice: [129, 299, 69, 99, 179, 89, 49, 109][i % 8],
			rating: (4 + Math.random()).toFixed(1),
			reviews: Math.floor(Math.random() * 500) + 10,
			isNew: i < 8,
			isSale: i % 5 === 0,
		}))

		return (
			<div className="w-[700px] border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
					<h3 className="text-label-md text-text-strong-950">Product Catalog</h3>
					<p className="text-paragraph-sm text-text-sub-600">{products.length} products</p>
				</div>
				<div className="p-4">
					<VirtualizedGrid
						items={products}
						height={500}
						columns={4}
						estimatedItemHeight={220}
						gap={16}
						renderItem={(product) => (
							<div className="p-3 bg-bg-white-0 border border-stroke-soft-200 rounded-lg hover:shadow-md transition-shadow">
								<div className="relative h-24 bg-bg-weak-50 rounded-md mb-3 flex items-center justify-center">
									<ShoppingCart className="size-8 text-text-soft-400" />
									{product.isNew && (
										<span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary-base text-white rounded">
											NEW
										</span>
									)}
									{product.isSale && (
										<span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-medium bg-error-base text-white rounded">
											SALE
										</span>
									)}
								</div>
								<p className="text-label-xs text-text-strong-950 truncate mb-1">{product.name}</p>
								<div className="flex items-center gap-1 mb-2">
									<Star className="size-3 text-warning-base" weight="fill" />
									<span className="text-paragraph-xs text-text-sub-600">{product.rating}</span>
									<span className="text-paragraph-xs text-text-soft-400">({product.reviews})</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-label-sm text-text-strong-950">${product.price}</span>
									{product.isSale && (
										<span className="text-paragraph-xs text-text-soft-400 line-through">${product.originalPrice}</span>
									)}
								</div>
							</div>
						)}
					/>
				</div>
			</div>
		)
	},
}

// Interactive selection
export const InteractiveSelection: Story = {
	render: function InteractiveSelectionDemo() {
		const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
		const users = generateUsers(100)

		const toggleSelection = (id: number) => {
			setSelectedIds((prev) => {
				const next = new Set(prev)
				if (next.has(id)) {
					next.delete(id)
				} else {
					next.add(id)
				}
				return next
			})
		}

		return (
			<div className="w-96 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-4 bg-bg-weak-50 border-b border-stroke-soft-200 flex items-center justify-between">
					<div>
						<h3 className="text-label-md text-text-strong-950">Select Users</h3>
						<p className="text-paragraph-sm text-text-sub-600">{selectedIds.size} selected</p>
					</div>
					{selectedIds.size > 0 && (
						<button
							onClick={() => setSelectedIds(new Set())}
							className="text-paragraph-sm text-primary-base hover:underline"
						>
							Clear all
						</button>
					)}
				</div>
				<VirtualizedList
					items={users}
					height={400}
					estimatedItemHeight={56}
					renderItem={(user) => {
						const isSelected = selectedIds.has(user.id)
						return (
							<div
								onClick={() => toggleSelection(user.id)}
								className={`p-4 border-b border-stroke-soft-200 cursor-pointer transition-colors ${
									isSelected ? "bg-primary-base/10" : "hover:bg-bg-weak-50"
								}`}
							>
								<div className="flex items-center gap-3">
									<div className={`size-5 rounded border-2 flex items-center justify-center transition-colors ${
										isSelected ? "bg-primary-base border-primary-base" : "border-stroke-soft-200"
									}`}>
										{isSelected && (
											<svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
											</svg>
										)}
									</div>
									<div>
										<p className="text-label-sm text-text-strong-950">{user.name}</p>
										<p className="text-paragraph-xs text-text-sub-600">{user.email}</p>
									</div>
								</div>
							</div>
						)
					}}
				/>
			</div>
		)
	},
}
