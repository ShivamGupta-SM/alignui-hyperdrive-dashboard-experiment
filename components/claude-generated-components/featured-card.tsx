// AlignUI FeaturedCard v0.0.0
// Card with progress indicators for sidebar navigation and onboarding flows

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';
import { RiCloseLine } from '@remixicon/react';

const FEATURED_CARD_NAME = 'FeaturedCard';
const FEATURED_CARD_PROGRESS_BAR_NAME = 'FeaturedCardProgressBar';
const FEATURED_CARD_PROGRESS_CIRCLE_NAME = 'FeaturedCardProgressCircle';

export const featuredCardVariants = tv({
  slots: {
    root: [
      'relative flex flex-col rounded-xl p-4',
      'bg-bg-weak-50 ring-1 ring-stroke-soft-200',
      // Animation support
      'transition-all duration-200 ease-out',
      'data-[state=entering]:animate-in data-[state=entering]:fade-in-0 data-[state=entering]:slide-in-from-bottom-2',
      'data-[state=exiting]:animate-out data-[state=exiting]:fade-out-0 data-[state=exiting]:slide-out-to-bottom-2',
    ],
    closeButton: [
      'absolute top-2 right-2',
      'flex items-center justify-center rounded-md p-1',
      'text-text-soft-400 hover:text-text-sub-600 hover:bg-bg-soft-200',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
    ],
    title: 'text-label-sm font-semibold text-text-strong-950',
    description: 'mt-1 text-paragraph-sm text-text-sub-600',
    progressBar: [
      'mt-4 h-2 w-full overflow-hidden rounded-full bg-bg-soft-200',
    ],
    progressBarIndicator: [
      'h-full rounded-full transition-all duration-300 ease-out',
    ],
    progressCircleWrapper: 'w-14',
    actions: 'mt-4 flex items-center gap-3',
    actionButton: [
      'text-label-sm font-semibold transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 rounded',
    ],
  },
  variants: {
    color: {
      primary: {
        progressBarIndicator: 'bg-primary-base',
      },
      success: {
        progressBarIndicator: 'bg-success-base',
      },
      warning: {
        progressBarIndicator: 'bg-warning-base',
      },
      error: {
        progressBarIndicator: 'bg-error-base',
      },
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

type FeaturedCardBaseProps = {
  /** Card title */
  title: string;
  /** Card description */
  description: React.ReactNode;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the dismiss button */
  dismissLabel?: string;
  /** Callback when dismiss is clicked */
  onDismiss?: () => void;
  /** Callback when confirm is clicked */
  onConfirm?: () => void;
  /** Whether to show the close button */
  showCloseButton?: boolean;
};

// Progress Bar variant
type FeaturedCardProgressBarProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof featuredCardVariants> &
  FeaturedCardBaseProps & {
    /** Progress value from 0 to 100 */
    progress: number;
  };

const FeaturedCardProgressBar = React.forwardRef<
  HTMLDivElement,
  FeaturedCardProgressBarProps
>(
  (
    {
      className,
      color = 'primary',
      title,
      description,
      progress,
      confirmLabel = 'Continue',
      dismissLabel = 'Dismiss',
      onDismiss,
      onConfirm,
      showCloseButton = true,
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = featuredCardVariants({ color });
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
      <div
        ref={forwardedRef}
        className={styles.root({ class: className })}
        {...rest}
      >
        {showCloseButton && (
          <button
            type='button'
            className={styles.closeButton()}
            onClick={onDismiss}
            aria-label='Close'
          >
            <RiCloseLine className='size-4' />
          </button>
        )}

        <p className={styles.title()}>{title}</p>
        <p className={styles.description()}>{description}</p>

        <div
          className={styles.progressBar()}
          role='progressbar'
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={styles.progressBarIndicator()}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        <div className={styles.actions()}>
          <button
            type='button'
            className={cn(styles.actionButton(), 'text-text-sub-600 hover:text-text-strong-950')}
            onClick={onDismiss}
          >
            {dismissLabel}
          </button>
          <button
            type='button'
            className={cn(styles.actionButton(), 'text-primary-base hover:text-primary-darker')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  },
);
FeaturedCardProgressBar.displayName = FEATURED_CARD_PROGRESS_BAR_NAME;

// Progress Circle variant
type FeaturedCardProgressCircleProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof featuredCardVariants> &
  FeaturedCardBaseProps & {
    /** Progress value from 0 to 100 */
    progress: number;
  };

const FeaturedCardProgressCircle = React.forwardRef<
  HTMLDivElement,
  FeaturedCardProgressCircleProps
>(
  (
    {
      className,
      color = 'primary',
      title,
      description,
      progress,
      confirmLabel = 'Continue',
      dismissLabel = 'Dismiss',
      onDismiss,
      onConfirm,
      showCloseButton = true,
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = featuredCardVariants({ color });
    const clampedProgress = Math.max(0, Math.min(100, progress));

    // Circle dimensions
    const size = 56;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    const colorClasses = {
      primary: 'text-primary-base',
      success: 'text-success-base',
      warning: 'text-warning-base',
      error: 'text-error-base',
    };

    return (
      <div
        ref={forwardedRef}
        className={styles.root({ class: className })}
        {...rest}
      >
        {showCloseButton && (
          <button
            type='button'
            className={styles.closeButton()}
            onClick={onDismiss}
            aria-label='Close'
          >
            <RiCloseLine className='size-4' />
          </button>
        )}

        <div
          className={styles.progressCircleWrapper()}
          role='progressbar'
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className='rotate-[-90deg]'
            aria-hidden='true'
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='none'
              stroke='currentColor'
              strokeWidth={strokeWidth}
              className='text-bg-soft-200'
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='none'
              stroke='currentColor'
              strokeWidth={strokeWidth}
              strokeLinecap='round'
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn('transition-all duration-300', colorClasses[color || 'primary'])}
            />
          </svg>
        </div>

        <div className='mt-3'>
          <p className={styles.title()}>{title}</p>
          <p className={styles.description()}>{description}</p>
        </div>

        <div className={styles.actions()}>
          <button
            type='button'
            className={cn(styles.actionButton(), 'text-text-sub-600 hover:text-text-strong-950')}
            onClick={onDismiss}
          >
            {dismissLabel}
          </button>
          <button
            type='button'
            className={cn(styles.actionButton(), 'text-primary-base hover:text-primary-darker')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  },
);
FeaturedCardProgressCircle.displayName = FEATURED_CARD_PROGRESS_CIRCLE_NAME;

// Simple featured card without progress
type FeaturedCardProps = React.HTMLAttributes<HTMLDivElement> &
  FeaturedCardBaseProps & {
    /** Optional icon to display */
    icon?: React.ReactNode;
  };

const FeaturedCard = React.forwardRef<HTMLDivElement, FeaturedCardProps>(
  (
    {
      className,
      title,
      description,
      icon,
      confirmLabel = 'Learn more',
      dismissLabel = 'Dismiss',
      onDismiss,
      onConfirm,
      showCloseButton = true,
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = featuredCardVariants();

    return (
      <div
        ref={forwardedRef}
        className={styles.root({ class: className })}
        {...rest}
      >
        {showCloseButton && (
          <button
            type='button'
            className={styles.closeButton()}
            onClick={onDismiss}
            aria-label='Close'
          >
            <RiCloseLine className='size-4' />
          </button>
        )}

        {icon && <div className='mb-3'>{icon}</div>}

        <p className={styles.title()}>{title}</p>
        <p className={styles.description()}>{description}</p>

        <div className={styles.actions()}>
          <button
            type='button'
            className={cn(styles.actionButton(), 'text-text-sub-600 hover:text-text-strong-950')}
            onClick={onDismiss}
          >
            {dismissLabel}
          </button>
          <button
            type='button'
            className={cn(styles.actionButton(), 'text-primary-base hover:text-primary-darker')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  },
);
FeaturedCard.displayName = FEATURED_CARD_NAME;

export {
  FeaturedCard,
  FeaturedCardProgressBar,
  FeaturedCardProgressCircle,
};
