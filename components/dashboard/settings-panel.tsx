"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import * as Avatar from "@/components/ui/primitives/avatar"
import * as Switch from "@/components/ui/forms/switch"
import * as Button from "@/components/ui/primitives/button"
import * as Divider from "@/components/ui/layout/divider"
import * as Input from "@/components/ui/forms/input"
import * as Select from "@/components/ui/forms/select"
import {
	X,
	ArrowLeft,
	CaretRight,
	User,
	Lock,
	Bell,
	Moon,
	Sun,
	Buildings,
	UsersThree,
	Question,
	BookOpen,
	Headset,
	SignOut,
	Check,
	Plus,
} from "@phosphor-icons/react"
import { useParams } from "next/navigation"
import { useSession, useSignOut } from "@/features/auth"
import { useUpdateOrganization } from "@/features/organizations"
import { useCurrentOrganization } from "@/hooks"
import { useTeamMembers, useInviteMember } from "@/features/team"
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/features/notifications"
import { useUpdateProfile, useUpdatePassword } from "@/features/settings"
import { DISPLAY_LIMITS } from "@/lib/constants"
import { getInitial } from "@/lib/utils/string"
import { routes } from "@/lib/routes"
import { toast } from "sonner"

interface SettingsPanelProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

type SubPanelType =
	| "profile"
	| "password"
	| "notifications"
	| "org-settings"
	| "team"
	| "help"
	| "docs"
	| "contact"
	| null

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
	const [activeSubPanel, setActiveSubPanel] = React.useState<SubPanelType>(null)

	// Close panel handler
	const handleClose = React.useCallback(() => {
		setActiveSubPanel(null)
		onOpenChange(false)
	}, [onOpenChange])

	// Back to main panel
	const handleBack = React.useCallback(() => {
		setActiveSubPanel(null)
	}, [])

	// Menu item click
	const handleMenuClick = React.useCallback((panel: SubPanelType) => {
		setActiveSubPanel(panel)
	}, [])

	// Reset sub-panel when main panel closes
	React.useEffect(() => {
		if (!open) {
			setActiveSubPanel(null)
		}
	}, [open])

	if (!open) return null

	return (
		<>
			{/* Overlay */}
			<div
				className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
				onClick={handleClose}
				aria-hidden="true"
			/>

			{/* Panel Container */}
			<div
				className={cn(
					// Base positioning and styling
					"fixed z-50 flex flex-col bg-bg-white-0 shadow-2xl overflow-hidden",
					// Mobile: full screen
					"inset-0",
					// Desktop: positioned right with margin from edges, rounded corners on all sides
					"sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[400px] sm:rounded-2xl",
					// Animation
					"transform transition-transform duration-300 ease-in-out",
					open ? "translate-x-0" : "translate-x-full"
				)}
				style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
			>
				{/* Main Panel or Sub Panel */}
				{activeSubPanel === null ? (
					<MainSettingsPanel onClose={handleClose} onMenuClick={handleMenuClick} />
				) : (
					<SubPanel
						type={activeSubPanel}
						onBack={handleBack}
						onClose={handleClose}
					/>
				)}
			</div>
		</>
	)
}

// ===========================================
// MAIN SETTINGS PANEL
// ===========================================
interface MainSettingsPanelProps {
	onClose: () => void
	onMenuClick: (panel: SubPanelType) => void
}

