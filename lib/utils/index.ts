/**
 * Centralized utility exports
 * All utilities should be imported from @/lib/utils
 *
 * NOTE: Using named exports instead of `export *` for better tree-shaking
 */

// Primitive utilities (styling, polymorphism, React helpers)
export { cn } from "./primitives/cn"
export { tv, type VariantProps, type ClassValue } from "./primitives/tv"
export { recursiveCloneChildren } from "./primitives/recursive-clone-children"
export { getAvatarColor, type AvatarColor } from "./primitives/avatar-color"
export type {
	AsProp,
	PolymorphicComponentProps,
	PolymorphicComponentPropsWithRef,
	PolymorphicRef,
	Polymorphic,
} from "./primitives/polymorphic"

// Format utilities
export {
	formatCurrency,
	formatCurrencyCompact,
	formatDateShort,
	formatDateMedium,
	formatDateFull,
	formatDateWithWeekday,
	formatNumber,
	formatPercent,
	formatBytes,
} from "./format"

// Error utilities - SSOT from encore-error-handler
export { getErrorMessage } from "@/lib/errors/encore-error-handler"

// Validation utilities
export {
	BUSINESS_TYPES,
	INDUSTRY_CATEGORIES,
	STATUS_CHECKS,
	VALIDATION_CONSTANTS,
	ENROLLMENT_STATUSES,
	CAMPAIGN_TYPES,
	CAMPAIGN_STATUS_ACTION_VALUES,
	emailSchema,
	passwordSchema,
	simplePasswordSchema,
	signInSchema,
	signUpSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	changePasswordSchema,
	productFormSchema,
	campaignSchema,
	campaignFormSchema,
	campaignStatusSchema,
	campaignStatusActionSchema,
	enrollmentStatusSchema,
	organizationIdSchema,
	campaignIdSchema,
	createCampaignBodySchema,
	updateCampaignBodySchema,
	updateEnrollmentBodySchema,
	bulkUpdateEnrollmentBodySchema,
	withdrawalBodySchema,
	addFundsBodySchema,
	creditRequestBodySchema,
	updateProfileBodySchema,
	updateOrganizationBodySchema,
	updatePasswordBodySchema,
	bankAccountBodySchema,
	verify2FABodySchema,
	onboardingFormSchema,
	onboardingDraftSchema,
	creditRequestSchema,
	inviteMemberSchema,
	profileSchema,
	paginationSchema,
	campaignQuerySchema,
	enrollmentQuerySchema,
	invoiceQuerySchema,
	walletQuerySchema,
	parseQueryParams,
	validateField,
	getPasswordStrength,
} from "./validations"

export type {
	BusinessTypeValue,
	IndustryCategoryValue,
	ApprovalStatusValue,
	EnrollmentStatusValue,
	CampaignStatusActionValue,
	CreateCampaignBody,
	UpdateCampaignBody,
	UpdateEnrollmentBody,
	BulkUpdateEnrollmentBody,
	WithdrawalBody,
	AddFundsBody,
	CreditRequestBody,
	UpdateProfileBody,
	UpdateOrganizationBody,
	UpdatePasswordBody,
	BankAccountBody,
	Verify2FABody,
	SignInFormData,
	SignUpFormData,
	ForgotPasswordFormData,
	ResetPasswordFormData,
	ChangePasswordFormData,
	ProductFormInput,
	CampaignFormData,
	CampaignFormInput,
	OnboardingFormInput,
	OnboardingDraftData,
	CreditRequestFormData,
	ProfileFormData,
	InviteMemberFormData,
} from "./validations"

// URL validation utilities
export {
	validateCallbackUrl,
	validateCallbackUrlServer,
	getSafeRedirectUrl,
} from "./url-validation"

// Excel utilities (dynamically imported for bundle size)
export {
	exportToExcel,
	exportToCSV,
	generateExcelBuffer,
	exportCampaigns,
	exportEnrollments,
	exportInvoices,
	exportTransactions,
	parseExcelFile,
} from "./excel"

// Query configuration utilities
export {
	STALE_TIME,
	GC_TIME,
	REFETCH_INTERVAL,
	DEFAULT_PAGE_SIZE,
	PAGE_SIZE,
	SSR_PAGE_SIZE,
	DEFAULT_RETRY_COUNT,
	MAX_RETRY_DELAY_MS,
	DEFAULT_RETRY_CONFIG,
	toSkipTake,
	toPageLimit,
	createMutationErrorHandler,
	createQueryKeyFactory,
	createSearchableQueryKeyFactory,
	createStatsQueryKeyFactory,
	createGlobalQueryKeyFactory,
} from "./query-config"

export type {
	GcTimeKey,
	StaleTimeKey,
	RefetchIntervalKey,
	BaseQueryKeyFactory,
	ListFilters,
	SearchableQueryKeyFactory,
	StatsQueryKeyFactory,
	GlobalQueryKeyFactory,
} from "./query-config"

// Date utilities
export {
	getHoursAgo,
	getTimeAgo,
	formatTimeAgoShort,
	isOverdue,
	isEndingSoon,
	getDaysUntil,
	getDaysSince,
	isToday,
	isPast,
	isFuture,
	getDateRange,
	getWeekNumber,
	isDeadlineApproaching,
	getDeadlineStatus,
} from "./date"

// Optimistic update utilities
export {
	performOptimisticUpdate,
	performListItemOptimisticUpdate,
	performOptimisticDelete,
	performStatusChange,
} from "./optimistic-updates"

// Status validators (centralized - reduces duplicate validation logic)
export {
	createStatusValidator,
	isValidCampaignStatus,
	isValidEnrollmentStatus,
	isValidInvoiceStatus,
	isValidOrganizationStatus,
	parseStatusParam,
	isSpecificStatus,
} from "./validators"

// String utilities
export {
	capitalizeFirst,
	getInitial,
	toTitleCase,
	truncate,
} from "./string"
