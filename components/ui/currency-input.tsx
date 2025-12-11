'use client'

import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import { cn } from '@/utils/cn'

export interface CurrencyInputProps extends Omit<NumericFormatProps, 'value' | 'onValueChange' | 'size'> {
  value?: number | null
  onValueChange?: (value: number | null) => void
  currency?: 'INR' | 'USD' | 'EUR'
  size?: 'small' | 'medium' | 'large'
  error?: boolean
  className?: string
}

const currencyConfig = {
  INR: { prefix: '₹', thousandSeparator: ',', decimalSeparator: '.', locale: 'en-IN' },
  USD: { prefix: '$', thousandSeparator: ',', decimalSeparator: '.', locale: 'en-US' },
  EUR: { prefix: '€', thousandSeparator: '.', decimalSeparator: ',', locale: 'de-DE' },
}

const sizeStyles = {
  small: 'h-8 px-2.5 text-paragraph-sm',
  medium: 'h-10 px-3 text-paragraph-sm',
  large: 'h-12 px-4 text-paragraph-md',
}

/**
 * Currency input with proper formatting for Indian Rupees (INR) or other currencies.
 * Uses react-number-format for proper number formatting while typing.
 *
 * @example
 * ```tsx
 * <CurrencyInput
 *   value={amount}
 *   onValueChange={setAmount}
 *   currency="INR"
 *   placeholder="Enter amount"
 * />
 * ```
 */
export function CurrencyInput({
  value,
  onValueChange,
  currency = 'INR',
  size = 'medium',
  error,
  className,
  placeholder = '0',
  disabled,
  ...props
}: CurrencyInputProps) {
  const config = currencyConfig[currency]

  return (
    <NumericFormat
      value={value ?? ''}
      onValueChange={(values) => {
        onValueChange?.(values.floatValue ?? null)
      }}
      thousandSeparator={config.thousandSeparator}
      decimalSeparator={config.decimalSeparator}
      prefix={`${config.prefix} `}
      decimalScale={2}
      allowNegative={false}
      placeholder={`${config.prefix} ${placeholder}`}
      disabled={disabled}
      className={cn(
        // Base styles
        'w-full rounded-lg border bg-bg-white-0 font-mono tabular-nums',
        'transition-all duration-200',
        'placeholder:text-text-soft-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-primary-base',
        // Size
        sizeStyles[size],
        // State styles
        error
          ? 'border-error-base ring-1 ring-error-base/20'
          : 'border-stroke-soft-200 hover:border-stroke-sub-300',
        disabled && 'cursor-not-allowed bg-bg-weak-50 text-text-soft-400',
        className
      )}
      {...props}
    />
  )
}

/**
 * Compact currency display (read-only) with proper Indian number formatting
 */
export interface CurrencyDisplayProps {
  value: number
  currency?: 'INR' | 'USD' | 'EUR'
  compact?: boolean
  className?: string
}

export function CurrencyDisplay({
  value,
  currency = 'INR',
  compact = false,
  className,
}: CurrencyDisplayProps) {
  const config = currencyConfig[currency]

  if (compact) {
    // Compact format for large numbers (Indian system: L for Lakhs, Cr for Crores)
    if (currency === 'INR') {
      if (value >= 10000000) {
        return <span className={cn('font-mono tabular-nums', className)}>{config.prefix}{(value / 10000000).toFixed(1)}Cr</span>
      }
      if (value >= 100000) {
        return <span className={cn('font-mono tabular-nums', className)}>{config.prefix}{(value / 100000).toFixed(1)}L</span>
      }
      if (value >= 1000) {
        return <span className={cn('font-mono tabular-nums', className)}>{config.prefix}{(value / 1000).toFixed(1)}K</span>
      }
    } else {
      // Western compact format
      if (value >= 1000000000) {
        return <span className={cn('font-mono tabular-nums', className)}>{config.prefix}{(value / 1000000000).toFixed(1)}B</span>
      }
      if (value >= 1000000) {
        return <span className={cn('font-mono tabular-nums', className)}>{config.prefix}{(value / 1000000).toFixed(1)}M</span>
      }
      if (value >= 1000) {
        return <span className={cn('font-mono tabular-nums', className)}>{config.prefix}{(value / 1000).toFixed(1)}K</span>
      }
    }
  }

  // Full format
  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value)

  return <span className={cn('font-mono tabular-nums', className)}>{formatted}</span>
}

/**
 * Number input (non-currency) with proper formatting
 */
export interface NumberInputProps extends Omit<NumericFormatProps, 'value' | 'onValueChange' | 'size'> {
  value?: number | null
  onValueChange?: (value: number | null) => void
  size?: 'small' | 'medium' | 'large'
  error?: boolean
  suffix?: string
  className?: string
}

export function NumberInput({
  value,
  onValueChange,
  size = 'medium',
  error,
  suffix,
  className,
  placeholder = '0',
  disabled,
  ...props
}: NumberInputProps) {
  return (
    <NumericFormat
      value={value ?? ''}
      onValueChange={(values) => {
        onValueChange?.(values.floatValue ?? null)
      }}
      thousandSeparator=","
      decimalScale={0}
      allowNegative={false}
      suffix={suffix ? ` ${suffix}` : undefined}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'w-full rounded-lg border bg-bg-white-0 font-mono tabular-nums',
        'transition-all duration-200',
        'placeholder:text-text-soft-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-primary-base',
        sizeStyles[size],
        error
          ? 'border-error-base ring-1 ring-error-base/20'
          : 'border-stroke-soft-200 hover:border-stroke-sub-300',
        disabled && 'cursor-not-allowed bg-bg-weak-50 text-text-soft-400',
        className
      )}
      {...props}
    />
  )
}

/**
 * Percentage input with % suffix
 */
export interface PercentageInputProps extends Omit<NumberInputProps, 'suffix'> {
  allowDecimals?: boolean
}

export function PercentageInput({
  allowDecimals = false,
  ...props
}: PercentageInputProps) {
  return (
    <NumberInput
      suffix="%"
      decimalScale={allowDecimals ? 2 : 0}
      isAllowed={(values) => {
        const { floatValue } = values
        return floatValue === undefined || (floatValue >= 0 && floatValue <= 100)
      }}
      {...props}
    />
  )
}
