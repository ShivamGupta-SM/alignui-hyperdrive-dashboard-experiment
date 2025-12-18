/**
 * NOTION STANDARD Onboarding Page
 *
 * ~300 lines - Uses single hook, passthrough API pattern.
 *
 * Key Features:
 * - Single useOrganization hook (no server actions)
 * - Auto-save on blur (not interval)
 * - GST verification inline
 * - Simple 3-step flow
 */

"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

// Components
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Select from "@/components/ui/forms/select"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Checkbox from "@/components/ui/forms/checkbox"
import * as Stepper from "@/components/ui/primitives/horizontal-stepper"
import { FormField } from "@/components/ui/forms/form-field"
import { BackButton } from "@/components/ui/navigation/back-button"

// Icons
import { ArrowRight, Check, SealCheck, Clock, Spinner, XCircle } from "@phosphor-icons/react"

// Hook - Single source of truth
import { useOrganization } from "@/features/organizations"

// Constants
import { BUSINESS_TYPE_OPTIONS, INDUSTRY_CATEGORY_OPTIONS, INDIAN_STATES } from "@/lib/constants"

// =============================================================================
// Schema
// =============================================================================

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  businessType: z.string().min(1, "Required"),
  industryCategory: z.string().min(1, "Required"),
  contactPerson: z.string().min(2, "Required"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().min(5, "Required"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  pinCode: z.string().min(6, "Invalid PIN code"),
  gstNumber: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, "Invalid GST format"),
  cinNumber: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept terms"),
})

type FormData = z.infer<typeof onboardingSchema>

const STEPS = [
  { label: "Basic Info", value: 1 },
  { label: "Business & GST", value: 2 },
  { label: "Review", value: 3 },
]

const MAX_GST_VERIFICATIONS = 3 // Limit to prevent API abuse

// =============================================================================
// Main Component
// =============================================================================

