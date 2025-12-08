// AlignUI ChartUtils v0.0.0
// Utility components and helpers for Recharts-based visualizations

'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

/**
 * Selects N evenly spaced items from an array.
 * Useful for optimizing x-axis labels in charts.
 */
export function selectEvenlySpacedItems<T>(items: T[], count: number): T[] {
  if (!items || items.length === 0) return [];
  if (count >= items.length) return items;
  if (count <= 0) return [];
  if (count === 1) return [items[0]];

  const result: T[] = [];
  const step = (items.length - 1) / (count - 1);

  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step);
    result.push(items[index]);
  }

  return result;
}

/**
 * Format a number with commas and optional decimal places.
 */
export function formatChartNumber(
  value: number,
  options?: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
  },
): string {
  const { decimals = 0, prefix = '', suffix = '' } = options || {};
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${prefix}${formatted}${suffix}`;
}

/**
 * Chart color palette aligned with Align UI design tokens.
 */
export const chartColors = {
  primary: 'hsl(var(--color-primary-base))',
  secondary: 'hsl(var(--color-faded-base))',
  success: 'hsl(var(--color-success-base))',
  warning: 'hsl(var(--color-warning-base))',
  error: 'hsl(var(--color-error-base))',
  information: 'hsl(var(--color-information-base))',
  // Extended palette for multi-series charts
  palette: [
    'hsl(var(--color-primary-base))',
    'hsl(var(--color-information-base))',
    'hsl(var(--color-success-base))',
    'hsl(var(--color-warning-base))',
    'hsl(var(--color-error-base))',
    'hsl(var(--color-feature-base))',
    'hsl(var(--color-verified-base))',
    'hsl(var(--color-highlighted-base))',
  ],
};

/**
 * Chart Legend Content component for Recharts.
 * Renders a custom styled legend.
 */
type ChartLegendContentProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  align?: 'left' | 'center' | 'right';
  layout?: 'horizontal' | 'vertical';
  className?: string;
};

export function ChartLegendContent({
  payload,
  align = 'center',
  layout = 'horizontal',
  className,
}: ChartLegendContentProps) {
  if (!payload || payload.length === 0) return null;

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const layoutClasses = {
    horizontal: 'flex-row gap-4',
    vertical: 'flex-col gap-2',
  };

  const items = payload as Array<{ color?: string; value?: string }>;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center',
        alignmentClasses[align],
        layoutClasses[layout],
        className,
      )}
    >
      {items.map((entry, index) => (
        <div key={`legend-${index}`} className='flex items-center gap-2'>
          <div
            className='size-3 rounded-full'
            style={{ backgroundColor: entry.color }}
          />
          <span className='text-label-sm text-text-sub-600'>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Tooltip Content component for Recharts.
 * Renders a custom styled tooltip.
 */
type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[] | TooltipPayloadItem[];
  label?: string | number;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number | string) => string;
  className?: string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  const formattedLabel = labelFormatter ? labelFormatter(String(label || '')) : label;

  return (
    <div
      className={cn(
        'rounded-12 border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-lg',
        className,
      )}
    >
      {formattedLabel && (
        <p className='mb-2 text-label-sm text-text-strong-950'>{formattedLabel}</p>
      )}
      <div className='flex flex-col gap-1.5'>
        {payload.map((entry, index) => {
          const value = valueFormatter
            ? valueFormatter(entry.value ?? '')
            : entry.value;

          return (
            <div
              key={`tooltip-${index}`}
              className='flex items-center justify-between gap-4'
            >
              <div className='flex items-center gap-2'>
                <div
                  className='size-2.5 rounded-full'
                  style={{ backgroundColor: entry.color }}
                />
                <span className='text-paragraph-sm text-text-sub-600'>
                  {entry.name}
                </span>
              </div>
              <span className='text-label-sm text-text-strong-950'>{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Chart Active Dot component for Recharts.
 * Renders a custom styled dot for hover states.
 */
type ChartActiveDotProps = {
  cx?: number;
  cy?: number;
  fill?: string;
  stroke?: string;
  r?: number;
  className?: string;
};

export function ChartActiveDot({
  cx,
  cy,
  fill = 'hsl(var(--color-primary-base))',
  stroke = 'hsl(var(--color-bg-white-0))',
  r = 6,
  className,
}: ChartActiveDotProps) {
  if (cx === undefined || cy === undefined) return null;

  return (
    <g className={className}>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r - 2} fill={stroke} />
      <circle cx={cx} cy={cy} r={r - 4} fill={fill} />
    </g>
  );
}

/**
 * Chart Container component.
 * Provides a consistent wrapper for chart components.
 */
type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  aspectRatio?: number;
};

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, aspectRatio, style, ...rest }, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cn('w-full', className)}
        style={{
          aspectRatio: aspectRatio ? `${aspectRatio} / 1` : undefined,
          ...style,
        }}
        {...rest}
      />
    );
  },
);
ChartContainer.displayName = 'ChartContainer';

/**
 * Chart Empty State component.
 * Displays when chart has no data.
 */
type ChartEmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  message?: string;
};

export function ChartEmptyState({
  className,
  message = 'No data available',
  ...rest
}: ChartEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[200px] items-center justify-center',
        'rounded-12 border border-dashed border-stroke-soft-200 bg-bg-weak-50',
        className,
      )}
      {...rest}
    >
      <p className='text-paragraph-sm text-text-soft-400'>{message}</p>
    </div>
  );
}

/**
 * Generate chart grid line styles.
 */
export const chartGridStyles = {
  stroke: 'hsl(var(--color-stroke-soft-200))',
  strokeDasharray: '4 4',
  strokeWidth: 1,
};

/**
 * Generate chart axis styles.
 */
export const chartAxisStyles = {
  tick: {
    fontSize: 12,
    fill: 'hsl(var(--color-text-soft-400))',
  },
  axisLine: {
    stroke: 'hsl(var(--color-stroke-soft-200))',
    strokeWidth: 1,
  },
};
