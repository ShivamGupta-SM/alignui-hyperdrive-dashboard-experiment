"use client"

import { useState, useMemo, useRef, useEffect, Fragment } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useForm, Controller, useFieldArray, type ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Select from "@/components/ui/forms/select"
import * as Textarea from "@/components/ui/forms/textarea"
import { NumberInput } from "@/components/ui/forms/currency-input"
import * as Checkbox from "@/components/ui/forms/checkbox"
import * as Radio from "@/components/ui/forms/radio"
import * as Breadcrumb from "@/components/ui/navigation/breadcrumb"
import { Calendar } from "@/components/ui/forms/datepicker"
import * as Popover from "@/components/ui/layout/popover"
import { FormField } from "@/components/ui/forms/form-field"
import {
	ArrowLeft,
	ArrowRight,
	CalendarBlank,
	Plus,
	Trash,
	Megaphone,
	Package,
	CalendarDots,
	ListChecks,
	CheckCircle,
	Eye,
	Users,
	Clock,
	Globe,
	Lock,
	Info,
	Warning,
} from "@phosphor-icons/react"
import { cn } from "@/utils/cn"
import { formatDateShort, formatDateMedium, formatDateWithWeekday, getErrorMessage } from "@/lib/utils/format"
import { useLocalStorage } from "@/hooks/state"
import { CalloutWithActions } from "@/components/ui/feedback/callout"
import {
	CAMPAIGN_TYPE_OPTIONS,
	DELIVERABLE_TYPE_OPTIONS,
	DEFAULT_SUBMISSION_DEADLINE_DAYS,
} from "@/lib/constants"
import { createCampaign, updateCampaignStatus, type CampaignType } from "@/features/campaigns"
import { campaignFormSchema, type CampaignFormInput } from "@/features/campaigns/lib/validation"
import type { DeliverableType } from "@/lib/types"
import type { ProductWithStats } from "@/features/products"

type Product = ProductWithStats

const steps = [
	{ label: "Basic Info", shortLabel: "Info", value: 1, icon: Package },
	{ label: "Schedule", shortLabel: "Schedule", value: 2, icon: CalendarDots },
	{ label: "Deliverables", shortLabel: "Tasks", value: 3, icon: ListChecks },
	{ label: "Review", shortLabel: "Review", value: 4, icon: CheckCircle },
]

interface CreateCampaignClientProps {
	products: Product[]
}

