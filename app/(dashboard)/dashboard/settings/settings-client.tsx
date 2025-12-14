"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Button from "@/components/ui/button"
import * as Input from "@/components/ui/input"
import * as Avatar from "@/components/ui/avatar"
import * as Badge from "@/components/ui/badge"
import * as Switch from "@/components/ui/switch"
import * as Select from "@/components/ui/select"
import { FormField } from "@/components/ui/form-field"
import { cn } from "@/utils/cn"
import { useSettingsSearchParams } from "@/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { updateOrganization } from "@/app/actions"
import { verifyBankAccount, addBankAccount, removeBankAccount, setDefaultBankAccount } from "@/app/actions/settings"
import type { organizations } from "@/lib/encore-client"
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
	Globe,
	Phone,
	Envelope,
	MapPin,
	Warning,
	Info,
	Clock,
} from "@phosphor-icons/react"
import {
	updateOrganizationBodySchema,
	bankAccountBodySchema,
	type UpdateOrganizationBody,
	type BankAccountBody,
} from "@/lib/validations"
import * as Modal from "@/components/ui/modal"
import * as BottomSheet from "@/components/ui/bottom-sheet"
import * as Radio from "@/components/ui/radio"
import { useMediaQuery } from "usehooks-ts"

// Settings sections - Organization only (Industry Standard: Settings = Organization, Profile = User)
const settingsSections = [
	{ id: "organization", label: "Organization", icon: Buildings },
	{ id: "gst", label: "GST & Tax", icon: FileText },
	{ id: "bank-accounts", label: "Bank Accounts", icon: Bank },
]

interface SettingsData {
	user: {
		name: string
		email: string
		phone: string
		avatar?: string
		role: string
		emailVerified?: boolean
	}
	organization: {
		id: string
		name: string
		slug: string
		website?: string
		logo?: string
		email?: string
		phone?: string
		address?: string
		industry?: string
	}
	bankAccounts: Array<{
		id: string
		bankName: string
		accountNumber: string
		accountHolderName: string
		ifscCode: string
		isDefault: boolean
		isVerified: boolean
		accountType?: "current" | "savings"
		organizationId?: string
	}>
	gstDetails: organizations.GSTDetails | null
}

interface SettingsClientProps {
	initialData?: SettingsData
}

