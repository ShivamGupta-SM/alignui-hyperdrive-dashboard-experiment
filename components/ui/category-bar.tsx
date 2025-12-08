// AlignUI CategoryBar v0.1.0 - Horizontal stacked bar for category visualization

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';
import * as Tooltip from '@/components/ui/tooltip';

const categoryBarVariants = tv({
  slots: {
    root: 'relative flex w-full overflow-hidden rounded-full bg-bg-weak-50',
    segment: 'h-full transition-all duration-300 ease-out first:rounded-l-full last:rounded-r-full',
    label: 'flex items-center gap-1.5 text-paragraph-xs text-text-sub-600',
    dot: 'size-2 shrink-0 rounded-full',
  },
  variants: {
    size: {
      xs: { root: 'h-1' },
      sm: { root: 'h-2' },
      md: { root: 'h-3' },
      lg: { root: 'h-4' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type CategoryBarVariantProps = VariantProps<typeof categoryBarVariants>;

interface CategoryBarItem {
  name: string;
  value: number;
  color?: string;
}

// Default color palette matching AlignUI design tokens
const defaultColors = [
  'var(--color-primary-base)',
  'var(--color-success-base)',
  'var(--color-warning-base)',
  'var(--color-error-base)',
  'var(--color-information-base)',
  'var(--color-away-base)',
  'var(--color-feature-base)',
  'var(--color-verified-base)',
];

interface CategoryBarProps extends CategoryBarVariantProps {
  data: CategoryBarItem[];
  showTooltip?: boolean;
  showLabels?: boolean;
  className?: string;
}

function CategoryBar({
  data,
  size,
  showTooltip = true,
  showLabels = false,
  className,
}: CategoryBarProps) {
  const { root, segment, label, dot } = categoryBarVariants({ size });

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        className={cn(root(), className)}
        role="img"
        aria-label="Category bar with no data"
      />
    );
  }

  const segments = data.map((item, index) => ({
    ...item,
    percentage: (item.value / total) * 100,
    color: item.color || defaultColors[index % defaultColors.length],
  }));

  const renderSegment = (item: typeof segments[0], index: number) => {
    const segmentEl = (
      <div
        key={item.name}
        className={segment()}
        style={{
          width: `${item.percentage}%`,
          backgroundColor: item.color,
        }}
        role="progressbar"
        aria-valuenow={item.value}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${item.name}: ${item.percentage.toFixed(1)}%`}
      />
    );

    if (showTooltip) {
      return (
        <Tooltip.Root key={item.name}>
          <Tooltip.Trigger asChild>
            {segmentEl}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium">{item.name}</span>
              <span className="text-text-soft-400">
                {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          </Tooltip.Content>
        </Tooltip.Root>
      );
    }

    return segmentEl;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={root()} role="group" aria-label="Category distribution">
        {segments.map(renderSegment)}
      </div>

      {showLabels && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {segments.map((item) => (
            <div key={item.name} className={label()}>
              <span className={dot()} style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
              <span className="text-text-soft-400">
                ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
CategoryBar.displayName = 'CategoryBar';

// Marker variant for showing a value position on a range
interface CategoryBarMarkerProps extends CategoryBarVariantProps {
  value: number;
  min?: number;
  max?: number;
  markerColor?: string;
  rangeColors?: [string, string, string];
  thresholds?: [number, number];
  className?: string;
}

function CategoryBarMarker({
  value,
  min = 0,
  max = 100,
  markerColor = 'var(--color-text-strong-950)',
  rangeColors = [
    'var(--color-error-base)',
    'var(--color-warning-base)',
    'var(--color-success-base)',
  ],
  thresholds = [33, 66],
  size,
  className,
}: CategoryBarMarkerProps) {
  const { root, segment } = categoryBarVariants({ size });

  const range = max - min;
  const position = Math.max(0, Math.min(100, ((value - min) / range) * 100));
  const [low, high] = thresholds;

  return (
    <div className={cn('relative', className)}>
      <div className={root()} role="img" aria-label={`Value: ${value} out of ${max}`}>
        <div
          className={segment()}
          style={{ width: `${low}%`, backgroundColor: rangeColors[0] }}
        />
        <div
          className={segment()}
          style={{ width: `${high - low}%`, backgroundColor: rangeColors[1] }}
        />
        <div
          className={segment()}
          style={{ width: `${100 - high}%`, backgroundColor: rangeColors[2] }}
        />
      </div>
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <div
          className="size-3 rounded-full border-2 border-bg-white-0 shadow-sm"
          style={{ backgroundColor: markerColor }}
        />
      </div>
    </div>
  );
}
CategoryBarMarker.displayName = 'CategoryBarMarker';

export { CategoryBar, CategoryBarMarker, type CategoryBarItem, type CategoryBarProps };
