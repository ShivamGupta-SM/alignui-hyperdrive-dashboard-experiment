import { z } from "zod"

/**
 * Form Validation Schemas
 * Centralized Zod schemas for form validation
 * 
 * ⚠️ SINGLE SOURCE OF TRUTH: All validation constants are defined here
 * Import these constants instead of hardcoding values elsewhere
 */

// ==========================================
// VALIDATION CONSTANTS (SINGLE SOURCE OF TRUTH)
// ==========================================

export const VALIDATION_CONSTANTS = {
	// Password
	PASSWORD_MIN_LENGTH: 12,
	PASSWORD_MAX_LENGTH: 128,
	PASSWORD_SIMPLE_MIN_LENGTH: 6,
	
	// Names
	NAME_MIN_LENGTH: 2,
	NAME_MAX_LENGTH: 255,
	
	// Organization
	ORG_NAME_MIN_LENGTH: 2,
	ORG_NAME_MAX_LENGTH: 255,
	ORG_DESCRIPTION_MAX_LENGTH: 2000,
	CONTACT_PERSON_MAX_LENGTH: 255,
	
	// Product
	PRODUCT_NAME_MIN_LENGTH: 2,
	PRODUCT_NAME_MAX_LENGTH: 500,
	PRODUCT_DESCRIPTION_MAX_LENGTH: 5000,
	PRODUCT_SKU_MIN_LENGTH: 1,
	PRODUCT_SKU_MAX_LENGTH: 100,
	
	// Campaign
	CAMPAIGN_TITLE_MIN_LENGTH: 3,
	CAMPAIGN_TITLE_MAX_LENGTH: 255,
	CAMPAIGN_DESCRIPTION_MAX_LENGTH: 5000,
	MAX_ENROLLMENTS_MIN: 1,
	MAX_ENROLLMENTS_MAX: 1000000,
	SUBMISSION_DEADLINE_MIN_DAYS: 1,
	SUBMISSION_DEADLINE_MAX_DAYS: 90,
	
	// Address
	ADDRESS_MIN_LENGTH: 5,
	ADDRESS_MAX_LENGTH: 500,
	CITY_MIN_LENGTH: 2,
	CITY_MAX_LENGTH: 100,
	STATE_MAX_LENGTH: 100,
	PIN_CODE_LENGTH: 6,
	
	// URLs
	URL_MAX_LENGTH: 2048,
	
	// Phone
	PHONE_REGEX: /^(\+91)?[6-9]\d{9}$/,
	
	// PIN Code
	PIN_CODE_REGEX: /^[1-9]\d{5}$/,
	
	// IFSC Code
	IFSC_CODE_REGEX: /^[A-Z]{4}0[A-Z0-9]{6}$/,
	
	// GST Number
	GST_NUMBER_REGEX: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
	
	// PAN Number (for shoppers only)
	PAN_NUMBER_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
	
	// Bank Account
	BANK_ACCOUNT_NUMBER_MIN_LENGTH: 5,
	BANK_ACCOUNT_NUMBER_MAX_LENGTH: 30,
	BANK_NAME_MAX_LENGTH: 255,
	ACCOUNT_HOLDER_NAME_MAX_LENGTH: 255,
	
	// Industry
	INDUSTRY_CATEGORY_MAX_LENGTH: 100,
	
	// CIN Number
	CIN_NUMBER_MAX_LENGTH: 21,
	
	// Wallet
	MIN_WITHDRAWAL_AMOUNT: 1000,
	MIN_ADD_FUNDS_AMOUNT: 100,
	CREDIT_REQUEST_MIN: 10000,
	CREDIT_REQUEST_MAX: 500000,
	CREDIT_LIMIT_REQUEST_MIN: 100000,
	CREDIT_LIMIT_REQUEST_MAX: 10000000,
	
	// 2FA
	TWO_FA_CODE_LENGTH: 6,
	
	// Messages & Notes
	MESSAGE_MAX_LENGTH: 200,
	NOTES_MAX_LENGTH: 500,
	REASON_MAX_LENGTH: 1000,
} as const

