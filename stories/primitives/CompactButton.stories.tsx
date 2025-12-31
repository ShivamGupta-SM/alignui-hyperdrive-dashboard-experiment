import type { Meta, StoryObj } from "@storybook/react"
import { Root as CompactButtonRoot, Icon as CompactButtonIcon } from "@/components/ui/primitives/compact-button"
import {
	Plus,
	X,
	DotsThree,
	Pencil,
	Trash,
	Copy,
	Share,
	Heart,
	Star,
	Bell,
	Gear,
	MagnifyingGlass,
	CaretDown,
	ArrowLeft,
	ArrowRight,
	Check,
	Eye,
	EyeSlash,
} from "@phosphor-icons/react"

const meta: Meta<typeof CompactButtonRoot> = {
	title: "Primitives/CompactButton",
	component: CompactButtonRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["stroke", "ghost", "white"],
		},
		size: {
			control: "select",
			options: ["xlarge", "large", "medium"],
		},
		fullRadius: {
			control: "boolean",
		},
		disabled: {
			control: "boolean",
		},
	},
}

export default meta
type Story = StoryObj<typeof CompactButtonRoot>

// Basic compact button
export const Basic: Story = {
	render: () => (
		<CompactButtonRoot aria-label="Add">
			<CompactButtonIcon>
				<Plus />
			</CompactButtonIcon>
		</CompactButtonRoot>
	),
}

// All variants
export const Variants: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<CompactButtonRoot variant="stroke" aria-label="Stroke">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" aria-label="Ghost">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="white" aria-label="White">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}

// All sizes
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">XLarge (44px - Mobile touch target)</span>
				<div className="flex items-center gap-4">
					<CompactButtonRoot size="xlarge" variant="stroke" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
					<CompactButtonRoot size="xlarge" variant="ghost" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
					<CompactButtonRoot size="xlarge" variant="white" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Large (default)</span>
				<div className="flex items-center gap-4">
					<CompactButtonRoot size="large" variant="stroke" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
					<CompactButtonRoot size="large" variant="ghost" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
					<CompactButtonRoot size="large" variant="white" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<span className="text-label-sm text-text-sub-600">Medium</span>
				<div className="flex items-center gap-4">
					<CompactButtonRoot size="medium" variant="stroke" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
					<CompactButtonRoot size="medium" variant="ghost" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
					<CompactButtonRoot size="medium" variant="white" aria-label="Add">
						<CompactButtonIcon>
							<Plus />
						</CompactButtonIcon>
					</CompactButtonRoot>
				</div>
			</div>
		</div>
	),
}

// Full radius
export const FullRadius: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<CompactButtonRoot fullRadius aria-label="Add">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot fullRadius variant="ghost" aria-label="Edit">
				<CompactButtonIcon>
					<Pencil />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot fullRadius variant="white" aria-label="Delete">
				<CompactButtonIcon>
					<Trash />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}

// Disabled state
export const Disabled: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<CompactButtonRoot disabled aria-label="Disabled">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" disabled aria-label="Disabled">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="white" disabled aria-label="Disabled">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}

// Common actions
export const CommonActions: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<CompactButtonRoot variant="ghost" aria-label="Edit">
				<CompactButtonIcon>
					<Pencil />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" aria-label="Copy">
				<CompactButtonIcon>
					<Copy />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" aria-label="Share">
				<CompactButtonIcon>
					<Share />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" aria-label="Delete">
				<CompactButtonIcon>
					<Trash />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}

// Table row actions
export const TableRowActions: Story = {
	render: () => (
		<div className="w-full max-w-md border border-stroke-soft-200 rounded-xl overflow-hidden">
			{[
				{ name: "Document.pdf", date: "Dec 1, 2024" },
				{ name: "Report.xlsx", date: "Nov 28, 2024" },
				{ name: "Presentation.pptx", date: "Nov 25, 2024" },
			].map((file) => (
				<div
					key={file.name}
					className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200 last:border-b-0"
				>
					<div>
						<p className="text-label-sm text-text-strong-950">{file.name}</p>
						<p className="text-paragraph-xs text-text-sub-600">{file.date}</p>
					</div>
					<div className="flex items-center gap-1">
						<CompactButtonRoot variant="ghost" size="medium" aria-label="View">
							<CompactButtonIcon>
								<Eye />
							</CompactButtonIcon>
						</CompactButtonRoot>
						<CompactButtonRoot variant="ghost" size="medium" aria-label="Edit">
							<CompactButtonIcon>
								<Pencil />
							</CompactButtonIcon>
						</CompactButtonRoot>
						<CompactButtonRoot variant="ghost" size="medium" aria-label="More options">
							<CompactButtonIcon>
								<DotsThree weight="bold" />
							</CompactButtonIcon>
						</CompactButtonRoot>
					</div>
				</div>
			))}
		</div>
	),
}

