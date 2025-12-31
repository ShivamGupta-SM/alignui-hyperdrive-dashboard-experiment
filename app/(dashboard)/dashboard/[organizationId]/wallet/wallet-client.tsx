"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import * as Button from "@/components/ui/primitives/button"
import * as StatusBadge from "@/components/ui/data-display/status-badge"
import * as Select from "@/components/ui/forms/select"
import * as Modal from "@/components/ui/layout/modal"
import * as BottomSheet from "@/components/ui/layout/bottom-sheet"
import * as Input from "@/components/ui/forms/input"
import * as Textarea from "@/components/ui/forms/textarea"
import { ProgressCircle } from "@/components/ui/primitives/progress-circle"
import * as Tooltip from "@/components/ui/layout/tooltip"
import { Callout, CalloutWithActions } from "@/components/ui/feedback/callout"
import { OrganizationSetupRequiredEmptyState } from "@/components/dashboard/empty-states"
import { PageHeaderSkeleton, WalletBalanceSkeleton, TransactionListSkeleton } from "@/components/dashboard/loading-skeletons"
import { WithdrawalRequestModal } from "@/components/dashboard/modals"
import {
	Plus,
	DownloadSimple,
	Wallet,
	ArrowUp,
	ArrowDown,
	Copy,
	Check,
	CreditCard,
	CurrencyCircleDollar,
	X,
	Clock,
	Bank,
	CheckCircle,
	ArrowRight,
} from "@phosphor-icons/react"
import {
	VisaIcon,
	MastercardIcon,
	AmexIcon,
	DiscoverIcon,
	PaypalIcon,
	UnionPayIcon,
} from "@/components/ui/branding/payment-icons"
import { cn } from "@/lib/utils"
import { useWalletSearchParams, useCopyWithField, useMultiModal } from "@/hooks"
import { useMediaQuery, useLocalStorage } from "usehooks-ts"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
import { BALANCE_THRESHOLDS } from "@/lib/constants"
import { exportTransactions } from "@/lib/utils/excel"
import { TRANSACTION_TYPE_CONFIG } from "@/lib/constants"
import { formatCurrency, formatCurrencyCompact, formatDateShort, getErrorMessage } from "@/lib/utils/format"
import { toast } from "sonner"
import { requestCredit, useDepositAccount } from "@/features/wallet"
import { useCurrentOrganization } from "@/hooks/shared/use-current-organization"

// Types
import type { organizations, wallets } from "@/brand-client"
import type { OrganizationWallet } from "@/features/wallet"

// Default wallet - createdAt will be set when used
const getDefaultWallet = (): OrganizationWallet => ({
	id: "",
	organizationId: "",
	currency: "INR",
	balance: 0,
	balanceDecimal: "0.00",
	pendingBalance: 0,
	pendingBalanceDecimal: "0.00",
	availableBalance: 0,
	availableBalanceDecimal: "0.00",
	createdAt: new Date().toISOString(),
	creditLimit: 0,
	creditUtilized: 0,
})

interface WalletClientProps {
	initialData?: {
		balance: organizations.OrganizationWalletResponse | null
		withdrawals: organizations.Withdrawal[]
		transactions: organizations.WalletTransaction[]
		activeHolds: organizations.ActiveHold[]
		stats?: wallets.WithdrawalStats | null
	} | null | undefined
}