export default function NotionOnboardingPage() {
  const router = useRouter()

  // Single hook for everything
  const {
    organization,
    draftOrg,
    needsOnboarding,
    isLoading,
    isGSTVerified,
    isRejected,
    create,
    update,
    verifyGST,
    submit,
    isCreating,
    isUpdating,
    isVerifyingGST,
    isSubmitting,
  } = useOrganization()

  const [step, setStep] = useState(1)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [gstDetails, setGstDetails] = useState<{
    legalName: string
    tradeName: string
    address: string
  } | null>(null)
  const [canChangeGST, setCanChangeGST] = useState(false) // For re-verification
  const [gstVerificationCount, setGstVerificationCount] = useState(0) // Track verification attempts

  const form = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      website: "",
      businessType: "pvt_ltd",
      industryCategory: "electronics",
      contactPerson: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      gstNumber: "",
      cinNumber: "",
      termsAccepted: false,
    },
  })

  // Redirect if already has approved org
  useEffect(() => {
    if (!isLoading && !needsOnboarding) {
      router.replace("/dashboard")
    }
  }, [isLoading, needsOnboarding, router])

  // Load draft data if exists
  useEffect(() => {
    if (draftOrg) {
      setOrgId(draftOrg.id)
      form.reset({
        name: draftOrg.name || "",
        description: draftOrg.description || "",
        website: draftOrg.website || "",
        businessType: draftOrg.businessType || "pvt_ltd",
        industryCategory: draftOrg.industryCategory || "electronics",
        contactPerson: draftOrg.contactPerson || "",
        phone: draftOrg.phoneNumber || "",
        address: draftOrg.address || "",
        city: draftOrg.city || "",
        state: draftOrg.state || "",
        pinCode: draftOrg.postalCode || "",
        gstNumber: draftOrg.gstNumber || "",
        cinNumber: draftOrg.cinNumber || "",
        termsAccepted: false,
      })
      if (draftOrg.gstVerified && draftOrg.gstLegalName) {
        setGstDetails({
          legalName: draftOrg.gstLegalName,
          tradeName: draftOrg.gstTradeName || "",
          address: draftOrg.address || "",
        })
      }
    }
  }, [draftOrg, form])

  // ==========================================================================
  // Auto-save on blur
  // ==========================================================================

  const handleFieldBlur = useCallback(
    async (fieldName: keyof FormData) => {
      if (!orgId) return

      const value = form.getValues(fieldName)
      if (value === undefined || value === "") return

      // Map form fields to API fields
      const fieldMap: Record<string, string> = {
        phone: "phoneNumber",
        pinCode: "postalCode",
      }

      const apiField = fieldMap[fieldName] || fieldName

      try {
        await update({ id: orgId, [apiField]: value })
      } catch {
        // Silent fail for auto-save
      }
    },
    [orgId, update, form]
  )

  // ==========================================================================
  // Create org when moving past step 1
  // ==========================================================================

  const handleCreateOrg = async (): Promise<boolean> => {
    const name = form.getValues("name")
    if (!name) return false
    if (orgId) return true // Already created

    try {
      const newOrg = await create(name)
      setOrgId(newOrg.id)
      return true
    } catch {
      toast.error("Failed to create organization. Please try again.")
      return false
    }
  }

  // ==========================================================================
  // GST Verification
  // ==========================================================================

  const handleVerifyGST = async () => {
    const gstNumber = form.getValues("gstNumber")
    if (!gstNumber || !orgId) return

    // Check rate limit on frontend (backend will also enforce)
    if (gstVerificationCount >= MAX_GST_VERIFICATIONS) {
      toast.error(`GST verification limit reached (${MAX_GST_VERIFICATIONS} attempts). Please contact support.`)
      return
    }

    try {
      const result = await verifyGST({ gstNumber, orgId })
      if (result.gstDetails) {
        setGstDetails({
          legalName: result.gstDetails.legalName || "",
          tradeName: result.gstDetails.tradeName || "",
          address: result.gstDetails.address || "",
        })
        setGstVerificationCount((prev) => prev + 1)
        setCanChangeGST(false) // Reset change mode after successful verification

        // Auto-fill address from GST
        if (result.gstDetails.address) {
          form.setValue("address", result.gstDetails.address)
        }
      }
    } catch {
      // Error toast handled by hook
    }
  }

  // Allow user to change GST before submission
  const handleChangeGST = () => {
    if (gstVerificationCount >= MAX_GST_VERIFICATIONS) {
      toast.error(`GST verification limit reached (${MAX_GST_VERIFICATIONS} attempts). Please contact support.`)
      return
    }
    setCanChangeGST(true)
    setGstDetails(null) // Clear previous verification
    form.setValue("gstNumber", "") // Clear the field
  }

  // ==========================================================================
  // Submit for Approval
  // ==========================================================================

  const handleSubmit = async () => {
    if (!orgId) return

    try {
      await submit(orgId)
      router.push("/onboarding/pending")
    } catch {
      // Error toast handled by hook
    }
  }

  // ==========================================================================
  // Step Navigation
  // ==========================================================================

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger(["name"])
      if (!isValid) return

      // Create org when leaving step 1
      if (!orgId) {
        const created = await handleCreateOrg()
        if (!created) return // Don't proceed if creation failed
      }
    }

    if (step === 2) {
      const isValid = await form.trigger([
        "businessType",
        "industryCategory",
        "contactPerson",
        "phone",
        "address",
        "city",
        "state",
        "pinCode",
        "gstNumber",
      ])
      if (!isValid) return

      // Require GST verification
      if (!isGSTVerified && !gstDetails) {
        toast.error("Please verify your GST before continuing")
        return
      }
    }

    if (step < 3) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8 animate-spin text-primary-base" />
      </div>
    )
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Rejection Banner - Show when org is rejected */}
      {isRejected && (organization as { rejectionReason?: string })?.rejectionReason && (
        <div className="mb-6 p-4 rounded-xl bg-error-50 border border-error-200">
          <div className="flex items-start gap-3">
            <XCircle className="size-5 text-error-600 shrink-0 mt-0.5" weight="duotone" />
            <div>
              <h3 className="text-label-sm font-semibold text-error-700 mb-1">
                Application Rejected
              </h3>
              <p className="text-paragraph-sm text-error-600">
                {(organization as { rejectionReason?: string }).rejectionReason}
              </p>
              <p className="text-paragraph-xs text-error-500 mt-2">
                Please update your details and resubmit for approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="mb-6">
        <Stepper.Root>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.value}>
              <Stepper.Item
                state={step > s.value ? "completed" : step === s.value ? "active" : "default"}
                onClick={() => step > s.value && setStep(s.value)}
                className={step > s.value ? "cursor-pointer" : ""}
              >
                <Stepper.ItemIndicator>
                  {step > s.value ? <Check className="size-4" weight="bold" /> : s.value}
                </Stepper.ItemIndicator>
                {s.label}
              </Stepper.Item>
              {i < STEPS.length - 1 && <Stepper.SeparatorIcon />}
            </React.Fragment>
          ))}
        </Stepper.Root>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl bg-bg-white-0 p-6 ring-1 ring-stroke-soft-200 shadow-sm">
        {/* Step 1: Basic Info */}
        {step === 1 && <Step1BasicInfo form={form} onBlur={handleFieldBlur} />}

        {/* Step 2: Business & GST */}
        {step === 2 && (
          <Step2BusinessGST
            form={form}
            gstDetails={gstDetails}
            isGSTVerified={(isGSTVerified || !!gstDetails) && !canChangeGST}
            isVerifying={isVerifyingGST}
            onVerifyGST={handleVerifyGST}
            onChangeGST={handleChangeGST}
            gstVerificationCount={gstVerificationCount}
            maxVerifications={MAX_GST_VERIFICATIONS}
            onBlur={handleFieldBlur}
          />
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Step3Review
            form={form}
            gstDetails={gstDetails}
            isGSTVerified={isGSTVerified || !!gstDetails}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stroke-soft-200">
          {step > 1 ? <BackButton type="button" onClick={prevStep} /> : <div />}

          {step < 3 ? (
            <Button.Root
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Spinner className="size-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="size-5 ml-2" />
                </>
              )}
            </Button.Root>
          ) : (
            <Button.Root
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !form.watch("termsAccepted") ||
                (!isGSTVerified && !gstDetails)
              }
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit for Approval"
              )}
            </Button.Root>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Step 1: Basic Info
