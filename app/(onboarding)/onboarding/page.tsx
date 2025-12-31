"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { routes } from "@/lib/routes"
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
import { FormField } from "@/components/ui/forms/form-field"
import {
	ArrowRight,
	Check,
	SealCheck,
	Clock,
	CloudArrowUp,
	WarningCircle,
} from "@phosphor-icons/react"
import { BUSINESS_TYPE_OPTIONS, INDUSTRY_CATEGORY_OPTIONS, INDIAN_STATES, getStateFromGSTCode, getCitiesOfState, STORAGE_KEYS, clearOnboardingStorage } from "@/lib/constants"
import { onboardingFormSchema, onboardingDraftSchema, type OnboardingFormInput } from "@/lib/utils/validations"
import type { BusinessType, IndustryCategory, OrganizationDraft } from "@/features/organizations/types"
import { useSession } from "@/features/auth"
import { useLogoPreview } from "@/features/storage"
import { useOnboardingStatus } from "@/features/organizations/hooks/use-onboarding-status"
import { useOrganizations } from "@/features/organizations/hooks/use-organizations"
import { toast } from "sonner"
import { logInfo, logError } from "@/lib/logging/error-logger-simple"
import { getErrorMessage } from "@/lib/utils/format"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"

const steps = [
	{ label: "Basic Info", value: 1 },
	{ label: "Business & Verification", value: 2 },
	{ label: "Review", value: 3 },
]