// ==========================================
// EMAIL VALIDATION
// ==========================================

export const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Please enter a valid email address")

// ==========================================
// PASSWORD VALIDATION
// ==========================================

export const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(VALIDATION_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
	.max(VALIDATION_CONSTANTS.PASSWORD_MAX_LENGTH, `Password must be less than ${VALIDATION_CONSTANTS.PASSWORD_MAX_LENGTH} characters`)
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")

export const simplePasswordSchema = z
	.string()
	.min(1, "Password is required")
	.min(VALIDATION_CONSTANTS.PASSWORD_SIMPLE_MIN_LENGTH, `Password must be at least ${VALIDATION_CONSTANTS.PASSWORD_SIMPLE_MIN_LENGTH} characters`)

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const signInSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().optional(),
})

export const signUpSchema = z
	.object({
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})

export const forgotPasswordSchema = z.object({
	email: emailSchema,
})

export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "New password must be different from current password",
		path: ["newPassword"],
	})

// ==========================================
// ORGANIZATION SCHEMAS
// ==========================================

/**
 * @deprecated Use `updateOrganizationBodySchema` or `onboardingFormSchema.basicInfo` instead
 * This schema is kept for backward compatibility but is not actively used
 */
export const organizationSchema = z.object({
	name: z
		.string()
		.min(1, "Organization name is required")
		.min(VALIDATION_CONSTANTS.ORG_NAME_MIN_LENGTH, `Organization name must be at least ${VALIDATION_CONSTANTS.ORG_NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.ORG_NAME_MAX_LENGTH, `Organization name must be less than ${VALIDATION_CONSTANTS.ORG_NAME_MAX_LENGTH} characters`),
	website: z.string().url("Please enter a valid URL").max(VALIDATION_CONSTANTS.URL_MAX_LENGTH, `URL must be less than ${VALIDATION_CONSTANTS.URL_MAX_LENGTH} characters`).optional().or(z.literal("")),
})

// ==========================================
// PRODUCT SCHEMAS
// ==========================================

/**
 * @deprecated Use `productFormSchema` instead
 * This schema is kept for backward compatibility but is not actively used
 */
export const productSchema = z.object({
	name: z
		.string()
		.min(1, "Product name is required")
		.min(VALIDATION_CONSTANTS.PRODUCT_NAME_MIN_LENGTH, `Product name must be at least ${VALIDATION_CONSTANTS.PRODUCT_NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.PRODUCT_NAME_MAX_LENGTH, `Product name must be less than ${VALIDATION_CONSTANTS.PRODUCT_NAME_MAX_LENGTH} characters`),
	description: z.string().max(VALIDATION_CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH} characters`).optional(),
	category: z.string().min(1, "Category is required"),
	platform: z.string().min(1, "Platform is required"),
	productUrl: z.string().url("Please enter a valid URL").max(VALIDATION_CONSTANTS.URL_MAX_LENGTH, `URL must be less than ${VALIDATION_CONSTANTS.URL_MAX_LENGTH} characters`).optional().or(z.literal("")),
})

// Product form schema for create/update (matches API)
export const productFormSchema = z.object({
	name: z
		.string()
		.min(1, "Product name is required")
		.min(VALIDATION_CONSTANTS.PRODUCT_NAME_MIN_LENGTH, `Product name must be at least ${VALIDATION_CONSTANTS.PRODUCT_NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.PRODUCT_NAME_MAX_LENGTH, `Product name must be less than ${VALIDATION_CONSTANTS.PRODUCT_NAME_MAX_LENGTH} characters`),
	description: z.string().max(VALIDATION_CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH} characters`).optional(),
	brand: z
		.string()
		.min(1, "Brand is required")
		.min(VALIDATION_CONSTANTS.NAME_MIN_LENGTH, `Brand must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`)
		.max(100, "Brand must be less than 100 characters")
		.optional(),
	categoryId: z.string().min(1, "Category is required").optional(),
	platformId: z.string().min(1, "Platform is required").optional(),
	productLink: z.string().url("Please enter a valid URL").max(VALIDATION_CONSTANTS.URL_MAX_LENGTH, `URL must be less than ${VALIDATION_CONSTANTS.URL_MAX_LENGTH} characters`).optional().or(z.literal("")),
	price: z.number().min(0, "Price must be positive").optional(),
	sku: z
		.string()
		.min(VALIDATION_CONSTANTS.PRODUCT_SKU_MIN_LENGTH, `SKU must be at least ${VALIDATION_CONSTANTS.PRODUCT_SKU_MIN_LENGTH} character`)
		.max(VALIDATION_CONSTANTS.PRODUCT_SKU_MAX_LENGTH, `SKU must be less than ${VALIDATION_CONSTANTS.PRODUCT_SKU_MAX_LENGTH} characters`)
		.optional(),
})

// ==========================================
// CAMPAIGN SCHEMAS
// ==========================================

export const campaignSchema = z
	.object({
		title: z
			.string()
			.min(1, "Campaign title is required")
			.min(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH, `Campaign title must be at least ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH, `Campaign title must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH} characters`),
		description: z.string().max(VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH} characters`).optional(),
		productId: z.string().min(1, "Product is required"),
		type: z.enum(["cashback", "barter", "hybrid"]),
		startDate: z.date({ message: "Start date is required" }),
		endDate: z.date({ message: "End date is required" }),
		maxEnrollments: z
			.number()
			.min(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN, `Maximum enrollments must be at least ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN}`)
			.max(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX, `Maximum enrollments must be less than ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX.toLocaleString()}`),
		billRate: z
			.number()
			.min(0, "Bill rate must be positive")
			.max(100, "Bill rate must be less than 100%")
			.optional(),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: "End date must be after start date",
		path: ["endDate"],
	})

// Campaign form schema for multi-step form (matches form structure)
export const campaignFormSchema = z
	.object({
		productId: z.string().min(1, "Please select a product"),
		title: z
			.string()
			.min(1, "Campaign title is required")
			.min(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH, `Campaign title must be at least ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH, `Campaign title must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH} characters`),
		description: z
			.string()
			.max(VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH} characters`)
			.optional()
			.or(z.literal("")),
		type: z.enum(["cashback", "barter", "hybrid"], {
			message: "Please select a campaign type",
		}),
		isPublic: z.boolean(),
		startDate: z.date({
			message: "Please select a valid start date",
		}),
		endDate: z.date({
			message: "Please select a valid end date",
		}),
		maxEnrollments: z
			.number({
				message: "Please enter a valid number",
			})
			.int("Maximum enrollments must be a whole number")
			.min(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN, `Maximum enrollments must be at least ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN}`)
			.max(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX, `Maximum enrollments must be less than ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX.toLocaleString()}`),
		submissionDeadlineDays: z
			.number({
				message: "Please enter a valid number",
			})
			.int("Submission deadline must be a whole number")
			.min(VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MIN_DAYS, `Submission deadline must be at least ${VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MIN_DAYS} day`)
			.max(VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS, `Submission deadline must be less than ${VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS} days`),
		deliverables: z
			.array(
				z.object({
					id: z.string(),
					type: z.string().min(1, "Deliverable type is required"),
					title: z
						.string()
						.min(1, "Deliverable title is required")
						.max(VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH, `Title must be less than ${VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH} characters`),
					isRequired: z.boolean(),
					instructions: z
						.string()
						.max(VALIDATION_CONSTANTS.NOTES_MAX_LENGTH, `Instructions must be less than ${VALIDATION_CONSTANTS.NOTES_MAX_LENGTH} characters`)
						.optional()
						.or(z.literal("")),
				})
			)
			.min(1, "At least one deliverable is required"),
		terms: z.array(z.string()).optional(),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: "End date must be after start date",
		path: ["endDate"],
	})
	.refine(
		(data) => {
			// At least one required deliverable
			return data.deliverables.some((d) => d.isRequired)
		},
		{
			message: "At least one deliverable must be marked as required",
			path: ["deliverables"],
		}
	)

// ==========================================
// API REQUEST BODY SCHEMAS
// ==========================================

export const campaignStatusSchema = z.enum([
	"draft",
	"pending_approval",
	"rejected",
	"approved",
	"active",
	"paused",
	"ended",
	"expired",
	"completed",
	"cancelled",
	"archived",
])

export const enrollmentStatusSchema = z.enum([
	"enrolled",
	"awaiting_submission",
	"awaiting_review",
	"changes_requested",
	"approved",
	"rejected",
	"withdrawn",
	"expired",
])

export const createCampaignBodySchema = z.object({
	title: z
		.string()
		.min(1, "Campaign title is required")
		.min(3, "Campaign title must be at least 3 characters")
		.max(VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH, `Campaign title must be less than ${VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH} characters`),
	description: z.string().max(VALIDATION_CONSTANTS.REASON_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.REASON_MAX_LENGTH} characters`).optional(),
	productId: z.string().min(1, "Product is required"),
	type: z.enum(["cashback", "barter", "hybrid"]),
	isPublic: z.boolean(),
	maxEnrollments: z
		.number()
		.int()
		.min(1, "Maximum enrollments must be at least 1")
		.max(VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX, `Maximum enrollments must be less than ${VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX.toLocaleString()}`),
	submissionDeadlineDays: z
		.number()
		.int()
		.min(1, "Submission deadline must be at least 1 day")
		.max(VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS, `Submission deadline must be less than ${VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS} days`),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
})