export function SettingsClient({ initialData }: SettingsClientProps = {}) {
	// nuqs: URL state management for settings section (organization-only)
	const [activeSection, setActiveSection] = useSettingsSearchParams("organization")

	// Use server data - must be provided from server
	if (!initialData) {
		return (
			<div className="animate-fade-in">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Settings</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
							Manage your organization settings
						</p>
					</div>
				</div>
				<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-8 text-center">
					<p className="text-paragraph-sm text-text-sub-600">Loading settings...</p>
				</div>
			</div>
		)
	}

	const data = initialData

	// nuqs: Update URL when section changes
	const handleSectionChange = (section: string) => {
		setActiveSection(section as typeof activeSection)
	}

	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
				<div className="min-w-0">
					<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Settings</h1>
					<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
						Manage your organization settings
					</p>
				</div>
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
									"flex items-center gap-2 px-4 py-2.5 rounded-xl text-label-sm whitespace-nowrap snap-start",
									"transition-all duration-200 shrink-0",
									isActive
										? "bg-primary-base text-white shadow-sm"
										: "bg-bg-white-0 border border-stroke-soft-200 text-text-sub-600 hover:border-stroke-sub-300 active:scale-[0.98]"
								)}
							>
								<Icon className="size-4" weight={isActive ? "fill" : "regular"} />
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
										"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
										"transition-all duration-200",
										isActive
											? "bg-primary-base text-white shadow-sm"
											: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
									)}
								>
									<Icon className="size-[18px]" weight={isActive ? "fill" : "regular"} />
									<span className="text-label-sm">{section.label}</span>
								</button>
							)
						})}
					</nav>
				</div>

				{/* Main Content */}
				<div className="flex-1 min-w-0">
					{activeSection === "organization" && (
						<OrganizationSection organization={data.organization} />
					)}
					{activeSection === "gst" && <GstSection gstDetails={data.gstDetails} />}
					{activeSection === "bank-accounts" && (
						<BankAccountsSection
							bankAccounts={data.bankAccounts}
							organizationId={data.organization.id}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

// Profile section removed - moved to /dashboard/profile page (Industry Standard: Settings = Organization, Profile = User)

// ===========================================
// ORGANIZATION SECTION
// ===========================================
function OrganizationSection({ organization }: { organization: SettingsData["organization"] }) {
	const [saved, setSaved] = React.useState(false)
	const [isLoading, setIsLoading] = React.useState(false)
	const router = useRouter()
	const queryClient = useQueryClient()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateOrganizationBody>({
		resolver: zodResolver(updateOrganizationBodySchema),
		defaultValues: {
			name: organization.name,
			website: organization.website || "",
			email: organization.email || "",
			phone: organization.phone || "",
			industry: organization.industry || "",
			address: organization.address || "",
		},
	})

	const onSubmit = async (data: UpdateOrganizationBody) => {
		setIsLoading(true)
		try {
			const result = await updateOrganization(data)
			if (result.success) {
				setSaved(true)
				toast.success("Organization updated successfully")
				setTimeout(() => setSaved(false), 3000)
				// Invalidate settings and organization queries to refetch updated data
				queryClient.invalidateQueries({ queryKey: ["settings"] })
				queryClient.invalidateQueries({ queryKey: ["organization"] })
				router.refresh()
			} else {
				toast.error("error" in result ? result.error || "Failed to update organization" : "Failed to update organization")
			}
		} catch {
			toast.error("Something went wrong. Please try again.")
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
						<Avatar.Root
							size="80"
							color="blue"
							className="ring-4 ring-bg-weak-50 rounded-xl overflow-hidden"
						>
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
							<Button.Root variant="neutral" size="small">
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
										{...register("name")}
										placeholder="Enter organization name"
									/>
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="Handle">
							<Input.Root>
								<Input.Wrapper>
									<span className="text-text-soft-400 text-paragraph-sm pl-1">@</span>
									<Input.El value={organization.slug} disabled className="text-text-soft-400" />
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="Website" error={errors.website?.message}>
							<Input.Root>
								<Input.Wrapper>
									<Input.Icon as={Globe} />
									<Input.El {...register("website")} placeholder="https://example.com" type="url" />
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="Industry" error={errors.industry?.message}>
							<Select.Root {...register("industry")}>
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

						<FormField label="Email" error={errors.email?.message}>
							<Input.Root>
								<Input.Wrapper>
									<Input.Icon as={Envelope} />
									<Input.El {...register("email")} placeholder="hello@company.com" type="email" />
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="Phone" error={errors.phone?.message}>
							<Input.Root>
								<Input.Wrapper>
									<Input.Icon as={Phone} />
									<Input.El {...register("phone")} placeholder="+91 98765 43210" type="tel" />
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<div className="sm:col-span-2">
							<FormField label="Address" error={errors.address?.message}>
								<Input.Root>
									<Input.Wrapper>
										<Input.Icon as={MapPin} />
										<Input.El {...register("address")} placeholder="Enter business address" />
									</Input.Wrapper>
								</Input.Root>
							</FormField>
						</div>
					</div>

					<CardFooter saved={saved} isLoading={isLoading} onSave={handleSubmit(onSubmit)} />
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
// GST SECTION
// ===========================================
function GstSection({ gstDetails }: { gstDetails: SettingsData["gstDetails"] }) {
	return (
		<div className="space-y-6">
			{/* GST Details */}
			<SettingsCard
				title="GST Details"
				badge={
					gstDetails?.isVerified && (
						<Badge.Root color="green" variant="lighter" size="small">
							<Badge.Icon as={SealCheck} weight="duotone" />
							Verified
						</Badge.Root>
					)
				}
			>
				<div className="space-y-4">
					{gstDetails ? (
						<>
							{/* GST Number Display */}
							<div className="p-4 rounded-xl bg-linear-to-br from-primary-base/5 to-primary-darker/5 border border-stroke-soft-200">
								<div className="flex items-center justify-between mb-2">
									<span className="text-label-xs text-text-sub-600 uppercase tracking-wider">
										GST Number
									</span>
									<Badge.Root
										color={gstDetails.gstStatus === "Active" ? "green" : "gray"}
										variant="lighter"
										size="small"
									>
										{gstDetails.gstStatus || "Active"}
									</Badge.Root>
								</div>
								<div className="text-title-h5 sm:text-title-h4 text-text-strong-950 font-mono tracking-wider break-all">
									{gstDetails.gstNumber}
								</div>
							</div>

							{/* Details Grid */}
							<div className="grid grid-cols-2 gap-3">
								<DetailCard label="Legal Name" value={gstDetails.legalName} fullWidth />
								<DetailCard label="Trade Name" value={gstDetails.tradeName || ""} fullWidth />
								<DetailCard label="State" value={gstDetails.address || ""} />
								<DetailCard label="Code" value={gstDetails.businessType || ""} />
							</div>
						</>
					) : (
						<p className="text-paragraph-sm text-text-sub-600">No GST details available</p>
					)}
				</div>
			</SettingsCard>

			{/* Info Note */}
			<div className="flex items-start gap-3 p-4 rounded-xl bg-bg-weak-50 border border-stroke-soft-200">
				<ShieldCheck className="size-5 text-text-soft-400 shrink-0 mt-0.5" />
				<p className="text-paragraph-sm text-text-sub-600">
					GST details cannot be modified. Contact{" "}
					<a href="mailto:support@hypedrive.com" className="text-primary-base hover:underline">
						support
					</a>{" "}
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
// BANK ACCOUNTS SECTION
// ===========================================
function BankAccountsSection({
	bankAccounts,
	organizationId,
}: {
	bankAccounts: SettingsData["bankAccounts"]
	organizationId: string
}) {
	const [showAddModal, setShowAddModal] = React.useState(false)
	const router = useRouter()
	const queryClient = useQueryClient()

	const handleRemove = async (accountId: string) => {
		if (!confirm("Are you sure you want to remove this bank account?")) {
			return
		}

		try {
			const { removeBankAccount } = await import("@/app/actions/settings")
			const result = await removeBankAccount(accountId)
			if (result.success) {
				toast.success("Bank account removed successfully")
				queryClient.invalidateQueries({ queryKey: ["settings", "bankAccounts"] })
				queryClient.invalidateQueries({ queryKey: ["bankAccounts"] })
				router.refresh()
			} else {
				toast.error("error" in result ? result.error || "Failed to remove bank account" : "Failed to remove bank account")
			}
		} catch {
			toast.error("Something went wrong. Please try again.")
		}
	}

	const handleSetDefault = async (accountId: string) => {
		try {
			const { setDefaultBankAccount } = await import("@/app/actions/settings")
			const result = await setDefaultBankAccount(accountId)
			if (result.success) {
				toast.success("Default bank account updated")
				queryClient.invalidateQueries({ queryKey: ["settings", "bankAccounts"] })
				queryClient.invalidateQueries({ queryKey: ["bankAccounts"] })
				router.refresh()
			} else {
				toast.error("error" in result ? result.error || "Failed to set default account" : "Failed to set default account")
			}
		} catch {
			toast.error("Something went wrong. Please try again.")
		}
	}

	return (
		<div className="space-y-6">
			{/* Bank Accounts List */}
			<SettingsCard
				title="Bank Accounts"
				action={
					<Button.Root variant="primary" size="small" onClick={() => setShowAddModal(true)}>
						<Button.Icon as={Plus} />
						Add Account
					</Button.Root>
				}
			>
				<div className="space-y-3">
					{bankAccounts.length === 0 ? (
						<div className="py-8 text-center">
							<div className="flex flex-col items-center">
								<div className="size-12 rounded-full bg-bg-weak-50 flex items-center justify-center mb-4">
									<Bank weight="duotone" className="size-6 text-text-soft-400" />
								</div>
								<h3 className="text-label-md text-text-strong-950 mb-1">No bank accounts</h3>
								<p className="text-paragraph-sm text-text-sub-600 mb-4">
									Add a bank account to enable withdrawals
								</p>
								<Button.Root variant="primary" size="small" onClick={() => setShowAddModal(true)}>
									<Button.Icon as={Plus} />
									Add Bank Account
								</Button.Root>
							</div>
						</div>
					) : (
						bankAccounts.map((account) => (
							<div key={account.id} className="relative">
								<BankAccountCard account={account} organizationId={organizationId} />
								{/* Actions Menu */}
								<div className="absolute top-4 right-4 flex items-center gap-2">
									{!account.isDefault && (
										<Button.Root
											variant="ghost"
											size="xsmall"
											onClick={() => handleSetDefault(account.id)}
										>
											Set as Primary
										</Button.Root>
									)}
									<Button.Root
										variant="ghost"
										size="xsmall"
										className="text-error-base hover:text-error-dark"
										onClick={() => handleRemove(account.id)}
									>
										<Button.Icon as={Trash} />
									</Button.Root>
								</div>
							</div>
						))
					)}
				</div>
			</SettingsCard>

			{/* Add Bank Account Modal */}
			<AddBankAccountModal
				open={showAddModal}
				onOpenChange={setShowAddModal}
				organizationId={organizationId}
			/>
		</div>
	)
}

// Notifications section removed - moved to /dashboard/profile page (Industry Standard: Settings = Organization, Profile = User)

// Security section removed - moved to /dashboard/profile page (Industry Standard: Settings = Organization, Profile = User)

// ===========================================
// HELPER COMPONENTS
// ===========================================

interface SettingsCardProps {
	title?: string
	action?: React.ReactNode
	badge?: React.ReactNode
	variant?: "default" | "danger"
	children: React.ReactNode
}

function SettingsCard({ title, action, badge, variant = "default", children }: SettingsCardProps) {
	return (
		<div
			className={cn(
				"rounded-2xl border bg-bg-white-0 p-5 transition-all duration-200",
				variant === "danger" ? "border-error-base/30" : "border-stroke-soft-200"
			)}
		>
			{(title || action || badge) && (
				<div className="flex items-center justify-between gap-3 mb-4">
					<div className="flex items-center gap-2">
						<h3
							className={cn(
								"text-label-md",
								variant === "danger" ? "text-error-base" : "text-text-strong-950"
							)}
						>
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

function DetailCard({
	label,
	value,
	fullWidth,
}: { label: string; value: string; fullWidth?: boolean }) {
	return (
		<div className={cn("p-3 rounded-lg bg-bg-weak-50", fullWidth && "col-span-2")}>
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

// SessionRow removed - moved to /dashboard/profile page (Industry Standard: Settings = Organization, Profile = User)

function CardFooter({
	saved,
	isLoading,
	onSave,
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
				{isLoading ? "Saving..." : "Save Changes"}
			</Button.Root>
		</div>
	)
}

// ChangeEmailField and ChangeEmailForm removed - moved to /dashboard/profile page (Industry Standard: Settings = Organization, Profile = User)

// TwoFactorAuthSection removed - moved to /dashboard/profile page (Industry Standard: Settings = Organization, Profile = User)

// ===========================================
// BANK ACCOUNT CARD COMPONENT
// ===========================================
interface BankAccountCardProps {
	account: SettingsData["bankAccounts"][0]
	organizationId: string
}

function BankAccountCard({ account, organizationId }: BankAccountCardProps) {
	const [isVerifying, setIsVerifying] = React.useState(false)
	const queryClient = useQueryClient()
	const router = useRouter()

	const handleVerify = async () => {
		setIsVerifying(true)
		try {
			const result = await verifyBankAccount(account.id)
			if (result.success) {
				toast.success("Verification initiated successfully")
				// Invalidate bank accounts query to refetch updated status
				queryClient.invalidateQueries({ queryKey: ["settings", "bankAccounts"] })
				queryClient.invalidateQueries({ queryKey: ["bankAccounts"] })
				router.refresh()
			} else {
				toast.error("error" in result ? result.error || "Failed to initiate verification" : "Failed to initiate verification")
			}
		} catch (error) {
			toast.error("An error occurred. Please try again.")
		} finally {
			setIsVerifying(false)
		}
	}

	return (
		<div className="p-4 rounded-xl bg-bg-weak-50/50 border border-stroke-soft-200 hover:border-stroke-sub-300 transition-all duration-200">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3 min-w-0 flex-1">
					<div className="flex size-10 items-center justify-center rounded-lg bg-bg-white-0 border border-stroke-soft-200 shrink-0">
						<Bank className="size-4 text-text-sub-600" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-label-sm text-text-strong-950">{account.bankName}</span>
							<span className="text-paragraph-xs text-text-soft-400 font-mono">
								••••{account.accountNumber.slice(-4)}
							</span>
						</div>
						<div className="flex items-center gap-2 mt-1.5 flex-wrap">
							{account.isDefault && (
								<Badge.Root color="blue" variant="lighter" size="small">
									Primary
								</Badge.Root>
							)}
							{account.isVerified ? (
								<Badge.Root color="green" variant="lighter" size="small">
									<Badge.Icon as={SealCheck} weight="duotone" />
									Verified
								</Badge.Root>
							) : (
								<Badge.Root color="orange" variant="lighter" size="small">
									<Badge.Icon as={Clock} weight="duotone" />
									Pending Verification
								</Badge.Root>
							)}
						</div>
						{!account.isVerified && (
							<div className="mt-3 p-3 rounded-lg bg-warning-lighter/30 border border-warning-base/20">
								<div className="flex items-start gap-2">
									<Info className="size-4 text-warning-base shrink-0 mt-0.5" />
									<div className="flex-1 min-w-0">
										<p className="text-paragraph-xs text-text-sub-600">
											Verification required. A small amount (₹1) will be deposited to verify your
											account. This will be refunded automatically.
										</p>
										<Button.Root
											variant="neutral"
											size="xsmall"
											className="mt-2"
											onClick={handleVerify}
											disabled={isVerifying}
										>
											{isVerifying ? "Initiating..." : "Verify Now"}
										</Button.Root>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
				<Button.Root variant="ghost" size="xsmall" className="shrink-0">
					<Button.Icon as={DotsThree} />
				</Button.Root>
			</div>
		</div>
	)
}

// ===========================================
// ADD BANK ACCOUNT MODAL
// ===========================================
interface AddBankAccountModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	organizationId: string
}

function AddBankAccountModal({ open, onOpenChange, organizationId }: AddBankAccountModalProps) {
	const isMobile = useMediaQuery("(max-width: 639px)")
	const [isPending, setIsPending] = React.useState(false)
	const router = useRouter()
	const queryClient = useQueryClient()

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<BankAccountBody>({
		resolver: zodResolver(bankAccountBodySchema),
		mode: "onChange",
		defaultValues: {
			bankName: "",
			accountNumber: "",
			accountHolder: "",
			ifscCode: "",
			accountType: "savings",
			isDefault: false,
		},
	})

	const ifscCode = watch("ifscCode")

	// Auto-uppercase IFSC code
	React.useEffect(() => {
		if (ifscCode) {
			setValue("ifscCode", ifscCode.toUpperCase(), { shouldValidate: true })
		}
	}, [ifscCode, setValue])

	// Reset form when modal closes
	React.useEffect(() => {
		if (!open) {
			reset()
		}
	}, [open, reset])

	const onSubmit = handleSubmit(async (data) => {
		setIsPending(true)
		try {
			const result = await addBankAccount({
				bankName: data.bankName,
				accountNumber: data.accountNumber,
				accountHolder: data.accountHolder,
				ifscCode: data.ifscCode,
				accountType: data.accountType,
				isDefault: data.isDefault ?? false,
			})

			if (result.success) {
				toast.success(result.message || "Bank account added successfully")

				// If account was added, optionally trigger verification
				// Note: Verification API is currently unimplemented, so we just show a message
				if (result.accountId) {
					// Verification will be handled via the bank account card UI
					// User can click "Verify Now" button to initiate penny drop
				}

				reset()
				onOpenChange(false)
				// Invalidate bank accounts query to refetch updated list
				queryClient.invalidateQueries({ queryKey: ["settings", "bankAccounts"] })
				queryClient.invalidateQueries({ queryKey: ["bankAccounts"] })
				router.refresh()
			} else {
				toast.error("error" in result ? result.error || "Failed to add bank account" : "Failed to add bank account")
			}
		} catch (error) {
			toast.error("An error occurred. Please try again.")
		} finally {
			setIsPending(false)
		}
	})

	// Mobile: Use BottomSheet
	if (isMobile) {
		return (
			<BottomSheet.Root open={open} onOpenChange={onOpenChange}>
				<BottomSheet.Content>
					<BottomSheet.Header>
						<BottomSheet.Title>Add Bank Account</BottomSheet.Title>
						<BottomSheet.Description>
							Add a bank account for withdrawals. Verification via penny drop will be initiated.
						</BottomSheet.Description>
					</BottomSheet.Header>
					<BottomSheet.Body>
						<form id="bank-account-form" onSubmit={onSubmit} className="space-y-4">
							<FormField label="Account Holder Name" required error={errors.accountHolder?.message}>
								<Input.Root hasError={!!errors.accountHolder}>
									<Input.Wrapper>
										<Input.El
											{...register("accountHolder")}
											placeholder="Enter account holder name"
										/>
									</Input.Wrapper>
								</Input.Root>
							</FormField>

							<FormField label="Account Number" required error={errors.accountNumber?.message}>
								<Input.Root hasError={!!errors.accountNumber}>
									<Input.Wrapper>
										<Input.El
											{...register("accountNumber")}
											type="text"
											inputMode="numeric"
											placeholder="Enter account number"
										/>
									</Input.Wrapper>
								</Input.Root>
							</FormField>

							<FormField label="IFSC Code" required error={errors.ifscCode?.message}>
								<Input.Root hasError={!!errors.ifscCode}>
									<Input.Wrapper>
										<Input.El
											{...register("ifscCode")}
											placeholder="HDFC0001234"
											maxLength={11}
											style={{ textTransform: "uppercase" }}
										/>
									</Input.Wrapper>
								</Input.Root>
							</FormField>

							<FormField label="Bank Name" required error={errors.bankName?.message}>
								<Input.Root hasError={!!errors.bankName}>
									<Input.Wrapper>
										<Input.El {...register("bankName")} placeholder="Enter bank name" />
									</Input.Wrapper>
								</Input.Root>
							</FormField>

							<FormField label="Account Type" required error={errors.accountType?.message}>
								<Controller
									name="accountType"
									control={control}
									render={({ field }) => (
										<Radio.Group value={field.value} onValueChange={field.onChange}>
											<div className="space-y-2">
												<label className="flex items-center gap-3 p-3 rounded-10 border border-stroke-soft-200 cursor-pointer hover:bg-bg-weak-50 transition-colors">
													<Radio.Item value="savings" />
													<span className="text-label-sm text-text-strong-950">Savings</span>
												</label>
												<label className="flex items-center gap-3 p-3 rounded-10 border border-stroke-soft-200 cursor-pointer hover:bg-bg-weak-50 transition-colors">
													<Radio.Item value="current" />
													<span className="text-label-sm text-text-strong-950">Current</span>
												</label>
											</div>
										</Radio.Group>
									)}
								/>
							</FormField>

							<div className="rounded-lg bg-bg-weak-50 p-3 border border-stroke-soft-200">
								<div className="flex items-start gap-2">
									<Info className="size-4 text-text-sub-600 shrink-0 mt-0.5" />
									<p className="text-paragraph-xs text-text-sub-600">
										A small amount (₹1) will be deposited to verify your account. This will be
										refunded automatically.
									</p>
								</div>
							</div>
						</form>
					</BottomSheet.Body>
					<BottomSheet.Footer>
						<Button.Root
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="submit"
							form="bank-account-form"
							variant="primary"
							disabled={isPending}
						>
							{isPending ? "Adding..." : "Add Bank Account"}
						</Button.Root>
					</BottomSheet.Footer>
				</BottomSheet.Content>
			</BottomSheet.Root>
		)
	}

	// Desktop: Use Modal
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Add Bank Account</Modal.Title>
					<Modal.Description>
						Add a bank account for withdrawals. Verification via penny drop will be initiated.
					</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<form id="bank-account-form" onSubmit={onSubmit} className="space-y-4">
						<FormField label="Account Holder Name" required error={errors.accountHolder?.message}>
							<Input.Root hasError={!!errors.accountHolder}>
								<Input.Wrapper>
									<Input.El
										{...register("accountHolder")}
										placeholder="Enter account holder name"
									/>
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="Account Number" required error={errors.accountNumber?.message}>
							<Input.Root hasError={!!errors.accountNumber}>
								<Input.Wrapper>
									<Input.El
										{...register("accountNumber")}
										type="text"
										inputMode="numeric"
										placeholder="Enter account number"
									/>
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="IFSC Code" required error={errors.ifscCode?.message}>
							<Input.Root hasError={!!errors.ifscCode}>
								<Input.Wrapper>
									<Input.El
										{...register("ifscCode")}
										placeholder="HDFC0001234"
										maxLength={11}
										style={{ textTransform: "uppercase" }}
									/>
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="Bank Name" required error={errors.bankName?.message}>
							<Input.Root hasError={!!errors.bankName}>
								<Input.Wrapper>
									<Input.El {...register("bankName")} placeholder="Enter bank name" />
								</Input.Wrapper>
							</Input.Root>
						</FormField>

						<FormField label="Account Type" required error={errors.accountType?.message}>
							<Controller
								name="accountType"
								control={control}
								render={({ field }) => (
									<Radio.Group value={field.value} onValueChange={field.onChange}>
										<div className="space-y-2">
											<label className="flex items-center gap-3 p-3 rounded-10 border border-stroke-soft-200 cursor-pointer hover:bg-bg-weak-50 transition-colors">
												<Radio.Item value="savings" />
												<span className="text-label-sm text-text-strong-950">Savings</span>
											</label>
											<label className="flex items-center gap-3 p-3 rounded-10 border border-stroke-soft-200 cursor-pointer hover:bg-bg-weak-50 transition-colors">
												<Radio.Item value="current" />
												<span className="text-label-sm text-text-strong-950">Current</span>
											</label>
										</div>
									</Radio.Group>
								)}
							/>
						</FormField>

						<div className="rounded-lg bg-bg-weak-50 p-3 border border-stroke-soft-200">
							<div className="flex items-start gap-2">
								<Info className="size-4 text-text-sub-600 shrink-0 mt-0.5" />
								<p className="text-paragraph-xs text-text-sub-600">
									A small amount (₹1) will be deposited to verify your account. This will be
									refunded automatically.
								</p>
							</div>
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="submit"
						form="bank-account-form"
						variant="primary"
						disabled={isPending}
					>
						{isPending ? "Adding..." : "Add Bank Account"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
