"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Button from "@/components/ui/primitives/button"
import { BackButton } from "@/components/ui/navigation/back-button"
import * as Input from "@/components/ui/forms/input"
import * as Select from "@/components/ui/forms/select"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Checkbox from "@/components/ui/forms/checkbox"
import * as HorizontalStepper from "@/components/ui/primitives/horizontal-stepper"
import * as FileUpload from "@/components/ui/forms/file-upload"
import * as Hint from "@/components/ui/feedback/hint"
import { Callout } from "@/components/ui/feedback/callout"
import { FormField } from "@/components/ui/forms/form-field"
import {
	ArrowRight,
	Check,
	SealCheck,
	Clock,
	CloudArrowUp,
	Info,
	FileText,
} from "@phosphor-icons/react"
import { cn } from "@/utils/cn"
import { BUSINESS_TYPE_OPTIONS, INDUSTRY_CATEGORY_OPTIONS, INDIAN_STATES } from "@/lib/constants"
import { onboardingFormSchema, type OnboardingFormInput } from "@/lib/utils/validations"
import type { BusinessType, IndustryCategory, OrganizationDraft } from "@/lib/types"
import type { organizations, auth } from "@/lib/api/encore-client"
import { useSession } from "@/features/auth"
import { getEncoreClient } from "@/lib/api/encore"
import { toast } from "sonner"
import { logInfo, logError, logWarn } from "@/lib/logging/error-logger-simple"
import { getErrorMessage, getErrorMessageForLog } from "@/lib/utils/format"

const steps = [
	{ label: "Basic Info", value: 1 },
	{ label: "Business & Verification", value: 2 },
	{ label: "Review", value: 3 },
]

