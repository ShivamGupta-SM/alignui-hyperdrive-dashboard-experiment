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
import * as Breadcrumb from '@/components/ui/breadcrumb'
import { Calendar } from '@/components/ui/datepicker'
import * as Popover from '@/components/ui/popover'
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
  Info
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'
import { CAMPAIGN_TYPE_OPTIONS, DELIVERABLE_TYPE_OPTIONS, DEFAULT_SUBMISSION_DEADLINE_DAYS } from '@/lib/constants'
import type { CampaignType, DeliverableType, CampaignFormData } from '@/lib/types'

const steps = [
  { label: 'Basic Info', shortLabel: 'Info', value: 1, icon: Package },
  { label: 'Schedule', shortLabel: 'Schedule', value: 2, icon: CalendarDots },
  { label: 'Deliverables', shortLabel: 'Tasks', value: 3, icon: ListChecks },
  { label: 'Review', shortLabel: 'Review', value: 4, icon: CheckCircle },
]

// Mock products
const mockProducts = [
  { id: '1', name: 'Nike Air Max 2024', category: 'Footwear', image: '/images/products/nike-shoes.png' },
  { id: '2', name: 'Samsung Galaxy S24', category: 'Electronics', image: '/images/products/samsung-phone.png' },
  { id: '3', name: 'Sony WH-1000XM5', category: 'Audio', image: '/images/products/sony-headphones.png' },
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveDraft = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/dashboard/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.productId && formData.title && formData.type
      case 2:
        return formData.startDate && formData.endDate && formData.maxEnrollments
      case 3:
        return formData.deliverables && formData.deliverables.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 bg-bg-white-0/95 backdrop-blur-sm border-b border-stroke-soft-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Button.Root
                variant="ghost"
                size="small"
                onClick={() => router.back()}
                className="-ml-2"
              >
                <Button.Icon as={ArrowLeft} />
                <span className="hidden sm:inline">Back</span>
              </Button.Root>
              
              <div className="hidden sm:block h-5 w-px bg-stroke-soft-200" />
              
              <Breadcrumb.Root className="hidden sm:flex">
                <Breadcrumb.Item asChild>
                  <Link href="/dashboard/campaigns">Campaigns</Link>
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
                variant="basic"
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
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-base/10 to-purple-500/10 ring-1 ring-inset ring-primary-base/20">
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
                <React.Fragment key={step.value}>
                  <button
                    onClick={() => isCompleted && setCurrentStep(step.value)}
                    disabled={!isCompleted}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all',
                      isActive && 'bg-primary-base/5 ring-1 ring-inset ring-primary-base/20',
                      isCompleted && 'cursor-pointer hover:bg-bg-weak-50',
                      !isActive && !isCompleted && 'opacity-50'
                    )}
                  >
                    <div className={cn(
                      'flex size-9 items-center justify-center rounded-lg transition-colors',
                      isCompleted && 'bg-success-base text-white',
                      isActive && 'bg-primary-base text-white',
                      !isActive && !isCompleted && 'bg-bg-weak-50 text-text-soft-400'
                    )}>
                      {isCompleted ? (
                        <CheckCircle weight="fill" className="size-5" />
                      ) : (
                        <Icon weight={isActive ? 'fill' : 'regular'} className="size-5" />
                      )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className={cn(
                        'text-label-sm font-medium',
                        isActive ? 'text-primary-base' : isCompleted ? 'text-text-strong-950' : 'text-text-soft-400'
                      )}>
                        {step.label}
                      </div>
                    </div>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2 rounded-full transition-colors',
                      currentStep > step.value ? 'bg-success-base' : 
                      currentStep > step.value - 1 ? 'bg-primary-base/30' : 'bg-stroke-soft-200'
                    )} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-8">
            {currentStep === 1 && (
              <Step1BasicInfo formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <Step2Schedule formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <Step3Deliverables formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && (
              <Step4Review formData={formData} onEdit={setCurrentStep} />
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 z-10 bg-bg-white-0 border-t border-stroke-soft-200 px-4 py-3 sm:py-4 mt-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            {currentStep > 1 && (
              <Button.Root variant="basic" size="small" onClick={handleBack}>
                <Button.Icon as={ArrowLeft} />
                <span className="hidden sm:inline">Back</span>
              </Button.Root>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Button.Root
              variant="basic"
              size="small"
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="sm:hidden"
            >
              Draft
            </Button.Root>
            
            {currentStep < 4 ? (
              <Button.Root 
                variant="primary" 
                size="small" 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                <span className="hidden sm:inline">Continue</span>
                <span className="sm:hidden">Next</span>
                <Button.Icon as={ArrowRight} />
              </Button.Root>
            ) : (
              <Button.Root
                variant="primary"
                size="small"
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
  const selectedProduct = mockProducts.find(p => p.id === formData.productId)
  
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
      <div className="space-y-3">
        <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
          Select Product
          <span className="text-error-base">*</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => updateFormData({ productId: product.id })}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                'ring-1 ring-inset',
                formData.productId === product.id
                  ? 'ring-primary-base bg-primary-base/5 shadow-sm'
                  : 'ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-stroke-sub-300'
              )}
            >
              <div className="size-12 rounded-lg bg-bg-weak-50 flex items-center justify-center shrink-0">
                <Package weight="duotone" className="size-6 text-text-soft-400" />
              </div>
              <div className="min-w-0">
                <div className="text-label-sm text-text-strong-950 truncate">{product.name}</div>
                <div className="text-paragraph-xs text-text-soft-400">{product.category}</div>
              </div>
            </button>
          ))}
        </div>
        
        <Link 
          href="/dashboard/products/new" 
          className="inline-flex items-center gap-1.5 text-label-sm text-primary-base hover:text-primary-darker font-medium"
        >
          <Plus weight="bold" className="size-4" />
          Add New Product
        </Link>
      </div>

      {/* Campaign Title */}
      <div className="space-y-2">
        <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
          Campaign Title
          <span className="text-error-base">*</span>
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
      <div className="space-y-2">
        <label className="text-label-sm text-text-strong-950">
          Description
          <span className="text-paragraph-xs text-text-soft-400 ml-1">(optional)</span>
        </label>
        <Textarea.Root
          placeholder="Describe your campaign goals, special offers, and what you expect from participants..."
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Campaign Type */}
      <div className="space-y-3">
        <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
          Campaign Type
          <span className="text-error-base">*</span>
        </label>
        <Radio.Group
          value={formData.type}
          onValueChange={(value) => updateFormData({ type: value as CampaignType })}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {CAMPAIGN_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex flex-col p-4 rounded-xl cursor-pointer transition-all',
                'ring-1 ring-inset',
                formData.type === option.value
                  ? 'ring-primary-base bg-primary-base/5 shadow-sm'
                  : 'ring-stroke-soft-200 hover:bg-bg-weak-50 hover:ring-stroke-sub-300'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Radio.Item value={option.value} />
                <span className="text-label-sm text-text-strong-950 font-medium">{option.label}</span>
              </div>
              <span className="text-paragraph-xs text-text-soft-400 pl-6">
                {option.description}
              </span>
            </label>
          ))}
        </Radio.Group>
      </div>

      {/* Visibility Toggle */}
      <div className="rounded-xl bg-bg-weak-50 p-4 ring-1 ring-inset ring-stroke-soft-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox.Root
            checked={formData.isPublic}
            onCheckedChange={(checked) => updateFormData({ isPublic: checked === true })}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {formData.isPublic ? (
                <Globe weight="duotone" className="size-4 text-success-base" />
              ) : (
                <Lock weight="duotone" className="size-4 text-text-soft-400" />
              )}
              <span className="text-label-sm text-text-strong-950">
                {formData.isPublic ? 'Public Campaign' : 'Private Campaign'}
              </span>
            </div>
            <span className="text-paragraph-xs text-text-soft-400 block mt-0.5">
              {formData.isPublic 
                ? 'Visible to all shoppers in the marketplace'
                : 'Only accessible via direct link'}
            </span>
          </div>
        </label>
      </div>
    </div>
  )
}

