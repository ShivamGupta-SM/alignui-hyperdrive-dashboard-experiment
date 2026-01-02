"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Avatar from "@/components/ui/primitives/avatar"
import * as StatusBadge from "@/components/ui/data-display/status-badge"
import * as Toggle from "@/components/ui/forms/toggle"
import * as FileUpload from "@/components/ui/forms/file-upload"
import * as TabMenu from "@/components/ui/navigation/tab-menu-horizontal"
import * as List from "@/components/ui/data-display/list"
import * as Modal from "@/components/ui/layout/modal"
import { Metric, MetricGroup } from "@/components/ui/data-display/metric"
import { cn, getAvatarColor, formatDateMedium, getInitial } from '@/lib/utils'
import { logError } from "@/lib/logging/error-logger-simple"
import { authKeys } from "@/features/auth/hooks/use-auth"
import { organizationKeys } from "@/features/organizations/hooks/use-organizations"
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
  LinkSimple,
  SignOut,
  Trash,
  GoogleLogo,
  GithubLogo,
  MicrosoftOutlookLogo,
} from '@phosphor-icons/react'
import type { auth } from "@/brand-client"
// Server actions from settings (some delegate to auth internally)
import { updateProfile, updatePassword, updateNotifications, enable2FA, disable2FA, revokeSession, revokeAllSessions } from '@/features/settings'
import { listLinkedAccounts, unlinkAccount, leaveOrganization, deleteUser, useActiveMemberRole } from '@/features/auth'
import { useOrganizations } from '@/features/organizations'
import { useCurrentOrganization, useModal } from '@/hooks'
import { FILE_SIZES } from '@/lib/types/constants'
import { useUploadProfilePicture } from '@/features/storage'
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
      browser?: string
      location?: string
      lastActive: string
      current: boolean
      iconType?: 'computer' | 'smartphone' | 'mac'
      userAgent?: string
    }>
  }
}

