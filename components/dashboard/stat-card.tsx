'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/utils/cn'

// Simple, clean stat card with minimal information
interface SimpleStatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  href?: string
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

const iconColorStyles = {
  primary: 'bg-primary-lighter text-primary-base',
  success: 'bg-success-lighter text-success-base',
  warning: 'bg-warning-lighter text-warning-base',
  error: 'bg-error-lighter text-error-base',
  neutral: 'bg-bg-weak-50 text-text-sub-600',
}

export function SimpleStatCard({
  icon,
  value,
  label,
  href,
  iconColor = 'neutral',
  className,
}: SimpleStatCardProps) {
  const content = (
    <>
      {/* Icon */}
      <div className={cn(
        'flex size-10 items-center justify-center rounded-full mb-3',
        iconColorStyles[iconColor]
      )}>
        {icon}
      </div>
      
      {/* Value */}
      <div className="text-title-h4 text-text-strong-950 font-semibold">
        {value}
      </div>
      
      {/* Label */}
      <div className="text-paragraph-sm text-text-sub-600 mt-0.5">
        {label}
      </div>
    </>
  )

  const cardClass = cn(
    'flex flex-col rounded-20 p-4 h-full',
    'bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200',
    'transition-all duration-200',
    href && 'hover:ring-stroke-strong-950 hover:shadow-regular cursor-pointer',
    className
  )

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    )
  }

  return (
    <div className={cardClass}>
      {content}
    </div>
  )
}

// Wallet stat card - special styling for wallet balance
interface WalletCardProps {
  balance: number
  label?: string
  onAddFunds?: () => void
  className?: string
}

export function WalletCard({
  balance,
  label = 'Wallet Balance',
  onAddFunds,
  className,
}: WalletCardProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const isLowBalance = balance < 10000

  return (
    <div className={cn(
      'flex flex-col rounded-20 p-4 h-full',
      isLowBalance 
        ? 'bg-warning-lighter ring-1 ring-inset ring-warning-base/20'
        : 'bg-gradient-to-br from-primary-base to-primary-darker',
      className
    )}>
      {/* Icon */}
      <div className={cn(
        'flex size-10 items-center justify-center rounded-full mb-3',
        isLowBalance ? 'bg-warning-base text-white' : 'bg-white/20 text-white'
      )}>
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
          <path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" />
        </svg>
      </div>
      
      {/* Value */}
      <div className={cn(
        'text-title-h4 font-semibold',
        isLowBalance ? 'text-warning-dark' : 'text-white'
      )}>
        {formatCurrency(balance)}
      </div>
      
      {/* Label */}
      <div className={cn(
        'text-paragraph-sm mt-0.5',
        isLowBalance ? 'text-warning-base' : 'text-white/80'
      )}>
        {label}
      </div>

      {/* Add Funds Link */}
      {onAddFunds && (
        <button
          onClick={onAddFunds}
          className={cn(
            'mt-3 text-label-sm font-medium underline-offset-2 hover:underline',
            isLowBalance ? 'text-warning-dark' : 'text-white/90'
          )}
        >
          + Add Funds
        </button>
      )}
    </div>
  )
}

// ===== LEGACY EXPORTS FOR BACKWARD COMPATIBILITY =====
// These are kept for any existing uses

import { tv, type VariantProps } from '@/utils/tv'
import * as Button from '@/components/ui/button'

