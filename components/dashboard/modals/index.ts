/**
 * Dashboard Modals - Centralized Exports
 */

// Confirmation modals
export { ConfirmationModal } from "./confirmation-modal"
export type { ConfirmationModalProps } from "./confirmation-modal"

// Enrollment modals
export { ApproveEnrollmentModal } from "./approve-enrollment-modal"
export { RejectEnrollmentModal } from "./reject-enrollment-modal"
export { RequestChangesModal } from "./request-changes-modal"
export { ExtendDeadlineModal } from "./extend-deadline-modal"

// Campaign modals
export { DeleteCampaignModal } from "./delete-campaign-modal"
export { CampaignStatusModal } from "./campaign-status-modal"
export type { CampaignStatusAction } from "./campaign-status-modal"

// Wallet/Financial modals
export { AddFundsModal } from "./add-funds-modal"
export { WithdrawalModal, WithdrawalRequestModal } from "./withdrawal-modal"
export { CreditLimitRequestModal } from "./credit-limit-modal"

// Team modals
export { InviteTeamMemberModal } from "./invite-team-member-modal"
export { DeleteBankAccountModal } from "./delete-bank-account-modal"

// Product modals
export { DeleteProductModal } from "./delete-product-modal"

// Utility modals
export { ExportDataModal } from "./export-data-modal"
export { SessionTimeoutModal } from "./session-timeout-modal"
export { UnsavedChangesModal } from "./unsaved-changes-modal"
