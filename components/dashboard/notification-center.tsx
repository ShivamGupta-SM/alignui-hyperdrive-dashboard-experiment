'use client'

import * as React from 'react'
import { useNotifications, useCounts, useNovu } from '@novu/react'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from 'usehooks-ts'
import { toast } from 'sonner'
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
} from '@phosphor-icons/react'
import * as Drawer from '@/components/ui/drawer'
import * as BottomSheet from '@/components/ui/bottom-sheet'
import * as Dropdown from '@/components/ui/dropdown'
import { cn } from '@/utils/cn'

// ============================================
// Notification Sound Utility
// ============================================

let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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
    if (ctx.state === 'suspended') {
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
    console.debug('Notification sound failed:', error)
  }
}

/**
 * Vibrate device if supported (mobile)
 */
function vibrateDevice() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(100) // Short 100ms vibration
  }
}

// ============================================
// Types
// ============================================

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

const notificationIcons: Record<string, { icon: React.ElementType; bg: string; iconColor: string }> = {
  enrollment_new: {
    icon: UserPlus,
    bg: 'bg-primary-alpha-10 dark:bg-primary-base/20',
    iconColor: 'text-primary-base',
  },
  enrollment_approved: {
    icon: CheckCircle,
    bg: 'bg-success-lighter dark:bg-success-base/20',
    iconColor: 'text-success-base',
  },
  enrollment_rejected: {
    icon: Warning,
    bg: 'bg-error-lighter dark:bg-error-base/20',
    iconColor: 'text-error-base',
  },
  campaign_approved: {
    icon: Sparkle,
    bg: 'bg-success-lighter dark:bg-success-base/20',
    iconColor: 'text-success-base',
  },
  campaign_rejected: {
    icon: Warning,
    bg: 'bg-error-lighter dark:bg-error-base/20',
    iconColor: 'text-error-base',
  },
  wallet_credit: {
    icon: Wallet,
    bg: 'bg-success-lighter dark:bg-success-base/20',
    iconColor: 'text-success-base',
  },
  wallet_low_balance: {
    icon: Warning,
    bg: 'bg-warning-lighter dark:bg-warning-base/20',
    iconColor: 'text-warning-base',
  },
  team_member_joined: {
    icon: UsersThree,
    bg: 'bg-information-lighter dark:bg-information-base/20',
    iconColor: 'text-information-base',
  },
  invoice_generated: {
    icon: FileText,
    bg: 'bg-bg-weak-50 dark:bg-neutral-800',
    iconColor: 'text-text-sub-600',
  },
  order: {
    icon: ShoppingCart,
    bg: 'bg-primary-alpha-10 dark:bg-primary-base/20',
    iconColor: 'text-primary-base',
  },
  payment: {
    icon: CreditCard,
    bg: 'bg-success-lighter dark:bg-success-base/20',
    iconColor: 'text-success-base',
  },
  product: {
    icon: Package,
    bg: 'bg-information-lighter dark:bg-information-base/20',
    iconColor: 'text-information-base',
  },
  default: {
    icon: Bell,
    bg: 'bg-bg-weak-50 dark:bg-neutral-800',
    iconColor: 'text-text-sub-600',
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

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  if (weeks < 4) return `${weeks}w`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupNotificationsByDate(notifications: NotificationItemProps['notification'][]) {
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

  if (todayNotifications.length > 0) groups.push({ label: 'Today', notifications: todayNotifications })
  if (yesterdayNotifications.length > 0) groups.push({ label: 'Yesterday', notifications: yesterdayNotifications })
  if (thisWeekNotifications.length > 0) groups.push({ label: 'This Week', notifications: thisWeekNotifications })
  if (olderNotifications.length > 0) groups.push({ label: 'Earlier', notifications: olderNotifications })

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
  const [showActions, setShowActions] = React.useState(false)
  const [showSnoozeMenu, setShowSnoozeMenu] = React.useState(false)
  const [showCustomSnooze, setShowCustomSnooze] = React.useState(false)
  const [customSnoozeDate, setCustomSnoozeDate] = React.useState('')
  const [customSnoozeTime, setCustomSnoozeTime] = React.useState('')
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
    setCustomSnoozeDate('')
    setCustomSnoozeTime('')
  }

  return (
    <div
      className={cn(
        'group relative px-4 py-3 cursor-pointer',
        'transition-all duration-200',
        'hover:bg-bg-weak-50 dark:hover:bg-neutral-900',
        !notification.read && 'bg-primary-alpha-5 dark:bg-primary-base/5',
        'animate-in fade-in slide-in-from-bottom-2 duration-300'
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
        <div className={cn(
          'size-10 rounded-xl flex items-center justify-center shrink-0',
          'ring-1 ring-inset ring-stroke-soft-200 dark:ring-neutral-700',
          style.bg
        )}>
          <Icon className={cn('size-5', style.iconColor)} weight="duotone" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-label-sm line-clamp-1',
              notification.read
                ? 'text-text-sub-600 dark:text-neutral-400'
                : 'text-text-strong-950 dark:text-neutral-50 font-medium'
            )}>
              {notification.subject || 'Notification'}
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
                <button
                  type="button"
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
                    'inline-flex items-center gap-1 text-label-xs transition-colors',
                    notification.primaryAction.isCompleted
                      ? 'text-success-base line-through opacity-70'
                      : 'text-primary-base hover:text-primary-dark'
                  )}
                >
                  {notification.primaryAction.isCompleted && <CheckCircle className="size-3" weight="fill" />}
                  {notification.primaryAction.label}
                  {!notification.primaryAction.isCompleted && <ArrowRight className="size-3" weight="bold" />}
                </button>
              )}
              {notification.secondaryAction && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (notification.secondaryAction?.isCompleted) {
                      onRevertSecondary()
                    } else {
                      onCompleteSecondary()
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 text-label-xs transition-colors',
                    notification.secondaryAction.isCompleted
                      ? 'text-success-base line-through opacity-70'
                      : 'text-text-sub-600 hover:text-text-strong-950 dark:text-neutral-400 dark:hover:text-neutral-50'
                  )}
                >
                  {notification.secondaryAction.isCompleted && <CheckCircle className="size-3" weight="fill" />}
                  {notification.secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions - for non-snoozed, non-archived notifications */}
        {showActions && !isSnoozed && !isArchived && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-bg-white-0 dark:bg-neutral-900 rounded-lg shadow-custom-sm ring-1 ring-stroke-soft-200 dark:ring-neutral-700 p-1 animate-in fade-in zoom-in-95 duration-150">
            {notification.read ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onUnread()
                }}
                className="size-8 rounded-md flex items-center justify-center text-text-soft-400 hover:text-primary-base hover:bg-primary-alpha-10 dark:hover:bg-primary-base/20 transition-colors"
                title="Mark as unread"
              >
                <Envelope className="size-4" weight="duotone" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRead()
                }}
                className="size-8 rounded-md flex items-center justify-center text-text-soft-400 hover:text-success-base hover:bg-success-lighter dark:hover:bg-success-base/20 transition-colors"
                title="Mark as read"
              >
                <Check className="size-4" weight="bold" />
              </button>
            )}
            {/* Snooze Dropdown */}
            <Dropdown.Root open={showSnoozeMenu} onOpenChange={(open) => {
              setShowSnoozeMenu(open)
              if (!open) setShowCustomSnooze(false)
            }}>
              <Dropdown.Trigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="size-8 rounded-md flex items-center justify-center text-text-soft-400 hover:text-warning-base hover:bg-warning-lighter dark:hover:bg-warning-base/20 transition-colors"
                  title="Snooze"
                >
                  <Clock className="size-4" weight="duotone" />
                </button>
              </Dropdown.Trigger>
              <Dropdown.Content align="end" width="sm">
                {!showCustomSnooze ? (
                  <Dropdown.Group>
                    <Dropdown.Label>Snooze for</Dropdown.Label>
                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); onSnooze(15); setShowSnoozeMenu(false) }}>
                      <Dropdown.ItemIcon as={Clock} />
                      15 minutes
                    </Dropdown.Item>
                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); onSnooze(60); setShowSnoozeMenu(false) }}>
                      <Dropdown.ItemIcon as={Clock} />
                      1 hour
                    </Dropdown.Item>
                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); onSnooze(240); setShowSnoozeMenu(false) }}>
                      <Dropdown.ItemIcon as={Clock} />
                      4 hours
                    </Dropdown.Item>
                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); onSnooze(1440); setShowSnoozeMenu(false) }}>
                      <Dropdown.ItemIcon as={Alarm} />
                      Tomorrow
                    </Dropdown.Item>
                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); onSnooze(10080); setShowSnoozeMenu(false) }}>
                      <Dropdown.ItemIcon as={CalendarBlank} />
                      Next week
                    </Dropdown.Item>
                    <Dropdown.Separator className="my-1 h-px bg-stroke-soft-200" />
                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); setShowCustomSnooze(true) }}>
                      <Dropdown.ItemIcon as={CalendarBlank} />
                      Custom time...
                    </Dropdown.Item>
                  </Dropdown.Group>
                ) : (
                  <div className="p-3 min-w-[240px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-label-sm text-text-strong-950 dark:text-neutral-50">Custom snooze</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomSnooze(false)}
                        className="size-6 rounded flex items-center justify-center text-text-soft-400 hover:text-text-strong-950 dark:hover:text-neutral-50 hover:bg-bg-weak-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <X className="size-4" weight="bold" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label htmlFor={`snooze-date-${notification.id}`} className="text-label-xs text-text-sub-600 dark:text-neutral-400 mb-1 block">Date</label>
                        <input
                          id={`snooze-date-${notification.id}`}
                          type="date"
                          value={customSnoozeDate}
                          onChange={(e) => setCustomSnoozeDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 rounded-lg text-paragraph-sm bg-bg-white-0 dark:bg-neutral-900 border border-stroke-soft-200 dark:border-neutral-700 text-text-strong-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-base"
                        />
                      </div>
                      <div>
                        <label htmlFor={`snooze-time-${notification.id}`} className="text-label-xs text-text-sub-600 dark:text-neutral-400 mb-1 block">Time</label>
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
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomSnooze(false)
                          setCustomSnoozeDate('')
                          setCustomSnoozeTime('')
                        }}
                        className="flex-1 px-3 py-2 rounded-lg text-label-sm text-text-sub-600 dark:text-neutral-400 bg-bg-weak-50 dark:bg-neutral-800 hover:bg-bg-soft-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCustomSnoozeApply}
                        disabled={!customSnoozeDate || !customSnoozeTime}
                        className="flex-1 px-3 py-2 rounded-lg text-label-sm text-white bg-primary-base hover:bg-primary-darker disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </Dropdown.Content>
            </Dropdown.Root>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onArchive()
              }}
              className="size-8 rounded-md flex items-center justify-center text-text-soft-400 hover:text-text-strong-950 dark:hover:text-neutral-50 hover:bg-bg-weak-50 dark:hover:bg-neutral-800 transition-colors"
              title="Archive"
            >
              <Archive className="size-4" weight="duotone" />
            </button>
          </div>
        )}

        {/* Unsnooze Action - shown for snoozed notifications */}
        {showActions && isSnoozed && !isArchived && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-bg-white-0 dark:bg-neutral-900 rounded-lg shadow-custom-sm ring-1 ring-stroke-soft-200 dark:ring-neutral-700 p-1 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onUnsnooze()
              }}
              className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-label-xs text-text-sub-600 hover:text-primary-base hover:bg-primary-alpha-10 dark:hover:bg-primary-base/20 transition-colors"
              title="Unsnooze"
            >
              <Bell className="size-4" weight="duotone" />
              Unsnooze
            </button>
          </div>
        )}

        {/* Unarchive Action - shown for archived notifications */}
        {showActions && isArchived && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-bg-white-0 dark:bg-neutral-900 rounded-lg shadow-custom-sm ring-1 ring-stroke-soft-200 dark:ring-neutral-700 p-1 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onUnarchive()
              }}
              className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-label-xs text-text-sub-600 hover:text-primary-base hover:bg-primary-alpha-10 dark:hover:bg-primary-base/20 transition-colors"
              title="Unarchive"
            >
              <Archive className="size-4" weight="duotone" />
              Unarchive
            </button>
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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'shadow-sm ring-1 transition-all duration-200',
        'hover:shadow-md active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2',
        'bg-bg-white-0 text-text-sub-600 ring-stroke-soft-200 hover:text-text-strong-950',
        'dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:text-neutral-50',
        'size-11 sm:size-10 group',
        isOpen && 'ring-primary-base ring-2 text-primary-base'
      )}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
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
            'absolute -right-0.5 -top-0.5',
            'flex items-center justify-center',
            'size-5 sm:size-[18px] rounded-full',
            'bg-error-base text-white',
            'text-label-xs font-semibold',
            'ring-2 ring-bg-white-0 dark:ring-neutral-900',
            'animate-in zoom-in duration-200'
          )}
        >
          {count > 99 ? '99+' : count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}

