// Bottom Sheet Component using Vaul
// Swipeable bottom sheet for mobile, falls back to modal on desktop

'use client'

import * as React from 'react'
import { Drawer } from 'vaul'
import { X } from '@phosphor-icons/react'
import * as CompactButton from '@/components/ui/compact-button'
import { cn } from '@/utils/cn'
import { useMediaQuery } from 'usehooks-ts'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /** Snap points for the drawer height (0-1 values) */
  snapPoints?: (number | string)[]
  /** Whether the sheet can be dismissed by swiping down */
  dismissible?: boolean
}

function BottomSheetRoot({
  open,
  onOpenChange,
  children,
  snapPoints,
  dismissible = true,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissible={dismissible}
    >
      {children}
    </Drawer.Root>
  )
}

const BottomSheetTrigger = Drawer.Trigger
const BottomSheetClose = Drawer.Close
const BottomSheetPortal = Drawer.Portal

const BottomSheetOverlay = React.forwardRef<
  React.ComponentRef<typeof Drawer.Overlay>,
  React.ComponentPropsWithoutRef<typeof Drawer.Overlay>
>(({ className, ...props }, ref) => (
  <Drawer.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-overlay backdrop-blur-[10px]', className)}
    {...props}
  />
))
BottomSheetOverlay.displayName = 'BottomSheetOverlay'

interface BottomSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof Drawer.Content> {
  showHandle?: boolean
  showClose?: boolean
}

const BottomSheetContent = React.forwardRef<
  React.ComponentRef<typeof Drawer.Content>,
  BottomSheetContentProps
>(({ className, children, showHandle = true, showClose = true, ...props }, ref) => (
  <BottomSheetPortal>
    <BottomSheetOverlay />
    <Drawer.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[96vh] flex-col rounded-t-2xl bg-bg-white-0',
        'ring-1 ring-inset ring-stroke-soft-200',
        // Safe area for notch devices
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
      {...props}
    >
      {showHandle && (
        <div className="mx-auto mt-3 h-1 w-10 flex-shrink-0 rounded-full bg-stroke-soft-200" />
      )}
      {showClose && (
        <BottomSheetClose asChild>
          <CompactButton.Root
            variant="ghost"
            size="large"
            className="absolute right-3 top-3 z-10"
            aria-label="Close"
          >
            <CompactButton.Icon as={X} />
          </CompactButton.Root>
        </BottomSheetClose>
      )}
      {children}
    </Drawer.Content>
  </BottomSheetPortal>
))
BottomSheetContent.displayName = 'BottomSheetContent'

function BottomSheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 px-4 pt-4 pb-3 text-center', className)}
      {...props}
    />
  )
}

const BottomSheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-label-md text-text-strong-950 font-medium', className)}
    {...props}
  />
))
BottomSheetTitle.displayName = 'BottomSheetTitle'

const BottomSheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-paragraph-sm text-text-sub-600', className)}
    {...props}
  />
))
BottomSheetDescription.displayName = 'BottomSheetDescription'

function BottomSheetBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto px-4 py-4', className)}
      {...props}
    />
  )
}

function BottomSheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-t border-stroke-soft-200 px-4 py-4',
        className
      )}
      {...props}
    />
  )
}

export {
  BottomSheetRoot as Root,
  BottomSheetTrigger as Trigger,
  BottomSheetClose as Close,
  BottomSheetPortal as Portal,
  BottomSheetOverlay as Overlay,
  BottomSheetContent as Content,
  BottomSheetHeader as Header,
  BottomSheetTitle as Title,
  BottomSheetDescription as Description,
  BottomSheetBody as Body,
  BottomSheetFooter as Footer,
}
