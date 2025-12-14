"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Button from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import * as Input from "@/components/ui/input"
import * as Select from "@/components/ui/select"
import * as Textarea from "@/components/ui/textarea"
import * as Checkbox from "@/components/ui/checkbox"
import * as HorizontalStepper from "@/components/ui/horizontal-stepper"
import * as FileUpload from "@/components/ui/file-upload"
import * as Hint from "@/components/ui/hint"
import { Callout } from "@/components/ui/callout"
import { FormField } from "@/components/ui/form-field"
import {
	ArrowRight,
	Check,
	SealCheck,
	Clock,
	CloudArrowUp,
	Info,
	FileText,
} from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/utils/cn"
import { BUSINESS_TYPE_OPTIONS, INDUSTRY_CATEGORY_OPTIONS, INDIAN_STATES } from "@/lib/constants"
import { onboardingFormSchema, type OnboardingFormInput } from "@/lib/validations"
import type { BusinessType, IndustryCategory } from "@/lib/types"
import { useSession } from "@/hooks/use-session"
import { getEncoreClient } from "@/lib/encore"

const steps = [
	{ label: "Basic Info", value: 1 },
	{ label: "Business", value: 2 },
	{ label: "Verification", value: 3 },
	{ label: "Review", value: 4 },
]

export default function OnboardingPage() {
	const router = useRouter()
	const { data: session, isPending: isSessionPending } = useSession()
	const [currentStep, setCurrentStep] = React.useState(1)
	const [isLoading, setIsLoading] = React.useState(false)
	const [isVerifyingGst, setIsVerifyingGst] = React.useState(false)
	const [isVerifyingPan, setIsVerifyingPan] = React.useState(false)
	const [termsAccepted, setTermsAccepted] = React.useState(false)
	const [hasCheckedOrg, setHasCheckedOrg] = React.useState(false)

	// Check if user already has an organization - redirect to dashboard if yes
	// This prevents forcing onboarding on users who already completed it
	React.useEffect(() => {
		async function checkOrganization() {
			// Wait for session to load
			if (isSessionPending) return

			// If not authenticated, let them stay (middleware will handle redirect)
			if (!session?.user) {
				setHasCheckedOrg(true)
				return
			}

			// Check if user already has organization using Encore client directly
			// This is a client-side check, so we use the browser client
			try {
				// Import client-side Encore client
				const { getEncoreBrowserClient } = await import("@/lib/encore-browser")
				const client = getEncoreBrowserClient()
				
				const orgsResult = await client.auth.listOrganizations()
				if (orgsResult.organizations && orgsResult.organizations.length > 0) {
					console.log("[Onboarding] User already has organization, redirecting to dashboard")
					router.replace("/dashboard")
					return
				}
			} catch (error) {
				console.error("[Onboarding] Error checking organization:", error)
				// Don't block onboarding on error - let user proceed
				// Maybe API is down or user has network issues
				// User might be trying to create a second organization, which is allowed
			}

			setHasCheckedOrg(true)
		}

		checkOrganization()
	}, [session, isSessionPending, router])

	// Show loading while checking
	if (isSessionPending || !hasCheckedOrg) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-paragraph-sm text-text-sub-600">Loading...</div>
			</div>
		)
	}

	// GST verification result
	const [gstDetails, setGstDetails] = React.useState<{
		legalName: string
		tradeName: string
		status: string
		address: string
	} | null>(null)

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
				businessType: "private_limited",
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
				panNumber: "",
				panVerified: false,
				cinNumber: "",
			},
		},
	})

	const handleNext = async () => {
		let isValid = false

		// Validate current step before proceeding
		switch (currentStep) {
			case 1:
				// Basic Info step
				isValid = await trigger(["basicInfo.name", "basicInfo.website", "basicInfo.description"])
				break
			case 2:
				// Business Details step
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
				// Verification step - GST is required, PAN is optional
				isValid = await trigger(["verification.gstNumber", "verification.gstVerified"])
				// Also check if GST is verified
				const gstVerified = getValues("verification.gstVerified")
				if (!gstVerified) {
					isValid = false
					// Show error if GST not verified
					setValue("verification.gstVerified", false, { shouldValidate: true })
				}
				break
			case 4:
				// Review step - no validation needed
				isValid = true
				break
		}

		if (isValid && currentStep < 4) {
			setCurrentStep(currentStep + 1)
			window.scrollTo({ top: 0, behavior: "smooth" })
		} else if (!isValid) {
			// Scroll to first error
			const firstError = Object.keys(errors)[0]
			if (firstError) {
				const element = document.querySelector(`[name="${firstError}"]`)
				element?.scrollIntoView({ behavior: "smooth", block: "center" })
			}
		}
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
			// TODO: Call actual GST verification API when available
			// const { verifyGST } = await import('@/app/actions/onboarding')
			// const result = await verifyGST(gstNumber)

			// Extract organization name from form data for more realistic mock
			const orgName = getValues("basicInfo.name") || "Organization"
			const stateCode = gstNumber.substring(0, 2)
			const stateName = getStateFromCode(stateCode)
			const address = getValues("businessDetails.address") || "Registered Address"

			setGstDetails({
				legalName: orgName.toUpperCase(),
				tradeName: orgName.split(" ")[0],
				status: "Active",
				address: `${address}, ${stateName}`,
			})
			setValue("verification.gstVerified", true, { shouldValidate: true })
		} finally {
			setIsVerifyingGst(false)
		}
	}

	const handleVerifyPan = async () => {
		const panNumber = getValues("verification.panNumber") || ""

		// Validate PAN format first
		if (panNumber) {
			const isValid = await trigger("verification.panNumber")
			if (!isValid) {
				return
			}
		}

		setIsVerifyingPan(true)
		try {
			// TODO: Call actual PAN verification API when available
			// const { verifyPAN } = await import('@/app/actions/onboarding')
			// const result = await verifyPAN(panNumber)

			setValue("verification.panVerified", true, { shouldValidate: true })
		} finally {
			setIsVerifyingPan(false)
		}
	}

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
			console.error("Terms and conditions must be accepted")
			// Scroll to terms section
			const termsElement = document.querySelector('[data-terms-checkbox]')
			termsElement?.scrollIntoView({ behavior: "smooth", block: "center" })
			return
		}

		setIsLoading(true)
		try {
			const { submitOnboarding } = await import("@/app/actions")
			// Map OnboardingFormInput to OrganizationDraft format
			const formData = {
				step: 4 as const,
				basicInfo: data.basicInfo,
				businessDetails: data.businessDetails,
				verification: data.verification,
			}
			const result = await submitOnboarding(formData)

			if (!result.success) {
				throw new Error(result.error || "Failed to submit application")
			}

			router.push("/onboarding/pending")
		} catch (error: any) {
			console.error("Onboarding submission error:", error)
			// Show error to user
			alert(error.message || "Failed to submit application. Please try again.")
			// Don't redirect on error - let user fix and retry
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
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
						<Step2BusinessDetails register={register} control={control} errors={errors} />
					)}
					{currentStep === 3 && (
						<Step3Verification
							register={register}
							control={control}
							errors={errors}
							watch={watch}
							setValue={setValue}
							getValues={getValues}
							gstDetails={gstDetails}
							onVerifyGst={handleVerifyGst}
							onVerifyPan={handleVerifyPan}
							isVerifyingGst={isVerifyingGst}
							isVerifyingPan={isVerifyingPan}
						/>
					)}
					{currentStep === 4 && (
						<Step4Review
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
						{currentStep < 4 ? (
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
								<Button.Icon as={ArrowRight} />
							</Button.Root>
						) : (
								<Button.Root
									type="submit"
									variant="primary"
									disabled={isLoading || !termsAccepted}
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

// Step 2: Business Details
interface Step2Props {
	register: ReturnType<typeof useForm<OnboardingFormInput>>["register"]
	control: ReturnType<typeof useForm<OnboardingFormInput>>["control"]
	errors: ReturnType<typeof useForm<OnboardingFormInput>>["formState"]["errors"]
}

function Step2BusinessDetails({ register, control, errors }: Step2Props) {
	return (
		<div className="space-y-5 sm:space-y-6">
			<div>
				<h2 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">Business Details</h2>
				<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">Provide your business information</p>
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

			<FormField label="Address" required error={errors.businessDetails?.address?.message}>
				<Input.Root>
					<Input.Wrapper>
						<Input.El
							{...register("businessDetails.address")}
							placeholder="123, Tech Park, Sector 5"
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
		</div>
	)
}

// Step 3: Verification
interface Step3Props {
	register: ReturnType<typeof useForm<OnboardingFormInput>>["register"]
	control: ReturnType<typeof useForm<OnboardingFormInput>>["control"]
	errors: ReturnType<typeof useForm<OnboardingFormInput>>["formState"]["errors"]
	watch: ReturnType<typeof useForm<OnboardingFormInput>>["watch"]
	setValue: ReturnType<typeof useForm<OnboardingFormInput>>["setValue"]
	getValues: ReturnType<typeof useForm<OnboardingFormInput>>["getValues"]
	gstDetails: { legalName: string; tradeName: string; status: string; address: string } | null
	onVerifyGst: () => void
	onVerifyPan: () => void
	isVerifyingGst: boolean
	isVerifyingPan: boolean
}

function Step3Verification({
	register,
	control,
	errors,
	watch,
	setValue,
	getValues,
	gstDetails,
	onVerifyGst,
	onVerifyPan,
	isVerifyingGst,
	isVerifyingPan,
}: Step3Props) {
	const gstNumber = watch("verification.gstNumber")
	const gstVerified = watch("verification.gstVerified")
	const panNumber = watch("verification.panNumber")
	const panVerified = watch("verification.panVerified")
	const businessType = watch("businessDetails.businessType")

	return (
		<div className="space-y-4 sm:space-y-6">
			<div>
				<h2 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">Verification</h2>
				<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
					GST verification is mandatory for platform access
				</p>
			</div>

			{/* GST Verification */}
			<Callout variant="warning" title="GST VERIFICATION (Mandatory)" className="mb-4 sm:mb-6">
				GST verification is required to access the platform and receive payments.
			</Callout>

			<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
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
					<div className="mt-4 rounded-xl bg-bg-weak-50 p-3 sm:p-4 space-y-2">
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
							<div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
								<span className="font-medium text-text-strong-950 min-w-[100px]">Address:</span>
								<span className="text-text-strong-950">{gstDetails.address}</span>
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

			{/* PAN Verification */}
			<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
				<h3 className="text-label-xs sm:text-label-sm text-text-strong-950 mb-3 sm:mb-4 flex items-center gap-2">
					<FileText className="size-4" weight="duotone" />
					PAN VERIFICATION (Recommended)
				</h3>

						<FormField
							label="PAN Number"
							error={errors.verification?.panNumber?.message}
							hint="10-character PAN format"
						>
					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
						<div className="flex-1 min-w-0">
							<Input.Root>
								<Input.Wrapper>
									<Input.El
										{...register("verification.panNumber", {
											onChange: (e) => {
												setValue("verification.panNumber", e.target.value.toUpperCase(), {
													shouldValidate: true,
												})
											},
										})}
										placeholder="AABCU9603R"
										disabled={panVerified}
									/>
								</Input.Wrapper>
							</Input.Root>
					</div>
					<Button.Root
						type="button"
							variant={panVerified ? "neutral" : "primary"}
						onClick={onVerifyPan}
						disabled={isVerifyingPan || !panNumber || panVerified}
							className="w-full sm:w-auto shrink-0"
					>
						{isVerifyingPan ? "Verifying..." : panVerified ? "Verified" : "Verify PAN"}
					</Button.Root>
				</div>
				</FormField>

				{panVerified && (
					<div className="mt-3 flex items-center gap-2 text-success-base text-label-sm">
						<SealCheck className="size-4" weight="duotone" />
						PAN Verified
					</div>
				)}
			</div>

			{/* CIN Number (Optional) */}
			{(businessType === "private_limited" || businessType === "llp") && (
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
	)
}

// Step 4: Review
interface Step4Props {
	watch: ReturnType<typeof useForm<OnboardingFormInput>>["watch"]
	onEdit: (step: number) => void
	termsAccepted: boolean
	onTermsChange: (accepted: boolean) => void
}

function Step4Review({ watch, onEdit, termsAccepted, onTermsChange }: Step4Props) {
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
						<span className="text-text-strong-950 break-words">{formData.basicInfo?.name || "-"}</span>
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
						<span className="text-text-strong-950 text-right sm:text-left break-words">
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
					<Button.Root type="button" variant="ghost" size="xsmall" onClick={() => onEdit(3)}>
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
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
						<span className="text-text-sub-600 font-medium min-w-[120px]">PAN</span>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-text-strong-950 font-mono text-label-xs sm:text-paragraph-sm">
								{formData.verification?.panNumber || "-"}
							</span>
							{formData.verification?.panVerified ? (
								<span className="flex items-center gap-1 text-success-base text-label-xs font-medium">
									<SealCheck className="size-3.5" weight="duotone" /> Verified
								</span>
							) : (
								<span className="flex items-center gap-1 text-text-soft-400 text-label-xs">
									○ Not Provided
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
