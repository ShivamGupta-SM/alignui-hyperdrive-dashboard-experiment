"use client"

import * as React from "react"
// import { useNotifications, useCounts, useNovu } from "@novu/react" // Removed - causing build issues
import { useRouter, useParams } from "next/navigation"
import { useMediaQuery } from "usehooks-ts"
import { useModal } from "@/hooks/ui"
import { toast } from "sonner"
import { logError, logDebug } from "@/lib/logging/error-logger-simple"
import {
	Bell,
	BellRinging,
	Check,
	CheckCircle,
	Checks,
	DotsThree,
	Envelope,
	EnvelopeOpen,
	Gear,
	Sparkle,
	UserPlus,
	Wallet,
	Warning,
	Archive,
	ArrowRight,
	UsersThree,
	FileText,
	ShoppingCart,
	CreditCard,
	Package,
	Clock,
	Alarm,
	CalendarBlank,
	X,
} from "@phosphor-icons/react"
import * as Drawer from "@/components/ui/layout/drawer"
import * as BottomSheet from "@/components/ui/layout/bottom-sheet"
import * as Dropdown from "@/components/ui/layout/dropdown"
import * as Button from "@/components/ui/primitives/button"
import * as CompactButton from "@/components/ui/primitives/compact-button"
import * as LinkButton from "@/components/ui/primitives/link-button"
import { cn } from "@/lib/utils"
import { routes } from "@/lib/routes"

// ============================================
// Notification Sound Utility
// ============================================

let audioContext: AudioContext | null = null

// Type guard for webkitAudioContext (Safari compatibility)
function hasWebkitAudioContext(window: Window): window is Window & { webkitAudioContext: typeof AudioContext } {
	return "webkitAudioContext" in window
}

function getAudioContext() {
	if (typeof window === "undefined") return null
	if (!audioContext) {
		// Use type guard for Safari compatibility
		const AudioContextClass = window.AudioContext || 
			(hasWebkitAudioContext(window) ? window.webkitAudioContext : null)
		
		if (!AudioContextClass) {
			return null
		}
		
		audioContext = new AudioContextClass()
	}
	return audioContext
}

/**
 * Play a subtle notification sound using Web Audio API
 * Creates a pleasant "ding" sound without requiring an audio file
 */
function playNotificationSound() {
	try {
		const ctx = getAudioContext()
		if (!ctx) return

		// Resume audio context if suspended (required for autoplay policy)
		if (ctx.state === "suspended") {
			ctx.resume()
		}

		const oscillator = ctx.createOscillator()
		const gainNode = ctx.createGain()

		oscillator.connect(gainNode)
		gainNode.connect(ctx.destination)

		// Pleasant notification tone
		oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
		oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1) // Drop to A4

		// Quick fade in/out for a soft "ding"
		gainNode.gain.setValueAtTime(0, ctx.currentTime)
		gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
		gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

		oscillator.start(ctx.currentTime)
		oscillator.stop(ctx.currentTime + 0.3)
	} catch (error) {
		// Silently fail - audio is not critical
		logDebug("Notification sound failed", { source: "NotificationCenter", data: { error } })
	}
}

/**
 * Vibrate device if supported (mobile)
 */
function vibrateDevice() {
	if (typeof navigator !== "undefined" && "vibrate" in navigator) {
		navigator.vibrate(100) // Short 100ms vibration
	}
}

// ============================================
// Types
// ============================================

// Extended notification type for Novu notifications with additional properties
interface NovuNotificationExtended {
	snoozedUntil?: string | null
	primaryAction?: { label: string; redirect?: { url: string }; isCompleted?: boolean }
	secondaryAction?: { label: string; redirect?: { url: string }; isCompleted?: boolean }
}

// Type guard for checking if notification has snoozedUntil property
function hasSnoozedUntil(n: unknown): n is { snoozedUntil?: string | null } {
	return typeof n === "object" && n !== null && "snoozedUntil" in n
}

// Type guard for checking if notification has action properties
function hasActionProperties(n: unknown): n is NovuNotificationExtended {
	return typeof n === "object" && n !== null && (
		"primaryAction" in n || "secondaryAction" in n || "snoozedUntil" in n
	)
}

// Helper to safely get snoozedUntil from notification
function getSnoozedUntil(n: unknown): string | null {
	if (hasSnoozedUntil(n)) {
		return n.snoozedUntil ?? null
	}
	return null
}