function MainSettingsPanel({ onClose, onMenuClick }: MainSettingsPanelProps) {
	const { setTheme, resolvedTheme } = useTheme()
	const { data: session } = useSession()
	const user = session?.user
	// SSOT: useCurrentOrganization auto-extracts organizationId from URL params
	const { organization, organizationId } = useCurrentOrganization()
	const { signOut: handleSignOut } = useSignOut()

	const isDarkMode = resolvedTheme === "dark"
	const onToggleDarkMode = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")
	const onSignOut = handleSignOut
	return (
		<div className="flex h-full flex-col">
			{/* Header - Consistent with notifications drawer */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-stroke-soft-200">
				<div className="flex items-center gap-3">
					{user && (
						<>
							<Avatar.Root size="40" color="blue" className="ring-2 ring-primary-base/20">
								{user.image ? (
									<Avatar.Image src={user.image} alt={user.name || ""} />
								) : (
									<span className="text-label-md font-semibold">
										{getInitial(user.name || user.email)}
									</span>
								)}
							</Avatar.Root>
							<div>
								<h2 className="text-label-md text-text-strong-950">{user.name || "User"}</h2>
								<p className="text-paragraph-xs text-text-sub-600">{user.email || ""}</p>
							</div>
						</>
					)}
				</div>
				<button
					type="button"
					onClick={onClose}
					className="size-11 rounded-lg flex items-center justify-center text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base -mr-1.5"
					aria-label="Close settings"
				>
					<X className="size-5" weight="bold" />
				</button>
			</div>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				{/* Quick Actions Card */}
				<div className="p-4">
					<div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-primary-base/5 to-primary-darker/5 p-4 ring-1 ring-inset ring-stroke-soft-200">
						<div className="flex-1 min-w-0">
							<p className="text-paragraph-sm text-text-sub-600">
								{user?.role || "Admin"} at{" "}
								<span className="font-medium text-text-strong-950">
									{organization?.name || "Organization"}
								</span>
							</p>
						</div>
						<button
							type="button"
							onClick={() => onMenuClick("org-settings")}
							className="text-label-xs text-primary-base hover:text-primary-dark transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 rounded"
						>
							Manage →
						</button>
					</div>
				</div>

				{/* Account Section */}
				<div className="px-5 pb-4">
					<SectionHeader>Account</SectionHeader>
					<div className="space-y-1">
						<MenuItem
							icon={User}
							label="My Profile"
							href={organizationId ? routes.dashboard.profile(organizationId) : routes.dashboard.root}
							onClick={onClose}
						/>
						<MenuItem
							icon={Lock}
							label="Change Password"
							href={organizationId ? routes.dashboard.profile(organizationId, "security") : routes.dashboard.root}
							onClick={onClose}
						/>
						<MenuItem
							icon={Bell}
							label="Notifications"
							href={organizationId ? routes.dashboard.profile(organizationId, "notifications") : routes.dashboard.root}
							onClick={onClose}
						/>
						<div className="flex items-center justify-between rounded-10 px-3 py-2.5">
							<div className="flex items-center gap-3">
								{isDarkMode ? (
									<Moon className="size-5 text-text-sub-600" weight="duotone" />
								) : (
									<Sun className="size-5 text-text-sub-600" weight="duotone" />
								)}
								<span className="text-paragraph-sm text-text-strong-950">Dark Mode</span>
							</div>
							<Switch.Root checked={isDarkMode} onCheckedChange={onToggleDarkMode} />
						</div>
					</div>
				</div>

				<Divider.Root className="mx-5" />

				{/* Organization Section */}
				<div className="px-5 py-4">
					<SectionHeader>Organization</SectionHeader>
					<div className="space-y-1">
						<MenuItem
							icon={Buildings}
							label="Organization Settings"
							href={organizationId ? routes.dashboard.settings(organizationId) : routes.dashboard.root}
							onClick={onClose}
						/>
						<MenuItem
							icon={UsersThree}
							label="Team Members"
							href={organizationId ? routes.dashboard.team(organizationId) : routes.dashboard.root}
							onClick={onClose}
						/>
					</div>
				</div>

				<Divider.Root className="mx-5" />

				{/* Support Section */}
				<div className="px-5 py-4">
					<SectionHeader>Support</SectionHeader>
					<div className="space-y-1">
						<MenuItem icon={Question} label="Help Center" onClick={() => onMenuClick("help")} />
						<MenuItem
							icon={BookOpen}
							label="Documentation"
							href="https://docs.hypedrive.com"
							external
						/>
						<MenuItem
							icon={Headset}
							label="Contact Support"
							onClick={() => onMenuClick("contact")}
						/>
					</div>
				</div>
			</div>

			{/* Footer - Sign Out */}
			<div
				className="border-t border-stroke-soft-200 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
			>
				<button
					type="button"
					onClick={onSignOut}
					className="flex w-full items-center justify-center gap-2 rounded-xl min-h-11 text-error-base transition-colors hover:bg-error-lighter active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-base"
				>
					<SignOut className="size-5" weight="duotone" />
					<span className="text-label-sm font-medium">Sign Out</span>
				</button>
			</div>
		</div>
	)
}

// ===========================================
// SUB PANELS
// ===========================================
interface SubPanelProps {
	type: SubPanelType
	onBack: () => void
	onClose: () => void
}

function SubPanel({ type, onBack, onClose }: SubPanelProps) {
	const titles: Record<NonNullable<SubPanelType>, string> = {
		profile: "My Profile",
		password: "Change Password",
		notifications: "Notifications",
		"org-settings": "Organization Settings",
		team: "Team Members",
		help: "Help Center",
		docs: "Documentation",
		contact: "Contact Support",
	}

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center gap-2 border-b border-stroke-soft-200 px-4 py-3">
				<button
					type="button"
					onClick={onBack}
					className="size-11 rounded-lg flex items-center justify-center text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
					aria-label="Back"
				>
					<ArrowLeft className="size-5" weight="bold" />
				</button>
				<h2 className="flex-1 text-label-md text-text-strong-950">{titles[type!]}</h2>
				<button
					type="button"
					onClick={onClose}
					className="size-11 rounded-lg flex items-center justify-center text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
					aria-label="Close"
				>
					<X className="size-5" weight="bold" />
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
				{type === "notifications" && <NotificationsSubPanel />}
				{type === "profile" && <ProfileSubPanel />}
				{type === "password" && <PasswordSubPanel />}
				{type === "org-settings" && <OrgSettingsSubPanel />}
				{type === "team" && <TeamSubPanel />}
				{type === "help" && <HelpSubPanel />}
				{type === "contact" && <ContactSubPanel />}
			</div>
		</div>
	)
}

