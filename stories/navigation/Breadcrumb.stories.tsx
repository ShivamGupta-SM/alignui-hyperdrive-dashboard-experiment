import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as BreadcrumbRoot,
	Item as BreadcrumbItem,
	Icon as BreadcrumbIcon,
	ArrowIcon as BreadcrumbArrowIcon,
} from "@/components/ui/navigation/breadcrumb"
import { House, CaretRight, Folder, File, Gear, Users, ChartLine } from "@phosphor-icons/react"

const meta: Meta<typeof BreadcrumbRoot> = {
	title: "Navigation/Breadcrumb",
	component: BreadcrumbRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof BreadcrumbRoot>

// Basic breadcrumb
export const Basic: Story = {
	render: () => (
		<BreadcrumbRoot>
			<BreadcrumbItem>
				<a href="#">Home</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem>
				<a href="#">Products</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem active>
				<span>Headphones</span>
			</BreadcrumbItem>
		</BreadcrumbRoot>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<BreadcrumbRoot>
			<BreadcrumbItem>
				<BreadcrumbIcon as={House} />
				<a href="#">Home</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem>
				<BreadcrumbIcon as={Folder} />
				<a href="#">Documents</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem active>
				<BreadcrumbIcon as={File} />
				<span>Report.pdf</span>
			</BreadcrumbItem>
		</BreadcrumbRoot>
	),
}

// Dashboard path
export const DashboardPath: Story = {
	render: () => (
		<BreadcrumbRoot>
			<BreadcrumbItem>
				<BreadcrumbIcon as={House} />
				<a href="#">Dashboard</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem>
				<BreadcrumbIcon as={Gear} />
				<a href="#">Settings</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem active>
				<BreadcrumbIcon as={Users} />
				<span>Team Members</span>
			</BreadcrumbItem>
		</BreadcrumbRoot>
	),
}

// Long path
export const LongPath: Story = {
	render: () => (
		<BreadcrumbRoot>
			<BreadcrumbItem>
				<a href="#">Home</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem>
				<a href="#">Category</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem>
				<a href="#">Subcategory</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem>
				<a href="#">Products</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem active>
				<span>Product Details</span>
			</BreadcrumbItem>
		</BreadcrumbRoot>
	),
}

// Icon only first item
export const IconOnlyHome: Story = {
	render: () => (
		<BreadcrumbRoot>
			<BreadcrumbItem>
				<a href="#" aria-label="Home">
					<BreadcrumbIcon as={House} />
				</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem>
				<a href="#">Analytics</a>
			</BreadcrumbItem>
			<BreadcrumbArrowIcon as={CaretRight} />
			<BreadcrumbItem active>
				<span>Monthly Report</span>
			</BreadcrumbItem>
		</BreadcrumbRoot>
	),
}

// E-commerce example
export const EcommerceExample: Story = {
	render: () => (
		<div className="w-[600px] p-4 border border-stroke-soft-200 rounded-lg bg-bg-white-0">
			<BreadcrumbRoot>
				<BreadcrumbItem>
					<a href="#">Shop</a>
				</BreadcrumbItem>
				<BreadcrumbArrowIcon as={CaretRight} />
				<BreadcrumbItem>
					<a href="#">Electronics</a>
				</BreadcrumbItem>
				<BreadcrumbArrowIcon as={CaretRight} />
				<BreadcrumbItem>
					<a href="#">Audio</a>
				</BreadcrumbItem>
				<BreadcrumbArrowIcon as={CaretRight} />
				<BreadcrumbItem>
					<a href="#">Headphones</a>
				</BreadcrumbItem>
				<BreadcrumbArrowIcon as={CaretRight} />
				<BreadcrumbItem active>
					<span>Sony WH-1000XM5</span>
				</BreadcrumbItem>
			</BreadcrumbRoot>
		</div>
	),
}

// Analytics dashboard
export const AnalyticsDashboard: Story = {
	render: () => (
		<div className="w-[600px] p-4 border border-stroke-soft-200 rounded-lg bg-bg-white-0">
			<BreadcrumbRoot>
				<BreadcrumbItem>
					<BreadcrumbIcon as={ChartLine} />
					<a href="#">Analytics</a>
				</BreadcrumbItem>
				<BreadcrumbArrowIcon as={CaretRight} />
				<BreadcrumbItem>
					<a href="#">Reports</a>
				</BreadcrumbItem>
				<BreadcrumbArrowIcon as={CaretRight} />
				<BreadcrumbItem>
					<a href="#">2024</a>
				</BreadcrumbItem>
				<BreadcrumbArrowIcon as={CaretRight} />
				<BreadcrumbItem active>
					<span>Q4 Performance</span>
				</BreadcrumbItem>
			</BreadcrumbRoot>
		</div>
	),
}
