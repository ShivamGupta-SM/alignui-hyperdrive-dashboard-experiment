'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Avatar from '@/components/ui/avatar'
import * as Badge from '@/components/ui/badge'
import * as Switch from '@/components/ui/switch'
import * as Select from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { useSettingsSearchParams } from '@/hooks'
import {
  updateProfile,
  updateOrganization,
  updatePassword,
  revokeAllSessions,
} from '@/app/actions'
import {
  Buildings,
  Bank,
  FileText,
  SealCheck,
  Plus,
  Trash,
  PencilSimple,
  ShieldCheck,
  Bell,
  CloudArrowUp,
  Check,
  DotsThree,
  User,
  Lock,
  CreditCard,
  Globe,
  Phone,
  Envelope,
  MapPin,
  DeviceMobile,
  Desktop,
  SignOut,
  Warning,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'
import { NovuPreferencesPanel } from '@/components/dashboard/novu-preferences'

// Settings sections - matches Settings Panel structure for consistency
const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Buildings },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'gst', label: 'GST & Tax', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
]

interface SettingsData {
  user: {
    name: string
    email: string
    phone: string
    avatar?: string
    role: string
  }
  organization: {
    name: string
    slug: string
    website: string
    logo?: string
    email: string
    phone: string
    address: string
    industry: string
  }
  bankAccounts: Array<{
    id: string
    bankName: string
    accountNumber: string
    accountHolder: string
    ifscCode: string
    isDefault: boolean
    isVerified: boolean
  }>
  gstDetails: {
    gstNumber: string
    legalName: string
    tradeName: string
    state: string
    stateCode?: string
    status?: string
    isVerified: boolean
  }
}

// Default mock data for development
const defaultData: SettingsData = {
  user: {
    name: 'Admin User',
    email: 'admin@hypedrive.io',
    phone: '+91 98765 43210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'Admin',
  },
  organization: {
    name: 'Nike',
    slug: 'nike',
    website: 'https://nike.com',
    logo: undefined,
    email: 'contact@nike.com',
    phone: '+91 98765 43210',
    address: '123 Business Park, Mumbai, Maharashtra 400001',
    industry: 'fashion',
  },
  bankAccounts: [
    {
      id: 'bank-1',
      bankName: 'HDFC Bank',
      accountNumber: '****1234',
      accountHolder: 'Nike India Pvt Ltd',
      ifscCode: 'HDFC0001234',
      isDefault: true,
      isVerified: true,
    },
  ],
  gstDetails: {
    gstNumber: '27AABCU9603R1ZM',
    legalName: 'Nike India Private Limited',
    tradeName: 'Nike India',
    state: 'Maharashtra',
    stateCode: '27',
    status: 'Active',
    isVerified: true,
  },
}

export function SettingsClient() {
  // nuqs: URL state management for settings section
  const [activeSection, setActiveSection] = useSettingsSearchParams()
  
  // Use static data for now - in production would fetch via useSettingsData hook
  const data = defaultData

  // nuqs: Update URL when section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section as typeof activeSection)
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Settings</h1>
        <p className="text-paragraph-sm text-text-sub-600 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Mobile Navigation - Horizontal scroll pills */}
      <div className="lg:hidden mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {settingsSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                type="button"
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-label-sm whitespace-nowrap snap-start',
                  'transition-all duration-200 shrink-0',
                  isActive
                    ? 'bg-primary-base text-white shadow-sm'
                    : 'bg-bg-white-0 border border-stroke-soft-200 text-text-sub-600 hover:border-stroke-sub-300 active:scale-[0.98]'
                )}
              >
                <Icon className="size-4" weight={isActive ? 'fill' : 'regular'} />
                {section.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex gap-8">
        {/* Desktop Sidebar - Slim, clean design */}
        <div className="hidden lg:block w-52 shrink-0">
          <nav className="sticky top-6 space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-primary-base text-white shadow-sm'
                      : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950'
                  )}
                >
                  <Icon
                    className="size-[18px]"
                    weight={isActive ? 'fill' : 'regular'}
                  />
                  <span className="text-label-sm">{section.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'profile' && <ProfileSection user={data.user} />}
          {activeSection === 'organization' && <OrganizationSection organization={data.organization} />}
          {activeSection === 'billing' && <BillingSection bankAccounts={data.bankAccounts} organization={data.organization} />}
          {activeSection === 'gst' && <GstSection gstDetails={data.gstDetails} />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'security' && <SecuritySection />}
        </div>
      </div>
    </div>
  )
}

