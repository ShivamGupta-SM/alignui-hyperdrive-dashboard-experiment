'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/utils/cn'
import * as Avatar from '@/components/ui/avatar'
import * as Switch from '@/components/ui/switch'
import * as Button from '@/components/ui/button'
import * as Divider from '@/components/ui/divider'
import * as Input from '@/components/ui/input'
import * as Select from '@/components/ui/select'
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
  CreditCard,
  Question,
  BookOpen,
  Headset,
  SignOut,
  Check,
  Plus,
} from '@phosphor-icons/react'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  organization?: {
    name: string
  }
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
  onSignOut?: () => void
}

type SubPanelType = 'profile' | 'password' | 'notifications' | 'org-settings' | 'team' | 'billing' | 'help' | 'docs' | 'contact' | null

export function SettingsPanel({
  open,
  onOpenChange,
  user,
  organization,
  isDarkMode = false,
  onToggleDarkMode,
  onSignOut,
}: SettingsPanelProps) {
  const [activeSubPanel, setActiveSubPanel] = React.useState<SubPanelType>(null)

  // Close panel handler
  const handleClose = () => {
    setActiveSubPanel(null)
    onOpenChange(false)
  }

  // Back to main panel
  const handleBack = () => {
    setActiveSubPanel(null)
  }

  // Menu item click
  const handleMenuClick = (panel: SubPanelType) => {
    setActiveSubPanel(panel)
  }

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
          'fixed z-50 flex flex-col bg-bg-white-0 shadow-2xl overflow-hidden',
          // Mobile: full screen
          'inset-0',
          // Desktop: positioned right with margin from edges, rounded corners on all sides
          'sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[400px] sm:rounded-2xl',
          // Animation
          'transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
          // Safe area padding for iOS notch
          'pb-safe'
        )}
      >
        {/* Main Panel or Sub Panel */}
        {activeSubPanel === null ? (
          <MainSettingsPanel
            user={user}
            organization={organization}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            onSignOut={onSignOut}
            onClose={handleClose}
            onMenuClick={handleMenuClick}
          />
        ) : (
          <SubPanel
            type={activeSubPanel}
            onBack={handleBack}
            onClose={handleClose}
            isDarkMode={isDarkMode}
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
  user: SettingsPanelProps['user']
  organization?: SettingsPanelProps['organization']
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
  onSignOut?: () => void
  onClose: () => void
  onMenuClick: (panel: SubPanelType) => void
}

function MainSettingsPanel({
  user,
  organization,
  isDarkMode,
  onToggleDarkMode,
  onSignOut,
  onClose,
  onMenuClick,
}: MainSettingsPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header - Consistent with notifications drawer */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stroke-soft-200">
        <div className="flex items-center gap-3">
          <Avatar.Root size="40" color="blue" className="ring-2 ring-primary-base/20">
            {user.avatar ? (
              <Avatar.Image src={user.avatar} alt={user.name} />
            ) : (
              <span className="text-label-md font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </Avatar.Root>
          <div>
            <h2 className="text-label-md text-text-strong-950">{user.name}</h2>
            <p className="text-paragraph-xs text-text-sub-600">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 transition-colors"
        >
          <X className="size-5" weight="bold" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Quick Actions Card */}
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary-base/5 to-purple-500/5 p-4 ring-1 ring-inset ring-stroke-soft-200">
            <div className="flex-1 min-w-0">
              <p className="text-paragraph-sm text-text-sub-600">
                {user.role || 'Admin'} at <span className="font-medium text-text-strong-950">{organization?.name || 'Organization'}</span>
              </p>
            </div>
            <button 
              onClick={() => onMenuClick('org-settings')}
              className="text-label-xs text-primary-base hover:text-primary-dark transition-colors shrink-0"
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
              onClick={() => onMenuClick('profile')}
            />
            <MenuItem
              icon={Lock}
              label="Change Password"
              onClick={() => onMenuClick('password')}
            />
            <MenuItem
              icon={Bell}
              label="Notifications"
              onClick={() => onMenuClick('notifications')}
            />
            <div className="flex items-center justify-between rounded-10 px-3 py-2.5">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="size-5 text-text-sub-600" weight="duotone" />
                ) : (
                  <Sun className="size-5 text-text-sub-600" weight="duotone" />
                )}
                <span className="text-paragraph-sm text-text-strong-950">
                  Dark Mode
                </span>
              </div>
              <Switch.Root
                checked={isDarkMode}
                onCheckedChange={onToggleDarkMode}
              />
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
              label="Org Settings"
              onClick={() => onMenuClick('org-settings')}
            />
            <MenuItem
              icon={UsersThree}
              label="Team Members"
              onClick={() => onMenuClick('team')}
            />
            <MenuItem
              icon={CreditCard}
              label="Billing"
              onClick={() => onMenuClick('billing')}
            />
          </div>
        </div>

        <Divider.Root className="mx-5" />

        {/* Support Section */}
        <div className="px-5 py-4">
          <SectionHeader>Support</SectionHeader>
          <div className="space-y-1">
            <MenuItem
              icon={Question}
              label="Help Center"
              onClick={() => onMenuClick('help')}
            />
            <MenuItem
              icon={BookOpen}
              label="Documentation"
              href="https://docs.hypedrive.com"
              external
            />
            <MenuItem
              icon={Headset}
              label="Contact Support"
              onClick={() => onMenuClick('contact')}
            />
          </div>
        </div>
      </div>

      {/* Footer - Sign Out */}
      <div className="border-t border-stroke-soft-200 px-5 py-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-error-base transition-colors hover:bg-error-lighter active:scale-[0.99]"
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
  isDarkMode?: boolean
}

