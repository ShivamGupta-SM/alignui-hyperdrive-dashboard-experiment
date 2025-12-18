/**
 * Organization Status Banner
 *
 * Shows contextual banner based on organization approval status.
 * Auto-hides when organization is approved.
 *
 * Usage:
 * ```tsx
 * <StatusBanner />
 * ```
 */

"use client"

import React from "react"
import Link from "next/link"
import { useOrganization } from "@/features/organizations"
import * as Button from "@/components/ui/primitives/button"
import {
  Clock,
  Warning,
  CheckCircle,
  XCircle,
  ArrowRight,
  Pencil,
  Info,
} from "@phosphor-icons/react"
import { cn } from "@/utils/cn"

// =============================================================================
// Types
// =============================================================================

interface StatusConfig {
  bg: string
  border: string
  icon: React.ReactNode
  iconColor: string
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
}

// =============================================================================
// Status Configurations
// =============================================================================

const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    bg: "bg-neutral-50",
    border: "border-neutral-200",
    iconColor: "text-neutral-500",
    icon: <Pencil className="size-5" weight="duotone" />,
    title: "Complete Your Profile",
    message: "Your organization profile is incomplete. Complete it to submit for approval.",
    action: {
      label: "Continue Setup",
      href: "/onboarding",
    },
  },
  pending: {
    bg: "bg-warning-50",
    border: "border-warning-200",
    iconColor: "text-warning-600",
    icon: <Clock className="size-5" weight="duotone" />,
    title: "Pending Approval",
    message: "Your organization is under review. This usually takes 24-48 hours.",
    action: {
      label: "View Status",
      href: "/onboarding/pending",
    },
  },
  rejected: {
    bg: "bg-error-50",
    border: "border-error-200",
    iconColor: "text-error-600",
    icon: <XCircle className="size-5" weight="duotone" />,
    title: "Application Rejected",
    message: "", // Will be replaced with rejection reason
    action: {
      label: "Edit & Resubmit",
      href: "/onboarding",
    },
  },
  banned: {
    bg: "bg-error-50",
    border: "border-error-300",
    iconColor: "text-error-700",
    icon: <Warning className="size-5" weight="duotone" />,
    title: "Account Suspended",
    message: "Your organization has been suspended. Please contact support.",
    action: {
      label: "Contact Support",
      href: "/support",
    },
  },
}

// =============================================================================
// Component
// =============================================================================

export function StatusBanner() {
  const { organization, isDraft, isPending, isApproved, isRejected, isBanned, isLoading } =
    useOrganization()

  // Don't show banner for approved orgs or while loading
  if (isLoading || isApproved || !organization) {
    return null
  }

  // Get config based on status
  let config: StatusConfig | null = null

  if (isDraft) {
    config = STATUS_CONFIG.draft
  } else if (isPending) {
    config = STATUS_CONFIG.pending
  } else if (isRejected) {
    config = {
      ...STATUS_CONFIG.rejected,
      message: (organization as { rejectionReason?: string }).rejectionReason || "Please review and update your application.",
    }
  } else if (isBanned) {
    config = STATUS_CONFIG.banned
  }

  if (!config) return null

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3 rounded-lg border mb-4",
        config.bg,
        config.border
      )}
    >
      <div className="flex items-center gap-3">
        <div className={config.iconColor}>{config.icon}</div>
        <div>
          <p className="font-medium text-text-strong-950 text-sm">{config.title}</p>
          <p className="text-text-sub-600 text-sm">{config.message}</p>
        </div>
      </div>

      {config.action && (
        <Link href={config.action.href}>
          <Button.Root variant="basic" size="small">
            {config.action.label}
            <ArrowRight className="size-4 ml-1" />
          </Button.Root>
        </Link>
      )}
    </div>
  )
}

// =============================================================================
// Compact Version (for sidebar/header)
// =============================================================================

export function StatusBadge() {
  const { isDraft, isApprovalPending, isApproved, isRejected, isBanned, isPending } = useOrganization()

  if (isPending || isApproved) return null

  const config = {
    draft: { label: "Draft", bg: "bg-neutral-100", text: "text-neutral-600" },
    pending: { label: "Pending", bg: "bg-warning-100", text: "text-warning-700" },
    rejected: { label: "Rejected", bg: "bg-error-100", text: "text-error-700" },
    banned: { label: "Suspended", bg: "bg-error-100", text: "text-error-700" },
  }

  let status: keyof typeof config | null = null
  if (isDraft) status = "draft"
  else if (isApprovalPending) status = "pending"
  else if (isRejected) status = "rejected"
  else if (isBanned) status = "banned"

  if (!status) return null

  const { label, bg, text } = config[status]

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", bg, text)}>{label}</span>
  )
}

// =============================================================================
// Inline Status Indicator (for cards/lists)
// =============================================================================

export function StatusIndicator({ size = "sm" }: { size?: "sm" | "md" }) {
  const { isDraft, isApprovalPending, isApproved, isRejected, isBanned, isPending } = useOrganization()

  if (isPending) return null

  const iconSize = size === "sm" ? "size-4" : "size-5"

  if (isApproved) {
    return (
      <div className="flex items-center gap-1.5 text-success-600">
        <CheckCircle className={iconSize} weight="duotone" />
        <span className="text-xs font-medium">Approved</span>
      </div>
    )
  }

  if (isApprovalPending) {
    return (
      <div className="flex items-center gap-1.5 text-warning-600">
        <Clock className={iconSize} weight="duotone" />
        <span className="text-xs font-medium">Pending</span>
      </div>
    )
  }

  if (isDraft) {
    return (
      <div className="flex items-center gap-1.5 text-neutral-500">
        <Pencil className={iconSize} weight="duotone" />
        <span className="text-xs font-medium">Draft</span>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="flex items-center gap-1.5 text-error-600">
        <XCircle className={iconSize} weight="duotone" />
        <span className="text-xs font-medium">Rejected</span>
      </div>
    )
  }

  if (isBanned) {
    return (
      <div className="flex items-center gap-1.5 text-error-700">
        <Warning className={iconSize} weight="duotone" />
        <span className="text-xs font-medium">Suspended</span>
      </div>
    )
  }

  return null
}

// =============================================================================
// Info Banner (for pages that need full functionality)
// =============================================================================

export function RestrictedFeatureBanner({ feature }: { feature: string }) {
  const { isPending, isDraft, isRejected } = useOrganization()

  if (!isPending && !isDraft && !isRejected) return null

  let message = ""
  let actionHref = "/onboarding"
  let actionLabel = "Complete Setup"

  if (isPending) {
    message = `${feature} is available once your organization is approved.`
    actionHref = "/onboarding/pending"
    actionLabel = "Check Status"
  } else if (isDraft) {
    message = `Complete your organization setup to access ${feature}.`
  } else if (isRejected) {
    message = `Update your organization details to regain access to ${feature}.`
    actionLabel = "Edit Application"
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-neutral-200 bg-neutral-50 mb-4">
      <div className="flex items-center gap-3">
        <Info className="size-5 text-neutral-500" weight="duotone" />
        <p className="text-text-sub-600 text-sm">{message}</p>
      </div>
      <Link href={actionHref}>
        <Button.Root variant="basic" size="small">
          {actionLabel}
        </Button.Root>
      </Link>
    </div>
  )
}
