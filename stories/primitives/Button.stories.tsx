import type { Meta, StoryObj } from "@storybook/react"
import { ButtonRoot, ButtonIcon } from "@/components/ui/primitives"
import { ArrowRight, Plus, Check, Trash } from "@phosphor-icons/react"

const meta: Meta<typeof ButtonRoot> = {
	title: "Primitives/Button",
	component: ButtonRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "neutral", "error", "basic", "ghost"],
			description: "Visual style variant of the button",
		},
		size: {
			control: "select",
			options: ["medium", "small", "xsmall", "xxsmall"],
			description: "Size of the button",
		},
		disabled: {
			control: "boolean",
			description: "Whether the button is disabled",
		},
		isLoading: {
			control: "boolean",
			description: "Whether the button is in loading state",
		},
		loadingText: {
			control: "text",
			description: "Text to show when loading",
		},
	},
}

export default meta
type Story = StoryObj<typeof ButtonRoot>

// Basic variants
export const Primary: Story = {
	args: {
		variant: "primary",
		children: "Primary Button",
	},
}

export const Neutral: Story = {
	args: {
		variant: "neutral",
		children: "Neutral Button",
	},
}

export const Error: Story = {
	args: {
		variant: "error",
		children: "Error Button",
	},
}

export const Basic: Story = {
	args: {
		variant: "basic",
		children: "Basic Button",
	},
}

export const Ghost: Story = {
	args: {
		variant: "ghost",
		children: "Ghost Button",
	},
}

// Size variants
export const Medium: Story = {
	args: {
		size: "medium",
		children: "Medium Size",
	},
}

export const Small: Story = {
	args: {
		size: "small",
		children: "Small Size",
	},
}

export const XSmall: Story = {
	args: {
		size: "xsmall",
		children: "XSmall Size",
	},
}

export const XXSmall: Story = {
	args: {
		size: "xxsmall",
		children: "XXSmall",
	},
}

// With Icons
export const WithLeadingIcon: Story = {
	render: (args) => (
		<ButtonRoot {...args}>
			<ButtonIcon>
				<Plus className="size-5" />
			</ButtonIcon>
			Add Item
		</ButtonRoot>
	),
	args: {
		variant: "primary",
	},
}

export const WithTrailingIcon: Story = {
	render: (args) => (
		<ButtonRoot {...args}>
			Continue
			<ButtonIcon>
				<ArrowRight className="size-5" />
			</ButtonIcon>
		</ButtonRoot>
	),
	args: {
		variant: "primary",
	},
}

export const IconOnly: Story = {
	render: (args) => (
		<ButtonRoot {...args}>
			<ButtonIcon>
				<Plus className="size-5" />
			</ButtonIcon>
		</ButtonRoot>
	),
	args: {
		variant: "primary",
		size: "medium",
	},
}

// States
export const Loading: Story = {
	args: {
		isLoading: true,
		loadingText: "Saving...",
	},
}

export const Disabled: Story = {
	args: {
		disabled: true,
		children: "Disabled Button",
	},
}

// All variants showcase
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2 items-center">
				<ButtonRoot variant="primary">Primary</ButtonRoot>
				<ButtonRoot variant="neutral">Neutral</ButtonRoot>
				<ButtonRoot variant="error">Error</ButtonRoot>
				<ButtonRoot variant="basic">Basic</ButtonRoot>
				<ButtonRoot variant="ghost">Ghost</ButtonRoot>
			</div>
			<div className="flex gap-2 items-center">
				<ButtonRoot size="medium">Medium</ButtonRoot>
				<ButtonRoot size="small">Small</ButtonRoot>
				<ButtonRoot size="xsmall">XSmall</ButtonRoot>
				<ButtonRoot size="xxsmall">XXSmall</ButtonRoot>
			</div>
			<div className="flex gap-2 items-center">
				<ButtonRoot isLoading loadingText="Loading...">
					Loading
				</ButtonRoot>
				<ButtonRoot disabled>Disabled</ButtonRoot>
			</div>
		</div>
	),
}

// Real-world examples
export const SaveButton: Story = {
	render: () => (
		<ButtonRoot variant="primary">
			<ButtonIcon>
				<Check className="size-5" />
			</ButtonIcon>
			Save Changes
		</ButtonRoot>
	),
}

export const DeleteButton: Story = {
	render: () => (
		<ButtonRoot variant="error">
			<ButtonIcon>
				<Trash className="size-5" />
			</ButtonIcon>
			Delete
		</ButtonRoot>
	),
}