function SubPanel({ type, onBack, onClose, isDarkMode }: SubPanelProps) {
  const titles: Record<NonNullable<SubPanelType>, string> = {
    profile: 'My Profile',
    password: 'Change Password',
    notifications: 'Notifications',
    'org-settings': 'Organization Settings',
    team: 'Team Members',
    billing: 'Billing',
    help: 'Help Center',
    docs: 'Documentation',
    contact: 'Contact Support',
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stroke-soft-200 px-5 py-4">
        <button
          onClick={onBack}
          className="size-8 rounded-lg flex items-center justify-center text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" weight="bold" />
        </button>
        <h2 className="flex-1 text-label-md text-text-strong-950">
          {titles[type!]}
        </h2>
        <button
          onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
          aria-label="Close"
        >
          <X className="size-5" weight="bold" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
        {type === 'notifications' && <NotificationsSubPanel />}
        {type === 'profile' && <ProfileSubPanel />}
        {type === 'password' && <PasswordSubPanel />}
        {type === 'org-settings' && <OrgSettingsSubPanel />}
        {type === 'team' && <TeamSubPanel />}
        {type === 'billing' && <BillingSubPanel />}
        {type === 'help' && <HelpSubPanel />}
        {type === 'contact' && <ContactSubPanel />}
      </div>
    </div>
  )
}

// ===========================================
// NOTIFICATIONS SUB-PANEL
// ===========================================
function NotificationsSubPanel() {
  const [emailSettings, setEmailSettings] = React.useState({
    newEnrollments: true,
    campaignApprovals: true,
    walletUpdates: false,
    weeklySummary: true,
  })

  const [pushSettings, setPushSettings] = React.useState({
    instantAlerts: true,
    dailyDigest: false,
  })

  const [quietHours, setQuietHours] = React.useState({
    enabled: false,
    from: '22:00',
    to: '07:00',
  })

  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div>
        <SectionHeader>Email Notifications</SectionHeader>
        <div className="space-y-1 mt-3">
          <ToggleRow
            label="New Enrollments"
            checked={emailSettings.newEnrollments}
            onChange={(v) => setEmailSettings({ ...emailSettings, newEnrollments: v })}
          />
          <ToggleRow
            label="Campaign Approvals"
            checked={emailSettings.campaignApprovals}
            onChange={(v) => setEmailSettings({ ...emailSettings, campaignApprovals: v })}
          />
          <ToggleRow
            label="Wallet Updates"
            checked={emailSettings.walletUpdates}
            onChange={(v) => setEmailSettings({ ...emailSettings, walletUpdates: v })}
          />
          <ToggleRow
            label="Weekly Summary"
            checked={emailSettings.weeklySummary}
            onChange={(v) => setEmailSettings({ ...emailSettings, weeklySummary: v })}
          />
        </div>
      </div>

      <Divider.Root />

      {/* Push Notifications */}
      <div>
        <SectionHeader>Push Notifications</SectionHeader>
        <div className="space-y-1 mt-3">
          <ToggleRow
            label="Instant Alerts"
            checked={pushSettings.instantAlerts}
            onChange={(v) => setPushSettings({ ...pushSettings, instantAlerts: v })}
          />
          <ToggleRow
            label="Daily Digest"
            checked={pushSettings.dailyDigest}
            onChange={(v) => setPushSettings({ ...pushSettings, dailyDigest: v })}
          />
        </div>
      </div>

      <Divider.Root />

      {/* Quiet Hours */}
      <div>
        <SectionHeader>Quiet Hours</SectionHeader>
        <div className="space-y-3 mt-3">
          <ToggleRow
            label="Enable"
            checked={quietHours.enabled}
            onChange={(v) => setQuietHours({ ...quietHours, enabled: v })}
          />
          {quietHours.enabled && (
            <div className="grid grid-cols-2 gap-3 pl-3">
              <div>
                <label className="text-label-xs text-text-sub-600 mb-1.5 block">From</label>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.El
                      type="time"
                      value={quietHours.from}
                      onChange={(e) => setQuietHours({ ...quietHours, from: e.target.value })}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
              <div>
                <label className="text-label-xs text-text-sub-600 mb-1.5 block">To</label>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.El
                      type="time"
                      value={quietHours.to}
                      onChange={(e) => setQuietHours({ ...quietHours, to: e.target.value })}
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>
          )}
        </div>
      </div>

      <Divider.Root />

      {/* Save Button */}
      <Button.Root variant="primary" className="w-full" onClick={handleSave}>
        {saved ? (
          <>
            <Check className="size-4" weight="bold" />
            Saved!
          </>
        ) : (
          'Save Changes'
        )}
      </Button.Root>
    </div>
  )
}

