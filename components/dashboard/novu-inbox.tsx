'use client'

import { Inbox } from '@novu/nextjs'
import { useTheme } from 'next-themes'
import { Bell } from '@phosphor-icons/react'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/utils/cn'

/**
 * Bell Button - Matches header iconButtonStyles
 * Uses !important to override Novu's CSS interference
 */
function BellButton({ count = 0 }: { count?: number }) {
  return (
    <div
      className={cn(
        // Exact same classes as header.tsx iconButtonStyles
        "!flex !items-center !justify-center !rounded-full !shadow-sm !ring-1 !transition-all !duration-200",
        "hover:!shadow-md active:!scale-95",
        "focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-primary-base focus-visible:!ring-offset-2",
        "!bg-bg-white-0 !text-text-sub-600 !ring-stroke-soft-200 hover:!text-text-strong-950",
        // Size matching header buttons
        "!relative !size-11 sm:!size-10 group"
      )}
    >
      <Bell
        className="size-4 sm:size-5 transition-transform duration-300 group-hover:rotate-12"
        weight="duotone"
      />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 sm:size-[18px] items-center justify-center rounded-full bg-error-base text-label-xs font-semibold text-white ring-2 ring-bg-white-0 animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  )
}

/**
 * Novu Inbox Component - Notification bell with dropdown panel
 * Uses Encore client session for subscriber identification.
 */