export default function OnboardingPage() {
	const router = useRouter()
	const { data: session, isPending: isSessionPending } = useSession()
	const [currentStep, setCurrentStep] = useState(1)
	const [isLoading, setIsLoading] = useState(false)
	const [isVerifyingGst, setIsVerifyingGst] = useState(false)
	// ❌ REMOVED: PAN verification state - PAN is only for shoppers
	const [termsAccepted, setTermsAccepted] = useState(false)
	const [hasCheckedOrg, setHasCheckedOrg] = useState(false)
	const [organizationId, setOrganizationId] = useState<string | null>(null)
	const [draftSaved, setDraftSaved] = useState(false)
	const [isLoadingDraft, setIsLoadingDraft] = useState(true)
	const [draftRestored, setDraftRestored] = useState(false)
	// GST verification result - MUST be before any early returns
	const [gstDetails, setGstDetails] = useState<{
		legalName: string
		tradeName: string
		status: string
		address: string
	} | null>(null)
	
	// ✅ OPTIMIZATION: Cache organizations list to avoid duplicate API calls
	const [organizationsCache, setOrganizationsCache] = useState<{
		organizations: Array<auth.OrganizationResponse & { approvalStatus?: string }>
		fetchedAt: number
	} | null>(null)
	const ORGANIZATIONS_CACHE_TTL = 30000 // 30 seconds cache
	
	// Ref map for form fields to avoid direct DOM manipulation
	const fieldRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>(new Map())
	
	// ✅ OPTIMIZATION: Shared function to get organizations (with caching)
	// ✅ FIX: Only fetch if user is authenticated
	const getOrganizationsList = useCallback(async () => {
		// Check cache first
		if (organizationsCache && Date.now() - organizationsCache.fetchedAt < ORGANIZATIONS_CACHE_TTL) {
			return organizationsCache.organizations
		}
		
		// ✅ FIX: Don't fetch if user is not authenticated
		if (!session?.user || isSessionPending) {
			return []
		}
		
		try {
			// Fetch fresh data
			const { getEncoreBrowserClient } = await import("@/lib/api/encore-browser")
			const orgsClient = getEncoreBrowserClient()
			const orgsResult = await orgsClient.auth.listOrganizations()
			const organizations = (orgsResult.organizations || []) as Array<auth.OrganizationResponse & { approvalStatus?: string }>
			
			// Update cache
			setOrganizationsCache({
				organizations,
				fetchedAt: Date.now(),
			})
			
			return organizations
		} catch (error) {
			// ✅ FIX: If auth error, return empty array (user not authenticated yet)
			const errorMsg = getErrorMessageForLog(error)
			if (errorMsg.includes("authentication") || errorMsg.includes("401") || errorMsg.includes("credentials")) {
				return []
			}
			// For other errors, log but return empty
			logWarn("Failed to fetch organizations list", {
				source: "Onboarding",
				data: { error: errorMsg }
			})
			return []
		}
	}, [organizationsCache, session?.user, isSessionPending])
	
	// Check if user already has an organization - redirect to dashboard if yes
	// This prevents forcing onboarding on users who already completed it
	useEffect(() => {
		async function checkOrganization() {
			// Wait for session to load
			if (isSessionPending) return

			// If not authenticated, let them stay (middleware will handle redirect)
			if (!session?.user) {
				setHasCheckedOrg(true)
				return
			}

			// Clear any previous user's draft data when checking (safety measure)
			// This ensures new users don't see previous user's data
			try {
				// Check if this is a new user (no organizations) and clear draft using server action
				const { checkUserOrganizations } = await import("@/features/organizations/actions/onboarding")
				const checkResult = await checkUserOrganizations({})
				const approvedOrgs = checkResult?.data?.approvedOrgs
				const draftOrgs = checkResult?.data?.draftOrgs

				// Only redirect if user has approved organizations (not drafts)
				if (approvedOrgs && approvedOrgs.length > 0) {
					router.replace("/dashboard")
					return
				}
				
				// If user has draft org, allow them to continue onboarding
				if (draftOrgs && draftOrgs.length > 0) {
					// Set organizationId so backend auto-save can work
					setOrganizationId(draftOrgs[0].id)
				} else {
					// New user with no orgs - clear any stale draft data
					try {
						localStorage.removeItem("onboarding-draft")
						localStorage.removeItem("onboarding-draft-timestamp")
					} catch (e) {
						// Ignore localStorage errors
					}
				}
			} catch (error) {
				// Check if it's a network/server error (502, 503, etc.) or auth error
				const errorMsg = getErrorMessageForLog(error)
				const isServerError = errorMsg.includes("502") || errorMsg.includes("503") || errorMsg.includes("504") || errorMsg.includes("fetch failed")
				const isAuthError = errorMsg.includes("Authentication") || errorMsg.includes("authentication") || errorMsg.includes("401") || errorMsg.includes("credentials")

				// Only log unexpected errors, not expected ones (server down, auth issues)
				if (!isServerError && !isAuthError) {
					logError(error, { source: "Onboarding", data: { action: "checkOrganization" } })
				} else {
					// Log as warning for expected errors (not critical)
					logWarn(`Expected error in checkUserOrganizations: ${errorMsg}`, {
						source: "Onboarding",
						data: { action: "checkUserOrganizations" }
					})
				}
				// Don't block onboarding on error - let user proceed
			}

			setHasCheckedOrg(true)
		}

		checkOrganization()
	}, [session, isSessionPending, router])

	// Note: Loading state moved to conditional rendering at the end to comply with Rules of Hooks
	// All hooks must be called before any returns

	// Note: gstDetails useState moved to top of component to fix hooks order error

	// RHF form setup
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		trigger,
		watch,
		setValue,
		getValues,
		reset,
	} = useForm<OnboardingFormInput>({
		resolver: zodResolver(onboardingFormSchema),
		mode: "onChange",
		defaultValues: {
			basicInfo: {
				name: "",
				description: "",
				website: "",
			},
			businessDetails: {
				businessType: "pvt_ltd",
				industryCategory: "electronics",
				contactPerson: "",
				phone: "",
				address: "",
				city: "",
				state: "",
				pinCode: "",
			},
			verification: {
				gstNumber: "",
				gstVerified: false,
				// ❌ REMOVED: PAN fields - PAN is only for shoppers
				cinNumber: "",
			},
		},
	})

	// useEffect to scroll to first error field when errors change
	useEffect(() => {
		const firstError = Object.keys(errors)[0]
		if (firstError) {
			// Try to find the field in our ref map first
			const fieldElement = fieldRefs.current.get(firstError)
			if (fieldElement) {
				// Use requestAnimationFrame to ensure DOM is updated
				requestAnimationFrame(() => {
					fieldElement.scrollIntoView({ behavior: "smooth", block: "center" })
					fieldElement.focus()
				})
			} else {
				// Fallback: use querySelector only if ref not found (shouldn't happen in practice)
				// This is acceptable as a fallback since we're in a useEffect (React-managed)
				const element = document.querySelector(`[name="${firstError}"]`) as HTMLInputElement | HTMLTextAreaElement | null
				if (element) {
					requestAnimationFrame(() => {
						element.scrollIntoView({ behavior: "smooth", block: "center" })
						element.focus()
						// Store in ref map for future use
						fieldRefs.current.set(firstError, element)
					})
				}
			}
		}
	}, [errors])

	// ============================================================================
	// RESUMABLE FORM: Phase 1 - Load Draft on Mount
	// ============================================================================

	// Load draft from backend and localStorage on mount
	useEffect(() => {
		const abortController = new AbortController()

		async function loadDraft() {
			if (isSessionPending || !session?.user) {
				if (!abortController.signal.aborted) {
					setIsLoadingDraft(false)
				}
				return
			}

			try {
				if (abortController.signal.aborted) return
				// ✅ OPTIMIZATION: Use cached organizations list
				const organizations = await getOrganizationsList()
				const draftOrg = organizations.find(
					(org): org is auth.OrganizationResponse & { approvalStatus?: string } => 
						'approvalStatus' in org && 
						((org as { approvalStatus?: string }).approvalStatus === "draft" || 
						 (org as { approvalStatus?: string }).approvalStatus === "pending")
				)

				if (draftOrg) {
					// Load draft from backend
					const { loadOnboardingDraft } = await import("@/features/organizations")
					const draftResult = await loadOnboardingDraft({ organizationId: draftOrg.id })
					const backendDraft = draftResult?.data

					if (backendDraft) {
						if (abortController.signal.aborted) return
						setOrganizationId(draftOrg.id)
						reset(backendDraft)
						setDraftRestored(true)
						const { logInfo } = await import("@/lib/logging/error-logger-simple")
						logInfo("Draft restored from backend", { source: "Onboarding" })
						if (!abortController.signal.aborted) {
							toast.success("Draft restored", {
								description: "Continuing where you left off",
								duration: 3000,
							})
							setIsLoadingDraft(false)
						}
						return
					}
				}

				// Fallback: Load from localStorage (same device)
				const savedDraft = localStorage.getItem("onboarding-draft")
				if (savedDraft) {
					try {
						if (abortController.signal.aborted) return
						const draft = JSON.parse(savedDraft)
						reset(draft)
						setDraftRestored(true)
						const { logInfo } = await import("@/lib/logging/error-logger-simple")
						logInfo("Draft restored from localStorage", { source: "Onboarding" })
						if (!abortController.signal.aborted) {
							toast.success("Draft restored", {
								description: "Your progress has been restored",
								duration: 3000,
							})
						}
					} catch (e) {
						if (!abortController.signal.aborted) {
							const { logError } = await import("@/lib/logging/error-logger-simple")
							logError(e, { source: "Onboarding", data: { action: "parseLocalStorageDraft" } })
						}
					}
				}
			} catch (error) {
				if (!abortController.signal.aborted) {
					const { logError } = await import("@/lib/logging/error-logger-simple")
					logError(error, { source: "Onboarding", data: { action: "loadDraft" } })
				}
				// Fallback to localStorage
				const savedDraft = localStorage.getItem("onboarding-draft")
				if (savedDraft) {
					try {
						if (abortController.signal.aborted) return
						const draft = JSON.parse(savedDraft)
						reset(draft)
						setDraftRestored(true)
					} catch (e) {
						if (!abortController.signal.aborted) {
							const { logError: logErr } = await import("@/lib/logging/error-logger-simple")
							logErr(e, { source: "Onboarding", data: { action: "parseLocalStorageDraftFallback" } })
						}
					}
				}
			} finally {
				if (!abortController.signal.aborted) {
					setIsLoadingDraft(false)
				}
			}
		}

		loadDraft()

		return () => {
			abortController.abort()
		}
	}, [session, isSessionPending, reset])

	// ============================================================================
	// RESUMABLE FORM: Phase 2 - Local Storage Auto-Save
	// ============================================================================

	// Auto-save to localStorage (immediate, debounced)
	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null

		const subscription = watch((value) => {
			// Clear previous timeout
			if (timeoutId) {
				clearTimeout(timeoutId)
			}

			// Debounce localStorage saves (1 second)
			timeoutId = setTimeout(() => {
				try {
					localStorage.setItem("onboarding-draft", JSON.stringify(value))
					localStorage.setItem("onboarding-draft-timestamp", Date.now().toString())
					logInfo("Draft saved to localStorage", { source: "Onboarding" })
				} catch (error) {
					logError(error, { source: "Onboarding", data: { action: "saveToLocalStorage" } })
				}
			}, 1000)
		})

		return () => {
			subscription.unsubscribe()
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
		}
	}, [watch])

	// ============================================================================
	// RESUMABLE FORM: Phase 3 - Backend Auto-Save
	// ============================================================================

	// Auto-save to backend (after organization is created, debounced)
	useEffect(() => {
		// Only save if organization exists
		if (!organizationId) return

		let timeoutId: NodeJS.Timeout | null = null
		let innerTimeoutId: NodeJS.Timeout | null = null

		const subscription = watch(async (value) => {
			// Clear previous timeout
			if (timeoutId) {
				clearTimeout(timeoutId)
			}

			// Debounce backend saves (3 seconds - less frequent than localStorage)
			timeoutId = setTimeout(async () => {
				try {
					const { saveOnboardingDraft } = await import("@/features/organizations")
					// Convert OnboardingFormInput to Partial<OrganizationDraft>
					// OnboardingFormInput matches OrganizationDraft structure but without step
					const draftData: Partial<OrganizationDraft> = {
						step: currentStep as 1 | 2 | 3 | 4,
						...(value.basicInfo && value.basicInfo.name && { 
							basicInfo: {
								name: value.basicInfo.name,
								...(value.basicInfo.description && { description: value.basicInfo.description }),
								...(value.basicInfo.website && { website: value.basicInfo.website }),
							}
						}),
						...(value.businessDetails && 
							value.businessDetails.businessType && 
							value.businessDetails.industryCategory &&
							value.businessDetails.contactPerson &&
							value.businessDetails.phone &&
							value.businessDetails.address &&
							value.businessDetails.city &&
							value.businessDetails.state &&
							value.businessDetails.pinCode && {
								businessDetails: {
									businessType: value.businessDetails.businessType as BusinessType,
									industryCategory: value.businessDetails.industryCategory as IndustryCategory,
									contactPerson: value.businessDetails.contactPerson,
									phone: value.businessDetails.phone,
									address: value.businessDetails.address,
									city: value.businessDetails.city,
									state: value.businessDetails.state,
									pinCode: value.businessDetails.pinCode,
								}
							}
						),
						...(value.verification && 
							value.verification.gstNumber && 
							typeof value.verification.gstVerified === 'boolean' && {
								verification: {
									gstNumber: value.verification.gstNumber,
									gstVerified: value.verification.gstVerified,
									// ❌ REMOVED: PAN fields - PAN is only for shoppers
									...(value.verification.cinNumber && { cinNumber: value.verification.cinNumber }),
								}
							}
						),
					}
					const result = await saveOnboardingDraft({ organizationId, formData: draftData })

					if (result?.data?.success) {
						setDraftSaved(true)
						logInfo("Draft saved to backend", { source: "Onboarding" })
						// Show subtle toast (only once per session to avoid spam)
						if (!draftSaved) {
							toast.success("Draft saved", {
								description: "Your progress is saved",
								duration: 2000,
							})
						}
						// Hide indicator after 3 seconds
						innerTimeoutId = setTimeout(() => {
							setDraftSaved(false)
						}, 3000)
					} else {
						logError(new Error(result?.serverError || "Unknown error"), {
							source: "Onboarding",
							data: { action: "saveDraft" }
						})
					}
				} catch (error) {
					logError(error, { source: "Onboarding", data: { action: "saveDraftToBackend" } })
					// Continue with localStorage only
				}
			}, 3000)
		})

		return () => {
			subscription.unsubscribe()
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
			if (innerTimeoutId) {
				clearTimeout(innerTimeoutId)
			}
		}
	}, [watch, organizationId, draftSaved])

	// ============================================================================
	// RESUMABLE FORM: Create Organization on Step 1 Completion
	// ============================================================================

	// Create organization when user completes Step 1 (if not already created)
	useEffect(() => {
		async function createOrganizationIfNeeded() {
			// Only create if we're past step 1 and organization doesn't exist
			if (currentStep < 2 || organizationId) return
			if (isSessionPending || !session?.user) return

			const formData = getValues()
			// Only create if basic info is filled
			if (!formData.basicInfo?.name) return

			try {
				// ✅ FIX: Only create organization if user is authenticated
				if (!session?.user) {
					// User not authenticated yet - skip organization creation
					// Organization will be created when they submit the form
					return
				}

				// ✅ OPTIMIZATION: Use cached organizations list
				const organizations = await getOrganizationsList()
				const existingOrg = organizations.find(
					(org): org is auth.OrganizationResponse & { approvalStatus?: string } => 
						'approvalStatus' in org && 
						((org as { approvalStatus?: string }).approvalStatus === "draft" || 
						 (org as { approvalStatus?: string }).approvalStatus === "pending")
				)

				if (existingOrg) {
					setOrganizationId(existingOrg.id)
					return
				}

				// Create new organization using custom backend endpoint (auto-sets active org)
				// Industry Standard: Backend handles Better Auth sync + auto-set
				const { getEncoreBrowserClient } = await import("@/lib/api/encore-browser")
				const createOrgClient = getEncoreBrowserClient()
				const basicOrg = await createOrgClient.organizations.createOrganization({
					name: formData.basicInfo.name,
					// Backend auto-sets if user has no active org
				})

				if (basicOrg?.id) {
					setOrganizationId(basicOrg.id)
					// ✅ OPTIMIZATION: Invalidate cache when new org is created
					setOrganizationsCache(null)
					// ✅ No need to call setActiveOrganization - backend does it automatically!
					logInfo("Organization created and auto-set as active", { source: "Onboarding" })
				}
			} catch (error) {
				// ✅ FIX: Check if it's an auth error (expected for unauthenticated users)
				const errorMsg = getErrorMessageForLog(error)
				const isAuthError = errorMsg.includes("authentication") || errorMsg.includes("401") || errorMsg.includes("credentials")

				if (!isAuthError) {
					logError(error, { source: "Onboarding", data: { action: "createOrganizationForDraft" } })
				} else {
					logWarn("User not authenticated yet, skipping organization creation", {
						source: "Onboarding",
						data: { action: "createOrganizationForDraft" }
					})
				}
				// Continue without backend saving - localStorage will still work
			}
		}

		createOrganizationIfNeeded()
	}, [currentStep, organizationId, session, isSessionPending, getValues])

	const handleNext = async () => {
		let isValid = false

		// Validate current step before proceeding
		switch (currentStep) {
			case 1:
				// Basic Info step
				isValid = await trigger(["basicInfo.name", "basicInfo.website", "basicInfo.description"])
				break
			case 2:
				// Combined Business Details & Verification step
				// First check GST verification
				const gstVerified = getValues("verification.gstVerified")
				if (!gstVerified) {
					// GST not verified - trigger GST validation
					isValid = await trigger(["verification.gstNumber", "verification.gstVerified"])
					if (!isValid) {
						toast.error("Please verify your GST number before proceeding")
						return
					}
				}
				// Then validate business details
				isValid = await trigger([
					"businessDetails.businessType",
					"businessDetails.industryCategory",
					"businessDetails.contactPerson",
					"businessDetails.phone",
					"businessDetails.address",
					"businessDetails.city",
					"businessDetails.state",
					"businessDetails.pinCode",
				])
				break
			case 3:
				// Review step - no validation needed
				isValid = true
				break
		}

		if (isValid && currentStep < 3) {
			setCurrentStep(currentStep + 1)
			window.scrollTo({ top: 0, behavior: "smooth" })
		}
		// Error scrolling is now handled by useEffect watching errors
	}

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleVerifyGst = async () => {
		const gstNumber = getValues("verification.gstNumber") || ""

		// Validate GST format first
		const isValid = await trigger("verification.gstNumber")
		if (!isValid) {
			return
		}

		setIsVerifyingGst(true)
		try {
			// Get or create organization ID if needed
			let orgId = organizationId
			
			if (!orgId) {
				// ✅ FIX: Only create/fetch organization if user is authenticated
				if (!session?.user) {
					throw new Error("Please sign in to verify GST. Authentication is required.")
				}

				// ✅ OPTIMIZATION: Use cached organizations list
				const organizations = await getOrganizationsList()
				const draftOrg = organizations.find(
					(org): org is auth.OrganizationResponse & { approvalStatus?: string } => 
						'approvalStatus' in org && 
						((org as { approvalStatus?: string }).approvalStatus === "draft" || 
						 (org as { approvalStatus?: string }).approvalStatus === "pending")
				)

				if (draftOrg) {
					// Use existing draft organization
					orgId = draftOrg.id
					setOrganizationId(draftOrg.id)
				} else {
					// Create new draft organization
					const { getEncoreBrowserClient } = await import("@/lib/api/encore-browser")
					const gstVerifyClient = getEncoreBrowserClient()
					const orgName = getValues("basicInfo.name") || "Organization"
					const newOrg = await gstVerifyClient.organizations.createOrganization({ name: orgName })
					if (newOrg?.id) {
						orgId = newOrg.id
						setOrganizationId(newOrg.id)
						// ✅ OPTIMIZATION: Invalidate cache when new org is created
						setOrganizationsCache(null)
					} else {
						throw new Error("Failed to create organization for GST verification")
					}
				}
			}

			// Call actual GST verification API (SurePass integration)
			// Server action will handle setting active organization server-side
			const { verifyGST } = await import('@/features/organizations')
			const result = await verifyGST({ gstNumber, organizationId: orgId })

			if (result?.data?.success && result.data.gstDetails) {
				// Success - set verified GST details from SurePass API
				setGstDetails({
					legalName: result.data.gstDetails.legalName || "",
					tradeName: result.data.gstDetails.tradeName || "",
					status: result.data.gstDetails.gstStatus || "Active",
					address: result.data.gstDetails.address || "",
				})
				setValue("verification.gstVerified", true, { shouldValidate: true })

				// ✅ AUTO-FILL: Fill address from GST API response
				if (result.data.gstDetails.address) {
					setValue("businessDetails.address", result.data.gstDetails.address, { shouldValidate: true })
				}

				toast.success("GST verified successfully. Address auto-filled from GST data.")
			} else {
				// Error from API
				const errorMessage = result?.serverError || "GST verification failed"
				toast.error(errorMessage)
				setGstDetails(null)
				setValue("verification.gstVerified", false, { shouldValidate: true })
			}
		} catch (error) {
			// Network or other errors
			toast.error(getErrorMessage(error, "Failed to verify GST. Please try again."))
			setGstDetails(null)
			setValue("verification.gstVerified", false, { shouldValidate: true })
		} finally {
			setIsVerifyingGst(false)
		}
	}

	// ❌ REMOVED: PAN verification for organizations
	// PAN verification is only for shoppers, not organizations
	// handleVerifyPan function removed - not needed for organizations

	// Helper function to get state name from GST state code
	const getStateFromCode = (code: string): string => {
		const stateCodes: Record<string, string> = {
			"01": "Jammu & Kashmir",
			"02": "Himachal Pradesh",
			"03": "Punjab",
			"04": "Chandigarh",
			"05": "Uttarakhand",
			"06": "Haryana",
			"07": "Delhi",
			"08": "Rajasthan",
			"09": "Uttar Pradesh",
			"10": "Bihar",
			"11": "Sikkim",
			"12": "Arunachal Pradesh",
			"13": "Nagaland",
			"14": "Manipur",
			"15": "Mizoram",
			"16": "Tripura",
			"17": "Meghalaya",
			"18": "Assam",
			"19": "West Bengal",
			"20": "Jharkhand",
			"21": "Odisha",
			"22": "Chattisgarh",
			"23": "Madhya Pradesh",
			"24": "Gujarat",
			"26": "Dadra & Nagar Haveli and Daman & Diu",
			"27": "Maharashtra",
			"28": "Andhra Pradesh",
			"29": "Karnataka",
			"30": "Goa",
			"31": "Lakshadweep",
			"32": "Kerala",
			"33": "Tamil Nadu",
			"34": "Puducherry",
			"35": "Andaman & Nicobar Islands",
			"36": "Telangana",
			"37": "Andhra Pradesh (New)",
		}
		return stateCodes[code] || "India"
	}

	const onSubmit = async (data: OnboardingFormInput) => {
		// Check if terms are accepted
		if (!termsAccepted) {
			logError(new Error("Terms and conditions must be accepted"), { source: "Onboarding", data: { action: "submit" } })
			// Scroll to terms section
			const termsElement = document.querySelector('[data-terms-checkbox]')
			termsElement?.scrollIntoView({ behavior: "smooth", block: "center" })
			return
		}

		setIsLoading(true)
		try {
			const { submitOnboarding } = await import("@/app/actions")
			// Map OnboardingFormInput to OrganizationDraft format
			// Ensure all required fields are present and properly typed
			if (!data.basicInfo?.name || !data.businessDetails) {
				throw new Error("Missing required fields")
			}
			const formData: OrganizationDraft = {
				step: 4 as const,
				basicInfo: {
					name: data.basicInfo.name,
					...(data.basicInfo.description && { description: data.basicInfo.description }),
					...(data.basicInfo.website && { website: data.basicInfo.website }),
				},
				businessDetails: {
					...data.businessDetails,
					industryCategory: data.businessDetails.industryCategory as IndustryCategory,
				},
				...(data.verification && { verification: data.verification }),
			}
			const result = await submitOnboarding(formData)

			if (!result?.data?.success) {
				throw new Error(result?.serverError || "Failed to submit application")
			}

			// Clear draft data on successful submission
			localStorage.removeItem("onboarding-draft")
			localStorage.removeItem("onboarding-draft-timestamp")
			logInfo("Draft cleared after successful submission", { source: "Onboarding" })

			router.push("/onboarding/pending")
		} catch (error: unknown) {
			logError(error, { source: "Onboarding", data: { action: "submitOnboarding" } })
			// Show error to user using toast (industry standard)
			toast.error("Submission Failed", {
				description: getErrorMessage(error, "Failed to submit application. Please try again."),
				duration: 5000,
			})
			// Don't redirect on error - let user fix and retry
		} finally {
			setIsLoading(false)
		}
	}

	// Clear draft function (for UX)
	const handleClearDraft = () => {
		// Use toast confirmation instead of browser confirm (industry standard)
		toast.error("Clear Draft", {
			description: "Are you sure you want to clear your draft? This cannot be undone.",
			action: {
				label: "Clear",
				onClick: () => {
					localStorage.removeItem("onboarding-draft")
					localStorage.removeItem("onboarding-draft-timestamp")
					reset()
					setOrganizationId(null)
					setDraftRestored(false)
					logInfo("Draft cleared by user", { source: "Onboarding" })
					toast.success("Draft cleared")
				},
			},
			duration: 10000,
		})
	}

	// Show loading while session is pending or org check is in progress
	if (isSessionPending || !hasCheckedOrg) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-paragraph-sm text-text-sub-600">Loading...</div>
			</div>
		)
	}

	return (
		<div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
			{/* Draft Status Indicators */}
			{(draftRestored || draftSaved) && (
				<div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-bg-weak-50 p-3 ring-1 ring-stroke-soft-200">
					<div className="flex items-center gap-2">
						{draftRestored && (
							<>
								<Clock className="size-4 text-success-base" weight="duotone" />
								<span className="text-paragraph-xs text-text-sub-600">
									Draft restored - continuing where you left off
								</span>
							</>
						)}
						{draftSaved && !draftRestored && (
							<>
								<Check className="size-4 text-success-base" weight="bold" />
								<span className="text-paragraph-xs text-text-sub-600">Draft saved</span>
							</>
						)}
					</div>
					<button
						type="button"
						onClick={handleClearDraft}
						className="text-paragraph-xs text-text-soft-400 hover:text-text-sub-600 underline"
					>
						Clear draft
					</button>
				</div>
			)}

			{/* Stepper */}
			<div className="mb-4 sm:mb-6 lg:mb-8">
				<HorizontalStepper.Root>
					{steps.map((step, index) => (
						<React.Fragment key={step.value}>
							<HorizontalStepper.Item
								state={
									currentStep > step.value
										? "completed"
										: currentStep === step.value
											? "active"
											: "default"
								}
								onClick={() => currentStep > step.value && setCurrentStep(step.value)}
								className={currentStep > step.value ? "cursor-pointer" : ""}
							>
								<HorizontalStepper.ItemIndicator>
									{currentStep > step.value ? (
										<Check className="size-4" weight="bold" />
									) : (
										step.value
									)}
								</HorizontalStepper.ItemIndicator>
								{step.label}
							</HorizontalStepper.Item>
							{index < steps.length - 1 && <HorizontalStepper.SeparatorIcon />}
						</React.Fragment>
					))}
				</HorizontalStepper.Root>
			</div>

			{/* Step Content */}
			<div className="rounded-xl sm:rounded-2xl bg-bg-white-0 p-4 sm:p-5 lg:p-6 xl:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
				<form id="onboarding-form" onSubmit={handleSubmit(onSubmit)}>
					{currentStep === 1 && (
						<Step1BasicInfo register={register} control={control} errors={errors} />
					)}
					{currentStep === 2 && (
						<Step2BusinessAndVerification
							register={register}
							control={control}
							errors={errors}
							watch={watch}
							setValue={setValue}
							getValues={getValues}
							gstDetails={gstDetails}
							onVerifyGst={handleVerifyGst}
							isVerifyingGst={isVerifyingGst}
						/>
					)}
					{currentStep === 3 && (
						<Step3Review
							watch={watch}
							onEdit={setCurrentStep}
							termsAccepted={termsAccepted}
							onTermsChange={setTermsAccepted}
						/>
					)}

					{/* Actions */}
					<div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-stroke-soft-200">
						<div className="w-full sm:w-auto">
							{currentStep > 1 && (
								<BackButton
									type="button"
									onClick={() => {
										handleBack()
										window.scrollTo({ top: 0, behavior: "smooth" })
									}}
									size="medium"
									iconOnlyOnMobile={false}
								/>
							)}
						</div>
						<div className="flex items-center gap-3 w-full sm:w-auto">
							{currentStep < 3 ? (
								<Button.Root
									type="button"
									variant="primary"
									onClick={(e) => {
										e.preventDefault()
										handleNext()
									}}
									className="flex-1 sm:flex-initial"
								>
									Continue
									<Button.Icon>
										<ArrowRight className="size-5" />
									</Button.Icon>
								</Button.Root>
							) : (
								<Button.Root
									type="submit"
									variant="primary"
									disabled={isLoading || !termsAccepted || !watch("verification.gstVerified")}
									className="flex-1 sm:flex-initial"
								>
									{isLoading ? "Submitting..." : "Submit for Approval"}
								</Button.Root>
							)}
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}