export const updateCampaignBodySchema = createCampaignBodySchema.partial().extend({
	status: campaignStatusSchema.optional(),
})

export const updateEnrollmentBodySchema = z.object({
	status: enrollmentStatusSchema,
	reason: z.string().max(VALIDATION_CONSTANTS.NOTES_MAX_LENGTH, `Reason must be less than ${VALIDATION_CONSTANTS.NOTES_MAX_LENGTH} characters`).optional(),
})

export const bulkUpdateEnrollmentBodySchema = z.object({
	ids: z.array(z.string().min(1)).min(1, "At least one enrollment ID is required"),
	status: enrollmentStatusSchema,
	reason: z.string().max(VALIDATION_CONSTANTS.NOTES_MAX_LENGTH, `Reason must be less than ${VALIDATION_CONSTANTS.NOTES_MAX_LENGTH} characters`).optional(),
})

// Wallet schemas for API
export const withdrawalBodySchema = z.object({
	amount: z.number().min(VALIDATION_CONSTANTS.MIN_WITHDRAWAL_AMOUNT, `Minimum withdrawal amount is ₹${VALIDATION_CONSTANTS.MIN_WITHDRAWAL_AMOUNT.toLocaleString()}`),
	notes: z.string().max(VALIDATION_CONSTANTS.NOTES_MAX_LENGTH, `Notes must be less than ${VALIDATION_CONSTANTS.NOTES_MAX_LENGTH} characters`).optional(),
	bankAccountId: z.string().optional(), // Backend handles this, but UI might send it
})

