'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Avatar from '@/components/ui/avatar'
import * as Badge from '@/components/ui/badge'
import * as Card from '@/components/ui/card'
import * as Switch from '@/components/ui/switch'
import * as Divider from '@/components/ui/divider'
import * as TabMenuVertical from '@/components/ui/tab-menu-vertical'
import { Callout } from '@/components/ui/callout'
import {
  Buildings,
  Bank,
  FileText,
  SealCheck,
  Plus,
  Trash,
  PencilSimple,
  ArrowRight,
  ShieldCheck,
  Bell,
  CloudArrowUp,
  Check,
  X,
  DotsThree,
  ArrowSquareOut,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'

// Settings sections configuration
const settingsSections = [
  {
    id: 'organization',
    label: 'Organization',
    icon: Buildings,
  },
  {
    id: 'billing',
    label: 'Billing & Payments',
    icon: Bank,
  },
  {
    id: 'gst',
    label: 'GST & Tax',
    icon: FileText,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    id: 'security',
    label: 'Security',
    icon: ShieldCheck,
  },
]

// Mock data
const mockOrganization = {
  name: 'Nike India Pvt. Ltd.',
  slug: 'nike-india',
  website: 'https://www.nike.com/in',
  logo: 'https://logo.clearbit.com/nike.com',
  email: 'hello@nike.com',
  phone: '+91 98765 43210',
  address: '123 Business Park, Mumbai, Maharashtra 400001',
}

const mockBankAccounts = [
  {
    id: '1',
    bankName: 'HDFC Bank',
    accountNumber: '****1234',
    accountHolder: 'Nike India Pvt. Ltd.',
    ifscCode: 'HDFC0001234',
    isDefault: true,
    isVerified: true,
  },
  {
    id: '2',
    bankName: 'ICICI Bank',
    accountNumber: '****5678',
    accountHolder: 'Nike India Pvt. Ltd.',
    ifscCode: 'ICIC0005678',
    isDefault: false,
    isVerified: true,
  },
]

const mockGstDetails = {
  gstNumber: '27AAACN1234A1Z5',
  legalName: 'Nike India Private Limited',
  tradeName: 'Nike India',
  state: 'Maharashtra',
  stateCode: '27',
  status: 'Active',
  isVerified: true,
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState('organization')

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Settings</h1>
        <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-1">
          Manage your organization, billing, and preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation - Desktop */}
        <div className="hidden lg:block w-64 shrink-0">
          <Card.Root variant="default" size="sm" className="sticky top-6">
            <nav className="p-2">
              <TabMenuVertical.Root value={activeSection} onValueChange={setActiveSection}>
                <TabMenuVertical.List>
                  {settingsSections.map((section) => (
                    <TabMenuVertical.Trigger key={section.id} value={section.id}>
                      <TabMenuVertical.Icon as={section.icon} />
                      <span>{section.label}</span>
                      <TabMenuVertical.ArrowIcon as={ArrowRight} className="ml-auto" />
                    </TabMenuVertical.Trigger>
                  ))}
                </TabMenuVertical.List>
              </TabMenuVertical.Root>
            </nav>
          </Card.Root>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-2 min-w-max">
            {settingsSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-full text-label-sm transition-colors',
                    isActive
                      ? 'bg-primary-base text-white'
                      : 'bg-bg-weak-50 text-text-sub-600'
                  )}
                >
                  <Icon className="size-4" />
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <TabMenuVertical.Root value={activeSection} onValueChange={setActiveSection}>
            <TabMenuVertical.Content value="organization">
              <OrganizationSection />
            </TabMenuVertical.Content>
            <TabMenuVertical.Content value="billing">
              <BillingSection />
            </TabMenuVertical.Content>
            <TabMenuVertical.Content value="gst">
              <GstSection />
            </TabMenuVertical.Content>
            <TabMenuVertical.Content value="notifications">
              <NotificationsSection />
            </TabMenuVertical.Content>
            <TabMenuVertical.Content value="security">
              <SecuritySection />
            </TabMenuVertical.Content>
          </TabMenuVertical.Root>
        </div>
      </div>
    </div>
  )
}