// =============================================================================

function Step1BasicInfo({
  form,
  onBlur,
}: {
  form: UseFormReturn<FormData>
  onBlur: (field: keyof FormData) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-title-h4 text-text-strong-950 mb-1">Basic Information</h2>
        <p className="text-paragraph-sm text-text-sub-600">Tell us about your organization</p>
      </div>

      <FormField label="Organization Name" required error={form.formState.errors.name?.message}>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              {...form.register("name")}
              placeholder="Acme Corporation Pvt. Ltd."
              onBlur={() => onBlur("name")}
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      <FormField label="Website" error={form.formState.errors.website?.message}>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              {...form.register("website")}
              placeholder="https://example.com"
              onBlur={() => onBlur("website")}
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      <FormField label="Description">
        <Textarea.Root
          {...form.register("description")}
          placeholder="Brief description of your organization..."
          rows={3}
          onBlur={() => onBlur("description")}
        />
      </FormField>
    </div>
  )
}

// =============================================================================
// Step 2: Business & GST
// =============================================================================

function Step2BusinessGST({
  form,
  gstDetails,
  isGSTVerified,
  isVerifying,
  onVerifyGST,
  onChangeGST,
  gstVerificationCount,
  maxVerifications,
  onBlur,
}: {
  form: UseFormReturn<FormData>
  gstDetails: { legalName: string; tradeName: string; address: string } | null
  isGSTVerified: boolean
  isVerifying: boolean
  onVerifyGST: () => void
  onChangeGST: () => void
  gstVerificationCount: number
  maxVerifications: number
  onBlur: (field: keyof FormData) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-title-h4 text-text-strong-950 mb-1">Business & Verification</h2>
        <p className="text-paragraph-sm text-text-sub-600">
          Verify your GST and complete business details
        </p>
      </div>

      {/* GST Verification Section */}
      <div className="rounded-xl bg-bg-weak-50 p-4 ring-1 ring-stroke-soft-200">
        <h3 className="text-label-sm font-medium mb-3">GST Verification (Mandatory)</h3>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  {...form.register("gstNumber")}
                  placeholder="29AABCU9603R1ZM"
                  disabled={isGSTVerified}
                  onChange={(e) => form.setValue("gstNumber", e.target.value.toUpperCase())}
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
          <Button.Root
            type="button"
            variant={isGSTVerified ? "neutral" : "primary"}
            onClick={onVerifyGST}
            disabled={isVerifying || isGSTVerified || !form.watch("gstNumber")}
          >
            {isVerifying ? (
              <Spinner className="size-4 animate-spin" />
            ) : isGSTVerified ? (
              <>
                <SealCheck className="size-4 mr-1" /> Verified
              </>
            ) : (
              "Verify"
            )}
          </Button.Root>
        </div>

        {gstDetails && (
          <div className="mt-3 p-3 bg-bg-white-0 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-success-base text-label-sm font-medium">
                <SealCheck className="size-4" weight="duotone" /> GST Verified
              </div>
              {/* Allow changing GST before submission (with rate limit check) */}
              {gstVerificationCount < maxVerifications && (
                <Button.Root
                  type="button"
                  variant="ghost"
                  size="xsmall"
                  onClick={onChangeGST}
                >
                  Change GST
                </Button.Root>
              )}
            </div>
            <p className="text-paragraph-sm">
              <strong>Legal Name:</strong> {gstDetails.legalName}
            </p>
            <p className="text-paragraph-sm">
              <strong>Trade Name:</strong> {gstDetails.tradeName}
            </p>
            {gstVerificationCount > 0 && (
              <p className="text-paragraph-xs text-text-soft-400 mt-2">
                Verifications used: {gstVerificationCount}/{maxVerifications}
              </p>
            )}
          </div>
        )}

        {form.formState.errors.gstNumber && (
          <p className="mt-2 text-paragraph-xs text-error-base">
            {form.formState.errors.gstNumber.message}
          </p>
        )}
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Business Type" required>
          <Controller
            name="businessType"
            control={form.control}
            render={({ field }) => (
              <Select.Root value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {BUSINESS_TYPE_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
        </FormField>

        <FormField label="Industry" required>
          <Controller
            name="industryCategory"
            control={form.control}
            render={({ field }) => (
              <Select.Root value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {INDUSTRY_CATEGORY_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Contact Person"
          required
          error={form.formState.errors.contactPerson?.message}
        >
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                {...form.register("contactPerson")}
                placeholder="John Doe"
                onBlur={() => onBlur("contactPerson")}
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>

        <FormField label="Phone" required error={form.formState.errors.phone?.message}>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                {...form.register("phone")}
                placeholder="+91 9876543210"
                onBlur={() => onBlur("phone")}
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>
      </div>

      <FormField label="Address" required error={form.formState.errors.address?.message}>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              {...form.register("address")}
              placeholder="123, Tech Park"
              onBlur={() => onBlur("address")}
            />
          </Input.Wrapper>
        </Input.Root>
      </FormField>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="City" required error={form.formState.errors.city?.message}>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                {...form.register("city")}
                placeholder="Bengaluru"
                onBlur={() => onBlur("city")}
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>

        <FormField label="State" required error={form.formState.errors.state?.message}>
          <Controller
            name="state"
            control={form.control}
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

        <FormField label="PIN Code" required error={form.formState.errors.pinCode?.message}>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                {...form.register("pinCode")}
                placeholder="560001"
                onBlur={() => onBlur("pinCode")}
              />
            </Input.Wrapper>
          </Input.Root>
        </FormField>
      </div>
    </div>
  )
}

// =============================================================================
// Step 3: Review
// =============================================================================

function Step3Review({
  form,
  gstDetails,
  isGSTVerified,
}: {
  form: UseFormReturn<FormData>
  gstDetails: { legalName: string; tradeName: string; address: string } | null
  isGSTVerified: boolean
}) {
  const data = form.watch()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-title-h4 text-text-strong-950 mb-1">Review & Submit</h2>
        <p className="text-paragraph-sm text-text-sub-600">Verify all details before submitting</p>
      </div>

      {/* Organization Summary */}
      <div className="rounded-xl ring-1 ring-stroke-soft-200 p-4 space-y-2">
        <h3 className="text-label-sm font-medium">Organization</h3>
        <p>
          <strong>Name:</strong> {data.name}
        </p>
        <p>
          <strong>Website:</strong> {data.website || "-"}
        </p>
      </div>

      {/* Business Details Summary */}
      <div className="rounded-xl ring-1 ring-stroke-soft-200 p-4 space-y-2">
        <h3 className="text-label-sm font-medium">Business Details</h3>
        <p>
          <strong>Type:</strong> {data.businessType?.replace(/_/g, " ")}
        </p>
        <p>
          <strong>Industry:</strong> {data.industryCategory?.replace(/_/g, " ")}
        </p>
        <p>
          <strong>Contact:</strong> {data.contactPerson}
        </p>
        <p>
          <strong>Phone:</strong> {data.phone}
        </p>
        <p>
          <strong>Address:</strong> {data.address}, {data.city}, {data.state} - {data.pinCode}
        </p>
      </div>

      {/* GST Summary */}
      <div className="rounded-xl ring-1 ring-stroke-soft-200 p-4 space-y-2">
        <h3 className="text-label-sm font-medium">Verification</h3>
        <div className="flex items-center gap-2">
          <strong>GST:</strong> {data.gstNumber}
          {isGSTVerified ? (
            <span className="flex items-center gap-1 text-success-base text-label-xs">
              <SealCheck className="size-3.5" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-text-soft-400 text-label-xs">
              <Clock className="size-3.5" /> Not Verified
            </span>
          )}
        </div>
        {gstDetails && (
          <p className="text-paragraph-sm text-text-sub-600">
            Legal Name: {gstDetails.legalName}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="rounded-xl bg-bg-weak-50 p-4 ring-1 ring-stroke-soft-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <Controller
            name="termsAccepted"
            control={form.control}
            render={({ field }) => (
              <Checkbox.Root
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
            )}
          />
          <span className="text-paragraph-sm text-text-sub-600">
            I confirm all information is accurate and agree to the{" "}
            <a href="/terms" className="text-primary-base hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary-base hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
        {form.formState.errors.termsAccepted && (
          <p className="mt-2 text-paragraph-xs text-error-base">
            {form.formState.errors.termsAccepted.message}
          </p>
        )}
      </div>
    </div>
  )
}