export default function OnboardingPage() {
	const router = useRouter()
	const { data: session, isPending: isSessionPending } = useSession()

	// ✅ PAGE-LEVEL PROTECTION: Use central hook for onboarding status
	const {
		state,
		subState,
		isLoading: isStatusLoading,
		approvedOrgId,
		targetOrgId,
		rejectionReason
	} = useOnboardingStatus()

	// ✅ ZUSTAND: Single store replaces 8 useState calls
	const {
		currentStep,
		setCurrentStep,
		isLoading,
		setIsLoading,
		isVerifyingGst,
		setIsVerifyingGst,
		termsAccepted,
		setTermsAccepted,
		organizationId,
		setOrganizationId,
		draftSaved,
		draftRestored,
		setIsLoadingDraft,
		setDraftRestored,
		logoFile,
		setLogoFile,
		reset: resetOnboardingStore,
	} = useOnboardingStore()

	// Use React Query hook for organizations - cached automatically
	const { data: orgsData } = useOrganizations()

	// Ref map for form fields to avoid direct DOM manipulation
	const fieldRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>(new Map())

	// ✅ PAGE-LEVEL PROTECTION: Handle redirects based on onboarding status
	useEffect(() => {
		if (isStatusLoading) return

		// Already approved? Go to dashboard
		if (state === "ready" && approvedOrgId) {
			router.replace(`/dashboard/${approvedOrgId}`)
			return
		}

		// Has pending? Go to pending page
		if (state === "needs_onboarding" && subState === "has_pending") {
			router.replace(routes.onboarding.pending)
			return
		}

		// Set organization ID from hook if available (for draft/rejected orgs)
		if (targetOrgId && !organizationId) {
			setOrganizationId(targetOrgId)
		}
	}, [state, subState, isStatusLoading, approvedOrgId, targetOrgId, organizationId, router])

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
				cinNumber: "",
			},
		},
	})

	// Watch website field for logo preview
	const websiteValue = watch("basicInfo.website")

	// Extract domain from website URL for logo preview
	const websiteDomain = React.useMemo(() => {
		if (!websiteValue) return ""
		try {
			// Handle URLs without protocol
			const urlWithProtocol = websiteValue.startsWith("http") ? websiteValue : `https://${websiteValue}`
			const url = new URL(urlWithProtocol)
			// Remove www. prefix if present
			return url.hostname.replace(/^www\./, "")
		} catch {
			// If URL parsing fails, try to extract domain-like string
			const domainMatch = websiteValue.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/)
			return domainMatch ? domainMatch[1] : ""
		}
	}, [websiteValue])

	// Fetch logo preview based on domain
	const logoPreviewQuery = useLogoPreview(websiteDomain)

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

	useEffect(() => {
		async function loadDraft() {
			if (isSessionPending || !session?.user) {
				setIsLoadingDraft(false)
				return
			}

			// Wait for orgs data to be loaded
			const organizations = orgsData?.organizations || []

			try {
				// Find draft/pending org
				const draftOrg = organizations.find(
					(org) => org.approvalStatus === "draft" || org.approvalStatus === "pending"
				)

				if (draftOrg) {
					setOrganizationId(draftOrg.id)
				}

				// Load from localStorage
				const savedDraft = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DRAFT)
				if (savedDraft) {
					try {
						const rawDraft = JSON.parse(savedDraft)
						// Validate with Zod schema to ensure type safety
						const parseResult = onboardingDraftSchema.safeParse(rawDraft)
						if (parseResult.success) {
							reset(parseResult.data as OnboardingFormInput)
							setDraftRestored(true)
							logInfo("Draft restored from localStorage", { source: "Onboarding" })
							toast.success("Draft restored", {
								description: "Your progress has been restored",
								duration: 3000,
							})
						} else {
							logError(new Error("Invalid draft data format"), {
								source: "Onboarding",
								data: { action: "validateLocalStorageDraft", errors: parseResult.error.issues }
							})
							// Clear invalid draft
							localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DRAFT)
						}
					} catch (e) {
						logError(e, { source: "Onboarding", data: { action: "parseLocalStorageDraft" } })
					}
				}
			} catch (error) {
				logError(error, { source: "Onboarding", data: { action: "loadDraft" } })
				// Fallback to localStorage
				const savedDraft = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DRAFT)
				if (savedDraft) {
					try {
						const rawDraft = JSON.parse(savedDraft)
						// Validate with Zod schema to ensure type safety
						const parseResult = onboardingDraftSchema.safeParse(rawDraft)
						if (parseResult.success) {
							reset(parseResult.data as OnboardingFormInput)
							setDraftRestored(true)
						} else {
							// Clear invalid draft
							localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DRAFT)
						}
					} catch (e) {
						logError(e, { source: "Onboarding", data: { action: "parseLocalStorageDraftFallback" } })
					}
				}
			} finally {
				setIsLoadingDraft(false)
			}
		}

		loadDraft()
	}, [session, isSessionPending, reset, orgsData])

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
					localStorage.setItem(STORAGE_KEYS.ONBOARDING_DRAFT, JSON.stringify(value))
					localStorage.setItem(STORAGE_KEYS.ONBOARDING_DRAFT_TIMESTAMP, Date.now().toString())
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

	// Using localStorage for draft persistence

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
			const { verifyGST } = await import('@/features/organizations')
			const result = await verifyGST({ gstNumber })

			if (result?.data?.success && result.data.gstDetails) {
				setValue("verification.gstVerified", true, { shouldValidate: true })
				setValue("verification.gstLegalName", result.data.gstDetails.legalName || "")
				setValue("verification.gstTradeName", result.data.gstDetails.tradeName || "")
				setValue("verification.gstStatus", result.data.gstDetails.gstStatus || "Active")
				setValue("verification.gstAddress", result.data.gstDetails.address || "")

				// ✅ AUTO-FILL: Fill address fields from GST API response
				// Type assertion for extended GST fields that may come from real API
				const gst = result.data.gstDetails as typeof result.data.gstDetails & {
					city?: string
					state?: string
					stateCode?: string
					pinCode?: string
					pincode?: string
					phone?: string
					contactPerson?: string
				}
				
				// Auto-fill address
				if (gst.address) {
					setValue("businessDetails.address", gst.address, { shouldValidate: true })
				}
				// Auto-fill city if available
				if (gst.city) {
					setValue("businessDetails.city", gst.city, { shouldValidate: true })
				}
				// Auto-fill PIN code if available
				if (gst.pinCode || gst.pincode) {
					setValue("businessDetails.pinCode", gst.pinCode || gst.pincode || "", { shouldValidate: true })
				}
				// Auto-fill state if available (from stateCode or state field)
				if (gst.stateCode || gst.state) {
					const stateName = gst.state || (gst.stateCode ? getStateFromGSTCode(gst.stateCode) : "")
					if (stateName) {
						setValue("businessDetails.state", stateName, { shouldValidate: true })
					}
				}
				// Auto-fill contact person if available
				if (gst.contactPerson) {
					setValue("businessDetails.contactPerson", gst.contactPerson, { shouldValidate: true })
				}
				// Auto-fill phone if available
				if (gst.phone) {
					setValue("businessDetails.phone", gst.phone, { shouldValidate: true })
				}

				toast.success("GST verified successfully. Address auto-filled from GST data.")
			} else {
				const errorMessage = result?.serverError || "GST verification failed"
				toast.error(errorMessage)
				setValue("verification.gstVerified", false, { shouldValidate: true })
				setValue("verification.gstLegalName", "")
				setValue("verification.gstTradeName", "")
				setValue("verification.gstStatus", "")
				setValue("verification.gstAddress", "")
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to verify GST. Please try again."))
			setValue("verification.gstVerified", false, { shouldValidate: true })
			setValue("verification.gstLegalName", "")
			setValue("verification.gstTradeName", "")
			setValue("verification.gstStatus", "")
			setValue("verification.gstAddress", "")
		} finally {
			setIsVerifyingGst(false)
		}
	}

	// Reset GST verification to allow editing
	const handleResetGst = () => {
		setValue("verification.gstVerified", false, { shouldValidate: true })
		setValue("verification.gstLegalName", "")
		setValue("verification.gstTradeName", "")
		setValue("verification.gstStatus", "")
		setValue("verification.gstAddress", "")
		// Clear the GST number so user can enter a new one
		setValue("verification.gstNumber", "", { shouldValidate: false })
		// Also clear auto-filled address fields since they came from GST
		setValue("businessDetails.address", "", { shouldValidate: false })
		setValue("businessDetails.city", "", { shouldValidate: false })
		setValue("businessDetails.state", "", { shouldValidate: false })
		setValue("businessDetails.pinCode", "", { shouldValidate: false })
		toast.info("GST cleared. Please enter and verify your GST number again.")
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
			const { completeOnboarding } = await import("@/features/organizations")
			const { getEncoreBrowserClient } = await import("@/lib/api/encore-browser")

			// Ensure all required fields are present
			if (!data.basicInfo?.name || !data.businessDetails || !data.verification?.gstNumber) {
				throw new Error("Missing required fields")
			}

			// ✅ Upload logo if user selected one
			let uploadedLogoUrl: string | undefined = undefined
			if (logoFile) {
				try {
					logInfo("Uploading organization logo...", { source: "Onboarding" })
					const uploadClient = getEncoreBrowserClient()

					// Get presigned upload URL
					const orgIdForUpload = organizationId || "temp-upload"
					const { uploadUrl, fileUrl } = await uploadClient.storage.requestOrgLogoUploadUrl({
						filename: logoFile.name,
						orgId: orgIdForUpload,
					})

					// Upload file to presigned URL
					const uploadResponse = await fetch(uploadUrl, {
						method: "PUT",
						body: logoFile,
						headers: {
							"Content-Type": logoFile.type,
						},
					})

					if (!uploadResponse.ok) {
						throw new Error("Failed to upload logo file")
					}

					uploadedLogoUrl = fileUrl
					logInfo("Logo uploaded successfully", { source: "Onboarding", data: { fileUrl } })
				} catch (logoError) {
					// Log but don't fail submission if logo upload fails
					logInfo("Logo upload failed, continuing without logo", {
						source: "Onboarding",
						data: { error: getErrorMessage(logoError) }
					})
					toast.warning("Logo upload failed", {
						description: "Your application will be submitted without a logo. You can add it later.",
						duration: 4000,
					})
				}
			}

			const result = await completeOnboarding({
				// Basic Info
				name: data.basicInfo.name,
				description: data.basicInfo.description || undefined,
				website: data.basicInfo.website || undefined,
				logo: uploadedLogoUrl || undefined,
				// Business Details
				businessType: data.businessDetails.businessType,
				industryCategory: data.businessDetails.industryCategory || undefined,
				contactPerson: data.businessDetails.contactPerson || undefined,
				phoneNumber: data.businessDetails.phone,
				// Address
				address: data.businessDetails.address,
				city: data.businessDetails.city,
				state: data.businessDetails.state,
				postalCode: data.businessDetails.pinCode,
				// GST - pass verified number AND pre-verified details to skip duplicate SurePass call
				gstNumber: data.verification.gstNumber,
				// gstLegalName is required by schema - use verified name or fallback to org name
				gstLegalName: data.verification.gstLegalName || data.basicInfo.name,
				gstTradeName: data.verification.gstTradeName || "",
				// Optional
				cinNumber: data.verification.cinNumber || "",
			})

			if (!result?.data?.success) {
				throw new Error(result?.serverError || "Failed to submit application")
			}

			// Clear draft data on successful submission
			clearOnboardingStorage()
			logInfo("Onboarding completed successfully", {
				source: "Onboarding",
				data: {
					organizationId: result.data.organizationId,
					approvalStatus: result.data.approvalStatus,
				}
			})

			router.push(routes.onboarding.pending)
		} catch (error: unknown) {
			logError(error, { source: "Onboarding", data: { action: "completeOnboarding" } })
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
					clearOnboardingStorage()
					reset() // React Hook Form reset
					resetOnboardingStore() // Zustand store reset
					logInfo("Draft cleared by user", { source: "Onboarding" })
					toast.success("Draft cleared")
				},
			},
			duration: 10000,
		})
	}

	// Show loading while checking onboarding status or during redirect
	if (isStatusLoading || state === "ready" || (state === "needs_onboarding" && subState === "has_pending")) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<div className="flex flex-col items-center gap-4">
					<div className="relative">
						<div className="animate-spin h-10 w-10 border-3 border-stroke-soft-200 border-t-primary-base rounded-full" />
					</div>
					<div className="text-center">
						<p className="text-label-sm text-text-sub-600">Setting up your account</p>
						<p className="text-paragraph-xs text-text-soft-400 mt-1">Please wait a moment...</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="w-full h-full flex flex-col">
			{/* Rejection Banner - Show if org was rejected */}
			{state === "needs_onboarding" && subState === "has_rejected" && rejectionReason && (
				<div className="mb-4 flex items-start gap-3 rounded-lg bg-error-lighter p-4 ring-1 ring-error-base/20">
					<WarningCircle className="size-5 text-error-base shrink-0 mt-0.5" weight="duotone" />
					<div className="flex-1 min-w-0">
						<p className="text-label-sm font-medium text-error-base">Application Rejected</p>
						<p className="text-paragraph-xs text-text-sub-600 mt-1">
							{rejectionReason}
						</p>
						<p className="text-paragraph-xs text-text-soft-400 mt-2">
							Please update your information and resubmit for approval.
						</p>
					</div>
				</div>
			)}

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
			<div className="flex-1 rounded-xl sm:rounded-2xl bg-bg-white-0 p-4 sm:p-5 lg:p-6 xl:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-sm overflow-y-auto">
				<form id="onboarding-form" onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
					{currentStep === 1 && (
						<Step1BasicInfo
							register={register}
							control={control}
							errors={errors}
							watch={watch}
							logoPreview={{
								data: logoPreviewQuery.data,
								isLoading: logoPreviewQuery.isLoading,
							}}
							onLogoFileChange={setLogoFile}
						/>
					)}
					{currentStep === 2 && (
						<Step2BusinessAndVerification
							register={register}
							control={control}
							errors={errors}
							watch={watch}
							setValue={setValue}
							getValues={getValues}
									onVerifyGst={handleVerifyGst}
							onResetGst={handleResetGst}
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

					{/* Actions - Always at bottom */}
					<div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-auto pt-4 sm:pt-6 border-t border-stroke-soft-200">
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
									disabled={isVerifyingGst}
									onClick={(e) => {
										e.preventDefault()
										handleNext()
									}}
									className="flex-1 sm:flex-initial"
								>
									{isVerifyingGst ? "Verifying..." : "Continue"}
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
	watch: ReturnType<typeof useForm<OnboardingFormInput>>["watch"]
	logoPreview: {
		data: { logoUrl: string | null; found: boolean; source: string } | undefined
		isLoading: boolean
	}
	// ✅ FIX: Callback to store logo file for upload on submission
	onLogoFileChange: (file: File | null) => void
}

function Step1BasicInfo({ register, control, errors, watch, logoPreview, onLogoFileChange }: Step1Props) {
	const [uploadedLogo, setUploadedLogo] = useState<string | null>(null)

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Create preview URL for uploaded file
			const previewUrl = URL.createObjectURL(file)
			setUploadedLogo(previewUrl)
			// ✅ FIX: Store file for upload on submission
			onLogoFileChange(file)
		}
	}

	// Show uploaded logo first, then fetched preview from API
	const fetchedLogoUrl = logoPreview.data?.found ? logoPreview.data.logoUrl : null
	const displayLogo = uploadedLogo || fetchedLogoUrl

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

			<FormField label="Website" error={errors.basicInfo?.website?.message} hint="Enter your website to auto-fetch logo">
				<Input.Root>
					<Input.Wrapper>
						<Input.El {...register("basicInfo.website")} placeholder="https://www.example.com" />
					</Input.Wrapper>
				</Input.Root>
			</FormField>

			<FormField label="Logo" hint="Recommended: 200x200px">
				<div className="flex flex-col sm:flex-row gap-4 items-start">
					{/* Logo Preview */}
					{(displayLogo || logoPreview.isLoading) && (
						<div className="shrink-0">
							{logoPreview.isLoading ? (
								<div className="size-20 rounded-lg bg-bg-weak-50 animate-pulse flex items-center justify-center ring-1 ring-stroke-soft-200">
									<span className="text-paragraph-xs text-text-soft-400">Loading...</span>
								</div>
							) : displayLogo ? (
								<div className="relative group">
									<img
										src={displayLogo}
										alt="Logo preview"
										className="size-20 rounded-lg object-contain bg-bg-white-0 ring-1 ring-stroke-soft-200"
									/>
									{!uploadedLogo && fetchedLogoUrl && (
										<div className="absolute -bottom-1 -right-1 bg-primary-base text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
											Auto
										</div>
									)}
								</div>
							) : null}
						</div>
					)}

					{/* File Upload */}
					<div className="flex-1">
						<FileUpload.Root htmlFor="org-logo">
							<FileUpload.Icon as={CloudArrowUp} />
							<FileUpload.Button>{displayLogo ? "Change logo" : "Choose file"}</FileUpload.Button>
							<p className="text-paragraph-xs text-text-soft-400">PNG or JPG, max 2MB</p>
							<input
								id="org-logo"
								type="file"
								accept="image/*"
								className="sr-only"
								onChange={handleLogoChange}
							/>
						</FileUpload.Root>
						{!uploadedLogo && fetchedLogoUrl && (
							<p className="mt-2 text-paragraph-xs text-text-sub-600">
								Logo auto-fetched from your website. Upload a different one if preferred.
							</p>
						)}
					</div>
				</div>
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
	onVerifyGst: () => void
	onResetGst: () => void
	isVerifyingGst: boolean
}