// ===========================================
// ORGANIZATION SECTION
// ===========================================
function OrganizationSection() {
  const [name, setName] = React.useState(mockOrganization.name)
  const [website, setWebsite] = React.useState(mockOrganization.website)
  const [email, setEmail] = React.useState(mockOrganization.email)
  const [phone, setPhone] = React.useState(mockOrganization.phone)
  const [isLoading, setIsLoading] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Logo */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div>
            <Card.Title>Organization Logo</Card.Title>
            <Card.Description className="mt-1">
              This logo will appear on invoices and public pages
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative group">
              <Avatar.Root size="80" color="blue" className="ring-4 ring-bg-weak-50">
                <Avatar.Image src={mockOrganization.logo} alt={mockOrganization.name} />
              </Avatar.Root>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <CloudArrowUp className="size-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <Button.Root variant="basic" size="small">
                  <Button.Icon as={CloudArrowUp} />
                  Upload New
                </Button.Root>
                <Button.Root variant="ghost" size="small">
                  <Button.Icon as={Trash} />
                  Remove
                </Button.Root>
              </div>
              <p className="mt-2 text-paragraph-xs text-text-soft-400">
                Recommended: Square image, at least 200x200px. PNG or JPG, max 2MB.
              </p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Organization Details */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div>
            <Card.Title>Organization Details</Card.Title>
            <Card.Description className="mt-1">
              Basic information about your organization
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Organization Name" required>
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Slug / Handle">
              <Input.Root>
                <Input.Wrapper>
                  <span className="text-text-soft-400 text-paragraph-sm">@</span>
                  <Input.El
                    value={mockOrganization.slug}
                    disabled
                    className="text-text-soft-400 pl-0"
                  />
                </Input.Wrapper>
              </Input.Root>
              <p className="mt-1.5 text-paragraph-xs text-text-soft-400">
                Slug cannot be changed after creation
              </p>
            </FormField>

            <FormField label="Website">
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.example.com"
                    type="url"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Contact Email">
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@company.com"
                    type="email"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>

            <FormField label="Phone Number">
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    type="tel"
                  />
                </Input.Wrapper>
              </Input.Root>
            </FormField>
          </div>
        </Card.Content>
        <Card.Footer className="pt-4 border-t border-stroke-soft-200 mt-4" align="between">
          <div>
            {saved && (
              <span className="flex items-center gap-1.5 text-label-sm text-success-base">
                <Check className="size-4" />
                Changes saved successfully
              </span>
            )}
          </div>
          <Button.Root variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button.Root>
        </Card.Footer>
      </Card.Root>

      {/* Danger Zone */}
      <Card.Root variant="outlined" size="lg" className="border-error-base/30">
        <Card.Header>
          <div>
            <Card.Title className="text-error-base">Danger Zone</Card.Title>
            <Card.Description className="mt-1">
              Irreversible actions for your organization
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-12 bg-error-lighter/30">
            <div>
              <h4 className="text-label-sm text-text-strong-950">Delete Organization</h4>
              <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                Permanently delete this organization and all its data
              </p>
            </div>
            <Button.Root variant="error" size="small">
              Delete Organization
            </Button.Root>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  )
}

