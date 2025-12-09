'use client'

import * as React from 'react'
import * as Modal from '@/components/ui/modal'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Textarea from '@/components/ui/textarea'
import * as Select from '@/components/ui/select'
import * as Checkbox from '@/components/ui/checkbox'
import * as Radio from '@/components/ui/radio'
import {
  Warning,
  Info,
  Check,
  X,
  Trash,
  CurrencyCircleDollar,
  Bank,
  QrCode,
} from '@phosphor-icons/react'
import { cn } from '@/utils/cn'
import { REJECTION_REASONS } from '@/lib/constants'

// ============================================
// Confirmation Modal
// ============================================

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  variant?: 'danger' | 'warning' | 'info'
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  variant = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const variantConfig = {
    danger: {
      icon: RiAlertLine,
      iconClass: 'text-error-base bg-error-lighter',
      buttonVariant: 'error' as const,
    },
    warning: {
      icon: RiAlertLine,
      iconClass: 'text-warning-base bg-warning-lighter',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: RiInformationLine,
      iconClass: 'text-info-base bg-info-lighter',
      buttonVariant: 'primary' as const,
    },
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <div className="flex items-start gap-4">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', config.iconClass)}>
              <Icon className="size-5" />
            </div>
            <div>
              <Modal.Title>{title}</Modal.Title>
              <Modal.Description className="mt-1">{description}</Modal.Description>
            </div>
          </div>
        </Modal.Header>
        <Modal.Footer>
          <Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button.Root>
          <Button.Root variant={config.buttonVariant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Approve Enrollment Modal
// ============================================

interface ApproveEnrollmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderValue: number
  billRate: number
  platformFee: number
  gstRate?: number
  onConfirm: () => void
  isLoading?: boolean
}

export function ApproveEnrollmentModal({
  open,
  onOpenChange,
  orderValue,
  billRate,
  platformFee,
  gstRate = 18,
  onConfirm,
  isLoading = false,
}: ApproveEnrollmentModalProps) {
  const billAmount = orderValue * (billRate / 100)
  const gstAmount = billAmount * (gstRate / 100)
  const total = billAmount + gstAmount + platformFee

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <div className="flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success-lighter mb-4">
              <Check weight="bold" className="size-6 text-success-base" />
            </div>
            <Modal.Title>Confirm Approval</Modal.Title>
            <Modal.Description className="mt-2">
              You are about to approve this enrollment. This will:
            </Modal.Description>
          </div>
        </Modal.Header>
        <Modal.Body>
          <ul className="space-y-2 text-paragraph-sm text-text-sub-600 mb-4">
            <li className="flex items-center gap-2">
              <RiCheckLine className="size-4 text-success-base shrink-0" />
              Commit the held amount from your wallet
            </li>
            <li className="flex items-center gap-2">
              <RiCheckLine className="size-4 text-success-base shrink-0" />
              Transfer payout to the shopper
            </li>
            <li className="flex items-center gap-2">
              <RiCheckLine className="size-4 text-success-base shrink-0" />
              Mark the enrollment as completed
            </li>
          </ul>

          <div className="rounded-10 bg-bg-weak-50 p-4">
            <h4 className="text-label-sm text-text-strong-950 mb-3">Billing Summary</h4>
            <div className="space-y-2 text-paragraph-sm">
              <div className="flex justify-between">
                <span className="text-text-sub-600">Order Value</span>
                <span className="text-text-strong-950">{formatCurrency(orderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-sub-600">Bill Rate ({billRate}%)</span>
                <span className="text-text-strong-950">{formatCurrency(billAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-sub-600">Platform Fee</span>
                <span className="text-text-strong-950">{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-sub-600">GST ({gstRate}%)</span>
                <span className="text-text-strong-950">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="border-t border-stroke-soft-200 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-text-strong-950">Total Brand Cost</span>
                  <span className="text-primary-base">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root variant="primary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : `Approve & Pay ${formatCurrency(total)}`}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Reject Enrollment Modal
// ============================================

interface RejectEnrollmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  holdAmount: number
  onConfirm: (reason: string, comments: string) => void
  isLoading?: boolean
}

export function RejectEnrollmentModal({
  open,
  onOpenChange,
  holdAmount,
  onConfirm,
  isLoading = false,
}: RejectEnrollmentModalProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>('')
  const [comments, setComments] = React.useState('')

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  const handleConfirm = () => {
    onConfirm(selectedReason, comments)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <Modal.Title>Reject Enrollment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="rounded-10 bg-warning-lighter p-3 text-paragraph-sm text-warning-base">
            <Warning weight="duotone" className="inline-block size-4 mr-2" />
            This action cannot be undone. The shopper will be notified and the hold amount will be released.
          </div>

          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Reason for Rejection <span className="text-error-base">*</span>
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-10 border cursor-pointer transition-colors',
                    selectedReason === reason.id
                      ? 'border-primary-base bg-primary-alpha-10'
                      : 'border-stroke-soft-200 hover:bg-bg-weak-50'
                  )}
                >
                  <Checkbox.Root
                    checked={selectedReason === reason.id}
                    onCheckedChange={() => setSelectedReason(reason.id)}
                  />
                  <span className="text-paragraph-sm text-text-strong-950">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Additional Comments (visible to shopper)
            </label>
            <Textarea.Root
              placeholder="Provide additional context for the rejection..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-10 bg-bg-weak-50 p-3 text-paragraph-sm">
            <span className="text-text-sub-600">Financial Impact:</span>
            <div className="text-text-strong-950">
              Hold Amount: {formatCurrency(holdAmount)} → Will be released to your wallet
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="error"
            onClick={handleConfirm}
            disabled={!selectedReason || isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Rejection'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Request Changes Modal
// ============================================

interface RequestChangesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (message: string) => void
  isLoading?: boolean
}

export function RequestChangesModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: RequestChangesModalProps) {
  const [message, setMessage] = React.useState('')

  const handleConfirm = () => {
    onConfirm(message)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <Modal.Title>Request Changes</Modal.Title>
          <Modal.Description>
            Please specify what changes are required from the shopper.
          </Modal.Description>
        </Modal.Header>
        <Modal.Body>
          <Textarea.Root
            placeholder="e.g., 'Please upload a clearer screenshot of the order ID.' or 'The order date does not match the campaign period.'"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="primary"
            onClick={handleConfirm}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? 'Sending...' : 'Request Changes'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Extend Deadline Modal
// ============================================

interface ExtendDeadlineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopperName: string
  campaignTitle: string
  currentDeadline: Date
  onConfirm: (newDeadline: Date, reason: string) => void
  isLoading?: boolean
}

export function ExtendDeadlineModal({
  open,
  onOpenChange,
  shopperName,
  campaignTitle,
  currentDeadline,
  onConfirm,
  isLoading = false,
}: ExtendDeadlineModalProps) {
  const [newDeadline, setNewDeadline] = React.useState('')
  const [reason, setReason] = React.useState('')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleConfirm = () => {
    onConfirm(new Date(newDeadline), reason)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <Modal.Title>Extend Submission Deadline</Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="text-paragraph-sm text-text-sub-600">
            <div>Shopper: <span className="text-text-strong-950">{shopperName}</span></div>
            <div>Campaign: <span className="text-text-strong-950">{campaignTitle}</span></div>
          </div>

          <div className="rounded-10 bg-bg-weak-50 p-3">
            <span className="text-paragraph-sm text-text-sub-600">Current Deadline:</span>
            <div className="text-label-sm text-text-strong-950">{formatDate(currentDeadline)}</div>
          </div>

          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              New Deadline <span className="text-error-base">*</span>
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Extension Reason (optional)
            </label>
            <Textarea.Root
              placeholder="Shopper requested additional time due to delivery delay"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 text-paragraph-xs text-text-soft-400">
            <RiInformationLine className="size-4 shrink-0" />
            <span>Shopper will be notified of the new deadline via email and app</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="primary"
            onClick={handleConfirm}
            disabled={!newDeadline || isLoading}
          >
            {isLoading ? 'Processing...' : 'Extend Deadline'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Add Funds Modal (UPI)
// ============================================

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
  const [amount, setAmount] = React.useState('')
  const [upiId, setUpiId] = React.useState('')

  const quickAmounts = [10000, 25000, 50000, 100000]

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`
  }

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
                    'px-3 py-1.5 rounded-10 text-label-sm transition-colors',
                    amount === value.toString()
                      ? 'bg-primary-base text-white'
                      : 'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-soft-200'
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
            <div className="flex size-32 mx-auto items-center justify-center rounded-10 bg-white border border-stroke-soft-200 mb-3">
              <QrCode weight="duotone" className="size-16 text-text-soft-400" />
            </div>
            <p className="text-paragraph-sm text-text-sub-600">
              Scan with any UPI app to pay {amount ? formatCurrency(Number(amount)) : '₹0'}
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
            {isLoading ? 'Processing...' : 'Send Payment Request'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Withdrawal Modal
// ============================================

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
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
  const [amount, setAmount] = React.useState('')
  const [selectedBank, setSelectedBank] = React.useState(
    bankAccounts.find((b) => b.isDefault)?.id || bankAccounts[0]?.id || ''
  )

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`
  }

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
            <div className="text-label-lg text-text-strong-950">{formatCurrency(availableBalance)}</div>
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
                      'flex items-start gap-3 p-3 rounded-10 border cursor-pointer transition-colors',
                      selectedBank === account.id
                        ? 'border-primary-base bg-primary-alpha-10'
                        : 'border-stroke-soft-200 hover:bg-bg-weak-50'
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
                        {account.accountHolder}
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
                <span className="text-text-strong-950">{amount ? formatCurrency(Number(amount)) : '₹0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-sub-600">Processing Fee</span>
                <span className="text-text-strong-950">₹0</span>
              </div>
              <div className="border-t border-stroke-soft-200 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-text-strong-950">You will receive</span>
                  <span className="text-primary-base">{amount ? formatCurrency(Number(amount)) : '₹0'}</span>
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
            {isLoading ? 'Processing...' : 'Request Withdrawal'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Credit Limit Request Modal
// ============================================

interface CreditLimitRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLimit: number
  onConfirm: (requestedLimit: number, reason: string) => void
  isLoading?: boolean
}

export function CreditLimitRequestModal({
  open,
  onOpenChange,
  currentLimit,
  onConfirm,
  isLoading = false,
}: CreditLimitRequestModalProps) {
  const [requestedLimit, setRequestedLimit] = React.useState('')
  const [reason, setReason] = React.useState('')

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`
  }

  const handleConfirm = () => {
    onConfirm(Number(requestedLimit), reason)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <Modal.Title>Request Credit Limit Increase</Modal.Title>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <div className="rounded-10 bg-bg-weak-50 p-3">
            <span className="text-paragraph-sm text-text-sub-600">Current Credit Limit:</span>
            <div className="text-label-lg text-text-strong-950">{formatCurrency(currentLimit)}</div>
          </div>

          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Requested Credit Limit <span className="text-error-base">*</span>
            </label>
            <Input.Root>
              <Input.Wrapper>
                <span className="pl-3 text-text-sub-600">₹</span>
                <Input.El
                  type="number"
                  placeholder="2,50,000"
                  value={requestedLimit}
                  onChange={(e) => setRequestedLimit(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Reason for Request <span className="text-error-base">*</span>
            </label>
            <Textarea.Root
              placeholder="We are planning to run multiple large campaigns during the upcoming festive season and need additional credit to support higher enrollment volumes."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-start gap-2 text-paragraph-xs text-text-soft-400">
            <RiInformationLine className="size-4 shrink-0" />
            <span>
              Credit limit increases are reviewed within 2-3 business days. You'll receive an email notification once a decision is made.
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="primary"
            onClick={handleConfirm}
            disabled={!requestedLimit || !reason.trim() || isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// ============================================
// Invite Team Member Modal
// ============================================

interface InviteTeamMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (email: string, role: string) => void
  isLoading?: boolean
}

export function InviteTeamMemberModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: InviteTeamMemberModalProps) {
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState('viewer')

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full access except owner actions' },
    { value: 'manager', label: 'Manager', description: 'Manage campaigns and enrollments' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access' },
  ]

  const handleConfirm = () => {
    onConfirm(email, role)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content className="max-w-md">
        <Modal.Header>
          <Modal.Title>Invite Team Member</Modal.Title>
          <Modal.Description>
            Send an invitation to join your organization
          </Modal.Description>
        </Modal.Header>
        <Modal.Body className="space-y-4">
          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Email Address <span className="text-error-base">*</span>
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Role <span className="text-error-base">*</span>
            </label>
            <Radio.Group value={role} onValueChange={setRole}>
              <div className="space-y-2">
                {roles.map((r) => (
                  <label
                    key={r.value}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-10 border cursor-pointer transition-colors',
                      role === r.value
                        ? 'border-primary-base bg-primary-alpha-10'
                        : 'border-stroke-soft-200 hover:bg-bg-weak-50'
                    )}
                  >
                    <Radio.Item value={r.value} className="mt-0.5" />
                    <div>
                      <div className="text-label-sm text-text-strong-950">{r.label}</div>
                      <div className="text-paragraph-xs text-text-sub-600">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Radio.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="primary"
            onClick={handleConfirm}
            disabled={!email || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