// ===========================================
// NOTIFICATIONS SUB-PANEL
// Uses useNotificationPreferences and useUpdateNotificationPreferences hooks
// ===========================================
function NotificationsSubPanel() {
	const { data: preferences, isPending: isLoading } = useNotificationPreferences()
	const updatePreferences = useUpdateNotificationPreferences()
	const [saved, setSaved] = React.useState(false)

	// Local state for form - initialized from API data
	const [emailEnabled, setEmailEnabled] = React.useState(true)
	const [pushEnabled, setPushEnabled] = React.useState(true)
	const [inAppEnabled, setInAppEnabled] = React.useState(true)

	// Sync local state when preferences load
	React.useEffect(() => {
		if (preferences?.global) {
			setEmailEnabled(preferences.global.email ?? true)
			setPushEnabled(preferences.global.push ?? true)
			setInAppEnabled(preferences.global.inApp ?? true)
		}
	}, [preferences])

	const handleSave = async () => {
		try {
			await updatePreferences.mutateAsync({
				channels: {
					email: emailEnabled,
					push: pushEnabled,
					inApp: inAppEnabled,
				},
			})
			setSaved(true)
			toast.success("Notification preferences saved")
			setTimeout(() => setSaved(false), 2000)
		} catch {
			toast.error("Failed to save preferences")
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				{[1, 2, 3].map((i) => (
					<div key={`skeleton-${i}`} className="h-24 rounded-12 bg-bg-weak-50 animate-pulse" />
				))}
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Email Notifications */}
			<div>
				<SectionHeader>Email Notifications</SectionHeader>
				<div className="space-y-1 mt-3">
					<ToggleRow
						label="Email Notifications"
						checked={emailEnabled}
						onChange={setEmailEnabled}
					/>
				</div>
			</div>

			<Divider.Root />

			{/* Push Notifications */}
			<div>
				<SectionHeader>Push Notifications</SectionHeader>
				<div className="space-y-1 mt-3">
					<ToggleRow
						label="Push Notifications"
						checked={pushEnabled}
						onChange={setPushEnabled}
					/>
				</div>
			</div>

			<Divider.Root />

			{/* In-App Notifications */}
			<div>
				<SectionHeader>In-App Notifications</SectionHeader>
				<div className="space-y-1 mt-3">
					<ToggleRow
						label="In-App Notifications"
						checked={inAppEnabled}
						onChange={setInAppEnabled}
					/>
				</div>
			</div>

			<Divider.Root />

			{/* Save Button */}
			<Button.Root
				variant="primary"
				className="w-full"
				onClick={handleSave}
				disabled={updatePreferences.isPending}
			>
				{saved ? (
					<>
						<Check className="size-4" weight="bold" />
						Saved!
					</>
				) : updatePreferences.isPending ? (
					"Saving..."
				) : (
					"Save Changes"
				)}
			</Button.Root>
		</div>
	)
}

