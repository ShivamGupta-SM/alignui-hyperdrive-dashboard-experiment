'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Avatar from '@/components/ui/avatar'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Switch from '@/components/ui/switch'
import * as FileUpload from '@/components/ui/file-upload'
import * as TabMenu from '@/components/ui/tab-menu-horizontal'
import * as List from '@/components/ui/list'
import { Metric, MetricGroup } from '@/components/ui/metric'
import { getAvatarColor } from '@/utils/avatar-color'
import {
  RiUserLine,
  RiLockLine,
  RiBellLine,
  RiDeviceLine,
  RiUploadCloud2Line,
  RiCheckLine,
  RiComputerLine,
  RiSmartphoneLine,
  RiMacLine,
  RiShieldCheckLine,
  RiMailLine,
  RiTimeLine,
  RiAlertLine,
  RiInformationLine,
} from '@remixicon/react'
import { cn } from '@/utils/cn'
import type { User } from '@/lib/types'

// Mock data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@company.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date(),
}

const mockSessions = [
  {
    id: '1',
    device: 'Windows • Chrome',
    icon: RiComputerLine,
    ip: '103.21.xxx.xxx',
    location: 'Mumbai, India',
    lastActive: 'Just now',
    signedIn: 'Dec 5, 2024 at 9:30 AM',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone • Safari',
    icon: RiSmartphoneLine,
    ip: '103.21.xxx.xxx',
    location: 'Mumbai, India',
    lastActive: '2 hours ago',
    signedIn: 'Dec 4, 2024 at 3:45 PM',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'MacOS • Firefox',
    icon: RiMacLine,
    ip: '49.36.xxx.xxx',
    location: 'Bengaluru, India',
    lastActive: '1 day ago',
    signedIn: 'Dec 3, 2024 at 10:15 AM',
    isCurrent: false,
  },
]

type TabValue = 'profile' | 'security' | 'notifications' | 'sessions'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState<TabValue>('profile')
  const [user, setUser] = React.useState(mockUser)
  const [isSaving, setIsSaving] = React.useState(false)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">My Account</h1>
        <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-1">
          Manage your profile, security, and preferences
        </p>
      </div>

      {/* Account Overview */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Avatar.Root size="64" color={getAvatarColor(user.name)} className="shrink-0">
            {user.avatar ? (
              <Avatar.Image src={user.avatar} alt={user.name} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </Avatar.Root>
          <div className="min-w-0">
            <h2 className="text-label-md sm:text-label-lg text-text-strong-950 truncate">{user.name}</h2>
            <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 truncate">{user.email}</p>
          </div>
        </div>
        <MetricGroup columns={3} className="grid-cols-3">
          <Metric label="Member Since" value={user.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} size="sm" />
          <Metric label="Active Sessions" value={mockSessions.length} size="sm" />
          <Metric label="2FA" value="Disabled" size="sm" className="[&>div>span:last-child]:text-warning-base" />
        </MetricGroup>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <TabMenu.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabMenu.List className="min-w-max">
          <TabMenu.Trigger value="profile">
            <RiUserLine className="size-4 mr-2" />
            Profile
          </TabMenu.Trigger>
          <TabMenu.Trigger value="security">
            <RiLockLine className="size-4 mr-2" />
            Security
          </TabMenu.Trigger>
          <TabMenu.Trigger value="notifications">
            <RiBellLine className="size-4 mr-2" />
            Notifications
          </TabMenu.Trigger>
          <TabMenu.Trigger value="sessions">
            <RiDeviceLine className="size-4 mr-2" />
            Sessions
          </TabMenu.Trigger>
          </TabMenu.List>
        </TabMenu.Root>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <ProfileTab user={user} setUser={setUser} isSaving={isSaving} setIsSaving={setIsSaving} />
      )}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'sessions' && <SessionsTab sessions={mockSessions} />}
    </div>
  )
}

// Profile Tab
interface ProfileTabProps {
  user: User
  setUser: React.Dispatch<React.SetStateAction<User>>
  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
}

