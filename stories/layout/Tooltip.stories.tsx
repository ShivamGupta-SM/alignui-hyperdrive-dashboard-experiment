import type { Meta, StoryObj } from "@storybook/react"
import {
	TooltipProvider,
	TooltipRoot,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/layout"
import { ButtonRoot } from "@/components/ui/primitives"
import { Info, Question, Warning } from "@phosphor-icons/react"

const meta: Meta<typeof TooltipRoot> = {
	title: "Layout/Tooltip",
	component: TooltipRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
}

export default meta
type Story = StoryObj<typeof TooltipRoot>

// Basic tooltip
export const Basic: Story = {
	render: () => (
		<TooltipRoot>
			<TooltipTrigger asChild>
				<ButtonRoot variant="basic">Hover me</ButtonRoot>
			</TooltipTrigger>
			<TooltipContent>
				This is a tooltip
			</TooltipContent>
		</TooltipRoot>
	),
}

// With icon trigger
export const WithIcon: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<span className="text-paragraph-sm text-text-sub-600">What is this?</span>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<button className="text-text-soft-400 hover:text-text-sub-600 transition-colors">
						<Question className="size-4" weight="fill" />
					</button>
				</TooltipTrigger>
				<TooltipContent>
					This provides additional information about the feature.
				</TooltipContent>
			</TooltipRoot>
		</div>
	),
}

// Different positions
export const Positions: Story = {
	render: () => (
		<div className="flex gap-4">
			<TooltipRoot>
				<TooltipTrigger asChild>
					<ButtonRoot variant="basic" size="small">Top</ButtonRoot>
				</TooltipTrigger>
				<TooltipContent side="top">Tooltip on top</TooltipContent>
			</TooltipRoot>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<ButtonRoot variant="basic" size="small">Right</ButtonRoot>
				</TooltipTrigger>
				<TooltipContent side="right">Tooltip on right</TooltipContent>
			</TooltipRoot>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<ButtonRoot variant="basic" size="small">Bottom</ButtonRoot>
				</TooltipTrigger>
				<TooltipContent side="bottom">Tooltip on bottom</TooltipContent>
			</TooltipRoot>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<ButtonRoot variant="basic" size="small">Left</ButtonRoot>
				</TooltipTrigger>
				<TooltipContent side="left">Tooltip on left</TooltipContent>
			</TooltipRoot>
		</div>
	),
}

// Info tooltip
export const InfoTooltip: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<label className="text-label-sm text-text-strong-950">API Key</label>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<button className="text-information-base hover:text-information-dark transition-colors">
						<Info className="size-4" weight="fill" />
					</button>
				</TooltipTrigger>
				<TooltipContent className="max-w-[200px]">
					Your API key is used to authenticate requests. Keep it secret and never share it publicly.
				</TooltipContent>
			</TooltipRoot>
		</div>
	),
}

// Warning tooltip
export const WarningTooltip: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<span className="text-paragraph-sm text-text-sub-600">Danger zone</span>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<button className="text-warning-base hover:text-warning-dark transition-colors">
						<Warning className="size-4" weight="fill" />
					</button>
				</TooltipTrigger>
				<TooltipContent className="max-w-[200px]">
					Actions in this section are irreversible. Please proceed with caution.
				</TooltipContent>
			</TooltipRoot>
		</div>
	),
}

// Multiple tooltips
export const MultipleTooltips: Story = {
	render: () => (
		<div className="flex gap-8">
			<TooltipRoot>
				<TooltipTrigger asChild>
					<ButtonRoot variant="primary" size="small">
						Save
					</ButtonRoot>
				</TooltipTrigger>
				<TooltipContent>Save your changes (Ctrl+S)</TooltipContent>
			</TooltipRoot>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<ButtonRoot variant="basic" size="small">
						Preview
					</ButtonRoot>
				</TooltipTrigger>
				<TooltipContent>Preview in new tab (Ctrl+P)</TooltipContent>
			</TooltipRoot>
			<TooltipRoot>
				<TooltipTrigger asChild>
					<ButtonRoot variant="ghost" size="small">
						Share
					</ButtonRoot>
				</TooltipTrigger>
				<TooltipContent>Share with team members</TooltipContent>
			</TooltipRoot>
		</div>
	),
}