// Helper to safely get action properties from notification
function getActionProperties(n: unknown): NovuNotificationExtended {
	if (hasActionProperties(n)) {
		return {
			snoozedUntil: n.snoozedUntil ?? null,
			primaryAction: n.primaryAction,
			secondaryAction: n.secondaryAction,
		}
	}
	return {}
}

interface NotificationItemProps {
	notification: {
		id: string
		subject?: string
		body?: string
		avatar?: string
		read?: boolean
		archived?: boolean
		snoozedUntil?: string | null
		createdAt: string
		primaryAction?: { label: string; url?: string; isCompleted?: boolean }
		secondaryAction?: { label: string; url?: string; isCompleted?: boolean }
		data?: Record<string, unknown>
	}
	onRead: () => void
	onArchive: () => void
	onUnarchive: () => void
	onUnread: () => void
	onSnooze: (duration: number | Date) => void
	onUnsnooze: () => void
	onCompletePrimary: () => void
	onCompleteSecondary: () => void
	onRevertPrimary: () => void
	onRevertSecondary: () => void
	onClick: () => void
}

// ============================================
// Notification Icon Mapping
// ============================================

const notificationIcons: Record<
	string,
	{ icon: React.ElementType; bg: string; iconColor: string }
> = {
	enrollment_new: {
		icon: UserPlus,
		bg: "bg-primary-alpha-10 dark:bg-primary-base/20",
		iconColor: "text-primary-base",
	},
	enrollment_approved: {
		icon: CheckCircle,
		bg: "bg-success-lighter dark:bg-success-base/20",
		iconColor: "text-success-base",
	},
	enrollment_rejected: {
		icon: Warning,
		bg: "bg-error-lighter dark:bg-error-base/20",
		iconColor: "text-error-base",
	},
	campaign_approved: {
		icon: Sparkle,
		bg: "bg-success-lighter dark:bg-success-base/20",
		iconColor: "text-success-base",
	},
	campaign_rejected: {
		icon: Warning,
		bg: "bg-error-lighter dark:bg-error-base/20",
		iconColor: "text-error-base",
	},
	wallet_credit: {
		icon: Wallet,
		bg: "bg-success-lighter dark:bg-success-base/20",
		iconColor: "text-success-base",
	},
	wallet_low_balance: {
		icon: Warning,
		bg: "bg-warning-lighter dark:bg-warning-base/20",
		iconColor: "text-warning-base",
	},
	team_member_joined: {
		icon: UsersThree,
		bg: "bg-information-lighter dark:bg-information-base/20",
		iconColor: "text-information-base",
	},
	invoice_generated: {
		icon: FileText,
		bg: "bg-bg-weak-50 dark:bg-neutral-800",
		iconColor: "text-text-sub-600",
	},
	order: {
		icon: ShoppingCart,
		bg: "bg-primary-alpha-10 dark:bg-primary-base/20",
		iconColor: "text-primary-base",
	},
	payment: {
		icon: CreditCard,
		bg: "bg-success-lighter dark:bg-success-base/20",
		iconColor: "text-success-base",
	},
	product: {
		icon: Package,
		bg: "bg-information-lighter dark:bg-information-base/20",
		iconColor: "text-information-base",
	},
	default: {
		icon: Bell,
		bg: "bg-bg-weak-50 dark:bg-neutral-800",
		iconColor: "text-text-sub-600",
	},
}

function getNotificationStyle(type?: string) {
	if (!type) return notificationIcons.default
	return notificationIcons[type] || notificationIcons.default
}

// ============================================
// Time Formatting
// ============================================

