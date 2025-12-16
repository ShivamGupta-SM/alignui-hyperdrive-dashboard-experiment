'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Avatar from "@/components/ui/primitives/avatar"
import * as StatusBadge from "@/components/ui/data-display/status-badge"
import * as Switch from "@/components/ui/forms/switch"
import * as FileUpload from "@/components/ui/forms/file-upload"
import * as TabMenu from "@/components/ui/navigation/tab-menu-horizontal"
import * as List from "@/components/ui/data-display/list"
import { Metric, MetricGroup } from "@/components/ui/data-display/metric"
import { getAvatarColor } from '@/utils/avatar-color'
import { formatDateMedium } from "@/lib/utils/format"
import { logError } from "@/lib/logging/error-logger-simple"
import {
  User as UserIcon,
  Lock,
  Bell,
  Devices,
  CloudArrowUp,
  Check,
  Desktop,
  DeviceMobile,
  Laptop,
  ShieldCheck,
  Envelope,
  Phone,
  Clock,
  Warning,
  Info,
} from '@phosphor-icons/react'
import { cn } from '@/utils/cn'
import type { auth } from "@/lib/api/encore-browser"
import type { auth as authServer } from "@/lib/api/encore-client"
import { updateProfile, updatePassword, updateNotifications, enable2FA, disable2FA, revokeSession, revokeAllSessions } from '@/features/settings'
import { FILE_SIZES } from '@/lib/types/constants'
import { useUploadProfilePicture } from '@/hooks/shared'
// import { useProfileData } from '@/hooks/use-profile'

// User type matching the initialData structure
type User = {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  image?: string | null
  emailVerified?: boolean
  twoFactorEnabled?: boolean
  createdAt?: string
  updatedAt?: string
}

// Icon mapping for sessions
const getSessionIcon = (iconType: string) => {
  switch (iconType) {
    case 'smartphone':
      return DeviceMobile
    case 'mac':
      return Laptop
    default:
      return Desktop
  }
}

type TabValue = 'profile' | 'security' | 'notifications' | 'sessions'

interface ProfileClientProps {
  initialData?: {
    user?: {
      id: string
      name: string
      email: string
      phone?: string
      role: string
      image?: string | null
      emailVerified?: boolean
      twoFactorEnabled?: boolean
    }
    sessions?: Array<{
      id: string
      device: string
      browser: string
      location: string
      lastActive: string
      current: boolean
      iconType: 'computer' | 'smartphone' | 'mac'
      userAgent?: string
    }>
    activeOrganizationId?: string
  }
}

