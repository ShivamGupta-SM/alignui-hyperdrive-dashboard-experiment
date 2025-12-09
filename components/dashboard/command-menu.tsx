'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import * as Command from '@/components/ui/command-menu'
import {
  Plus,
  ShoppingBag,
  UserPlus,
  Wallet,
  House,
  Megaphone,
  FileText,
  UsersThree,
  Gear,
  MagnifyingGlass,
  Clock,
} from '@phosphor-icons/react'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  const handleSelect = (href: string) => {
    onOpenChange(false)
    setSearch('')
    router.push(href)
  }

  const handleAction = (action: string) => {
    onOpenChange(false)
    setSearch('')
    // Handle special actions
    switch (action) {
      case 'fund-wallet':
        // Open fund wallet modal
        break
      case 'invite-team':
        // Open invite modal
        break
      default:
        break
    }
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
        <kbd className="hidden sm:flex items-center gap-0.5 text-paragraph-xs text-text-soft-400">
          <span className="text-label-xs">⌘</span>K
        </kbd>
      </div>

      <Command.List>
        {/* Quick Actions */}
        <Command.Group heading="Quick Actions">
          <Command.Item onSelect={() => handleSelect('/dashboard/campaigns/create')}>
            <Command.ItemIcon as={Plus} />
            <span className="flex-1">Create new campaign</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘N</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/products/new')}>
            <Command.ItemIcon as={ShoppingBag} />
            <span className="flex-1">Add new product</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘P</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleAction('invite-team')}>
            <Command.ItemIcon as={UserPlus} />
            <span className="flex-1">Invite team member</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘I</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleAction('fund-wallet')}>
            <Command.ItemIcon as={Wallet} />
            <span className="flex-1">Add funds to wallet</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘F</kbd>
          </Command.Item>
        </Command.Group>

        {/* Navigation */}
        <Command.Group heading="Navigation">
          <Command.Item onSelect={() => handleSelect('/dashboard')}>
            <Command.ItemIcon as={House} />
            <span className="flex-1">Go to Dashboard</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘1</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/campaigns')}>
            <Command.ItemIcon as={Megaphone} />
            <span className="flex-1">Go to Campaigns</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘2</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/enrollments')}>
            <Command.ItemIcon as={UserPlus} />
            <span className="flex-1">Go to Enrollments</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘3</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/products')}>
            <Command.ItemIcon as={ShoppingBag} />
            <span className="flex-1">Go to Products</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘4</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/wallet')}>
            <Command.ItemIcon as={Wallet} />
            <span className="flex-1">Go to Wallet</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘5</kbd>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/settings')}>
            <Command.ItemIcon as={Gear} />
            <span className="flex-1">Go to Settings</span>
            <kbd className="text-paragraph-xs text-text-soft-400">⌘,</kbd>
          </Command.Item>
        </Command.Group>

        {/* Recent */}
        <Command.Group heading="Recent">
          <Command.Item onSelect={() => handleSelect('/dashboard/campaigns/1')}>
            <Command.ItemIcon as={Megaphone} />
            <span className="flex-1">Summer Sale Campaign</span>
            <span className="text-paragraph-xs text-text-soft-400">Campaign</span>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/enrollments/1')}>
            <Command.ItemIcon as={UserPlus} />
            <span className="flex-1">Rahul Mehta - Enrollment</span>
            <span className="text-paragraph-xs text-text-soft-400">Enrollment</span>
          </Command.Item>
          <Command.Item onSelect={() => handleSelect('/dashboard/products/1')}>
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