function Step2BusinessAndVerification({
	register,
	control,
	errors,
	watch,
	setValue,
	getValues,
	onVerifyGst,
	onResetGst,
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
						{gstVerified ? (
							<Button.Root
								type="button"
								variant="neutral"
								onClick={onResetGst}
								className="w-full sm:w-auto shrink-0"
							>
								Edit
							</Button.Root>
						) : (
							<Button.Root
								type="button"
								variant="primary"
								onClick={onVerifyGst}
								disabled={isVerifyingGst || !gstNumber}
								className="w-full sm:w-auto shrink-0"
							>
								{isVerifyingGst ? "Verifying..." : "Verify GST"}
							</Button.Root>
						)}
					</div>
				</FormField>

				{watch("verification.gstVerified") && (
					<div className="mt-4 rounded-xl bg-bg-white-0 p-3 sm:p-4 space-y-2 ring-1 ring-stroke-soft-200">
						<div className="flex items-center gap-2 text-success-base text-label-sm font-medium">
							<SealCheck className="size-5" weight="duotone" />
							GST Verified
						</div>
						<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 space-y-1.5">
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
								<span className="font-medium text-text-strong-950 min-w-[100px]">Legal Name:</span>
								<span className="text-text-strong-950">{watch("verification.gstLegalName")}</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
								<span className="font-medium text-text-strong-950 min-w-[100px]">Trade Name:</span>
								<span className="text-text-strong-950">{watch("verification.gstTradeName")}</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
								<span className="font-medium text-text-strong-950 min-w-[100px]">Status:</span>
								<span className="text-success-base font-medium">{watch("verification.gstStatus")}</span>
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
				hint={watch("verification.gstAddress") ? "Auto-filled from GST verification" : undefined}
			>
				<Input.Root>
					<Input.Wrapper>
						<Input.El
							{...register("businessDetails.address")}
							placeholder="123, Tech Park, Sector 5"
							disabled={!!watch("verification.gstAddress")}
						/>
					</Input.Wrapper>
				</Input.Root>
			</FormField>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<FormField label="State" required error={errors.businessDetails?.state?.message}>
					<Controller
						name="businessDetails.state"
						control={control}
						render={({ field }) => (
							<Select.Root
								value={field.value}
								onValueChange={(value) => {
									field.onChange(value)
									// Clear city when state changes (city dropdown will repopulate)
									setValue("businessDetails.city", "", { shouldValidate: false })
								}}
							>
								<Select.Trigger>
									<Select.Value placeholder="Select state" />
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
				<FormField label="City" required error={errors.businessDetails?.city?.message}>
					<Controller
						name="businessDetails.city"
						control={control}
						render={({ field }) => {
							const selectedState = watch("businessDetails.state")
							const cities = selectedState ? getCitiesOfState(selectedState) : []
							const hasNoCities = selectedState && cities.length === 0

							// If state is selected but has no cities in database, show input field
							if (hasNoCities) {
								return (
									<Input.Root>
										<Input.Wrapper>
											<Input.El
												{...field}
												placeholder="Enter city name"
											/>
										</Input.Wrapper>
									</Input.Root>
								)
							}

							return (
								<Select.Root
									value={field.value}
									onValueChange={field.onChange}
									disabled={!selectedState}
								>
									<Select.Trigger>
										<Select.Value placeholder={selectedState ? "Select city" : "Select state first"} />
									</Select.Trigger>
									<Select.Content>
										{cities.map((city) => (
											<Select.Item key={city} value={city}>
												{city}
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
							)
						}}
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
