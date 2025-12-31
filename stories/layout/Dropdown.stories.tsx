import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Root as DropdownRoot,
	Trigger as DropdownTrigger,
	Content as DropdownContent,
	Item as DropdownItem,
	ItemIcon as DropdownItemIcon,
	Group as DropdownGroup,
	Label as DropdownLabel,
	Separator as DropdownSeparator,
	CheckboxItem as DropdownCheckboxItem,
	RadioGroup as DropdownRadioGroup,
	RadioItem as DropdownRadioItem,
	StyledTrigger,
} from "@/components/ui/layout/dropdown"
import { User, Gear, SignOut, CaretDown, Plus, Copy, Trash, PencilSimple } from "@phosphor-icons/react"

const meta: Meta<typeof DropdownRoot> = {
	title: "Layout/Dropdown",
	component: DropdownRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof DropdownRoot>

// Basic dropdown
export const Basic: Story = {
	render: () => (
		<DropdownRoot>
			<StyledTrigger>
				Options
				<CaretDown className="size-4" />
			</StyledTrigger>
			<DropdownContent>
				<DropdownItem>New File</DropdownItem>
				<DropdownItem>Open</DropdownItem>
				<DropdownItem>Save</DropdownItem>
				<DropdownSeparator className="my-1 h-px bg-stroke-soft-200" />
				<DropdownItem>Exit</DropdownItem>
			</DropdownContent>
		</DropdownRoot>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<DropdownRoot>
			<StyledTrigger>
				<User className="size-4" />
				Account
				<CaretDown className="size-4" />
			</StyledTrigger>
			<DropdownContent>
				<DropdownItem>
					<DropdownItemIcon as={User} />
					Profile
				</DropdownItem>
				<DropdownItem>
					<DropdownItemIcon as={Gear} />
					Settings
				</DropdownItem>
				<DropdownSeparator className="my-1 h-px bg-stroke-soft-200" />
				<DropdownItem>
					<DropdownItemIcon as={SignOut} />
					Sign out
				</DropdownItem>
			</DropdownContent>
		</DropdownRoot>
	),
}

// With groups
export const WithGroups: Story = {
	render: () => (
		<DropdownRoot>
			<StyledTrigger>
				Actions
				<CaretDown className="size-4" />
			</StyledTrigger>
			<DropdownContent width="md">
				<DropdownGroup>
					<DropdownLabel>Create</DropdownLabel>
					<DropdownItem>
						<DropdownItemIcon as={Plus} />
						New Document
					</DropdownItem>
					<DropdownItem>
						<DropdownItemIcon as={Plus} />
						New Folder
					</DropdownItem>
				</DropdownGroup>
				<DropdownSeparator className="my-1 h-px bg-stroke-soft-200" />
				<DropdownGroup>
					<DropdownLabel>Edit</DropdownLabel>
					<DropdownItem>
						<DropdownItemIcon as={Copy} />
						Copy
					</DropdownItem>
					<DropdownItem>
						<DropdownItemIcon as={PencilSimple} />
						Rename
					</DropdownItem>
					<DropdownItem>
						<DropdownItemIcon as={Trash} />
						Delete
					</DropdownItem>
				</DropdownGroup>
			</DropdownContent>
		</DropdownRoot>
	),
}

// Checkbox items
export const CheckboxItems: Story = {
	render: function CheckboxDropdown() {
		const [showStatusBar, setShowStatusBar] = useState(true)
		const [showPanel, setShowPanel] = useState(false)
		const [showSidebar, setShowSidebar] = useState(true)

		return (
			<DropdownRoot>
				<StyledTrigger>
					View Options
					<CaretDown className="size-4" />
				</StyledTrigger>
				<DropdownContent width="sm">
					<DropdownCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
						Status Bar
					</DropdownCheckboxItem>
					<DropdownCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
						Activity Panel
					</DropdownCheckboxItem>
					<DropdownCheckboxItem checked={showSidebar} onCheckedChange={setShowSidebar}>
						Sidebar
					</DropdownCheckboxItem>
				</DropdownContent>
			</DropdownRoot>
		)
	},
}

// Radio items
export const RadioItems: Story = {
	render: function RadioDropdown() {
		const [theme, setTheme] = useState("system")

		return (
			<DropdownRoot>
				<StyledTrigger>
					Theme: {theme}
					<CaretDown className="size-4" />
				</StyledTrigger>
				<DropdownContent width="sm">
					<DropdownRadioGroup value={theme} onValueChange={setTheme}>
						<DropdownRadioItem value="light">Light</DropdownRadioItem>
						<DropdownRadioItem value="dark">Dark</DropdownRadioItem>
						<DropdownRadioItem value="system">System</DropdownRadioItem>
					</DropdownRadioGroup>
				</DropdownContent>
			</DropdownRoot>
		)
	},
}

// Different sizes
export const TriggerSizes: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<DropdownRoot>
				<StyledTrigger size="xxsmall">
					XXS
					<CaretDown className="size-3" />
				</StyledTrigger>
				<DropdownContent>
					<DropdownItem>Option 1</DropdownItem>
					<DropdownItem>Option 2</DropdownItem>
				</DropdownContent>
			</DropdownRoot>
			<DropdownRoot>
				<StyledTrigger size="xsmall">
					XS
					<CaretDown className="size-4" />
				</StyledTrigger>
				<DropdownContent>
					<DropdownItem>Option 1</DropdownItem>
					<DropdownItem>Option 2</DropdownItem>
				</DropdownContent>
			</DropdownRoot>
			<DropdownRoot>
				<StyledTrigger size="small">
					Small
					<CaretDown className="size-4" />
				</StyledTrigger>
				<DropdownContent>
					<DropdownItem>Option 1</DropdownItem>
					<DropdownItem>Option 2</DropdownItem>
				</DropdownContent>
			</DropdownRoot>
			<DropdownRoot>
				<StyledTrigger size="medium">
					Medium
					<CaretDown className="size-4" />
				</StyledTrigger>
				<DropdownContent>
					<DropdownItem>Option 1</DropdownItem>
					<DropdownItem>Option 2</DropdownItem>
				</DropdownContent>
			</DropdownRoot>
		</div>
	),
}

