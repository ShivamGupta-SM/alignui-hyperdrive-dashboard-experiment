// AlignUI Charts v0.0.0
// Recharts-based chart components styled for AlignUI design system

'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { cn } from '@/utils/cn';
import {
  chartColors,
  chartGridStyles,
  chartAxisStyles,
  ChartLegendContent,
  ChartTooltipContent,
  ChartActiveDot,
  ChartContainer,
  ChartEmptyState,
  formatChartNumber,
  selectEvenlySpacedItems,
} from './chart-utils';

// ============================================================================
// LINE CHART
// ============================================================================

type LineChartDataPoint = {
  name: string;
  [key: string]: string | number;
};

type LineChartProps = {
  data: LineChartDataPoint[];
  dataKeys: {
    key: string;
    label: string;
    color?: string;
  }[];
  xAxisKey?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  className?: string;
  valueFormatter?: (value: number | string) => string;
  curved?: boolean;
};

export function AlignLineChart({
  data,
  dataKeys,
  xAxisKey = 'name',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
  valueFormatter,
  curved = true,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState className={className} />;
  }

  return (
    <ChartContainer className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray={chartGridStyles.strokeDasharray}
              stroke={chartGridStyles.stroke}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            axisLine={chartAxisStyles.axisLine}
            tickLine={false}
            tick={chartAxisStyles.tick}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={chartAxisStyles.tick}
            dx={-10}
            tickFormatter={(value) =>
              valueFormatter ? valueFormatter(value) : formatChartNumber(value)
            }
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={valueFormatter}
                />
              )}
            />
          )}
          {showLegend && (
            <Legend
              content={({ payload }) => <ChartLegendContent payload={payload} />}
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
          {dataKeys.map((item, index) => (
            <Line
              key={item.key}
              type={curved ? 'monotone' : 'linear'}
              dataKey={item.key}
              name={item.label}
              stroke={item.color || chartColors.palette[index % chartColors.palette.length]}
              strokeWidth={2}
              dot={false}
              activeDot={<ChartActiveDot />}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================================================
// AREA CHART
// ============================================================================

type AreaChartProps = Omit<LineChartProps, 'curved'> & {
  stacked?: boolean;
  fillOpacity?: number;
};

export function AlignAreaChart({
  data,
  dataKeys,
  xAxisKey = 'name',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
  valueFormatter,
  stacked = false,
  fillOpacity = 0.3,
}: AreaChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState className={className} />;
  }

  return (
    <ChartContainer className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray={chartGridStyles.strokeDasharray}
              stroke={chartGridStyles.stroke}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            axisLine={chartAxisStyles.axisLine}
            tickLine={false}
            tick={chartAxisStyles.tick}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={chartAxisStyles.tick}
            dx={-10}
            tickFormatter={(value) =>
              valueFormatter ? valueFormatter(value) : formatChartNumber(value)
            }
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={valueFormatter}
                />
              )}
            />
          )}
          {showLegend && (
            <Legend
              content={({ payload }) => <ChartLegendContent payload={payload} />}
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
          {dataKeys.map((item, index) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color || chartColors.palette[index % chartColors.palette.length]}
              fill={item.color || chartColors.palette[index % chartColors.palette.length]}
              fillOpacity={fillOpacity}
              strokeWidth={2}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================================================
// BAR CHART
// ============================================================================

type BarChartProps = {
  data: LineChartDataPoint[];
  dataKeys: {
    key: string;
    label: string;
    color?: string;
  }[];
  xAxisKey?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  className?: string;
  valueFormatter?: (value: number | string) => string;
  stacked?: boolean;
  horizontal?: boolean;
  barRadius?: number;
};

export function AlignBarChart({
  data,
  dataKeys,
  xAxisKey = 'name',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
  valueFormatter,
  stacked = false,
  horizontal = false,
  barRadius = 4,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState className={className} />;
  }

  return (
    <ChartContainer className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray={chartGridStyles.strokeDasharray}
              stroke={chartGridStyles.stroke}
              vertical={!horizontal}
              horizontal={horizontal}
            />
          )}
          {horizontal ? (
            <>
              <XAxis
                type="number"
                axisLine={chartAxisStyles.axisLine}
                tickLine={false}
                tick={chartAxisStyles.tick}
                tickFormatter={(value) =>
                  valueFormatter ? valueFormatter(value) : formatChartNumber(value)
                }
              />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                axisLine={false}
                tickLine={false}
                tick={chartAxisStyles.tick}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                axisLine={chartAxisStyles.axisLine}
                tickLine={false}
                tick={chartAxisStyles.tick}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={chartAxisStyles.tick}
                dx={-10}
                tickFormatter={(value) =>
                  valueFormatter ? valueFormatter(value) : formatChartNumber(value)
                }
              />
            </>
          )}
          {showTooltip && (
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={valueFormatter}
                />
              )}
            />
          )}
          {showLegend && (
            <Legend
              content={({ payload }) => <ChartLegendContent payload={payload} />}
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
          {dataKeys.map((item, index) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color || chartColors.palette[index % chartColors.palette.length]}
              radius={[barRadius, barRadius, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================================================
// PIE CHART
// ============================================================================

type PieChartDataPoint = {
  name: string;
  value: number;
  color?: string;
};

type PieChartProps = {
  data: PieChartDataPoint[];
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  className?: string;
  valueFormatter?: (value: number | string) => string;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
};

export function AlignPieChart({
  data,
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
  valueFormatter,
  innerRadius = 0,
  outerRadius = 80,
  showLabels = false,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState className={className} />;
  }

  return (
    <ChartContainer className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={
              showLabels
                ? ({ name, percent }: { name?: string; percent?: number }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                : false
            }
            labelLine={showLabels}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || chartColors.palette[index % chartColors.palette.length]}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  valueFormatter={valueFormatter}
                />
              )}
            />
          )}
          {showLegend && (
            <Legend
              content={({ payload }) => <ChartLegendContent payload={payload} />}
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================================================
// DONUT CHART (Pie with inner radius)
// ============================================================================

type DonutChartProps = Omit<PieChartProps, 'innerRadius'> & {
  thickness?: number;
  centerLabel?: React.ReactNode;
};

export function AlignDonutChart({
  data,
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
  valueFormatter,
  outerRadius = 80,
  thickness = 20,
  centerLabel,
  showLabels = false,
}: DonutChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState className={className} />;
  }

  const innerRadius = outerRadius - thickness;

  return (
    <ChartContainer className={cn('relative', className)} style={{ height }}>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">{centerLabel}</div>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={
              showLabels
                ? ({ name, percent }: { name?: string; percent?: number }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                : false
            }
            labelLine={showLabels}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || chartColors.palette[index % chartColors.palette.length]}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  valueFormatter={valueFormatter}
                />
              )}
            />
          )}
          {showLegend && (
            <Legend
              content={({ payload }) => <ChartLegendContent payload={payload} />}
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================================================
// RADAR CHART
// ============================================================================

type RadarChartDataPoint = {
  subject: string;
  [key: string]: string | number;
};

type RadarChartProps = {
  data: RadarChartDataPoint[];
  dataKeys: {
    key: string;
    label: string;
    color?: string;
  }[];
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  className?: string;
  fillOpacity?: number;
};

export function AlignRadarChart({
  data,
  dataKeys,
  showLegend = true,
  showTooltip = true,
  height = 300,
  className,
  fillOpacity = 0.3,
}: RadarChartProps) {
  if (!data || data.length === 0) {
    return <ChartEmptyState className={className} />;
  }

  return (
    <ChartContainer className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
          <PolarGrid stroke={chartGridStyles.stroke} />
          <PolarAngleAxis dataKey="subject" tick={chartAxisStyles.tick} />
          <PolarRadiusAxis tick={chartAxisStyles.tick} axisLine={false} />
          {showTooltip && (
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent active={active} payload={payload} label={label} />
              )}
            />
          )}
          {showLegend && (
            <Legend
              content={({ payload }) => <ChartLegendContent payload={payload} />}
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
          {dataKeys.map((item, index) => (
            <Radar
              key={item.key}
              name={item.label}
              dataKey={item.key}
              stroke={item.color || chartColors.palette[index % chartColors.palette.length]}
              fill={item.color || chartColors.palette[index % chartColors.palette.length]}
              fillOpacity={fillOpacity}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  chartColors,
  chartGridStyles,
  chartAxisStyles,
  ChartLegendContent,
  ChartTooltipContent,
  ChartActiveDot,
  ChartContainer,
  ChartEmptyState,
  formatChartNumber,
  selectEvenlySpacedItems,
};