// ===========================================
// BILLING SECTION
// ===========================================
function BillingSection() {
  return (
    <div className="space-y-6">
      {/* Bank Accounts */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div className="flex-1">
            <Card.Title>Bank Accounts</Card.Title>
            <Card.Description className="mt-1">
              Manage bank accounts for payouts and refunds
            </Card.Description>
          </div>
          <Button.Root variant="primary" size="small">
            <Button.Icon as={Plus} />
            Add Account
          </Button.Root>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="space-y-3">
            {mockBankAccounts.map((account, index) => (
              <React.Fragment key={account.id}>
                {index > 0 && <Divider.Root />}
                <BankAccountCard account={account} />
              </React.Fragment>
            ))}
          </div>
        </Card.Content>
      </Card.Root>

      {/* Billing Address */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div className="flex-1">
            <Card.Title>Billing Address</Card.Title>
            <Card.Description className="mt-1">
              This address will appear on all invoices
            </Card.Description>
          </div>
          <Button.Root variant="ghost" size="small">
            <Button.Icon as={PencilSimple} />
            Edit
          </Button.Root>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="p-4 rounded-12 bg-bg-weak-50">
            <p className="text-label-sm text-text-strong-950">{mockOrganization.name}</p>
            <p className="text-paragraph-sm text-text-sub-600 mt-1">{mockOrganization.address}</p>
            <p className="text-paragraph-sm text-text-sub-600">{mockGstDetails.state}, India</p>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Payment History */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div className="flex-1">
            <Card.Title>Payment History</Card.Title>
            <Card.Description className="mt-1">
              Recent transactions and invoice payments
            </Card.Description>
          </div>
          <Button.Root variant="basic" size="small" asChild>
            <a href="/dashboard/invoices">
              View All Invoices
              <Button.Icon as={ArrowSquareOut} />
            </a>
          </Button.Root>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="text-center py-8">
            <div className="flex size-14 mx-auto items-center justify-center rounded-full bg-bg-weak-50 mb-3">
              <Bank className="size-6 text-text-soft-400" />
            </div>
            <p className="text-label-sm text-text-sub-600">No payment history yet</p>
            <p className="text-paragraph-xs text-text-soft-400 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  )
}

// Bank Account Card Component
function BankAccountCard({ account }: { account: typeof mockBankAccounts[0] }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-base/10 to-primary-base/5">
          <Bank className="size-5 text-primary-base" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-label-md text-text-strong-950">
              {account.bankName}
            </span>
            <span className="text-paragraph-sm text-text-sub-600">
              {account.accountNumber}
            </span>
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
          <p className="text-paragraph-xs text-text-soft-400 mt-0.5">
            {account.accountHolder} • IFSC: {account.ifscCode}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!account.isDefault && (
          <Button.Root variant="ghost" size="xsmall">
            Set Default
          </Button.Root>
        )}
        <Button.Root variant="ghost" size="xsmall">
          <Button.Icon as={DotsThree} />
        </Button.Root>
      </div>
    </div>
  )
}

// ===========================================
// GST SECTION
// ===========================================
function GstSection() {
  return (
    <div className="space-y-6">
      {/* GST Details Card */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Card.Title>GST Details</Card.Title>
              {mockGstDetails.isVerified && (
                <Badge.Root color="green" variant="light" size="small">
                  <SealCheck className="size-3 mr-1" />
                  Verified
                </Badge.Root>
              )}
            </div>
            <Card.Description className="mt-1">
              Your GST registration details for invoicing
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4">
          {/* GST Number Display */}
          <div className="p-5 rounded-16 bg-gradient-to-br from-primary-base/5 to-purple-500/5 border border-stroke-soft-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-label-xs text-text-sub-600 uppercase tracking-wider">GST Number</span>
              <Badge.Root 
                color={mockGstDetails.status === 'Active' ? 'green' : 'gray'} 
                variant="light" 
                size="small"
              >
                {mockGstDetails.status}
              </Badge.Root>
            </div>
            <div className="text-title-h4 text-text-strong-950 font-mono tracking-wider">
              {mockGstDetails.gstNumber}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <DetailItem label="Legal Name" value={mockGstDetails.legalName} />
            <DetailItem label="Trade Name" value={mockGstDetails.tradeName} />
            <DetailItem label="State" value={mockGstDetails.state} />
            <DetailItem label="State Code" value={mockGstDetails.stateCode} />
          </div>
        </Card.Content>
      </Card.Root>

      {/* Info Callout */}
      <Callout variant="neutral" size="sm">
        <ShieldCheck className="size-4 text-text-sub-600 shrink-0" />
        <span>
          GST details are verified during onboarding and cannot be modified. 
          Contact <a href="mailto:support@hypedrive.com" className="text-primary-base hover:underline">support@hypedrive.com</a> if you need to update these details.
        </span>
      </Callout>

      {/* Tax Settings */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div>
            <Card.Title>Tax Settings</Card.Title>
            <Card.Description className="mt-1">
              Configure how taxes are calculated on your invoices
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4 space-y-4">
          <SettingRow
            title="Include GST in Invoices"
            description="Add GST breakdown to all generated invoices"
            defaultChecked={true}
          />
          <Divider.Root />
          <SettingRow
            title="Auto-calculate TDS"
            description="Automatically calculate Tax Deducted at Source"
            defaultChecked={false}
          />
        </Card.Content>
      </Card.Root>
    </div>
  )
}

// ===========================================
// NOTIFICATIONS SECTION
// ===========================================
function NotificationsSection() {
  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div>
            <Card.Title>Email Notifications</Card.Title>
            <Card.Description className="mt-1">
              Choose what updates you receive via email
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="space-y-1">
            <SettingRow
              title="New Enrollments"
              description="Get notified when a new enrollment is submitted"
              defaultChecked={true}
            />
            <Divider.Root />
            <SettingRow
              title="Campaign Updates"
              description="Receive updates about your campaign performance"
              defaultChecked={true}
            />
            <Divider.Root />
            <SettingRow
              title="Wallet Alerts"
              description="Get notified about low balance and transactions"
              defaultChecked={true}
            />
            <Divider.Root />
            <SettingRow
              title="Invoice Reminders"
              description="Receive reminders for pending invoices"
              defaultChecked={false}
            />
            <Divider.Root />
            <SettingRow
              title="Weekly Summary"
              description="Get a weekly digest of your account activity"
              defaultChecked={true}
            />
          </div>
        </Card.Content>
      </Card.Root>

      {/* Push Notifications */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div>
            <Card.Title>Push Notifications</Card.Title>
            <Card.Description className="mt-1">
              Configure browser and mobile push notifications
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="space-y-1">
            <SettingRow
              title="Enable Push Notifications"
              description="Receive real-time notifications in your browser"
              defaultChecked={false}
            />
            <Divider.Root />
            <SettingRow
              title="Sound Alerts"
              description="Play a sound when receiving notifications"
              defaultChecked={true}
            />
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  )
}

// ===========================================
// SECURITY SECTION
// ===========================================
function SecuritySection() {
  return (
    <div className="space-y-6">
      {/* Password */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div className="flex-1">
            <Card.Title>Password</Card.Title>
            <Card.Description className="mt-1">
              Change your account password
            </Card.Description>
          </div>
          <Button.Root variant="basic" size="small">
            Change Password
          </Button.Root>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="p-4 rounded-12 bg-bg-weak-50">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-success-lighter">
                <ShieldCheck className="size-5 text-success-base" />
              </div>
              <div>
                <p className="text-label-sm text-text-strong-950">Password is secure</p>
                <p className="text-paragraph-xs text-text-sub-600">Last changed 30 days ago</p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {/* Two-Factor Authentication */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div>
            <Card.Title>Two-Factor Authentication</Card.Title>
            <Card.Description className="mt-1">
              Add an extra layer of security to your account
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="pt-4">
          <SettingRow
            title="Enable 2FA"
            description="Use an authenticator app for additional security"
            defaultChecked={false}
          />
        </Card.Content>
      </Card.Root>

      {/* Active Sessions */}
      <Card.Root variant="default" size="lg">
        <Card.Header>
          <div className="flex-1">
            <Card.Title>Active Sessions</Card.Title>
            <Card.Description className="mt-1">
              Manage devices where you're signed in
            </Card.Description>
          </div>
          <Button.Root variant="ghost" size="small" className="text-error-base">
            Sign Out All
          </Button.Root>
        </Card.Header>
        <Card.Content className="pt-4">
          <div className="space-y-3">
            <SessionItem
              device="Chrome on Windows"
              location="Mumbai, India"
              lastActive="Active now"
              isCurrent={true}
            />
            <SessionItem
              device="Safari on iPhone"
              location="Mumbai, India"
              lastActive="2 hours ago"
              isCurrent={false}
            />
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  )
}

// ===========================================
// HELPER COMPONENTS
// ===========================================

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-label-sm text-text-strong-950 mb-2">
        {label}
        {required && <span className="text-error-base ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-10 bg-bg-weak-50">
      <p className="text-label-xs text-text-soft-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-label-md text-text-strong-950">{value}</p>
    </div>
  )
}

function SettingRow({ 
  title, 
  description, 
  defaultChecked 
}: { 
  title: string; 
  description: string; 
  defaultChecked: boolean 
}) {
  const [checked, setChecked] = React.useState(defaultChecked)
  
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-label-sm text-text-strong-950">{title}</p>
        <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{description}</p>
      </div>
      <Switch.Root checked={checked} onCheckedChange={setChecked} />
    </div>
  )
}

function SessionItem({ 
  device, 
  location, 
  lastActive, 
  isCurrent 
}: { 
  device: string; 
  location: string; 
  lastActive: string; 
  isCurrent: boolean 
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-12 bg-bg-weak-50">
      <div className="flex items-center gap-3">
        <div className={cn(
          'size-2.5 rounded-full',
          isCurrent ? 'bg-success-base' : 'bg-text-soft-400'
        )} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-text-strong-950">{device}</span>
            {isCurrent && (
              <Badge.Root color="green" variant="light" size="small">This device</Badge.Root>
            )}
          </div>
          <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
            {location} • {lastActive}
          </p>
        </div>
      </div>
      {!isCurrent && (
        <Button.Root variant="ghost" size="xsmall">
          Revoke
        </Button.Root>
      )}
    </div>
  )
}
