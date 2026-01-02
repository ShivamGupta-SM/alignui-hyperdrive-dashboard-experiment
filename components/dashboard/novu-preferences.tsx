"use client"

import * as React from "react"
import { usePreferences, useNovu } from "@novu/react"
import * as Switch from "@/components/ui/forms/switch"
import { cn } from "@/lib/utils"
import { logError } from "@/lib/logging/error-logger-simple"
import { Bell, Envelope, DeviceMobile, ChatCircle, Info } from "@phosphor-icons/react"
import { isNovuEnabled } from "@/hooks/shared/use-novu"

// Channel configuration for display
const channelConfig: Record<
	string,
	{ icon: React.ElementType; label: string; description: string }
> = {
	email: {
		icon: Envelope,
		label: "Email",
		description: "Receive notifications via email",
	},
	sms: {
		icon: DeviceMobile,
		label: "SMS",
		description: "Receive notifications via text message",
	},
	in_app: {
		icon: Bell,
		label: "In-App",
		description: "Show in notification center",
	},
	push: {
		icon: DeviceMobile,
		label: "Push",
		description: "Browser push notifications",
	},
	chat: {
		icon: ChatCircle,
		label: "Chat",
		description: "Slack/Discord notifications",
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
					<p className="text-paragraph-xs text-text-sub-600">
						Manage how you receive notifications
					</p>
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
// Loading State
// ============================================

function NovuPreferencesPanelLoading() {
	return (
		<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5">
			<div className="flex items-center gap-3 mb-4">
				<div className="size-10 rounded-lg bg-gradient-to-br from-primary-base/10 to-primary-base/20 flex items-center justify-center">
					<Bell className="size-5 text-primary-base" weight="duotone" />
				</div>
				<div>
					<h3 className="text-label-md text-text-strong-950">Channel Preferences</h3>
					<p className="text-paragraph-xs text-text-sub-600">
						Manage how you receive notifications
					</p>
				</div>
			</div>
			{/* Skeleton instead of blocking spinner */}
			<div className="space-y-3">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-bg-weak-50/50">
						<div className="flex items-center gap-3">
							<div className="size-8 bg-bg-weak-50 rounded-lg animate-pulse" />
							<div className="space-y-1.5">
								<div className="h-4 w-16 bg-bg-weak-50 rounded animate-pulse" />
								<div className="h-3 w-32 bg-bg-weak-50 rounded animate-pulse" />
							</div>
						</div>
						<div className="h-6 w-10 bg-bg-weak-50 rounded-full animate-pulse" />
					</div>
				))}
			</div>
		</div>
	)
}

// ============================================
// Channel Toggle Row
// ============================================

interface ChannelToggleProps {
	channelType: string
	enabled: boolean
	onToggle: (enabled: boolean) => void
	disabled?: boolean
}

function ChannelToggle({ channelType, enabled, onToggle, disabled }: ChannelToggleProps) {
	const config = channelConfig[channelType]
	if (!config) return null

	const Icon = config.icon

	return (
		<div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-bg-weak-50/50 transition-colors duration-150">
			<div className="flex items-center gap-3 min-w-0">
				<div className="size-8 rounded-lg bg-bg-weak-50 flex items-center justify-center shrink-0">
					<Icon className="size-4 text-text-sub-600" />
				</div>
				<div className="min-w-0">
					<p className="text-label-sm text-text-strong-950">{config.label}</p>
					<p className="text-paragraph-xs text-text-sub-600 truncate">{config.description}</p>
				</div>
			</div>
			<Switch.Root
				checked={enabled}
				onCheckedChange={onToggle}
				disabled={disabled}
			/>
		</div>
	)
}

// ============================================
// Workflow Preference Card
// ============================================

interface WorkflowPreference {
	workflow?: {
		identifier?: string
		name?: string
	}
	channels: Record<string, boolean>
}

interface WorkflowPreferenceCardProps {
	preference: WorkflowPreference
	onUpdateChannel: (workflowId: string, channelType: string, enabled: boolean) => void
	isUpdating?: boolean
}

