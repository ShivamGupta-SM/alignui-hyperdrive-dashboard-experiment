import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as SegmentedControlRoot,
	List as SegmentedControlList,
	Trigger as SegmentedControlTrigger,
	Content as SegmentedControlContent,
} from "@/components/ui/primitives/segmented-control"
import { List, GridFour, Rows, CalendarBlank, ChartBar, Users } from "@phosphor-icons/react"

const meta: Meta<typeof SegmentedControlRoot> = {
	title: "Primitives/SegmentedControl",
	component: SegmentedControlRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof SegmentedControlRoot>

// Basic segmented control
export const Basic: Story = {
	render: () => (
		<SegmentedControlRoot defaultValue="all">
			<SegmentedControlList>
				<SegmentedControlTrigger value="all">All</SegmentedControlTrigger>
				<SegmentedControlTrigger value="active">Active</SegmentedControlTrigger>
				<SegmentedControlTrigger value="archived">Archived</SegmentedControlTrigger>
			</SegmentedControlList>
		</SegmentedControlRoot>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<SegmentedControlRoot defaultValue="list">
			<SegmentedControlList>
				<SegmentedControlTrigger value="list">
					<List className="size-4" />
					List
				</SegmentedControlTrigger>
				<SegmentedControlTrigger value="grid">
					<GridFour className="size-4" />
					Grid
				</SegmentedControlTrigger>
				<SegmentedControlTrigger value="rows">
					<Rows className="size-4" />
					Rows
				</SegmentedControlTrigger>
			</SegmentedControlList>
		</SegmentedControlRoot>
	),
}

// Icons only
export const IconsOnly: Story = {
	render: () => (
		<SegmentedControlRoot defaultValue="list">
			<SegmentedControlList>
				<SegmentedControlTrigger value="list" aria-label="List view">
					<List className="size-5" />
				</SegmentedControlTrigger>
				<SegmentedControlTrigger value="grid" aria-label="Grid view">
					<GridFour className="size-5" />
				</SegmentedControlTrigger>
				<SegmentedControlTrigger value="rows" aria-label="Rows view">
					<Rows className="size-5" />
				</SegmentedControlTrigger>
			</SegmentedControlList>
		</SegmentedControlRoot>
	),
}

// Two options
export const TwoOptions: Story = {
	render: () => (
		<SegmentedControlRoot defaultValue="monthly">
			<SegmentedControlList>
				<SegmentedControlTrigger value="monthly">Monthly</SegmentedControlTrigger>
				<SegmentedControlTrigger value="yearly">Yearly</SegmentedControlTrigger>
			</SegmentedControlList>
		</SegmentedControlRoot>
	),
}

// Four options
export const FourOptions: Story = {
	render: () => (
		<SegmentedControlRoot defaultValue="day">
			<SegmentedControlList>
				<SegmentedControlTrigger value="day">Day</SegmentedControlTrigger>
				<SegmentedControlTrigger value="week">Week</SegmentedControlTrigger>
				<SegmentedControlTrigger value="month">Month</SegmentedControlTrigger>
				<SegmentedControlTrigger value="year">Year</SegmentedControlTrigger>
			</SegmentedControlList>
		</SegmentedControlRoot>
	),
}

// With content panels
export const WithContentPanels: Story = {
	render: () => (
		<div className="w-96">
			<SegmentedControlRoot defaultValue="overview">
				<SegmentedControlList className="mb-4">
					<SegmentedControlTrigger value="overview">
						<ChartBar className="size-4" />
						Overview
					</SegmentedControlTrigger>
					<SegmentedControlTrigger value="calendar">
						<CalendarBlank className="size-4" />
						Calendar
					</SegmentedControlTrigger>
					<SegmentedControlTrigger value="team">
						<Users className="size-4" />
						Team
					</SegmentedControlTrigger>
				</SegmentedControlList>
				<SegmentedControlContent value="overview" className="p-4 rounded-lg bg-bg-weak-50">
					<h3 className="text-label-md text-text-strong-950 mb-2">Overview</h3>
					<p className="text-paragraph-sm text-text-sub-600">
						View your analytics and performance metrics.
					</p>
				</SegmentedControlContent>
				<SegmentedControlContent value="calendar" className="p-4 rounded-lg bg-bg-weak-50">
					<h3 className="text-label-md text-text-strong-950 mb-2">Calendar</h3>
					<p className="text-paragraph-sm text-text-sub-600">
						Manage your schedule and upcoming events.
					</p>
				</SegmentedControlContent>
				<SegmentedControlContent value="team" className="p-4 rounded-lg bg-bg-weak-50">
					<h3 className="text-label-md text-text-strong-950 mb-2">Team</h3>
					<p className="text-paragraph-sm text-text-sub-600">
						View and manage your team members.
					</p>
				</SegmentedControlContent>
			</SegmentedControlRoot>
		</div>
	),
}

// Pricing toggle example
export const PricingToggle: Story = {
	render: () => (
		<div className="flex flex-col items-center gap-6">
			<SegmentedControlRoot defaultValue="monthly">
				<SegmentedControlList>
					<SegmentedControlTrigger value="monthly">Monthly</SegmentedControlTrigger>
					<SegmentedControlTrigger value="yearly">
						Yearly
						<span className="ml-1 text-xs text-success-base">-20%</span>
					</SegmentedControlTrigger>
				</SegmentedControlList>
			</SegmentedControlRoot>
			<div className="grid grid-cols-3 gap-4">
				<div className="p-4 rounded-xl border border-stroke-soft-200">
					<h4 className="text-label-md text-text-strong-950">Basic</h4>
					<p className="text-heading-lg text-text-strong-950 mt-2">$9/mo</p>
				</div>
				<div className="p-4 rounded-xl border-2 border-primary-base bg-primary-lighter">
					<h4 className="text-label-md text-primary-base">Pro</h4>
					<p className="text-heading-lg text-text-strong-950 mt-2">$29/mo</p>
				</div>
				<div className="p-4 rounded-xl border border-stroke-soft-200">
					<h4 className="text-label-md text-text-strong-950">Enterprise</h4>
					<p className="text-heading-lg text-text-strong-950 mt-2">$99/mo</p>
				</div>
			</div>
		</div>
	),
}

// View switcher example
export const ViewSwitcher: Story = {
	render: () => (
		<div className="w-full max-w-2xl">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-heading-sm text-text-strong-950">Projects</h2>
				<SegmentedControlRoot defaultValue="grid">
					<SegmentedControlList>
						<SegmentedControlTrigger value="grid" aria-label="Grid view">
							<GridFour className="size-4" />
						</SegmentedControlTrigger>
						<SegmentedControlTrigger value="list" aria-label="List view">
							<List className="size-4" />
						</SegmentedControlTrigger>
					</SegmentedControlList>
				</SegmentedControlRoot>
			</div>
			<div className="grid grid-cols-3 gap-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div key={i} className="p-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
						<div className="h-20 rounded-lg bg-bg-weak-50 mb-3" />
						<p className="text-label-sm text-text-strong-950">Project {i}</p>
						<p className="text-paragraph-xs text-text-sub-600">Updated 2 days ago</p>
					</div>
				))}
			</div>
		</div>
	),
}

// Full width
export const FullWidth: Story = {
	render: () => (
		<div className="w-96">
			<SegmentedControlRoot defaultValue="all">
				<SegmentedControlList className="w-full">
					<SegmentedControlTrigger value="all">All</SegmentedControlTrigger>
					<SegmentedControlTrigger value="pending">Pending</SegmentedControlTrigger>
					<SegmentedControlTrigger value="completed">Completed</SegmentedControlTrigger>
				</SegmentedControlList>
			</SegmentedControlRoot>
		</div>
	),
}

// Filter tabs example
export const FilterTabs: Story = {
	render: () => (
		<div className="w-full max-w-md">
			<SegmentedControlRoot defaultValue="all">
				<SegmentedControlList>
					<SegmentedControlTrigger value="all">
						All
						<span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-bg-soft-200">42</span>
					</SegmentedControlTrigger>
					<SegmentedControlTrigger value="unread">
						Unread
						<span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-error-base text-static-white">5</span>
					</SegmentedControlTrigger>
					<SegmentedControlTrigger value="starred">
						Starred
						<span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-bg-soft-200">12</span>
					</SegmentedControlTrigger>
				</SegmentedControlList>
			</SegmentedControlRoot>
		</div>
	),
}