// ============================================
// NotificationPanel Component
// ============================================

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function NotificationPanelContent({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const novu = useNovu()
  const { notifications, isLoading, isFetching, hasMore, fetchMore, refetch } = useNotifications()
  const { counts } = useCounts({ filters: [{ read: false }] })

  const [filter, setFilter] = React.useState<'all' | 'unread' | 'snoozed' | 'archived'>('all')
  const unreadCount = counts?.[0]?.count || 0

  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return []
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead && !n.isArchived)
    }
    if (filter === 'snoozed') {
      // Filter for snoozed notifications
      return notifications.filter(n => {
        const snoozedUntil = (n as unknown as { snoozedUntil?: string }).snoozedUntil
        return !!snoozedUntil && new Date(snoozedUntil) > new Date() && !n.isArchived
      })
    }
    if (filter === 'archived') {
      // Filter for archived notifications
      return notifications.filter(n => n.isArchived)
    }
    // For 'all', exclude snoozed and archived notifications
    return notifications.filter(n => {
      const snoozedUntil = (n as unknown as { snoozedUntil?: string }).snoozedUntil
      const isSnoozed = !!snoozedUntil && new Date(snoozedUntil) > new Date()
      return !isSnoozed && !n.isArchived
    })
  }, [notifications, filter])

  // Count snoozed notifications
  const snoozedCount = React.useMemo(() => {
    if (!notifications) return 0
    return notifications.filter(n => {
      const snoozedUntil = (n as unknown as { snoozedUntil?: string }).snoozedUntil
      return !!snoozedUntil && new Date(snoozedUntil) > new Date() && !n.isArchived
    }).length
  }, [notifications])

  // Count archived notifications
  const archivedCount = React.useMemo(() => {
    if (!notifications) return 0
    return notifications.filter(n => n.isArchived).length
  }, [notifications])

  const groupedNotifications = React.useMemo(() => {
    return groupNotificationsByDate(
      filteredNotifications.map(n => {
        // Extract action completion status from Novu notification
        const nWithActions = n as unknown as {
          primaryAction?: { label: string; redirect?: { url: string }; isCompleted?: boolean }
          secondaryAction?: { label: string; redirect?: { url: string }; isCompleted?: boolean }
        }
        return {
          id: n.id,
          subject: n.subject,
          body: n.body,
          avatar: n.avatar,
          read: n.isRead,
          archived: n.isArchived,
          // Novu stores snooze info - check for snoozedUntil on notification object
          snoozedUntil: (n as unknown as { snoozedUntil?: string }).snoozedUntil ?? null,
          createdAt: n.createdAt,
          primaryAction: nWithActions.primaryAction ? {
            label: nWithActions.primaryAction.label,
            url: nWithActions.primaryAction.redirect?.url,
            isCompleted: nWithActions.primaryAction.isCompleted,
          } : undefined,
          secondaryAction: nWithActions.secondaryAction ? {
            label: nWithActions.secondaryAction.label,
            url: nWithActions.secondaryAction.redirect?.url,
            isCompleted: nWithActions.secondaryAction.isCompleted,
          } : undefined,
          data: n.data,
        }
      })
    )
  }, [filteredNotifications])

  const handleMarkAllAsRead = async () => {
    try {
      await novu?.notifications.readAll()
      refetch()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleArchiveAllRead = async () => {
    try {
      await novu?.notifications.archiveAllRead()
      refetch()
      toast.success('All read notifications archived')
    } catch (error) {
      console.error('Failed to archive all read:', error)
      toast.error('Failed to archive notifications')
    }
  }

  const handleNotificationClick = async (notification: NonNullable<typeof notifications>[number]) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await notification.read()
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }

    // Navigate if there's a URL
    const actionUrl = notification.primaryAction?.redirect?.url || (notification.data?.actionUrl as string)
    if (actionUrl) {
      router.push(actionUrl)
      onOpenChange(false)
    }
  }

  const handleMarkAsRead = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.read()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAsUnread = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.unread()
    } catch (error) {
      console.error('Failed to mark as unread:', error)
    }
  }

  const handleArchive = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.archive()
    } catch (error) {
      console.error('Failed to archive:', error)
    }
  }

  const handleSnooze = async (notification: NonNullable<typeof notifications>[number], durationOrDate: number | Date) => {
    try {
      let snoozeUntil: Date
      let durationText: string

      if (durationOrDate instanceof Date) {
        // Custom date/time was provided
        snoozeUntil = durationOrDate
        durationText = snoozeUntil.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      } else {
        // Duration in minutes was provided
        snoozeUntil = new Date(Date.now() + durationOrDate * 60 * 1000)
        durationText = durationOrDate >= 10080
          ? 'next week'
          : durationOrDate >= 1440
            ? 'tomorrow'
            : durationOrDate >= 60
              ? `${durationOrDate / 60} hour${durationOrDate > 60 ? 's' : ''}`
              : `${durationOrDate} minutes`
      }

      // Novu snooze expects ISO string
      await notification.snooze(snoozeUntil.toISOString())
      refetch()
      toast.success(`Notification snoozed until ${durationText}`)
    } catch (error) {
      console.error('Failed to snooze notification:', error)
      toast.error('Failed to snooze notification')
    }
  }

  const handleUnsnooze = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.unsnooze()
      refetch()
      toast.success('Notification unsnoozed')
    } catch (error) {
      console.error('Failed to unsnooze notification:', error)
      toast.error('Failed to unsnooze notification')
    }
  }

  const handleUnarchive = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.unarchive()
      refetch()
      toast.success('Notification restored')
    } catch (error) {
      console.error('Failed to unarchive notification:', error)
      toast.error('Failed to restore notification')
    }
  }

  const handleCompletePrimary = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.completePrimary()
      refetch()
    } catch (error) {
      console.error('Failed to complete primary action:', error)
    }
  }

  const handleCompleteSecondary = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.completeSecondary()
      refetch()
    } catch (error) {
      console.error('Failed to complete secondary action:', error)
    }
  }

  const handleRevertPrimary = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.revertPrimary()
      refetch()
    } catch (error) {
      console.error('Failed to revert primary action:', error)
    }
  }

  const handleRevertSecondary = async (notification: NonNullable<typeof notifications>[number]) => {
    try {
      await notification.revertSecondary()
      refetch()
    } catch (error) {
      console.error('Failed to revert secondary action:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary-base to-primary-dark flex items-center justify-center shadow-sm">
            <Bell className="size-5 text-white" weight="fill" />
          </div>
          <div>
            <h2 className="text-label-md text-text-strong-950 dark:text-neutral-50">Notifications</h2>
            <p className="text-paragraph-xs text-text-sub-600 dark:text-neutral-400">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
        </div>

        {/* Settings Menu */}
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <button
              type="button"
              className="size-8 rounded-lg flex items-center justify-center text-text-sub-600 hover:bg-bg-weak-50 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
            >
              <DotsThree className="size-5" weight="bold" />
            </button>
          </Dropdown.Trigger>
          <Dropdown.Content align="end" width="sm">
            <Dropdown.Item
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Dropdown.ItemIcon as={Checks} />
              Mark all as read
            </Dropdown.Item>
            <Dropdown.Item
              onClick={handleArchiveAllRead}
            >
              <Dropdown.ItemIcon as={Archive} />
              Archive all read
            </Dropdown.Item>
            <Dropdown.Separator className="my-1 h-px bg-stroke-soft-200" />
            <Dropdown.Item
              onClick={() => {
                router.push('/dashboard/settings?tab=notifications')
                onOpenChange(false)
              }}
            >
              <Dropdown.ItemIcon as={Gear} />
              Notification settings
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stroke-soft-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-label-sm transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
            filter === 'all'
              ? 'bg-text-strong-950 text-white dark:bg-neutral-50 dark:text-neutral-950'
              : 'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={cn(
            'px-3 py-1.5 rounded-full text-label-sm transition-all flex items-center gap-1.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
            filter === 'unread'
              ? 'bg-text-strong-950 text-white dark:bg-neutral-50 dark:text-neutral-950'
              : 'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span className={cn(
              'size-5 rounded-full text-label-xs font-medium flex items-center justify-center',
              filter === 'unread'
                ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950'
                : 'bg-error-base text-white'
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFilter('snoozed')}
          className={cn(
            'px-3 py-1.5 rounded-full text-label-sm transition-all flex items-center gap-1.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
            filter === 'snoozed'
              ? 'bg-text-strong-950 text-white dark:bg-neutral-50 dark:text-neutral-950'
              : 'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          Snoozed
          {snoozedCount > 0 && (
            <span className={cn(
              'size-5 rounded-full text-label-xs font-medium flex items-center justify-center',
              filter === 'snoozed'
                ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950'
                : 'bg-warning-base text-white'
            )}>
              {snoozedCount > 9 ? '9+' : snoozedCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setFilter('archived')}
          className={cn(
            'px-3 py-1.5 rounded-full text-label-sm transition-all flex items-center gap-1.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
            filter === 'archived'
              ? 'bg-text-strong-950 text-white dark:bg-neutral-50 dark:text-neutral-950'
              : 'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          )}
        >
          Archived
          {archivedCount > 0 && (
            <span className={cn(
              'size-5 rounded-full text-label-xs font-medium flex items-center justify-center',
              filter === 'archived'
                ? 'bg-white/20 text-white dark:bg-neutral-950/20 dark:text-neutral-950'
                : 'bg-text-soft-400 text-white'
            )}>
              {archivedCount > 9 ? '9+' : archivedCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-8 border-2 border-primary-base/20 border-t-primary-base rounded-full animate-spin" />
            <p className="text-paragraph-sm text-text-sub-600 dark:text-neutral-400 mt-4">
              Loading notifications...
            </p>
          </div>
        ) : groupedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-bg-weak-50 to-bg-soft-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center mb-4">
              {filter === 'unread' ? (
                <EnvelopeOpen className="size-8 text-success-base" weight="duotone" />
              ) : filter === 'snoozed' ? (
                <Clock className="size-8 text-warning-base" weight="duotone" />
              ) : filter === 'archived' ? (
                <Archive className="size-8 text-text-soft-400 dark:text-neutral-500" weight="duotone" />
              ) : (
                <Bell className="size-8 text-text-soft-400 dark:text-neutral-500" weight="duotone" />
              )}
            </div>
            <p className="text-label-md text-text-strong-950 dark:text-neutral-50 mb-1">
              {filter === 'unread'
                ? "You're all caught up!"
                : filter === 'snoozed'
                  ? 'No snoozed notifications'
                  : filter === 'archived'
                    ? 'No archived notifications'
                    : 'No notifications yet'}
            </p>
            <p className="text-paragraph-sm text-text-sub-600 dark:text-neutral-400 max-w-[240px]">
              {filter === 'unread'
                ? 'All your notifications have been read.'
                : filter === 'snoozed'
                  ? 'Snoozed notifications will appear here until their snooze time expires.'
                  : filter === 'archived'
                    ? 'Archived notifications will appear here. You can archive notifications to clear your inbox.'
                    : "When something happens, we'll let you know here."}
            </p>
          </div>
        ) : (
          <>
            {groupedNotifications.map((group) => (
              <div key={group.label}>
                {/* Group Header */}
                <div className="sticky top-0 px-4 py-2 bg-bg-white-0/95 dark:bg-neutral-950/95 backdrop-blur-sm border-b border-stroke-soft-200/50 dark:border-neutral-800/50 z-10">
                  <span className="text-label-xs text-text-soft-400 dark:text-neutral-500 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>

                {/* Notifications */}
                <div className="divide-y divide-stroke-soft-200 dark:divide-neutral-800">
                  {group.notifications.map((notification) => {
                    const originalNotification = notifications?.find(n => n.id === notification.id)
                    if (!originalNotification) return null

                    return (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(originalNotification)}
                        onRead={() => handleMarkAsRead(originalNotification)}
                        onUnread={() => handleMarkAsUnread(originalNotification)}
                        onArchive={() => handleArchive(originalNotification)}
                        onUnarchive={() => handleUnarchive(originalNotification)}
                        onSnooze={(duration) => handleSnooze(originalNotification, duration)}
                        onUnsnooze={() => handleUnsnooze(originalNotification)}
                        onCompletePrimary={() => handleCompletePrimary(originalNotification)}
                        onCompleteSecondary={() => handleCompleteSecondary(originalNotification)}
                        onRevertPrimary={() => handleRevertPrimary(originalNotification)}
                        onRevertSecondary={() => handleRevertSecondary(originalNotification)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Load More */}
        {hasMore && !isLoading && (
          <div className="p-4">
            <button
              type="button"
              onClick={() => fetchMore()}
              disabled={isFetching}
              className={cn(
                'w-full py-2.5 rounded-xl text-label-sm',
                'bg-bg-weak-50 text-text-sub-600',
                'hover:bg-bg-soft-200 hover:text-text-strong-950',
                'dark:bg-neutral-800 dark:text-neutral-400',
                'dark:hover:bg-neutral-700 dark:hover:text-neutral-50',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
                isFetching && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isFetching ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="border-t border-stroke-soft-200 dark:border-neutral-800 px-4 py-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          type="button"
          onClick={() => {
            router.push('/dashboard/settings?tab=notifications')
            onOpenChange(false)
          }}
          className="w-full text-center text-label-sm text-text-sub-600 dark:text-neutral-400 hover:text-text-strong-950 dark:hover:text-neutral-50 transition-colors py-2 min-h-11 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
        >
          Notification Settings
        </button>
      </div>
    </div>
  )
}

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const isMobile = useMediaQuery('(max-width: 639px)')

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
 * Only rendered when NovuProvider context is available.
 */
function NotificationCenterInner() {
  const [isOpen, setIsOpen] = React.useState(false)
  const novu = useNovu()
  const { counts, refetch: refetchCounts } = useCounts({ filters: [{ read: false }] })
  const unreadCount = counts?.[0]?.count || 0
  const router = useRouter()

  // Subscribe to real-time notification events
  React.useEffect(() => {
    if (!novu) return

    // Handler for new notifications
    const handleNewNotification = (data: { result: { subject?: string; body?: string; data?: Record<string, unknown> } }) => {
      // Play sound and vibrate
      playNotificationSound()
      vibrateDevice()

      // Show toast notification
      const notification = data.result
      toast(notification.subject || 'New Notification', {
        description: notification.body,
        action: notification.data?.actionUrl ? {
          label: 'View',
          onClick: () => router.push(notification.data?.actionUrl as string),
        } : undefined,
        duration: 5000,
      })
    }

    // Handler for unread count changes (more efficient than refetching on every event)
    const handleUnreadCountChanged = () => {
      refetchCounts()
    }

    // Subscribe to notification events
    novu.on('notifications.notification_received', handleNewNotification)
    novu.on('notifications.unread_count_changed', handleUnreadCountChanged)

    // Cleanup on unmount
    return () => {
      novu.off('notifications.notification_received', handleNewNotification)
      novu.off('notifications.unread_count_changed', handleUnreadCountChanged)
    }
  }, [novu, refetchCounts, router])

  return (
    <>
      <NotificationBell
        onClick={() => setIsOpen(true)}
        count={unreadCount}
        isOpen={isOpen}
      />
      <NotificationPanel open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}

/**
 * Context to signal that we're inside NovuProvider.
 * This allows child components to safely check before using Novu hooks.
 */
const NovuReadyContext = React.createContext<boolean>(false)

/**
 * Provider component that wraps NotificationCenter children
 * and signals that Novu context is available.
 */
export function NovuReadyProvider({ children }: { children: React.ReactNode }) {
  return (
    <NovuReadyContext.Provider value={true}>
      {children}
    </NovuReadyContext.Provider>
  )
}

/**
 * Safe wrapper that checks for Novu context before rendering.
 * Falls back to a loading bell while Novu initializes.
 * Once Novu is ready, renders the full notification center.
 */
export function NotificationCenter() {
  const isNovuReady = React.useContext(NovuReadyContext)
  const [isOpen, setIsOpen] = React.useState(false)

  // If Novu is not ready yet, show a bell with loading state
  // The bell is still clickable but shows 0 count
  if (!isNovuReady) {
    return (
      <NotificationBell
        onClick={() => setIsOpen(true)}
        count={0}
        isOpen={isOpen}
      />
    )
  }

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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'shadow-sm ring-1 transition-all duration-200',
        'hover:shadow-md active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2',
        'bg-bg-white-0 text-text-sub-600 ring-stroke-soft-200 hover:text-text-strong-950',
        'dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:text-neutral-50',
        'size-11 sm:size-10 group'
      )}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell
        className="size-5 transition-transform duration-300 group-hover:rotate-12"
        weight="duotone"
      />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 sm:size-[18px] items-center justify-center rounded-full bg-error-base text-white text-label-xs font-semibold ring-2 ring-bg-white-0 dark:ring-neutral-900 animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
