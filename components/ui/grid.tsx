// AlignUI Grid v0.1.0 - Responsive grid layout component

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const gridVariants = tv({
  base: 'grid w-full',
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    gapX: {
      none: 'gap-x-0',
      xs: 'gap-x-1',
      sm: 'gap-x-2',
      md: 'gap-x-4',
      lg: 'gap-x-6',
      xl: 'gap-x-8',
    },
    gapY: {
      none: 'gap-y-0',
      xs: 'gap-y-1',
      sm: 'gap-y-2',
      md: 'gap-y-4',
      lg: 'gap-y-6',
      xl: 'gap-y-8',
    },
  },
  defaultVariants: {
    cols: 3,
    gap: 'md',
  },
});

type GridVariantProps = VariantProps<typeof gridVariants>;

interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    GridVariantProps {
  // Responsive columns
  colsSm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsXl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
}

// Responsive columns mapped to full Tailwind classes for JIT compilation
const smColsMap: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  12: 'sm:grid-cols-12',
};

const mdColsMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  12: 'md:grid-cols-12',
};

const lgColsMap: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

const xlColsMap: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  12: 'xl:grid-cols-12',
};

function Grid({
  cols,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap,
  gapX,
  gapY,
  className,
  children,
  ...rest
}: GridProps) {
  const responsiveClasses = [
    colsSm && smColsMap[colsSm],
    colsMd && mdColsMap[colsMd],
    colsLg && lgColsMap[colsLg],
    colsXl && xlColsMap[colsXl],
  ].filter(Boolean);

  return (
    <div
      className={cn(
        gridVariants({ cols, gap, gapX, gapY }),
        responsiveClasses,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
Grid.displayName = 'Grid';

// Grid Col for spanning columns
const colSpanVariants = tv({
  base: '',
  variants: {
    span: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      7: 'col-span-7',
      8: 'col-span-8',
      9: 'col-span-9',
      10: 'col-span-10',
      11: 'col-span-11',
      12: 'col-span-12',
      full: 'col-span-full',
    },
    start: {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
      7: 'col-start-7',
      8: 'col-start-8',
      9: 'col-start-9',
      10: 'col-start-10',
      11: 'col-start-11',
      12: 'col-start-12',
      auto: 'col-start-auto',
    },
  },
  defaultVariants: {
    span: 1,
  },
});

type ColSpanVariantProps = VariantProps<typeof colSpanVariants>;

interface ColProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ColSpanVariantProps {
  // Responsive spans
  spanSm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  spanMd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  spanLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  spanXl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
}

// Responsive span classes for JIT compilation
const smSpanMap: Record<string | number, string> = {
  1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4',
  5: 'sm:col-span-5', 6: 'sm:col-span-6', 7: 'sm:col-span-7', 8: 'sm:col-span-8',
  9: 'sm:col-span-9', 10: 'sm:col-span-10', 11: 'sm:col-span-11', 12: 'sm:col-span-12',
  full: 'sm:col-span-full',
};

const mdSpanMap: Record<string | number, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
  5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
  9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
  full: 'md:col-span-full',
};

const lgSpanMap: Record<string | number, string> = {
  1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
  5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
  9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12',
  full: 'lg:col-span-full',
};

const xlSpanMap: Record<string | number, string> = {
  1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4',
  5: 'xl:col-span-5', 6: 'xl:col-span-6', 7: 'xl:col-span-7', 8: 'xl:col-span-8',
  9: 'xl:col-span-9', 10: 'xl:col-span-10', 11: 'xl:col-span-11', 12: 'xl:col-span-12',
  full: 'xl:col-span-full',
};

function Col({
  span,
  start,
  spanSm,
  spanMd,
  spanLg,
  spanXl,
  className,
  children,
  ...rest
}: ColProps) {
  const responsiveClasses = [
    spanSm && smSpanMap[spanSm],
    spanMd && mdSpanMap[spanMd],
    spanLg && lgSpanMap[spanLg],
    spanXl && xlSpanMap[spanXl],
  ].filter(Boolean);

  return (
    <div
      className={cn(colSpanVariants({ span, start }), responsiveClasses, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
Col.displayName = 'Col';

// Divider for grid items
interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

function Divider({
  orientation = 'horizontal',
  className,
  ...rest
}: DividerProps) {
  return (
    <div
      className={cn(
        'bg-stroke-soft-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      role="separator"
      aria-orientation={orientation}
      {...rest}
    />
  );
}
Divider.displayName = 'Divider';

// Flex component as alternative to Grid
const flexVariants = tv({
  base: 'flex',
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
      rowReverse: 'flex-row-reverse',
      colReverse: 'flex-col-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
      wrapReverse: 'flex-wrap-reverse',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    gap: 'md',
  },
});

type FlexVariantProps = VariantProps<typeof flexVariants>;

interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    FlexVariantProps {}

function Flex({
  direction,
  align,
  justify,
  wrap,
  gap,
  className,
  children,
  ...rest
}: FlexProps) {
  return (
    <div
      className={cn(flexVariants({ direction, align, justify, wrap, gap }), className)}
      {...rest}
    >
      {children}
    </div>
  );
}
Flex.displayName = 'Flex';

// Dashboard Grid - Pre-configured for dashboard layouts
interface DashboardGridProps extends Omit<GridProps, 'cols'> {
  children: React.ReactNode;
}

function DashboardGrid({ className, children, gap = 'lg', ...rest }: DashboardGridProps) {
  return (
    <Grid
      cols={1}
      colsSm={2}
      colsLg={3}
      colsXl={4}
      gap={gap}
      className={cn('w-full', className)}
      {...rest}
    >
      {children}
    </Grid>
  );
}
DashboardGrid.displayName = 'DashboardGrid';

// Metric Grid - For displaying metrics/KPIs
interface MetricGridProps extends Omit<GridProps, 'cols'> {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

function MetricGrid({ columns = 4, className, children, gap = 'md', ...rest }: MetricGridProps) {
  const colsConfig: Record<number, { cols: 1 | 2 | 3 | 4; colsMd: 2 | 3 | 4; colsLg: 2 | 3 | 4 }> = {
    2: { cols: 1, colsMd: 2, colsLg: 2 },
    3: { cols: 1, colsMd: 2, colsLg: 3 },
    4: { cols: 1, colsMd: 2, colsLg: 4 },
  };

  const config = colsConfig[columns];

  return (
    <Grid
      cols={config.cols}
      colsMd={config.colsMd}
      colsLg={config.colsLg}
      gap={gap}
      className={cn('w-full', className)}
      {...rest}
    >
      {children}
    </Grid>
  );
}
MetricGrid.displayName = 'MetricGrid';

export {
  Grid,
  Col,
  Divider,
  Flex,
  DashboardGrid,
  MetricGrid,
  gridVariants,
  colSpanVariants,
  flexVariants,
};