export function NovuInbox() {
  const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID
  const apiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL
  const wsUrl = process.env.NEXT_PUBLIC_NOVU_WS_URL
  const { resolvedTheme } = useTheme()
  const { data: session, isPending } = useSession()

  if (!appId) return null
  if (isPending) return <BellButton />
  if (!session?.user?.id) return <BellButton />

  const subscriberId = String(session.user.id)
  const isDark = resolvedTheme === 'dark'

  return (
    <Inbox
      applicationIdentifier={appId}
      subscriber={subscriberId}
      backendUrl={apiUrl}
      socketUrl={wsUrl}
      renderBell={(unreadCountObj) => <BellButton count={unreadCountObj?.total ?? 0} />}
      appearance={{
        elements: {
          // Bell wrapper - make invisible so our BellButton shows through
          root: "!bg-transparent !p-0 !m-0 !border-0 !shadow-none",
          bellContainer: cn(
            "!bg-transparent !p-0 !m-0 !border-0 !shadow-none !rounded-none",
            "[&>button]:!bg-transparent [&>button]:!p-0 [&>button]:!m-0 [&>button]:!border-0 [&>button]:!shadow-none"
          ),
          bellIcon: "!hidden",
          popoverTrigger: "!bg-transparent !p-0 !m-0 !border-0 !shadow-none !rounded-none",

          // Notification Panel - positioned fixed to prevent layout shift
          popoverContent: cn(
            "!w-[340px] sm:!w-[400px] !max-h-[80vh] !overflow-hidden !z-[9999]",
            "!rounded-2xl !border !border-stroke-soft-200 !shadow-2xl",
            "!fixed !top-16 !right-4 sm:!right-6",
            // Force background color for both modes
            isDark ? "!bg-neutral-950" : "!bg-white"
          ),

          // Header
          inboxHeader: cn(
            "!px-4 !py-3 !border-b !border-stroke-soft-200",
            isDark ? "!bg-neutral-950" : "!bg-white"
          ),
          inboxStatus__title: cn(
            "!text-label-md !font-medium",
            isDark ? "!text-neutral-50" : "!text-neutral-950"
          ),
          inboxStatus__dropdownTrigger: cn(
            "!text-label-sm !rounded-lg !px-2 !py-1",
            isDark
              ? "!text-neutral-400 hover:!text-neutral-50 hover:!bg-neutral-800"
              : "!text-neutral-600 hover:!text-neutral-950 hover:!bg-neutral-50"
          ),
          inboxStatus__dropdownContent: cn(
            "!border !border-stroke-soft-200 !rounded-xl !shadow-xl !z-[10000]",
            isDark ? "!bg-neutral-900" : "!bg-white"
          ),
          inboxStatus__dropdownItem: cn(
            "!px-3 !py-2 !text-paragraph-sm",
            isDark
              ? "!text-neutral-400 hover:!bg-neutral-800 hover:!text-neutral-50"
              : "!text-neutral-600 hover:!bg-neutral-50 hover:!text-neutral-950"
          ),

          // Notification List
          notificationList: cn(
            "!divide-y !divide-stroke-soft-200",
            isDark ? "!bg-neutral-950" : "!bg-white"
          ),
          notificationListContainer: isDark ? "!bg-neutral-950" : "!bg-white",

          // Individual Notification
          notification: cn(
            "!p-4 !transition-colors !cursor-pointer",
            "!border-l-[3px] !border-l-transparent",
            isDark
              ? "!bg-neutral-950 hover:!bg-neutral-900 data-[unread=true]:!border-l-primary-base data-[unread=true]:!bg-neutral-900"
              : "!bg-white hover:!bg-neutral-50 data-[unread=true]:!border-l-primary-base data-[unread=true]:!bg-primary-alpha-10"
          ),
          notificationSubject: cn(
            "!text-label-sm !font-medium !mb-1",
            isDark ? "!text-neutral-50" : "!text-neutral-950"
          ),
          notificationBody: cn(
            "!text-paragraph-sm !line-clamp-2",
            isDark ? "!text-neutral-400" : "!text-neutral-600"
          ),
          notificationDate: cn(
            "!text-paragraph-xs !mt-2",
            isDark ? "!text-neutral-500" : "!text-neutral-400"
          ),
          notificationImage: cn(
            "!size-10 !rounded-xl",
            isDark ? "!bg-primary-base/20" : "!bg-primary-alpha-10"
          ),
          notificationDot: "!bg-primary-base !size-2 !rounded-full",

          // Actions
          notificationPrimaryAction__button: cn(
            "!text-label-xs !font-medium !text-primary-base !px-3 !py-1.5 !rounded-lg",
            isDark ? "!bg-primary-base/20 hover:!bg-primary-base/30" : "!bg-primary-alpha-10 hover:!bg-primary-alpha-16"
          ),
          notificationSecondaryAction__button: cn(
            "!text-label-xs !px-3 !py-1.5 !rounded-lg",
            isDark
              ? "!text-neutral-400 !bg-neutral-800 hover:!bg-neutral-700"
              : "!text-neutral-600 !bg-neutral-50 hover:!bg-neutral-100"
          ),
          notificationArchive__button: cn(
            "!size-8 !rounded-lg",
            isDark
              ? "!text-neutral-500 hover:!text-neutral-50 hover:!bg-neutral-800"
              : "!text-neutral-400 hover:!text-neutral-950 hover:!bg-neutral-50"
          ),
          notificationUnread__button: cn(
            "!size-8 !rounded-lg",
            isDark
              ? "!text-neutral-500 hover:!text-primary-base hover:!bg-primary-base/20"
              : "!text-neutral-400 hover:!text-primary-base hover:!bg-primary-alpha-10"
          ),
          preferences__button: cn(
            "!size-8 !rounded-lg",
            isDark
              ? "!text-neutral-500 hover:!text-neutral-50 hover:!bg-neutral-800"
              : "!text-neutral-400 hover:!text-neutral-950 hover:!bg-neutral-50"
          ),

          // Empty State
          notificationListEmptyNoticeContainer: cn(
            "!py-16 !px-6 !text-center",
            isDark ? "!bg-neutral-950" : "!bg-white"
          ),
          notificationListEmptyNoticeIcon: cn(
            "!size-12 !mx-auto !mb-4",
            isDark ? "!text-neutral-600" : "!text-neutral-400"
          ),
          notificationListEmptyNotice: cn(
            "!text-paragraph-sm",
            isDark ? "!text-neutral-400" : "!text-neutral-600"
          ),
        },
      }}
    />
  )
}