// ===========================================
// PROFILE SUB-PANEL
// Uses useSession for current user and useUpdateProfile hook
// ===========================================
function ProfileSubPanel() {
	const { data: session } = useSession()
	const user = session?.user
	const updateProfile = useUpdateProfile()
	const [name, setName] = React.useState("")
	const [saved, setSaved] = React.useState(false)

	// Initialize from session
	React.useEffect(() => {
		if (user?.name) {
			setName(user.name)
		}
	}, [user])

	const handleSave = async () => {
		try {
			await updateProfile.mutateAsync({ name })
			setSaved(true)
			toast.success("Profile updated")
			setTimeout(() => setSaved(false), 2000)
		} catch {
			toast.error("Failed to update profile")
		}
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col items-center py-4">
				<Avatar.Root size="80" color="blue" className="ring-4 ring-bg-weak-50">
					{user?.image ? (
						<Avatar.Image src={user.image} alt={user.name || ""} />
					) : (
						<span className="text-title-h4">{getInitial(name || user?.name || user?.email)}</span>
					)}
				</Avatar.Root>
				<Button.Root variant="ghost" size="small" className="mt-3">
					Change Photo
				</Button.Root>
			</div>

			<div className="space-y-4">
				<div>
					<label htmlFor="profile-full-name" className="text-label-sm text-text-strong-950 mb-2 block">Full Name</label>
					<Input.Root>
						<Input.Wrapper>
							<Input.El
								id="profile-full-name"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div>
					<label htmlFor="profile-email" className="text-label-sm text-text-strong-950 mb-2 block">Email</label>
					<Input.Root>
						<Input.Wrapper>
							<Input.El
								id="profile-email"
								type="email"
								placeholder="your@email.com"
								value={user?.email || ""}
								disabled
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
			</div>

			<Button.Root
				variant="primary"
				className="w-full"
				onClick={handleSave}
				disabled={updateProfile.isPending || !name}
			>
				{saved ? (
					<>
						<Check className="size-4" weight="bold" />
						Saved!
					</>
				) : updateProfile.isPending ? (
					"Saving..."
				) : (
					"Save Changes"
				)}
			</Button.Root>
		</div>
	)
}