function WorkflowPreferenceCard({ preference, onUpdateChannel, isUpdating }: WorkflowPreferenceCardProps) {
	const workflowId = preference.workflow?.identifier || ""
	const workflowName = preference.workflow?.name || "Unknown Workflow"

	return (
		<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
			<h4 className="text-label-sm text-text-strong-950 mb-3">{workflowName}</h4>
			<div className="space-y-1">
				{Object.entries(preference.channels).map(([channelType, enabled]) => (
					<ChannelToggle
						key={channelType}
						channelType={channelType}
						enabled={Boolean(enabled)}
						onToggle={(newEnabled) => onUpdateChannel(workflowId, channelType, newEnabled)}
						disabled={isUpdating}
					/>
				))}
			</div>
		</div>
	)
}

// ============================================
// Novu Preferences Panel Component (with hooks)
// ============================================

function NovuPreferencesPanelWithNovu() {
	const novu = useNovu()
	const { preferences, isLoading, error } = usePreferences()
	const [isUpdating, setIsUpdating] = React.useState(false)

	// Handle preference update
	const handleUpdateChannel = React.useCallback(
		async (workflowId: string, channelType: string, enabled: boolean) => {
			if (!novu) return

			setIsUpdating(true)
			try {
				await novu.preferences.update({
					workflowId,
					channels: {
						[channelType]: enabled,
					},
				})
			} catch (err) {
				logError(err, { source: "NovuPreferences", data: { workflowId, channelType, action: "updatePreference" } })
			} finally {
				setIsUpdating(false)
			}
		},
		[novu]
	)

	if (isLoading) {
		return <NovuPreferencesPanelLoading />
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5">
				<div className="flex items-center gap-3 mb-4">
					<div className="size-10 rounded-lg bg-gradient-to-br from-error-base/10 to-error-base/20 flex items-center justify-center">
						<Bell className="size-5 text-error-base" weight="duotone" />
					</div>
					<div>
						<h3 className="text-label-md text-text-strong-950">Channel Preferences</h3>
						<p className="text-paragraph-xs text-error-base">
							Failed to load preferences
						</p>
					</div>
				</div>
			</div>
		)
	}

	// First preference is global, rest are workflow-specific
	const globalPreferences = preferences?.[0]
	const workflowPreferences = preferences?.slice(1) || []

	return (
		<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5">
			<div className="flex items-center gap-3 mb-4">
				<div className="size-10 rounded-lg bg-gradient-to-br from-primary-base/10 to-primary-base/20 flex items-center justify-center">
					<Bell className="size-5 text-primary-base" weight="duotone" />
				</div>
				<div>
					<h3 className="text-label-md text-text-strong-950">Channel Preferences</h3>
					<p className="text-paragraph-xs text-text-sub-600">
						Manage how you receive notifications
					</p>
				</div>
			</div>

			{/* Global Preferences */}
			{globalPreferences?.channels && (
				<div className="mb-6">
					<h4 className="text-label-xs text-text-soft-400 uppercase tracking-wider mb-3">
						Global Settings
					</h4>
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4 space-y-1">
						{Object.entries(globalPreferences.channels).map(([channelType, enabled]) => (
							<ChannelToggle
								key={channelType}
								channelType={channelType}
								enabled={Boolean(enabled)}
								onToggle={(newEnabled) =>
									handleUpdateChannel("", channelType, newEnabled)
								}
								disabled={isUpdating}
							/>
						))}
					</div>
				</div>
			)}

			{/* Workflow-specific Preferences */}
			{workflowPreferences.length > 0 && (
				<div>
					<h4 className="text-label-xs text-text-soft-400 uppercase tracking-wider mb-3">
						Notification Types
					</h4>
					<div className="space-y-3">
						{workflowPreferences.map((pref, index) => (
							<WorkflowPreferenceCard
								key={pref.workflow?.identifier || index}
								preference={pref as WorkflowPreference}
								onUpdateChannel={handleUpdateChannel}
								isUpdating={isUpdating}
							/>
						))}
					</div>
				</div>
			)}

			{/* Empty state if no preferences */}
			{(!preferences || preferences.length === 0) && (
				<div className="flex items-center gap-3 p-4 rounded-xl bg-bg-weak-50 border border-stroke-soft-200">
					<Info className="size-5 text-text-soft-400 shrink-0" weight="fill" />
					<p className="text-paragraph-sm text-text-sub-600">
						No notification preferences available yet.
					</p>
				</div>
			)}
		</div>
	)
}

// ============================================
// Exported Wrapper Component
// ============================================

export function NovuPreferencesPanel() {
	// Check if Novu is configured
	if (!isNovuEnabled()) {
		return <NovuPreferencesPanelEmpty />
	}

	return <NovuPreferencesPanelWithNovu />
}
