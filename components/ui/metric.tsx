// AlignUI Metric v0.1.0 - Large KPI display component

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';
import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react';

type DeltaType = 'increase' | 'decrease' | 'unchanged' | 'moderateIncrease' | 'moderateDecrease';

const deltaIcons: Record<DeltaType, React.ElementType> = {
  increase: ArrowUp,
  decrease: ArrowDown,
  unchanged: Minus,
  moderateIncrease: ArrowUp,
  moderateDecrease: ArrowDown,
};

const metricVariants = tv({
  slots: {
    root: 'flex flex-col',
    label: 'text-text-sub-600',
    valueWrapper: 'flex items-baseline gap-2',
    value: 'text-text-strong-950 font-semibold tabular-nums',
    delta: 'flex items-center gap-0.5 font-medium',
    deltaIcon: '',
    description: 'text-text-sub-600',
  },
  variants: {
    size: {
      sm: {
        root: 'gap-1',
        label: 'text-paragraph-xs',
        value: 'text-title-h5',
        delta: 'text-paragraph-xs',
        deltaIcon: 'size-3',
        description: 'text-paragraph-xs',
      },
      md: {
        root: 'gap-1.5',
        label: 'text-paragraph-sm',
        value: 'text-title-h4',
        delta: 'text-paragraph-sm',
        deltaIcon: 'size-4',
        description: 'text-paragraph-sm',
      },
      lg: {
        root: 'gap-2',
        label: 'text-paragraph-md',
        value: 'text-title-h3',
        delta: 'text-paragraph-md',
        deltaIcon: 'size-5',
        description: 'text-paragraph-md',
      },
      xl: {
        root: 'gap-2',
        label: 'text-label-md',
        value: 'text-title-h2',
        delta: 'text-label-sm',
        deltaIcon: 'size-5',
        description: 'text-paragraph-md',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type MetricVariantProps = VariantProps<typeof metricVariants>;

interface MetricProps
  extends React.HTMLAttributes<HTMLDivElement>,
    MetricVariantProps {
  label?: string;
  value: string | number;
  delta?: string | number;
  deltaType?: DeltaType;
  description?: string;
}

const deltaColors: Record<DeltaType, string> = {
  increase: 'text-success-base',
  decrease: 'text-error-base',
  unchanged: 'text-text-sub-600',
  moderateIncrease: 'text-warning-base',
  moderateDecrease: 'text-warning-base',
};

function Metric({
  label,
  value,
  delta,
  deltaType = 'unchanged',
  description,
  size,
  className,
  ...rest
}: MetricProps) {
  const {
    root,
    label: labelClass,
    valueWrapper,
    value: valueClass,
    delta: deltaClass,
    deltaIcon: deltaIconClass,
    description: descriptionClass,
  } = metricVariants({ size });

  const DeltaIcon = deltaIcons[deltaType];

  return (
    <div className={cn(root(), className)} {...rest}>
      {label && <span className={labelClass()}>{label}</span>}
      <div className={valueWrapper()}>
        <span className={valueClass()}>{value}</span>
        {delta !== undefined && (
          <span className={cn(deltaClass(), deltaColors[deltaType])}>
            <DeltaIcon className={deltaIconClass()} />
            {delta}
          </span>
        )}
      </div>
      {description && <span className={descriptionClass()}>{description}</span>}
    </div>
  );
}
Metric.displayName = 'Metric';

// Metric Card - Metric in a card container
interface MetricCardProps extends MetricProps {
  icon?: React.ReactNode;
}

function MetricCard({
  icon,
  className,
  ...rest
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <Metric {...rest} />
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-lg bg-bg-soft-200 text-text-sub-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
MetricCard.displayName = 'MetricCard';

// Comparison Metric - Shows before and after
interface ComparisonMetricProps
  extends Omit<MetricProps, 'delta' | 'deltaType' | 'value'> {
  previousValue: string | number;
  currentValue: string | number;
  formatDelta?: (current: number, previous: number) => string;
}

function ComparisonMetric({
  label,
  previousValue,
  currentValue,
  formatDelta,
  size,
  className,
  ...rest
}: ComparisonMetricProps) {
  const numPrevious = typeof previousValue === 'string' ? parseFloat(previousValue) : previousValue;
  const numCurrent = typeof currentValue === 'string' ? parseFloat(currentValue) : currentValue;

  const difference = numCurrent - numPrevious;
  const percentChange = numPrevious !== 0 ? (difference / Math.abs(numPrevious)) * 100 : 0;

  let deltaType: DeltaType = 'unchanged';
  if (difference > 0) deltaType = 'increase';
  else if (difference < 0) deltaType = 'decrease';

  const formattedDelta = formatDelta
    ? formatDelta(numCurrent, numPrevious)
    : `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  return (
    <Metric
      label={label}
      value={currentValue}
      delta={formattedDelta}
      deltaType={deltaType}
      size={size}
      className={className}
      {...rest}
    />
  );
}
ComparisonMetric.displayName = 'ComparisonMetric';

// Metric Group - Display multiple metrics
interface MetricGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
}

function MetricGroup({
  columns = 3,
  className,
  children,
  ...rest
}: MetricGroupProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-4',
        gridCols[columns],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
MetricGroup.displayName = 'MetricGroup';

export {
  Metric,
  MetricCard,
  ComparisonMetric,
  MetricGroup,
  metricVariants,
  type DeltaType,
};
