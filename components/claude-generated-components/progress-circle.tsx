// AlignUI ProgressCircle v0.0.0
// Circular/donut progress indicator

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';

const PROGRESS_CIRCLE_NAME = 'ProgressCircle';

export const progressCircleVariants = tv({
  slots: {
    root: 'relative inline-flex items-center justify-center',
    svg: 'rotate-[-90deg]',
    track: 'text-bg-soft-200',
    indicator: 'transition-all duration-300 ease-out',
    content: 'absolute inset-0 flex flex-col items-center justify-center',
    value: 'font-semibold text-text-strong-950',
    label: 'text-text-sub-600',
  },
  variants: {
    size: {
      small: {
        root: 'size-16',
        value: 'text-label-md',
        label: 'text-[10px]',
      },
      medium: {
        root: 'size-24',
        value: 'text-title-h5',
        label: 'text-label-xs',
      },
      large: {
        root: 'size-32',
        value: 'text-title-h4',
        label: 'text-label-sm',
      },
      xlarge: {
        root: 'size-40',
        value: 'text-title-h3',
        label: 'text-label-md',
      },
    },
    color: {
      primary: {
        indicator: 'text-primary-base',
      },
      success: {
        indicator: 'text-success-base',
      },
      warning: {
        indicator: 'text-warning-base',
      },
      error: {
        indicator: 'text-error-base',
      },
      gray: {
        indicator: 'text-faded-base',
      },
    },
  },
  defaultVariants: {
    size: 'medium',
    color: 'primary',
  },
});

type ProgressCircleProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof progressCircleVariants> & {
    /** Progress value from 0 to 100 */
    value: number;
    /** Stroke width of the circle */
    strokeWidth?: number;
    /** Whether to show the percentage value */
    showValue?: boolean;
    /** Label below the value */
    label?: string;
    /** Custom content to display in center */
    children?: React.ReactNode;
  };

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  (
    {
      className,
      size = 'medium',
      color = 'primary',
      value,
      strokeWidth,
      showValue = true,
      label,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = progressCircleVariants({ size, color });

    // Size mappings for SVG dimensions
    const sizeMap = {
      small: 64,
      medium: 96,
      large: 128,
      xlarge: 160,
    };

    // Default stroke widths based on size
    const defaultStrokeWidths = {
      small: 6,
      medium: 8,
      large: 10,
      xlarge: 12,
    };

    const svgSize = sizeMap[size || 'medium'];
    const stroke = strokeWidth || defaultStrokeWidths[size || 'medium'];
    const radius = (svgSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedValue = Math.max(0, Math.min(100, value));
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    return (
      <div
        ref={forwardedRef}
        className={styles.root({ class: className })}
        role='progressbar'
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `${clampedValue}% progress`}
        {...rest}
      >
        <svg
          className={styles.svg()}
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          aria-hidden='true'
        >
          {/* Background track */}
          <circle
            className={styles.track()}
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill='none'
            stroke='currentColor'
            strokeWidth={stroke}
          />
          {/* Progress indicator */}
          <circle
            className={styles.indicator()}
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill='none'
            stroke='currentColor'
            strokeWidth={stroke}
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Center content */}
        <div className={styles.content()}>
          {children ? (
            children
          ) : (
            <>
              {showValue && (
                <span className={styles.value()}>{Math.round(clampedValue)}%</span>
              )}
              {label && <span className={styles.label()}>{label}</span>}
            </>
          )}
        </div>
      </div>
    );
  },
);
ProgressCircle.displayName = PROGRESS_CIRCLE_NAME;

export { ProgressCircle };