function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diff = now.getTime() - date.getTime()
	const seconds = Math.floor(diff / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)
	const weeks = Math.floor(days / 7)

	if (seconds < 60) return "Just now"
	if (minutes < 60) return `${minutes}m`
	if (hours < 24) return `${hours}h`
	if (days < 7) return `${days}d`
	if (weeks < 4) return `${weeks}w`

	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function groupNotificationsByDate(notifications: NotificationItemProps["notification"][]) {
	const groups: { label: string; notifications: typeof notifications }[] = []
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)
	const lastWeek = new Date(today)
	lastWeek.setDate(lastWeek.getDate() - 7)

	const todayNotifications: typeof notifications = []
	const yesterdayNotifications: typeof notifications = []
	const thisWeekNotifications: typeof notifications = []
	const olderNotifications: typeof notifications = []

	for (const notification of notifications) {
		const date = new Date(notification.createdAt)
		if (date.toDateString() === today.toDateString()) {
			todayNotifications.push(notification)
		} else if (date.toDateString() === yesterday.toDateString()) {
			yesterdayNotifications.push(notification)
		} else if (date > lastWeek) {
			thisWeekNotifications.push(notification)
		} else {
			olderNotifications.push(notification)
		}
	}

	if (todayNotifications.length > 0)
		groups.push({ label: "Today", notifications: todayNotifications })
	if (yesterdayNotifications.length > 0)
		groups.push({ label: "Yesterday", notifications: yesterdayNotifications })
	if (thisWeekNotifications.length > 0)
		groups.push({ label: "This Week", notifications: thisWeekNotifications })
	if (olderNotifications.length > 0)
		groups.push({ label: "Earlier", notifications: olderNotifications })

	return groups
}

// ============================================
// NotificationItem Component
// ============================================

