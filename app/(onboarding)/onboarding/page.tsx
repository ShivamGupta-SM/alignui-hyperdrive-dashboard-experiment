'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Select from '@/components/ui/select'
import * as Textarea from '@/components/ui/textarea'
import * as Checkbox from '@/components/ui/checkbox'
import * as HorizontalStepper from '@/components/ui/horizontal-stepper'
import * as FileUpload from '@/components/ui/file-upload'
import * as Hint from '@/components/ui/hint'
import { Callout } from '@/components/ui/callout'
import * as ProgressCircle from '@/components/ui/progress-circle'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  SealCheck,
  Clock,
  CloudArrowUp,
  Info,
} from '@phosphor-icons/react'
import { cn } from '@/utils/cn'
import { BUSINESS_TYPE_OPTIONS, INDUSTRY_CATEGORY_OPTIONS, INDIAN_STATES } from '@/lib/constants'
import type { OrganizationDraft, BusinessType, IndustryCategory } from '@/lib/types'

const steps = [
  { label: 'Basic Info', value: 1 },
  { label: 'Business', value: 2 },
  { label: 'Verification', value: 3 },
  { label: 'Review', value: 4 },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isVerifyingGst, setIsVerifyingGst] = React.useState(false)
  const [isVerifyingPan, setIsVerifyingPan] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState<OrganizationDraft>({
    step: 1,
    basicInfo: {
      name: '',
      description: '',
      website: '',
    },
    businessDetails: {
      businessType: 'private_limited',
      industryCategory: 'electronics',
      contactPerson: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
    },
    verification: {
      gstNumber: '',
      gstVerified: false,
      panNumber: '',
      panVerified: false,
      cinNumber: '',
    },
  })

  // GST verification result
  const [gstDetails, setGstDetails] = React.useState<{
    legalName: string
    tradeName: string
    status: string
    address: string
  } | null>(null)

  const updateFormData = (updates: Partial<OrganizationDraft>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const updateBasicInfo = (updates: Partial<NonNullable<OrganizationDraft['basicInfo']>>) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo!, ...updates },
    }))
  }

  const updateBusinessDetails = (updates: Partial<NonNullable<OrganizationDraft['businessDetails']>>) => {
    setFormData((prev) => ({
      ...prev,
      businessDetails: { ...prev.businessDetails!, ...updates },
    }))
  }

  const updateVerification = (updates: Partial<NonNullable<OrganizationDraft['verification']>>) => {
    setFormData((prev) => ({
      ...prev,
      verification: { ...prev.verification!, ...updates },
    }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleVerifyGst = async () => {
    setIsVerifyingGst(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setGstDetails({
        legalName: 'ACME CORPORATION PVT LTD',
        tradeName: 'Acme Corp',
        status: 'Active',
        address: '123, Tech Park, Bengaluru',
      })
      updateVerification({ gstVerified: true })
    } finally {
      setIsVerifyingGst(false)
    }
  }

  const handleVerifyPan = async () => {
    setIsVerifyingPan(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      updateVerification({ panVerified: true })
    } finally {
      setIsVerifyingPan(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // TODO: Submit organization for approval
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push('/onboarding/pending')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.basicInfo?.name
      case 2:
        return !!(
          formData.businessDetails?.businessType &&
          formData.businessDetails?.industryCategory &&
          formData.businessDetails?.contactPerson &&
          formData.businessDetails?.phone &&
          formData.businessDetails?.address &&
          formData.businessDetails?.city &&
          formData.businessDetails?.state &&
          formData.businessDetails?.pinCode
        )
      case 3:
        return !!formData.verification?.gstVerified
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Stepper */}
      <div className="mb-8">
        <HorizontalStepper.Root>
          {steps.map((step, index) => (
            <React.Fragment key={step.value}>
              <HorizontalStepper.Item
                state={
                  currentStep > step.value
                    ? 'completed'
                    : currentStep === step.value
                    ? 'active'
                    : 'default'
                }
                onClick={() => currentStep > step.value && setCurrentStep(step.value)}
                className={currentStep > step.value ? 'cursor-pointer' : ''}
              >
                <HorizontalStepper.ItemIndicator>
                  {currentStep > step.value ? <Check className="size-4" weight="bold" /> : step.value}
                </HorizontalStepper.ItemIndicator>
                {step.label}
              </HorizontalStepper.Item>
              {index < steps.length - 1 && <HorizontalStepper.SeparatorIcon />}
            </React.Fragment>
          ))}
        </HorizontalStepper.Root>
      </div>

      {/* Step Content */}
      <div className="rounded-20 bg-bg-white-0 p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-regular">
        {currentStep === 1 && (
          <Step1BasicInfo
            formData={formData}
            updateBasicInfo={updateBasicInfo}
          />
        )}
        {currentStep === 2 && (
          <Step2BusinessDetails
            formData={formData}
            updateBusinessDetails={updateBusinessDetails}
          />
        )}
        {currentStep === 3 && (
          <Step3Verification
            formData={formData}
            updateVerification={updateVerification}
            gstDetails={gstDetails}
            onVerifyGst={handleVerifyGst}
            onVerifyPan={handleVerifyPan}
            isVerifyingGst={isVerifyingGst}
            isVerifyingPan={isVerifyingPan}
          />
        )}
        {currentStep === 4 && (
          <Step4Review
            formData={formData}
            onEdit={setCurrentStep}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stroke-soft-200">
          <div>
            {currentStep > 1 && (
              <Button.Root variant="basic" onClick={handleBack}>
                <Button.Icon as={ArrowLeft} />
                Back
              </Button.Root>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <Button.Root
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
                <Button.Icon as={ArrowRight} />
              </Button.Root>
            ) : (
              <Button.Root
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit for Approval'}
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
  formData: OrganizationDraft
  updateBasicInfo: (updates: Partial<NonNullable<OrganizationDraft['basicInfo']>>) => void
}

function Step1BasicInfo({ formData, updateBasicInfo }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-h5 text-text-strong-950 mb-1">Basic Information</h2>
        <p className="text-paragraph-sm text-text-sub-600">
          Tell us about your organization
        </p>
      </div>

      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Organization Name <span className="text-error-base">*</span>
        </label>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              placeholder="e.g., Acme Corporation Pvt. Ltd."
              value={formData.basicInfo?.name || ''}
              onChange={(e) => updateBasicInfo({ name: e.target.value })}
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Logo
        </label>
        <FileUpload.Root htmlFor="org-logo">
          <FileUpload.Icon as={CloudArrowUp} />
          <FileUpload.Button>Choose file</FileUpload.Button>
          <p className="text-paragraph-xs text-text-soft-400">
            PNG or JPG, max 2MB
          </p>
          <input
            id="org-logo"
            type="file"
            accept="image/*"
            className="sr-only"
          />
        </FileUpload.Root>
        <p className="mt-1 text-paragraph-xs text-text-soft-400">
          Recommended: 200x200px
        </p>
      </div>

      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Website
        </label>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              placeholder="https://www.example.com"
              value={formData.basicInfo?.website || ''}
              onChange={(e) => updateBasicInfo({ website: e.target.value })}
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Description
        </label>
        <Textarea.Root
          placeholder="Brief description of your organization..."
          value={formData.basicInfo?.description || ''}
          onChange={(e) => updateBasicInfo({ description: e.target.value })}
          rows={3}
        />
        <Hint.Root>
          <Hint.Icon as={Info} />
          This will be visible to shoppers on your campaigns
        </Hint.Root>
      </div>
    </div>
  )
}

// Step 2: Business Details
interface Step2Props {
  formData: OrganizationDraft
  updateBusinessDetails: (updates: Partial<NonNullable<OrganizationDraft['businessDetails']>>) => void
}

function Step2BusinessDetails({ formData, updateBusinessDetails }: Step2Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-h5 text-text-strong-950 mb-1">Business Details</h2>
        <p className="text-paragraph-sm text-text-sub-600">
          Provide your business information
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Business Type <span className="text-error-base">*</span>
          </label>
          <Select.Root
            value={formData.businessDetails?.businessType}
            onValueChange={(value) => updateBusinessDetails({ businessType: value as BusinessType })}
          >
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
        </div>
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Industry Category <span className="text-error-base">*</span>
          </label>
          <Select.Root
            value={formData.businessDetails?.industryCategory}
            onValueChange={(value) => updateBusinessDetails({ industryCategory: value as IndustryCategory })}
          >
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Contact Person <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                placeholder="John Doe"
                value={formData.businessDetails?.contactPerson || ''}
                onChange={(e) => updateBusinessDetails({ contactPerson: e.target.value })}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            Phone Number <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                placeholder="+91 9876543210"
                value={formData.businessDetails?.phone || ''}
                onChange={(e) => updateBusinessDetails({ phone: e.target.value })}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>

      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Address <span className="text-error-base">*</span>
        </label>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              placeholder="123, Tech Park, Sector 5"
              value={formData.businessDetails?.address || ''}
              onChange={(e) => updateBusinessDetails({ address: e.target.value })}
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            City <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                placeholder="Bengaluru"
                value={formData.businessDetails?.city || ''}
                onChange={(e) => updateBusinessDetails({ city: e.target.value })}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            State <span className="text-error-base">*</span>
          </label>
          <Select.Root
            value={formData.businessDetails?.state}
            onValueChange={(value) => updateBusinessDetails({ state: value })}
          >
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
        </div>
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            PIN Code <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                placeholder="560001"
                value={formData.businessDetails?.pinCode || ''}
                onChange={(e) => updateBusinessDetails({ pinCode: e.target.value })}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>
    </div>
  )
}

// Step 3: Verification
interface Step3Props {
  formData: OrganizationDraft
  updateVerification: (updates: Partial<NonNullable<OrganizationDraft['verification']>>) => void
  gstDetails: { legalName: string; tradeName: string; status: string; address: string } | null
  onVerifyGst: () => void
  onVerifyPan: () => void
  isVerifyingGst: boolean
  isVerifyingPan: boolean
}

function Step3Verification({
  formData,
  updateVerification,
  gstDetails,
  onVerifyGst,
  onVerifyPan,
  isVerifyingGst,
  isVerifyingPan,
}: Step3Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-h5 text-text-strong-950 mb-1">Verification</h2>
        <p className="text-paragraph-sm text-text-sub-600">
          GST verification is mandatory for platform access
        </p>
      </div>

      {/* GST Verification */}
      <Callout variant="warning" title="GST VERIFICATION (Mandatory)" className="mb-6">
        GST verification is required to access the platform and receive payments.
      </Callout>
      
      <div className="rounded-10 ring-1 ring-inset ring-stroke-soft-200 p-4">
        
        <div className="flex gap-3">
          <div className="flex-1">
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  placeholder="29AABCU9603R1ZM"
                  value={formData.verification?.gstNumber || ''}
                  onChange={(e) => updateVerification({ gstNumber: e.target.value.toUpperCase() })}
                  disabled={formData.verification?.gstVerified}
                />
              </Input.Wrapper>
            </Input.Root>
            <Hint.Root>
              <Hint.Icon as={Info} />
              15-character GSTIN format
            </Hint.Root>
          </div>
          <Button.Root
            variant="primary"
            onClick={onVerifyGst}
            disabled={isVerifyingGst || !formData.verification?.gstNumber || formData.verification?.gstVerified}
          >
            {isVerifyingGst ? 'Verifying...' : formData.verification?.gstVerified ? 'Verified' : 'Verify GST'}
          </Button.Root>
        </div>

        {gstDetails && (
          <div className="mt-4 rounded-10 bg-bg-white-0 p-3 space-y-1">
            <div className="flex items-center gap-2 text-success-base text-label-sm">
              <ProgressCircle.Root value={100} size="48" className="size-5">
                <span className="text-[8px]">✓</span>
              </ProgressCircle.Root>
              GST Verified
            </div>
            <div className="text-paragraph-sm text-text-sub-600">
              <div>Legal Name: <span className="text-text-strong-950">{gstDetails.legalName}</span></div>
              <div>Trade Name: <span className="text-text-strong-950">{gstDetails.tradeName}</span></div>
              <div>Status: <span className="text-success-base">{gstDetails.status}</span></div>
              <div>Address: <span className="text-text-strong-950">{gstDetails.address}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* PAN Verification */}
      <div className="rounded-10 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <h3 className="text-label-sm text-text-strong-950 mb-3">📋 PAN VERIFICATION (Recommended)</h3>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <Input.Root>
              <Input.Wrapper>
                <Input.El
                  placeholder="AABCU9603R"
                  value={formData.verification?.panNumber || ''}
                  onChange={(e) => updateVerification({ panNumber: e.target.value.toUpperCase() })}
                  disabled={formData.verification?.panVerified}
                />
              </Input.Wrapper>
            </Input.Root>
            <Hint.Root>
              <Hint.Icon as={Info} />
              10-character PAN format
            </Hint.Root>
          </div>
          <Button.Root
            variant="basic"
            onClick={onVerifyPan}
            disabled={isVerifyingPan || !formData.verification?.panNumber || formData.verification?.panVerified}
          >
            {isVerifyingPan ? 'Verifying...' : formData.verification?.panVerified ? 'Verified' : 'Verify PAN'}
          </Button.Root>
        </div>

        {formData.verification?.panVerified && (
          <div className="mt-3 flex items-center gap-2 text-success-base text-label-sm">
            <SealCheck className="size-4" weight="duotone" />
            PAN Verified
          </div>
        )}
      </div>

      {/* CIN Number (Optional) */}
      {(formData.businessDetails?.businessType === 'private_limited' ||
        formData.businessDetails?.businessType === 'llp') && (
        <div>
          <label className="block text-label-sm text-text-strong-950 mb-2">
            CIN Number (for Pvt Ltd/LLP only)
          </label>
          <Input.Root>
            <Input.Wrapper>
              <Input.El
                placeholder="U72200KA2020PTC123456"
                value={formData.verification?.cinNumber || ''}
                onChange={(e) => updateVerification({ cinNumber: e.target.value.toUpperCase() })}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
      )}
    </div>
  )
}

// Step 4: Review
interface Step4Props {
  formData: OrganizationDraft
  onEdit: (step: number) => void
}

function Step4Review({ formData, onEdit }: Step4Props) {
  const [termsAccepted, setTermsAccepted] = React.useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-h5 text-text-strong-950 mb-1">Review & Submit</h2>
        <p className="text-paragraph-sm text-text-sub-600">
          Please verify all details before submitting
        </p>
      </div>

      {/* Basic Information */}
      <div className="rounded-10 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-label-sm text-text-strong-950">Basic Information</h3>
          <Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(1)}>
            Edit
          </Button.Root>
        </div>
        <div className="space-y-2 text-paragraph-sm">
          <div className="flex justify-between">
            <span className="text-text-sub-600">Organization</span>
            <span className="text-text-strong-950">{formData.basicInfo?.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Website</span>
            <span className="text-text-strong-950">{formData.basicInfo?.website || '-'}</span>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="rounded-10 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-label-sm text-text-strong-950">Business Details</h3>
          <Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(2)}>
            Edit
          </Button.Root>
        </div>
        <div className="space-y-2 text-paragraph-sm">
          <div className="flex justify-between">
            <span className="text-text-sub-600">Business Type</span>
            <span className="text-text-strong-950 capitalize">
              {formData.businessDetails?.businessType?.replace('_', ' ') || '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Industry</span>
            <span className="text-text-strong-950 capitalize">
              {formData.businessDetails?.industryCategory?.replace('_', ' ') || '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Contact Person</span>
            <span className="text-text-strong-950">{formData.businessDetails?.contactPerson || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Phone</span>
            <span className="text-text-strong-950">{formData.businessDetails?.phone || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Address</span>
            <span className="text-text-strong-950 text-right">
              {formData.businessDetails?.address}, {formData.businessDetails?.city}, {formData.businessDetails?.state} - {formData.businessDetails?.pinCode}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="rounded-10 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-label-sm text-text-strong-950">Verification Status</h3>
          <Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(3)}>
            Edit
          </Button.Root>
        </div>
        <div className="space-y-2 text-paragraph-sm">
          <div className="flex justify-between items-center">
            <span className="text-text-sub-600">GST</span>
            <div className="flex items-center gap-2">
              <span className="text-text-strong-950 font-mono">{formData.verification?.gstNumber || '-'}</span>
              {formData.verification?.gstVerified ? (
                <span className="flex items-center gap-1 text-success-base text-label-xs">
                  <SealCheck className="size-3.5" weight="duotone" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-text-soft-400 text-label-xs">
                  <Clock className="size-3.5" /> Not Verified
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-sub-600">PAN</span>
            <div className="flex items-center gap-2">
              <span className="text-text-strong-950 font-mono">{formData.verification?.panNumber || '-'}</span>
              {formData.verification?.panVerified ? (
                <span className="flex items-center gap-1 text-success-base text-label-xs">
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
      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox.Root
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className="mt-0.5"
          />
          <span className="text-paragraph-sm text-text-sub-600">
            I confirm that all information provided is accurate and I agree to the{' '}
            <a href="/terms" className="text-primary-base hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-base hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>
    </div>
  )
}

