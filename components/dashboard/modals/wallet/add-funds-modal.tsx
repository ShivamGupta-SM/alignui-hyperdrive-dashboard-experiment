"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import { QrCode } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { EXTERNAL_URLS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils/format"

interface AddFundsModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (amount: number, upiId: string) => void
	isLoading?: boolean
}

export function AddFundsModal({
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
}: AddFundsModalProps) {
	const [amount, setAmount] = React.useState("")
	const [upiId, setUpiId] = React.useState("")

	const quickAmounts = [10000, 25000, 50000, 100000]

	const handleConfirm = () => {
		onConfirm(Number(amount), upiId)
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Add Funds via UPI</Modal.Title>
				</Modal.Header>
				<Modal.Body className="space-y-4">
					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Amount <span className="text-error-base">*</span>
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
					</div>

					<div>
						<label className="block text-label-sm text-text-sub-600 mb-2">Quick Select:</label>
						<div className="flex flex-wrap gap-2">
							{quickAmounts.map((value) => (
								<button
									key={value}
									type="button"
									onClick={() => setAmount(value.toString())}
									className={cn(
										"px-3 py-1.5 rounded-10 text-label-sm transition-colors",
										amount === value.toString()
											? "bg-primary-base text-white"
											: "bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200"
									)}
								>
									{formatCurrency(value)}
								</button>
							))}
						</div>
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Your UPI ID <span className="text-error-base">*</span>
						</label>
						<Input.Root>
							<Input.Wrapper>
								<Input.El
									placeholder="yourname@upi"
									value={upiId}
									onChange={(e) => setUpiId(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					<div className="flex items-center justify-center py-4">
						<div className="text-center text-text-sub-600">
							<div className="text-label-sm mb-2">OR</div>
						</div>
					</div>

					<div className="rounded-10 bg-bg-weak-50 p-4 text-center">
						<div className="flex size-32 mx-auto items-center justify-center rounded-10 bg-white border border-stroke-soft-200 mb-3 overflow-hidden">
							{amount ? (
								<img
									src={`${EXTERNAL_URLS.QR_CODE_API}?size=120x120&data=${encodeURIComponent(`upi://pay?pa=hypedrive@upi&pn=Hypedrive&am=${amount}&cu=INR`)}`}
									alt="UPI QR Code"
									className="size-28"
								/>
							) : (
								<QrCode weight="duotone" className="size-16 text-text-soft-400" />
							)}
						</div>
						<p className="text-paragraph-sm text-text-sub-600">
							Scan with any UPI app to pay {amount ? formatCurrency(Number(amount)) : "₹0"}
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
						disabled={!amount || !upiId || isLoading}
					>
						{isLoading ? "Processing..." : "Send Payment Request"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
