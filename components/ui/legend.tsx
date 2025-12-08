// AlignUI Legend v0.1.0 - Chart legend component

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const legendVariants = tv({
  slots: {
    root: 'flex flex-wrap',
    item: 'flex items-center',
    indicator: 'shrink-0 rounded-sm',
    label: 'text-text-sub-600',
  },
  variants: {
    size: {
      sm: {
        root: 'gap-3',
        item: 'gap-1.5',
        indicator: 'size-2',
        label: 'text-paragraph-xs',
      },
      md: {
        root: 'gap-4',
        item: 'gap-2',
        indicator: 'size-2.5',
        label: 'text-paragraph-sm',
      },
      lg: {
        root: 'gap-5',
        item: 'gap-2.5',
        indicator: 'size-3',
        label: 'text-label-sm',
      },
    },
    layout: {
      horizontal: { root: 'flex-row' },
      vertical: { root: 'flex-col' },
    },
  },
  defaultVariants: {
    size: 'md',
    layout: 'horizontal',
  },
});

type LegendVariantProps = VariantProps<typeof legendVariants>;

type LegendColor =
  | 'primary'
  | 'blue'
  | 'green'
  | 'red'
  | 'orange'
  | 'purple'
  | 'gray'
  | 'cyan'
  | 'pink'
  | 'lime'
  | string;

interface LegendItem {
  name: string;
  color: LegendColor;
  value?: string | number;
}

const colorMap: Record<string, string> = {
  primary: 'bg-primary-base',
  blue: 'bg-information-base',
  green: 'bg-success-base',
  red: 'bg-error-base',
  orange: 'bg-warning-base',
  purple: 'bg-feature-base',
  gray: 'bg-faded-base',
  cyan: 'bg-cyan-500',
  pink: 'bg-pink-500',
  lime: 'bg-lime-500',
};

interface LegendProps
  extends React.HTMLAttributes<HTMLDivElement>,
    LegendVariantProps {
  categories: LegendItem[] | string[];
  colors?: LegendColor[];
  onClickLegendItem?: (item: string) => void;
  activeLegend?: string;
}

function Legend({
  categories,
  colors = ['primary', 'blue', 'green', 'red', 'orange', 'purple'],
  size,
  layout,
  onClickLegendItem,
  activeLegend,
  className,
  ...rest
}: LegendProps) {
  const {
    root,
    item: itemClass,
    indicator,
    label,
  } = legendVariants({ size, layout });

  // Normalize categories to LegendItem[]
  const normalizedCategories: LegendItem[] = categories.map((cat, index) => {
    if (typeof cat === 'string') {
      return {
        name: cat,
        color: colors[index % colors.length],
      };
    }
    return cat;
  });

  return (
    <div
      className={cn(root(), className)}
      role="list"
      aria-label="Legend"
      {...rest}
    >
      {normalizedCategories.map((category, index) => {
        const isActive = activeLegend === undefined || activeLegend === category.name;
        const bgColor = colorMap[category.color] || category.color;

        return (
          <button
            key={category.name}
            type="button"
            className={cn(
              itemClass(),
              onClickLegendItem && 'cursor-pointer hover:opacity-80 transition-opacity duration-200',
              !isActive && 'opacity-40',
            )}
            onClick={() => onClickLegendItem?.(category.name)}
            disabled={!onClickLegendItem}
            role="listitem"
          >
            <span
              className={cn(
                indicator(),
                bgColor.startsWith('bg-') ? bgColor : '',
              )}
              style={!bgColor.startsWith('bg-') ? { backgroundColor: bgColor } : undefined}
            />
            <span className={label()}>{category.name}</span>
            {category.value !== undefined && (
              <span className={cn(label(), 'text-text-strong-950 font-medium')}>
                {category.value}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
Legend.displayName = 'Legend';

// Compact legend for inline use
interface CompactLegendProps
  extends Omit<LegendProps, 'layout'>,
    Omit<LegendVariantProps, 'layout'> {}

function CompactLegend({ size = 'sm', ...rest }: CompactLegendProps) {
  return <Legend size={size} layout="horizontal" {...rest} />;
}
CompactLegend.displayName = 'CompactLegend';

// Legend with values displayed
interface LegendWithValuesProps extends LegendProps {
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
}

function LegendWithValues({
  categories,
  colors,
  showValues = true,
  valueFormatter = (v) => v.toString(),
  size,
  layout = 'vertical',
  className,
  ...rest
}: LegendWithValuesProps) {
  const {
    root,
    item: itemClass,
    indicator,
    label,
  } = legendVariants({ size, layout });

  // Normalize categories
  const normalizedCategories: LegendItem[] = (categories as (LegendItem | string)[]).map(
    (cat, index) => {
      if (typeof cat === 'string') {
        return {
          name: cat,
          color: (colors || ['primary', 'blue', 'green', 'red', 'orange', 'purple'])[
            index % (colors?.length || 6)
          ],
        };
      }
      return cat;
    },
  );

  return (
    <div className={cn(root(), className)} role="list" aria-label="Legend" {...rest}>
      {normalizedCategories.map((category) => {
        const bgColor = colorMap[category.color] || category.color;

        return (
          <div key={category.name} className={cn(itemClass(), 'justify-between min-w-[120px]')}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  indicator(),
                  bgColor.startsWith('bg-') ? bgColor : '',
                )}
                style={!bgColor.startsWith('bg-') ? { backgroundColor: bgColor } : undefined}
              />
              <span className={label()}>{category.name}</span>
            </div>
            {showValues && category.value !== undefined && (
              <span className={cn(label(), 'text-text-strong-950 font-medium tabular-nums')}>
                {typeof category.value === 'number'
                  ? valueFormatter(category.value)
                  : category.value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
LegendWithValues.displayName = 'LegendWithValues';

// Color swatch for standalone use
interface ColorSwatchProps extends React.HTMLAttributes<HTMLSpanElement> {
  color: LegendColor;
  size?: 'sm' | 'md' | 'lg';
}

function ColorSwatch({ color, size = 'md', className, ...rest }: ColorSwatchProps) {
  const { indicator } = legendVariants({ size });
  const bgColor = colorMap[color] || color;

  return (
    <span
      className={cn(
        indicator(),
        bgColor.startsWith('bg-') ? bgColor : '',
        className,
      )}
      style={!bgColor.startsWith('bg-') ? { backgroundColor: bgColor } : undefined}
      {...rest}
    />
  );
}
ColorSwatch.displayName = 'ColorSwatch';

export {
  Legend,
  CompactLegend,
  LegendWithValues,
  ColorSwatch,
  legendVariants,
  type LegendItem,
  type LegendColor,
};
