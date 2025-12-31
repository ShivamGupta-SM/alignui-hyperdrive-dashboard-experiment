import type { Meta, StoryObj } from "@storybook/react"
import {
	CardRoot,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/data-display"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof CardRoot> = {
	title: "Data Display/Card",
	component: CardRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "elevated", "ghost", "outlined"],
			description: "Visual style variant",
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Padding size of the card",
		},
		interactive: {
			control: "boolean",
			description: "Whether the card has hover effects",
		},
	},
}

export default meta
type Story = StoryObj<typeof CardRoot>

// Basic card
export const Basic: Story = {
	render: (args) => (
		<CardRoot {...args} className="w-80">
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					This is a basic card with a title and description content.
				</CardDescription>
			</CardContent>
		</CardRoot>
	),
	args: {
		variant: "default",
		size: "md",
	},
}

// All variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex gap-4">
			<CardRoot variant="default" className="w-48">
				<CardHeader>
					<CardTitle>Default</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>Border style</CardDescription>
				</CardContent>
			</CardRoot>
			<CardRoot variant="elevated" className="w-48">
				<CardHeader>
					<CardTitle>Elevated</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>Shadow style</CardDescription>
				</CardContent>
			</CardRoot>
			<CardRoot variant="outlined" className="w-48">
				<CardHeader>
					<CardTitle>Outlined</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>Thick border</CardDescription>
				</CardContent>
			</CardRoot>
			<CardRoot variant="ghost" className="w-48">
				<CardHeader>
					<CardTitle>Ghost</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>No background</CardDescription>
				</CardContent>
			</CardRoot>
		</div>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex gap-4 items-start">
			<CardRoot size="sm" className="w-48">
				<CardHeader>
					<CardTitle>Small</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>Compact padding</CardDescription>
				</CardContent>
			</CardRoot>
			<CardRoot size="md" className="w-48">
				<CardHeader>
					<CardTitle>Medium</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>Default padding</CardDescription>
				</CardContent>
			</CardRoot>
			<CardRoot size="lg" className="w-48">
				<CardHeader>
					<CardTitle>Large</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>Spacious padding</CardDescription>
				</CardContent>
			</CardRoot>
		</div>
	),
}

// Interactive card
export const Interactive: Story = {
	render: () => (
		<CardRoot interactive className="w-80">
			<CardHeader>
				<CardTitle>Interactive Card</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription>
					Hover over this card to see the interactive effects.
				</CardDescription>
			</CardContent>
		</CardRoot>
	),
}

// With footer
export const WithFooter: Story = {
	render: () => (
		<CardRoot className="w-96">
			<CardHeader>
				<div>
					<CardTitle>Subscription Plan</CardTitle>
					<CardDescription>Manage your subscription</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-paragraph-md text-text-strong-950">
					You are currently on the <strong>Pro Plan</strong> at $29/month.
				</p>
			</CardContent>
			<CardFooter className="gap-2">
				<ButtonRoot variant="basic" size="small">
					Cancel
				</ButtonRoot>
				<ButtonRoot variant="primary" size="small">
					Upgrade
				</ButtonRoot>
			</CardFooter>
		</CardRoot>
	),
}

// Stats card
export const StatsCard: Story = {
	render: () => (
		<CardRoot variant="elevated" className="w-64">
			<CardHeader>
				<CardDescription>Total Revenue</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-baseline gap-2">
					<span className="text-title-h4 text-text-strong-950">$45,231</span>
					<span className="text-label-sm text-success-base">+20.1%</span>
				</div>
			</CardContent>
			<CardFooter>
				<CardDescription>+$5,230 from last month</CardDescription>
			</CardFooter>
		</CardRoot>
	),
}

// Profile card
export const ProfileCard: Story = {
	render: () => (
		<CardRoot variant="elevated" className="w-80">
			<CardContent className="flex flex-col items-center text-center">
				<div className="size-20 rounded-full bg-primary-base mb-4 flex items-center justify-center text-static-white text-title-h5">
					JD
				</div>
				<CardTitle>John Doe</CardTitle>
				<CardDescription>Software Engineer</CardDescription>
				<p className="text-paragraph-sm text-text-sub-600 mt-3">
					Building amazing products with React and TypeScript.
				</p>
			</CardContent>
			<CardFooter className="justify-center gap-2">
				<ButtonRoot variant="basic" size="small">
					Message
				</ButtonRoot>
				<ButtonRoot variant="primary" size="small">
					Follow
				</ButtonRoot>
			</CardFooter>
		</CardRoot>
	),
}

// List of cards
export const CardList: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-96">
			{[
				{ title: "Project Alpha", status: "Active", progress: 75 },
				{ title: "Project Beta", status: "Pending", progress: 30 },
				{ title: "Project Gamma", status: "Completed", progress: 100 },
			].map((project) => (
				<CardRoot key={project.title} interactive>
					<CardContent className="flex items-center justify-between">
						<div>
							<CardTitle>{project.title}</CardTitle>
							<CardDescription>{project.status}</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-24 h-2 bg-bg-soft-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-primary-base rounded-full transition-all"
									style={{ width: `${project.progress}%` }}
								/>
							</div>
							<span className="text-label-xs text-text-sub-600">{project.progress}%</span>
						</div>
					</CardContent>
				</CardRoot>
			))}
		</div>
	),
}