const statCardVariants = tv({
  slots: {
    root: [
      'relative flex flex-col rounded-20 p-4',
      'bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200',
      'transition-all duration-200',
    ],
    iconWrapper: [
      'flex size-10 shrink-0 items-center justify-center rounded-full',
      'mb-3',
    ],
    value: 'text-title-h4 text-text-strong-950 font-semibold',
    label: 'text-paragraph-sm text-text-sub-600 mt-1',
    secondary: 'text-paragraph-xs text-text-soft-400 mt-1.5',
    action: 'mt-3',
    badge: [
      'absolute top-4 right-4 flex items-center gap-1',
      'rounded-full px-2 py-0.5 text-label-xs',
    ],
  },
  variants: {
    variant: {
      default: {
        root: '',
        iconWrapper: 'bg-bg-weak-50 text-text-sub-600',
      },
      primary: {
        root: 'bg-primary-base ring-0',
        iconWrapper: 'bg-white/20 text-white',
        value: 'text-white',
        label: 'text-white/80',
        secondary: 'text-white/60',
      },
      warning: {
        root: 'bg-warning-lighter ring-warning-light',
        iconWrapper: 'bg-warning-base text-white',
        value: 'text-warning-dark',
        label: 'text-warning-base',
        secondary: 'text-warning-base/70',
      },
      success: {
        root: '',
        iconWrapper: 'bg-success-lighter text-success-base',
      },
      error: {
        root: 'bg-error-lighter ring-error-light',
        iconWrapper: 'bg-error-base text-white',
        value: 'text-error-dark',
        label: 'text-error-base',
        secondary: 'text-error-base/70',
      },
    },
    size: {
      default: {
        root: 'p-4',
        value: 'text-title-h4',
      },
      compact: {
        root: 'p-3',
        value: 'text-title-h5',
        iconWrapper: 'size-8 mb-1.5',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

type StatCardVariantProps = VariantProps<typeof statCardVariants>

interface StatCardBaseProps {
  icon?: React.ReactNode
  value: string | number
  label: string
  secondaryText?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  badge?: {
    text: string
    variant: 'warning' | 'error' | 'success' | 'info'
  }
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

type StatCardProps = StatCardBaseProps & StatCardVariantProps & React.HTMLAttributes<HTMLDivElement>

export function StatCard({
  className,
  variant,
  size,
  icon,
  value,
  label,
  secondaryText,
  trend,
  badge,
  action,
  ...props
}: StatCardProps) {
  const styles = statCardVariants({ variant, size })

  const badgeColors = {
    warning: 'bg-warning-lighter text-warning-base',
    error: 'bg-error-lighter text-error-base',
    success: 'bg-success-lighter text-success-base',
    info: 'bg-information-lighter text-information-base',
  }

  return (
    <div className={styles.root({ class: className })} {...props}>
      {badge && (
        <span className={cn(styles.badge(), badgeColors[badge.variant])}>
          {badge.variant === 'warning' && '⚠️ '}
          {badge.text}
        </span>
      )}

      {icon && <div className={styles.iconWrapper()}>{icon}</div>}

      <div className={styles.value()}>{value}</div>
      <div className={styles.label()}>{label}</div>

      {action && (
        <div className={styles.action()}>
          {action.href ? (
            <Button.Root
              variant="basic"
              size="small"
              className={variant === 'primary' ? 'text-white border-white/30 hover:bg-white/10' : ''}
              asChild
            >
              <a href={action.href}>{action.label}</a>
            </Button.Root>
          ) : (
            <Button.Root
              variant="basic"
              size="small"
              className={variant === 'primary' ? 'text-white border-white/30 hover:bg-white/10' : ''}
              onClick={action.onClick}
            >
              {action.label}
            </Button.Root>
          )}
        </div>
      )}
    </div>
  )
}

// Wallet-specific stat card (legacy)
interface WalletStatCardProps extends Omit<StatCardProps, 'value' | 'label' | 'secondaryText'> {
  availableBalance: number
  heldAmount?: number
  onAddFunds?: () => void
}

export function WalletStatCard({
  availableBalance,
  heldAmount,
  onAddFunds,
  ...props
}: WalletStatCardProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const isLowBalance = availableBalance < 10000

  return (
    <StatCard
      variant={isLowBalance ? 'warning' : 'default'}
      icon={<WalletIcon />}
      value={formatCurrency(availableBalance)}
      label={isLowBalance ? 'Low Balance' : 'Wallet Balance'}
      secondaryText={heldAmount ? `${formatCurrency(heldAmount)} held` : undefined}
      badge={isLowBalance ? { text: 'Low Balance', variant: 'warning' } : undefined}
      action={onAddFunds ? { label: 'Add Funds', onClick: onAddFunds } : undefined}
      {...props}
    />
  )
}

function WalletIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
      <path d="M16 12h5v4h-5a2 2 0 0 1 0-4z" />
    </svg>
  )
}

export { statCardVariants }
