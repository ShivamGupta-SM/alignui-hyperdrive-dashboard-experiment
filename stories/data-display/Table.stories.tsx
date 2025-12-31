import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as Table,
	Header as TableHeader,
	Body as TableBody,
	Head as TableHead,
	SortableHead as TableSortableHead,
	Row as TableRow,
	Cell as TableCell,
	Caption as TableCaption,
	Empty as TableEmpty,
	Loading as TableLoading,
	type SortDirection,
} from "@/components/ui/data-display/table"
import { Package, MagnifyingGlass } from "@phosphor-icons/react"

const meta: Meta<typeof Table> = {
	title: "Data Display/Table",
	component: Table,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Table>

// Sample data
const users = [
	{ id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Active" },
	{ id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Viewer", status: "Inactive" },
	{ id: 4, name: "Alice Brown", email: "alice@example.com", role: "Editor", status: "Active" },
	{ id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "Viewer", status: "Active" },
]

// Basic table
export const Basic: Story = {
	render: () => (
		<div className="w-[700px]">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.role}</TableCell>
							<TableCell>
								<span
									className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
										user.status === "Active"
											? "bg-success-lighter text-success-base"
											: "bg-bg-soft-200 text-text-sub-600"
									}`}
								>
									{user.status}
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	),
}

// With caption
export const WithCaption: Story = {
	render: () => (
		<div className="w-[700px]">
			<Table>
				<TableCaption>A list of recent users in your account</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.slice(0, 3).map((user) => (
						<TableRow key={user.id}>
							<TableCell>{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.role}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	),
}

// Sortable table
export const Sortable: Story = {
	render: function SortableTable() {
		const [sortColumn, setSortColumn] = useState<string | null>(null)
		const [sortDirection, setSortDirection] = useState<SortDirection>(null)
		const [data, setData] = useState(users)

		const handleSort = (column: string) => {
			let newDirection: SortDirection = "asc"
			if (sortColumn === column) {
				if (sortDirection === "asc") newDirection = "desc"
				else if (sortDirection === "desc") newDirection = null
			}

			setSortColumn(newDirection ? column : null)
			setSortDirection(newDirection)

			if (newDirection) {
				const sorted = [...users].sort((a, b) => {
					const aVal = a[column as keyof typeof a]
					const bVal = b[column as keyof typeof b]
					if (aVal < bVal) return newDirection === "asc" ? -1 : 1
					if (aVal > bVal) return newDirection === "asc" ? 1 : -1
					return 0
				})
				setData(sorted)
			} else {
				setData(users)
			}
		}

		return (
			<div className="w-[700px]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableSortableHead
								sortDirection={sortColumn === "name" ? sortDirection : null}
								onSort={() => handleSort("name")}
							>
								Name
							</TableSortableHead>
							<TableSortableHead
								sortDirection={sortColumn === "email" ? sortDirection : null}
								onSort={() => handleSort("email")}
							>
								Email
							</TableSortableHead>
							<TableSortableHead
								sortDirection={sortColumn === "role" ? sortDirection : null}
								onSort={() => handleSort("role")}
							>
								Role
							</TableSortableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((user) => (
							<TableRow key={user.id}>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell>{user.status}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
	},
}

// Empty state
export const Empty: Story = {
	render: () => (
		<div className="w-[700px]">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableEmpty
						colSpan={4}
						icon={<Package className="size-12" />}
						title="No users found"
						description="Get started by adding a new user to your team."
					/>
				</TableBody>
			</Table>
		</div>
	),
}

// Search empty state
export const SearchEmpty: Story = {
	render: () => (
		<div className="w-[700px]">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableEmpty
						colSpan={4}
						icon={<MagnifyingGlass className="size-12" />}
						title="No results found"
						description="Try adjusting your search or filter to find what you're looking for."
					/>
				</TableBody>
			</Table>
		</div>
	),
}

// Loading state
export const Loading: Story = {
	render: () => (
		<div className="w-[700px]">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableLoading rows={5} columns={4} />
			</Table>
		</div>
	),
}

// With selection
export const WithSelection: Story = {
	render: function SelectableTable() {
		const [selected, setSelected] = useState<number[]>([])

		const toggleSelect = (id: number) => {
			setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
		}

		const toggleAll = () => {
			setSelected((prev) => (prev.length === users.length ? [] : users.map((u) => u.id)))
		}

		return (
			<div className="w-[700px]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<input
									type="checkbox"
									checked={selected.length === users.length}
									onChange={toggleAll}
									className="rounded border-stroke-soft-200"
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow
								key={user.id}
								className={selected.includes(user.id) ? "bg-primary-alpha-10" : ""}
							>
								<TableCell>
									<input
										type="checkbox"
										checked={selected.includes(user.id)}
										onChange={() => toggleSelect(user.id)}
										className="rounded border-stroke-soft-200"
									/>
								</TableCell>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.role}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{selected.length > 0 && (
					<div className="mt-4 p-3 bg-primary-lighter rounded-lg text-label-sm text-primary-base">
						{selected.length} user{selected.length > 1 ? "s" : ""} selected
					</div>
				)}
			</div>
		)
	},
}

// Products table example
export const ProductsExample: Story = {
	render: () => {
		const products = [
			{ id: 1, name: "Wireless Headphones", sku: "WH-001", price: 99.99, stock: 150 },
			{ id: 2, name: "Bluetooth Speaker", sku: "BS-002", price: 49.99, stock: 75 },
			{ id: 3, name: "USB-C Hub", sku: "UH-003", price: 79.99, stock: 200 },
			{ id: 4, name: "Mechanical Keyboard", sku: "MK-004", price: 149.99, stock: 50 },
			{ id: 5, name: "Gaming Mouse", sku: "GM-005", price: 69.99, stock: 0 },
		]

		return (
			<div className="w-[800px]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Product</TableHead>
							<TableHead>SKU</TableHead>
							<TableHead className="text-right">Price</TableHead>
							<TableHead className="text-right">Stock</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product) => (
							<TableRow key={product.id}>
								<TableCell className="font-medium">{product.name}</TableCell>
								<TableCell className="text-text-sub-600">{product.sku}</TableCell>
								<TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
								<TableCell className="text-right">
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
											product.stock > 0
												? "bg-success-lighter text-success-base"
												: "bg-error-lighter text-error-base"
										}`}
									>
										{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
									</span>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
	},
}