// ===========================================
// PROFILE SECTION
// ===========================================
function ProfileSection({ user }: { user: SettingsData['user'] }) {
  const [name, setName] = React.useState(user.name)
  const [phone, setPhone] = React.useState(user.phone)
  const [saved, setSaved] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateProfile({ name, phone })
      if (result.success) {
        setSaved(true)
        toast.success('Profile updated successfully')
        setTimeout(() => setSaved(false), 3000)
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo Card */}
      <SettingsCard>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          <div className="relative group">
            <Avatar.Root size="80" color="blue" className="ring-4 ring-bg-weak-50 shadow-lg">
              {user.avatar ? (
                <Avatar.Image src={user.avatar} alt={user.name} />
              ) : (
                <span className="text-title-h4 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </Avatar.Root>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            >
              <CloudArrowUp className="size-6 text-white" />
            </button>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-label-lg text-text-strong-950">{user.name}</h3>
            <p className="text-paragraph-sm text-text-sub-600">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <Button.Root variant="basic" size="small">
                <Button.Icon as={CloudArrowUp} />
                Change
              </Button.Root>
              <Button.Root variant="ghost" size="small">
                <Button.Icon as={Trash} />
                Remove
              </Button.Root>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Personal Information */}
      <SettingsCard title="Personal Information">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" required>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={User} />
                  <Input.El
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Email Address">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Envelope} />
                  <Input.El
                    value={user.email}
                    disabled
                    className="text-text-soft-400"
                  />
                </Input.Wrapper>
              </Input.Root>
              <p className="mt-1.5 text-paragraph-xs text-text-soft-400">
                Contact support to change email
              </p>
            </FormField>

            <FormField label="Phone Number">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Phone} />
                  <Input.El
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    type="tel"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Role">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={ShieldCheck} />
                  <Input.El
                    value={user.role}
                    disabled
                    className="text-text-soft-400"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>
          </div>

          <CardFooter saved={saved} isLoading={isLoading} onSave={handleSave} />
        </div>
      </SettingsCard>
    </div>
  )
}