// Step 1: Basic Information
interface Step1Props {
	register: ReturnType<typeof useForm<OnboardingFormInput>>["register"]
	control: ReturnType<typeof useForm<OnboardingFormInput>>["control"]
	errors: ReturnType<typeof useForm<OnboardingFormInput>>["formState"]["errors"]
}

function Step1BasicInfo({ register, control, errors }: Step1Props) {
	return (
		<div className="space-y-4 sm:space-y-6">
			<div>
				<h2 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">Basic Information</h2>
				<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">Tell us about your organization</p>
			</div>

			<FormField label="Organization Name" required error={errors.basicInfo?.name?.message}>
				<Input.Root>
					<Input.Wrapper>
						<Input.El
							{...register("basicInfo.name")}
							placeholder="e.g., Acme Corporation Pvt. Ltd."
						/>
					</Input.Wrapper>
				</Input.Root>
			</FormField>

			<FormField label="Logo" hint="Recommended: 200x200px">
				<FileUpload.Root htmlFor="org-logo">
					<FileUpload.Icon as={CloudArrowUp} />
					<FileUpload.Button>Choose file</FileUpload.Button>
					<p className="text-paragraph-xs text-text-soft-400">PNG or JPG, max 2MB</p>
					<input id="org-logo" type="file" accept="image/*" className="sr-only" />
				</FileUpload.Root>
			</FormField>

			<FormField label="Website" error={errors.basicInfo?.website?.message}>
				<Input.Root>
					<Input.Wrapper>
						<Input.El {...register("basicInfo.website")} placeholder="https://www.example.com" />
					</Input.Wrapper>
				</Input.Root>
			</FormField>

			<FormField
				label="Description"
				error={errors.basicInfo?.description?.message}
				hint="This will be visible to shoppers on your campaigns"
			>
				<Textarea.Root
					{...register("basicInfo.description")}
					placeholder="Brief description of your organization..."
					rows={3}
				/>
			</FormField>
		</div>
	)
}