// ===========================================
// PASSWORD SUB-PANEL
// Uses useUpdatePassword hook
// ===========================================
function PasswordSubPanel() {
	const updatePassword = useUpdatePassword()
	const [currentPassword, setCurrentPassword] = React.useState("")
	const [newPassword, setNewPassword] = React.useState("")
	const [confirmPassword, setConfirmPassword] = React.useState("")
	const [saved, setSaved] = React.useState(false)
	const [error, setError] = React.useState("")

	const handleUpdate = async () => {
		setError("")
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match")
			return
		}
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters")
			return
		}
		try {
			const result = await updatePassword.mutateAsync({
				currentPassword,
				newPassword,
			})
			if (result?.data?.success) {
				setSaved(true)
				setCurrentPassword("")
				setNewPassword("")
				setConfirmPassword("")
				toast.success("Password updated")
				setTimeout(() => setSaved(false), 2000)
			} else {
				setError("Failed to update password")
			}
		} catch {
			setError("Failed to update password")
			toast.error("Failed to update password")
		}
	}

	return (
		<div className="space-y-5">
			<div className="space-y-4">
				<div>
					<label htmlFor="current-password" className="text-label-sm text-text-strong-950 mb-2 block">Current Password</label>
					<Input.Root>
						<Input.Wrapper>
							<Input.El
								id="current-password"
								type="password"
								placeholder="Enter current password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div>
					<label htmlFor="new-password" className="text-label-sm text-text-strong-950 mb-2 block">New Password</label>
					<Input.Root>
						<Input.Wrapper>
							<Input.El
								id="new-password"
								type="password"
								placeholder="Enter new password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div>
					<label htmlFor="confirm-password" className="text-label-sm text-text-strong-950 mb-2 block">Confirm Password</label>
					<Input.Root>
						<Input.Wrapper>
							<Input.El
								id="confirm-password"
								type="password"
								placeholder="Confirm new password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				{error && <p className="text-paragraph-xs text-error-base">{error}</p>}
			</div>

			<Button.Root
				variant="primary"
				className="w-full"
				onClick={handleUpdate}
				disabled={updatePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
			>
				{saved ? (
					<>
						<Check className="size-4" weight="bold" />
						Updated!
					</>
				) : updatePassword.isPending ? (
					"Updating..."
				) : (
					"Update Password"
				)}
			</Button.Root>
		</div>
	)
}

// ===========================================
// HELP SUB-PANEL
// ===========================================
function HelpSubPanel() {
	const helpTopics = [
		{ title: "Getting Started", description: "Learn the basics of the platform" },
		{ title: "Campaign Management", description: "Create and manage campaigns" },
		{ title: "Enrollment Review", description: "Review and approve enrollments" },
		{ title: "Wallet & Payments", description: "Manage your wallet balance and transactions" },
		{ title: "FAQs", description: "Frequently asked questions" },
	]

	return (
		<div className="space-y-3">
			{helpTopics.map((topic) => (
				<button
					key={topic.title}
					type="button"
					className="w-full rounded-12 bg-bg-weak-50 p-4 text-left transition-colors hover:bg-bg-soft-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
				>
					<h4 className="text-label-sm text-text-strong-950">{topic.title}</h4>
					<p className="text-paragraph-xs text-text-sub-600 mt-0.5">{topic.description}</p>
				</button>
			))}
		</div>
	)
}

// ===========================================
// CONTACT SUB-PANEL
// ===========================================
function ContactSubPanel() {
	return (
		<div className="space-y-5">
			<div className="rounded-12 bg-bg-weak-50 p-4 text-center">
				<Headset className="size-10 text-primary-base mx-auto mb-2" weight="duotone" />
				<h4 className="text-label-md text-text-strong-950">Need Help?</h4>
				<p className="text-paragraph-sm text-text-sub-600 mt-1">
					Our support team is available 24/7
				</p>
			</div>

			<div className="space-y-4">
				<div>
					<label htmlFor="contact-subject" className="text-label-sm text-text-strong-950 mb-2 block">Subject</label>
					<Select.Root>
						<Select.Trigger id="contact-subject" className="w-full">
							<Select.Value placeholder="Select a topic" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="general">General Inquiry</Select.Item>
							<Select.Item value="technical">Technical Support</Select.Item>
							<Select.Item value="feature">Feature Request</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div>
					<label htmlFor="contact-message" className="text-label-sm text-text-strong-950 mb-2 block">Message</label>
					<textarea
						id="contact-message"
						className="w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-alpha-30 resize-none"
						rows={4}
						placeholder="Describe your issue..."
					/>
				</div>
			</div>

			<Button.Root variant="primary" className="w-full">
				Send Message
			</Button.Root>

			<div className="text-center">
				<p className="text-paragraph-xs text-text-soft-400">
					Or email us at{" "}
					<a href="mailto:support@hypedrive.com" className="text-primary-base hover:underline">
						support@hypedrive.com
					</a>
				</p>
			</div>
		</div>
	)
}