export const addFundsBodySchema = z.object({
	amount: z.number().min(VALIDATION_CONSTANTS.MIN_ADD_FUNDS_AMOUNT, `Minimum amount is ₹${VALIDATION_CONSTANTS.MIN_ADD_FUNDS_AMOUNT}`),
	paymentMethod: z.enum(["upi", "netbanking", "card"]),
})

export const creditRequestBodySchema = z.object({
	amount: z
		.number()
		.min(VALIDATION_CONSTANTS.CREDIT_REQUEST_MIN, `Minimum credit request is ₹${VALIDATION_CONSTANTS.CREDIT_REQUEST_MIN.toLocaleString()}`)
		.max(VALIDATION_CONSTANTS.CREDIT_REQUEST_MAX, `Maximum credit request is ₹${VALIDATION_CONSTANTS.CREDIT_REQUEST_MAX.toLocaleString()}`),
	reason: z
		.string()
		.min(10, "Please provide a reason")
		.max(VALIDATION_CONSTANTS.NOTES_MAX_LENGTH, `Reason must be less than ${VALIDATION_CONSTANTS.NOTES_MAX_LENGTH} characters`),
})

// Settings schemas for API
export const updateProfileBodySchema = z.object({
	name: z
		.string()
		.min(VALIDATION_CONSTANTS.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION_CONSTANTS.NAME_MAX_LENGTH} characters`),
	phone: z
		.string()
		.regex(VALIDATION_CONSTANTS.PHONE_REGEX, "Please enter a valid 10-digit phone number (with or without +91)")
		.optional(),
	image: z.string().url().max(VALIDATION_CONSTANTS.URL_MAX_LENGTH, `URL must be less than ${VALIDATION_CONSTANTS.URL_MAX_LENGTH} characters`).optional().or(z.literal("")),
})

export const updateOrganizationBodySchema = z.object({
	name: z
		.string()
		.min(VALIDATION_CONSTANTS.ORG_NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_CONSTANTS.ORG_NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.ORG_NAME_MAX_LENGTH, `Name must be less than ${VALIDATION_CONSTANTS.ORG_NAME_MAX_LENGTH} characters`),
	website: z.string().url("Invalid URL").max(VALIDATION_CONSTANTS.URL_MAX_LENGTH, `URL must be less than ${VALIDATION_CONSTANTS.URL_MAX_LENGTH} characters`).optional().or(z.literal("")),
	email: z.string().email("Invalid email").optional(),
	phone: z
		.string()
		.regex(VALIDATION_CONSTANTS.PHONE_REGEX, "Please enter a valid 10-digit phone number (with or without +91)")
		.optional(),
	address: z.string().max(VALIDATION_CONSTANTS.ADDRESS_MAX_LENGTH, `Address must be less than ${VALIDATION_CONSTANTS.ADDRESS_MAX_LENGTH} characters`).optional(),
	industry: z.string().max(VALIDATION_CONSTANTS.INDUSTRY_CATEGORY_MAX_LENGTH, `Industry must be less than ${VALIDATION_CONSTANTS.INDUSTRY_CATEGORY_MAX_LENGTH} characters`).optional(),
})

export const updatePasswordBodySchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(VALIDATION_CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_CONSTANTS.PASSWORD_MIN_LENGTH} characters`).max(VALIDATION_CONSTANTS.PASSWORD_MAX_LENGTH, `Password must be less than ${VALIDATION_CONSTANTS.PASSWORD_MAX_LENGTH} characters`),
})