// Step 2: Business Details & Verification (Combined)
interface Step2CombinedProps {
	register: ReturnType<typeof useForm<OnboardingFormInput>>["register"]
	control: ReturnType<typeof useForm<OnboardingFormInput>>["control"]
	errors: ReturnType<typeof useForm<OnboardingFormInput>>["formState"]["errors"]
	watch: ReturnType<typeof useForm<OnboardingFormInput>>["watch"]
	setValue: ReturnType<typeof useForm<OnboardingFormInput>>["setValue"]
	getValues: ReturnType<typeof useForm<OnboardingFormInput>>["getValues"]
	gstDetails: { legalName: string; tradeName: string; status: string; address: string } | null
	onVerifyGst: () => void
	isVerifyingGst: boolean
}

function Step2BusinessAndVerification({
	register,
	control,
	errors,
	watch,
	setValue,
	getValues,
	gstDetails,
	onVerifyGst,
	isVerifyingGst,
}: Step2CombinedProps) {
	const gstNumber = watch("verification.gstNumber")
	const gstVerified = watch("verification.gstVerified")
	const businessType = watch("businessDetails.businessType")
	return (
		<div className="space-y-5 sm:space-y-6">
			<div>
				<h2 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">Business Details & Verification</h2>
				<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
					Verify your GST first, then complete business information
				</p>
			</div>

			{/* GST Verification Section (First) */}
			<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5 bg-bg-weak-50">
				<div className="mb-4">
					<h3 className="text-label-sm font-medium text-text-strong-950 mb-1">GST Verification (Mandatory)</h3>
					<p className="text-paragraph-xs text-text-sub-600">
						Verify your GST number to auto-fill business address
					</p>
				</div>
				
				<FormField
					label="GST Number"
					required
					error={errors.verification?.gstNumber?.message}
					hint="15-character GSTIN format"
				>
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
						<div className="flex-1 min-w-0">
							<Input.Root>
								<Input.Wrapper>
									<Input.El
										{...register("verification.gstNumber", {
											onChange: (e) => {
												setValue("verification.gstNumber", e.target.value.toUpperCase(), {
													shouldValidate: true,
												})
											},
										})}
										placeholder="29AABCU9603R1ZM"
										disabled={gstVerified}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<Button.Root
							type="button"
							variant={gstVerified ? "neutral" : "primary"}
							onClick={onVerifyGst}
							disabled={isVerifyingGst || !gstNumber || gstVerified}
							className="w-full sm:w-auto shrink-0"
						>
							{isVerifyingGst ? "Verifying..." : gstVerified ? "Verified" : "Verify GST"}
						</Button.Root>
					</div>
				</FormField>

				{gstDetails && (
					<div className="mt-4 rounded-xl bg-bg-white-0 p-3 sm:p-4 space-y-2 ring-1 ring-stroke-soft-200">
						<div className="flex items-center gap-2 text-success-base text-label-sm font-medium">
							<SealCheck className="size-5" weight="duotone" />
							GST Verified
						</div>
						<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 space-y-1.5">
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
								<span className="font-medium text-text-strong-950 min-w-[100px]">Legal Name:</span>
								<span className="text-text-strong-950">{gstDetails.legalName}</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
								<span className="font-medium text-text-strong-950 min-w-[100px]">Trade Name:</span>
								<span className="text-text-strong-950">{gstDetails.tradeName}</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
								<span className="font-medium text-text-strong-950 min-w-[100px]">Status:</span>
								<span className="text-success-base font-medium">{gstDetails.status}</span>
							</div>
						</div>
					</div>
				)}
				{errors.verification?.gstVerified && (
					<p className="mt-2 text-paragraph-xs text-error-base font-medium">
						{errors.verification.gstVerified.message}
					</p>
				)}
			</div>

			{/* Business Details Section (After GST Verification) */}
			<div className="pt-4 border-t border-stroke-soft-200">
				<div className="mb-4">
					<h3 className="text-label-sm font-medium text-text-strong-950 mb-1">Business Information</h3>
					<p className="text-paragraph-xs text-text-sub-600">Complete your business details</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FormField
					label="Business Type"
					required
					error={errors.businessDetails?.businessType?.message}
				>
					<Controller
						name="businessDetails.businessType"
						control={control}
						render={({ field }) => (
							<Select.Root value={field.value} onValueChange={field.onChange}>
								<Select.Trigger>
									<Select.Value placeholder="Select type" />
								</Select.Trigger>
								<Select.Content>
									{BUSINESS_TYPE_OPTIONS.map((option) => (
										<Select.Item key={option.value} value={option.value}>
											{option.label}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						)}
					/>
				</FormField>
				<FormField
					label="Industry Category"
					required
					error={errors.businessDetails?.industryCategory?.message}
				>
					<Controller
						name="businessDetails.industryCategory"
						control={control}
						render={({ field }) => (
							<Select.Root value={field.value} onValueChange={field.onChange}>
								<Select.Trigger>
									<Select.Value placeholder="Select category" />
								</Select.Trigger>
								<Select.Content>
									{INDUSTRY_CATEGORY_OPTIONS.map((option) => (
										<Select.Item key={option.value} value={option.value}>
											{option.label}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						)}
					/>
				</FormField>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FormField
					label="Contact Person"
					required
					error={errors.businessDetails?.contactPerson?.message}
				>
					<Input.Root>
						<Input.Wrapper>
							<Input.El {...register("businessDetails.contactPerson")} placeholder="John Doe" />
						</Input.Wrapper>
					</Input.Root>
				</FormField>
				<FormField label="Phone Number" required error={errors.businessDetails?.phone?.message}>
					<Input.Root>
						<Input.Wrapper>
							<Input.El {...register("businessDetails.phone")} placeholder="+91 9876543210" />
						</Input.Wrapper>
					</Input.Root>
				</FormField>
			</div>

			<FormField 
				label="Address" 
				required 
				error={errors.businessDetails?.address?.message}
				hint={gstDetails?.address ? "Auto-filled from GST verification" : undefined}
			>
				<Input.Root>
					<Input.Wrapper>
						<Input.El
							{...register("businessDetails.address")}
							placeholder="123, Tech Park, Sector 5"
							disabled={!!gstDetails?.address}
						/>
					</Input.Wrapper>
				</Input.Root>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<FormField label="City" required error={errors.businessDetails?.city?.message}>
					<Input.Root>
						<Input.Wrapper>
							<Input.El {...register("businessDetails.city")} placeholder="Bengaluru" />
						</Input.Wrapper>
					</Input.Root>
				</FormField>
				<FormField label="State" required error={errors.businessDetails?.state?.message}>
					<Controller
						name="businessDetails.state"
						control={control}
						render={({ field }) => (
							<Select.Root value={field.value} onValueChange={field.onChange}>
								<Select.Trigger>
									<Select.Value placeholder="Select" />
								</Select.Trigger>
								<Select.Content>
									{INDIAN_STATES.map((state) => (
										<Select.Item key={state} value={state}>
											{state}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						)}
					/>
				</FormField>
				<FormField label="PIN Code" required error={errors.businessDetails?.pinCode?.message}>
					<Input.Root>
						<Input.Wrapper>
							<Input.El {...register("businessDetails.pinCode")} placeholder="560001" />
						</Input.Wrapper>
					</Input.Root>
				</FormField>
			</div>

			{/* CIN Number (Optional) */}
			{(businessType === "pvt_ltd" || businessType === "llp") && (
				<FormField
					label="CIN Number (for Pvt Ltd/LLP only)"
					error={errors.verification?.cinNumber?.message}
				>
					<Input.Root>
						<Input.Wrapper>
							<Input.El
								{...register("verification.cinNumber", {
									onChange: (e) => {
										setValue("verification.cinNumber", e.target.value.toUpperCase(), {
											shouldValidate: true,
										})
									},
								})}
								placeholder="U72200KA2020PTC123456"
							/>
						</Input.Wrapper>
					</Input.Root>
				</FormField>
			)}
			</div>
		</div>
	)
}

// Step 3: Review
interface Step3ReviewProps {
	watch: ReturnType<typeof useForm<OnboardingFormInput>>["watch"]
	onEdit: (step: number) => void
	termsAccepted: boolean
	onTermsChange: (accepted: boolean) => void
}

function Step3Review({ watch, onEdit, termsAccepted, onTermsChange }: Step3ReviewProps) {
	const formData = watch()

	return (
		<div className="space-y-5 sm:space-y-6">
			<div>
				<h2 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">Review & Submit</h2>
				<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
					Please verify all details before submitting
				</p>
			</div>

			{/* Basic Information */}

			{/* Basic Information */}
			<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<div className="flex items-center justify-between mb-3 sm:mb-4">
					<h3 className="text-label-sm text-text-strong-950 font-medium">Basic Information</h3>
					<Button.Root type="button" variant="ghost" size="xsmall" onClick={() => onEdit(1)}>
						Edit
					</Button.Root>
				</div>
				<div className="space-y-2.5 text-paragraph-xs sm:text-paragraph-sm">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">Organization</span>
						<span className="text-text-strong-950 wrap-break-word">{formData.basicInfo?.name || "-"}</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">Website</span>
						<span className="text-text-strong-950 break-all">{formData.basicInfo?.website || "-"}</span>
					</div>
				</div>
			</div>

			{/* Business Details */}
			<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<div className="flex items-center justify-between mb-3 sm:mb-4">
					<h3 className="text-label-sm text-text-strong-950 font-medium">Business Details</h3>
					<Button.Root type="button" variant="ghost" size="xsmall" onClick={() => onEdit(2)}>
						Edit
					</Button.Root>
				</div>
				<div className="space-y-2.5 text-paragraph-xs sm:text-paragraph-sm">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">Business Type</span>
						<span className="text-text-strong-950 capitalize">
							{formData.businessDetails?.businessType?.replace("_", " ") || "-"}
						</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">Industry</span>
						<span className="text-text-strong-950 capitalize">
							{formData.businessDetails?.industryCategory?.replace("_", " ") || "-"}
						</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">Contact Person</span>
						<span className="text-text-strong-950">
							{formData.businessDetails?.contactPerson || "-"}
						</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">Phone</span>
						<span className="text-text-strong-950">{formData.businessDetails?.phone || "-"}</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">Address</span>
						<span className="text-text-strong-950 text-right sm:text-left wrap-break-word">
							{formData.businessDetails?.address}, {formData.businessDetails?.city},{" "}
							{formData.businessDetails?.state} - {formData.businessDetails?.pinCode}
						</span>
					</div>
				</div>
			</div>

			{/* Verification Status */}
			<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<div className="flex items-center justify-between mb-3 sm:mb-4">
					<h3 className="text-label-sm text-text-strong-950 font-medium">Verification Status</h3>
					<Button.Root type="button" variant="ghost" size="xsmall" onClick={() => onEdit(2)}>
						Edit
					</Button.Root>
				</div>
				<div className="space-y-2.5 text-paragraph-xs sm:text-paragraph-sm">
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">GST</span>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-text-strong-950 font-mono text-label-xs sm:text-paragraph-sm">
								{formData.verification?.gstNumber || "-"}
							</span>
							{formData.verification?.gstVerified ? (
								<span className="flex items-center gap-1 text-success-base text-label-xs font-medium">
									<SealCheck className="size-3.5" weight="duotone" /> Verified
								</span>
							) : (
								<span className="flex items-center gap-1 text-text-soft-400 text-label-xs">
									<Clock className="size-3.5" /> Not Verified
								</span>
							)}
						</div>
					</div>
					{/* ❌ REMOVED: PAN display - PAN is only for shoppers, not organizations */}
				</div>
			</div>

			{/* Terms Agreement */}
			<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5 bg-bg-weak-50">
				<label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer" data-terms-checkbox>
					<Checkbox.Root
						checked={termsAccepted}
						onCheckedChange={(checked) => onTermsChange(checked === true)}
						className="mt-0.5 shrink-0"
					/>
					<span className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 leading-relaxed">
						I confirm that all information provided is accurate and I agree to the{" "}
						<a
							href="/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary-base hover:underline font-medium"
							onClick={(e) => e.stopPropagation()}
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary-base hover:underline font-medium"
							onClick={(e) => e.stopPropagation()}
						>
							Privacy Policy
						</a>
					</span>
				</label>
				{!termsAccepted && (
					<p className="mt-2 text-paragraph-xs text-error-base font-medium">
						Please accept the terms and conditions to continue
					</p>
				)}
			</div>
		</div>
	)
}
