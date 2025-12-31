import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import * as ButtonGroup from "@/components/ui/primitives/button-group"
import { List, GridFour, Rows, TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify, TextB, TextItalic, TextUnderline, Play, Pause, SkipBack, SkipForward, SortAscending, SortDescending, Sun, Moon, Desktop, Eye, EyeSlash, DotsThree, Trash, PencilSimple, Copy, CaretDown } from "@phosphor-icons/react"

const meta: Meta<typeof ButtonGroup.Root> = {
	title: "Primitives/ButtonGroup",
	component: ButtonGroup.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof ButtonGroup.Root>

// Basic button group
export const Basic: Story = {
	render: () => (
		<ButtonGroup.Root>
			<ButtonGroup.Item>Left</ButtonGroup.Item>
			<ButtonGroup.Item>Middle</ButtonGroup.Item>
			<ButtonGroup.Item>Right</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}

// With icons
export const WithIcons: Story = {
	render: () => (
		<ButtonGroup.Root>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={List} />
				List
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={GridFour} />
				Grid
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={Rows} />
				Table
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}

// Icon only
export const IconOnly: Story = {
	render: () => (
		<ButtonGroup.Root>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={List} />
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={GridFour} />
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={Rows} />
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<span className="text-paragraph-xs text-text-sub-600">Small</span>
				<ButtonGroup.Root size="small">
					<ButtonGroup.Item>Option 1</ButtonGroup.Item>
					<ButtonGroup.Item>Option 2</ButtonGroup.Item>
					<ButtonGroup.Item>Option 3</ButtonGroup.Item>
				</ButtonGroup.Root>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-paragraph-xs text-text-sub-600">X-Small</span>
				<ButtonGroup.Root size="xsmall">
					<ButtonGroup.Item>Option 1</ButtonGroup.Item>
					<ButtonGroup.Item>Option 2</ButtonGroup.Item>
					<ButtonGroup.Item>Option 3</ButtonGroup.Item>
				</ButtonGroup.Root>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-paragraph-xs text-text-sub-600">XX-Small</span>
				<ButtonGroup.Root size="xxsmall">
					<ButtonGroup.Item>Option 1</ButtonGroup.Item>
					<ButtonGroup.Item>Option 2</ButtonGroup.Item>
					<ButtonGroup.Item>Option 3</ButtonGroup.Item>
				</ButtonGroup.Root>
			</div>
		</div>
	),
}

// View toggle
export const ViewToggle: Story = {
	render: function ViewToggleDemo() {
		const [view, setView] = useState("list")
		return (
			<ButtonGroup.Root>
				<ButtonGroup.Item
					onClick={() => setView("list")}
					data-state={view === "list" ? "active" : undefined}
					className={view === "list" ? "bg-primary-base text-white" : ""}
				>
					<ButtonGroup.Icon as={List} />
					List
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setView("grid")}
					data-state={view === "grid" ? "active" : undefined}
					className={view === "grid" ? "bg-primary-base text-white" : ""}
				>
					<ButtonGroup.Icon as={GridFour} />
					Grid
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		)
	},
}

// Text alignment
export const TextAlignment: Story = {
	render: function TextAlignmentDemo() {
		const [align, setAlign] = useState("left")
		return (
			<ButtonGroup.Root>
				<ButtonGroup.Item
					onClick={() => setAlign("left")}
					className={align === "left" ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={TextAlignLeft} />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setAlign("center")}
					className={align === "center" ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={TextAlignCenter} />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setAlign("right")}
					className={align === "right" ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={TextAlignRight} />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setAlign("justify")}
					className={align === "justify" ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={TextAlignJustify} />
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		)
	},
}

// Text formatting
export const TextFormatting: Story = {
	render: function TextFormattingDemo() {
		const [formats, setFormats] = useState<string[]>([])

		const toggleFormat = (format: string) => {
			setFormats((prev) =>
				prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
			)
		}

		return (
			<ButtonGroup.Root>
				<ButtonGroup.Item
					onClick={() => toggleFormat("bold")}
					className={formats.includes("bold") ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={TextB} />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => toggleFormat("italic")}
					className={formats.includes("italic") ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={TextItalic} />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => toggleFormat("underline")}
					className={formats.includes("underline") ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={TextUnderline} />
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		)
	},
}

// Media controls
export const MediaControls: Story = {
	render: function MediaControlsDemo() {
		const [isPlaying, setIsPlaying] = useState(false)
		return (
			<ButtonGroup.Root>
				<ButtonGroup.Item>
					<ButtonGroup.Icon as={SkipBack} />
				</ButtonGroup.Item>
				<ButtonGroup.Item onClick={() => setIsPlaying(!isPlaying)}>
					<ButtonGroup.Icon as={isPlaying ? Pause : Play} />
				</ButtonGroup.Item>
				<ButtonGroup.Item>
					<ButtonGroup.Icon as={SkipForward} />
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		)
	},
}

// Sort order
export const SortOrder: Story = {
	render: function SortOrderDemo() {
		const [order, setOrder] = useState("asc")
		return (
			<ButtonGroup.Root size="small">
				<ButtonGroup.Item
					onClick={() => setOrder("asc")}
					className={order === "asc" ? "bg-primary-base text-white" : ""}
				>
					<ButtonGroup.Icon as={SortAscending} />
					Ascending
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setOrder("desc")}
					className={order === "desc" ? "bg-primary-base text-white" : ""}
				>
					<ButtonGroup.Icon as={SortDescending} />
					Descending
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		)
	},
}

// Theme toggle
export const ThemeToggle: Story = {
	render: function ThemeToggleDemo() {
		const [theme, setTheme] = useState("system")
		return (
			<ButtonGroup.Root size="xsmall">
				<ButtonGroup.Item
					onClick={() => setTheme("light")}
					className={theme === "light" ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={Sun} />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setTheme("dark")}
					className={theme === "dark" ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={Moon} />
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setTheme("system")}
					className={theme === "system" ? "bg-bg-weak-50" : ""}
				>
					<ButtonGroup.Icon as={Desktop} />
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		)
	},
}

// Visibility toggle
export const VisibilityToggle: Story = {
	render: function VisibilityToggleDemo() {
		const [visible, setVisible] = useState(true)
		return (
			<ButtonGroup.Root size="small">
				<ButtonGroup.Item
					onClick={() => setVisible(true)}
					className={visible ? "bg-success-base/10 text-success-base" : ""}
				>
					<ButtonGroup.Icon as={Eye} />
					Visible
				</ButtonGroup.Item>
				<ButtonGroup.Item
					onClick={() => setVisible(false)}
					className={!visible ? "bg-error-base/10 text-error-base" : ""}
				>
					<ButtonGroup.Icon as={EyeSlash} />
					Hidden
				</ButtonGroup.Item>
			</ButtonGroup.Root>
		)
	},
}

// Action buttons
export const ActionButtons: Story = {
	render: () => (
		<ButtonGroup.Root size="small">
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={PencilSimple} />
				Edit
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={Copy} />
				Duplicate
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={Trash} />
				Delete
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}

// With dropdown indicator
export const WithDropdown: Story = {
	render: () => (
		<ButtonGroup.Root>
			<ButtonGroup.Item>
				Save
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={CaretDown} />
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}

// More actions
export const MoreActions: Story = {
	render: () => (
		<ButtonGroup.Root size="xsmall">
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={PencilSimple} />
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={Copy} />
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={Trash} />
			</ButtonGroup.Item>
			<ButtonGroup.Item>
				<ButtonGroup.Icon as={DotsThree} />
			</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}

// Pagination example
export const PaginationExample: Story = {
	render: function PaginationExampleDemo() {
		const [page, setPage] = useState(1)
		const totalPages = 5

		return (
			<div className="flex items-center gap-4">
				<ButtonGroup.Root size="xsmall">
					<ButtonGroup.Item onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
						Previous
					</ButtonGroup.Item>
					{Array.from({ length: totalPages }, (_, i) => (
						<ButtonGroup.Item
							key={i}
							onClick={() => setPage(i + 1)}
							className={page === i + 1 ? "bg-primary-base text-white" : ""}
						>
							{i + 1}
						</ButtonGroup.Item>
					))}
					<ButtonGroup.Item onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
						Next
					</ButtonGroup.Item>
				</ButtonGroup.Root>
			</div>
		)
	},
}

// Table toolbar example
export const TableToolbarExample: Story = {
	render: () => (
		<div className="w-[600px] p-4 border border-stroke-soft-200 rounded-xl">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-label-md text-text-strong-950">Products</h3>
				<div className="flex items-center gap-2">
					<ButtonGroup.Root size="xsmall">
						<ButtonGroup.Item>
							<ButtonGroup.Icon as={List} />
						</ButtonGroup.Item>
						<ButtonGroup.Item>
							<ButtonGroup.Icon as={GridFour} />
						</ButtonGroup.Item>
					</ButtonGroup.Root>
					<ButtonGroup.Root size="xsmall">
						<ButtonGroup.Item>All</ButtonGroup.Item>
						<ButtonGroup.Item>Active</ButtonGroup.Item>
						<ButtonGroup.Item>Archived</ButtonGroup.Item>
					</ButtonGroup.Root>
				</div>
			</div>
			<div className="h-32 bg-bg-weak-50 rounded-lg flex items-center justify-center">
				<p className="text-paragraph-sm text-text-sub-600">Table content</p>
			</div>
		</div>
	),
}

// Editor toolbar example
export const EditorToolbarExample: Story = {
	render: () => (
		<div className="w-[500px] border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="p-2 bg-bg-weak-50 border-b border-stroke-soft-200 flex gap-2">
				<ButtonGroup.Root size="xxsmall">
					<ButtonGroup.Item>
						<ButtonGroup.Icon as={TextB} />
					</ButtonGroup.Item>
					<ButtonGroup.Item>
						<ButtonGroup.Icon as={TextItalic} />
					</ButtonGroup.Item>
					<ButtonGroup.Item>
						<ButtonGroup.Icon as={TextUnderline} />
					</ButtonGroup.Item>
				</ButtonGroup.Root>
				<ButtonGroup.Root size="xxsmall">
					<ButtonGroup.Item>
						<ButtonGroup.Icon as={TextAlignLeft} />
					</ButtonGroup.Item>
					<ButtonGroup.Item>
						<ButtonGroup.Icon as={TextAlignCenter} />
					</ButtonGroup.Item>
					<ButtonGroup.Item>
						<ButtonGroup.Icon as={TextAlignRight} />
					</ButtonGroup.Item>
				</ButtonGroup.Root>
			</div>
			<div className="p-4 min-h-[120px]">
				<p className="text-paragraph-sm text-text-sub-600">Start typing here...</p>
			</div>
		</div>
	),
}

// Two buttons
export const TwoButtons: Story = {
	render: () => (
		<ButtonGroup.Root>
			<ButtonGroup.Item>Cancel</ButtonGroup.Item>
			<ButtonGroup.Item>Confirm</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}

// Many buttons
export const ManyButtons: Story = {
	render: () => (
		<ButtonGroup.Root size="xsmall">
			<ButtonGroup.Item>1</ButtonGroup.Item>
			<ButtonGroup.Item>2</ButtonGroup.Item>
			<ButtonGroup.Item>3</ButtonGroup.Item>
			<ButtonGroup.Item>4</ButtonGroup.Item>
			<ButtonGroup.Item>5</ButtonGroup.Item>
			<ButtonGroup.Item>6</ButtonGroup.Item>
			<ButtonGroup.Item>7</ButtonGroup.Item>
		</ButtonGroup.Root>
	),
}
