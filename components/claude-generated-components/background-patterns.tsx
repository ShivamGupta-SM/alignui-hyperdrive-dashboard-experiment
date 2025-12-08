// AlignUI Background Patterns v0.0.0
// SVG background patterns for headers, empty states, etc. - zero dependencies

'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

type PatternProps = React.SVGProps<SVGSVGElement> & {
  /** Size of the pattern */
  size?: 'small' | 'medium' | 'large';
};

const patternSizes = {
  small: 120,
  medium: 160,
  large: 200,
};

export function CirclePattern({ size = 'medium', className, ...props }: PatternProps) {
  const dimension = patternSizes[size];
  const center = dimension / 2;
  const uniqueId = React.useId();
  const gradientId = `circle-pattern-${uniqueId}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('pointer-events-none select-none', className)}
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.06' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </radialGradient>
      </defs>
      {/* Background fade */}
      <circle
        cx={center}
        cy={center}
        r={center}
        fill={`url(#${gradientId})`}
      />
      {/* Concentric circles */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={center * scale}
          fill='none'
          stroke='currentColor'
          strokeOpacity={0.08 - i * 0.012}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

export function GridPattern({ size = 'medium', className, ...props }: PatternProps) {
  const dimension = patternSizes[size];
  const gridSize = 20;
  const lines = Math.floor(dimension / gridSize);
  const uniqueId = React.useId();
  const gradientId = `grid-pattern-gradient-${uniqueId}`;
  const maskId = `grid-pattern-mask-${uniqueId}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('pointer-events-none select-none', className)}
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.08' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </radialGradient>
        <mask id={maskId}>
          <rect width={dimension} height={dimension} fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Vertical lines */}
        {Array.from({ length: lines + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * gridSize}
            y1={0}
            x2={i * gridSize}
            y2={dimension}
            stroke='currentColor'
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: lines + 1 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * gridSize}
            x2={dimension}
            y2={i * gridSize}
            stroke='currentColor'
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}
      </g>
    </svg>
  );
}

export function GridCheckPattern({ size = 'medium', className, ...props }: PatternProps) {
  const dimension = patternSizes[size];
  const gridSize = 20;
  const lines = Math.floor(dimension / gridSize);
  const uniqueId = React.useId();
  const gradientId = `grid-check-pattern-gradient-${uniqueId}`;
  const maskId = `grid-check-pattern-mask-${uniqueId}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('pointer-events-none select-none', className)}
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.08' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </radialGradient>
        <mask id={maskId}>
          <rect width={dimension} height={dimension} fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Vertical lines */}
        {Array.from({ length: lines + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * gridSize}
            y1={0}
            x2={i * gridSize}
            y2={dimension}
            stroke='currentColor'
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: lines + 1 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * gridSize}
            x2={dimension}
            y2={i * gridSize}
            stroke='currentColor'
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        ))}
        {/* Intersection dots */}
        {Array.from({ length: lines + 1 }, (_, i) =>
          Array.from({ length: lines + 1 }, (_, j) => (
            <circle
              key={`dot-${i}-${j}`}
              cx={i * gridSize}
              cy={j * gridSize}
              r={1.5}
              fill='currentColor'
              fillOpacity={0.15}
            />
          ))
        )}
      </g>
    </svg>
  );
}

export function SquarePattern({ size = 'medium', className, ...props }: PatternProps) {
  const dimension = patternSizes[size];
  const squareSize = 24;
  const gap = 8;
  const total = squareSize + gap;
  const count = Math.floor(dimension / total);
  const uniqueId = React.useId();
  const gradientId = `square-pattern-gradient-${uniqueId}`;
  const maskId = `square-pattern-mask-${uniqueId}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('pointer-events-none select-none', className)}
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.08' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </radialGradient>
        <mask id={maskId}>
          <rect width={dimension} height={dimension} fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {Array.from({ length: count }, (_, i) =>
          Array.from({ length: count }, (_, j) => (
            <rect
              key={`sq-${i}-${j}`}
              x={i * total + gap / 2}
              y={j * total + gap / 2}
              width={squareSize}
              height={squareSize}
              rx={4}
              fill='currentColor'
              fillOpacity={0.05}
              stroke='currentColor'
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          ))
        )}
      </g>
    </svg>
  );
}

export function DotPattern({ size = 'medium', className, ...props }: PatternProps) {
  const dimension = patternSizes[size];
  const dotSpacing = 16;
  const dotRadius = 1.5;
  const count = Math.floor(dimension / dotSpacing);
  const uniqueId = React.useId();
  const gradientId = `dot-pattern-gradient-${uniqueId}`;
  const maskId = `dot-pattern-mask-${uniqueId}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('pointer-events-none select-none', className)}
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.1' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </radialGradient>
        <mask id={maskId}>
          <rect width={dimension} height={dimension} fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {Array.from({ length: count }, (_, i) =>
          Array.from({ length: count }, (_, j) => (
            <circle
              key={`dot-${i}-${j}`}
              cx={i * dotSpacing + dotSpacing / 2}
              cy={j * dotSpacing + dotSpacing / 2}
              r={dotRadius}
              fill='currentColor'
              fillOpacity={0.2}
            />
          ))
        )}
      </g>
    </svg>
  );
}

export function WavePattern({ size = 'medium', className, ...props }: PatternProps) {
  const dimension = patternSizes[size];
  const uniqueId = React.useId();
  const gradientId = `wave-pattern-gradient-${uniqueId}`;
  const maskId = `wave-pattern-mask-${uniqueId}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('pointer-events-none select-none', className)}
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.08' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </radialGradient>
        <mask id={maskId}>
          <rect width={dimension} height={dimension} fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {Array.from({ length: 6 }, (_, i) => {
          const y = (i + 1) * (dimension / 7);
          const amplitude = 10;
          return (
            <path
              key={`wave-${i}`}
              d={`M 0 ${y} Q ${dimension / 4} ${y - amplitude} ${dimension / 2} ${y} T ${dimension} ${y}`}
              fill='none'
              stroke='currentColor'
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}
      </g>
    </svg>
  );
}

// Export all patterns as a collection
export const BackgroundPatterns = {
  Circle: CirclePattern,
  Grid: GridPattern,
  GridCheck: GridCheckPattern,
  Square: SquarePattern,
  Dot: DotPattern,
  Wave: WavePattern,
};
