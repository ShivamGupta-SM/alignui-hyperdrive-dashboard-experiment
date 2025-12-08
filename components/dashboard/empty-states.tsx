'use client'

import * as React from 'react'
import Link from 'next/link'
import * as Button from '@/components/ui/button'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import {
  RiRocketLine,
  RiMegaphoneLine,
  RiCheckLine,
  RiShoppingBag3Line,
  RiTeamLine,
  RiSearchLine,
  RiWallet3Line,
  RiFileList3Line,
  RiAddLine,
  RiUserFollowLine,
  RiInboxLine,
  RiErrorWarningLine,
  RiWifiOffLine,
  RiLockLine,
} from '@remixicon/react'

// ============================================
// Welcome Empty State (New Organization)
// ============================================

export function WelcomeEmptyState() {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="primary">
          <RiRocketLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>Welcome to Hypedrive!</EmptyState.Title>
        <EmptyState.Description>
          Let's get started with your first campaign. Create a campaign to start receiving enrollments from shoppers.
        </EmptyState.Description>
        <div className="text-left text-paragraph-sm text-text-sub-600 mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-label-xs">1</span>
            <span>Fund your wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-label-xs">2</span>
            <span>Add your products</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-label-xs">3</span>
            <span>Create your first campaign</span>
          </div>
        </div>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button.Root variant="basic" asChild>
          <Link href="/dashboard/wallet">
            <Button.Icon as={RiWallet3Line} />
            Fund Wallet
          </Link>
        </Button.Root>
        <Button.Root variant="primary" asChild>
          <Link href="/dashboard/campaigns/create">
            <Button.Icon as={RiAddLine} />
            Create Campaign
          </Link>
        </Button.Root>
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Campaigns Empty State
// ============================================

export function NoCampaignsEmptyState() {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="gray">
          <RiMegaphoneLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>No campaigns yet</EmptyState.Title>
        <EmptyState.Description>
          Create your first campaign to start accepting enrollments from shoppers.
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button.Root variant="primary" asChild>
          <Link href="/dashboard/campaigns/create">
            <Button.Icon as={RiAddLine} />
            Create First Campaign
          </Link>
        </Button.Root>
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Pending Enrollments Empty State
// ============================================

export function NoPendingEnrollmentsEmptyState() {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="success">
          <RiCheckLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>All caught up!</EmptyState.Title>
        <EmptyState.Description>
          No enrollments require your review right now. New submissions will appear here automatically.
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button.Root variant="basic" asChild>
          <Link href="/dashboard/enrollments">View All Enrollments</Link>
        </Button.Root>
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Products Empty State
// ============================================

export function NoProductsEmptyState() {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="gray">
          <RiShoppingBag3Line className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>No products yet</EmptyState.Title>
        <EmptyState.Description>
          Add your products to create campaigns. Products help shoppers understand what they're buying.
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button.Root variant="primary" asChild>
          <Link href="/dashboard/products/new">
            <Button.Icon as={RiAddLine} />
            Add First Product
          </Link>
        </Button.Root>
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Team Members Empty State
// ============================================

interface NoTeamMembersEmptyStateProps {
  onInvite?: () => void
}

export function NoTeamMembersEmptyState({ onInvite }: NoTeamMembersEmptyStateProps) {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="gray">
          <RiTeamLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>Invite your team</EmptyState.Title>
        <EmptyState.Description>
          Add team members to help manage campaigns and review enrollments. Each member can have different permissions.
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button.Root variant="primary" onClick={onInvite}>
          <Button.Icon as={RiAddLine} />
          Invite First Member
        </Button.Root>
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Search Results Empty State
// ============================================

interface NoSearchResultsEmptyStateProps {
  query: string
  onClearSearch?: () => void
  onResetFilters?: () => void
}

export function NoSearchResultsEmptyState({
  query,
  onClearSearch,
  onResetFilters,
}: NoSearchResultsEmptyStateProps) {
  return (
    <EmptyState.Root size="medium">
      <EmptyState.Header>
        <EmptyState.Icon color="gray">
          <RiSearchLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>No results match "{query}"</EmptyState.Title>
        <EmptyState.Description>
          Try adjusting your search or filters to find what you need.
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        {onClearSearch && (
          <Button.Root variant="basic" onClick={onClearSearch}>
            Clear Search
          </Button.Root>
        )}
        {onResetFilters && (
          <Button.Root variant="basic" onClick={onResetFilters}>
            Reset Filters
          </Button.Root>
        )}
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Invoices Empty State
// ============================================

export function NoInvoicesEmptyState() {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="gray">
          <RiFileList3Line className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>No invoices yet</EmptyState.Title>
        <EmptyState.Description>
          Invoices will appear here once you have approved enrollments. Your first invoice will be generated at the end of the billing cycle.
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button.Root variant="basic" asChild>
          <Link href="/dashboard/enrollments">View Enrollments</Link>
        </Button.Root>
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Notifications Empty State
// ============================================

export function NoNotificationsEmptyState() {
  return (
    <EmptyState.Root size="medium">
      <EmptyState.Header showPattern={false}>
        <EmptyState.Icon color="gray">
          <RiInboxLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>No notifications</EmptyState.Title>
        <EmptyState.Description>
          You're all caught up! New notifications will appear here.
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  )
}

// ============================================
// Error Empty State
// ============================================

interface ErrorEmptyStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorEmptyState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content. Please try again.',
  onRetry,
}: ErrorEmptyStateProps) {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="error">
          <RiErrorWarningLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>{title}</EmptyState.Title>
        <EmptyState.Description>{description}</EmptyState.Description>
      </EmptyState.Content>
      {onRetry && (
        <EmptyState.Footer>
          <Button.Root variant="primary" onClick={onRetry}>
            Try Again
          </Button.Root>
        </EmptyState.Footer>
      )}
    </EmptyState.Root>
  )
}

// ============================================
// Network Error Empty State
// ============================================

interface NetworkErrorEmptyStateProps {
  onRetry?: () => void
}

export function NetworkErrorEmptyState({ onRetry }: NetworkErrorEmptyStateProps) {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="warning">
          <RiWifiOffLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>Connection lost</EmptyState.Title>
        <EmptyState.Description>
          Please check your internet connection and try again.
        </EmptyState.Description>
      </EmptyState.Content>
      {onRetry && (
        <EmptyState.Footer>
          <Button.Root variant="primary" onClick={onRetry}>
            Retry
          </Button.Root>
        </EmptyState.Footer>
      )}
    </EmptyState.Root>
  )
}

// ============================================
// Permission Denied Empty State
// ============================================

export function PermissionDeniedEmptyState() {
  return (
    <EmptyState.Root size="large">
      <EmptyState.Header>
        <EmptyState.Icon color="error">
          <RiLockLine className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>Access denied</EmptyState.Title>
        <EmptyState.Description>
          You don't have permission to view this content. Contact your organization admin for access.
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button.Root variant="basic" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button.Root>
      </EmptyState.Footer>
    </EmptyState.Root>
  )
}

// ============================================
// No Wallet Transactions Empty State
// ============================================

interface NoWalletTransactionsEmptyStateProps {
  onAddFunds?: () => void
}

export function NoWalletTransactionsEmptyState({ onAddFunds }: NoWalletTransactionsEmptyStateProps) {
  return (
    <EmptyState.Root size="medium">
      <EmptyState.Header>
        <EmptyState.Icon color="gray">
          <RiWallet3Line className="size-full" />
        </EmptyState.Icon>
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>No transactions yet</EmptyState.Title>
        <EmptyState.Description>
          Add funds to your wallet to get started with campaigns.
        </EmptyState.Description>
      </EmptyState.Content>
      {onAddFunds && (
        <EmptyState.Footer>
          <Button.Root variant="primary" onClick={onAddFunds}>
            <Button.Icon as={RiAddLine} />
            Add Funds
          </Button.Root>
        </EmptyState.Footer>
      )}
    </EmptyState.Root>
  )
}

