import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	Dialog as CommandDialog,
	DialogTitle as CommandDialogTitle,
	DialogDescription as CommandDialogDescription,
	Input as CommandInput,
	List as CommandList,
	Group as CommandGroup,
	Item as CommandItem,
	ItemIcon as CommandItemIcon,
	Footer as CommandFooter,
	FooterKeyBox as CommandFooterKeyBox,
} from "@/components/ui/navigation/command-menu"
import * as Kbd from "@/components/ui/primitives/kbd"
import { ButtonRoot } from "@/components/ui/primitives"
import {
	MagnifyingGlass,
	House,
	User,
	Gear,
	Plus,
	File,
	Folder,
	Image,
	CalendarBlank,
	Lightning,
	Moon,
	Sun,
	Clock,
	SignOut,
	Question,
	Bell,
	Trash,
	Copy,
	PencilSimple,
	Star,
	Archive,
	DownloadSimple,
} from "@phosphor-icons/react"

const meta: Meta<typeof CommandDialog> = {
	title: "Navigation/CommandMenu",
	component: CommandDialog,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof CommandDialog>

// Basic command menu
export const Basic: Story = {
	render: function BasicCommandMenu() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="basic" onClick={() => setOpen(true)}>
					<MagnifyingGlass className="size-4" />
					Search...
					<Kbd.Root className="ml-2">⌘K</Kbd.Root>
				</ButtonRoot>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogTitle className="sr-only">Command Menu</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">
						Search or type a command
					</CommandDialogDescription>
					<div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-soft-200 group/cmd-input">
						<MagnifyingGlass className="size-5 text-text-soft-400" />
						<CommandInput placeholder="Search or type a command..." />
						<Kbd.Root className="hidden sm:flex">⌘K</Kbd.Root>
					</div>
					<CommandList>
						<CommandGroup heading="Quick Actions">
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Plus} />
								<span className="flex-1">Create new document</span>
								<Kbd.Root>⌘N</Kbd.Root>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={File} />
								<span className="flex-1">Open file</span>
								<Kbd.Root>⌘O</Kbd.Root>
							</CommandItem>
						</CommandGroup>
						<CommandGroup heading="Navigation">
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={House} />
								<span className="flex-1">Go to Home</span>
								<Kbd.Root>⌘1</Kbd.Root>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={User} />
								<span className="flex-1">Go to Profile</span>
								<Kbd.Root>⌘2</Kbd.Root>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Gear} />
								<span className="flex-1">Go to Settings</span>
								<Kbd.Root>⌘,</Kbd.Root>
							</CommandItem>
						</CommandGroup>
					</CommandList>
					<CommandFooter>
						<div className="flex items-center gap-4 text-paragraph-xs text-text-soft-400">
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>↑</CommandFooterKeyBox>
								<CommandFooterKeyBox>↓</CommandFooterKeyBox>
								<span>Navigate</span>
							</span>
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>↵</CommandFooterKeyBox>
								<span>Select</span>
							</span>
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>Esc</CommandFooterKeyBox>
								<span>Close</span>
							</span>
						</div>
					</CommandFooter>
				</CommandDialog>
			</>
		)
	},
}

// File browser command menu
export const FileBrowser: Story = {
	render: function FileBrowserCommand() {
		const [open, setOpen] = useState(false)

		const recentFiles = [
			{ name: "Project Proposal.docx", type: "doc", icon: File },
			{ name: "Design Assets", type: "folder", icon: Folder },
			{ name: "Screenshot.png", type: "image", icon: Image },
			{ name: "Meeting Notes.md", type: "doc", icon: File },
		]

		return (
			<>
				<ButtonRoot variant="basic" onClick={() => setOpen(true)}>
					<MagnifyingGlass className="size-4" />
					Search files...
				</ButtonRoot>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogTitle className="sr-only">File Browser</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">Search for files and folders</CommandDialogDescription>
					<div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-soft-200 group/cmd-input">
						<MagnifyingGlass className="size-5 text-text-soft-400" />
						<CommandInput placeholder="Search files and folders..." />
					</div>
					<CommandList>
						<CommandGroup heading="Recent Files">
							{recentFiles.map((file) => (
								<CommandItem key={file.name} onSelect={() => setOpen(false)}>
									<CommandItemIcon as={file.icon} />
									<span className="flex-1">{file.name}</span>
									<span className="text-paragraph-xs text-text-soft-400">{file.type}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandGroup heading="Actions">
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Plus} />
								<span className="flex-1">New File</span>
								<Kbd.Root>⌘N</Kbd.Root>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Folder} />
								<span className="flex-1">New Folder</span>
								<Kbd.Root>⇧⌘N</Kbd.Root>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Image} />
								<span className="flex-1">Upload Image</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
					<CommandFooter>
						<div className="flex items-center gap-4 text-paragraph-xs text-text-soft-400">
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>↵</CommandFooterKeyBox>
								<span>Open</span>
							</span>
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>Esc</CommandFooterKeyBox>
								<span>Close</span>
							</span>
						</div>
					</CommandFooter>
				</CommandDialog>
			</>
		)
	},
}

