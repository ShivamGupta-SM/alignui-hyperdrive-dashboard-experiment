// AlignUI SparkChart v0.1.0 - Compact inline charts for data visualization

'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const sparkChartVariants = tv({
  base: 'relative overflow-hidden',
  variants: {
    size: {
      xs: 'h-6 w-16',
      sm: 'h-8 w-20',
      md: 'h-10 w-24',
      lg: 'h-12 w-32',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type SparkChartVariantProps = VariantProps<typeof sparkChartVariants>;

type DataPoint = {
  value: number;
  [key: string]: number | string;
};

interface SparkChartBaseProps extends SparkChartVariantProps {
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  className?: string;
}

interface SparkAreaChartProps extends SparkChartBaseProps {
  variant?: 'area';
  fillOpacity?: number;
  showGradient?: boolean;
}

interface SparkLineChartProps extends SparkChartBaseProps {
  variant?: 'line';
  strokeWidth?: number;
  dot?: boolean;
}

interface SparkBarChartProps extends SparkChartBaseProps {
  variant?: 'bar';
  barRadius?: number;
}

type SparkChartProps = SparkAreaChartProps | SparkLineChartProps | SparkBarChartProps;

function SparkChart({
  data,
  dataKey = 'value',
  color = 'var(--color-primary-base)',
  size,
  className,
  variant = 'area',
  ...props
}: SparkChartProps) {
  const chartId = React.useId();

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(sparkChartVariants({ size }), 'flex items-center justify-center', className)}
        role="img"
        aria-label="No data available"
      >
        <span className="text-text-soft-400 text-xs">No data</span>
      </div>
    );
  }

  const renderChart = () => {
    switch (variant) {
      case 'line':
        const lineProps = props as SparkLineChartProps;
        return (
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={lineProps.strokeWidth ?? 2}
              dot={lineProps.dot ?? false}
              isAnimationActive={false}
            />
          </LineChart>
        );

      case 'bar':
        const barProps = props as SparkBarChartProps;
        return (
          <BarChart data={data}>
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={barProps.barRadius ?? 2}
              isAnimationActive={false}
            />
          </BarChart>
        );

      case 'area':
      default:
        const areaProps = props as SparkAreaChartProps;
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={areaProps.fillOpacity ?? 0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={areaProps.showGradient !== false ? `url(#gradient-${chartId})` : color}
              fillOpacity={areaProps.showGradient !== false ? 1 : (areaProps.fillOpacity ?? 0.1)}
              isAnimationActive={false}
            />
          </AreaChart>
        );
    }
  };

  return (
    <div
      className={cn(sparkChartVariants({ size }), className)}
      role="img"
      aria-label={`Sparkline chart showing ${data.length} data points`}
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
SparkChart.displayName = 'SparkChart';

// Trend indicator helper
interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  showPercentage?: boolean;
  className?: string;
}

function TrendIndicator({
  value,
  previousValue,
  showPercentage = true,
  className,
}: TrendIndicatorProps) {
  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? ((change / previousValue) * 100) : 0;
  const isPositive = change >= 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-label-xs',
        isPositive ? 'text-success-base' : 'text-error-base',
        className,
      )}
      aria-label={`${isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(percentChange).toFixed(1)}%`}
    >
      <svg
        className={cn('size-3', !isPositive && 'rotate-180')}
        fill="none"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M6 2.5L10 7.5H2L6 2.5Z"
        />
      </svg>
      {showPercentage && (
        <span>{Math.abs(percentChange).toFixed(1)}%</span>
      )}
    </span>
  );
}
TrendIndicator.displayName = 'TrendIndicator';

export { SparkChart, TrendIndicator, type SparkChartProps, type DataPoint };