// Card header actions
export const CardHeaderActions: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200">
				<h3 className="text-label-md text-text-strong-950">Card Title</h3>
				<div className="flex items-center gap-1">
					<CompactButtonRoot variant="ghost" size="medium" aria-label="Settings">
						<CompactButtonIcon>
							<Gear />
						</CompactButtonIcon>
					</CompactButtonRoot>
					<CompactButtonRoot variant="ghost" size="medium" aria-label="More">
						<CompactButtonIcon>
							<DotsThree weight="bold" />
						</CompactButtonIcon>
					</CompactButtonRoot>
				</div>
			</div>
			<div className="p-4">
				<p className="text-paragraph-sm text-text-sub-600">
					Card content goes here. This is some example content.
				</p>
			</div>
		</div>
	),
}

// Modal close button
export const ModalCloseButton: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200">
				<h3 className="text-label-md text-text-strong-950">Modal Title</h3>
				<CompactButtonRoot variant="ghost" size="medium" aria-label="Close">
					<CompactButtonIcon>
						<X />
					</CompactButtonIcon>
				</CompactButtonRoot>
			</div>
			<div className="p-4">
				<p className="text-paragraph-sm text-text-sub-600">Modal content...</p>
			</div>
		</div>
	),
}

// Navigation arrows
export const NavigationArrows: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<CompactButtonRoot variant="stroke" aria-label="Previous">
				<CompactButtonIcon>
					<ArrowLeft />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<span className="text-paragraph-sm text-text-sub-600 px-4">Page 1 of 10</span>
			<CompactButtonRoot variant="stroke" aria-label="Next">
				<CompactButtonIcon>
					<ArrowRight />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}

// Password visibility toggle
export const PasswordToggle: Story = {
	render: () => (
		<div className="relative w-64">
			<input
				type="password"
				placeholder="Enter password"
				className="w-full px-3 py-2.5 pr-10 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
			/>
			<div className="absolute right-2 top-1/2 -translate-y-1/2">
				<CompactButtonRoot variant="ghost" size="medium" aria-label="Show password">
					<CompactButtonIcon>
						<Eye />
					</CompactButtonIcon>
				</CompactButtonRoot>
			</div>
		</div>
	),
}

// Social actions
export const SocialActions: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<CompactButtonRoot variant="ghost" fullRadius aria-label="Like">
				<CompactButtonIcon>
					<Heart />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" fullRadius aria-label="Favorite">
				<CompactButtonIcon>
					<Star />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" fullRadius aria-label="Share">
				<CompactButtonIcon>
					<Share />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}

// Search and filter
export const SearchAndFilter: Story = {
	render: () => (
		<div className="flex items-center gap-2 p-2 bg-bg-weak-50 rounded-lg">
			<div className="relative flex-1">
				<MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-soft-400" />
				<input
					type="text"
					placeholder="Search..."
					className="w-full pl-9 pr-3 py-2 rounded-md border-0 bg-bg-white-0 text-paragraph-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
				/>
			</div>
			<CompactButtonRoot variant="white" aria-label="More options">
				<CompactButtonIcon>
					<DotsThree weight="bold" />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}

// All variants grid
export const AllVariantsGrid: Story = {
	render: () => (
		<div className="grid grid-cols-4 gap-4 items-center">
			<div className="col-span-4 text-label-sm text-text-sub-600 border-b pb-2">Square (default)</div>
			<CompactButtonRoot variant="stroke" aria-label="Stroke">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" aria-label="Ghost">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="white" aria-label="White">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot disabled aria-label="Disabled">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>

			<div className="col-span-4 text-label-sm text-text-sub-600 border-b pb-2 mt-4">Full Radius</div>
			<CompactButtonRoot variant="stroke" fullRadius aria-label="Stroke">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="ghost" fullRadius aria-label="Ghost">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot variant="white" fullRadius aria-label="White">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
			<CompactButtonRoot disabled fullRadius aria-label="Disabled">
				<CompactButtonIcon>
					<Plus />
				</CompactButtonIcon>
			</CompactButtonRoot>
		</div>
	),
}