// Theme switcher command menu
export const ThemeSwitcher: Story = {
	render: function ThemeSwitcherCommand() {
		const [open, setOpen] = useState(false)
		const [theme, setTheme] = useState("system")

		const themes = [
			{ id: "light", label: "Light", icon: Sun },
			{ id: "dark", label: "Dark", icon: Moon },
			{ id: "system", label: "System", icon: Gear },
		]

		return (
			<>
				<ButtonRoot variant="basic" onClick={() => setOpen(true)}>
					{theme === "light" && <Sun className="size-4" />}
					{theme === "dark" && <Moon className="size-4" />}
					{theme === "system" && <Gear className="size-4" />}
					Theme: {themes.find((t) => t.id === theme)?.label}
				</ButtonRoot>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogTitle className="sr-only">Theme Switcher</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">Select a theme</CommandDialogDescription>
					<div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-soft-200 group/cmd-input">
						<MagnifyingGlass className="size-5 text-text-soft-400" />
						<CommandInput placeholder="Select theme..." />
					</div>
					<CommandList>
						<CommandGroup heading="Themes">
							{themes.map((t) => (
								<CommandItem
									key={t.id}
									onSelect={() => {
										setTheme(t.id)
										setOpen(false)
									}}
								>
									<CommandItemIcon as={t.icon} />
									<span className="flex-1">{t.label}</span>
									{theme === t.id && (
										<span className="text-primary-base text-label-sm">Active</span>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</>
		)
	},
}

// User menu command
export const UserMenu: Story = {
	render: function UserMenuCommand() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="basic" onClick={() => setOpen(true)}>
					<div className="size-6 rounded-full bg-primary-base flex items-center justify-center">
						<span className="text-xs text-static-white">JD</span>
					</div>
					John Doe
				</ButtonRoot>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogTitle className="sr-only">User Menu</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">User options and settings</CommandDialogDescription>
					<div className="flex items-center gap-3 p-5 border-b border-stroke-soft-200">
						<div className="size-10 rounded-full bg-primary-base flex items-center justify-center">
							<span className="text-sm text-static-white">JD</span>
						</div>
						<div>
							<p className="text-label-sm text-text-strong-950">John Doe</p>
							<p className="text-paragraph-xs text-text-sub-600">john@example.com</p>
						</div>
					</div>
					<CommandList>
						<CommandGroup heading="Account">
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={User} />
								<span className="flex-1">Profile</span>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Gear} />
								<span className="flex-1">Settings</span>
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Bell} />
								<span className="flex-1">Notifications</span>
							</CommandItem>
						</CommandGroup>
						<CommandGroup heading="Support">
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Question} />
								<span className="flex-1">Help Center</span>
							</CommandItem>
						</CommandGroup>
						<CommandGroup>
							<CommandItem onSelect={() => setOpen(false)}>
								<CommandItemIcon as={SignOut} className="text-error-base" />
								<span className="flex-1 text-error-base">Sign Out</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</>
		)
	},
}