export const bankAccountBodySchema = z.object({
	bankName: z
		.string()
		.min(1, "Bank name is required")
		.min(VALIDATION_CONSTANTS.NAME_MIN_LENGTH, `Bank name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.BANK_NAME_MAX_LENGTH, `Bank name must be less than ${VALIDATION_CONSTANTS.BANK_NAME_MAX_LENGTH} characters`),
	accountNumber: z
		.string()
		.min(1, "Account number is required")
		.min(VALIDATION_CONSTANTS.BANK_ACCOUNT_NUMBER_MIN_LENGTH, `Account number must be at least ${VALIDATION_CONSTANTS.BANK_ACCOUNT_NUMBER_MIN_LENGTH} digits`)
		.max(VALIDATION_CONSTANTS.BANK_ACCOUNT_NUMBER_MAX_LENGTH, `Account number must be less than ${VALIDATION_CONSTANTS.BANK_ACCOUNT_NUMBER_MAX_LENGTH} characters`)
		.regex(/^\d+$/, "Account number must contain only digits"),
	accountHolderName: z
		.string()
		.min(1, "Account holder name is required")
		.min(VALIDATION_CONSTANTS.NAME_MIN_LENGTH, `Account holder name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.ACCOUNT_HOLDER_NAME_MAX_LENGTH, `Account holder name must be less than ${VALIDATION_CONSTANTS.ACCOUNT_HOLDER_NAME_MAX_LENGTH} characters`),
	ifscCode: z
		.string()
		.min(1, "IFSC code is required")
		.regex(VALIDATION_CONSTANTS.IFSC_CODE_REGEX, "Invalid IFSC code format (e.g., HDFC0001234)")
		.transform((val) => val.toUpperCase()),
	accountType: z.enum(["current", "savings"], {
		message: "Please select account type",
	}),
	isDefault: z.boolean(),
})