// ===========================================
// ORG SETTINGS SUB-PANEL
// Uses useCurrentOrganization and useUpdateOrganization hooks
// URL-based multi-tenancy: organizationId from URL params
// ===========================================
function OrgSettingsSubPanel() {
	// SSOT: useCurrentOrganization auto-extracts organizationId from URL params
	const { organization, organizationId, isLoading } = useCurrentOrganization()
	const updateOrganization = useUpdateOrganization(organizationId)

	const [name, setName] = React.useState("")
	const [saved, setSaved] = React.useState(false)

	// Initialize from organization data
	// Note: auth.updateOrganizationAuth only supports name, slug, logo
	React.useEffect(() => {
		if (organization) {
			setName(organization.name || "")
		}
	}, [organization])

	const handleSave = async () => {
		if (!organizationId) {
			toast.error("No organization selected")
			return
		}
		try {
			// updateOrganizationAuth only supports: name, slug, logo
			await updateOrganization.mutateAsync({
				name,
			})
			setSaved(true)
			toast.success("Organization settings saved")
			setTimeout(() => setSaved(false), 2000)
		} catch {
			toast.error("Failed to save settings")
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-16 rounded-12 bg-bg-weak-50 animate-pulse" />
				))}
			</div>
		)
	}

	if (!organizationId) {
		return (
			<div className="text-center py-8 text-text-sub-600">
				<p className="text-paragraph-sm">No organization selected</p>
			</div>
		)
	}

	return (
		<div className="space-y-5">
			<div className="flex items-center gap-4 rounded-12 bg-bg-weak-50 p-4">
				<div className="flex size-14 items-center justify-center rounded-12 bg-primary-base text-white font-semibold text-title-h5">
					{getInitial(name || organization?.name, "O")}
				</div>
				<div className="flex-1">
					<h4 className="text-label-md text-text-strong-950">{name || organization?.name || "Your Organization"}</h4>
					<p className="text-paragraph-xs text-text-sub-600">Business Account</p>
				</div>
			</div>

			<div className="space-y-4">
				<div>
					<label htmlFor="org-name" className="text-label-sm text-text-strong-950 mb-2 block">Organization Name</label>
					<input
						id="org-name"
						type="text"
						placeholder="Enter organization name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-primary-base"
					/>
					<p className="text-paragraph-xs text-text-soft-400 mt-1.5">
						This is your organization's display name.
					</p>
				</div>
			</div>

			<Button.Root
				variant="primary"
				className="w-full"
				onClick={handleSave}
				disabled={updateOrganization.isPending || !name}
			>
				{saved ? (
					<>
						<Check className="size-4" weight="bold" />
						Saved!
					</>
				) : updateOrganization.isPending ? (
					"Saving..."
				) : (
					"Save Changes"
				)}
			</Button.Root>
		</div>
	)
}

