"use client"

import * as React from "react"
// import { usePreferences } from "@novu/react" // Removed - Novu not configured
import * as Switch from "@/components/ui/forms/switch"
import { cn } from "@/utils/cn"
import { Bell, Envelope, DeviceMobile, ChatCircle, Info } from "@phosphor-icons/react"

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
// Novu Preferences Panel Component (with hooks)
// ============================================

function NovuPreferencesPanelWithNovu() {
	// Novu removed - show empty state instead
	return <NovuPreferencesPanelEmpty />
}

// ============================================
// Workflow Preference Card
// ============================================

// WorkflowPreferenceCard removed - Novu not configured

// ============================================
// Exported Wrapper Component
// ============================================

export function NovuPreferencesPanel() {
	// Novu removed - always show empty state
		return <NovuPreferencesPanelEmpty />
}