export const verify2FABodySchema = z.object({
	code: z
		.string()
		.length(VALIDATION_CONSTANTS.TWO_FA_CODE_LENGTH, `Code must be ${VALIDATION_CONSTANTS.TWO_FA_CODE_LENGTH} digits`)
		.regex(/^\d+$/, "Code must contain only numbers"),
})

// Type exports for API schemas
export type CreateCampaignBody = z.infer<typeof createCampaignBodySchema>
export type UpdateCampaignBody = z.infer<typeof updateCampaignBodySchema>
export type UpdateEnrollmentBody = z.infer<typeof updateEnrollmentBodySchema>
export type BulkUpdateEnrollmentBody = z.infer<typeof bulkUpdateEnrollmentBodySchema>
export type WithdrawalBody = z.infer<typeof withdrawalBodySchema>
export type AddFundsBody = z.infer<typeof addFundsBodySchema>
export type CreditRequestBody = z.infer<typeof creditRequestBodySchema>
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationBodySchema>
export type UpdatePasswordBody = z.infer<typeof updatePasswordBodySchema>
export type BankAccountBody = z.infer<typeof bankAccountBodySchema>
export type Verify2FABody = z.infer<typeof verify2FABodySchema>

// ==========================================
// ONBOARDING SCHEMAS
// ==========================================

