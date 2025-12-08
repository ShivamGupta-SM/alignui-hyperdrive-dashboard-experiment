'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'
import * as Drawer from '@/components/ui/drawer'
import * as Button from '@/components/ui/button'
import * as Badge from '@/components/ui/badge'
import * as TabMenu from '@/components/ui/tab-menu-horizontal'
import {
  RiUserFollowLine,
  RiCheckLine,
  RiWallet3Line,
  RiAlertLine,
  RiTeamLine,
  RiFileList3Line,
} from '@remixicon/react'
import type { Notification, NotificationType } from '@/lib/types'

interface NotificationsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications?: Notification[]
  onMarkAllRead?: () => void
  onNotificationClick?: (notification: Notification) => void
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'enrollment_new',
    title: 'New Enrollment',
    message: 'John D. enrolled in Nike Summer Sale',
    actionUrl: '/dashboard/enrollments/1',
    actionLabel: 'Review Now',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
  },
  {
    id: '2',
    userId: '1',
    type: 'campaign_approved',
    title: 'Campaign Live!',
    message: '"Winter Collection" is now active',
    actionUrl: '/dashboard/campaigns/1',
    actionLabel: 'View Campaign',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
  },
  {
    id: '3',
    userId: '1',
    type: 'wallet_credit',
    title: 'Wallet Update',
    message: '₹50,000 credited to your wallet',
    actionUrl: '/dashboard/wallet',
    actionLabel: 'View Wallet',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '4',
    userId: '1',
    type: 'wallet_low_balance',
    title: 'Low Balance Warning',
    message: 'Wallet below ₹10,000 - add funds to continue',
    actionUrl: '/dashboard/wallet',
    actionLabel: 'Add Funds',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: '5',
    userId: '1',
    type: 'team_member_joined',
    title: 'Team Update',
    message: 'Sarah Wilson joined your team',
    actionUrl: '/dashboard/team',
    actionLabel: 'View Team',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
]

const notificationIcons: Record<NotificationType, React.ElementType> = {
  enrollment_new: RiUserFollowLine,
  enrollment_approved: RiCheckLine,
  enrollment_rejected: RiAlertLine,
  campaign_approved: RiCheckLine,
  campaign_rejected: RiAlertLine,
  wallet_credit: RiWallet3Line,
  wallet_low_balance: RiAlertLine,
  team_member_joined: RiTeamLine,
  invoice_generated: RiFileList3Line,
}

const notificationColors: Record<NotificationType, string> = {
  enrollment_new: 'bg-primary-lighter text-primary-base',
  enrollment_approved: 'bg-success-lighter text-success-base',
  enrollment_rejected: 'bg-error-lighter text-error-base',
  campaign_approved: 'bg-success-lighter text-success-base',
  campaign_rejected: 'bg-error-lighter text-error-base',
  wallet_credit: 'bg-success-lighter text-success-base',
  wallet_low_balance: 'bg-warning-lighter text-warning-base',
  team_member_joined: 'bg-information-lighter text-information-base',
  invoice_generated: 'bg-bg-weak-50 text-text-sub-600',
}

export function NotificationsDrawer({
  open,
  onOpenChange,
  notifications = mockNotifications,
  onMarkAllRead,
  onNotificationClick,
}: NotificationsDrawerProps) {
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all')

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
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
      groups.push({ label: 'Today', notifications: todayNotifications })
    }
    if (yesterdayNotifications.length > 0) {
      groups.push({ label: 'Yesterday', notifications: yesterdayNotifications })
    }
    if (olderNotifications.length > 0) {
      groups.push({ label: 'Earlier', notifications: olderNotifications })
    }

    return groups
  }, [filteredNotifications])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Notifications
            {unreadCount > 0 && (
              <Badge.Root color="red" variant="light" size="small" className="ml-2">
                {unreadCount}
              </Badge.Root>
            )}
          </Drawer.Title>
        </Drawer.Header>

        <Drawer.Body className="flex flex-col">
          {/* Filter Tabs */}
          <div className="px-5 pb-4 border-b border-stroke-soft-200">
            <TabMenu.Root value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
              <TabMenu.List>
                <TabMenu.Trigger value="all">All</TabMenu.Trigger>
                <TabMenu.Trigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabMenu.Trigger>
              </TabMenu.List>
            </TabMenu.Root>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {groupedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <div className="size-12 rounded-full bg-bg-weak-50 flex items-center justify-center mb-3">
                  <RiCheckLine className="size-6 text-text-soft-400" />
                </div>
                <p className="text-label-md text-text-strong-950 mb-1">All caught up!</p>
                <p className="text-paragraph-sm text-text-sub-600">
                  No {filter === 'unread' ? 'unread ' : ''}notifications
                </p>
              </div>
            ) : (
              groupedNotifications.map((group) => (
                <div key={group.label}>
                  <div className="px-5 py-2 bg-bg-weak-50">
                    <span className="text-label-xs text-text-sub-600 uppercase">
                      {group.label}
                    </span>
                  </div>
                  {group.notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type]
                    const colorClass = notificationColors[notification.type]

                    return (
                      <button
                        key={notification.id}
                        onClick={() => onNotificationClick?.(notification)}
                        className={cn(
                          'w-full text-left px-5 py-4 border-b border-stroke-soft-200',
                          'transition-colors hover:bg-bg-weak-50',
                          !notification.isRead && 'bg-primary-alpha-10'
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn('size-8 rounded-full flex items-center justify-center shrink-0', colorClass)}>
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-label-sm text-text-strong-950">
                                {notification.title}
                              </span>
                              <span className="text-paragraph-xs text-text-soft-400 shrink-0">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-paragraph-sm text-text-sub-600 mb-2">
                              {notification.message}
                            </p>
                            {notification.actionLabel && (
                              <span className="text-label-xs text-primary-base">
                                {notification.actionLabel} →
                              </span>
                            )}
                          </div>
                          {!notification.isRead && (
                            <div className="size-2 rounded-full bg-primary-base shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </Drawer.Body>

        {unreadCount > 0 && (
          <Drawer.Footer>
            <Button.Root
              variant="basic"
              className="w-full"
              onClick={onMarkAllRead}
            >
              Mark All as Read
            </Button.Root>
          </Drawer.Footer>
        )}
      </Drawer.Content>
    </Drawer.Root>
  )
}