// Actions palette
export const ActionsPalette: Story = {
	render: function ActionsPaletteCommand() {
		const [open, setOpen] = useState(false)

		const actions = [
			{ icon: Copy, label: "Copy", shortcut: "⌘C" },
			{ icon: PencilSimple, label: "Edit", shortcut: "⌘E" },
			{ icon: Star, label: "Add to favorites", shortcut: "⌘D" },
			{ icon: Archive, label: "Archive", shortcut: "⌘⇧A" },
			{ icon: DownloadSimple, label: "Download", shortcut: "⌘S" },
			{ icon: Trash, label: "Delete", shortcut: "⌘⌫", destructive: true },
		]

		return (
			<>
				<ButtonRoot variant="basic" onClick={() => setOpen(true)}>
					<Lightning className="size-4" />
					Actions
					<Kbd.Root className="ml-2">⌘J</Kbd.Root>
				</ButtonRoot>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogTitle className="sr-only">Actions</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">Available actions</CommandDialogDescription>
					<div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-soft-200 group/cmd-input">
						<Lightning className="size-5 text-text-soft-400" />
						<CommandInput placeholder="Search actions..." />
					</div>
					<CommandList>
						<CommandGroup heading="Available Actions">
							{actions.map((action) => (
								<CommandItem key={action.label} onSelect={() => setOpen(false)}>
									<CommandItemIcon
										as={action.icon}
										className={action.destructive ? "text-error-base" : undefined}
									/>
									<span className={`flex-1 ${action.destructive ? "text-error-base" : ""}`}>
										{action.label}
									</span>
									<Kbd.Root>{action.shortcut}</Kbd.Root>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
					<CommandFooter>
						<div className="flex items-center gap-4 text-paragraph-xs text-text-soft-400">
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>↵</CommandFooterKeyBox>
								<span>Run action</span>
							</span>
						</div>
					</CommandFooter>
				</CommandDialog>
			</>
		)
	},
}

// With recent and suggestions
export const WithRecentAndSuggestions: Story = {
	render: function WithRecentAndSuggestionsCommand() {
		const [open, setOpen] = useState(false)
		const [search, setSearch] = useState("")

		const recentSearches = [
			"Dashboard settings",
			"Create new project",
			"Team members",
		]

		const suggestions = [
			{ icon: CalendarBlank, label: "Schedule meeting" },
			{ icon: User, label: "Invite collaborator" },
			{ icon: File, label: "Create document" },
		]

		return (
			<>
				<ButtonRoot variant="basic" onClick={() => setOpen(true)}>
					<MagnifyingGlass className="size-4" />
					Search...
				</ButtonRoot>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogTitle className="sr-only">Search</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">Search with suggestions</CommandDialogDescription>
					<div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-soft-200 group/cmd-input">
						<MagnifyingGlass className="size-5 text-text-soft-400" />
						<CommandInput
							placeholder="Type to search..."
							value={search}
							onValueChange={setSearch}
						/>
						{search && (
							<button
								onClick={() => setSearch("")}
								className="text-paragraph-xs text-text-soft-400 hover:text-text-sub-600"
							>
								Clear
							</button>
						)}
					</div>
					<CommandList>
						{!search && (
							<>
								<CommandGroup heading="Recent Searches">
									{recentSearches.map((item) => (
										<CommandItem key={item} onSelect={() => setSearch(item)}>
											<CommandItemIcon as={Clock} />
											<span className="flex-1">{item}</span>
										</CommandItem>
									))}
								</CommandGroup>
								<CommandGroup heading="Suggestions">
									{suggestions.map((item) => (
										<CommandItem key={item.label} onSelect={() => setOpen(false)}>
											<CommandItemIcon as={item.icon} />
											<span className="flex-1">{item.label}</span>
										</CommandItem>
									))}
								</CommandGroup>
							</>
						)}
					</CommandList>
					<CommandFooter>
						<div className="flex items-center gap-4 text-paragraph-xs text-text-soft-400">
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>Tab</CommandFooterKeyBox>
								<span>Autocomplete</span>
							</span>
							<span className="flex items-center gap-1">
								<CommandFooterKeyBox>↵</CommandFooterKeyBox>
								<span>Search</span>
							</span>
						</div>
					</CommandFooter>
				</CommandDialog>
			</>
		)
	},
}

// Medium size items
export const MediumSizeItems: Story = {
	render: function MediumSizeItemsCommand() {
		const [open, setOpen] = useState(false)

		return (
			<>
				<ButtonRoot variant="primary" onClick={() => setOpen(true)}>
					Open Command Menu
				</ButtonRoot>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogTitle className="sr-only">Command Menu</CommandDialogTitle>
					<CommandDialogDescription className="sr-only">Search commands</CommandDialogDescription>
					<div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-soft-200 group/cmd-input">
						<MagnifyingGlass className="size-5 text-text-soft-400" />
						<CommandInput placeholder="Search..." />
					</div>
					<CommandList>
						<CommandGroup heading="Medium Size Items">
							<CommandItem size="medium" onSelect={() => setOpen(false)}>
								<CommandItemIcon as={House} />
								<span className="flex-1">Home</span>
							</CommandItem>
							<CommandItem size="medium" onSelect={() => setOpen(false)}>
								<CommandItemIcon as={User} />
								<span className="flex-1">Profile</span>
							</CommandItem>
							<CommandItem size="medium" onSelect={() => setOpen(false)}>
								<CommandItemIcon as={Gear} />
								<span className="flex-1">Settings</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</>
		)
	},
}