// ===========================================
// TEAM SUB-PANEL
// ===========================================
function TeamSubPanel() {
	// URL-based multi-tenancy: organizationId from URL params
	const params = useParams<{ organizationId?: string }>()
	const orgId = params.organizationId ?? ""

	// Use proper hooks instead of raw fetch
	const { data: teamData, isLoading } = useTeamMembers(orgId)
	const inviteMember = useInviteMember(orgId)

	const [inviteEmail, setInviteEmail] = React.useState("")
	const [showInviteForm, setShowInviteForm] = React.useState(false)

	// Transform team data to display format
	const teamMembers = React.useMemo(() => {
		if (!teamData?.members) return []
		return teamData.members.map((member) => ({
			id: member.id,
			name: member.user?.name || member.user?.email || "Unknown",
			email: member.user?.email || "",
			role: member.role || "member",
			avatar: member.user?.image || undefined,
		}))
	}, [teamData])

	const handleInvite = async () => {
		if (!inviteEmail || !orgId) return

		try {
			await inviteMember.mutateAsync({ email: inviteEmail, role: "member" })
			setInviteEmail("")
			setShowInviteForm(false)
			toast.success("Invitation sent successfully")
		} catch {
			toast.error("Failed to send invitation")
		}
	}

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, DISPLAY_LIMITS.INITIALS_LENGTH)
	}

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-16 rounded-12 bg-bg-weak-50 animate-pulse" />
				))}
			</div>
		)
	}

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<p className="text-paragraph-sm text-text-sub-600">
					{teamMembers.length} team member{teamMembers.length !== 1 ? "s" : ""}
				</p>
				<Button.Root
					variant="primary"
					size="small"
					onClick={() => setShowInviteForm(!showInviteForm)}
				>
					<Plus className="size-4" weight="bold" />
					Invite
				</Button.Root>
			</div>

			{showInviteForm && (
				<div className="rounded-12 bg-bg-weak-50 p-4 space-y-3">
					<Input.Root>
						<Input.Wrapper>
							<Input.El
								type="email"
								placeholder="colleague@company.com"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
					<Button.Root
						variant="primary"
						size="small"
						className="w-full"
						onClick={handleInvite}
						disabled={inviteMember.isPending || !inviteEmail}
					>
						{inviteMember.isPending ? "Sending..." : "Send Invitation"}
					</Button.Root>
				</div>
			)}

			<div className="space-y-2">
				{teamMembers.length === 0 ? (
					<div className="text-center py-8 text-text-sub-600">
						<p className="text-paragraph-sm">No team members yet</p>
						<p className="text-paragraph-xs mt-1">Invite your team to get started</p>
					</div>
				) : (
					teamMembers.map((member) => (
						<div
							key={member.id || member.email}
							className="flex items-center justify-between rounded-12 bg-bg-weak-50 p-3"
						>
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-full bg-primary-base text-white text-label-sm font-medium">
									{member.avatar || getInitials(member.name)}
								</div>
								<div>
									<p className="text-label-sm text-text-strong-950">{member.name}</p>
									<p className="text-paragraph-xs text-text-sub-600">{member.email}</p>
								</div>
							</div>
							<span className="text-label-xs text-text-sub-600 bg-bg-soft-200 px-2 py-1 rounded-md capitalize">
								{member.role}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	)
}


// ===========================================
// HELPER COMPONENTS
// ===========================================

function SectionHeader({ children }: { children: React.ReactNode }) {
	return (
		<h3 className="text-label-xs text-text-soft-400 uppercase tracking-wider mb-2">{children}</h3>
	)
}

interface MenuItemProps {
	icon: React.ElementType
	label: string
	onClick?: () => void
	href?: string
	external?: boolean
}

function MenuItem({ icon: Icon, label, onClick, href, external }: MenuItemProps) {
	const content = (
		<>
			<div className="flex items-center gap-3">
				<Icon className="size-5 text-text-sub-600" weight="duotone" />
				<span className="text-paragraph-sm text-text-strong-950">{label}</span>
			</div>
			<CaretRight className="size-4 text-text-soft-400" />
		</>
	)

	const className = cn(
		"flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all",
		"hover:bg-bg-weak-50 active:scale-[0.99]",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
	)

	if (href) {
		if (external) {
			return (
				<a href={href} target="_blank" rel="noopener noreferrer" className={className}>
					{content}
				</a>
			)
		}
		return (
			<Link href={href} className={className} onClick={onClick}>
				{content}
			</Link>
		)
	}

	return (
		<button type="button" onClick={onClick} className={className}>
			{content}
		</button>
	)
}

interface ToggleRowProps {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
	return (
		<div className="flex items-center justify-between rounded-10 px-3 py-2.5">
			<span className="text-paragraph-sm text-text-strong-950">{label}</span>
			<Switch.Root checked={checked} onCheckedChange={onChange} />
		</div>
	)
}