// ===========================================
// PROFILE SUB-PANEL
// ===========================================
function ProfileSubPanel() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center py-4">
        <Avatar.Root size="80" color="blue" className="ring-4 ring-bg-weak-50">
          <span className="text-title-h4">JD</span>
        </Avatar.Root>
        <Button.Root variant="ghost" size="small" className="mt-3">
          Change Photo
        </Button.Root>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Full Name</label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El defaultValue="John Doe" />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Email</label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El type="email" defaultValue="john@nike.com" disabled />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Phone</label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El type="tel" defaultValue="+91 98765 43210" />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>

      <Button.Root variant="primary" className="w-full">
        Save Changes
      </Button.Root>
    </div>
  )
}

// ===========================================
// PASSWORD SUB-PANEL
// ===========================================
function PasswordSubPanel() {
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Current Password</label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El type="password" placeholder="Enter current password" />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">New Password</label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El type="password" placeholder="Enter new password" />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Confirm Password</label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El type="password" placeholder="Confirm new password" />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>

      <Button.Root variant="primary" className="w-full">
        Update Password
      </Button.Root>
    </div>
  )
}

// ===========================================
// HELP SUB-PANEL
// ===========================================
function HelpSubPanel() {
  const helpTopics = [
    { title: 'Getting Started', description: 'Learn the basics of the platform' },
    { title: 'Campaign Management', description: 'Create and manage campaigns' },
    { title: 'Enrollment Review', description: 'Review and approve enrollments' },
    { title: 'Wallet & Payments', description: 'Manage your wallet and billing' },
    { title: 'FAQs', description: 'Frequently asked questions' },
  ]

  return (
    <div className="space-y-3">
      {helpTopics.map((topic, index) => (
        <button
          key={index}
          className="w-full rounded-12 bg-bg-weak-50 p-4 text-left transition-colors hover:bg-bg-soft-200"
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
          <label className="text-label-sm text-text-strong-950 mb-2 block">Subject</label>
          <Select.Root>
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Select a topic" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="general">General Inquiry</Select.Item>
              <Select.Item value="billing">Billing Issue</Select.Item>
              <Select.Item value="technical">Technical Support</Select.Item>
              <Select.Item value="feature">Feature Request</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Message</label>
          <textarea
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
          Or email us at{' '}
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
// ===========================================
function OrgSettingsSubPanel() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-12 bg-bg-weak-50 p-4">
        <div className="flex size-14 items-center justify-center rounded-12 bg-primary-base text-white font-semibold text-title-h5">
          A
        </div>
        <div className="flex-1">
          <h4 className="text-label-md text-text-strong-950">Acme Corporation</h4>
          <p className="text-paragraph-xs text-text-sub-600">Business Account</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Organization Name</label>
          <input 
            type="text"
            placeholder="Enter organization name" 
            defaultValue="Acme Corporation"
            className="w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-primary-base"
          />
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Business Email</label>
          <input 
            type="email"
            placeholder="business@example.com" 
            defaultValue="hello@acme.com"
            className="w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-primary-base"
          />
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Website</label>
          <input 
            type="url"
            placeholder="https://example.com" 
            defaultValue="https://acme.com"
            className="w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-primary-base"
          />
        </div>
        <div>
          <label className="text-label-sm text-text-strong-950 mb-2 block">Industry</label>
          <Select.Root defaultValue="ecommerce">
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Select industry" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="ecommerce">E-Commerce</Select.Item>
              <Select.Item value="retail">Retail</Select.Item>
              <Select.Item value="technology">Technology</Select.Item>
              <Select.Item value="fashion">Fashion</Select.Item>
              <Select.Item value="other">Other</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <Button.Root variant="primary" className="w-full">
        Save Changes
      </Button.Root>
    </div>
  )
}

// ===========================================
// TEAM SUB-PANEL
// ===========================================
function TeamSubPanel() {
  const teamMembers = [
    { name: 'John Doe', email: 'john@acme.com', role: 'Admin', avatar: 'JD' },
    { name: 'Jane Smith', email: 'jane@acme.com', role: 'Editor', avatar: 'JS' },
    { name: 'Bob Wilson', email: 'bob@acme.com', role: 'Viewer', avatar: 'BW' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-paragraph-sm text-text-sub-600">3 team members</p>
        <Button.Root variant="primary" size="small">
          <Plus className="size-4" weight="bold" />
          Invite
        </Button.Root>
      </div>

      <div className="space-y-2">
        {teamMembers.map((member, i) => (
          <div key={i} className="flex items-center justify-between rounded-12 bg-bg-weak-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-base text-white text-label-sm font-medium">
                {member.avatar}
              </div>
              <div>
                <p className="text-label-sm text-text-strong-950">{member.name}</p>
                <p className="text-paragraph-xs text-text-sub-600">{member.email}</p>
              </div>
            </div>
            <span className="text-label-xs text-text-sub-600 bg-bg-soft-200 px-2 py-1 rounded-md">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===========================================
// BILLING SUB-PANEL
// ===========================================
function BillingSubPanel() {
  return (
    <div className="space-y-5">
      {/* Current Plan */}
      <div className="rounded-12 bg-gradient-to-br from-primary-base to-primary-darker p-4 text-white">
        <p className="text-label-xs opacity-80 mb-1">Current Plan</p>
        <h4 className="text-title-h5 font-semibold">Pro Plan</h4>
        <p className="text-paragraph-sm opacity-80 mt-1">₹4,999/month</p>
      </div>

      {/* Wallet Balance */}
      <div className="rounded-12 bg-bg-weak-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-label-sm text-text-strong-950">Wallet Balance</p>
          <span className="text-title-h5 font-semibold text-text-strong-950">₹25,000</span>
        </div>
        <Button.Root variant="basic" size="small" className="w-full">
          <Plus className="size-4" weight="bold" />
          Add Funds
        </Button.Root>
      </div>

      {/* Payment Method */}
      <div>
        <h4 className="text-label-sm text-text-strong-950 mb-3">Payment Method</h4>
        <div className="flex items-center justify-between rounded-12 bg-bg-weak-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
              <CreditCard className="size-5 text-text-sub-600" weight="duotone" />
            </div>
            <div>
              <p className="text-label-sm text-text-strong-950">•••• 4242</p>
              <p className="text-paragraph-xs text-text-sub-600">Expires 12/25</p>
            </div>
          </div>
          <button className="text-label-xs text-primary-base hover:underline">Change</button>
        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h4 className="text-label-sm text-text-strong-950 mb-3">Recent Invoices</h4>
        <div className="space-y-2">
          {['Nov 2024', 'Oct 2024', 'Sep 2024'].map((month, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-stroke-soft-200 last:border-0">
              <span className="text-paragraph-sm text-text-strong-950">{month}</span>
              <div className="flex items-center gap-3">
                <span className="text-paragraph-sm text-text-sub-600">₹4,999</span>
                <button className="text-label-xs text-primary-base hover:underline">Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===========================================
// HELPER COMPONENTS
// ===========================================

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-label-xs text-text-soft-400 uppercase tracking-wider mb-2">
      {children}
    </h3>
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
    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all',
    'hover:bg-bg-weak-50 active:scale-[0.99]'
  )

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
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
    <button onClick={onClick} className={className}>
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
