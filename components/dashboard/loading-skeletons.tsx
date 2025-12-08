'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'

// Base Skeleton Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-10 bg-bg-soft-200',
        className
      )}
      {...props}
    />
  )
}

// Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-full mt-4" />
    </div>
  )
}

// Campaign Card Skeleton
export function CampaignCardSkeleton() {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stroke-soft-200">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

// Enrollment Card Skeleton
export function EnrollmentCardSkeleton() {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-40 mt-2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-stroke-soft-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-bg-weak-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="py-3 px-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  )
}

// Chart Skeleton
export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="w-full" style={{ height }} />
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
  )
}

// Card Grid Skeleton
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  )
}

// List Skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <EnrollmentCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6 space-y-6">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

// Sidebar Skeleton
export function SidebarSkeleton() {
  return (
    <div className="flex h-screen w-[280px] flex-col border-r border-stroke-soft-200 bg-bg-white-0 p-3">
      {/* Org Switcher */}
      <div className="flex items-center gap-3 p-2 mb-4">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Nav Items */}
      <div className="space-y-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="size-5" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="flex-1" />

      {/* Footer Nav */}
      <div className="border-t border-stroke-soft-200 pt-3 space-y-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="size-5" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Full Page Loading
export function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center">
      <div className="relative">
        <div className="size-12 rounded-full border-4 border-stroke-soft-200" />
        <div className="absolute inset-0 size-12 rounded-full border-4 border-primary-base border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-paragraph-sm text-text-sub-600">{message}</p>
    </div>
  )
}

// Inline Loading Spinner
export function InlineLoading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'size-4 border-2',
    md: 'size-6 border-2',
    lg: 'size-8 border-3',
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn('rounded-full border-stroke-soft-200 border-t-primary-base animate-spin', sizeClasses[size])} />
    </div>
  )
}

// Dashboard Page Loading
export function DashboardPageLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DashboardStatsSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}

// Campaigns Page Loading
export function CampaignsPageLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-10" />
          ))}
        </div>
      </div>
      <CardGridSkeleton count={4} />
    </div>
  )
}

// Enrollments Page Loading
export function EnrollmentsPageLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 flex-1 max-w-xs" />
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
      </div>
      <ListSkeleton count={5} />
    </div>
  )
}

// Settings Page Loading
export function SettingsPageLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FormSkeleton />
      <FormSkeleton />
    </div>
  )
}

