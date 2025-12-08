'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Select from '@/components/ui/select'
import * as Textarea from '@/components/ui/textarea'
import * as Checkbox from '@/components/ui/checkbox'
import * as Radio from '@/components/ui/radio'
import * as HorizontalStepper from '@/components/ui/horizontal-stepper'
import * as Breadcrumb from '@/components/ui/breadcrumb'
import { Calendar } from '@/components/ui/datepicker'
import * as Popover from '@/components/ui/popover'
import { RiArrowLeftLine, RiArrowRightLine, RiCalendarLine, RiAddLine, RiDeleteBinLine } from '@remixicon/react'
import { cn } from '@/utils/cn'
import { CAMPAIGN_TYPE_OPTIONS, DELIVERABLE_TYPE_OPTIONS, DEFAULT_SUBMISSION_DEADLINE_DAYS } from '@/lib/constants'
import type { CampaignType, DeliverableType, CampaignFormData } from '@/lib/types'

const steps = [
  { label: 'Basic Info', value: 1 },
  { label: 'Dates & Limits', value: 2 },
  { label: 'Deliverables', value: 3 },
  { label: 'Review', value: 4 },
]

// Mock products
const mockProducts = [
  { id: '1', name: 'Nike Air Max 2024', category: 'Footwear' },
  { id: '2', name: 'Samsung Galaxy S24', category: 'Electronics' },
  { id: '3', name: 'Sony WH-1000XM5', category: 'Audio' },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState<Partial<CampaignFormData>>({
    type: 'cashback',
    isPublic: true,
    submissionDeadlineDays: DEFAULT_SUBMISSION_DEADLINE_DAYS,
    deliverables: [
      { type: 'order_screenshot', title: 'Order Screenshot', isRequired: true },
    ],
    terms: [],
  })

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
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

  const handleSaveDraft = async () => {
    setIsLoading(true)
    try {
      // TODO: Save draft API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // TODO: Submit for approval API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb.Root className="mb-4">
        <Breadcrumb.Item asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.ArrowIcon as={RiArrowRightLine} />
        <Breadcrumb.Item asChild>
          <Link href="/dashboard/campaigns">Campaigns</Link>
        </Breadcrumb.Item>
        <Breadcrumb.ArrowIcon as={RiArrowRightLine} />
        <Breadcrumb.Item active>Create Campaign</Breadcrumb.Item>
      </Breadcrumb.Root>

      {/* Header */}
      <div className="mb-8">
        <Button.Root
          variant="ghost"
          size="small"
          onClick={() => router.back()}
          className="mb-4"
        >
          <Button.Icon as={RiArrowLeftLine} />
          Back to Campaigns
        </Button.Root>
        <h1 className="text-title-h4 text-text-strong-950">Create Campaign</h1>
        <p className="text-paragraph-sm text-text-sub-600 mt-1">
          Set up a new influencer marketing campaign
        </p>
      </div>

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
                  {step.value}
                </HorizontalStepper.ItemIndicator>
                {step.label}
              </HorizontalStepper.Item>
              {index < steps.length - 1 && <HorizontalStepper.SeparatorIcon />}
            </React.Fragment>
          ))}
        </HorizontalStepper.Root>
      </div>

      {/* Step Content */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        {currentStep === 1 && (
          <Step1BasicInfo formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <Step2DatesLimits formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <Step3Deliverables formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && (
          <Step4Review formData={formData} onEdit={setCurrentStep} />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stroke-soft-200">
          <div>
            {currentStep > 1 && (
              <Button.Root variant="basic" onClick={handleBack}>
                <Button.Icon as={RiArrowLeftLine} />
                Back
              </Button.Root>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button.Root
              variant="basic"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              Save as Draft
            </Button.Root>
            {currentStep < 4 ? (
              <Button.Root variant="primary" onClick={handleNext}>
                Continue
                <Button.Icon as={RiArrowRightLine} />
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
interface StepProps {
  formData: Partial<CampaignFormData>
  updateFormData: (updates: Partial<CampaignFormData>) => void
}

function Step1BasicInfo({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-label-lg text-text-strong-950">Basic Information</h2>

      {/* Product Selection */}
      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Select Product <span className="text-error-base">*</span>
        </label>
        <Select.Root
          value={formData.productId}
          onValueChange={(value) => updateFormData({ productId: value })}
        >
          <Select.Trigger>
            <Select.Value placeholder="Search products..." />
          </Select.Trigger>
          <Select.Content>
            {mockProducts.map((product) => (
              <Select.Item key={product.id} value={product.id}>
                {product.name} ({product.category})
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <p className="mt-1 text-paragraph-xs text-text-soft-400">
          Don&apos;t see it?{' '}
          <Link href="/dashboard/products/new" className="text-primary-base hover:underline">
            + Add New Product
          </Link>
        </p>
      </div>

      {/* Campaign Title */}
      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Campaign Title <span className="text-error-base">*</span>
        </label>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              placeholder="e.g., Summer Sale 2024"
              value={formData.title || ''}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      {/* Description */}
      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Description
        </label>
        <Textarea.Root
          placeholder="Describe campaign, special offers, and expectations..."
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={4}
        />
      </div>

      {/* Campaign Type */}
      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Campaign Type <span className="text-error-base">*</span>
        </label>
        <Radio.Group
          value={formData.type}
          onValueChange={(value) => updateFormData({ type: value as CampaignType })}
          className="flex flex-wrap gap-3"
        >
          {CAMPAIGN_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-12 cursor-pointer transition-colors',
                'ring-1 ring-inset',
                formData.type === option.value
                  ? 'ring-primary-base bg-primary-alpha-10'
                  : 'ring-stroke-soft-200 hover:bg-bg-weak-50'
              )}
            >
              <Radio.Item value={option.value} />
              <span className="text-label-sm text-text-strong-950">{option.label}</span>
            </label>
          ))}
        </Radio.Group>
      </div>

      {/* Visibility */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox.Root
            checked={formData.isPublic}
            onCheckedChange={(checked) => updateFormData({ isPublic: checked === true })}
          />
          <span className="text-paragraph-sm text-text-sub-600">
            Public (visible to all shoppers)
          </span>
        </label>
      </div>
    </div>
  )
}

// Step 2: Dates & Limits
function Step2DatesLimits({ formData, updateFormData }: StepProps) {
  const [startDateOpen, setStartDateOpen] = React.useState(false)
  const [endDateOpen, setEndDateOpen] = React.useState(false)

  const formatDate = (date?: Date) => {
    if (!date) return 'Select date'
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-label-lg text-text-strong-950">Dates & Limits</h2>

      {/* Campaign Period */}
      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Campaign Period <span className="text-error-base">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Popover.Root open={startDateOpen} onOpenChange={setStartDateOpen}>
            <Popover.Trigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-10 ring-1 ring-inset ring-stroke-soft-200 text-left hover:bg-bg-weak-50">
                <RiCalendarLine className="size-5 text-text-soft-400" />
                <span className="flex-1 text-paragraph-sm text-text-strong-950">
                  {formatDate(formData.startDate)}
                </span>
              </button>
            </Popover.Trigger>
            <Popover.Content>
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => {
                  updateFormData({ startDate: date })
                  setStartDateOpen(false)
                }}
              />
            </Popover.Content>
          </Popover.Root>

          <Popover.Root open={endDateOpen} onOpenChange={setEndDateOpen}>
            <Popover.Trigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-10 ring-1 ring-inset ring-stroke-soft-200 text-left hover:bg-bg-weak-50">
                <RiCalendarLine className="size-5 text-text-soft-400" />
                <span className="flex-1 text-paragraph-sm text-text-strong-950">
                  {formatDate(formData.endDate)}
                </span>
              </button>
            </Popover.Trigger>
            <Popover.Content>
              <Calendar
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => {
                  updateFormData({ endDate: date })
                  setEndDateOpen(false)
                }}
                disabled={(date) => formData.startDate ? date < formData.startDate : false}
              />
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>

      {/* Maximum Enrollments */}
      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Maximum Enrollments <span className="text-error-base">*</span>
        </label>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              type="number"
              placeholder="500"
              value={formData.maxEnrollments || ''}
              onChange={(e) => updateFormData({ maxEnrollments: parseInt(e.target.value) || 0 })}
            />
          </Input.Wrapper>
        </Input.Root>
        <p className="mt-1 text-paragraph-xs text-text-soft-400">
          Maximum shoppers who can enroll in this campaign
        </p>
      </div>

      {/* Submission Deadline */}
      <div>
        <label className="block text-label-sm text-text-strong-950 mb-2">
          Submission Deadline (Days)
        </label>
        <Input.Root>
          <Input.Wrapper>
            <Input.El
              type="number"
              placeholder="45"
              value={formData.submissionDeadlineDays || ''}
              onChange={(e) => updateFormData({ submissionDeadlineDays: parseInt(e.target.value) || DEFAULT_SUBMISSION_DEADLINE_DAYS })}
            />
          </Input.Wrapper>
        </Input.Root>
        <p className="mt-1 text-paragraph-xs text-text-soft-400">
          Days shoppers have to submit proofs after enrolling (Default: 45)
        </p>
      </div>
    </div>
  )
}

// Step 3: Deliverables
function Step3Deliverables({ formData, updateFormData }: StepProps) {
  const deliverables = formData.deliverables || []

  const addDeliverable = () => {
    updateFormData({
      deliverables: [
        ...deliverables,
        { type: 'delivery_photo' as DeliverableType, title: '', isRequired: false },
      ],
    })
  }

  const removeDeliverable = (index: number) => {
    updateFormData({
      deliverables: deliverables.filter((_, i) => i !== index),
    })
  }

  const updateDeliverable = (index: number, updates: Partial<typeof deliverables[0]>) => {
    updateFormData({
      deliverables: deliverables.map((d, i) => (i === index ? { ...d, ...updates } : d)),
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-label-lg text-text-strong-950">Campaign Deliverables</h2>

      <div className="rounded-12 bg-information-lighter p-4 text-paragraph-sm text-information-base">
        ℹ️ Order screenshot is automatically required for OCR verification
      </div>

      <div className="space-y-4">
        {deliverables.map((deliverable, index) => (
          <div
            key={index}
            className="rounded-12 ring-1 ring-inset ring-stroke-soft-200 p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  checked={deliverable.isRequired}
                  onCheckedChange={(checked) =>
                    updateDeliverable(index, { isRequired: checked === true })
                  }
                  disabled={index === 0} // Order screenshot always required
                />
                <span className="text-label-sm text-text-strong-950">
                  {deliverable.isRequired ? 'Required' : 'Optional'}
                </span>
              </div>
              {index > 0 && (
                <Button.Root
                  variant="ghost"
                  size="xsmall"
                  onClick={() => removeDeliverable(index)}
                >
                  <Button.Icon as={RiDeleteBinLine} />
                </Button.Root>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-xs text-text-sub-600 mb-1">
                  Type
                </label>
                <Select.Root
                  value={deliverable.type}
                  onValueChange={(value) =>
                    updateDeliverable(index, { type: value as DeliverableType })
                  }
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
              </div>
              <div>
                <label className="block text-label-xs text-text-sub-600 mb-1">
                  Instructions
                </label>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.El
                      placeholder="e.g., Min 50 words"
                      value={deliverable.instructions || ''}
                      onChange={(e) =>
                        updateDeliverable(index, { instructions: e.target.value })
                      }
                    />
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button.Root variant="basic" onClick={addDeliverable}>
        <Button.Icon as={RiAddLine} />
        Add Custom Deliverable
      </Button.Root>
    </div>
  )
}

// Step 4: Review
interface Step4Props {
  formData: Partial<CampaignFormData>
  onEdit: (step: number) => void
}

function Step4Review({ formData, onEdit }: Step4Props) {
  const product = mockProducts.find((p) => p.id === formData.productId)

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set'
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-label-lg text-text-strong-950">Review & Submit</h2>
      <p className="text-paragraph-sm text-text-sub-600">
        Please verify all details before submitting for approval
      </p>

      {/* Basic Info */}
      <div className="rounded-12 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-label-sm text-text-strong-950">Basic Information</h3>
          <Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(1)}>
            Edit
          </Button.Root>
        </div>
        <div className="space-y-2 text-paragraph-sm">
          <div className="flex justify-between">
            <span className="text-text-sub-600">Product</span>
            <span className="text-text-strong-950">{product?.name || 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Title</span>
            <span className="text-text-strong-950">{formData.title || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Type</span>
            <span className="text-text-strong-950 capitalize">{formData.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Visibility</span>
            <span className="text-text-strong-950">{formData.isPublic ? 'Public' : 'Private'}</span>
          </div>
        </div>
      </div>

      {/* Dates & Limits */}
      <div className="rounded-12 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-label-sm text-text-strong-950">Dates & Limits</h3>
          <Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(2)}>
            Edit
          </Button.Root>
        </div>
        <div className="space-y-2 text-paragraph-sm">
          <div className="flex justify-between">
            <span className="text-text-sub-600">Period</span>
            <span className="text-text-strong-950">
              {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Max Enrollments</span>
            <span className="text-text-strong-950">{formData.maxEnrollments || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub-600">Submission Deadline</span>
            <span className="text-text-strong-950">{formData.submissionDeadlineDays} days</span>
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="rounded-12 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-label-sm text-text-strong-950">Deliverables</h3>
          <Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(3)}>
            Edit
          </Button.Root>
        </div>
        <div className="space-y-2 text-paragraph-sm">
          {formData.deliverables?.map((d, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-text-sub-600">
                {DELIVERABLE_TYPE_OPTIONS.find((o) => o.value === d.type)?.label}
              </span>
              <span className="text-text-strong-950">
                {d.isRequired ? 'Required' : 'Optional'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terms Agreement */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox.Root className="mt-0.5" />
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

