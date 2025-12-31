"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import * as Drawer from "@/components/ui/layout/drawer"
import * as Button from "@/components/ui/primitives/button"
import * as CompactButton from "@/components/ui/primitives/compact-button"
import * as LinkButton from "@/components/ui/primitives/link-button"
import {
	Check,
	Wallet,
	Warning,
	FileText,
	BellSimple,
	CheckCircle,
	X,
	Play,
	Stop,
	ShieldCheck,
	XCircle,
	Megaphone,
} from "@phosphor-icons/react"
import { useRouter, useParams } from "next/navigation"
import type { NotificationType } from "@/features/notifications/types"
import { isValidInternalUrl, routes, SETTINGS_TABS } from "@/lib/routes"

interface Notification {
	id: string
	userId: string
	type: NotificationType
	title: string
	message: string
	actionUrl?: string
	actionLabel?: string
	isRead: boolean
	createdAt: string | Date
}

interface NotificationsDrawerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	notifications?: Notification[]
	onMarkAllRead?: () => void
	onMarkAsRead?: (id: string) => void
	onNotificationClick?: (notification: Notification) => void
	isLoading?: boolean
}

// Icon mapping for Encore NotificationType
const notificationIcons: Partial<Record<NotificationType, React.ElementType>> = {
	campaign_approved: CheckCircle,
	campaign_rejected: Warning,
	campaign_started: Play,
	campaign_ended: Stop,
	enrollment_approved: Check,
	enrollment_rejected: Warning,
	deliverable_approved: Check,
	deliverable_rejected: Warning,
	revision_requested: Warning,
	payment_received: Wallet,
	withdrawal_completed: Wallet,
	withdrawal_failed: Warning,
	kyc_verified: ShieldCheck,
	kyc_rejected: XCircle,
	invoice_generated: FileText,
	invoice_overdue: Warning,
	system_announcement: Megaphone,
	general: BellSimple,
}

// Style mapping for Encore NotificationType
const notificationStyles: Partial<
	Record<NotificationType, { bg: string; icon: string; border: string }>
> = {
	campaign_approved: {
		bg: "bg-success-lighter",
		icon: "text-success-base",
		border: "border-success-base/20",
	},
	campaign_rejected: {
		bg: "bg-error-lighter",
		icon: "text-error-base",
		border: "border-error-base/20",
	},
	campaign_started: {
		bg: "bg-primary-alpha-10",
		icon: "text-primary-base",
		border: "border-primary-base/20",
	},
	campaign_ended: {
		bg: "bg-bg-weak-50",
		icon: "text-text-sub-600",
		border: "border-stroke-soft-200",
	},
	enrollment_approved: {
		bg: "bg-success-lighter",
		icon: "text-success-base",
		border: "border-success-base/20",
	},
	enrollment_rejected: {
		bg: "bg-error-lighter",
		icon: "text-error-base",
		border: "border-error-base/20",
	},
	deliverable_approved: {
		bg: "bg-success-lighter",
		icon: "text-success-base",
		border: "border-success-base/20",
	},
	deliverable_rejected: {
		bg: "bg-error-lighter",
		icon: "text-error-base",
		border: "border-error-base/20",
	},
	revision_requested: {
		bg: "bg-warning-lighter",
		icon: "text-warning-base",
		border: "border-warning-base/20",
	},
	payment_received: {
		bg: "bg-success-lighter",
		icon: "text-success-base",
		border: "border-success-base/20",
	},
	withdrawal_completed: {
		bg: "bg-success-lighter",
		icon: "text-success-base",
		border: "border-success-base/20",
	},
	withdrawal_failed: {
		bg: "bg-error-lighter",
		icon: "text-error-base",
		border: "border-error-base/20",
	},
	kyc_verified: {
		bg: "bg-success-lighter",
		icon: "text-success-base",
		border: "border-success-base/20",
	},
	kyc_rejected: {
		bg: "bg-error-lighter",
		icon: "text-error-base",
		border: "border-error-base/20",
	},
	invoice_generated: {
		bg: "bg-information-lighter",
		icon: "text-information-base",
		border: "border-information-base/20",
	},
	invoice_overdue: {
		bg: "bg-warning-lighter",
		icon: "text-warning-base",
		border: "border-warning-base/20",
	},
	system_announcement: {
		bg: "bg-primary-alpha-10",
		icon: "text-primary-base",
		border: "border-primary-base/20",
	},
	general: {
		bg: "bg-bg-weak-50",
		icon: "text-text-sub-600",
		border: "border-stroke-soft-200",
	},
}

