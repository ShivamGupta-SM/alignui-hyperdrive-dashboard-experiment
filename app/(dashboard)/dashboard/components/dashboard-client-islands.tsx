'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/utils/cn'
import * as Button from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import { THRESHOLDS } from '@/lib/types/constants'

// ============================================
// Dashboard Header (needs client for date formatting)
// ============================================
export function DashboardHeader() {
  const [dateString, setDateString] = useState<string>('')

  useEffect(() => {
    setDateString(
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })
    )
  }, [])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
        <p className="text-paragraph-xs text-text-sub-600 mt-0.5 min-h-[1.25rem]">
          {dateString || <span className="invisible">Loading...</span>}
        </p>
      </div>
      <Button.Root variant="primary" size="small" asChild className="shrink-0">
        <Link href="/dashboard/campaigns/create">
          <Button.Icon as={Plus} />
          <span className="hidden sm:inline">New Campaign</span>
        </Link>
      </Button.Root>
    </div>
  )
}

// ============================================
// Priority Enrollment Item (needs client for time ago calculation)
// ============================================
interface PendingEnrollment {
  id: string
  orderId?: string
  orderValue?: number
  createdAt: string | Date
  shopper?: { name?: string }
  campaign?: {
    title?: string
    product?: { image?: string }
  }
}

// Calculate hours ago from a date
const getHoursAgo = (date: Date | string, currentTime: number): number => {
  return Math.floor((currentTime - new Date(date).getTime()) / (1000 * 60 * 60))
}

// Format hours ago to human readable
const formatTimeAgo = (hoursAgo: number): string => {
  if (hoursAgo < 1) return 'Just now'
  if (hoursAgo < 24) return `${hoursAgo}h ago`
  const days = Math.floor(hoursAgo / 24)
  return `${days}d ago`
}

export function PriorityEnrollmentItem({ enrollment }: { enrollment: PendingEnrollment }) {
  const [currentTime, setCurrentTime] = useState<number | null>(null)

  useEffect(() => {
    setCurrentTime(Date.now())
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  const hoursAgo = currentTime ? getHoursAgo(enrollment.createdAt, currentTime) : 0
  const overdue = hoursAgo > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS
  const highValue = (enrollment.orderValue || 0) >= 25000

  return (
    <div
      className={cn(
        "p-3 sm:p-4 transition-colors hover:bg-bg-weak-50",
        overdue && "bg-error-lighter/20"
      )}
    >
      {/* Mobile layout */}
      <div className="flex items-start gap-3 sm:hidden">
        <div className="relative size-12 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
          {enrollment.campaign?.product?.image && (
            <Image src={enrollment.campaign.product.image} alt="Product" fill sizes="48px" className="object-contain p-1.5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-label-xs text-text-strong-950 truncate">
              {enrollment.campaign?.title}
            </span>
            {overdue && (
              <span className="text-label-xs font-medium text-error-base bg-error-lighter px-1.5 py-0.5 rounded">
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-1">
            <span>{enrollment.shopper?.name}</span>
            <span>•</span>
            <span className="font-medium text-text-strong-950">₹{(enrollment.orderValue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-label-xs text-text-soft-400">{formatTimeAgo(hoursAgo)}</span>
            <Button.Root variant="primary" size="xsmall" asChild>
              <Link href={`/dashboard/enrollments/${enrollment.id}`}>Review</Link>
            </Button.Root>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="relative size-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
          {enrollment.campaign?.product?.image && (
            <Image src={enrollment.campaign.product.image} alt="Product" fill sizes="40px" className="object-contain p-1" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-text-strong-950 truncate">
              {enrollment.campaign?.title}
            </span>
            {overdue && (
              <span className="text-[10px] font-medium text-error-base bg-error-lighter px-1.5 py-0.5 rounded shrink-0">
                Overdue
              </span>
            )}
            {highValue && !overdue && (
              <span className="text-label-xs font-medium text-information-base bg-information-lighter px-1.5 py-0.5 rounded shrink-0">
                High Value
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-0.5">
            <span>{enrollment.shopper?.name}</span>
            <span>•</span>
            <span className="text-text-soft-400">{formatTimeAgo(hoursAgo)}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-label-sm text-text-strong-950 font-medium">
            ₹{(enrollment.orderValue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-label-xs text-text-soft-400 font-mono">
            {enrollment.orderId}
          </div>
        </div>

        <Button.Root variant="primary" size="xsmall" asChild className="shrink-0">
          <Link href={`/dashboard/enrollments/${enrollment.id}`}>Review</Link>
        </Button.Root>
      </div>
    </div>
  )
}