export const onboardingFormSchema = z.object({
	basicInfo: z.object({
		name: z
			.string()
			.min(1, "Organization name is required")
			.min(VALIDATION_CONSTANTS.ORG_NAME_MIN_LENGTH, `Organization name must be at least ${VALIDATION_CONSTANTS.ORG_NAME_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.ORG_NAME_MAX_LENGTH, `Organization name must be less than ${VALIDATION_CONSTANTS.ORG_NAME_MAX_LENGTH} characters`),
		description: z.string().max(VALIDATION_CONSTANTS.ORG_DESCRIPTION_MAX_LENGTH, `Description must be less than ${VALIDATION_CONSTANTS.ORG_DESCRIPTION_MAX_LENGTH} characters`).optional(),
		website: z.string().url("Please enter a valid URL").max(VALIDATION_CONSTANTS.URL_MAX_LENGTH, `URL must be less than ${VALIDATION_CONSTANTS.URL_MAX_LENGTH} characters`).optional().or(z.literal("")),
	}),
	businessDetails: z.object({
		// Uses backend values directly - no mapping needed
		businessType: z.enum(
			["pvt_ltd", "public_ltd", "llp", "partnership", "proprietorship"],
			{
				message: "Please select a business type",
			}
		),
		industryCategory: z.string().min(1, "Industry category is required").max(VALIDATION_CONSTANTS.INDUSTRY_CATEGORY_MAX_LENGTH, `Industry category must be less than ${VALIDATION_CONSTANTS.INDUSTRY_CATEGORY_MAX_LENGTH} characters`),
		contactPerson: z
			.string()
			.min(1, "Contact person name is required")
			.min(VALIDATION_CONSTANTS.NAME_MIN_LENGTH, `Contact person name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.CONTACT_PERSON_MAX_LENGTH, `Contact person name must be less than ${VALIDATION_CONSTANTS.CONTACT_PERSON_MAX_LENGTH} characters`),
		phone: z
			.string()
			.min(1, "Phone number is required")
			.regex(VALIDATION_CONSTANTS.PHONE_REGEX, "Please enter a valid 10-digit phone number (with or without +91)"),
		address: z
			.string()
			.min(1, "Address is required")
			.min(VALIDATION_CONSTANTS.ADDRESS_MIN_LENGTH, `Address must be at least ${VALIDATION_CONSTANTS.ADDRESS_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.ADDRESS_MAX_LENGTH, `Address must be less than ${VALIDATION_CONSTANTS.ADDRESS_MAX_LENGTH} characters`),
		city: z
			.string()
			.min(1, "City is required")
			.min(VALIDATION_CONSTANTS.CITY_MIN_LENGTH, `City must be at least ${VALIDATION_CONSTANTS.CITY_MIN_LENGTH} characters`)
			.max(VALIDATION_CONSTANTS.CITY_MAX_LENGTH, `City must be less than ${VALIDATION_CONSTANTS.CITY_MAX_LENGTH} characters`),
		state: z.string().min(1, "State is required").max(VALIDATION_CONSTANTS.STATE_MAX_LENGTH, `State must be less than ${VALIDATION_CONSTANTS.STATE_MAX_LENGTH} characters`),
		pinCode: z
			.string()
			.min(1, "PIN code is required")
			.regex(VALIDATION_CONSTANTS.PIN_CODE_REGEX, `PIN code must be ${VALIDATION_CONSTANTS.PIN_CODE_LENGTH} digits (first digit must be 1-9)`),
	}),
	verification: z
		.object({
			gstNumber: z
				.string()
				.min(1, "GST number is required")
				.regex(
					VALIDATION_CONSTANTS.GST_NUMBER_REGEX,
				"Invalid GST number format (15 characters: 2 digits + 10 char PAN + 1 entity + 1 char + 1 checksum)"
			),
		gstVerified: z.boolean(),
		// ❌ REMOVED: PAN validation - PAN is only for shoppers, not organizations
		cinNumber: z.string().max(VALIDATION_CONSTANTS.CIN_NUMBER_MAX_LENGTH, `CIN number must be less than ${VALIDATION_CONSTANTS.CIN_NUMBER_MAX_LENGTH} characters`).optional(),
		})
		.refine((data) => data.gstVerified === true, {
			message: "GST verification is mandatory",
			path: ["gstVerified"],
		}),
})

// ==========================================
// WALLET SCHEMAS
// ==========================================

export const creditRequestSchema = z.object({
	requestedLimit: z
		.number()
		.min(VALIDATION_CONSTANTS.CREDIT_LIMIT_REQUEST_MIN, `Minimum credit limit request is ₹${VALIDATION_CONSTANTS.CREDIT_LIMIT_REQUEST_MIN.toLocaleString()}`)
		.max(VALIDATION_CONSTANTS.CREDIT_LIMIT_REQUEST_MAX, `Maximum credit limit request is ₹${VALIDATION_CONSTANTS.CREDIT_LIMIT_REQUEST_MAX.toLocaleString()}`),
	reason: z
		.string()
		.min(20, "Please provide a detailed reason (at least 20 characters)")
		.max(VALIDATION_CONSTANTS.REASON_MAX_LENGTH, `Reason must be less than ${VALIDATION_CONSTANTS.REASON_MAX_LENGTH} characters`),
})

// ==========================================
// TEAM SCHEMAS
// ==========================================

export const inviteMemberSchema = z.object({
	email: emailSchema,
	role: z.enum(["owner", "admin", "manager", "viewer", "member"], {
		message: "Please select a role",
	}),
	message: z
		.string()
		.max(VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH, `Message must be less than ${VALIDATION_CONSTANTS.MESSAGE_MAX_LENGTH} characters`)
		.optional()
		.or(z.literal("")),
})

// ==========================================
// PROFILE SCHEMAS
// ==========================================

export const profileSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.min(VALIDATION_CONSTANTS.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_CONSTANTS.NAME_MIN_LENGTH} characters`)
		.max(VALIDATION_CONSTANTS.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION_CONSTANTS.NAME_MAX_LENGTH} characters`),
	email: emailSchema,
})

// ==========================================
// UTILITY TYPES
// ==========================================

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type OrganizationFormData = z.infer<typeof organizationSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type ProductFormInput = z.infer<typeof productFormSchema>
export type CampaignFormData = z.infer<typeof campaignSchema>
export type CampaignFormInput = z.infer<typeof campaignFormSchema>
export type OnboardingFormInput = z.infer<typeof onboardingFormSchema>
export type CreditRequestFormData = z.infer<typeof creditRequestSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>

// ==========================================
// API QUERY PARAMETER SCHEMAS
// ==========================================

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const campaignQuerySchema = paginationSchema.extend({
	status: z
		.enum([
			"all",
			"draft",
			"pending_approval",
			"rejected",
			"approved",
			"active",
			"paused",
			"ended",
			"expired",
			"completed",
			"cancelled",
			"archived",
		])
		.optional(),
	search: z.string().optional(),
})

export const enrollmentQuerySchema = paginationSchema.extend({
	status: z
		.enum([
			"all",
			"enrolled",
			"awaiting_submission",
			"awaiting_review",
			"changes_requested",
			"approved",
			"rejected",
			"withdrawn",
			"expired",
		])
		.optional(),
	campaignId: z.string().optional(),
	search: z.string().optional(),
})

export const invoiceQuerySchema = paginationSchema.extend({
	status: z.enum(["all", "pending", "paid", "overdue", "cancelled"]).optional(),
})

export const walletQuerySchema = paginationSchema.extend({
	type: z
		.enum([
			"all",
			"credit",
			"hold_created",
			"hold_committed",
			"hold_voided",
			"withdrawal",
			"refund",
		])
		.optional(),
})

/**
 * Parse and validate query parameters from URLSearchParams
 */
export function parseQueryParams<T extends z.ZodSchema>(
	schema: T,
	searchParams: URLSearchParams
): z.infer<T> {
	const params = Object.fromEntries(searchParams.entries())
	return schema.parse(params)
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validate a value against a schema and return errors
 */
export function validateField<T>(
	schema: z.ZodSchema<T>,
	value: unknown
): { valid: boolean; error?: string } {
	const result = schema.safeParse(value)
	if (result.success) {
		return { valid: true }
	}
	return { valid: false, error: result.error.issues?.[0]?.message ?? result.error.message }
}

/**
 * Get password strength
 */
export function getPasswordStrength(password: string): {
	score: number
	label: "weak" | "fair" | "good" | "strong"
	color: "red" | "orange" | "yellow" | "green"
} {
	let score = 0

	if (password.length >= VALIDATION_CONSTANTS.PASSWORD_MIN_LENGTH) score++
	if (password.length >= 16) score++
	if (/[A-Z]/.test(password)) score++
	if (/[a-z]/.test(password)) score++
	if (/[0-9]/.test(password)) score++
	if (/[^A-Za-z0-9]/.test(password)) score++

	if (score <= 2) return { score, label: "weak", color: "red" }
	if (score <= 3) return { score, label: "fair", color: "orange" }
	if (score <= 4) return { score, label: "good", color: "yellow" }
	return { score, label: "strong", color: "green" }
}