export function NotificationsDrawer({
	open,
	onOpenChange,
	notifications = [],
	onMarkAllRead,
	onMarkAsRead,
	onNotificationClick,
	isLoading = false,
}: NotificationsDrawerProps) {
	const router = useRouter()
	const params = useParams<{ organizationId?: string }>()
	const [filter, setFilter] = React.useState<"all" | "unread">("all")

	const filteredNotifications = React.useMemo(() => {
		if (filter === "unread") {
			return notifications.filter((n) => !n.isRead)
		}
		return notifications
	}, [notifications, filter])

	const unreadCount = notifications.filter((n) => !n.isRead).length

	// Group notifications by date
	const groupedNotifications = React.useMemo(() => {
		const groups: { label: string; notifications: Notification[] }[] = []
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		const todayNotifications: Notification[] = []
		const yesterdayNotifications: Notification[] = []
		const olderNotifications: Notification[] = []

		filteredNotifications.forEach((notification) => {
			const date = new Date(notification.createdAt)
			if (date.toDateString() === today.toDateString()) {
				todayNotifications.push(notification)
			} else if (date.toDateString() === yesterday.toDateString()) {
				yesterdayNotifications.push(notification)
			} else {
				olderNotifications.push(notification)
			}
		})

		if (todayNotifications.length > 0) {
			groups.push({ label: "Today", notifications: todayNotifications })
		}
		if (yesterdayNotifications.length > 0) {
			groups.push({ label: "Yesterday", notifications: yesterdayNotifications })
		}
		if (olderNotifications.length > 0) {
			groups.push({ label: "Earlier", notifications: olderNotifications })
		}

		return groups
	}, [filteredNotifications])

	const formatTime = (date: Date | string) => {
		const now = new Date()
		const diff = now.getTime() - new Date(date).getTime()
		const minutes = Math.floor(diff / 60000)
		const hours = Math.floor(diff / 3600000)
		const days = Math.floor(diff / 86400000)

		if (minutes < 1) return "Just now"
		if (minutes < 60) return `${minutes}m`
		if (hours < 24) return `${hours}h`
		return `${days}d`
	}

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content>
				{/* Custom Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-stroke-soft-200">
					<div className="flex items-center gap-3">
						<div className="size-10 rounded-xl bg-gradient-to-br from-primary-base to-primary-dark flex items-center justify-center">
							<BellSimple className="size-5 text-white" weight="fill" />
						</div>
						<div>
							<h2 className="text-label-md text-text-strong-950">Notifications</h2>
							<p className="text-paragraph-xs text-text-sub-600">
								{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
							</p>
						</div>
					</div>
					<CompactButton.Root
						variant="ghost"
						size="large"
						onClick={() => onOpenChange(false)}
						aria-label="Close notifications"
					>
						<CompactButton.Icon><X weight="bold" /></CompactButton.Icon>
					</CompactButton.Root>
				</div>

				<Drawer.Body className="flex flex-col p-0">
					{/* Filter Pills */}
					<div className="flex items-center gap-2 px-5 py-3 border-b border-stroke-soft-200">
						<Button.Root
							variant={filter === "all" ? "neutral" : "ghost"}
							size="xsmall"
							onClick={() => setFilter("all")}
							className="rounded-full"
						>
							All
						</Button.Root>
						<Button.Root
							variant={filter === "unread" ? "neutral" : "ghost"}
							size="xsmall"
							onClick={() => setFilter("unread")}
							className="rounded-full"
						>
							Unread
							{unreadCount > 0 && (
								<span
									className={cn(
										"size-5 rounded-full text-label-xs font-medium flex items-center justify-center ml-1",
										filter === "unread" ? "bg-white/20 text-white" : "bg-error-base text-white"
									)}
								>
									{unreadCount}
								</span>
							)}
						</Button.Root>

						{unreadCount > 0 && (
							<LinkButton.Root
								variant="primary"
								size="small"
								onClick={onMarkAllRead}
								className="ml-auto"
							>
								Mark all read
							</LinkButton.Root>
						)}
					</div>

					{/* Notifications List */}
					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<div className="flex flex-col items-center justify-center py-16 px-5">
								<div className="size-8 border-2 border-primary-base/20 border-t-primary-base rounded-full animate-spin" />
								<p className="text-paragraph-sm text-text-sub-600 mt-4">Loading notifications...</p>
							</div>
						) : groupedNotifications.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 px-5 text-center">
								<div className="size-16 rounded-2xl bg-gradient-to-br from-bg-weak-50 to-bg-soft-200 flex items-center justify-center mb-4">
									<CheckCircle className="size-8 text-success-base" weight="duotone" />
								</div>
								<p className="text-label-md text-text-strong-950 mb-1">You're all caught up!</p>
								<p className="text-paragraph-sm text-text-sub-600 max-w-[240px]">
									{filter === "unread"
										? "No unread notifications. Check back later for updates."
										: "No notifications yet. We'll notify you when something happens."}
								</p>
							</div>
						) : (
							groupedNotifications.map((group) => (
								<div key={group.label}>
									{/* Group Header */}
									<div className="sticky top-0 px-5 py-2 bg-bg-white-0/90 backdrop-blur-sm border-b border-stroke-soft-200/50">
										<span className="text-label-xs text-text-soft-400 uppercase tracking-wider">
											{group.label}
										</span>
									</div>

									{/* Notification Items */}
									<div className="px-3 py-2">
										{group.notifications.map((notification) => {
											const Icon = notificationIcons[notification.type] || BellSimple
											const styles = notificationStyles[notification.type] || {
												bg: "bg-bg-weak-50",
												icon: "text-text-sub-600",
												border: "border-stroke-soft-200",
											}

											const handleClick = () => {
												// Mark as read if unread
												if (!notification.isRead) {
													onMarkAsRead?.(notification.id)
												}
												// Call custom click handler
												onNotificationClick?.(notification)
												// Navigate only if action URL is valid internal path (security)
												if (isValidInternalUrl(notification.actionUrl)) {
													router.push(notification.actionUrl!)
													onOpenChange(false)
												}
											}

											return (
												<Button.Root
													variant="ghost"
													size="medium"
													key={notification.id}
													onClick={handleClick}
													className={cn(
														"w-full text-left p-3 rounded-xl mb-1 last:mb-0 h-auto justify-start",
														!notification.isRead && "bg-primary-alpha-5 hover:bg-primary-alpha-10"
													)}
												>
													<div className="flex gap-3 w-full">
														{/* Icon */}
														<div
															className={cn(
																"size-10 rounded-xl flex items-center justify-center shrink-0 border",
																styles.bg,
																styles.border
															)}
														>
															<Icon className={cn("size-5", styles.icon)} weight="duotone" />
														</div>

														{/* Content */}
														<div className="flex-1 min-w-0">
															<div className="flex items-start justify-between gap-2 mb-0.5">
																<span
																	className={cn(
																		"text-label-sm",
																		!notification.isRead
																			? "text-text-strong-950"
																			: "text-text-sub-600"
																	)}
																>
																	{notification.title}
																</span>
																<div className="flex items-center gap-1.5 shrink-0">
																	<span className="text-paragraph-xs text-text-soft-400">
																		{formatTime(notification.createdAt)}
																	</span>
																	{!notification.isRead && (
																		<span className="size-2 rounded-full bg-primary-base" />
																	)}
																</div>
															</div>
															<p className="text-paragraph-sm text-text-sub-600 line-clamp-2 mb-2">
																{notification.message}
															</p>
															{notification.actionLabel && (
																<span className="inline-flex items-center gap-1 text-label-xs text-primary-base hover:text-primary-dark transition-colors">
																	{notification.actionLabel}
																	<span className="text-xs">→</span>
																</span>
															)}
														</div>
													</div>
												</Button.Root>
											)
										})}
									</div>
								</div>
							))
						)}
					</div>
				</Drawer.Body>

				{/* Footer - Settings link */}
				<div
					className="border-t border-stroke-soft-200 px-5 py-3"
					style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
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
			</Drawer.Content>
		</Drawer.Root>
	)
}
