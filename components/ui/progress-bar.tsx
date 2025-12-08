// AlignUI ProgressBar v0.1.0 - Enhanced with indeterminate, sizes, and labels

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

export const progressBarVariants = tv({
  slots: {
    root: 'w-full rounded-full bg-bg-soft-200 overflow-hidden',
    progress: 'h-full origin-left rounded-full transition-all duration-500 ease-out',
    indeterminate: 'h-full origin-left rounded-full animate-progress-indeterminate',
  },
  variants: {
    color: {
      blue: {
        progress: 'bg-information-base',
        indeterminate: 'bg-information-base',
      },
      red: {
        progress: 'bg-error-base',
        indeterminate: 'bg-error-base',
      },
      orange: {
        progress: 'bg-warning-base',
        indeterminate: 'bg-warning-base',
      },
      green: {
        progress: 'bg-success-base',
        indeterminate: 'bg-success-base',
      },
      primary: {
        progress: 'bg-primary-base',
        indeterminate: 'bg-primary-base',
      },
    },
    size: {
      xs: { root: 'h-1' },
      sm: { root: 'h-1.5' },
      md: { root: 'h-2' },
      lg: { root: 'h-3' },
    },
  },
  defaultVariants: {
    color: 'blue',
    size: 'sm',
  },
});

type ProgressBarRootProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof progressBarVariants> & {
    value?: number;
    max?: number;
    isIndeterminate?: boolean;
  };

const ProgressBarRoot = React.forwardRef<HTMLDivElement, ProgressBarRootProps>(
  ({ className, color, size, value = 0, max = 100, isIndeterminate = false, ...rest }, forwardedRef) => {
    const { root, progress, indeterminate } = progressBarVariants({ color, size });
    const safeValue = Math.min(max, Math.max(value, 0));
    const percentage = (safeValue / max) * 100;

    return (
      <div
        ref={forwardedRef}
        className={root({ class: className })}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : safeValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-busy={isIndeterminate}
        {...rest}
      >
        {isIndeterminate ? (
          <div
            className={indeterminate()}
            style={{ width: '40%' }}
          />
        ) : (
          <div
            className={progress()}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    );
  },
);
ProgressBarRoot.displayName = 'ProgressBarRoot';

// Progress with label
interface ProgressBarWithLabelProps extends ProgressBarRootProps {
  label?: string;
  showPercentage?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inline';
}

function ProgressBarWithLabel({
  label,
  showPercentage = true,
  labelPosition = 'top',
  value = 0,
  max = 100,
  className,
  ...rest
}: ProgressBarWithLabelProps) {
  const percentage = Math.round((Math.min(max, Math.max(value, 0)) / max) * 100);

  const labelContent = (
    <div className={cn(
      'flex items-center justify-between text-paragraph-xs',
      labelPosition === 'inline' && 'gap-3',
    )}>
      {label && <span className="text-text-sub-600">{label}</span>}
      {showPercentage && <span className="text-text-strong-950 font-medium">{percentage}%</span>}
    </div>
  );

  if (labelPosition === 'inline') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <ProgressBarRoot value={value} max={max} className="flex-1" {...rest} />
        {labelContent}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {labelPosition === 'top' && labelContent}
      <ProgressBarRoot value={value} max={max} {...rest} />
      {labelPosition === 'bottom' && labelContent}
    </div>
  );
}
ProgressBarWithLabel.displayName = 'ProgressBarWithLabel';

// Stepped progress bar
interface ProgressBarStepsProps extends Omit<ProgressBarRootProps, 'value' | 'max'> {
  steps: number;
  currentStep: number;
  labels?: string[];
}

function ProgressBarSteps({
  steps,
  currentStep,
  labels,
  color,
  size,
  className,
  ...rest
}: ProgressBarStepsProps) {
  const { root, progress } = progressBarVariants({ color, size });

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-1">
        {Array.from({ length: steps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              root(),
              'flex-1',
            )}
            role="progressbar"
            aria-valuenow={index < currentStep ? 100 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={progress()}
              style={{ width: index < currentStep ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>
      {labels && labels.length > 0 && (
        <div className="flex justify-between text-paragraph-xs text-text-sub-600">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(index < currentStep && 'text-text-strong-950')}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
ProgressBarSteps.displayName = 'ProgressBarSteps';

export { ProgressBarRoot as Root, ProgressBarWithLabel as WithLabel, ProgressBarSteps as Steps };
