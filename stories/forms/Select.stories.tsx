import type { Meta, StoryObj } from "@storybook/react"
import {
	SelectRoot,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
	SelectGroup,
	SelectSeparator,
} from "@/components/ui/forms"
import { Globe, Flag, User, CreditCard } from "@phosphor-icons/react"

const meta: Meta<typeof SelectRoot> = {
	title: "Forms/Select",
	component: SelectRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof SelectRoot>

// Basic select
export const Basic: Story = {
	render: () => (
		<SelectRoot>
			<SelectTrigger className="w-64">
				<SelectValue placeholder="Select an option" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2">Option 2</SelectItem>
				<SelectItem value="option3">Option 3</SelectItem>
			</SelectContent>
		</SelectRoot>
	),
}

// With default value
export const WithDefaultValue: Story = {
	render: () => (
		<SelectRoot defaultValue="option2">
			<SelectTrigger className="w-64">
				<SelectValue placeholder="Select an option" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2">Option 2</SelectItem>
				<SelectItem value="option3">Option 3</SelectItem>
			</SelectContent>
		</SelectRoot>
	),
}

// With groups
export const WithGroups: Story = {
	render: () => (
		<SelectRoot>
			<SelectTrigger className="w-64">
				<SelectValue placeholder="Select a country" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="us">United States</SelectItem>
					<SelectItem value="ca">Canada</SelectItem>
					<SelectItem value="mx">Mexico</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectItem value="uk">United Kingdom</SelectItem>
					<SelectItem value="de">Germany</SelectItem>
					<SelectItem value="fr">France</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectItem value="jp">Japan</SelectItem>
					<SelectItem value="in">India</SelectItem>
					<SelectItem value="au">Australia</SelectItem>
				</SelectGroup>
			</SelectContent>
		</SelectRoot>
	),
}

// Disabled
export const Disabled: Story = {
	render: () => (
		<SelectRoot disabled>
			<SelectTrigger className="w-64">
				<SelectValue placeholder="Disabled select" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
			</SelectContent>
		</SelectRoot>
	),
}

// Disabled items
export const WithDisabledItems: Story = {
	render: () => (
		<SelectRoot>
			<SelectTrigger className="w-64">
				<SelectValue placeholder="Select a plan" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="free">Free Plan</SelectItem>
				<SelectItem value="starter">Starter Plan</SelectItem>
				<SelectItem value="pro">Pro Plan</SelectItem>
				<SelectItem value="enterprise" disabled>
					Enterprise (Coming soon)
				</SelectItem>
			</SelectContent>
		</SelectRoot>
	),
}

// Size variants
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<SelectRoot size="medium">
				<SelectTrigger className="w-64">
					<SelectValue placeholder="Medium size" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="option1">Option 1</SelectItem>
					<SelectItem value="option2">Option 2</SelectItem>
				</SelectContent>
			</SelectRoot>
			<SelectRoot size="small">
				<SelectTrigger className="w-64">
					<SelectValue placeholder="Small size" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="option1">Option 1</SelectItem>
					<SelectItem value="option2">Option 2</SelectItem>
				</SelectContent>
			</SelectRoot>
			<SelectRoot size="xsmall">
				<SelectTrigger className="w-64">
					<SelectValue placeholder="XSmall size" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="option1">Option 1</SelectItem>
					<SelectItem value="option2">Option 2</SelectItem>
				</SelectContent>
			</SelectRoot>
		</div>
	),
}

// Form example
export const FormExample: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80 p-6 rounded-xl bg-bg-white-0 shadow-regular-md">
			<h3 className="text-label-lg text-text-strong-950">User Settings</h3>
			<div className="flex flex-col gap-1">
				<label className="text-label-sm text-text-sub-600">Language</label>
				<SelectRoot defaultValue="en">
					<SelectTrigger>
						<SelectValue placeholder="Select language" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en">English</SelectItem>
						<SelectItem value="es">Spanish</SelectItem>
						<SelectItem value="fr">French</SelectItem>
						<SelectItem value="de">German</SelectItem>
						<SelectItem value="ja">Japanese</SelectItem>
					</SelectContent>
				</SelectRoot>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-label-sm text-text-sub-600">Timezone</label>
				<SelectRoot defaultValue="utc">
					<SelectTrigger>
						<SelectValue placeholder="Select timezone" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="utc">UTC</SelectItem>
						<SelectItem value="pst">Pacific Time (PST)</SelectItem>
						<SelectItem value="est">Eastern Time (EST)</SelectItem>
						<SelectItem value="cet">Central European (CET)</SelectItem>
						<SelectItem value="ist">India Standard (IST)</SelectItem>
					</SelectContent>
				</SelectRoot>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-label-sm text-text-sub-600">Currency</label>
				<SelectRoot defaultValue="usd">
					<SelectTrigger>
						<SelectValue placeholder="Select currency" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="usd">USD - US Dollar</SelectItem>
						<SelectItem value="eur">EUR - Euro</SelectItem>
						<SelectItem value="gbp">GBP - British Pound</SelectItem>
						<SelectItem value="inr">INR - Indian Rupee</SelectItem>
						<SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
					</SelectContent>
				</SelectRoot>
			</div>
		</div>
	),
}
