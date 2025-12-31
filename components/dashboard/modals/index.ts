/**
 * Dashboard Modals - Centralized Exports
 *
 * Modals are split into logical groups for better code splitting:
 * - confirmation: Base confirmation and generic modals
 * - enrollment: Enrollment-specific modals (approve, reject, request changes)
 * - campaign: Campaign-related modals (delete, status change)
 * - wallet: Financial modals (add funds, withdrawal, credit)
 * - team: Team management modals (invite, delete bank account)
 */

// Confirmation modals
export { ConfirmationModal } from "./confirmation-modal"
export type { ConfirmationModalProps } from "./confirmation-modal"

// Enrollment modals
export { ApproveEnrollmentModal } from "./enrollment/approve-enrollment-modal"
export { RejectEnrollmentModal } from "./enrollment/reject-enrollment-modal"
export { RequestChangesModal } from "./enrollment/request-changes-modal"
export { ExtendDeadlineModal } from "./enrollment/extend-deadline-modal"

// Campaign modals
export { DeleteCampaignModal } from "./campaign/delete-campaign-modal"
export { CampaignStatusModal } from "./campaign/campaign-status-modal"
export type { CampaignStatusAction } from "./campaign/campaign-status-modal"

// Wallet/Financial modals
export { AddFundsModal } from "./wallet/add-funds-modal"
export { WithdrawalModal, WithdrawalRequestModal } from "./wallet/withdrawal-modal"
export { CreditLimitRequestModal } from "./wallet/credit-limit-modal"

// Team modals
export { InviteTeamMemberModal } from "./team/invite-team-member-modal"
export { DeleteBankAccountModal } from "./team/delete-bank-account-modal"
