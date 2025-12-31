import type { Meta, StoryObj } from "@storybook/react"
import { Root as Kbd } from "@/components/ui/primitives/kbd"

const meta: Meta<typeof Kbd> = {
	title: "Primitives/Kbd",
	component: Kbd,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Kbd>

// Basic keyboard shortcut
export const Basic: Story = {
	render: () => <Kbd>⌘K</Kbd>,
}

// Common shortcuts
export const CommonShortcuts: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<Kbd>⌘C</Kbd>
			<Kbd>⌘V</Kbd>
			<Kbd>⌘X</Kbd>
			<Kbd>⌘Z</Kbd>
			<Kbd>⌘S</Kbd>
		</div>
	),
}

// With text labels
export const WithTextLabels: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<span className="text-paragraph-sm text-text-sub-600">Copy:</span>
				<Kbd>⌘C</Kbd>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-paragraph-sm text-text-sub-600">Paste:</span>
				<Kbd>⌘V</Kbd>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-paragraph-sm text-text-sub-600">Undo:</span>
				<Kbd>⌘Z</Kbd>
			</div>
		</div>
	),
}

// Navigation keys
export const NavigationKeys: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Kbd>↑</Kbd>
			<Kbd>↓</Kbd>
			<Kbd>←</Kbd>
			<Kbd>→</Kbd>
		</div>
	),
}

// Special keys
export const SpecialKeys: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<Kbd>Esc</Kbd>
			<Kbd>Tab</Kbd>
			<Kbd>↵</Kbd>
			<Kbd>⌫</Kbd>
			<Kbd>Space</Kbd>
		</div>
	),
}

// Modifier combinations
export const ModifierCombinations: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<Kbd>⌘</Kbd>
				<span className="text-text-soft-400">+</span>
				<Kbd>Shift</Kbd>
				<span className="text-text-soft-400">+</span>
				<Kbd>P</Kbd>
				<span className="ml-2 text-paragraph-sm text-text-sub-600">Command Palette</span>
			</div>
			<div className="flex items-center gap-2">
				<Kbd>⌘</Kbd>
				<span className="text-text-soft-400">+</span>
				<Kbd>K</Kbd>
				<span className="ml-2 text-paragraph-sm text-text-sub-600">Quick Search</span>
			</div>
			<div className="flex items-center gap-2">
				<Kbd>Alt</Kbd>
				<span className="text-text-soft-400">+</span>
				<Kbd>F4</Kbd>
				<span className="ml-2 text-paragraph-sm text-text-sub-600">Close Window</span>
			</div>
		</div>
	),
}

// In context examples
export const InContext: Story = {
	render: () => (
		<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
			<div className="px-4 py-3 border-b border-stroke-soft-200">
				<h3 className="text-label-sm text-text-strong-950">Keyboard Shortcuts</h3>
			</div>
			<div className="divide-y divide-stroke-soft-200">
				{[
					{ action: "Search", shortcut: "⌘K" },
					{ action: "New document", shortcut: "⌘N" },
					{ action: "Save", shortcut: "⌘S" },
					{ action: "Settings", shortcut: "⌘," },
					{ action: "Help", shortcut: "⌘?" },
				].map((item) => (
					<div key={item.action} className="flex items-center justify-between px-4 py-3">
						<span className="text-paragraph-sm text-text-sub-600">{item.action}</span>
						<Kbd>{item.shortcut}</Kbd>
					</div>
				))}
			</div>
		</div>
	),
}

// Menu item example
export const MenuItemExample: Story = {
	render: () => (
		<div className="w-64 border border-stroke-soft-200 rounded-xl overflow-hidden py-2">
			{[
				{ label: "New File", shortcut: "⌘N" },
				{ label: "Open File", shortcut: "⌘O" },
				{ label: "Save", shortcut: "⌘S" },
				{ label: "Save As...", shortcut: "⇧⌘S" },
			].map((item) => (
				<button
					key={item.label}
					className="w-full flex items-center justify-between px-4 py-2 hover:bg-bg-weak-50 transition-colors"
				>
					<span className="text-paragraph-sm text-text-strong-950">{item.label}</span>
					<Kbd>{item.shortcut}</Kbd>
				</button>
			))}
		</div>
	),
}

// Footer help example
export const FooterHelpExample: Story = {
	render: () => (
		<div className="flex items-center gap-6 px-4 py-3 bg-bg-weak-50 rounded-lg text-paragraph-xs text-text-soft-400">
			<span className="flex items-center gap-1.5">
				<Kbd>↑</Kbd>
				<Kbd>↓</Kbd>
				<span>Navigate</span>
			</span>
			<span className="flex items-center gap-1.5">
				<Kbd>↵</Kbd>
				<span>Select</span>
			</span>
			<span className="flex items-center gap-1.5">
				<Kbd>Esc</Kbd>
				<span>Close</span>
			</span>
		</div>
	),
}
