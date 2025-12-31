// Dashboard Layout Components
export { Sidebar } from "./sidebar"
export { Header } from "./header"
export { DashboardShell } from "./dashboard-shell"
export { StatusBanner } from "./status-banner"

// Notifications
export { NotificationsDrawer } from "./notifications-drawer"
export { NotificationCenter } from "./notification-center"
export { CommandMenu } from "./command-menu"

// Cards
export { StatCard, WalletStatCard, statCardVariants } from "./stat-card"
export { CampaignCard, CampaignListItem } from "./campaign-card"
export { EnrollmentCard, EnrollmentTableRow, BillingBreakdown } from "./enrollment-card"

// Activity
export { ActivityFeed } from "./activity-feed"
export { EnrollmentTimeline } from "./enrollment-timeline"

// Guards & Error Handling
export { OrganizationGuard } from "./organization-guard"
export { ErrorBoundaryWrapper } from "./error-boundary-wrapper"

// Settings
export { SettingsPanel } from "./settings-panel"

// Team & Role Management
export { TeamsManagement } from "./teams-management"
export { RolesManagement } from "./roles-management"

// Novu Integration
export { NovuProvider } from "./novu-provider"
export { NovuInbox } from "./novu-inbox"
export { NovuPreferencesPanel as NovuPreferences } from "./novu-preferences"

// Modals
export {
	ConfirmationModal,
	ApproveEnrollmentModal,
	RejectEnrollmentModal,
	RequestChangesModal,
	ExtendDeadlineModal,
	AddFundsModal,
	WithdrawalModal,
	WithdrawalRequestModal,
	CreditLimitRequestModal,
	InviteTeamMemberModal,
	DeleteBankAccountModal,
	DeleteCampaignModal,
	CampaignStatusModal,
} from "./modals"
export type { ConfirmationModalProps, CampaignStatusAction } from "./modals"

// Loading Skeletons
export {
	Skeleton,
	StatCardSkeleton,
	CampaignCardSkeleton,
	EnrollmentCardSkeleton,
	TableSkeleton,
	TableRowSkeleton,
	ChartSkeleton,
	PageHeaderSkeleton,
	CardGridSkeleton,
	ListSkeleton,
	FormSkeleton,
	SidebarSkeleton,
	FullPageLoading,
	InlineLoading,
	DashboardPageLoading,
	CampaignsPageLoading,
	EnrollmentsPageLoading,
	SettingsPageLoading,
} from "./loading-skeletons"

// Empty States
export {
	WelcomeEmptyState,
	NoCampaignsEmptyState,
	NoPendingEnrollmentsEmptyState,
	NoProductsEmptyState,
	NoTeamMembersEmptyState,
	NoSearchResultsEmptyState,
	NoInvoicesEmptyState,
	NoNotificationsEmptyState,
	ErrorEmptyState,
	NetworkErrorEmptyState,
	PermissionDeniedEmptyState,
	NoWalletTransactionsEmptyState,
} from "./empty-states"

// Client Islands - Shared hydration-safe components
export {
	DashboardHeader,
	PriorityEnrollmentItem,
	LiveTimeDisplay,
} from "./client-islands"
export type { PendingEnrollment } from "./client-islands"