export function ProfileClient({ initialData }: ProfileClientProps = {}) {
  // React Query hook removed - using server data via initialData
  // const { data: profileData } = useProfileData()
  
  const [activeTab, setActiveTab] = useState<TabValue>('profile')
  // Initialize from props
  const [user, setUser] = useState<User | null>(initialData?.user || null)
  const [isSaving, setIsSaving] = useState(false)

  // Update local user state when profileData changes - Removed
  /*
  useEffect(() => {
    if (profileData?.user) {
      setUser(profileData.user)
    }
  }, [profileData])
  */

  const sessions = useMemo(() => {
    if (!initialData?.sessions) return []
    return initialData.sessions.map((session) => ({
      ...session,
      icon: getSessionIcon(session.userAgent?.includes('iPhone') ? 'smartphone' : session.userAgent?.includes('Mac') ? 'mac' : 'computer'),
    }))
  }, [initialData])

  // Better loading/error state
  if (!user || !initialData) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {/* Page Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-bg-soft-200 rounded mb-2" />
          <div className="h-4 w-64 bg-bg-soft-200 rounded" />
        </div>
        
        {/* Account Overview Skeleton */}
        <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm animate-pulse">
          <div className="flex items-center gap-4 mb-5">
            <div className="size-16 rounded-full bg-bg-soft-200" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-bg-soft-200 rounded mb-2" />
              <div className="h-4 w-48 bg-bg-soft-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-bg-soft-200 rounded" />
            <div className="h-16 bg-bg-soft-200 rounded" />
            <div className="h-16 bg-bg-soft-200 rounded" />
          </div>
        </div>
        
        {/* Tabs Skeleton */}
        <div className="h-10 bg-bg-soft-200 rounded-xl animate-pulse" />
        
        {/* Content Skeleton */}
        <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm animate-pulse">
          <div className="h-6 w-32 bg-bg-soft-200 rounded mb-4" />
          <div className="space-y-4">
            <div className="h-10 bg-bg-soft-200 rounded" />
            <div className="h-10 bg-bg-soft-200 rounded" />
            <div className="h-10 bg-bg-soft-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950 font-semibold">My Account</h1>
        <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-1">
          Manage your profile, security, and preferences
        </p>
      </div>

      {/* Account Overview */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          <Avatar.Root size="64" color={getAvatarColor(user.name || '')} className="shrink-0">
            {user.image ? (
              <Avatar.Image src={user.image} alt={user.name || 'User'} />
            ) : (
              (user.name || 'U').charAt(0).toUpperCase()
            )}
          </Avatar.Root>
          <div className="min-w-0">
            <h2 className="text-label-md sm:text-label-lg text-text-strong-950 truncate font-semibold">{user.name || 'User'}</h2>
            <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 truncate mt-0.5">{user.email}</p>
          </div>
        </div>
        <MetricGroup columns={3} className="grid-cols-3 gap-4 sm:gap-6">
          <Metric label="Member Since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'} size="sm" />
          <Metric label="Active Sessions" value={sessions.length} size="sm" />
          <Metric label="2FA" value={user.twoFactorEnabled ? 'Enabled' : 'Disabled'} size="sm" className={cn(!user.twoFactorEnabled && "[&>div>span:last-child]:text-warning-base")} />
        </MetricGroup>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <TabMenu.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabMenu.List className="min-w-max">
          <TabMenu.Trigger value="profile">
            <UserIcon className="size-4 mr-2" weight="duotone" />
            Profile
          </TabMenu.Trigger>
          <TabMenu.Trigger value="security">
            <Lock className="size-4 mr-2" weight="duotone" />
            Security
          </TabMenu.Trigger>
          <TabMenu.Trigger value="notifications">
            <Bell className="size-4 mr-2" weight="duotone" />
            Notifications
          </TabMenu.Trigger>
          <TabMenu.Trigger value="sessions">
            <Devices className="size-4 mr-2" weight="duotone" />
            Sessions
          </TabMenu.Trigger>
          </TabMenu.List>
        </TabMenu.Root>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <ProfileTab user={user} setUser={setUser} isSaving={isSaving} setIsSaving={setIsSaving} />
      )}
      {activeTab === 'security' && <SecurityTab twoFactorEnabled={user.twoFactorEnabled} />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'sessions' && <SessionsTab sessions={sessions} />}
    </div>
  )
}

// Profile Tab
interface ProfileTabProps {
  user: User
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
}

