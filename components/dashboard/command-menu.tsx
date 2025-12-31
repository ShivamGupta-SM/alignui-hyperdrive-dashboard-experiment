"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import * as Command from "@/components/ui/navigation/command-menu"
import * as Kbd from "@/components/ui/primitives/kbd"
import {
	Plus,
	ShoppingBag,
	UserPlus,
	Wallet,
	House,
	Megaphone,
	Gear,
	MagnifyingGlass,
} from "@phosphor-icons/react"
import { routes } from "@/lib/routes"

interface CommandMenuProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
	const router = useRouter()
	const params = useParams<{ organizationId?: string }>()
	const [search, setSearch] = React.useState("")

	// Get organizationId from URL params for URL-based multi-tenancy
	const orgId = params.organizationId

	const handleSelect = (href: string) => {
		onOpenChange(false)
		setSearch("")
		router.push(href)
	}

	const handleAction = (action: string) => {
		onOpenChange(false)
		setSearch("")
		// Handle special actions
		switch (action) {
			case "fund-wallet":
				// Open fund wallet modal
				break
			case "invite-team":
				// Open invite modal
				break
			default:
				break
		}
	}

	// Early return if no orgId - command menu requires org context
	if (!orgId) {
		return null
	}

	return (
		<Command.Dialog open={open} onOpenChange={onOpenChange}>
			<Command.DialogTitle className="sr-only">Command Menu</Command.DialogTitle>
			<Command.DialogDescription className="sr-only">
				Search or type a command
			</Command.DialogDescription>

			{/* Search Input */}
			<div className="flex items-center gap-3 px-5 py-4 border-b border-stroke-soft-200 group/cmd-input">
				<MagnifyingGlass className="size-5 text-text-soft-400" />
				<Command.Input
					placeholder="Search or type a command..."
					value={search}
					onValueChange={setSearch}
				/>
				<Kbd.Root className="hidden sm:flex">⌘K</Kbd.Root>
			</div>

			<Command.List>
				{/* Quick Actions */}
				<Command.Group heading="Quick Actions">
					<Command.Item onSelect={() => handleSelect(routes.dashboard.campaigns.create(orgId))}>
						<Command.ItemIcon as={Plus} />
						<span className="flex-1">Create new campaign</span>
						<Kbd.Root>⌘N</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.products.create(orgId))}>
						<Command.ItemIcon as={ShoppingBag} />
						<span className="flex-1">Add new product</span>
						<Kbd.Root>⌘P</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleAction("invite-team")}>
						<Command.ItemIcon as={UserPlus} />
						<span className="flex-1">Invite team member</span>
						<Kbd.Root>⌘I</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleAction("fund-wallet")}>
						<Command.ItemIcon as={Wallet} />
						<span className="flex-1">Add funds to wallet</span>
						<Kbd.Root>⌘F</Kbd.Root>
					</Command.Item>
				</Command.Group>

				{/* Navigation */}
				<Command.Group heading="Navigation">
					<Command.Item onSelect={() => handleSelect(routes.dashboard.home(orgId))}>
						<Command.ItemIcon as={House} />
						<span className="flex-1">Go to Dashboard</span>
						<Kbd.Root>⌘1</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.campaigns.list(orgId))}>
						<Command.ItemIcon as={Megaphone} />
						<span className="flex-1">Go to Campaigns</span>
						<Kbd.Root>⌘2</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.enrollments.list(orgId))}>
						<Command.ItemIcon as={UserPlus} />
						<span className="flex-1">Go to Enrollments</span>
						<Kbd.Root>⌘3</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.products.list(orgId))}>
						<Command.ItemIcon as={ShoppingBag} />
						<span className="flex-1">Go to Products</span>
						<Kbd.Root>⌘4</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.wallet(orgId))}>
						<Command.ItemIcon as={Wallet} />
						<span className="flex-1">Go to Wallet</span>
						<Kbd.Root>⌘5</Kbd.Root>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.settings(orgId))}>
						<Command.ItemIcon as={Gear} />
						<span className="flex-1">Go to Settings</span>
						<Kbd.Root>⌘,</Kbd.Root>
					</Command.Item>
				</Command.Group>

				{/* Recent - using route helpers for consistency */}
				<Command.Group heading="Recent">
					<Command.Item onSelect={() => handleSelect(routes.dashboard.campaigns.detail(orgId, "1"))}>
						<Command.ItemIcon as={Megaphone} />
						<span className="flex-1">Summer Sale Campaign</span>
						<span className="text-paragraph-xs text-text-soft-400">Campaign</span>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.enrollments.detail(orgId, "1"))}>
						<Command.ItemIcon as={UserPlus} />
						<span className="flex-1">Rahul Mehta - Enrollment</span>
						<span className="text-paragraph-xs text-text-soft-400">Enrollment</span>
					</Command.Item>
					<Command.Item onSelect={() => handleSelect(routes.dashboard.products.detail(orgId, "1"))}>
						<Command.ItemIcon as={ShoppingBag} />
						<span className="flex-1">Wireless Earbuds Max</span>
						<span className="text-paragraph-xs text-text-soft-400">Product</span>
					</Command.Item>
				</Command.Group>
			</Command.List>

			<Command.Footer>
				<div className="flex items-center gap-4 text-paragraph-xs text-text-soft-400">
					<span className="flex items-center gap-1">
						<Command.FooterKeyBox>↑</Command.FooterKeyBox>
						<Command.FooterKeyBox>↓</Command.FooterKeyBox>
						<span>Navigate</span>
					</span>
					<span className="flex items-center gap-1">
						<Command.FooterKeyBox>↵</Command.FooterKeyBox>
						<span>Select</span>
					</span>
					<span className="flex items-center gap-1">
						<Command.FooterKeyBox>Esc</Command.FooterKeyBox>
						<span>Close</span>
					</span>
				</div>
			</Command.Footer>
		</Command.Dialog>
	)
}
