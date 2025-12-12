'use client'

import * as React from 'react'
import { usePreferences } from '@novu/react'
import * as Switch from '@/components/ui/switch'
import { cn } from '@/utils/cn'
import {
  Bell,
  Envelope,
  DeviceMobile,
  ChatCircle,
  Info,
} from '@phosphor-icons/react'
import { NovuReadyContext } from '@/components/dashboard/notification-center'

// Channel configuration for display
const channelConfig: Record<string, { icon: React.ElementType; label: string; description: string }> = {
  email: {
    icon: Envelope,
    label: 'Email',
    description: 'Receive notifications via email',
  },
  sms: {
    icon: DeviceMobile,
    label: 'SMS',
    description: 'Receive notifications via text message',
  },
  in_app: {
    icon: Bell,
    label: 'In-App',
    description: 'Show in notification center',
  },
  push: {
    icon: DeviceMobile,
    label: 'Push',
    description: 'Browser push notifications',
  },
  chat: {
    icon: ChatCircle,
    label: 'Chat',
    description: 'Slack/Discord notifications',
  },
}

// ============================================
// Fallback when Novu is not ready
// ============================================

function NovuPreferencesPanelEmpty() {
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-lg bg-gradient-to-br from-primary-base/10 to-primary-base/20 flex items-center justify-center">
          <Bell className="size-5 text-primary-base" weight="duotone" />
        </div>
        <div>
          <h3 className="text-label-md text-text-strong-950">Channel Preferences</h3>
          <p className="text-paragraph-xs text-text-sub-600">Manage how you receive notifications</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-weak-50 border border-stroke-soft-200">
        <Info className="size-5 text-text-soft-400 shrink-0" weight="fill" />
        <p className="text-paragraph-sm text-text-sub-600">
          Notification preferences will be available once you're signed in.
        </p>
      </div>
    </div>
  )
}

// ============================================
// Novu Preferences Panel Component (with hooks)
// ============================================