// Step 2: Schedule
function Step2Schedule({ formData, updateFormData }: StepProps) {
  const [startDateOpen, setStartDateOpen] = React.useState(false)
  const [endDateOpen, setEndDateOpen] = React.useState(false)

  const formatDate = (date?: Date) => {
    if (!date) return 'Select date'
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
                  <span className={cn(
                    'flex-1 text-paragraph-sm',
                    formData.startDate ? 'text-text-strong-950' : 'text-text-soft-400'
                  )}>
                    {formatDate(formData.startDate)}
                  </span>
                </button>
              </Popover.Trigger>
            </div>
            <Popover.Content>
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => {
                  updateFormData({ startDate: date })
                  setStartDateOpen(false)
                }}
                disabled={(date) => date < new Date()}
              />
            </Popover.Content>
          </Popover.Root>

          <Popover.Root open={endDateOpen} onOpenChange={setEndDateOpen}>
            <div className="space-y-1.5">
              <span className="text-label-xs text-text-sub-600">End Date</span>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-2 w-full px-4 py-3 rounded-xl ring-1 ring-inset ring-stroke-soft-200 text-left hover:bg-bg-weak-50 hover:ring-stroke-sub-300 transition-all">
                  <CalendarBlank weight="duotone" className="size-5 text-text-soft-400 shrink-0" />
                  <span className={cn(
                    'flex-1 text-paragraph-sm',
                    formData.endDate ? 'text-text-strong-950' : 'text-text-soft-400'
                  )}>
                    {formatDate(formData.endDate)}
                  </span>
                </button>
              </Popover.Trigger>
            </div>
            <Popover.Content>
              <Calendar
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => {
                  updateFormData({ endDate: date })
                  setEndDateOpen(false)
                }}
                disabled={(date) => formData.startDate ? date < formData.startDate : date < new Date()}
              />
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>

      {/* Capacity Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
            <Users weight="duotone" className="size-4 text-information-base" />
            Maximum Enrollments
            <span className="text-error-base">*</span>
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
          <p className="text-paragraph-xs text-text-soft-400">
            Maximum shoppers who can enroll
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1 text-label-sm text-text-strong-950">
            <Clock weight="duotone" className="size-4 text-warning-base" />
            Submission Deadline
          </label>
          <div className="flex items-center gap-2">
            <Input.Root className="flex-1">
              <Input.Wrapper>
                <Input.El
                  type="number"
                  placeholder="45"
                  value={formData.submissionDeadlineDays || ''}
                  onChange={(e) => updateFormData({ submissionDeadlineDays: parseInt(e.target.value) || DEFAULT_SUBMISSION_DEADLINE_DAYS })}
                />
              </Input.Wrapper>
            </Input.Root>
            <span className="text-paragraph-sm text-text-sub-600 shrink-0">days</span>
          </div>
          <p className="text-paragraph-xs text-text-soft-400">
            Days to submit proofs after enrolling
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div className="flex items-start gap-3 rounded-xl bg-information-lighter/50 p-4 ring-1 ring-inset ring-information-base/20">
        <Info weight="fill" className="size-5 text-information-base shrink-0 mt-0.5" />
        <div className="text-paragraph-sm text-text-sub-600">
          <strong className="text-information-base">Tip:</strong> Set realistic deadlines. 45 days is recommended for product delivery and content creation.
        </div>
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
          <strong className="text-success-base">Order screenshot</strong> is automatically required for OCR verification of purchases.
        </div>
      </div>

      {/* Deliverables List */}
      <div className="space-y-4">
        {deliverables.map((deliverable, index) => (
          <div
            key={index}
            className={cn(
              'rounded-xl ring-1 ring-inset p-4 sm:p-5',
              index === 0 
                ? 'ring-primary-base/30 bg-primary-base/5' 
                : 'ring-stroke-soft-200'
            )}
          >
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex size-8 items-center justify-center rounded-lg text-label-sm font-semibold',
                  index === 0 ? 'bg-primary-base text-white' : 'bg-bg-weak-50 text-text-sub-600'
                )}>
                  {index + 1}
                </div>
                <div>
                  <span className="text-label-sm text-text-strong-950 font-medium">
                    {DELIVERABLE_TYPE_OPTIONS.find(o => o.value === deliverable.type)?.label || 'Deliverable'}
                  </span>
                  {index === 0 && (
                    <span className="text-paragraph-xs text-primary-base ml-2">(Auto-required)</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox.Root
                      checked={deliverable.isRequired}
                      onCheckedChange={(checked) =>
                        updateDeliverable(index, { isRequired: checked === true })
                      }
                    />
                    <span className="text-label-xs text-text-sub-600">
                      Required
                    </span>
                  </label>
                )}
                {index > 0 && (
                  <Button.Root
                    variant="ghost"
                    size="xsmall"
                    onClick={() => removeDeliverable(index)}
                    className="text-error-base hover:bg-error-lighter -mr-1"
                  >
                    <Button.Icon as={Trash} />
                  </Button.Root>
                )}
              </div>
            </div>

            {/* Form Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-label-xs text-text-sub-600">Type</label>
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
              <div className="space-y-1.5">
                <label className="text-label-xs text-text-sub-600">Instructions</label>
                <Input.Root>
                  <Input.Wrapper>
                    <Input.El
                      placeholder="e.g., Min 50 words, include product photo"
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

      <Button.Root variant="basic" onClick={addDeliverable} className="w-full sm:w-auto">
        <Button.Icon as={Plus} />
        Add Deliverable
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
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const product = mockProducts.find((p) => p.id === formData.productId)

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set'
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const ReviewSection = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
    <div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-bg-weak-50 border-b border-stroke-soft-200">
        <h3 className="text-label-sm text-text-strong-950 font-medium">{title}</h3>
        <Button.Root variant="ghost" size="xsmall" onClick={() => onEdit(step)}>
          Edit
        </Button.Root>
      </div>
      <div className="p-4 space-y-3 text-paragraph-sm">
        {children}
      </div>
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
          <ReviewRow label="Product" value={product?.name || 'Not selected'} />
          <ReviewRow label="Title" value={formData.title || 'Not set'} />
          <ReviewRow label="Type" value={CAMPAIGN_TYPE_OPTIONS.find(o => o.value === formData.type)?.label} />
          <ReviewRow label="Visibility" value={formData.isPublic ? 'Public' : 'Private'} />
        </ReviewSection>

        <ReviewSection title="Schedule & Limits" step={2}>
          <ReviewRow label="Period" value={`${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`} />
          <ReviewRow label="Max Enrollments" value={formData.maxEnrollments?.toLocaleString() || 'Not set'} />
          <ReviewRow label="Submission Deadline" value={`${formData.submissionDeadlineDays} days`} />
        </ReviewSection>

        <ReviewSection title="Deliverables" step={3}>
          {formData.deliverables?.map((d, i) => (
            <ReviewRow 
              key={i} 
              label={DELIVERABLE_TYPE_OPTIONS.find((o) => o.value === d.type)?.label || d.type}
              value={d.isRequired ? 'Required' : 'Optional'} 
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
