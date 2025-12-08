// AlignUI BarList v0.1.0 - Horizontal bar list for rankings

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const barListVariants = tv({
  slots: {
    root: 'flex flex-col',
    item: 'flex items-center gap-3',
    labelWrapper: 'flex min-w-0 flex-1 items-center gap-2',
    label: 'truncate text-text-strong-950',
    barWrapper: 'relative flex-1',
    bar: 'h-full rounded transition-all duration-300 ease-out',
    value: 'shrink-0 tabular-nums text-text-sub-600',
  },
  variants: {
    size: {
      sm: {
        item: 'py-1.5',
        label: 'text-paragraph-xs',
        barWrapper: 'h-1.5',
        value: 'text-paragraph-xs w-12 text-right',
      },
      md: {
        item: 'py-2',
        label: 'text-paragraph-sm',
        barWrapper: 'h-2',
        value: 'text-paragraph-sm w-14 text-right',
      },
      lg: {
        item: 'py-2.5',
        label: 'text-label-sm',
        barWrapper: 'h-2.5',
        value: 'text-label-sm w-16 text-right',
      },
    },
    color: {
      primary: { bar: 'bg-primary-base' },
      blue: { bar: 'bg-information-base' },
      green: { bar: 'bg-success-base' },
      red: { bar: 'bg-error-base' },
      orange: { bar: 'bg-warning-base' },
      purple: { bar: 'bg-feature-base' },
      gray: { bar: 'bg-faded-base' },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

type BarListVariantProps = VariantProps<typeof barListVariants>;

interface BarListItem {
  name: string;
  value: number;
  icon?: React.ReactNode;
  href?: string;
  color?: BarListVariantProps['color'];
}

interface BarListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    BarListVariantProps {
  data: BarListItem[];
  showAnimation?: boolean;
  valueFormatter?: (value: number) => string;
  sortOrder?: 'ascending' | 'descending' | 'none';
}

function BarList({
  data,
  size,
  color,
  showAnimation = true,
  valueFormatter = (v) => v.toString(),
  sortOrder = 'descending',
  className,
  ...rest
}: BarListProps) {
  const { root, item, labelWrapper, label, barWrapper, bar, value: valueClass } = barListVariants({ size, color });

  // Sort data
  const sortedData = React.useMemo(() => {
    if (sortOrder === 'none') return data;
    return [...data].sort((a, b) =>
      sortOrder === 'descending' ? b.value - a.value : a.value - b.value,
    );
  }, [data, sortOrder]);

  // Calculate max value for scaling
  const maxValue = React.useMemo(
    () => Math.max(...sortedData.map((d) => d.value), 0),
    [sortedData],
  );

  return (
    <div className={cn(root(), className)} role="list" {...rest}>
      {sortedData.map((dataItem, index) => {
        const percentage = maxValue > 0 ? (dataItem.value / maxValue) * 100 : 0;
        const itemColor = dataItem.color || color;
        const { bar: barClass } = barListVariants({ color: itemColor });

        const content = (
          <>
            <div className={labelWrapper()}>
              {dataItem.icon && (
                <span className="shrink-0 text-text-sub-600">{dataItem.icon}</span>
              )}
              <span className={label()}>{dataItem.name}</span>
            </div>
            <div className={cn(barWrapper(), 'bg-bg-soft-200 rounded')}>
              <div
                className={cn(barClass(), showAnimation && 'transition-all duration-500')}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className={valueClass()}>{valueFormatter(dataItem.value)}</span>
          </>
        );

        if (dataItem.href) {
          return (
            <a
              key={index}
              href={dataItem.href}
              className={cn(
                item(),
                'hover:bg-bg-weak-50 -mx-2 px-2 rounded-lg transition-colors duration-200',
              )}
              role="listitem"
            >
              {content}
            </a>
          );
        }

        return (
          <div key={index} className={item()} role="listitem">
            {content}
          </div>
        );
      })}
    </div>
  );
}
BarList.displayName = 'BarList';

// BarList with header
interface BarListWithHeaderProps extends BarListProps {
  title?: string;
  subtitle?: string;
}

function BarListWithHeader({
  title,
  subtitle,
  className,
  ...rest
}: BarListWithHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-0.5">
          {title && (
            <h3 className="text-label-md text-text-strong-950">{title}</h3>
          )}
          {subtitle && (
            <p className="text-paragraph-sm text-text-sub-600">{subtitle}</p>
          )}
        </div>
      )}
      <BarList {...rest} />
    </div>
  );
}
BarListWithHeader.displayName = 'BarListWithHeader';

export {
  BarList,
  BarListWithHeader,
  barListVariants,
  type BarListItem,
};