function NovuPreferencesPanelWithNovu() {
  const { preferences, isLoading, error, refetch } = usePreferences()
  const [updating, setUpdating] = React.useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-lg bg-gradient-to-br from-primary-base/10 to-primary-base/20 flex items-center justify-center">
            <Bell className="size-5 text-primary-base" weight="duotone" />
          </div>
          <div>
            <h3 className="text-label-md text-text-strong-950">Channel Preferences</h3>
            <p className="text-paragraph-xs text-text-sub-600">Manage how you receive notifications</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-bg-weak-50/50 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-bg-soft-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-20 bg-bg-soft-200 rounded" />
                  <div className="h-3 w-32 bg-bg-soft-200 rounded" />
                </div>
              </div>
              <div className="h-6 w-11 bg-bg-soft-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !preferences || preferences.length === 0) {
    return (
      <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-warning-lighter/30 border border-warning-base/20">
          <Info className="size-5 text-warning-base shrink-0" weight="fill" />
          <p className="text-paragraph-sm text-text-sub-600">
            Unable to load notification preferences. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Get global preferences (first item) and workflow-specific preferences
  const globalPrefs = preferences[0]
  const workflowPrefs = preferences.slice(1)

  const handleChannelToggle = async (
    preference: (typeof preferences)[number],
    channelType: string,
    enabled: boolean
  ) => {
    setUpdating(`${preference.workflow?.id || 'global'}-${channelType}`)
    try {
      await preference.update({
        channels: {
          [channelType]: enabled,
        },
      })
      refetch()
    } catch (err) {
      console.error('Failed to update preference:', err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-lg bg-gradient-to-br from-primary-base/10 to-primary-base/20 flex items-center justify-center">
          <Bell className="size-5 text-primary-base" weight="duotone" />
        </div>
        <div>
          <h3 className="text-label-md text-text-strong-950">Channel Preferences</h3>
          <p className="text-paragraph-xs text-text-sub-600">Manage how you receive notifications</p>
        </div>
      </div>

      {/* Global Preferences */}
      {globalPrefs?.channels && (
        <div className="space-y-1">
          {Object.entries(globalPrefs.channels).map(([channel, isEnabled]) => {
            const channelInfo = channelConfig[channel]
            if (!channelInfo) return null

            // Novu channels can be boolean or object with enabled property
            const enabled = typeof isEnabled === 'boolean' ? isEnabled : (isEnabled as { enabled?: boolean })?.enabled ?? false
            const Icon = channelInfo.icon
            const isUpdating = updating === `global-${channel}`

            return (
              <div
                key={channel}
                className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-bg-weak-50/50 transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'flex size-9 items-center justify-center rounded-lg shrink-0',
                    enabled ? 'bg-primary-alpha-10' : 'bg-bg-weak-50'
                  )}>
                    <Icon className={cn(
                      'size-4',
                      enabled ? 'text-primary-base' : 'text-text-soft-400'
                    )} weight="duotone" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-sm text-text-strong-950">{channelInfo.label}</p>
                    <p className="text-paragraph-xs text-text-sub-600">{channelInfo.description}</p>
                  </div>
                </div>
                <Switch.Root
                  checked={enabled}
                  onCheckedChange={(checked) => handleChannelToggle(globalPrefs, channel, checked)}
                  disabled={isUpdating}
                  className={cn(isUpdating && 'opacity-50')}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Workflow-Specific Preferences */}
      {workflowPrefs.length > 0 && (
        <>
          <div className="my-4 border-t border-stroke-soft-200" />
          <h4 className="text-label-sm text-text-sub-600 mb-3">Workflow Preferences</h4>
          <div className="space-y-3">
            {workflowPrefs.map((pref) => (
              <WorkflowPreferenceCard
                key={pref.workflow?.id}
                preference={pref}
                updating={updating}
                onToggle={handleChannelToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// Workflow Preference Card
// ============================================

interface WorkflowPreferenceCardProps {
  preference: ReturnType<typeof usePreferences>['preferences'] extends (infer T)[] | undefined ? T : never
  updating: string | null
  onToggle: (
    preference: ReturnType<typeof usePreferences>['preferences'] extends (infer T)[] | undefined ? T : never,
    channelType: string,
    enabled: boolean
  ) => void
}

function WorkflowPreferenceCard({ preference, updating, onToggle }: WorkflowPreferenceCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const workflowId = preference?.workflow?.id || 'unknown'

  // Count enabled channels
  const enabledCount = preference?.channels
    ? Object.values(preference.channels).filter((c) => {
        const enabled = typeof c === 'boolean' ? c : (c as { enabled?: boolean })?.enabled ?? false
        return enabled
      }).length
    : 0

  return (
    <div className="rounded-xl border border-stroke-soft-200 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-bg-weak-50/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-bg-weak-50 shrink-0">
            <Bell className="size-4 text-text-soft-400" weight="duotone" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-label-sm text-text-strong-950 truncate">
              {preference?.workflow?.name || 'Workflow'}
            </p>
            <p className="text-paragraph-xs text-text-sub-600">
              {enabledCount} channels enabled
            </p>
          </div>
        </div>
        <svg
          className={cn(
            'size-4 text-text-soft-400 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && preference?.channels && (
        <div className="px-3 pb-3 space-y-1 border-t border-stroke-soft-200 pt-2">
          {Object.entries(preference.channels).map(([channel, isEnabled]) => {
            const channelInfo = channelConfig[channel]
            if (!channelInfo) return null

            // Novu channels can be boolean or object with enabled property
            const enabled = typeof isEnabled === 'boolean' ? isEnabled : (isEnabled as { enabled?: boolean })?.enabled ?? false
            const Icon = channelInfo.icon
            const isUpdating = updating === `${workflowId}-${channel}`

            return (
              <div
                key={channel}
                className="flex items-center justify-between gap-3 p-2 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={cn(
                    'size-4 shrink-0',
                    enabled ? 'text-primary-base' : 'text-text-soft-400'
                  )} weight="duotone" />
                  <span className="text-label-xs text-text-sub-600">{channelInfo.label}</span>
                </div>
                <Switch.Root
                  checked={enabled}
                  onCheckedChange={(checked) => onToggle(preference, channel, checked)}
                  disabled={isUpdating}
                  className={cn('scale-90', isUpdating && 'opacity-50')}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// Exported Wrapper Component
// ============================================

export function NovuPreferencesPanel() {
  const isNovuReady = React.useContext(NovuReadyContext)

  if (!isNovuReady) {
    return <NovuPreferencesPanelEmpty />
  }

  return <NovuPreferencesPanelWithNovu />
}