// ===========================================
// ORGANIZATION SECTION
// ===========================================
function OrganizationSection({ organization }: { organization: SettingsData['organization'] }) {
  const [name, setName] = React.useState(organization.name)
  const [website, setWebsite] = React.useState(organization.website)
  const [email, setEmail] = React.useState(organization.email)
  const [phone, setPhone] = React.useState(organization.phone)
  const [industry, setIndustry] = React.useState(organization.industry)
  const [saved, setSaved] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateOrganization({ name, website, email, phone, industry })
      if (result.success) {
        setSaved(true)
        toast.success('Organization updated successfully')
        setTimeout(() => setSaved(false), 3000)
      } else {
        toast.error(result.error || 'Failed to update organization')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const [logoError, setLogoError] = React.useState(false)

  return (
    <div className="space-y-6">
      {/* Organization Logo */}
      <SettingsCard title="Logo">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative group">
            <Avatar.Root size="80" color="blue" className="ring-4 ring-bg-weak-50 rounded-xl overflow-hidden">
              {organization.logo && !logoError ? (
                <Avatar.Image
                  src={organization.logo}
                  alt={organization.name}
                  className="rounded-xl"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-title-h5 font-semibold">
                  {organization.name.charAt(0).toUpperCase()}
                </span>
              )}
            </Avatar.Root>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            >
              <CloudArrowUp className="size-6 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <Button.Root variant="basic" size="small">
                <Button.Icon as={CloudArrowUp} />
                Upload
              </Button.Root>
              <Button.Root variant="ghost" size="small">
                <Button.Icon as={Trash} />
                Remove
              </Button.Root>
            </div>
            <p className="mt-2 text-paragraph-xs text-text-soft-400">
              200×200px min. PNG/JPG, max 2MB.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Organization Details */}
      <SettingsCard title="Details">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Organization Name" required>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Buildings} />
                  <Input.El
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Handle">
              <Input.Root>
                <Input.Wrapper>
                  <span className="text-text-soft-400 text-paragraph-sm pl-1">@</span>
                  <Input.El
                    value={organization.slug}
                    disabled
                    className="text-text-soft-400"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Website">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Globe} />
                  <Input.El
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Industry">
              <Select.Root value={industry} onValueChange={setIndustry}>
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
            </FormField>

            <FormField label="Email">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Envelope} />
                  <Input.El
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@company.com"
                    type="email"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Phone">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Phone} />
                  <Input.El
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    type="tel"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Address">
                <Input.Root>
                  <Input.Wrapper>
                    <Input.Icon as={MapPin} />
                    <Input.El
                      defaultValue={organization.address}
                      placeholder="Enter business address"
                    />
                  </Input.Wrapper>
                </Input.Root>
              </FormField>
            </div>
          </div>

          <CardFooter saved={saved} isLoading={isLoading} onSave={handleSave} />
        </div>
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard title="Danger Zone" variant="danger">
        <div className="p-4 rounded-xl bg-error-lighter/30 border border-error-base/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Warning className="size-5 text-error-base shrink-0 mt-0.5" weight="fill" />
              <div>
                <h4 className="text-label-sm text-text-strong-950">Delete Organization</h4>
                <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                  Permanently delete all data.
                </p>
              </div>
            </div>
            <Button.Root variant="error" size="small" className="shrink-0 w-full sm:w-auto">
              Delete
            </Button.Root>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

// ===========================================
// BILLING SECTION
// ===========================================
function BillingSection({ bankAccounts, organization }: { bankAccounts: SettingsData['bankAccounts']; organization: SettingsData['organization'] }) {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="rounded-2xl bg-linear-to-br from-primary-base to-primary-darker p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-label-xs opacity-80 mb-1">Current Plan</p>
            <h3 className="text-title-h5 sm:text-title-h4 font-semibold">Pro Plan</h3>
            <p className="text-paragraph-sm opacity-80 mt-1">₹4,999/mo</p>
          </div>
          <Button.Root variant="neutral" size="small" className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto">
            Upgrade
          </Button.Root>
        </div>
      </div>

      {/* Bank Accounts */}
      <SettingsCard
        title="Bank Accounts"
        action={
          <Button.Root variant="primary" size="small">
            <Button.Icon as={Plus} />
            Add
          </Button.Root>
        }
      >
        <div className="space-y-3">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="p-4 rounded-xl bg-bg-weak-50/50 border border-stroke-soft-200 hover:border-stroke-sub-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-bg-white-0 border border-stroke-soft-200 shrink-0">
                    <Bank className="size-4 text-text-sub-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-label-sm text-text-strong-950">{account.bankName}</span>
                      <span className="text-paragraph-xs text-text-soft-400">{account.accountNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {account.isDefault && (
                        <Badge.Root color="blue" variant="light" size="small">Primary</Badge.Root>
                      )}
                      {account.isVerified && (
                        <Badge.Root color="green" variant="light" size="small">
                          <SealCheck className="size-3 mr-0.5" />
                          Verified
                        </Badge.Root>
                      )}
                    </div>
                  </div>
                </div>
                <Button.Root variant="ghost" size="xsmall" className="shrink-0">
                  <Button.Icon as={DotsThree} />
                </Button.Root>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Billing Address */}
      <SettingsCard
        title="Billing Address"
        action={
          <Button.Root variant="ghost" size="small">
            <Button.Icon as={PencilSimple} />
            Edit
          </Button.Root>
        }
      >
        <div className="p-4 rounded-xl bg-bg-weak-50 flex items-start gap-3">
          <MapPin className="size-5 text-text-soft-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-label-sm text-text-strong-950">{organization.name}</p>
            <p className="text-paragraph-sm text-text-sub-600 mt-1">{organization.address}</p>
          </div>
        </div>
      </SettingsCard>

      {/* Payment History */}
      <SettingsCard title="Transactions">
        <div className="space-y-1">
          {['Nov 2024', 'Oct 2024', 'Sep 2024'].map((month) => (
            <div
              key={month}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-weak-50 transition-colors duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-bg-weak-50">
                  <FileText className="size-4 text-text-soft-400" />
                </div>
                <div>
                  <p className="text-label-sm text-text-strong-950">Subscription</p>
                  <p className="text-paragraph-xs text-text-sub-600">{month}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-label-sm text-text-strong-950">₹4,999</span>
                <Button.Root variant="ghost" size="xsmall">
                  Download
                </Button.Root>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  )
}

// ===========================================
// GST SECTION
// ===========================================
function GstSection({ gstDetails }: { gstDetails: SettingsData['gstDetails'] }) {
  return (
    <div className="space-y-6">
      {/* GST Details */}
      <SettingsCard
        title="GST Details"
        badge={
          gstDetails.isVerified && (
            <Badge.Root color="green" variant="light" size="small">
              <SealCheck className="size-3 mr-1" />
              Verified
            </Badge.Root>
          )
        }
      >
        <div className="space-y-4">
          {/* GST Number Display */}
          <div className="p-4 rounded-xl bg-linear-to-br from-primary-base/5 to-purple-500/5 border border-stroke-soft-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-xs text-text-sub-600 uppercase tracking-wider">GST Number</span>
              <Badge.Root
                color={gstDetails.status === 'Active' ? 'green' : 'gray'}
                variant="light"
                size="small"
              >
                {gstDetails.status || 'Active'}
              </Badge.Root>
            </div>
            <div className="text-title-h5 sm:text-title-h4 text-text-strong-950 font-mono tracking-wider break-all">
              {gstDetails.gstNumber}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailCard label="Legal Name" value={gstDetails.legalName} fullWidth />
            <DetailCard label="Trade Name" value={gstDetails.tradeName} fullWidth />
            <DetailCard label="State" value={gstDetails.state} />
            <DetailCard label="Code" value={gstDetails.stateCode || '27'} />
          </div>
        </div>
      </SettingsCard>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-bg-weak-50 border border-stroke-soft-200">
        <ShieldCheck className="size-5 text-text-soft-400 shrink-0 mt-0.5" />
        <p className="text-paragraph-sm text-text-sub-600">
          GST details cannot be modified. Contact{' '}
          <a href="mailto:support@hypedrive.com" className="text-primary-base hover:underline">
            support
          </a>{' '}
          for changes.
        </p>
      </div>

      {/* Tax Settings */}
      <SettingsCard title="Tax Settings">
        <div className="space-y-1">
          <ToggleRow
            title="Include GST in Invoices"
            description="Add GST breakdown to invoices"
            defaultChecked={true}
          />
          <ToggleRow
            title="Auto-calculate TDS"
            description="Calculate Tax Deducted at Source"
            defaultChecked={false}
          />
        </div>
      </SettingsCard>
    </div>
  )
}

// ===========================================
// NOTIFICATIONS SECTION
// ===========================================
function NotificationsSection() {
  // Check if Novu is configured
  const isNovuConfigured = !!process.env.NEXT_PUBLIC_NOVU_APP_ID

  return (
    <div className="space-y-6">
      {/* Novu Preferences - Only show when Novu is configured */}
      {isNovuConfigured && <NovuPreferencesSection />}

      {/* Email Notifications */}
      <SettingsCard title="Email Notifications">
        <div className="space-y-1">
          <ToggleRow
            title="New Enrollments"
            description="When enrollment is submitted"
            defaultChecked={true}
          />
          <ToggleRow
            title="Campaign Updates"
            description="Performance updates"
            defaultChecked={true}
          />
          <ToggleRow
            title="Wallet Alerts"
            description="Low balance & transactions"
            defaultChecked={true}
          />
          <ToggleRow
            title="Invoice Reminders"
            description="Pending invoice alerts"
            defaultChecked={false}
          />
          <ToggleRow
            title="Weekly Summary"
            description="Activity digest"
            defaultChecked={true}
          />
        </div>
      </SettingsCard>

      {/* In-App & Push Notifications */}
      <SettingsCard title="In-App Notifications">
        <div className="space-y-1">
          <ToggleRow
            title="Real-time Alerts"
            description="Show notifications in the bell icon"
            defaultChecked={true}
          />
          <ToggleRow
            title="Sound Alerts"
            description="Play notification sound"
            defaultChecked={true}
          />
          <ToggleRow
            title="Desktop Notifications"
            description="Browser push notifications"
            defaultChecked={false}
          />
        </div>
      </SettingsCard>

      {/* Quiet Hours */}
      <SettingsCard title="Quiet Hours">
        <ToggleRow
          title="Enable Quiet Hours"
          description="Pause notifications during set hours"
          defaultChecked={false}
        />
      </SettingsCard>
    </div>
  )
}

/**
 * Novu Preferences Section - Uses usePreferences hook from @novu/react
 * This component manages real notification channel preferences through Novu
 *
 * Note: This is a placeholder that will render the NovuPreferencesPanel
 * when Novu is properly configured. The actual component uses usePreferences
 * hook which requires NovuProvider context.
 */
function NovuPreferencesSection() {
  // Uses the NovuPreferencesPanel which leverages usePreferences hook from @novu/react
  // The component is rendered inside NovuProvider context from the dashboard shell
  return <NovuPreferencesPanel />
}

// ===========================================
// SECURITY SECTION
// ===========================================

interface Session {
  id: string
  device: string
  iconType: 'computer' | 'smartphone' | 'mac'
  ip: string
  location: string
  lastActive: string
  signedIn: string
  isCurrent: boolean
}

function SecuritySection() {
  const router = useRouter()
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isPasswordLoading, setIsPasswordLoading] = React.useState(false)
  const [isSessionLoading, setIsSessionLoading] = React.useState(false)
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(true)

  React.useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/profile/sessions')
        if (response.ok) {
          const data = await response.json()
          setSessions(data.data || [])
        }
      } finally {
        setIsLoadingSessions(false)
      }
    }
    fetchSessions()
  }, [])

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setIsPasswordLoading(true)
    try {
      const result = await updatePassword({ currentPassword, newPassword })
      if (result.success) {
        toast.success(result.message || 'Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(result.error || 'Failed to update password')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleRevokeAllSessions = async () => {
    setIsSessionLoading(true)
    try {
      const result = await revokeAllSessions()
      if (result.success) {
        toast.success(result.message || 'All other sessions signed out')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to revoke sessions')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSessionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Password */}
      <SettingsCard title="Password">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-success-lighter/30 border border-success-base/20 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-success-lighter shrink-0">
              <ShieldCheck className="size-5 text-success-base" />
            </div>
            <div>
              <p className="text-label-sm text-text-strong-950">Password is secure</p>
              <p className="text-paragraph-xs text-text-sub-600">Last changed 30 days ago</p>
            </div>
          </div>

          <div className="grid gap-4">
            <FormField label="Current Password">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Lock} />
                  <Input.El
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-text-soft-400 hover:text-text-sub-600 transition-colors pr-1"
                  >
                    {showCurrentPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="New Password">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Lock} />
                  <Input.El
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-text-soft-400 hover:text-text-sub-600 transition-colors pr-1"
                  >
                    {showNewPassword ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Confirm Password">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Lock} />
                  <Input.El
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>
          </div>

          <div className="pt-4 border-t border-stroke-soft-200 flex justify-end">
            <Button.Root
              variant="primary"
              onClick={handleUpdatePassword}
              disabled={isPasswordLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </Button.Root>
          </div>
        </div>
      </SettingsCard>

      {/* Two-Factor Authentication */}
      <SettingsCard title="Two-Factor Auth">
        <ToggleRow
          title="Enable 2FA"
          description="Use authenticator app"
          defaultChecked={false}
        />
      </SettingsCard>

      {/* Active Sessions */}
      <SettingsCard
        title="Sessions"
        action={
          <Button.Root
            variant="ghost"
            size="small"
            className="text-error-base hover:text-error-dark"
            onClick={handleRevokeAllSessions}
            disabled={isSessionLoading}
          >
            <Button.Icon as={SignOut} />
            {isSessionLoading ? 'Signing Out...' : 'Sign Out All'}
          </Button.Root>
        }
      >
        <div className="space-y-2">
          {isLoadingSessions ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="size-10 rounded-lg bg-bg-weak-50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-bg-weak-50 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-bg-weak-50 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <div className="size-10 rounded-lg bg-bg-weak-50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 bg-bg-weak-50 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-bg-weak-50 rounded animate-pulse" />
                </div>
              </div>
            </>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionRow
                key={session.id}
                device={session.device}
                location={session.location}
                lastActive={session.lastActive}
                isCurrent={session.isCurrent}
                icon={session.iconType === 'smartphone' ? DeviceMobile : Desktop}
              />
            ))
          ) : (
            <p className="text-paragraph-sm text-text-sub-600 text-center py-4">No active sessions found</p>
          )}
        </div>
      </SettingsCard>
    </div>
  )
}

// ===========================================
// HELPER COMPONENTS
// ===========================================

interface SettingsCardProps {
  title?: string
  action?: React.ReactNode
  badge?: React.ReactNode
  variant?: 'default' | 'danger'
  children: React.ReactNode
}

function SettingsCard({ title, action, badge, variant = 'default', children }: SettingsCardProps) {
  return (
    <div className={cn(
      'rounded-2xl border bg-bg-white-0 p-5 transition-all duration-200',
      variant === 'danger' ? 'border-error-base/30' : 'border-stroke-soft-200'
    )}>
      {(title || action || badge) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              'text-label-md',
              variant === 'danger' ? 'text-error-base' : 'text-text-strong-950'
            )}>
              {title}
            </h3>
            {badge}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

function FormField({
  label,
  required,
  children
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  const id = React.useId()
  return (
    <div>
      <label htmlFor={id} className="block text-label-sm text-text-strong-950 mb-1.5">
        {label}
        {required && <span className="text-error-base ml-0.5">*</span>}
      </label>
      <div id={id}>
        {children}
      </div>
    </div>
  )
}

function DetailCard({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={cn('p-3 rounded-lg bg-bg-weak-50', fullWidth && 'col-span-2')}>
      <p className="text-label-xs text-text-soft-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-label-sm text-text-strong-950 truncate">{value}</p>
    </div>
  )
}

interface ToggleRowProps {
  title: string
  description: string
  defaultChecked: boolean
}

function ToggleRow({ title, description, defaultChecked }: ToggleRowProps) {
  const [checked, setChecked] = React.useState(defaultChecked)

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-bg-weak-50/50 transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <p className="text-label-sm text-text-strong-950">{title}</p>
        <p className="text-paragraph-xs text-text-sub-600">{description}</p>
      </div>
      <Switch.Root checked={checked} onCheckedChange={setChecked} />
    </div>
  )
}

interface SessionRowProps {
  device: string
  location: string
  lastActive: string
  isCurrent: boolean
  icon: React.ElementType
}

function SessionRow({ device, location, lastActive, isCurrent, icon: Icon }: SessionRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-bg-weak-50/50 transition-colors duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          'flex size-10 items-center justify-center rounded-lg shrink-0',
          isCurrent ? 'bg-success-lighter' : 'bg-bg-weak-50'
        )}>
          <Icon className={cn(
            'size-5',
            isCurrent ? 'text-success-base' : 'text-text-soft-400'
          )} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-label-sm text-text-strong-950">{device}</span>
            {isCurrent && (
              <Badge.Root color="green" variant="light" size="small">Current</Badge.Root>
            )}
          </div>
          <p className="text-paragraph-xs text-text-sub-600 truncate">
            {location} · {lastActive}
          </p>
        </div>
      </div>
      {!isCurrent && (
        <Button.Root variant="ghost" size="xsmall" className="shrink-0">
          Revoke
        </Button.Root>
      )}
    </div>
  )
}

function CardFooter({
  saved,
  isLoading,
  onSave
}: {
  saved: boolean
  isLoading: boolean
  onSave: () => void
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-stroke-soft-200">
      <div>
        {saved && (
          <span className="flex items-center gap-1.5 text-label-sm text-success-base">
            <Check className="size-4" weight="bold" />
            Saved
          </span>
        )}
      </div>
      <Button.Root variant="primary" onClick={onSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button.Root>
    </div>
  )
}
