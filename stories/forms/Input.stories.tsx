import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as InputRoot,
	Wrapper as InputWrapper,
	El as InputEl,
	Icon as InputIcon,
	Affix as InputAffix,
	PasswordInput,
	SearchInput,
	NumberInput,
} from "@/components/ui/forms/input"
import { MagnifyingGlass, EnvelopeSimple, User, CurrencyDollar } from "@phosphor-icons/react"

const meta: Meta<typeof InputRoot> = {
	title: "Forms/Input",
	component: InputRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["medium", "small", "xsmall"],
			description: "Size of the input",
		},
		hasError: {
			control: "boolean",
			description: "Whether the input has an error state",
		},
	},
}

export default meta
type Story = StoryObj<typeof InputRoot>

// Basic input
export const Basic: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputWrapper>
				<InputEl placeholder="Enter text..." />
			</InputWrapper>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

// With leading icon
export const WithLeadingIcon: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputWrapper>
				<InputIcon as={EnvelopeSimple} />
				<InputEl placeholder="Email address" type="email" />
			</InputWrapper>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

// With trailing icon
export const WithTrailingIcon: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputWrapper>
				<InputEl placeholder="Search..." />
				<InputIcon as={MagnifyingGlass} />
			</InputWrapper>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

// With both icons
export const WithBothIcons: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputWrapper>
				<InputIcon as={User} />
				<InputEl placeholder="Username" />
				<InputIcon as={MagnifyingGlass} />
			</InputWrapper>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

// With prefix/suffix
export const WithAffix: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputAffix>https://</InputAffix>
			<InputWrapper>
				<InputEl placeholder="example.com" />
			</InputWrapper>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

export const WithSuffixAffix: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputWrapper>
				<InputEl placeholder="username" />
			</InputWrapper>
			<InputAffix>@gmail.com</InputAffix>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

// With currency
export const WithCurrency: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputWrapper>
				<InputIcon as={CurrencyDollar} />
				<InputEl placeholder="0.00" type="number" />
			</InputWrapper>
			<InputAffix>USD</InputAffix>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

// Error state
export const WithError: Story = {
	render: (args) => (
		<div className="flex flex-col gap-2 w-80">
			<InputRoot {...args}>
				<InputWrapper>
					<InputEl placeholder="Email" defaultValue="invalid-email" />
				</InputWrapper>
			</InputRoot>
			<span className="text-error-base text-sm">Please enter a valid email address</span>
		</div>
	),
	args: {
		size: "medium",
		hasError: true,
	},
}

// Disabled state
export const Disabled: Story = {
	render: (args) => (
		<InputRoot {...args} className="w-80">
			<InputWrapper>
				<InputEl placeholder="Disabled input" disabled defaultValue="This is disabled" />
			</InputWrapper>
		</InputRoot>
	),
	args: {
		size: "medium",
	},
}

// Size variants
export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<InputRoot size="medium">
				<InputWrapper>
					<InputEl placeholder="Medium size" />
				</InputWrapper>
			</InputRoot>
			<InputRoot size="small">
				<InputWrapper>
					<InputEl placeholder="Small size" />
				</InputWrapper>
			</InputRoot>
			<InputRoot size="xsmall">
				<InputWrapper>
					<InputEl placeholder="XSmall size" />
				</InputWrapper>
			</InputRoot>
		</div>
	),
}

// Password Input
export const Password: Story = {
	render: () => (
		<div className="w-80">
			<PasswordInput placeholder="Enter password" />
		</div>
	),
}

export const PasswordWithError: Story = {
	render: () => (
		<div className="flex flex-col gap-2 w-80">
			<PasswordInput placeholder="Enter password" hasError />
			<span className="text-error-base text-sm">Password must be at least 8 characters</span>
		</div>
	),
}

// Search Input
export const Search: Story = {
	render: function SearchStory() {
		const [value, setValue] = useState("")
		return (
			<div className="w-80">
				<SearchInput
					placeholder="Search..."
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onClear={() => setValue("")}
				/>
			</div>
		)
	},
}

// Number Input
export const Number: Story = {
	render: function NumberStory() {
		const [value, setValue] = useState(5)
		return (
			<div className="w-32">
				<NumberInput value={value} onChange={setValue} min={0} max={10} />
			</div>
		)
	},
}

export const NumberWithMinMax: Story = {
	render: function NumberWithMinMaxStory() {
		const [value, setValue] = useState(0)
		return (
			<div className="flex flex-col gap-2">
				<div className="w-32">
					<NumberInput value={value} onChange={setValue} min={0} max={100} step={5} />
				</div>
				<span className="text-sm text-text-sub-600">
					Range: 0-100, Step: 5, Current: {value}
				</span>
			</div>
		)
	},
}

// Complete form example
export const FormExample: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-96 p-6 rounded-xl bg-bg-white-0 shadow-regular-md">
			<h3 className="text-label-lg text-text-strong-950">Contact Form</h3>
			<div className="flex flex-col gap-1">
				<label className="text-label-sm text-text-sub-600">Full Name</label>
				<InputRoot size="medium">
					<InputWrapper>
						<InputIcon as={User} />
						<InputEl placeholder="John Doe" />
					</InputWrapper>
				</InputRoot>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-label-sm text-text-sub-600">Email</label>
				<InputRoot size="medium">
					<InputWrapper>
						<InputIcon as={EnvelopeSimple} />
						<InputEl placeholder="john@example.com" type="email" />
					</InputWrapper>
				</InputRoot>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-label-sm text-text-sub-600">Password</label>
				<PasswordInput placeholder="••••••••" size="medium" />
			</div>
		</div>
	),
}