function NotificationItem({
	notification,
	onRead,
	onArchive,
	onUnarchive,
	onUnread,
	onSnooze,
	onUnsnooze,
	onCompletePrimary,
	onCompleteSecondary,
	onRevertPrimary,
	onRevertSecondary,
	onClick,
}: NotificationItemProps) {
	const [showActions, openActions, closeActions, toggleActions, setShowActions] = useModal(false)
	const [showSnoozeMenu, openSnoozeMenu, closeSnoozeMenu, toggleSnoozeMenu, setShowSnoozeMenu] = useModal(false)
	const [showCustomSnooze, openCustomSnooze, closeCustomSnooze, toggleCustomSnooze, setShowCustomSnooze] = useModal(false)
	const [customSnoozeDate, setCustomSnoozeDate] = React.useState("")
	const [customSnoozeTime, setCustomSnoozeTime] = React.useState("")
	const type = notification.data?.type as string | undefined
	const style = getNotificationStyle(type)
	const Icon = style.icon
	const isSnoozed = !!notification.snoozedUntil
	const isArchived = !!notification.archived

	// Get minimum date/time (3 minutes from now)
	const getMinDateTime = () => {
		const now = new Date()
		now.setMinutes(now.getMinutes() + 3)
		return now
	}

	const handleCustomSnoozeApply = () => {
		if (!customSnoozeDate || !customSnoozeTime) return
		const snoozeDateTime = new Date(`${customSnoozeDate}T${customSnoozeTime}`)
		if (snoozeDateTime <= getMinDateTime()) return
		onSnooze(snoozeDateTime)
		setShowCustomSnooze(false)
		setShowSnoozeMenu(false)
		setCustomSnoozeDate("")
		setCustomSnoozeTime("")
	}

	return (
		<div
			className={cn(
				"group relative px-4 py-3 cursor-pointer",
				"transition-all duration-200",
				"hover:bg-bg-weak-50 dark:hover:bg-neutral-900",
				!notification.read && "bg-primary-alpha-5 dark:bg-primary-base/5",
				"animate-in fade-in slide-in-from-bottom-2 duration-300"
			)}
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}
			onClick={onClick}
		>
			{/* Unread indicator line */}
			{!notification.read && (
				<div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-base rounded-r-full" />
			)}

			<div className="flex gap-3">
				{/* Icon */}
				<div
					className={cn(
						"size-10 rounded-xl flex items-center justify-center shrink-0",
						"ring-1 ring-inset ring-stroke-soft-200 dark:ring-neutral-700",
						style.bg
					)}
				>
					<Icon className={cn("size-5", style.iconColor)} weight="duotone" />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2">
						<h4
							className={cn(
								"text-label-sm line-clamp-1",
								notification.read
									? "text-text-sub-600 dark:text-neutral-400"
									: "text-text-strong-950 dark:text-neutral-50 font-medium"
							)}
						>
							{notification.subject || "Notification"}
						</h4>
						<div className="flex items-center gap-1.5 shrink-0">
							<span className="text-paragraph-xs text-text-soft-400 dark:text-neutral-500">
								{formatRelativeTime(notification.createdAt)}
							</span>
							{!notification.read && (
								<span className="size-2 rounded-full bg-primary-base animate-pulse" />
							)}
						</div>
					</div>

					<p className="text-paragraph-sm text-text-sub-600 dark:text-neutral-400 line-clamp-2 mt-0.5">
						{notification.body}
					</p>

					{/* Primary and Secondary Actions */}
					{(notification.primaryAction || notification.secondaryAction) && (
						<div className="flex items-center gap-2 mt-2">
							{notification.primaryAction && (
								<LinkButton.Root
									variant={notification.primaryAction.isCompleted ? "gray" : "primary"}
									size="small"
									onClick={(e) => {
										e.stopPropagation()
										if (notification.primaryAction?.isCompleted) {
											onRevertPrimary()
										} else {
											onCompletePrimary()
											onClick()
										}
									}}
									className={cn(
										notification.primaryAction.isCompleted && "line-through opacity-70"
									)}
								>
									{notification.primaryAction.isCompleted && (
										<LinkButton.Icon as={CheckCircle} weight="fill" />
									)}
									{notification.primaryAction.label}
									{!notification.primaryAction.isCompleted && (
										<LinkButton.Icon as={ArrowRight} weight="bold" />
									)}
								</LinkButton.Root>
							)}
							{notification.secondaryAction && (
								<LinkButton.Root
									variant="gray"
									size="small"
									onClick={(e) => {
										e.stopPropagation()
										if (notification.secondaryAction?.isCompleted) {
											onRevertSecondary()
										} else {
											onCompleteSecondary()
										}
									}}
									className={cn(
										notification.secondaryAction.isCompleted && "line-through opacity-70"
									)}
								>
									{notification.secondaryAction.isCompleted && (
										<LinkButton.Icon as={CheckCircle} weight="fill" />
									)}
									{notification.secondaryAction.label}
								</LinkButton.Root>
							)}
						</div>
					)}
				</div>

				{/* Quick Actions - for non-snoozed, non-archived notifications */}
				{showActions && !isSnoozed && !isArchived && (
					<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-bg-white-0 dark:bg-neutral-900 rounded-lg shadow-custom-sm ring-1 ring-stroke-soft-200 dark:ring-neutral-700 p-1 animate-in fade-in zoom-in-95 duration-150">
						{notification.read ? (
							<CompactButton.Root
								variant="ghost"
								size="medium"
								onClick={(e) => {
									e.stopPropagation()
									onUnread()
								}}
								className="size-8 text-text-soft-400 hover:text-primary-base hover:bg-primary-alpha-10 dark:hover:bg-primary-base/20"
								title="Mark as unread"
								aria-label="Mark as unread"
							>
								<CompactButton.Icon><Envelope weight="duotone" /></CompactButton.Icon>
							</CompactButton.Root>
						) : (
							<CompactButton.Root
								variant="ghost"
								size="medium"
								onClick={(e) => {
									e.stopPropagation()
									onRead()
								}}
								className="size-8 text-text-soft-400 hover:text-success-base hover:bg-success-lighter dark:hover:bg-success-base/20"
								title="Mark as read"
								aria-label="Mark as read"
							>
								<CompactButton.Icon><Check weight="bold" /></CompactButton.Icon>
							</CompactButton.Root>
						)}
						{/* Snooze Dropdown */}
						<Dropdown.Root
							open={showSnoozeMenu}
							onOpenChange={(open) => {
								setShowSnoozeMenu(open)
								if (!open) setShowCustomSnooze(false)
							}}
						>
							<Dropdown.Trigger asChild>
								<CompactButton.Root
									variant="ghost"
									size="medium"
									onClick={(e) => e.stopPropagation()}
									className="size-8 text-text-soft-400 hover:text-warning-base hover:bg-warning-lighter dark:hover:bg-warning-base/20"
									title="Snooze"
									aria-label="Snooze notification"
								>
									<CompactButton.Icon><Clock weight="duotone" /></CompactButton.Icon>
								</CompactButton.Root>
							</Dropdown.Trigger>
							<Dropdown.Content align="end" width="sm">
								{!showCustomSnooze ? (
									<Dropdown.Group>
										<Dropdown.Label>Snooze for</Dropdown.Label>
										<Dropdown.Item
											onClick={(e) => {
												e.stopPropagation()
												onSnooze(15)
												setShowSnoozeMenu(false)
											}}
										>
											<Dropdown.ItemIcon as={Clock} />
											15 minutes
										</Dropdown.Item>
										<Dropdown.Item
											onClick={(e) => {
												e.stopPropagation()
												onSnooze(60)
												setShowSnoozeMenu(false)
											}}
										>
											<Dropdown.ItemIcon as={Clock} />1 hour
										</Dropdown.Item>
										<Dropdown.Item
											onClick={(e) => {
												e.stopPropagation()
												onSnooze(240)
												setShowSnoozeMenu(false)
											}}
										>
											<Dropdown.ItemIcon as={Clock} />4 hours
										</Dropdown.Item>
										<Dropdown.Item
											onClick={(e) => {
												e.stopPropagation()
												onSnooze(1440)
												setShowSnoozeMenu(false)
											}}
										>
											<Dropdown.ItemIcon as={Alarm} />
											Tomorrow
										</Dropdown.Item>
										<Dropdown.Item
											onClick={(e) => {
												e.stopPropagation()
												onSnooze(10080)
												setShowSnoozeMenu(false)
											}}
										>
											<Dropdown.ItemIcon as={CalendarBlank} />
											Next week
										</Dropdown.Item>
										<Dropdown.Separator className="my-1 h-px bg-stroke-soft-200" />
										<Dropdown.Item
											onClick={(e) => {
												e.stopPropagation()
												setShowCustomSnooze(true)
											}}
										>
											<Dropdown.ItemIcon as={CalendarBlank} />
											Custom time...
										</Dropdown.Item>
									</Dropdown.Group>
								) : (
									<div className="p-3 min-w-[240px]" onClick={(e) => e.stopPropagation()}>
										<div className="flex items-center justify-between mb-3">
											<span className="text-label-sm text-text-strong-950 dark:text-neutral-50">
												Custom snooze
											</span>
											<CompactButton.Root
												variant="ghost"
												size="medium"
												onClick={() => setShowCustomSnooze(false)}
												className="size-6"
												aria-label="Close custom snooze"
											>
												<CompactButton.Icon><X weight="bold" /></CompactButton.Icon>
											</CompactButton.Root>
										</div>
										<div className="space-y-2">
											<div>
												<label
													htmlFor={`snooze-date-${notification.id}`}
													className="text-label-xs text-text-sub-600 dark:text-neutral-400 mb-1 block"
												>
													Date
												</label>
												<input
													id={`snooze-date-${notification.id}`}
													type="date"
													value={customSnoozeDate}
													onChange={(e) => setCustomSnoozeDate(e.target.value)}
													min={new Date().toISOString().split("T")[0]}
													className="w-full px-3 py-2 rounded-lg text-paragraph-sm bg-bg-white-0 dark:bg-neutral-900 border border-stroke-soft-200 dark:border-neutral-700 text-text-strong-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-base"
												/>
											</div>
											<div>
												<label
													htmlFor={`snooze-time-${notification.id}`}
													className="text-label-xs text-text-sub-600 dark:text-neutral-400 mb-1 block"
												>
													Time
												</label>
												<input
													id={`snooze-time-${notification.id}`}
													type="time"
													value={customSnoozeTime}
													onChange={(e) => setCustomSnoozeTime(e.target.value)}
													className="w-full px-3 py-2 rounded-lg text-paragraph-sm bg-bg-white-0 dark:bg-neutral-900 border border-stroke-soft-200 dark:border-neutral-700 text-text-strong-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-base"
												/>
											</div>
										</div>
										<div className="flex gap-2 mt-3">
											<Button.Root
												variant="neutral"
												size="small"
												onClick={() => {
													setShowCustomSnooze(false)
													setCustomSnoozeDate("")
													setCustomSnoozeTime("")
												}}
												className="flex-1"
											>
												Cancel
											</Button.Root>
											<Button.Root
												variant="primary"
												size="small"
												onClick={handleCustomSnoozeApply}
												disabled={!customSnoozeDate || !customSnoozeTime}
												className="flex-1"
											>
												Apply
											</Button.Root>
										</div>
									</div>
								)}
							</Dropdown.Content>
						</Dropdown.Root>
						<CompactButton.Root
							variant="ghost"
							size="medium"
							onClick={(e) => {
								e.stopPropagation()
								onArchive()
							}}
							className="size-8 text-text-soft-400 hover:text-text-strong-950 dark:hover:text-neutral-50 hover:bg-bg-weak-50 dark:hover:bg-neutral-800"
							title="Archive"
							aria-label="Archive notification"
						>
							<CompactButton.Icon><Archive weight="duotone" /></CompactButton.Icon>
						</CompactButton.Root>
					</div>
				)}

				{/* Unsnooze Action - shown for snoozed notifications */}
				{showActions && isSnoozed && !isArchived && (
					<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-bg-white-0 dark:bg-neutral-900 rounded-lg shadow-custom-sm ring-1 ring-stroke-soft-200 dark:ring-neutral-700 p-1 animate-in fade-in zoom-in-95 duration-150">
						<Button.Root
							variant="ghost"
							size="xsmall"
							onClick={(e) => {
								e.stopPropagation()
								onUnsnooze()
							}}
							className="gap-1.5"
							title="Unsnooze"
						>
							<Button.Icon><Bell weight="duotone" /></Button.Icon>
							Unsnooze
						</Button.Root>
					</div>
				)}

				{/* Unarchive Action - shown for archived notifications */}
				{showActions && isArchived && (
					<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-bg-white-0 dark:bg-neutral-900 rounded-lg shadow-custom-sm ring-1 ring-stroke-soft-200 dark:ring-neutral-700 p-1 animate-in fade-in zoom-in-95 duration-150">
						<Button.Root
							variant="ghost"
							size="xsmall"
							onClick={(e) => {
								e.stopPropagation()
								onUnarchive()
							}}
							className="gap-1.5"
							title="Unarchive"
						>
							<Button.Icon><Archive weight="duotone" /></Button.Icon>
							Unarchive
						</Button.Root>
					</div>
				)}
			</div>
		</div>
	)
}

