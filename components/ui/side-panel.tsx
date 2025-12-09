// AlignUI Side Panel Component

'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'
import { X } from '@phosphor-icons/react'
import * as Button from '@/components/ui/button'

interface SidePanelContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SidePanelContext = React.createContext<SidePanelContextValue | undefined>(undefined)

function useSidePanelContext() {
  const context = React.useContext(SidePanelContext)
  if (!context) {
    throw new Error('SidePanel components must be used within SidePanel.Root')
  }
  return context
}

interface SidePanelRootProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function SidePanelRoot({ open = false, onOpenChange, children }: SidePanelRootProps) {
  return (
    <SidePanelContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SidePanelContext.Provider>
  )
}

interface SidePanelTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SidePanelTrigger = React.forwardRef<HTMLButtonElement, SidePanelTriggerProps>(
  ({ onClick, asChild, children, ...props }, ref) => {
    const { onOpenChange } = useSidePanelContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(true)
      onClick?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...((children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props),
        onClick: handleClick,
      } as React.HTMLAttributes<HTMLElement>)
    }

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)
SidePanelTrigger.displayName = 'SidePanelTrigger'

interface SidePanelContentProps {
  children: React.ReactNode
  className?: string
  side?: 'left' | 'right'
}

function SidePanelContent({ children, className, side = 'right' }: SidePanelContentProps) {
  const { open, onOpenChange } = useSidePanelContext()

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 z-50 h-full w-full bg-bg-white-0 shadow-xl transition-transform duration-300 ease-out sm:w-[480px]',
          side === 'right' && 'right-0 sm:rounded-l-2xl',
          side === 'left' && 'left-0 sm:rounded-r-2xl',
          open
            ? 'translate-x-0'
            : side === 'right'
            ? 'translate-x-full'
            : '-translate-x-full',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

interface SidePanelHeaderProps {
  children: React.ReactNode
  className?: string
}

function SidePanelHeader({ children, className }: SidePanelHeaderProps) {
  const { onOpenChange } = useSidePanelContext()

  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-stroke-soft-200 p-5',
        className
      )}
    >
      <div className="flex-1">{children}</div>
      <Button.Root
        variant="ghost"
        size="small"
        onClick={() => onOpenChange(false)}
      >
        <Button.Icon as={X} />
      </Button.Root>
    </div>
  )
}

interface SidePanelTitleProps {
  children: React.ReactNode
  className?: string
}

function SidePanelTitle({ children, className }: SidePanelTitleProps) {
  return (
    <h2 className={cn('text-title-h5 text-text-strong-950', className)}>
      {children}
    </h2>
  )
}

interface SidePanelDescriptionProps {
  children: React.ReactNode
  className?: string
}

function SidePanelDescription({ children, className }: SidePanelDescriptionProps) {
  return (
    <p className={cn('text-paragraph-sm text-text-sub-600 mt-1', className)}>
      {children}
    </p>
  )
}

interface SidePanelBodyProps {
  children: React.ReactNode
  className?: string
}

function SidePanelBody({ children, className }: SidePanelBodyProps) {
  return (
    <div className={cn('overflow-y-auto p-5', className)} style={{ height: 'calc(100vh - 73px)' }}>
      {children}
    </div>
  )
}

export {
  SidePanelRoot as Root,
  SidePanelTrigger as Trigger,
  SidePanelContent as Content,
  SidePanelHeader as Header,
  SidePanelTitle as Title,
  SidePanelDescription as Description,
  SidePanelBody as Body,
}