// Content widths
export const ContentWidths: Story = {
	render: () => (
		<div className="flex items-start gap-4">
			<DropdownRoot>
				<StyledTrigger>Auto Width</StyledTrigger>
				<DropdownContent width="auto">
					<DropdownItem>Short</DropdownItem>
					<DropdownItem>Medium option</DropdownItem>
				</DropdownContent>
			</DropdownRoot>
			<DropdownRoot>
				<StyledTrigger>Small (200px)</StyledTrigger>
				<DropdownContent width="sm">
					<DropdownItem>Option 1</DropdownItem>
					<DropdownItem>Option 2</DropdownItem>
				</DropdownContent>
			</DropdownRoot>
			<DropdownRoot>
				<StyledTrigger>Medium (280px)</StyledTrigger>
				<DropdownContent width="md">
					<DropdownItem>Option with longer text</DropdownItem>
					<DropdownItem>Another option</DropdownItem>
				</DropdownContent>
			</DropdownRoot>
		</div>
	),
}

// User menu example
export const UserMenuExample: Story = {
	render: () => (
		<DropdownRoot>
			<DropdownTrigger asChild>
				<button className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-weak-50 transition-colors">
					<div className="size-8 rounded-full bg-primary-base flex items-center justify-center text-white text-sm font-medium">
						JD
					</div>
					<div className="text-left">
						<p className="text-label-sm text-text-strong-950">John Doe</p>
						<p className="text-paragraph-xs text-text-sub-600">john@example.com</p>
					</div>
					<CaretDown className="size-4 text-text-sub-600" />
				</button>
			</DropdownTrigger>
			<DropdownContent width="sm">
				<DropdownGroup>
					<DropdownItem>
						<DropdownItemIcon as={User} />
						My Profile
					</DropdownItem>
					<DropdownItem>
						<DropdownItemIcon as={Gear} />
						Settings
					</DropdownItem>
				</DropdownGroup>
				<DropdownSeparator className="my-1 h-px bg-stroke-soft-200" />
				<DropdownItem className="text-error-base">
					<DropdownItemIcon as={SignOut} className="text-error-base" />
					Sign out
				</DropdownItem>
			</DropdownContent>
		</DropdownRoot>
	),
}