// ============================================
// NotificationBell Component
// ============================================

interface NotificationBellProps {
	onClick: () => void
	count?: number
	isOpen?: boolean
}

export function NotificationBell({ onClick, count = 0, isOpen = false }: NotificationBellProps) {
	return (
		<CompactButton.Root
			variant="stroke"
			size="xlarge"
			fullRadius
			onClick={onClick}
			className={cn(
				"relative group",
				isOpen && "ring-primary-base ring-2 text-primary-base"
			)}
			aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
			aria-expanded={isOpen}
		>
			{count > 0 ? (
				<BellRinging
					className="size-5 transition-transform duration-300 group-hover:rotate-12"
					weight="duotone"
				/>
			) : (
				<Bell
					className="size-5 transition-transform duration-300 group-hover:rotate-12"
					weight="duotone"
				/>
			)}

			{count > 0 && (
				<span
					className={cn(
						"absolute -right-0.5 -top-0.5",
						"flex items-center justify-center",
						"size-5 sm:size-[18px] rounded-full",
						"bg-error-base text-white",
						"text-label-xs font-semibold",
						"ring-2 ring-bg-white-0 dark:ring-neutral-900",
						"animate-in zoom-in duration-200"
					)}
				>
					{count > 99 ? "99+" : count > 9 ? "9+" : count}
				</span>
			)}
		</CompactButton.Root>
	)
}

