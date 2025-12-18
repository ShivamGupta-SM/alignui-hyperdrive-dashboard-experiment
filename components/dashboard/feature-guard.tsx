/**
 * Feature Guard Component
 *
 * Disables features for non-approved organizations.
 * Shows tooltip explaining why feature is disabled.
 *
 * Usage:
 * ```tsx
 * <FeatureGuard feature="create_campaign">
 *   <Button>Create Campaign</Button>
 * </FeatureGuard>
 * ```
 */

"use client"

import React from "react"
import * as Tooltip from "@/components/ui/layout/tooltip"
import { useOrganization } from "@/features/organizations"
import { Lock } from "@phosphor-icons/react"

// =============================================================================
// Types
// =============================================================================

type Feature =
  | "create_campaign"
  | "add_product"
  | "fund_wallet"
  | "invite_team"
  | "create_coupon"
  | "manage_settings"

interface FeatureGuardProps {
  children: React.ReactNode
  feature: Feature
  /** Custom message to show when disabled */
  message?: string
  /** Show lock icon overlay on disabled state */
  showLockIcon?: boolean
  /** Render custom fallback instead of disabled children */
  fallback?: React.ReactNode
  /** Hide completely instead of showing disabled state */
  hideWhenDisabled?: boolean
}

// =============================================================================
// Feature Messages
// =============================================================================

const FEATURE_MESSAGES: Record<Feature, string> = {
  create_campaign: "Campaign creation available after organization approval",
  add_product: "Add products after your organization is approved",
  fund_wallet: "Wallet access requires organization approval",
  invite_team: "Team invites available after approval",
  create_coupon: "Coupon creation requires approval",
  manage_settings: "Settings available after organization approval",
}

// =============================================================================
// Component
// =============================================================================

export function FeatureGuard({
  children,
  feature,
  message,
  showLockIcon = false,
  fallback,
  hideWhenDisabled = false,
}: FeatureGuardProps) {
  const { isApproved, isApprovalPending, isDraft, isPending } = useOrganization()

  // Loading state - minimal flat skeleton matching dashboard style
  if (isPending) {
    return (
      <span className="inline-block">
        <div className="h-9 w-24 rounded-lg bg-bg-weak-50 border border-stroke-soft-200 animate-pulse" />
      </span>
    )
  }

  // Approved - show children normally
  if (isApproved) {
    return <>{children}</>
  }

  // Hide completely if requested
  if (hideWhenDisabled) {
    return null
  }

  // Get message
  const tooltipMessage = message || FEATURE_MESSAGES[feature]

  // Custom fallback
  if (fallback) {
    return (
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span className="cursor-not-allowed">{fallback}</span>
          </Tooltip.Trigger>
          <Tooltip.Content side="top" className="max-w-[250px]">
            {tooltipMessage}
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    )
  }

  // Default: Disabled state with tooltip
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="cursor-not-allowed inline-block">
            <div className="relative opacity-50 pointer-events-none select-none">
              {children}
              {showLockIcon && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-white-0/50 rounded">
                  <Lock className="size-4 text-text-soft-400" weight="duotone" />
                </div>
              )}
            </div>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="max-w-[250px]">
          <div className="flex items-start gap-2">
            <Lock className="size-4 text-text-soft-400 flex-shrink-0 mt-0.5" />
            <span>{tooltipMessage}</span>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

// =============================================================================
// Convenience Components
// =============================================================================

/**
 * Guard for campaign creation
 */
export function CampaignGuard({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="create_campaign">{children}</FeatureGuard>
}

/**
 * Guard for product addition
 */
export function ProductGuard({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="add_product">{children}</FeatureGuard>
}

/**
 * Guard for wallet operations
 */
export function WalletGuard({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="fund_wallet">{children}</FeatureGuard>
}

/**
 * Guard for team invites
 */
export function TeamGuard({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="invite_team">{children}</FeatureGuard>
}

// =============================================================================
// Hook for Programmatic Checks
// =============================================================================

/**
 * Hook to check if a feature is enabled
 *
 * Usage:
 * ```tsx
 * const { isEnabled, message } = useFeatureEnabled("create_campaign")
 * ```
 */
export function useFeatureEnabled(feature: Feature) {
  const { isApproved, isPending, isDraft, isRejected } = useOrganization()

  const isEnabled = isApproved
  const reason = !isApproved
    ? isPending
      ? "Your organization is pending approval"
      : isDraft
        ? "Please complete onboarding first"
        : isRejected
          ? "Your organization was rejected. Please resubmit."
          : "Organization approval required"
    : null

  return {
    isEnabled,
    reason,
    message: FEATURE_MESSAGES[feature],
  }
}
