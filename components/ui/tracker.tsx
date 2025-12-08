// AlignUI Tracker v0.1.0 - Status tracker visualization

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const trackerVariants = tv({
  slots: {
    root: 'flex w-full gap-0.5',
    block: 'h-full flex-1 first:rounded-l last:rounded-r transition-colors duration-200',
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

type TrackerVariantProps = VariantProps<typeof trackerVariants>;

type TrackerStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

interface TrackerBlock {
  status: TrackerStatus;
  tooltip?: string;
}

const statusColors: Record<TrackerStatus, string> = {
  success: 'bg-success-base hover:bg-success-dark',
  warning: 'bg-warning-base hover:bg-warning-dark',
  error: 'bg-error-base hover:bg-error-dark',
  info: 'bg-information-base hover:bg-information-dark',
  neutral: 'bg-bg-soft-200 hover:bg-bg-sub-300',
  primary: 'bg-primary-base hover:bg-primary-dark',
};

interface TrackerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    TrackerVariantProps {
  data: TrackerBlock[];
}

function Tracker({ data, size, className, ...rest }: TrackerProps) {
  const { root, block } = trackerVariants({ size });

  return (
    <div
      className={cn(root(), className)}
      role="figure"
      aria-label="Status tracker"
      {...rest}
    >
      {data.map((item, index) => (
        <div
          key={index}
          className={cn(block(), statusColors[item.status])}
          title={item.tooltip}
          role="status"
          aria-label={item.tooltip || item.status}
        />
      ))}
    </div>
  );
}
Tracker.displayName = 'Tracker';

// Tracker with legend
interface TrackerWithLegendProps extends TrackerProps {
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom';
}

function TrackerWithLegend({
  data,
  size,
  showLegend = true,
  legendPosition = 'bottom',
  className,
  ...rest
}: TrackerWithLegendProps) {
  // Count occurrences of each status
  const statusCounts = data.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<TrackerStatus, number>,
  );

  const legendItems = Object.entries(statusCounts).map(([status, count]) => ({
    status: status as TrackerStatus,
    count,
  }));

  const legend = (
    <div className="flex flex-wrap items-center gap-4">
      {legendItems.map(({ status, count }) => (
        <div key={status} className="flex items-center gap-1.5">
          <div className={cn('size-2.5 rounded-sm', statusColors[status].split(' ')[0])} />
          <span className="text-paragraph-xs text-text-sub-600 capitalize">
            {status}: {count}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showLegend && legendPosition === 'top' && legend}
      <Tracker data={data} size={size} {...rest} />
      {showLegend && legendPosition === 'bottom' && legend}
    </div>
  );
}
TrackerWithLegend.displayName = 'TrackerWithLegend';

// Labeled tracker with title
interface LabeledTrackerProps extends TrackerProps {
  label?: string;
  value?: string | number;
}

function LabeledTracker({
  label,
  value,
  data,
  size,
  className,
  ...rest
}: LabeledTrackerProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || value !== undefined) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-label-sm text-text-strong-950">{label}</span>
          )}
          {value !== undefined && (
            <span className="text-label-sm text-text-sub-600">{value}</span>
          )}
        </div>
      )}
      <Tracker data={data} size={size} {...rest} />
    </div>
  );
}
LabeledTracker.displayName = 'LabeledTracker';

export {
  Tracker,
  TrackerWithLegend,
  LabeledTracker,
  trackerVariants,
  type TrackerBlock,
  type TrackerStatus,
};