// ============================================
// NotificationPanel Component
// ============================================

interface NotificationPanelProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Empty state shown when Novu is not configured or not ready
 */
function NotificationPanelEmpty({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
	const router = useRouter()
	const params = useParams<{ organizationId?: string }>()

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200 dark:border-neutral-800">
				<div className="flex items-center gap-3">
					<div className="size-10 rounded-xl bg-gradient-to-br from-primary-base to-primary-dark flex items-center justify-center shadow-sm">
						<Bell className="size-5 text-white" weight="fill" />
					</div>
					<div>
						<h2 className="text-label-md text-text-strong-950 dark:text-neutral-50">
							Notifications
						</h2>
						<p className="text-paragraph-xs text-text-sub-600 dark:text-neutral-400">
							All caught up
						</p>
					</div>
				</div>
			</div>

			{/* Empty State */}
			<div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
				<div className="size-16 rounded-2xl bg-gradient-to-br from-bg-weak-50 to-bg-soft-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center mb-4">
					<Bell className="size-8 text-text-soft-400 dark:text-neutral-500" weight="duotone" />
				</div>
				<p className="text-label-md text-text-strong-950 dark:text-neutral-50 mb-1">
					Notifications unavailable
				</p>
				<p className="text-paragraph-sm text-text-sub-600 dark:text-neutral-400 max-w-[240px]">
					Notification service is not configured or still loading.
				</p>
			</div>

			{/* Footer */}
			<div
				className="border-t border-stroke-soft-200 dark:border-neutral-800 px-4 py-3"
				style={{ "--safe-bottom": "env(safe-area-inset-bottom, 0px)", paddingBottom: "calc(0.75rem + var(--safe-bottom))" } as React.CSSProperties}
			>
				<Button.Root
					variant="ghost"
					size="medium"
					onClick={() => {
						const settingsUrl = params.organizationId
							? routes.dashboard.settings(params.organizationId, "notifications")
							: routes.dashboard.root
						router.push(settingsUrl)
						onOpenChange(false)
					}}
					className="w-full min-h-11 rounded-xl"
				>
					Notification Settings
				</Button.Root>
			</div>
		</div>
	)
}