// URL-based multi-tenancy: Get organizationId from URL params
export function CreateCampaignClient({ products }: CreateCampaignClientProps) {
	const router = useRouter()
	const params = useParams<{ organizationId: string }>()
	const organizationId = params.organizationId

	const [dismissedOnboardingAlert, setDismissedOnboardingAlert] = useLocalStorage<boolean>(
		"create-campaign-onboarding-alert-dismissed",
		false
	)

	// Ref map for form fields to avoid direct DOM manipulation
	const fieldRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>(new Map())

	// Stable reference for today's date to avoid re-renders
	const today = useMemo(() => new Date(), [])

	// Show onboarding alert if no organization
	const showOnboardingAlert = !organizationId && !dismissedOnboardingAlert

	// If no organization, show alert
	if (!organizationId) {
		return (
			<div className="space-y-5 sm:space-y-6">
				{/* ONBOARDING ALERT */}
				{showOnboardingAlert && (
					<CalloutWithActions
						variant="warning"
						title="Complete Your Organization Setup"
						dismissible
						onDismiss={() => setDismissedOnboardingAlert(true)}
						actions={
							<>
								<Button.Root
									variant="primary"
									size="small"
									onClick={() => router.push("/onboarding")}
								>
									<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
									Start Onboarding
								</Button.Root>
								<Button.Root
									variant="ghost"
									size="small"
									onClick={() => setDismissedOnboardingAlert(true)}
								>
									Maybe Later
								</Button.Root>
							</>
						}
					>
						To create campaigns, you need to complete your organization setup. This will only take a few minutes.
					</CalloutWithActions>
				)}

				{/* HEADER */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0">
						<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Create Campaign</h1>
					</div>
				</div>

				{/* EMPTY STATE */}
				{dismissedOnboardingAlert && (
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-8 sm:p-12 text-center">
						<div className="max-w-md mx-auto space-y-4">
							<div className="flex justify-center">
								<div className="flex size-16 items-center justify-center rounded-full bg-warning-lighter">
									<Warning weight="duotone" className="size-8 text-warning-base" />
								</div>
							</div>
							<div>
								<h3 className="text-title-h6 text-text-strong-950">Organization Setup Required</h3>
								<p className="text-paragraph-sm text-text-sub-600 mt-2">
									Complete your organization setup to create campaigns.
								</p>
							</div>
							<Button.Root variant="primary" size="medium" onClick={() => router.push("/onboarding")}>
								<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
								Start Onboarding
							</Button.Root>
						</div>
					</div>
				)}
			</div>
		)
	}
	const [currentStep, setCurrentStep] = useState(1)
	const [isLoading, setIsLoading] = useState(false)

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
	} = useForm<CampaignFormInput>({
		resolver: zodResolver(campaignFormSchema),
		mode: "onChange",
		defaultValues: {
			type: "cashback",
			isPublic: true,
			submissionDeadlineDays: DEFAULT_SUBMISSION_DEADLINE_DAYS,
			deliverables: [
				{
					id: crypto.randomUUID(),
					type: "order_screenshot",
					title: "Order Screenshot",
					isRequired: true,
					instructions: "",
				},
			],
			terms: [],
		},
	})

	const {
		fields: deliverableFields,
		append: appendDeliverable,
		remove: removeDeliverable,
		update: updateDeliverable,
	} = useFieldArray({
		control,
		name: "deliverables",
	})

	const handleNext = async () => {
		let isValid = false
		switch (currentStep) {
			case 1:
				isValid = await trigger(["productId", "title", "type"])
				break
			case 2:
				isValid = await trigger([
					"startDate",
					"endDate",
					"maxEnrollments",
					"submissionDeadlineDays",
				])
				break
			case 3:
				isValid = await trigger("deliverables")
				break
			case 4:
				isValid = true
				break
		}

		if (isValid && currentStep < 4) {
			setCurrentStep(currentStep + 1)
			window.scrollTo({ top: 0, behavior: "smooth" })
		}
		// Error scrolling is now handled by useEffect watching errors
	}

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
			window.scrollTo({ top: 0, behavior: "smooth" })
		}
	}

	const handleSaveDraft = async () => {
		const data = getValues()
		setIsLoading(true)
		try {
			// Prepare data for server action - URL-based multi-tenancy
			const campaignData = {
				organizationId,
				title: data.title || "",
				description: data.description || "",
				productId: data.productId || "",
				campaignType: data.type || "cashback",
				isPublic: data.isPublic ?? true,
				maxEnrollments: data.maxEnrollments || 0,
				startDate: data.startDate?.toISOString() || "",
				endDate: data.endDate?.toISOString() || "",
			}

			await createCampaign(campaignData)
			toast.success("Campaign saved as draft")
			router.push(`/dashboard/${organizationId}/campaigns`)
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to save campaign"))
		} finally {
			setIsLoading(false)
		}
	}

	const onSubmit = async (data: CampaignFormInput) => {
		setIsLoading(true)
		try {
			// Prepare data for server action - URL-based multi-tenancy
			const campaignData = {
				organizationId,
				title: data.title,
				description: data.description || "",
				productId: data.productId,
				campaignType: data.type,
				isPublic: data.isPublic,
				maxEnrollments: data.maxEnrollments,
				startDate: data.startDate.toISOString(),
				endDate: data.endDate.toISOString(),
			}

			// First create the campaign
			const result = await createCampaign(campaignData)
			const campaignId = result?.data?.id

			if (!campaignId) {
				throw new Error("Failed to create campaign")
			}

			// Then submit for approval
			await updateCampaignStatus({ id: campaignId, action: "submit" })

			toast.success("Campaign submitted for approval")
			router.push(`/dashboard/${organizationId}/campaigns`)
		} catch (error) {
			const errorMessage = getErrorMessage(error, "Failed to create campaign")
			// Check if error is related to approval status
			if (errorMessage.toLowerCase().includes("not yet approved") ||
			    errorMessage.toLowerCase().includes("not approved") ||
			    errorMessage.toLowerCase().includes("approval")) {
				toast.error("Organization Not Approved", {
					description: "Please complete onboarding and wait for admin approval before creating campaigns.",
					action: {
						label: "Go to Onboarding",
						onClick: () => router.push("/onboarding")
					},
					duration: 8000
				})
			} else {
				toast.error(errorMessage)
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex flex-col min-h-full">
			{/* Sticky Top Bar */}
			<div className="sticky top-0 z-20 bg-bg-white-0/95 backdrop-blur-sm border-b border-stroke-soft-200">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-14 sm:h-16">
						<div className="flex items-center gap-3">
							<BackButton />

							<div className="hidden sm:block h-5 w-px bg-stroke-soft-200" />

							<Breadcrumb.Root className="hidden sm:flex">
								<Breadcrumb.Item asChild>
									<Link href={`/dashboard/${organizationId}/campaigns`}>Campaigns</Link>
								</Breadcrumb.Item>
								<Breadcrumb.ArrowIcon as={ArrowRight} />
								<Breadcrumb.Item active>Create</Breadcrumb.Item>
							</Breadcrumb.Root>

							<span className="sm:hidden text-label-sm text-text-strong-950">Create Campaign</span>
						</div>

						<div className="flex items-center gap-2">
							<div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200">
								<span className="text-label-xs text-text-soft-400">Step</span>
								<span className="text-label-sm text-primary-base font-semibold">{currentStep}</span>
								<span className="text-label-xs text-text-soft-400">of 4</span>
							</div>

							<Button.Root
								variant="neutral"
								size="small"
								onClick={handleSaveDraft}
								disabled={isLoading}
								className="hidden sm:flex"
							>
								Save Draft
							</Button.Root>
						</div>
					</div>
				</div>
			</div>

			{/* Progress Bar (Mobile) */}
			<div className="sm:hidden bg-bg-white-0 border-b border-stroke-soft-200 px-4 py-3">
				<div className="flex items-center justify-between mb-2">
					<span className="text-label-xs text-text-sub-600">Step {currentStep} of 4</span>
					<span className="text-label-xs text-text-soft-400">{steps[currentStep - 1].label}</span>
				</div>
				<div className="h-1.5 bg-bg-weak-50 rounded-full overflow-hidden">
					<div
						className="h-full bg-primary-base rounded-full transition-all duration-300"
						style={{ width: `${(currentStep / 4) * 100}%` } as React.CSSProperties}
					/>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
					{/* Desktop Header */}
					<div className="hidden sm:block mb-8">
						<div className="flex items-center gap-4">
							<div className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary-base/10 to-primary-darker/10 ring-1 ring-inset ring-primary-base/20">
								<Megaphone weight="duotone" className="size-7 text-primary-base" />
							</div>
							<div className="flex-1">
								<h1 className="text-title-h4 text-text-strong-950">Create Campaign</h1>
								<p className="text-paragraph-sm text-text-sub-600 mt-0.5">
									Set up a new influencer marketing campaign
								</p>
							</div>
						</div>
					</div>

					{/* Stepper (Desktop) */}
					<div className="hidden sm:block mb-8">
						<div className="flex items-center justify-between">
							{steps.map((step, index) => {
								const Icon = step.icon
								const isCompleted = currentStep > step.value
								const isActive = currentStep === step.value

								return (
									<Fragment key={step.value}>
										<button
											onClick={() => isCompleted && setCurrentStep(step.value)}
											disabled={!isCompleted}
											className={cn(
												"flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
												isActive && "bg-primary-base/5 ring-1 ring-inset ring-primary-base/20",
												isCompleted && "cursor-pointer hover:bg-bg-weak-50",
												!isActive && !isCompleted && "opacity-50"
											)}
										>
											<div
												className={cn(
													"flex size-9 items-center justify-center rounded-lg transition-colors",
													isCompleted && "bg-success-base text-white",
													isActive && "bg-primary-base text-white",
													!isActive && !isCompleted && "bg-bg-weak-50 text-text-soft-400"
												)}
											>
												{isCompleted ? (
													<CheckCircle weight="fill" className="size-5" />
												) : (
													<Icon weight={isActive ? "fill" : "regular"} className="size-5" />
												)}
											</div>
											<div className="text-left hidden lg:block">
												<div
													className={cn(
														"text-label-sm font-medium",
														isActive
															? "text-primary-base"
															: isCompleted
																? "text-text-strong-950"
																: "text-text-soft-400"
													)}
												>
													{step.label}
												</div>
											</div>
										</button>

										{index < steps.length - 1 && (
											<div
												className={cn(
													"flex-1 h-0.5 mx-2 rounded-full transition-colors",
													currentStep > step.value
														? "bg-success-base"
														: currentStep > step.value - 1
															? "bg-primary-base/30"
															: "bg-stroke-soft-200"
												)}
											/>
										)}
									</Fragment>
								)
							})}
						</div>
					</div>

					{/* Step Content Card */}
					<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shadow-sm overflow-hidden">
						<div className="p-5 sm:p-8">
							<form id="campaign-form" onSubmit={handleSubmit(onSubmit)}>
								{currentStep === 1 && (
									<Step1BasicInfo
										register={register}
										control={control}
										errors={errors}
										watch={watch}
										setValue={setValue}
										products={products}
										organizationId={organizationId}
									/>
								)}
								{currentStep === 2 && (
									<Step2Schedule
										register={register}
										control={control}
										errors={errors}
										watch={watch}
										setValue={setValue}
									/>
								)}
								{currentStep === 3 && (
									<Step3Deliverables
										control={control}
										errors={errors}
										watch={watch}
										register={register}
										deliverableFields={deliverableFields}
										appendDeliverable={appendDeliverable}
										removeDeliverable={removeDeliverable}
										updateDeliverable={updateDeliverable}
									/>
								)}
								{currentStep === 4 && (
									<Step4Review watch={watch} onEdit={setCurrentStep} products={products} />
								)}
							</form>
						</div>
					</div>
				</div>
			</div>

			{/* Sticky Bottom Actions */}
			<div className="sticky bottom-0 z-10 bg-bg-white-0 border-t border-stroke-soft-200 px-4 py-3 sm:py-4 mt-auto">
				<div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
					<div>
						{currentStep > 1 && (
							<Button.Root variant="ghost" size="small" onClick={handleBack}>
								<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
								<span className="hidden sm:inline">Back</span>
							</Button.Root>
						)}
					</div>

					<div className="flex items-center gap-2 sm:gap-3">
						<Button.Root
							variant="neutral"
							size="small"
							onClick={handleSaveDraft}
							disabled={isLoading}
							className="sm:hidden"
						>
							Draft
						</Button.Root>

						{currentStep < 4 ? (
							<Button.Root type="button" variant="primary" size="small" onClick={handleNext}>
								<span className="hidden sm:inline">Continue</span>
								<span className="sm:hidden">Next</span>
								<Button.Icon><ArrowRight className="size-5" /></Button.Icon>
							</Button.Root>
						) : (
							<Button.Root
								type="submit"
								form="campaign-form"
								variant="primary"
								size="small"
								disabled={isLoading}
							>
								{isLoading ? "Submitting..." : "Submit for Approval"}
							</Button.Root>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

// Step 1: Basic Information
interface Step1Props {
	register: ReturnType<typeof useForm<CampaignFormInput>>["register"]
	control: ReturnType<typeof useForm<CampaignFormInput>>["control"]
	errors: ReturnType<typeof useForm<CampaignFormInput>>["formState"]["errors"]
	watch: ReturnType<typeof useForm<CampaignFormInput>>["watch"]
	setValue: ReturnType<typeof useForm<CampaignFormInput>>["setValue"]
	products: Product[]
	organizationId: string
}

function Step1BasicInfo({ register, control, errors, watch, setValue, products, organizationId }: Step1Props) {
	const productId = watch("productId")
	const type = watch("type")
	const isPublic = watch("isPublic")

	return (
		<div className="space-y-8">
			{/* Section Header */}
			<div>
				<h2 className="text-title-h5 text-text-strong-950 mb-1">Basic Information</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Set up the foundation of your campaign
				</p>
			</div>

			{/* Product Selection */}
			<FormField label="Select Product" required error={errors.productId?.message}>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{products.length === 0 ? (
						<div className="col-span-full">
							<div className="text-center py-8">
								<Package weight="duotone" className="size-12 mx-auto mb-4 text-text-soft-400" />
								<h3 className="text-label-md text-text-strong-950 mb-2">No products found</h3>
								<p className="text-paragraph-sm text-text-sub-600 mb-4">
									Add a product to create a campaign
								</p>
								<Button.Root variant="primary" size="small" asChild>
									<Link href={`/dashboard/${organizationId}/products/new`}>
										<Button.Icon><Plus className="size-5" /></Button.Icon>
										Add New Product
									</Link>
								</Button.Root>
							</div>
						</div>
					) : (
						products.map((product) => (
							<button
								key={product.id}
								type="button"
								onClick={() => setValue("productId", product.id, { shouldValidate: true })}
								className={cn(
									"flex items-center gap-3 p-3 rounded-xl text-left transition-all",
									"ring-1 ring-inset",
									productId === product.id
										? "ring-primary-base bg-primary-base/5 shadow-sm"
										: "ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-stroke-sub-300"
								)}
							>
								<div className="size-12 rounded-lg bg-bg-weak-50 flex items-center justify-center shrink-0">
									<Package weight="duotone" className="size-6 text-text-soft-400" />
								</div>
								<div className="min-w-0">
									<div className="text-label-sm text-text-strong-950 truncate">{product.name}</div>
									<div className="text-paragraph-xs text-text-soft-400">{product.sku}</div>
								</div>
							</button>
						))
					)}
				</div>
				<Link
					href={`/dashboard/${organizationId}/products/new`}
					className="inline-flex items-center gap-1.5 text-label-sm text-primary-base hover:text-primary-darker font-medium mt-2"
				>
					<Plus weight="bold" className="size-4" />
					Add New Product
				</Link>
			</FormField>

			{/* Campaign Title */}
			<FormField label="Campaign Title" required error={errors.title?.message}>
				<Input.Root>
					<Input.Wrapper>
						<Input.El {...register("title")} placeholder="e.g., Summer Sale 2024" />
					</Input.Wrapper>
				</Input.Root>
			</FormField>

			{/* Description */}
			<FormField label="Description" error={errors.description?.message}>
				<Textarea.Root
					{...register("description")}
					placeholder="Describe your campaign goals, special offers, and what you expect from participants..."
					rows={3}
				/>
			</FormField>

			{/* Campaign Type */}
			<FormField label="Campaign Type" required error={errors.type?.message}>
				<Controller
					name="type"
					control={control}
					render={({ field }: { field: ControllerRenderProps<CampaignFormInput, "type"> }) => (
						<Radio.Group
							value={field.value}
							onValueChange={field.onChange}
							className="grid grid-cols-1 sm:grid-cols-3 gap-3"
						>
							{CAMPAIGN_TYPE_OPTIONS.map((option) => (
								<label
									key={option.value}
									className={cn(
										"flex flex-col p-4 rounded-xl cursor-pointer transition-all",
										"ring-1 ring-inset",
										type === option.value
											? "ring-primary-base bg-primary-base/5 shadow-sm"
											: "ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-stroke-sub-300"
									)}
								>
									<div className="flex items-center gap-2 mb-2">
										<Radio.Item value={option.value} />
										<span className="text-label-sm text-text-strong-950 font-medium">
											{option.label}
										</span>
									</div>
									<span className="text-paragraph-xs text-text-soft-400 pl-6">
										{option.description}
									</span>
								</label>
							))}
						</Radio.Group>
					)}
				/>
			</FormField>

			{/* Visibility Toggle */}
			<div className="rounded-xl bg-bg-weak-50 p-4 ring-1 ring-inset ring-stroke-soft-200">
				<Controller
					name="isPublic"
					control={control}
					render={({ field }: { field: ControllerRenderProps<CampaignFormInput, "isPublic"> }) => (
						<label className="flex items-start gap-3 cursor-pointer">
							<Checkbox.Root
								checked={field.value}
								onCheckedChange={(checked) => field.onChange(checked === true)}
								className="mt-0.5"
							/>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									{isPublic ? (
										<Globe weight="duotone" className="size-4 text-success-base" />
									) : (
										<Lock weight="duotone" className="size-4 text-text-soft-400" />
									)}
									<span className="text-label-sm text-text-strong-950">
										{isPublic ? "Public Campaign" : "Private Campaign"}
									</span>
								</div>
								<span className="text-paragraph-xs text-text-soft-400 block mt-0.5">
									{isPublic
										? "Visible to all shoppers in the marketplace"
										: "Only accessible via direct link"}
								</span>
							</div>
						</label>
					)}
				/>
			</div>
		</div>
	)
}

// Step 2: Schedule
interface Step2Props {
	register: ReturnType<typeof useForm<CampaignFormInput>>["register"]
	control: ReturnType<typeof useForm<CampaignFormInput>>["control"]
	errors: ReturnType<typeof useForm<CampaignFormInput>>["formState"]["errors"]
	watch: ReturnType<typeof useForm<CampaignFormInput>>["watch"]
	setValue: ReturnType<typeof useForm<CampaignFormInput>>["setValue"]
}

function Step2Schedule({ register, control, errors, watch, setValue }: Step2Props) {
	const [startDateOpen, setStartDateOpen] = useState(false)
	const [endDateOpen, setEndDateOpen] = useState(false)
	const startDate = watch("startDate")
	const endDate = watch("endDate")

	const formatDate = (date?: Date): string => {
		if (!date) return "Select date"
		return formatDateWithWeekday(date)
	}

	return (
		<div className="space-y-8">
			{/* Section Header */}
			<div>
				<h2 className="text-title-h5 text-text-strong-950 mb-1">Schedule & Limits</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Define when your campaign runs and capacity limits
				</p>
			</div>

			{/* Campaign Period */}
			<div className="space-y-3">
				<label className="flex items-center gap-1 text-label-sm text-text-strong-950">
					<CalendarDots weight="duotone" className="size-4 text-primary-base" />
					Campaign Period
					<span className="text-error-base">*</span>
				</label>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Popover.Root open={startDateOpen} onOpenChange={setStartDateOpen}>
						<div className="space-y-1.5">
							<span className="text-label-xs text-text-sub-600">Start Date</span>
							<Popover.Trigger asChild>
								<button className="flex items-center gap-2 w-full px-4 py-3 rounded-xl ring-1 ring-inset ring-stroke-soft-200 text-left hover:bg-bg-weak-50 hover:ring-stroke-sub-300 transition-all">
									<CalendarBlank weight="duotone" className="size-5 text-text-soft-400 shrink-0" />
									<span
										className={cn(
											"flex-1 text-paragraph-sm",
											startDate ? "text-text-strong-950" : "text-text-soft-400"
										)}
									>
										{formatDate(startDate)}
									</span>
								</button>
							</Popover.Trigger>
						</div>
						<Popover.Content>
							<Calendar
								mode="single"
								selected={startDate}
								onSelect={(date: Date | undefined) => {
									if (date) {
										setValue("startDate", date, { shouldValidate: true })
										setStartDateOpen(false)
									}
								}}
								disabled={(date: Date) => {
									const today = new Date()
									today.setHours(0, 0, 0, 0)
									return date < today
								}}
							/>
						</Popover.Content>
					</Popover.Root>

					<Popover.Root open={endDateOpen} onOpenChange={setEndDateOpen}>
						<div className="space-y-1.5">
							<span className="text-label-xs text-text-sub-600">End Date</span>
							<Popover.Trigger asChild>
								<button className="flex items-center gap-2 w-full px-4 py-3 rounded-xl ring-1 ring-inset ring-stroke-soft-200 text-left hover:bg-bg-weak-50 hover:ring-stroke-sub-300 transition-all">
									<CalendarBlank weight="duotone" className="size-5 text-text-soft-400 shrink-0" />
									<span
										className={cn(
											"flex-1 text-paragraph-sm",
											endDate ? "text-text-strong-950" : "text-text-soft-400"
										)}
									>
										{formatDate(endDate)}
									</span>
								</button>
							</Popover.Trigger>
						</div>
						<Popover.Content>
							<Calendar
								mode="single"
								selected={endDate}
								onSelect={(date: Date | undefined) => {
									if (date) {
										setValue("endDate", date, { shouldValidate: true })
										setEndDateOpen(false)
									}
								}}
								disabled={(date: Date) => {
									const today = new Date()
									today.setHours(0, 0, 0, 0)
									return startDate ? date < startDate : date < today
								}}
							/>
						</Popover.Content>
					</Popover.Root>
				</div>
			</div>

			{/* Capacity Settings */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<FormField label="Maximum Enrollments" required error={errors.maxEnrollments?.message}>
					<NumberInput
						{...register("maxEnrollments", { valueAsNumber: true })}
						placeholder="500"
						size="medium"
					/>
					<p className="text-paragraph-xs text-text-soft-400 mt-1.5">
						Maximum shoppers who can enroll
					</p>
				</FormField>

				<FormField label="Submission Deadline" error={errors.submissionDeadlineDays?.message}>
					<NumberInput
						{...register("submissionDeadlineDays", { valueAsNumber: true })}
						placeholder="45"
						suffix="days"
						size="medium"
					/>
					<p className="text-paragraph-xs text-text-soft-400 mt-1.5">
						Days to submit proofs after enrolling
					</p>
				</FormField>
			</div>

			{/* Info Callout */}
			<div className="flex items-start gap-3 rounded-xl bg-information-lighter/50 p-4 ring-1 ring-inset ring-information-base/20">
				<Info weight="fill" className="size-5 text-information-base shrink-0 mt-0.5" />
				<div className="text-paragraph-sm text-text-sub-600">
					<strong className="text-information-base">Tip:</strong> Set realistic deadlines. 45 days
					is recommended for product delivery and content creation.
				</div>
			</div>
		</div>
	)
}

// Step 3: Deliverables
interface Step3Props {
	control: ReturnType<typeof useForm<CampaignFormInput>>["control"]
	errors: ReturnType<typeof useForm<CampaignFormInput>>["formState"]["errors"]
	watch: ReturnType<typeof useForm<CampaignFormInput>>["watch"]
	register: ReturnType<typeof useForm<CampaignFormInput>>["register"]
	deliverableFields: Array<{ id: string }>
	appendDeliverable: (value: CampaignFormInput["deliverables"][0]) => void
	removeDeliverable: (index: number) => void
	updateDeliverable: (index: number, value: CampaignFormInput["deliverables"][0]) => void
}

function Step3Deliverables({
	control,
	errors,
	watch,
	register,
	deliverableFields,
	appendDeliverable,
	removeDeliverable,
	updateDeliverable,
}: Step3Props) {
	return (
		<div className="space-y-8">
			{/* Section Header */}
			<div>
				<h2 className="text-title-h5 text-text-strong-950 mb-1">Campaign Deliverables</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Define what participants need to submit
				</p>
			</div>

			{/* Info Banner */}
			<div className="flex items-start gap-3 rounded-xl bg-success-lighter/50 p-4 ring-1 ring-inset ring-success-base/20">
				<CheckCircle weight="fill" className="size-5 text-success-base shrink-0 mt-0.5" />
				<div className="text-paragraph-sm text-text-sub-600">
					<strong className="text-success-base">Order screenshot</strong> is automatically required
					for OCR verification of purchases.
				</div>
			</div>

			{/* Deliverables List */}
			<div className="space-y-4">
				{deliverableFields.map((field, index) => {
					return (
						<div
							key={field.id}
							className={cn(
								"rounded-xl ring-1 ring-inset p-4 sm:p-5",
								index === 0 ? "ring-primary-base/30 bg-primary-base/5" : "ring-stroke-soft-200"
							)}
						>
							{/* Header Row */}
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div
										className={cn(
											"flex size-8 items-center justify-center rounded-lg text-label-sm font-semibold",
											index === 0 ? "bg-primary-base text-white" : "bg-bg-weak-50 text-text-sub-600"
										)}
									>
										{index + 1}
									</div>
									<div>
										<span className="text-label-sm text-text-strong-950 font-medium">
											{DELIVERABLE_TYPE_OPTIONS.find(
												(o) => o.value === watch(`deliverables.${index}.type`)
											)?.label || "Deliverable"}
										</span>
										{index === 0 && (
											<span className="text-paragraph-xs text-primary-base ml-2">
												(Auto-required)
											</span>
										)}
									</div>
								</div>

								<div className="flex items-center gap-2">
									{index > 0 && (
										<Controller
											name={`deliverables.${index}.isRequired`}
											control={control}
											render={({ field }: { field: ControllerRenderProps<CampaignFormInput, `deliverables.${number}.isRequired`> }) => (
												<label className="flex items-center gap-2 cursor-pointer">
													<Checkbox.Root
														checked={field.value}
														onCheckedChange={(checked) => field.onChange(checked === true)}
													/>
													<span className="text-label-xs text-text-sub-600">Required</span>
												</label>
											)}
										/>
									)}
									{index > 0 && (
										<Button.Root
											type="button"
											variant="ghost"
											size="xsmall"
											onClick={() => removeDeliverable(index)}
											className="text-error-base hover:bg-error-lighter -mr-1"
										>
											<Button.Icon><Trash className="size-5" /></Button.Icon>
										</Button.Root>
									)}
								</div>
							</div>

							{/* Form Row */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<FormField
									label="Type"
									required
									error={errors.deliverables?.[index]?.type?.message}
								>
									<Controller
										name={`deliverables.${index}.type`}
										control={control}
										render={({ field }: { field: ControllerRenderProps<CampaignFormInput, `deliverables.${number}.type`> }) => (
											<Select.Root
												value={field.value}
												onValueChange={field.onChange}
												disabled={index === 0}
											>
												<Select.Trigger>
													<Select.Value />
												</Select.Trigger>
												<Select.Content>
													{DELIVERABLE_TYPE_OPTIONS.map((option) => (
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
									label="Instructions"
									error={errors.deliverables?.[index]?.instructions?.message}
								>
									<Input.Root>
										<Input.Wrapper>
											<Input.El
												{...register(`deliverables.${index}.instructions`)}
												placeholder="e.g., Min 50 words, include product photo"
											/>
										</Input.Wrapper>
									</Input.Root>
								</FormField>
							</div>
						</div>
					)
				})}
			</div>
			{errors.deliverables && typeof errors.deliverables.message === "string" && (
				<p className="text-paragraph-xs text-error-base">{errors.deliverables.message}</p>
			)}

			<Button.Root
				type="button"
				variant="neutral"
				onClick={() =>
					appendDeliverable({
						id: crypto.randomUUID(),
						type: "delivery_photo",
						title: "",
						isRequired: false,
						instructions: "",
					})
				}
				className="w-full sm:w-auto"
			>
				<Button.Icon><Plus className="size-5" /></Button.Icon>
				Add Deliverable
			</Button.Root>
		</div>
	)
}

// Step 4: Review
interface Step4Props {
	watch: ReturnType<typeof useForm<CampaignFormInput>>["watch"]
	onEdit: (step: number) => void
	products: Product[]
}

function Step4Review({ watch, onEdit, products }: Step4Props) {
	const [termsAccepted, setTermsAccepted] = useState(false)
	const formData = watch()
	const product = products.find((p) => p.id === formData.productId)

	const formatDate = (date?: Date): string => {
		if (!date) return "Not set"
		return formatDateMedium(date)
	}

	const ReviewSection = ({
		title,
		step,
		children,
	}: { title: string; step: number; children: React.ReactNode }) => (
		<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
			<div className="flex items-center justify-between px-4 py-3 bg-bg-weak-50 border-b border-stroke-soft-200">
				<h3 className="text-label-sm text-text-strong-950 font-medium">{title}</h3>
				<Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(step)}>
					Edit
				</Button.Root>
			</div>
			<div className="p-4 space-y-3 text-paragraph-sm">{children}</div>
		</div>
	)

	const ReviewRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
		<div className="flex justify-between gap-4">
			<span className="text-text-sub-600">{label}</span>
			<span className="text-text-strong-950 text-right">{value}</span>
		</div>
	)

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div>
				<h2 className="text-title-h5 text-text-strong-950 mb-1">Review & Submit</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Please verify all details before submitting
				</p>
			</div>

			{/* Review Sections */}
			<div className="space-y-4">
				<ReviewSection title="Basic Information" step={1}>
					<ReviewRow label="Product" value={product?.name || "Not selected"} />
					<ReviewRow label="Title" value={formData.title || "Not set"} />
					<ReviewRow
						label="Type"
						value={CAMPAIGN_TYPE_OPTIONS.find((o) => o.value === formData.type)?.label}
					/>
					<ReviewRow label="Visibility" value={formData.isPublic ? "Public" : "Private"} />
				</ReviewSection>

				<ReviewSection title="Schedule & Limits" step={2}>
					<ReviewRow
						label="Period"
						value={`${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`}
					/>
					<ReviewRow
						label="Max Enrollments"
						value={formData.maxEnrollments?.toLocaleString() || "Not set"}
					/>
					<ReviewRow
						label="Submission Deadline"
						value={`${formData.submissionDeadlineDays} days`}
					/>
				</ReviewSection>

				<ReviewSection title="Deliverables" step={3}>
					{formData.deliverables?.map((d: CampaignFormInput["deliverables"][number], i: number) => (
						<ReviewRow
							key={i}
							label={DELIVERABLE_TYPE_OPTIONS.find((o) => o.value === d.type)?.label || d.type}
							value={d.isRequired ? "Required" : "Optional"}
						/>
					))}
				</ReviewSection>
			</div>

			{/* Terms Agreement */}
			<div className="rounded-xl bg-bg-weak-50 p-4 ring-1 ring-inset ring-stroke-soft-200">
				<label className="flex items-start gap-3 cursor-pointer">
					<Checkbox.Root
						checked={termsAccepted}
						onCheckedChange={(checked) => setTermsAccepted(checked === true)}
						className="mt-0.5"
					/>
					<span className="text-paragraph-sm text-text-sub-600">
						I confirm that all information provided is accurate and I agree to the{" "}
						<a href="/terms" className="text-primary-base hover:underline">
							Terms of Service
						</a>{" "}
						and{" "}
						<a href="/privacy" className="text-primary-base hover:underline">
							Privacy Policy
						</a>
					</span>
				</label>
			</div>
		</div>
	)
}

function BackButton() {
	const router = useRouter()
	return (
		<Button.Root variant="ghost" size="small" onClick={() => router.back()}>
			<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
		</Button.Root>
	)
}