function ProfileTab({ user, setUser, isSaving, setIsSaving }: ProfileTabProps) {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUser((prev) => ({ ...prev, name, email }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Avatar Section */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-6">
        <h3 className="text-label-sm sm:text-label-md text-text-strong-950 mb-3 sm:mb-4">Profile Photo</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Avatar.Root size="80" color={getAvatarColor(user.name)} className="shrink-0">
            {user.avatar ? (
              <Avatar.Image src={user.avatar} alt={user.name} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </Avatar.Root>
          <div className="flex-1">
            <FileUpload.Root htmlFor="avatar-upload">
              <FileUpload.Icon as={RiUploadCloud2Line} />
              <FileUpload.Button>Change Photo</FileUpload.Button>
              <p className="text-paragraph-xs text-text-soft-400">
                PNG or JPG, max 2MB
              </p>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
              />
            </FileUpload.Root>
          </div>
        </div>
      </div>

      {/* Personal Information - Using List */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-6">
        <h3 className="text-label-sm sm:text-label-md text-text-strong-950 mb-3 sm:mb-4">Personal Information</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Full Name
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Email Address
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
            <div className="flex items-center gap-2 mt-2 p-2 rounded-10 bg-information-lighter">
              <RiInformationLine className="size-4 text-information-base shrink-0" />
              <span className="text-paragraph-xs text-information-dark">
                Changing your email will require verification
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-stroke-soft-200">
          <Button.Root variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button.Root>
        </div>
      </div>
    </div>
  )
}

// Security Tab - Using List
function SecurityTab() {
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false)

  const handleChangePassword = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <h3 className="text-label-md text-text-strong-950 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Current Password
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              New Password
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Confirm New Password
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-stroke-soft-200">
          <Button.Root
            variant="primary"
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isSaving}
          >
            {isSaving ? 'Updating...' : 'Update Password'}
          </Button.Root>
        </div>
      </div>

      {/* Two-Factor Authentication - Using List */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <List.Root size="lg">
          <List.Item>
            <List.ItemIcon>
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10">
                <RiShieldCheckLine className="size-5 text-primary-base" />
              </div>
            </List.ItemIcon>
            <List.ItemContent>
              <List.ItemTitle>Two-Factor Authentication</List.ItemTitle>
              <List.ItemDescription>Add an extra layer of security to your account</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </List.ItemAction>
          </List.Item>
        </List.Root>
        {twoFactorEnabled && (
          <div className="mt-4 pt-4 border-t border-stroke-soft-200">
            <StatusBadge.Root status="completed" variant="light">
              <StatusBadge.Icon as={RiCheckLine} />
              2FA Enabled
            </StatusBadge.Root>
            <p className="text-paragraph-sm text-text-sub-600 mt-2">
              Two-factor authentication is enabled for your account.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Notifications Tab - Using List
function NotificationsTab() {
  const [emailNotifications, setEmailNotifications] = React.useState({
    newEnrollments: true,
    campaignApprovals: true,
    walletUpdates: false,
    weeklySummary: true,
  })

  const [pushNotifications, setPushNotifications] = React.useState({
    instantAlerts: true,
    dailyDigest: false,
  })

  const [quietHours, setQuietHours] = React.useState({
    enabled: false,
    from: '22:00',
    to: '07:00',
  })

  return (
    <div className="space-y-6">
      {/* Email Notifications - Using List */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10">
            <RiMailLine className="size-5 text-primary-base" />
          </div>
          <h3 className="text-label-md text-text-strong-950">Email Notifications</h3>
        </div>
        <List.Root variant="divided" size="md">
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>New Enrollments</List.ItemTitle>
              <List.ItemDescription>Get notified when shoppers enroll in your campaigns</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={emailNotifications.newEnrollments}
                onCheckedChange={(checked) =>
                  setEmailNotifications((prev) => ({ ...prev, newEnrollments: checked }))
                }
              />
            </List.ItemAction>
          </List.Item>
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Campaign Approvals</List.ItemTitle>
              <List.ItemDescription>Get notified when your campaigns are approved or rejected</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={emailNotifications.campaignApprovals}
                onCheckedChange={(checked) =>
                  setEmailNotifications((prev) => ({ ...prev, campaignApprovals: checked }))
                }
              />
            </List.ItemAction>
          </List.Item>
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Wallet Updates</List.ItemTitle>
              <List.ItemDescription>Get notified about wallet transactions and balance changes</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={emailNotifications.walletUpdates}
                onCheckedChange={(checked) =>
                  setEmailNotifications((prev) => ({ ...prev, walletUpdates: checked }))
                }
              />
            </List.ItemAction>
          </List.Item>
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Weekly Summary</List.ItemTitle>
              <List.ItemDescription>Receive a weekly summary of your campaign performance</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={emailNotifications.weeklySummary}
                onCheckedChange={(checked) =>
                  setEmailNotifications((prev) => ({ ...prev, weeklySummary: checked }))
                }
              />
            </List.ItemAction>
          </List.Item>
        </List.Root>
      </div>

      {/* Push Notifications - Using List */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10">
            <RiBellLine className="size-5 text-primary-base" />
          </div>
          <h3 className="text-label-md text-text-strong-950">Push Notifications</h3>
        </div>
        <List.Root variant="divided" size="md">
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Instant Alerts</List.ItemTitle>
              <List.ItemDescription>Get real-time push notifications for important updates</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={pushNotifications.instantAlerts}
                onCheckedChange={(checked) =>
                  setPushNotifications((prev) => ({ ...prev, instantAlerts: checked }))
                }
              />
            </List.ItemAction>
          </List.Item>
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Daily Digest</List.ItemTitle>
              <List.ItemDescription>Receive a daily summary of all notifications</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={pushNotifications.dailyDigest}
                onCheckedChange={(checked) =>
                  setPushNotifications((prev) => ({ ...prev, dailyDigest: checked }))
                }
              />
            </List.ItemAction>
          </List.Item>
        </List.Root>
      </div>

      {/* Quiet Hours */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <List.Root size="lg">
          <List.Item>
            <List.ItemIcon>
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10">
                <RiTimeLine className="size-5 text-primary-base" />
              </div>
            </List.ItemIcon>
            <List.ItemContent>
              <List.ItemTitle>Quiet Hours</List.ItemTitle>
              <List.ItemDescription>Pause notifications during specific hours</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={quietHours.enabled}
                onCheckedChange={(checked) => setQuietHours((prev) => ({ ...prev, enabled: checked }))}
              />
            </List.ItemAction>
          </List.Item>
        </List.Root>
        {quietHours.enabled && (
          <div className="flex items-center gap-4 pt-4 mt-4 border-t border-stroke-soft-200">
            <div className="flex-1">
              <label className="block text-label-sm text-text-sub-600 mb-2">From</label>
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    type="time"
                    value={quietHours.from}
                    onChange={(e) => setQuietHours((prev) => ({ ...prev, from: e.target.value }))}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className="flex-1">
              <label className="block text-label-sm text-text-sub-600 mb-2">To</label>
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    type="time"
                    value={quietHours.to}
                    onChange={(e) => setQuietHours((prev) => ({ ...prev, to: e.target.value }))}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button.Root variant="primary">Save Changes</Button.Root>
      </div>
    </div>
  )
}

// Sessions Tab - Using List
interface SessionsTabProps {
  sessions: {
    id: string
    device: string
    icon: React.ElementType
    ip: string
    location: string
    lastActive: string
    signedIn: string
    isCurrent: boolean
  }[]
}

function SessionsTab({ sessions }: SessionsTabProps) {
  const [revoking, setRevoking] = React.useState<string | null>(null)

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } finally {
      setRevoking(null)
    }
  }

  const handleRevokeAll = async () => {
    setRevoking('all')
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } finally {
      setRevoking(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-label-md text-text-strong-950">Active Sessions</h3>
          <Button.Root
            variant="basic"
            size="small"
            onClick={handleRevokeAll}
            disabled={revoking === 'all'}
          >
            {revoking === 'all' ? 'Revoking...' : 'Revoke All Others'}
          </Button.Root>
        </div>

        <List.Root variant="divided" size="lg">
          {sessions.map((session) => {
            const Icon = session.icon
            return (
              <List.Item key={session.id} className="py-4">
                <List.ItemIcon>
                  <div className="flex size-10 items-center justify-center rounded-full bg-bg-weak-50">
                    <Icon className="size-5 text-text-sub-600" />
                  </div>
                </List.ItemIcon>
                <List.ItemContent>
                  <div className="flex items-center gap-2">
                    <List.ItemTitle>{session.device}</List.ItemTitle>
                    {session.isCurrent && (
                      <StatusBadge.Root status="completed" variant="light">
                        This Device
                      </StatusBadge.Root>
                    )}
                  </div>
                  <div className="text-paragraph-xs text-text-sub-600 mt-1 space-y-0.5">
                    <div>IP: {session.ip}</div>
                    <div>Location: {session.location}</div>
                    <div>Last active: {session.lastActive}</div>
                    <div>Signed in: {session.signedIn}</div>
                  </div>
                </List.ItemContent>
                {!session.isCurrent && (
                  <List.ItemAction>
                    <Button.Root
                      variant="basic"
                      size="small"
                      onClick={() => handleRevoke(session.id)}
                      disabled={revoking === session.id}
                    >
                      {revoking === session.id ? 'Revoking...' : 'Revoke'}
                    </Button.Root>
                  </List.ItemAction>
                )}
              </List.Item>
            )
          })}
        </List.Root>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stroke-soft-200 p-3 rounded-10 bg-warning-lighter">
          <RiAlertLine className="size-4 text-warning-base shrink-0" />
          <span className="text-paragraph-xs text-warning-dark">
            If you see a device you don't recognize, revoke access immediately and change your password.
          </span>
        </div>
      </div>
    </div>
  )
}