/**
 * Main notification panel content that uses Novu hooks.
 * Only render this component when inside NovuProvider.
 */
function NotificationPanelWithNovu({
	onOpenChange,
}: {
	onOpenChange: (open: boolean) => void
}) {
	// Novu removed - show empty state instead
	return <NotificationPanelEmpty onOpenChange={onOpenChange} />
}

/**
 * Wrapper that conditionally renders Novu content or empty state
 * Novu removed - always show empty state for now
 */
function NotificationPanelContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
	// Novu removed - always show empty state
	return <NotificationPanelEmpty onOpenChange={onOpenChange} />
}

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
	const isMobile = useMediaQuery("(max-width: 639px)")

	// On mobile, use bottom sheet
	if (isMobile) {
		return (
			<BottomSheet.Root open={open} onOpenChange={onOpenChange} snapPoints={[0.9]}>
				<BottomSheet.Content showClose={false} className="h-[90vh]">
					<NotificationPanelContent onOpenChange={onOpenChange} />
				</BottomSheet.Content>
			</BottomSheet.Root>
		)
	}

	// On desktop, use drawer
	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content accessibilityTitle="Notifications" className="sm:max-w-[420px]">
				<NotificationPanelContent onOpenChange={onOpenChange} />
			</Drawer.Content>
		</Drawer.Root>
	)
}

// ============================================
// NotificationCenter Component (Main Export)
// ============================================

/**
 * Internal component that uses Novu hooks.
 * Novu removed - showing basic bell instead
 */
function NotificationCenterInner() {
	const [isOpen, open, close, toggle, setIsOpen] = useModal(false)
	// Novu removed - show basic bell with 0 count
	const unreadCount = 0

	// Novu removed - no real-time events
	/* Original Novu code commented out
	const novu = useNovu()
	const { counts, refetch: refetchCounts } = useCounts({ filters: [{ read: false }] })
	const unreadCount = counts?.[0]?.count || 0
	const router = useRouter()

	// Subscribe to real-time notification events
	React.useEffect(() => {
		if (!novu) return
		// ... rest of Novu code
	}, [novu, refetchCounts, router])
	*/

	return (
		<>
			<NotificationBell onClick={() => setIsOpen(true)} count={unreadCount} isOpen={isOpen} />
			<NotificationPanel open={isOpen} onOpenChange={setIsOpen} />
		</>
	)
}

// Novu removed - was causing build issues with createContext
// export const NovuReadyContext = React.createContext<boolean>(false)
// 
// export function NovuReadyProvider({ children }: { children: React.ReactNode }) {
// 	return <NovuReadyContext.Provider value={true}>{children}</NovuReadyContext.Provider>
// }

/**
 * Safe wrapper that checks for Novu context before rendering.
 * Falls back to a loading bell while Novu initializes.
 * Once Novu is ready, renders the full notification center.
 */
export function NotificationCenter() {
	// Novu removed - always use inner component which shows basic bell
	return <NotificationCenterInner />
}

// ============================================
// Fallback Bell (when Novu is not configured)
// ============================================

export function FallbackNotificationBell({
	count = 0,
	onClick,
}: {
	count?: number
	onClick?: () => void
}) {
	return (
		<CompactButton.Root
			variant="stroke"
			size="xlarge"
			fullRadius
			onClick={onClick}
			className="relative group"
			aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
		>
			<Bell
				className="size-5 transition-transform duration-300 group-hover:rotate-12"
				weight="duotone"
			/>
			{count > 0 && (
				<span className="absolute -right-0.5 -top-0.5 flex size-5 sm:size-[18px] items-center justify-center rounded-full bg-error-base text-white text-label-xs font-semibold ring-2 ring-bg-white-0 dark:ring-neutral-900 animate-pulse">
					{count > 9 ? "9+" : count}
				</span>
			)}
		</CompactButton.Root>
	)
}