function ProfileTab({ user, setUser, isSaving, setIsSaving }: ProfileTabProps) {
  const [name, setName] = useState(user.name || '')
  const [email] = useState(user.email) // Email is read-only, managed by backend
  const [phone, setPhone] = useState(user.phone || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const router = useRouter()
  const queryClient = useQueryClient()
  const uploadProfilePicture = useUploadProfilePicture()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > FILE_SIZES.MAX_AVATAR_SIZE) {
      toast.error("Image size must be less than 2MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    setUploadingAvatar(true)
    try {
      // Upload profile picture to storage
      const uploadResult = await uploadProfilePicture.mutateAsync(file)
      
      // Update user profile with the new image URL using server action
      const { updateProfile } = await import("@/features/settings")
      const updateResult = await updateProfile({
        image: uploadResult.fileUrl,
      })

      if (updateResult.success) {
        toast.success("Avatar updated successfully")
        setUser((prev: User | null) => prev ? { ...prev, image: uploadResult.fileUrl } : null)
        queryClient.invalidateQueries({ queryKey: ["profile", "session"] })
        queryClient.invalidateQueries({ queryKey: ["session"] })
        router.refresh()
      } else {
        toast.error(updateResult.error || "Failed to update profile with new avatar")
      }
    } catch (error) {
      logError(error, {
        source: "ProfileClient",
        data: { action: "uploadAvatar" },
      })
      toast.error("Failed to upload avatar. Please try again.")
    } finally {
      setUploadingAvatar(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateProfile({ name, phone })
      if (result.success) {
        toast.success("Profile updated successfully")
        setUser((prev: User | null) => prev ? { ...prev, name, phone } : null)
        queryClient.invalidateQueries({ queryKey: ["session"] })
        queryClient.invalidateQueries({ queryKey: ["profile"] })
        router.refresh()
      } else {
        toast.error("error" in result ? result.error || "Failed to update profile" : "Failed to update profile")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Profile Photo Section */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <UserIcon className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Profile Photo</h3>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative group shrink-0">
            <Avatar.Root size="80" color={getAvatarColor(user.name || '')} className="ring-4 ring-bg-weak-50">
              {user.image ? (
                <Avatar.Image src={user.image} alt={user.name || 'User'} />
              ) : (
                (user.name || 'U').charAt(0).toUpperCase()
              )}
            </Avatar.Root>
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <FileUpload.Root htmlFor="avatar-upload">
              <FileUpload.Icon as={CloudArrowUp} />
              <FileUpload.Button 
                className={uploadingAvatar ? "opacity-50 cursor-not-allowed" : ""}
              >
                {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </FileUpload.Button>
              <p className="text-paragraph-xs text-text-soft-400 mt-2">
                PNG or JPG, max 2MB. Recommended size: 200×200px
              </p>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </FileUpload.Root>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <UserIcon className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Personal Information</h3>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-label-sm sm:text-label-md text-text-strong-950 mb-2 font-medium">
              Full Name
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={UserIcon} />
                <Input.El
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div>
            <label className="block text-label-sm sm:text-label-md text-text-strong-950 mb-2 font-medium">
              Email Address
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={Envelope} />
                <Input.El
                  type="email"
                  value={email}
                  disabled
                  className="bg-bg-weak-50 cursor-not-allowed"
                />
              </Input.Wrapper>
            </Input.Root>
            <div className="flex items-start gap-2 mt-2.5 p-3 rounded-lg bg-information-lighter/50 ring-1 ring-inset ring-information-base/20">
              <Info className="size-4 text-information-base shrink-0 mt-0.5" weight="duotone" />
              <span className="text-paragraph-xs sm:text-paragraph-sm text-information-dark">
                Email address cannot be changed here. Contact support if you need to update your email.
              </span>
            </div>
          </div>
          <div>
            <label className="block text-label-sm sm:text-label-md text-text-strong-950 mb-2 font-medium">
              Phone Number
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={Phone} />
                <Input.El
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </Input.Wrapper>
            </Input.Root>
            <p className="text-paragraph-xs text-text-soft-400 mt-2">
              Optional. Used for account recovery and important notifications.
            </p>
          </div>
        </div>
        <div className="mt-6 sm:mt-7 pt-6 sm:pt-7 border-t border-stroke-soft-200">
          <div className="flex items-center justify-between">
            <div>
              {isSaving && (
                <span className="flex items-center gap-1.5 text-label-sm text-text-sub-600">
                  <div className="size-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            <Button.Root 
              variant="primary" 
              onClick={handleSave} 
              disabled={isSaving || (name === user.name && phone === (user.phone || ''))}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </div>
        </div>
      </div>
    </div>
  )
}

// Security Tab - Using List
interface SecurityTabProps {
  twoFactorEnabled?: boolean
}

function SecurityTab({ twoFactorEnabled: initialTwoFactor }: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactor || false)

  const router = useRouter()
  const queryClient = useQueryClient()

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsSaving(true)
    try {
      const result = await updatePassword({
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      })
      
      if (result.success) {
        toast.success("Password updated successfully")
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        queryClient.invalidateQueries({ queryKey: ["profile"] })
        router.refresh()
      } else {
        toast.error("error" in result ? result.error || "Failed to update password" : "Failed to update password")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle2FA = async (enabled: boolean) => {
    if (enabled) {
      // Enable 2FA - requires password verification
      const password = prompt("Enter your password to enable 2FA:")
      if (!password) {
        setTwoFactorEnabled(false)
        return
      }
      
      try {
        const result = await enable2FA(password)
        if (result.success) {
          toast.success("2FA enabled successfully")
          setTwoFactorEnabled(true)
          queryClient.invalidateQueries({ queryKey: ["profile"] })
          router.refresh()
        } else {
          toast.error("error" in result ? result.error || "Failed to enable 2FA" : "Failed to enable 2FA")
          setTwoFactorEnabled(false)
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.")
        setTwoFactorEnabled(false)
      }
    } else {
      // Disable 2FA - requires password verification
      const password = prompt("Enter your password to disable 2FA:")
      if (!password) {
        setTwoFactorEnabled(true)
        return
      }
      
      try {
        const result = await disable2FA(password)
        if (result.success) {
          toast.success("2FA disabled successfully")
          setTwoFactorEnabled(false)
          queryClient.invalidateQueries({ queryKey: ["profile"] })
          router.refresh()
        } else {
          toast.error("error" in result ? result.error || "Failed to disable 2FA" : "Failed to disable 2FA")
          setTwoFactorEnabled(true)
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.")
        setTwoFactorEnabled(true)
      }
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Change Password */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <Lock className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Change Password</h3>
        </div>
        <div className="space-y-5 max-w-md">
          <div>
            <label className="block text-label-sm sm:text-label-md text-text-strong-950 mb-2 font-medium">
              Current Password
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={Lock} />
                <Input.El
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <div>
            <label className="block text-label-sm sm:text-label-md text-text-strong-950 mb-2 font-medium">
              New Password
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={Lock} />
                <Input.El
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </Input.Wrapper>
            </Input.Root>
            <p className="text-paragraph-xs text-text-soft-400 mt-2">
              Password must be at least 8 characters long
            </p>
          </div>
          <div>
            <label className="block text-label-sm sm:text-label-md text-text-strong-950 mb-2 font-medium">
              Confirm New Password
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.Icon as={Lock} />
                <Input.El
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
        <div className="mt-6 sm:mt-7 pt-6 sm:pt-7 border-t border-stroke-soft-200">
          <div className="flex items-center justify-between">
            <div>
              {isSaving && (
                <span className="flex items-center gap-1.5 text-label-sm text-text-sub-600">
                  <div className="size-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <Button.Root
              variant="primary"
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button.Root>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <ShieldCheck className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Two-Factor Authentication</h3>
        </div>
        <List.Root size="lg">
          <List.Item>
            <List.ItemContent>
              <List.ItemTitle>Enable 2FA</List.ItemTitle>
              <List.ItemDescription>Add an extra layer of security to your account with two-factor authentication</List.ItemDescription>
            </List.ItemContent>
            <List.ItemAction>
              <Switch.Root
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle2FA}
              />
            </List.ItemAction>
          </List.Item>
        </List.Root>
        {twoFactorEnabled && (
          <div className="mt-5 pt-5 border-t border-stroke-soft-200">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-success-lighter/30 ring-1 ring-inset ring-success-base/20">
              <Check className="size-5 text-success-base shrink-0 mt-0.5" weight="duotone" />
              <div>
                <StatusBadge.Root status="completed" variant="light" className="mb-2">
                  <StatusBadge.Icon as={Check} weight="duotone" />
                  2FA Enabled
                </StatusBadge.Root>
                <p className="text-paragraph-sm text-text-sub-600">
                  Two-factor authentication is enabled for your account. Your account is now more secure.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Notifications Tab - Using List
function NotificationsTab() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState({
    newEnrollments: true,
    campaignApprovals: true,
    walletUpdates: false,
    weeklySummary: true,
  })

  const [pushNotifications, setPushNotifications] = useState({
    instantAlerts: true,
    dailyDigest: false,
  })

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    from: '22:00',
    to: '07:00',
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    try {
      const result = await updateNotifications({
        emailNewEnrollments: emailNotifications.newEnrollments,
        emailCampaignUpdates: emailNotifications.campaignApprovals,
        emailWalletAlerts: emailNotifications.walletUpdates,
        emailWeeklySummary: emailNotifications.weeklySummary,
        pushEnabled: pushNotifications.instantAlerts,
        soundEnabled: pushNotifications.dailyDigest,
        emailInvoiceReminders: false, // Not in UI yet
      })
      
      if (result.success) {
        setSaved(true)
        timeoutRef.current = setTimeout(() => setSaved(false), 2000)
        queryClient.invalidateQueries({ queryKey: ["profile", "notifications"] })
        router.refresh()
      } else {
        toast.error("error" in result ? result.error || "Failed to save notifications" : "Failed to save notifications")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Email Notifications - Using List */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <Envelope className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Email Notifications</h3>
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
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <Bell className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Push Notifications</h3>
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
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <List.Root size="lg">
          <List.Item>
            <List.ItemIcon>
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
                <Clock className="size-5 text-primary-base" weight="duotone" />
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
              <label className="block text-label-sm sm:text-label-md text-text-sub-600 mb-2 font-medium">From</label>
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
              <label className="block text-label-sm sm:text-label-md text-text-sub-600 mb-2 font-medium">To</label>
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
        <Button.Root variant="primary" onClick={handleSave} disabled={isSaving}>
          {saved ? (
            <>
              <Check className="size-4 mr-2" weight="bold" />
              Saved!
            </>
          ) : isSaving ? (
            "Saving..."
          ) : (
            "Save Changes"
          )}
        </Button.Root>
      </div>
    </div>
  )
}

// Sessions Tab - Using List
interface SessionData {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  current: boolean
  iconType: 'computer' | 'smartphone' | 'mac'
  userAgent?: string
  icon: React.ElementType
  ipAddress?: string
  updatedAt?: string
  createdAt?: string
}

interface SessionsTabProps {
  sessions: SessionData[]
}

function SessionsTab({ sessions }: SessionsTabProps) {
  const [revoking, setRevoking] = useState<string | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      const result = await revokeSession(sessionId)
      if (result.success) {
        toast.success("Session revoked successfully")
        queryClient.invalidateQueries({ queryKey: ["sessions"] })
        queryClient.invalidateQueries({ queryKey: ["profile"] })
        router.refresh()
      } else {
        toast.error("error" in result ? result.error || "Failed to revoke session" : "Failed to revoke session")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setRevoking(null)
    }
  }

  const handleRevokeAll = async () => {
    if (!confirm("Are you sure you want to sign out all other sessions?")) {
      return
    }
    
    setRevoking('all')
    try {
      const result = await revokeAllSessions()
      if (result.success) {
        toast.success(result.message || "All other sessions signed out")
        queryClient.invalidateQueries({ queryKey: ["sessions"] })
        queryClient.invalidateQueries({ queryKey: ["profile"] })
        router.refresh()
      } else {
        toast.error("error" in result ? result.error || "Failed to revoke sessions" : "Failed to revoke sessions")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setRevoking(null)
    }
  }

  // Use centralized formatting from lib/format.ts directly
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'Unknown'
    return formatDateMedium(dateStr)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Active Sessions</h3>
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
          {sessions.map((session, index) => {
            const Icon = session.icon
            const isCurrent = index === 0 // Assume first session is current
            return (
              <List.Item key={session.id} className="py-4">
                <List.ItemIcon>
                  <div className="flex size-10 items-center justify-center rounded-full bg-bg-weak-50">
                    <Icon className="size-5 text-text-sub-600" />
                  </div>
                </List.ItemIcon>
                <List.ItemContent>
                  <div className="flex items-center gap-2">
                    <List.ItemTitle>{session.userAgent || 'Unknown Device'}</List.ItemTitle>
                    {isCurrent && (
                      <StatusBadge.Root status="completed" variant="light">
                        This Device
                      </StatusBadge.Root>
                    )}
                  </div>
                  <div className="text-paragraph-xs text-text-sub-600 mt-1 space-y-0.5">
                    <div>IP: {session.ipAddress || 'Unknown'}</div>
                    <div>Last updated: {formatDate(session.updatedAt)}</div>
                    <div>Signed in: {formatDate(session.createdAt)}</div>
                  </div>
                </List.ItemContent>
                {!isCurrent && (
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

        <div className="flex items-start gap-2.5 mt-5 pt-5 border-t border-stroke-soft-200 p-3 sm:p-4 rounded-xl bg-warning-lighter/50 ring-1 ring-inset ring-warning-base/20">
          <Warning className="size-4 text-warning-base shrink-0 mt-0.5" weight="duotone" />
          <span className="text-paragraph-xs sm:text-paragraph-sm text-warning-dark">
            If you see a device you don't recognize, revoke access immediately and change your password.
          </span>
        </div>
      </div>
    </div>
  )
}
