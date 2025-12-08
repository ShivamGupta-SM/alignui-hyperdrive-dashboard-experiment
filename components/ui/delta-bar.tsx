// AlignUI DeltaBar v0.1.0 - Shows positive/negative change visualization

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const deltaBarVariants = tv({
  slots: {
    root: 'relative flex w-full items-center',
    track: 'h-full w-full rounded-full bg-bg-soft-200',
    bar: 'absolute h-full rounded-full transition-all duration-300 ease-out',
    marker: 'absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-text-strong-950',
  },
  variants: {
    size: {
      xs: { root: 'h-1' },
      sm: { root: 'h-1.5' },
      md: { root: 'h-2' },
      lg: { root: 'h-3' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type DeltaBarVariantProps = VariantProps<typeof deltaBarVariants>;

interface DeltaBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    DeltaBarVariantProps {
  value: number; // -100 to 100
  showMarker?: boolean;
  positiveColor?: string;
  negativeColor?: string;
}

function DeltaBar({
  value,
  size,
  showMarker = true,
  positiveColor = 'bg-success-base',
  negativeColor = 'bg-error-base',
  className,
  ...rest
}: DeltaBarProps) {
  const { root, track, bar, marker } = deltaBarVariants({ size });

  // Clamp value between -100 and 100
  const clampedValue = Math.max(-100, Math.min(100, value));
  const isPositive = clampedValue >= 0;
  const width = Math.abs(clampedValue) / 2; // Half width since centered

  return (
    <div
      className={cn(root(), className)}
      role="meter"
      aria-valuenow={clampedValue}
      aria-valuemin={-100}
      aria-valuemax={100}
      {...rest}
    >
      <div className={track()}>
        <div
          className={cn(
            bar(),
            isPositive ? positiveColor : negativeColor,
          )}
          style={{
            left: isPositive ? '50%' : `${50 - width}%`,
            width: `${width}%`,
          }}
        />
      </div>
      {showMarker && (
        <div className={marker()} style={{ left: '50%', marginLeft: '-1px' }} />
      )}
    </div>
  );
}
DeltaBar.displayName = 'DeltaBar';

// DeltaBar with label and value
interface LabeledDeltaBarProps extends DeltaBarProps {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

function LabeledDeltaBar({
  label,
  showValue = true,
  formatValue = (v) => `${v > 0 ? '+' : ''}${v}%`,
  value,
  size,
  className,
  ...rest
}: LabeledDeltaBarProps) {
  const isPositive = value >= 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-label-sm text-text-strong-950">{label}</span>
          )}
          {showValue && (
            <span
              className={cn(
                'text-label-sm font-medium',
                isPositive ? 'text-success-base' : 'text-error-base',
              )}
            >
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <DeltaBar value={value} size={size} {...rest} />
    </div>
  );
}
LabeledDeltaBar.displayName = 'LabeledDeltaBar';

// Comparison DeltaBar showing two values
interface ComparisonDeltaBarProps
  extends Omit<DeltaBarProps, 'value'>,
    DeltaBarVariantProps {
  startValue: number;
  endValue: number;
  label?: string;
  showLabels?: boolean;
}

function ComparisonDeltaBar({
  startValue,
  endValue,
  label,
  showLabels = true,
  size,
  className,
  ...rest
}: ComparisonDeltaBarProps) {
  const delta = endValue - startValue;
  const deltaPercent = startValue !== 0 ? ((endValue - startValue) / Math.abs(startValue)) * 100 : 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <span className="text-label-sm text-text-strong-950">{label}</span>
      )}
      <DeltaBar value={Math.max(-100, Math.min(100, deltaPercent))} size={size} {...rest} />
      {showLabels && (
        <div className="flex items-center justify-between text-paragraph-xs">
          <span className="text-text-sub-600">{startValue}</span>
          <span
            className={cn(
              'font-medium',
              delta >= 0 ? 'text-success-base' : 'text-error-base',
            )}
          >
            {delta >= 0 ? '+' : ''}{delta} ({deltaPercent.toFixed(1)}%)
          </span>
          <span className="text-text-sub-600">{endValue}</span>
        </div>
      )}
    </div>
  );
}
ComparisonDeltaBar.displayName = 'ComparisonDeltaBar';

export {
  DeltaBar,
  LabeledDeltaBar,
  ComparisonDeltaBar,
  deltaBarVariants,
};