export function ProfileClient({ initialData }: ProfileClientProps = {}) {
  const [activeTab, setActiveTab] = useState<TabValue>('profile')
  const [user, setUser] = useState<User | null>(initialData?.user || null)
  const [isSaving, setIsSaving] = useState(false)

  const sessions = useMemo((): SessionData[] => {
    if (!initialData?.sessions) return []
    return initialData.sessions.map((session) => ({
      ...session,
      browser: session.browser ?? 'Unknown',
      location: session.location ?? 'Unknown',
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
              getInitial(user.name)
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
        name: user?.name || "",
        image: uploadResult.fileUrl,
      })

      if (updateResult?.data?.success) {
        toast.success("Avatar updated successfully")
        setUser((prev: User | null) => prev ? { ...prev, image: uploadResult.fileUrl } : null)
        // SSOT: Use authKeys.session() for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(updateResult?.serverError || "Failed to update profile with new avatar")
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
      const result = await updateProfile({ name })
      if (result?.data?.success) {
        toast.success("Profile updated successfully")
        setUser((prev: User | null) => prev ? { ...prev, name } : null)
        // SSOT: Use authKeys.session() for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(result?.serverError || "Failed to update profile")
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
                getInitial(user.name)
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

  // 2FA modal state
  const [twoFAModalOpen, openTwoFAModal, closeTwoFAModal] = useModal()
  const [twoFAPassword, setTwoFAPassword] = useState('')
  const [twoFAAction, setTwoFAAction] = useState<'enable' | 'disable'>('enable')
  const [twoFALoading, setTwoFALoading] = useState(false)

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
      })

      if (result?.data?.success) {
        toast.success("Password updated successfully")
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        // SSOT: Use authKeys.session() for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(result?.serverError || "Failed to update password")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle2FA = (enabled: boolean) => {
    // Open modal to collect password
    setTwoFAAction(enabled ? 'enable' : 'disable')
    setTwoFAPassword('')
    openTwoFAModal()
  }

  const handleConfirm2FA = async () => {
    if (!twoFAPassword) {
      toast.error("Please enter your password")
      return
    }

    setTwoFALoading(true)

    try {
      if (twoFAAction === 'enable') {
        const result = await enable2FA({ password: twoFAPassword })
        if (result?.data?.success) {
          toast.success("2FA enabled successfully")
          setTwoFactorEnabled(true)
          // SSOT: Use authKeys.session() for consistent cache invalidation
          queryClient.invalidateQueries({ queryKey: authKeys.session() })
          // React Query cache invalidation handles UI update - no router.refresh() needed
          closeTwoFAModal()
        } else {
          toast.error(result?.serverError || "Failed to enable 2FA")
        }
      } else {
        const result = await disable2FA({ password: twoFAPassword })
        if (result?.data?.success) {
          toast.success("2FA disabled successfully")
          setTwoFactorEnabled(false)
          // SSOT: Use authKeys.session() for consistent cache invalidation
          queryClient.invalidateQueries({ queryKey: authKeys.session() })
          // React Query cache invalidation handles UI update - no router.refresh() needed
          closeTwoFAModal()
        } else {
          toast.error(result?.serverError || "Failed to disable 2FA")
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleCancelModal = () => {
    closeTwoFAModal()
    setTwoFAPassword('')
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
        <Toggle.Root
          checked={twoFactorEnabled}
          onCheckedChange={handleToggle2FA}
          size="medium"
          label="Enable 2FA"
          hint="Add an extra layer of security to your account with two-factor authentication"
        />
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

      {/* 2FA Password Verification Modal */}
      <Modal.Root open={twoFAModalOpen} onOpenChange={(open) => !open && handleCancelModal()}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {twoFAAction === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-paragraph-sm text-text-sub-600 mb-4">
              {twoFAAction === 'enable'
                ? 'Enter your password to enable two-factor authentication for your account.'
                : 'Enter your password to disable two-factor authentication.'}
            </p>
            <div>
              <label htmlFor="twofa-password" className="block text-label-sm text-text-strong-950 mb-2 font-medium">
                Password
              </label>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Lock} />
                  <Input.El
                    id="twofa-password"
                    type="password"
                    value={twoFAPassword}
                    onChange={(e) => setTwoFAPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm2FA()}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root
              variant="neutral"
              onClick={handleCancelModal}
              disabled={twoFALoading}
            >
              Cancel
            </Button.Root>
            <Button.Root
              variant={twoFAAction === 'enable' ? 'primary' : 'error'}
              onClick={handleConfirm2FA}
              disabled={!twoFAPassword || twoFALoading}
            >
              {twoFALoading ? 'Verifying...' : twoFAAction === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Linked Accounts */}
      <LinkedAccountsSection />

      {/* Danger Zone */}
      <DangerZoneSection />
    </div>
  )
}

// Linked Accounts Section
function LinkedAccountsSection() {
  const queryClient = useQueryClient()
  const [accounts, setAccounts] = useState<auth.LinkedAccountResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unlinking, setUnlinking] = useState<string | null>(null)

  // Fetch linked accounts on mount
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const result = await listLinkedAccounts({})
        if (result?.data?.accounts) {
          setAccounts(result.data.accounts)
        }
      } catch (error) {
        logError(error, { source: "LinkedAccountsSection", data: { action: "fetchAccounts" } })
      } finally {
        setIsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return GoogleLogo
      case 'github':
        return GithubLogo
      case 'microsoft':
        return MicrosoftOutlookLogo
      default:
        return LinkSimple
    }
  }

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return 'Google'
      case 'github':
        return 'GitHub'
      case 'microsoft':
        return 'Microsoft'
      default:
        return providerId.charAt(0).toUpperCase() + providerId.slice(1)
    }
  }

  const handleUnlink = async (account: auth.LinkedAccountResponse) => {
    if (accounts.length <= 1) {
      toast.error("You must have at least one linked account")
      return
    }

    setUnlinking(account.id)
    try {
      const result = await unlinkAccount({ providerId: account.providerId, accountId: account.accountId })
      if (result?.data?.success) {
        toast.success(`${getProviderName(account.providerId)} account unlinked`)
        setAccounts(accounts.filter(a => a.id !== account.id))
        // SSOT: Use authKeys.session() for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(result?.serverError || "Failed to unlink account")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setUnlinking(null)
    }
  }

  return (
    <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
          <LinkSimple className="size-5 text-primary-base" weight="duotone" />
        </div>
        <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Linked Accounts</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-14 bg-bg-soft-200 rounded-lg animate-pulse" />
          <div className="h-14 bg-bg-soft-200 rounded-lg animate-pulse" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-6">
          <LinkSimple className="size-10 text-text-soft-400 mx-auto mb-3" weight="duotone" />
          <p className="text-paragraph-sm text-text-sub-600">No linked accounts</p>
          <p className="text-paragraph-xs text-text-soft-400 mt-1">
            Sign in with a social provider to link your account
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const Icon = getProviderIcon(account.providerId)
            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
                    <Icon className="size-5 text-text-sub-600" weight="fill" />
                  </div>
                  <div>
                    <p className="text-label-sm text-text-strong-950">{getProviderName(account.providerId)}</p>
                    <p className="text-paragraph-xs text-text-sub-600">
                      Connected {formatDateMedium(account.createdAt)}
                    </p>
                  </div>
                </div>
                <Button.Root
                  variant="ghost"
                  size="small"
                  onClick={() => handleUnlink(account)}
                  disabled={unlinking === account.id || accounts.length <= 1}
                  title={accounts.length <= 1 ? "Cannot unlink the only account" : "Unlink account"}
                >
                  {unlinking === account.id ? 'Unlinking...' : 'Unlink'}
                </Button.Root>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Danger Zone Section
function DangerZoneSection() {
  const router = useRouter()
  const { organizationId } = useCurrentOrganization()
  const queryClient = useQueryClient()
  const { data: orgsData } = useOrganizations()
  const { data: role } = useActiveMemberRole(organizationId)

  const [leaveOrgModalOpen, openLeaveOrgModal, closeLeaveOrgModal] = useModal()
  const [deleteAccountModalOpen, openDeleteAccountModal, closeDeleteAccountModal] = useModal()
  const [isLeaving, setIsLeaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  const organizations = orgsData?.organizations || []
  const currentOrg = organizations.find(org => org.id === organizationId)
  const isOwner = role === 'owner'
  const hasMultipleOrgs = organizations.length > 1
  // Owner cannot leave their own organization - they must transfer ownership or delete the org
  const canLeaveOrg = !isOwner && organizations.length > 0

  const handleLeaveOrg = async () => {
    if (!organizationId) return

    setIsLeaving(true)
    try {
      const result = await leaveOrganization({ organizationId })
      if (result?.data?.success) {
        toast.success("Left organization successfully")
        // SSOT: Use proper query keys for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        closeLeaveOrgModal()
        // Redirect to dashboard or first available org
        const remainingOrgs = organizations.filter(org => org.id !== organizationId)
        if (remainingOrgs.length > 0) {
          router.push(`/dashboard/${remainingOrgs[0].id}`)
        } else {
          router.push('/onboarding')
        }
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(result?.serverError || "Failed to leave organization")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLeaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUser({ password: deletePassword || undefined })
      if (result?.data?.success) {
        toast.success("Account deleted successfully")
        queryClient.clear()
        router.push('/sign-in')
      } else {
        toast.error(result?.serverError || "Failed to delete account")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-xl bg-error-lighter/30 ring-1 ring-inset ring-error-base/20 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-error-base/10 ring-1 ring-inset ring-error-base/20">
            <Warning className="size-5 text-error-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-error-dark font-semibold">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          {/* Leave Organization */}
          {canLeaveOrg && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
              <div className="flex items-center gap-3">
                <SignOut className="size-5 text-error-base" weight="duotone" />
                <div>
                  <p className="text-label-sm text-text-strong-950">Leave Organization</p>
                  <p className="text-paragraph-xs text-text-sub-600">
                    Leave this organization and lose access to its resources.
                  </p>
                </div>
              </div>
              <Button.Root
                variant="error"
                size="small"
                onClick={openLeaveOrgModal}
              >
                Leave
              </Button.Root>
            </div>
          )}

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
            <div className="flex items-center gap-3">
              <Trash className="size-5 text-error-base" weight="duotone" />
              <div>
                <p className="text-label-sm text-text-strong-950">Delete Account</p>
                <p className="text-paragraph-xs text-text-sub-600">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
            </div>
            <Button.Root
              variant="error"
              size="small"
              onClick={openDeleteAccountModal}
            >
              Delete
            </Button.Root>
          </div>
        </div>
      </div>

      {/* Leave Organization Modal */}
      <Modal.Root open={leaveOrgModalOpen} onOpenChange={(open) => !open && closeLeaveOrgModal()}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Leave Organization</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-lighter ring-1 ring-inset ring-warning-base/20 mb-4">
              <Warning className="size-5 text-warning-base shrink-0 mt-0.5" weight="duotone" />
              <p className="text-paragraph-sm text-warning-dark">
                Are you sure you want to leave <strong>{currentOrg?.name || 'this organization'}</strong>?
                You will lose access to all campaigns, enrollments, and other resources.
              </p>
            </div>
            {hasMultipleOrgs ? (
              <p className="text-paragraph-sm text-text-sub-600">
                You will be redirected to another organization after leaving.
              </p>
            ) : (
              <p className="text-paragraph-sm text-text-sub-600">
                This is your only organization. You will need to create or join another organization after leaving.
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Root
              variant="neutral"
              onClick={closeLeaveOrgModal}
              disabled={isLeaving}
            >
              Cancel
            </Button.Root>
            <Button.Root
              variant="error"
              onClick={handleLeaveOrg}
              disabled={isLeaving}
            >
              {isLeaving ? 'Leaving...' : 'Leave Organization'}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Delete Account Modal */}
      <Modal.Root open={deleteAccountModalOpen} onOpenChange={(open) => !open && closeDeleteAccountModal()}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Delete Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-error-lighter ring-1 ring-inset ring-error-base/20 mb-4">
              <Warning className="size-5 text-error-base shrink-0 mt-0.5" weight="duotone" />
              <div>
                <p className="text-paragraph-sm text-error-dark font-medium mb-1">
                  This action cannot be undone.
                </p>
                <p className="text-paragraph-sm text-error-dark">
                  All your data, including organizations you own, campaigns, and settings will be permanently deleted.
                </p>
              </div>
            </div>
            <div>
              <label htmlFor="delete-password" className="block text-label-sm text-text-strong-950 mb-2 font-medium">
                Enter your password to confirm
              </label>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Lock} />
                  <Input.El
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root
              variant="neutral"
              onClick={() => {
                closeDeleteAccountModal()
                setDeletePassword('')
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button.Root>
            <Button.Root
              variant="error"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  )
}

// Notifications Tab - Using List
function NotificationsTab() {
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
      
      if (result?.data?.success) {
        setSaved(true)
        timeoutRef.current = setTimeout(() => setSaved(false), 2000)
        // SSOT: Use authKeys.session() for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(result?.serverError || "Failed to save notifications")
      }
    } catch {
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
        <div className="space-y-4">
          <Toggle.Root
            checked={emailNotifications.newEnrollments}
            onCheckedChange={(checked) =>
              setEmailNotifications((prev) => ({ ...prev, newEnrollments: checked }))
            }
            size="medium"
            label="New Enrollments"
            hint="Get notified when shoppers enroll in your campaigns"
          />
          <Toggle.Root
            checked={emailNotifications.campaignApprovals}
            onCheckedChange={(checked) =>
              setEmailNotifications((prev) => ({ ...prev, campaignApprovals: checked }))
            }
            size="medium"
            label="Campaign Approvals"
            hint="Get notified when your campaigns are approved or rejected"
          />
          <Toggle.Root
            checked={emailNotifications.walletUpdates}
            onCheckedChange={(checked) =>
              setEmailNotifications((prev) => ({ ...prev, walletUpdates: checked }))
            }
            size="medium"
            label="Wallet Updates"
            hint="Get notified about wallet transactions and balance changes"
          />
          <Toggle.Root
            checked={emailNotifications.weeklySummary}
            onCheckedChange={(checked) =>
              setEmailNotifications((prev) => ({ ...prev, weeklySummary: checked }))
            }
            size="medium"
            label="Weekly Summary"
            hint="Receive a weekly summary of your campaign performance"
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <Bell className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Push Notifications</h3>
        </div>
        <div className="space-y-4">
          <Toggle.Root
            checked={pushNotifications.instantAlerts}
            onCheckedChange={(checked) =>
              setPushNotifications((prev) => ({ ...prev, instantAlerts: checked }))
            }
            size="medium"
            label="Instant Alerts"
            hint="Get real-time push notifications for important updates"
          />
          <Toggle.Root
            checked={pushNotifications.dailyDigest}
            onCheckedChange={(checked) =>
              setPushNotifications((prev) => ({ ...prev, dailyDigest: checked }))
            }
            size="medium"
            label="Daily Digest"
            hint="Receive a daily summary of all notifications"
          />
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-alpha-10 ring-1 ring-inset ring-primary-base/10">
            <Clock className="size-5 text-primary-base" weight="duotone" />
          </div>
          <h3 className="text-label-md sm:text-label-lg text-text-strong-950 font-semibold">Quiet Hours</h3>
        </div>
        <Toggle.Root
          checked={quietHours.enabled}
          onCheckedChange={(checked) => setQuietHours((prev) => ({ ...prev, enabled: checked }))}
          size="medium"
          label="Enable Quiet Hours"
          hint="Pause notifications during specific hours"
        />
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
  browser?: string
  location?: string
  lastActive: string
  current: boolean
  iconType?: 'computer' | 'smartphone' | 'mac'
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
  const queryClient = useQueryClient()

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      const result = await revokeSession({ token: sessionId })
      if (result?.data?.success) {
        toast.success("Session revoked successfully")
        // SSOT: Use authKeys.session() for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(result?.serverError || "Failed to revoke session")
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
      const result = await revokeAllSessions({})
      if (result?.data?.success) {
        toast.success("All other sessions signed out")
        // SSOT: Use authKeys.session() for consistent cache invalidation
        queryClient.invalidateQueries({ queryKey: authKeys.session() })
        // React Query cache invalidation handles UI update - no router.refresh() needed
      } else {
        toast.error(result?.serverError || "Failed to revoke sessions")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setRevoking(null)
    }
  }

  // Null-safe date formatting - uses SSOT from @/lib/utils/format
  const safeFormatDate = (dateStr: string | undefined) => dateStr ? formatDateMedium(dateStr) : 'Unknown'

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
                    <div>Last updated: {safeFormatDate(session.updatedAt)}</div>
                    <div>Signed in: {safeFormatDate(session.createdAt)}</div>
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
