"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Radio from "@/components/ui/forms/radio"
import { Bank } from "@phosphor-icons/react"
import { cn, formatCurrency } from "@/lib/utils"
import { logError } from "@/lib/logging/error-logger-simple"
import { useParams } from "next/navigation"
import { useBankAccounts } from "@/features/settings"
import { requestWithdrawal } from "@/features/wallet"
import { toast } from "sonner"

interface BankAccount {
	id: string
	bankName: string
	accountNumber: string
	accountHolderName: string
	isDefault: boolean
}

interface WithdrawalModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	availableBalance: number
	bankAccounts: BankAccount[]
	onConfirm: (amount: number, bankAccountId: string) => void
	isLoading?: boolean
}

export function WithdrawalModal({
	open,
	onOpenChange,
	availableBalance,
	bankAccounts,
	onConfirm,
	isLoading = false,
}: WithdrawalModalProps) {
	const [amount, setAmount] = React.useState("")
	const [selectedBank, setSelectedBank] = React.useState(
		bankAccounts.find((b) => b.isDefault)?.id || bankAccounts[0]?.id || ""
	)

	const handleConfirm = () => {
		onConfirm(Number(amount), selectedBank)
	}

	const isValidAmount = Number(amount) >= 1000 && Number(amount) <= availableBalance

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Request Withdrawal</Modal.Title>
				</Modal.Header>
				<Modal.Body className="space-y-4">
					<div className="rounded-10 bg-bg-weak-50 p-3">
						<span className="text-paragraph-sm text-text-sub-600">Available Balance:</span>
						<div className="text-label-lg text-text-strong-950">
							{formatCurrency(availableBalance)}
						</div>
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Withdrawal Amount <span className="text-error-base">*</span>
						</label>
						<Input.Root>
							<Input.Wrapper>
								<span className="pl-3 text-text-sub-600">₹</span>
								<Input.El
									type="number"
									placeholder="50,000"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
						<p className="mt-1 text-paragraph-xs text-text-soft-400">
							Minimum: ₹1,000 | Maximum: {formatCurrency(availableBalance)}
						</p>
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Select Bank Account <span className="text-error-base">*</span>
						</label>
						<Radio.Group value={selectedBank} onValueChange={setSelectedBank}>
							<div className="space-y-2">
								{bankAccounts.map((account) => (
									<label
										key={account.id}
										className={cn(
											"flex items-start gap-3 p-3 rounded-10 border cursor-pointer transition-colors",
											selectedBank === account.id
												? "border-primary-base bg-primary-alpha-10"
												: "border-stroke-soft-200 hover:bg-bg-weak-50"
										)}
									>
										<Radio.Item value={account.id} className="mt-0.5" />
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<Bank weight="duotone" className="size-4 text-text-sub-600" />
												<span className="text-label-sm text-text-strong-950">
													{account.bankName} - ****{account.accountNumber.slice(-4)}
												</span>
												{account.isDefault && (
													<span className="text-label-xs text-primary-base">Default</span>
												)}
											</div>
											<div className="text-paragraph-xs text-text-sub-600 mt-0.5">
												{account.accountHolderName}
											</div>
										</div>
									</label>
								))}
							</div>
						</Radio.Group>
					</div>

					<div className="rounded-10 bg-bg-weak-50 p-4">
						<h4 className="text-label-sm text-text-strong-950 mb-3">Withdrawal Summary</h4>
						<div className="space-y-2 text-paragraph-sm">
							<div className="flex justify-between">
								<span className="text-text-sub-600">Withdrawal Amount</span>
								<span className="text-text-strong-950">
									{amount ? formatCurrency(Number(amount)) : "₹0"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-sub-600">Processing Fee</span>
								<span className="text-text-strong-950">₹0</span>
							</div>
							<div className="border-t border-stroke-soft-200 pt-2 mt-2">
								<div className="flex justify-between font-medium">
									<span className="text-text-strong-950">You will receive</span>
									<span className="text-primary-base">
										{amount ? formatCurrency(Number(amount)) : "₹0"}
									</span>
								</div>
							</div>
						</div>
						<p className="text-paragraph-xs text-text-soft-400 mt-3">
							Estimated arrival: 1-2 business days
						</p>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root
						variant="primary"
						onClick={handleConfirm}
						disabled={!isValidAmount || !selectedBank || isLoading}
					>
						{isLoading ? "Processing..." : "Request Withdrawal"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

// ============================================
// Withdrawal Request Modal (Self-Contained)
// ============================================

interface WithdrawalRequestModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	availableBalance: number
	onSuccess?: () => void
}

/**
 * Self-contained withdrawal modal that fetches bank accounts internally
 * and handles the withdrawal request server action.
 *
 * Note: The API currently only accepts amount and optional notes.
 * Bank account selection is handled by the backend (uses default account).
 */
export function WithdrawalRequestModal({
	open,
	onOpenChange,
	availableBalance,
	onSuccess,
}: WithdrawalRequestModalProps) {
	const params = useParams<{ organizationId: string }>()
	const { data: bankAccountsResponse } = useBankAccounts(params.organizationId)
	const bankAccounts = bankAccountsResponse?.data ?? []
	const [isPending, startTransition] = React.useTransition()

	const handleConfirm = React.useCallback((amount: number, _bankAccountId: string) => {
		// Validation
		if (!amount || amount < 1000) {
			toast.error("Minimum withdrawal amount is ₹1,000")
			return
		}
		if (amount > availableBalance) {
			toast.error("Amount exceeds available balance")
			return
		}
		if (!params.organizationId) {
			toast.error("Organization not found")
			return
		}

		startTransition(async () => {
			try {
				// Note: bankAccountId is shown in UI but not sent to API
				// Backend uses default bank account for withdrawals
				const result = await requestWithdrawal({
					organizationId: params.organizationId,
					amount,
				})
				if (result?.data?.withdrawalId) {
					toast.success("Withdrawal request submitted successfully")
					onOpenChange(false)
					onSuccess?.()
				} else {
					toast.error(result?.serverError || "Failed to submit withdrawal request")
				}
			} catch (error) {
				logError(error, { source: "WithdrawalModal", data: { action: "withdrawalRequest", amount } })
				toast.error("Failed to submit withdrawal request. Please try again.")
			}
		})
	}, [availableBalance, params.organizationId, onOpenChange, onSuccess])

	return (
		<WithdrawalModal
			open={open}
			onOpenChange={onOpenChange}
			availableBalance={availableBalance}
			bankAccounts={bankAccounts}
			onConfirm={handleConfirm}
			isLoading={isPending}
		/>
	)
}