// URL-based multi-tenancy: Use URL params instead of context
export function WalletClient({ initialData }: WalletClientProps) {
	const router = useRouter()

	// SSOT: Use centralized hook for organization lookup
	const { organization, isLoading: isOrgLoading } = useCurrentOrganization()
	const hasOrganization = !!organization

	// SSOT: Centralized modal state management
	const modals = useMultiModal(["fund", "creditRequest", "withdrawal"] as const)
	const [activeSection, setActiveSection] = useState<"transactions" | "withdrawals">(
		"transactions"
	)
	// Dismiss onboarding alert state (persisted in localStorage)
	const [dismissedOnboardingAlert, setDismissedOnboardingAlert] = useLocalStorage<boolean>(
		"wallet-onboarding-alert-dismissed",
		false
	)

	// nuqs: URL state management for filters
	const [searchParams, setSearchParams] = useWalletSearchParams()
	const transactionFilter = searchParams.type

	// Industry Standard: Check loading state first
	if (isOrgLoading) {
		return (
			<div className="space-y-5 sm:space-y-6">
				<PageHeaderSkeleton />
				<WalletBalanceSkeleton />
				<TransactionListSkeleton count={5} />
			</div>
		)
	}

	// Show onboarding alert if no organization
	const showOnboardingAlert = !hasOrganization && !dismissedOnboardingAlert

	// Use server data directly
	const wallet: OrganizationWallet = initialData?.balance
		? {
				...initialData.balance,
			}
		: getDefaultWallet()

	const transactions = initialData?.transactions ?? []
	const activeHolds = initialData?.activeHolds ?? []
	const withdrawals = initialData?.withdrawals ?? []
	const withdrawalStats = initialData?.stats

	// If no organization, show alert
	if (!hasOrganization) {
		return (
			<div className="space-y-5 sm:space-y-6">
				{/* ONBOARDING ALERT */}
				{showOnboardingAlert && (
					<CalloutWithActions
						variant="warning"
						title="Complete Your Organization Setup"
						dismissible
						onDismiss={() => setDismissedOnboardingAlert(true)}
						actions={
							<>
								<Button.Root
									variant="primary"
									size="small"
									onClick={() => router.push(routes.onboarding.root)}
								>
									<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
									Start Onboarding
								</Button.Root>
								<Button.Root
									variant="ghost"
									size="small"
									onClick={() => setDismissedOnboardingAlert(true)}
								>
									Maybe Later
								</Button.Root>
							</>
						}
					>
						To access wallet features, add funds, and manage transactions, you need to complete your organization setup. This will only take a few minutes.
					</CalloutWithActions>
				)}

				{/* HEADER */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Wallet</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
							Manage your wallet balance and transactions
						</p>
					</div>
				</div>

				{/* EMPTY STATE */}
				{dismissedOnboardingAlert && (
					<OrganizationSetupRequiredEmptyState
						description="Complete your organization setup to access wallet features, add funds, and manage transactions."
					/>
				)}
			</div>
		)
	}

	// nuqs: Update URL when filter changes
	const handleFilterChange = useCallback((value: string) => {
		setSearchParams({ type: value as "all" | "credit" | "hold_created" | "hold_committed" | "hold_voided" | "withdrawal" | "refund", page: 1 })
	}, [setSearchParams])

	// Excel export handler
	const handleExport = useCallback(() => {
		try {
			exportTransactions(transactions)
			toast.success("Transactions exported to Excel")
		} catch {
			toast.error("Failed to export transactions")
		}
	}, [transactions])

	// Use centralized formatting functions from lib/format.ts directly
	// Use formatCurrency directly from lib/format
	const formatCurrencyShort = (amount: number | undefined | null): string => formatCurrencyCompact(amount ?? 0)
	const formatDate = (date: Date | string): string => formatDateShort(date)

	const formatTime = (date: Date | string) => {
		return new Date(date).toLocaleTimeString("en-IN", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
	}

	const creditUtilization = useMemo(() => {
		if (!wallet.creditLimit || wallet.creditLimit <= 0) return 0
		// Clamp to 100% max to prevent showing >100% when credit utilized exceeds limit
		const percentage = ((wallet.creditUtilized ?? 0) / wallet.creditLimit) * 100
		return Math.min(Math.round(percentage), 100)
	}, [wallet.creditLimit, wallet.creditUtilized])

	const filteredTransactions = useMemo(() => {
		if (!transactions || !Array.isArray(transactions)) return []
		if (transactionFilter === "all") return transactions
		return transactions.filter((t) => t.type === transactionFilter)
	}, [transactions, transactionFilter])

	const getTransactionStatus = (type: string) => {
		switch (type) {
			case "credit":
			case "release":
				return "completed" as const
			case "hold":
				return "pending" as const
			case "hold_committed":
			case "debit":
				return "disabled" as const
			default:
				return "disabled" as const
		}
	}

	const totalHeld = useMemo(() => {
		if (!activeHolds || !Array.isArray(activeHolds)) return 0
		return activeHolds.reduce((acc, h) => acc + (h.amount || 0), 0)
	}, [activeHolds])

	// Note: cancelWithdrawal is not available in current API
	// Withdrawals can only be cancelled by admins through backend
	const handleCancelWithdrawal = useCallback((_id: string) => {
		toast.info("Withdrawal cancellation requires admin approval", {
			description: "Please contact support at support@hypedrive.com to cancel this withdrawal request.",
			duration: 5000,
		})
	}, [])

	// Stable callbacks for UI interactions
	const handleOpenCreditRequest = useCallback(() => {
		modals.open("creditRequest")
	}, [modals])

	const handleOpenFundModal = useCallback(() => {
		modals.open("fund")
	}, [modals])

	const handleSetTransactionsSection = useCallback(() => {
		setActiveSection("transactions")
	}, [])

	const handleSetWithdrawalsSection = useCallback(() => {
		setActiveSection("withdrawals")
	}, [])

	// Stable callbacks for withdrawal modal
	const handleOpenWithdrawalModal = useCallback(() => {
		modals.open("withdrawal")
	}, [modals])

	return (
		<Tooltip.Provider>
			<div className="space-y-5 sm:space-y-6">
				{/* Page Header */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Wallet</h1>
						<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
							Manage your balance and transactions
						</p>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<Button.Root
							variant="neutral"
							size="small"
							onClick={handleOpenCreditRequest}
							className="flex-1 sm:flex-none"
						>
							<Button.Icon><ArrowUp className="size-5" /></Button.Icon>
							<span className="sm:inline">Request Credit</span>
						</Button.Root>
						<Button.Root
							variant="primary"
							size="small"
							onClick={handleOpenFundModal}
							className="flex-1 sm:flex-none"
						>
							<Button.Icon><Plus className="size-5" /></Button.Icon>
							<span className="sm:inline">Fund Wallet</span>
						</Button.Root>
					</div>
				</div>

				{/* Low Balance Warning */}
				{wallet.availableBalance < BALANCE_THRESHOLDS.LOW_WARNING && (
					<Callout variant="warning" dismissible>
						<strong>Low Balance:</strong> Your wallet balance is below ₹
						{BALANCE_THRESHOLDS.LOW_WARNING.toLocaleString("en-IN")}. Add funds to continue
						accepting enrollments.
					</Callout>
				)}

				{/* Balance Overview - Hero Section */}
				<div className="rounded-xl bg-linear-to-br from-primary-base to-primary-darker p-4 sm:p-6 text-white shadow-lg">
					<div className="flex items-start justify-between mb-4 sm:mb-5">
						<div>
							<p className="text-paragraph-sm text-white/80 mb-1.5">Total Balance</p>
							<h2 className="text-title-h2 sm:text-[42px] font-bold tracking-tight leading-none">
								{formatCurrency(wallet.availableBalance + wallet.pendingBalance)}
							</h2>
						</div>
						<div className="flex size-11 sm:size-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
							<Wallet weight="fill" className="size-5 sm:size-6" />
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4 sm:gap-5 pt-4 sm:pt-5 border-t border-white/15">
						<div>
							<p className="text-[11px] text-white/60 uppercase tracking-wider mb-1">Available</p>
							<p className="text-label-lg sm:text-title-h5 font-semibold">
								{formatCurrency(wallet.availableBalance)}
							</p>
						</div>
						<div>
							<p className="text-[11px] text-white/60 uppercase tracking-wider mb-1">On Hold</p>
							<p className="text-label-lg sm:text-title-h5 font-semibold">
								{formatCurrency(wallet.pendingBalance)}
							</p>
						</div>
					</div>
				</div>

				{/* Credit & Payment Info Row */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{/* Credit Limit Card */}
					<div className="rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200 flex flex-col transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
						<div className="flex items-start justify-between gap-3 mb-4">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<div className="flex size-8 items-center justify-center rounded-full bg-information-lighter text-information-base shrink-0">
										<ArrowUp weight="bold" className="size-4" />
									</div>
									<span className="text-label-sm text-text-sub-600">Credit Limit</span>
								</div>
								<p className="text-label-lg sm:text-title-h5 text-text-strong-950 font-semibold mt-2">
									{formatCurrency(wallet.creditLimit ?? 0)}
								</p>
							</div>
							<ProgressCircle value={creditUtilization} size="large" className="shrink-0">
								<span className="text-label-xs text-text-strong-950 font-semibold">
									{creditUtilization}%
								</span>
							</ProgressCircle>
						</div>
						<div className="flex items-center justify-between pt-3 border-t border-stroke-soft-200 mt-auto">
							<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
								{formatCurrency(wallet.creditUtilized ?? 0)} utilized
							</p>
							<button
								type="button"
								onClick={() => modals.open("creditRequest")}
								className="text-label-xs font-medium text-primary-base hover:text-primary-darker transition-all duration-200 shrink-0"
							>
								Increase →
							</button>
						</div>
					</div>

					{/* Payment Methods Card */}
					<div className="rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200 flex flex-col transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
						<div className="flex items-center gap-2 mb-3 sm:mb-4">
							<div className="flex size-8 items-center justify-center rounded-full bg-bg-soft-200 text-text-sub-600 shrink-0">
								<CreditCard weight="duotone" className="size-4" />
							</div>
							<span className="text-label-sm text-text-sub-600">Payment Methods</span>
						</div>
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 opacity-70 hover:opacity-100 transition-opacity">
							<VisaIcon className="h-5 sm:h-6 w-auto" />
							<MastercardIcon className="h-5 sm:h-6 w-auto" />
							<AmexIcon className="h-5 sm:h-6 w-auto" />
							<DiscoverIcon className="h-5 sm:h-6 w-auto" />
							<PaypalIcon className="h-5 sm:h-6 w-auto" />
							<UnionPayIcon className="h-5 sm:h-6 w-auto" />
						</div>
						<p className="text-paragraph-xs text-text-soft-400 mt-auto pt-2 sm:pt-3">
							Instant credit on bank transfer
						</p>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
					{/* Transaction History */}
					<div className="lg:col-span-2 space-y-3 sm:space-y-4">
						{/* Section Toggle */}
						<div className="flex items-center gap-2 p-1 rounded-lg bg-bg-weak-50 w-fit mb-4">
							<button
								type="button"
								onClick={handleSetTransactionsSection}
								className={cn(
									"px-3 py-1.5 rounded-md text-label-sm font-medium transition-all duration-200",
									activeSection === "transactions"
										? "bg-bg-white-0 text-text-strong-950 shadow-sm"
										: "text-text-sub-600 hover:text-text-strong-950"
								)}
							>
								Transactions
							</button>
							<button
								type="button"
								onClick={handleSetWithdrawalsSection}
								className={cn(
									"px-3 py-1.5 rounded-md text-label-sm font-medium transition-all duration-200",
									activeSection === "withdrawals"
										? "bg-bg-white-0 text-text-strong-950 shadow-sm"
										: "text-text-sub-600 hover:text-text-strong-950"
								)}
							>
								Withdrawals
								{withdrawals && Array.isArray(withdrawals) && withdrawals.filter((w) => w.status === "pending").length > 0 && (
									<span className="ml-1.5 inline-flex items-center justify-center size-5 rounded-full bg-warning-base text-white text-label-xs font-medium">
										{withdrawals.filter((w) => w.status === "pending").length}
									</span>
								)}
							</button>
						</div>

						{/* Transaction Section */}
						{activeSection === "transactions" && (
							<>
								{/* Transaction Header */}
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<h2 className="text-label-md text-text-strong-950">Transactions</h2>
									<div className="flex items-center gap-2">
										<Select.Root
											value={transactionFilter}
											onValueChange={handleFilterChange}
											size="small"
										>
											<Select.Trigger className="min-w-[140px] flex-1 sm:flex-none sm:w-40">
												<Select.Value placeholder="All Transactions" />
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="all">All Transactions</Select.Item>
												<Select.Item value="credit">Credits</Select.Item>
												<Select.Item value="hold_created">Holds Created</Select.Item>
												<Select.Item value="hold_committed">Holds Committed</Select.Item>
												<Select.Item value="hold_voided">Holds Released</Select.Item>
											</Select.Content>
										</Select.Root>
										<Tooltip.Root>
											<Tooltip.Trigger asChild>
												<Button.Root
													variant="neutral"
													size="small"
													onClick={handleExport}
													className="shrink-0"
													aria-label="Export transactions to Excel"
												>
													<Button.Icon><DownloadSimple className="size-5" /></Button.Icon>
													<span className="hidden sm:inline">Export</span>
												</Button.Root>
											</Tooltip.Trigger>
											<Tooltip.Content>Export transactions to Excel</Tooltip.Content>
										</Tooltip.Root>
									</div>
								</div>

								{/* Transaction List */}
								<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
									<div className="divide-y divide-stroke-soft-200">
										{filteredTransactions.map((transaction) => {
											const config =
												TRANSACTION_TYPE_CONFIG[
													transaction.type as keyof typeof TRANSACTION_TYPE_CONFIG
												] || TRANSACTION_TYPE_CONFIG["hold_committed"]
											const isCredit = config.sign === "+"
											return (
												<div
													key={transaction.id}
													className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 hover:bg-bg-weak-50 transition-all duration-200 cursor-pointer group"
												>
													{/* Icon */}
													<div
														className={cn(
															"flex size-10 sm:size-11 items-center justify-center rounded-full shrink-0",
															isCredit ? "bg-success-lighter" : "bg-warning-lighter"
														)}
													>
														{isCredit ? (
															<ArrowDown weight="bold" className="size-5 text-success-base" />
														) : (
															<ArrowUp weight="bold" className="size-5 text-warning-base" />
														)}
													</div>

													{/* Content */}
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-2">
															<div className="min-w-0">
																<p className="text-label-sm text-text-strong-950 truncate">
																	{transaction.description}
																</p>
																<div className="flex items-center gap-2 mt-0.5">
																	<span className="text-paragraph-xs text-text-soft-400">
																		{formatDate(transaction.createdAt)} •{" "}
																		{formatTime(transaction.createdAt)}
																	</span>
																	<StatusBadge.Root
																		status={getTransactionStatus(transaction.type)}
																		variant="stroke"
																		className="hidden sm:inline-flex"
																	>
																		{config.label}
																	</StatusBadge.Root>
																</div>
															</div>
															<div className="text-right shrink-0 min-w-[100px]">
																<p
																	className={cn(
																		"text-label-md font-semibold tabular-nums",
																		isCredit ? "text-success-base" : "text-text-strong-950"
																	)}
																>
																	{config.sign}
																	{formatCurrency(transaction.amount)}
																</p>
																<StatusBadge.Root
																	status={getTransactionStatus(transaction.type)}
																	variant="stroke"
																	className="sm:hidden mt-1 inline-flex"
																>
																	{config.label}
																</StatusBadge.Root>
															</div>
														</div>
													</div>
												</div>
											)
										})}
									</div>

									{filteredTransactions.length === 0 && (
										<div className="p-12 text-center">
											<div className="max-w-md mx-auto space-y-4">
												<div className="flex justify-center">
													<div className="flex size-16 items-center justify-center rounded-full bg-bg-soft-200">
														<CurrencyCircleDollar
															weight="duotone"
															className="size-8 text-text-soft-400"
														/>
													</div>
												</div>
												<div>
													<h3 className="text-title-h6 text-text-strong-950">No transactions</h3>
													<p className="text-paragraph-sm text-text-sub-600 mt-2">
														{transactionFilter === "all"
															? "Transactions will appear here once you start using your wallet."
															: `No ${transactionFilter.replace("_", " ")} transactions found. Try selecting a different filter.`}
													</p>
												</div>
												{transactionFilter !== "all" && (
													<Button.Root
														variant="neutral"
														size="medium"
														onClick={() => handleFilterChange("all")}
													>
														View All Transactions
													</Button.Root>
												)}
											</div>
										</div>
									)}
								</div>
							</>
						)}

						{/* Withdrawals Section */}
						{activeSection === "withdrawals" && (
							<>
								{/* Withdrawals Header with Request Button */}
								<div className="flex items-center justify-between mb-3 sm:mb-4">
									<h2 className="text-label-md text-text-strong-950">Withdrawals</h2>
									<Button.Root
										variant="primary"
										size="small"
										onClick={handleOpenWithdrawalModal}
									>
										<Button.Icon><ArrowUp className="size-5" /></Button.Icon>
										<span className="hidden sm:inline">Request Withdrawal</span>
										<span className="sm:hidden">Withdraw</span>
									</Button.Root>
								</div>

								{/* Withdrawal Stats Overview */}
								{withdrawalStats &&
									(() => {
										// Extract counts from countByStatus map
										// withdrawalStats type from server lacks specific shape in ssr-data, assuming it matches
										const completedCount = withdrawalStats.countByStatus?.completed ?? 0
										const pendingCount = withdrawalStats.pendingApprovalCount ?? 0
										const successRate =
											withdrawalStats.totalCount > 0
												? Math.round((completedCount / withdrawalStats.totalCount) * 100)
												: 0

										return (
											<div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4 mb-3 sm:mb-4">
												<div className="flex items-center gap-2.5 rounded-xl bg-bg-white-0 p-2.5 sm:p-3 ring-1 ring-inset ring-stroke-soft-200">
													<div className="flex size-9 items-center justify-center rounded-lg bg-success-lighter text-success-base">
														<CheckCircle weight="fill" className="size-4" />
													</div>
													<div>
														<span className="block text-paragraph-xs text-text-soft-400">
															Completed
														</span>
														<span className="text-label-lg text-success-base font-semibold">
															{completedCount}
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
													<div className="flex size-9 items-center justify-center rounded-lg bg-warning-lighter text-warning-base">
														<Clock weight="fill" className="size-4" />
													</div>
													<div>
														<span className="block text-paragraph-xs text-text-soft-400">
															Pending
														</span>
														<span className="text-label-lg text-warning-base font-semibold">
															{pendingCount}
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
													<div className="flex size-9 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600">
														<Bank weight="duotone" className="size-4" />
													</div>
													<div>
														<span className="block text-paragraph-xs text-text-soft-400">
															Total Amount
														</span>
														<span className="text-label-lg text-text-strong-950 font-semibold">
															₹{(withdrawalStats.totalAmount / 1000).toFixed(0)}K
														</span>
													</div>
												</div>
												<div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
													<div
														className={cn(
															"flex size-9 items-center justify-center rounded-lg",
															successRate >= 90
																? "bg-success-lighter text-success-base"
																: "bg-warning-lighter text-warning-base"
														)}
													>
														<ArrowUp weight="bold" className="size-4" />
													</div>
													<div>
														<span className="block text-paragraph-xs text-text-soft-400">
															Success Rate
														</span>
														<span
															className={cn(
																"text-label-lg font-semibold",
																successRate >= 90 ? "text-success-base" : "text-warning-base"
															)}
														>
															{successRate}%
														</span>
													</div>
												</div>
											</div>
										)
									})()}

								{/* Withdrawals List */}
								<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
									<div className="divide-y divide-stroke-soft-200">
										{withdrawals.map((withdrawal) => (
											// Inlined WithdrawalItem for now to avoid complexity of props
											<div
												key={withdrawal.id}
												className="p-2.5 sm:p-3 flex items-center justify-between"
											>
												<div>
													<p className="text-label-sm font-medium">
														{formatCurrency(withdrawal.amount)}
													</p>
													<p className="text-paragraph-xs text-text-soft-400">
														{formatDate(withdrawal.requestedAt)}
													</p>
												</div>
												<div className="flex items-center gap-2">
													<StatusBadge.Root
														status={
															withdrawal.status === "completed"
																? "completed"
																: withdrawal.status === "pending" ||
																		withdrawal.status === "processing"
																	? "pending"
																	: withdrawal.status === "failed" ||
																			withdrawal.status === "rejected" ||
																			withdrawal.status === "cancelled"
																		? "failed"
																		: "disabled"
														}
														variant="light"
													/>
													{withdrawal.status === "pending" && (
														<Tooltip.Root>
															<Tooltip.Trigger asChild>
																<Button.Root
																	variant="ghost"
																	size="small"
																	onClick={() => handleCancelWithdrawal(withdrawal.id)}
																>
																	Cancel
																</Button.Root>
															</Tooltip.Trigger>
															<Tooltip.Content>Contact support to cancel</Tooltip.Content>
														</Tooltip.Root>
													)}
												</div>
											</div>
										))}
									</div>

									{withdrawals.length === 0 && (
										<div className="p-12 text-center">
											<div className="max-w-md mx-auto space-y-4">
												<div className="flex justify-center">
													<div className="flex size-16 items-center justify-center rounded-full bg-bg-soft-200">
														<Bank weight="duotone" className="size-8 text-text-soft-400" />
													</div>
												</div>
												<div>
													<h3 className="text-title-h6 text-text-strong-950">No withdrawals yet</h3>
													<p className="text-paragraph-sm text-text-sub-600 mt-2">
														Your withdrawal history will appear here once you request a withdrawal.
													</p>
												</div>
											</div>
										</div>
									)}
								</div>
							</>
						)}
					</div>

					{/* Active Holds */}
					<div className="space-y-3 sm:space-y-4">
						{/* Header - matches Transactions header style */}
						<div className="flex items-center justify-between">
							<h2 className="text-label-md text-text-strong-950">Active Holds</h2>
							<span className="text-paragraph-xs text-text-soft-400">
								{activeHolds.length} campaigns
							</span>
						</div>

						{/* Holds List - matches Transactions card style */}
						<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
							{/* Summary Header */}
							<div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-stroke-soft-200 bg-bg-weak-50">
								<div className="flex items-center gap-3">
									<div className="size-10 sm:size-11 rounded-full bg-warning-lighter flex items-center justify-center text-warning-base shrink-0">
										<CurrencyCircleDollar weight="duotone" className="size-5" />
									</div>
									<div>
										<p className="text-paragraph-xs text-text-sub-600">Total Held</p>
										<p className="text-label-lg text-text-strong-950 font-semibold">
											{formatCurrency(totalHeld)}
										</p>
									</div>
								</div>
							</div>

							{/* Holds List - matches Transaction items style */}
							<div className="divide-y divide-stroke-soft-200">
								{activeHolds.map((hold) => (
									<div
										key={hold.campaignId}
										className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-bg-weak-50 transition-all duration-200 cursor-pointer group"
									>
										{/* Icon - Up arrow for holds (money held/out) */}
										<div className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-warning-lighter shrink-0">
											<ArrowUp weight="bold" className="size-5 text-warning-base" />
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0">
													<p className="text-label-sm text-text-strong-950 truncate">
														Campaign {hold.campaignId.slice(0, 8)}
													</p>
													<p className="text-paragraph-xs text-text-soft-400 mt-0.5">
														Held {new Date(hold.createdAt).toLocaleDateString()}
													</p>
												</div>
												<p className="text-label-md text-text-strong-950 font-semibold tabular-nums shrink-0 min-w-[60px] text-right">
													{formatCurrencyShort(hold.amount)}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>

							{activeHolds.length === 0 && (
								<div className="p-12 text-center">
									<div className="size-12 mx-auto mb-3 rounded-full bg-bg-soft-200 flex items-center justify-center">
										<CurrencyCircleDollar weight="duotone" className="size-6 text-text-soft-400" />
									</div>
									<p className="text-label-sm text-text-strong-950">No active holds</p>
									<p className="text-paragraph-xs text-text-sub-600 mt-1">
										Holds will appear when enrollments are pending review.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Modals - using centralized modal state */}
				<FundWalletModal {...modals.getProps("fund")} />
				<CreditRequestModal
					{...modals.getProps("creditRequest")}
					currentCreditLimit={wallet.creditLimit ?? 0}
				/>
				<WithdrawalRequestModal
					{...modals.getProps("withdrawal")}
					availableBalance={wallet.availableBalance}
					onSuccess={modals.close}
				/>
			</div>
		</Tooltip.Provider>
	)
}

// Shared Fund Wallet Content
function FundWalletContent({ onClose }: { onClose: () => void }) {
	const { organizationId } = useCurrentOrganization()
	const { data: depositAccount, isPending, error } = useDepositAccount(organizationId)

	const { copy, isCopied } = useCopyWithField<"account" | "ifsc" | "accountName">({
		onSuccess: () => {
			toast.success("Copied to clipboard", {
				description: "Account details copied successfully",
			})
		},
		onError: (err) => {
			toast.error("Failed to copy", {
				description: err.message || "Unable to copy to clipboard",
			})
		},
	})

	// Extract bank details from API response
	// DepositAccountResponse has { found: boolean, account?: DepositAccountDetails }
	const bankDetails = depositAccount?.account
	const accountName = bankDetails?.beneficiaryName || "—"
	const accountNumber = bankDetails?.accountNumber || "—"
	const ifscCode = bankDetails?.ifsc || "—"
	const bankName = bankDetails?.bankName || "Virtual Account"

	if (isPending) {
		return (
			<div className="space-y-4">
				<p className="text-paragraph-sm text-text-sub-600">Loading account details...</p>
				<div className="animate-pulse space-y-3">
					<div className="h-4 bg-bg-soft-200 rounded w-3/4" />
					<div className="h-4 bg-bg-soft-200 rounded w-1/2" />
					<div className="h-4 bg-bg-soft-200 rounded w-2/3" />
				</div>
			</div>
		)
	}

	if (error || !depositAccount) {
		return (
			<>
				<Callout variant="error" size="sm">
					Unable to load deposit account details. Please try again later or contact support.
				</Callout>
				<div className="flex justify-end mt-4">
					<Button.Root variant="ghost" onClick={onClose}>
						Close
					</Button.Root>
				</div>
			</>
		)
	}

	return (
		<>
			<p className="text-paragraph-sm text-text-sub-600 mb-4">
				Add funds via bank transfer to the virtual account below.
			</p>

			<div className="rounded-lg bg-bg-weak-50 p-4 space-y-3">
				<div className="flex items-center gap-2 mb-3">
					<CreditCard weight="duotone" className="size-4 text-text-soft-400" />
					<h3 className="text-label-sm text-text-strong-950">Virtual Account Details</h3>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-paragraph-xs text-text-sub-600">Account Name</span>
						<div className="flex items-center gap-2">
							<span className="text-label-sm text-text-strong-950">{accountName}</span>
							<button
								type="button"
								onClick={() => copy(accountName, "accountName")}
								className="text-text-soft-400 hover:text-text-sub-600 transition-colors"
								aria-label="Copy account name"
							>
								{isCopied("accountName") ? (
									<Check weight="bold" className="size-4 text-success-base" />
								) : (
									<Copy className="size-4" />
								)}
							</button>
						</div>
					</div>

					<div className="flex justify-between items-center">
						<span className="text-paragraph-xs text-text-sub-600">Account Number</span>
						<div className="flex items-center gap-2">
							<span className="text-label-sm text-text-strong-950 font-mono">
								{accountNumber}
							</span>
							<button
								type="button"
								onClick={() => copy(accountNumber, "account")}
								className="text-text-soft-400 hover:text-text-sub-600 transition-colors"
								aria-label="Copy account number"
							>
								{isCopied("account") ? (
									<Check weight="bold" className="size-4 text-success-base" />
								) : (
									<Copy className="size-4" />
								)}
							</button>
						</div>
					</div>

					<div className="flex justify-between items-center">
						<span className="text-paragraph-xs text-text-sub-600">IFSC Code</span>
						<div className="flex items-center gap-2">
							<span className="text-label-sm text-text-strong-950 font-mono">
								{ifscCode}
							</span>
							<button
								type="button"
								onClick={() => copy(ifscCode, "ifsc")}
								className="text-text-soft-400 hover:text-text-sub-600 transition-colors"
								aria-label="Copy IFSC code"
							>
								{isCopied("ifsc") ? (
									<Check weight="bold" className="size-4 text-success-base" />
								) : (
									<Copy className="size-4" />
								)}
							</button>
						</div>
					</div>

					<div className="flex justify-between items-center">
						<span className="text-paragraph-xs text-text-sub-600">Bank</span>
						<span className="text-label-sm text-text-strong-950">{bankName}</span>
					</div>
				</div>
			</div>

			<Callout variant="info" size="sm" className="mt-4">
				Funds credited instantly after successful transfer
			</Callout>

			<div className="flex justify-end mt-4">
				<Button.Root variant="ghost" onClick={onClose}>
					Close
				</Button.Root>
			</div>
		</>
	)
}

// Responsive Fund Wallet Modal - Bottom Sheet on mobile, Modal on desktop
function FundWalletModal({
	open,
	onOpenChange,
}: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const isMobile = useMediaQuery("(max-width: 639px)")

	// Mobile: Use vaul BottomSheet for swipe-to-dismiss
	if (isMobile) {
		return (
			<BottomSheet.Root open={open} onOpenChange={onOpenChange}>
				<BottomSheet.Content showClose={false}>
					<div className="flex items-center justify-between px-4 pt-4 pb-2">
						<h2 className="text-label-md text-text-strong-950 font-medium">Fund Wallet</h2>
					<BottomSheet.Close asChild>
						<Button.Root variant="ghost" size="xsmall" aria-label="Close fund wallet dialog">
							<Button.Icon><X className="size-5" /></Button.Icon>
						</Button.Root>
					</BottomSheet.Close>
					</div>
					<div className="px-4 pb-4">
						<FundWalletContent onClose={() => onOpenChange(false)} />
					</div>
				</BottomSheet.Content>
			</BottomSheet.Root>
		)
	}

	// Desktop: Use Modal
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Fund Wallet</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<FundWalletContent onClose={() => onOpenChange(false)} />
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}

// Shared Credit Request Content (useTransition pattern)
function CreditRequestContent({
	onClose,
	onSuccess,
	currentCreditLimit,
}: {
	onClose: () => void
	onSuccess: () => void
	currentCreditLimit: number
}) {
	const { organizationId } = useCurrentOrganization()

	// Controlled form state
	const [amount, setAmount] = useState("")
	const [reason, setReason] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		const numAmount = Number(amount)
		if (!numAmount || !reason.trim()) {
			setError("Amount and reason are required")
			return
		}

		startTransition(async () => {
			try {
				await requestCredit({ amount: numAmount, reason: reason.trim(), organizationId })
				toast.success("Credit request submitted successfully")
				onSuccess()
			} catch (err) {
				setError(getErrorMessage(err, "Failed to submit request"))
			}
		})
	}

	return (
		<>
			<div className="flex items-center justify-between p-3 rounded-lg bg-bg-weak-50 mb-4">
				<span className="text-paragraph-sm text-text-sub-600">Current Credit Limit</span>
				<span className="text-label-md text-text-strong-950 font-semibold">{formatCurrency(currentCreditLimit)}</span>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div>
						<label htmlFor="credit-amount" className="block text-label-sm text-text-strong-950 mb-1.5">
							Requested Credit Limit <span className="text-error-base">*</span>
						</label>
						<Input.Root>
							<Input.Wrapper>
								<span className="text-text-sub-600">₹</span>
								<Input.El
									id="credit-amount"
									type="number"
									placeholder="2,50,000"
									required
									min="1"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						{error && (
							<p className="mt-1 text-paragraph-xs text-error-base">
								{error}
							</p>
						)}
					</div>

					<div>
						<label htmlFor="credit-reason" className="block text-label-sm text-text-strong-950 mb-1.5">
							Reason for Request <span className="text-error-base">*</span>
						</label>
						<Textarea.Root
							id="credit-reason"
							placeholder="Explain why you need a higher credit limit..."
							rows={3}
							required
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<Button.Root type="button" variant="ghost" onClick={onClose} disabled={isPending}>
							Cancel
						</Button.Root>
						<Button.Root type="submit" variant="primary" disabled={isPending}>
							{isPending ? "Submitting..." : "Submit Request"}
						</Button.Root>
					</div>
				</div>
			</form>
		</>
	)
}

function CreditRequestModal({
	open,
	onOpenChange,
	currentCreditLimit,
}: { open: boolean; onOpenChange: (open: boolean) => void; currentCreditLimit: number }) {
	const isMobile = useMediaQuery("(max-width: 639px)")

	// Close handler
	const handleClose = useCallback(() => {
		onOpenChange(false)
	}, [onOpenChange])

	if (isMobile) {
		return (
			<BottomSheet.Root open={open} onOpenChange={onOpenChange}>
				<BottomSheet.Content showClose={false}>
					<div className="flex items-center justify-between px-4 pt-4 pb-2">
						<h2 className="text-label-md text-text-strong-950 font-medium">
							Request Credit Increase
						</h2>
					<BottomSheet.Close asChild>
						<Button.Root variant="ghost" size="xsmall" aria-label="Close credit request dialog">
							<Button.Icon><X className="size-5" /></Button.Icon>
						</Button.Root>
					</BottomSheet.Close>
					</div>
					<div className="px-4 pb-4">
						<CreditRequestContent
							onClose={handleClose}
							onSuccess={handleClose}
							currentCreditLimit={currentCreditLimit}
						/>
					</div>
				</BottomSheet.Content>
			</BottomSheet.Root>
		)
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Request Credit Increase</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<CreditRequestContent
						onClose={handleClose}
						onSuccess={handleClose}
						currentCreditLimit={currentCreditLimit}
					/>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}

