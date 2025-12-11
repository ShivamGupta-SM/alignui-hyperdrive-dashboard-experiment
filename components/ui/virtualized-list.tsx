'use client'

import * as React from 'react'
import { useVirtualizer, type VirtualizerOptions } from '@tanstack/react-virtual'
import { cn } from '@/utils/cn'

export interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Estimated height of each item in pixels */
  estimatedItemHeight?: number
  /** Height of the container (CSS value or number in pixels) */
  height?: string | number
  /** Additional class name for the container */
  className?: string
  /** Gap between items in pixels */
  gap?: number
  /** Overscan count - how many items to render outside the visible area */
  overscan?: number
  /** Key extractor function */
  getItemKey?: (item: T, index: number) => string | number
  /** Empty state component */
  emptyState?: React.ReactNode
  /** Loading state */
  isLoading?: boolean
  /** Loading skeleton count */
  loadingSkeletonCount?: number
  /** Loading skeleton component */
  loadingSkeleton?: React.ReactNode
}

/**
 * Virtualized list component for rendering large lists efficiently.
 * Uses @tanstack/react-virtual under the hood.
 *
 * @example
 * ```tsx
 * <VirtualizedList
 *   items={enrollments}
 *   renderItem={(enrollment) => (
 *     <EnrollmentCard enrollment={enrollment} />
 *   )}
 *   estimatedItemHeight={80}
 *   height="calc(100vh - 200px)"
 * />
 * ```
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  estimatedItemHeight = 60,
  height = 400,
  className,
  gap = 8,
  overscan = 5,
  getItemKey,
  emptyState,
  isLoading,
  loadingSkeletonCount = 5,
  loadingSkeleton,
}: VirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: isLoading ? loadingSkeletonCount : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight + gap,
    overscan,
    getItemKey: getItemKey
      ? (index) => getItemKey(items[index], index)
      : undefined,
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Show empty state if no items and not loading
  if (!isLoading && items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size - gap}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {isLoading && loadingSkeleton
              ? loadingSkeleton
              : renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Virtualized grid component for rendering large grids efficiently.
 */
export interface VirtualizedGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  columns: number
  estimatedItemHeight?: number
  height?: string | number
  className?: string
  gap?: number
  overscan?: number
  getItemKey?: (item: T, index: number) => string | number
  emptyState?: React.ReactNode
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns,
  estimatedItemHeight = 200,
  height = 600,
  className,
  gap = 16,
  overscan = 2,
  getItemKey,
  emptyState,
}: VirtualizedGridProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Calculate rows
  const rowCount = Math.ceil(items.length / columns)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight + gap,
    overscan,
  })

  const virtualRows = virtualizer.getVirtualItems()

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns
          const rowItems = items.slice(startIndex, startIndex + columns)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                paddingBottom: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const itemIndex = startIndex + colIndex
                return (
                  <div key={getItemKey ? getItemKey(item, itemIndex) : itemIndex}>
                    {renderItem(item, itemIndex)}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Hook for using virtualization with custom containers
 */
export function useVirtualList<T>(
  items: T[],
  options: Partial<VirtualizerOptions<HTMLDivElement, Element>> & {
    estimatedItemHeight?: number
  } = {}
) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => options.estimatedItemHeight ?? 50,
    overscan: 5,
    ...options,
  })

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
  }
}
