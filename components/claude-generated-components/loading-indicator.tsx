// AlignUI LoadingIndicator v0.0.0

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const LOADING_INDICATOR_NAME = 'LoadingIndicator';

export const loadingIndicatorVariants = tv({
  slots: {
    root: 'flex flex-col items-center justify-center',
    spinner: '',
    label: 'text-text-sub-600',
  },
  variants: {
    size: {
      small: {
        root: 'gap-3',
        spinner: 'size-8',
        label: 'text-label-sm',
      },
      medium: {
        root: 'gap-3',
        spinner: 'size-10',
        label: 'text-label-sm',
      },
      large: {
        root: 'gap-4',
        spinner: 'size-12',
        label: 'text-label-md',
      },
      xlarge: {
        root: 'gap-4',
        spinner: 'size-14',
        label: 'text-label-md',
      },
    },
  },
  defaultVariants: {
    size: 'small',
  },
});

type LoadingIndicatorVariants = VariantProps<typeof loadingIndicatorVariants>;

type LoadingIndicatorProps = React.HTMLAttributes<HTMLDivElement> &
  LoadingIndicatorVariants & {
    /**
     * The visual style of the loading indicator.
     * @default 'simple'
     */
    type?: 'simple' | 'spinner' | 'dots';
    /**
     * Optional text label displayed below the indicator.
     */
    label?: string;
  };

const LoadingIndicator = React.forwardRef<HTMLDivElement, LoadingIndicatorProps>(
  (
    { className, type = 'simple', size = 'small', label, ...rest },
    forwardedRef,
  ) => {
    const styles = loadingIndicatorVariants({ size });
    const uniqueId = React.useId();
    const gradientId0 = `loading-gradient-0-${uniqueId}`;
    const gradientId1 = `loading-gradient-1-${uniqueId}`;

    const renderSpinner = () => {
      const spinnerClass = styles.spinner();

      if (type === 'spinner') {
        return (
          <svg
            className={cn('animate-spin text-primary-base', spinnerClass)}
            viewBox='0 0 32 32'
            fill='none'
            aria-hidden='true'
          >
            <circle
              className='stroke-current'
              cx='16'
              cy='16'
              r='14'
              fill='none'
              strokeWidth='4'
              strokeDashoffset='40'
              strokeDasharray='100'
              strokeLinecap='round'
            />
          </svg>
        );
      }

      if (type === 'dots') {
        return (
          <svg
            className={cn('animate-spin text-primary-base', spinnerClass)}
            viewBox='0 0 36 36'
            fill='none'
            aria-hidden='true'
          >
            <path
              d='M34 18C34 15.8989 33.5861 13.8183 32.7821 11.8771C31.978 9.93586 30.7994 8.17203 29.3137 6.68629C27.828 5.20055 26.0641 4.022 24.1229 3.21793C22.1817 2.41385 20.1011 2 18 2C15.8988 2 13.8183 2.41385 11.8771 3.21793C9.93585 4.022 8.17203 5.20055 6.68629 6.68629C5.20055 8.17203 4.022 9.93586 3.21793 11.8771C2.41385 13.8183 2 15.8989 2 18'
              stroke={`url(#${gradientId0})`}
              strokeWidth='4'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeDasharray='0.1 8'
            />
            <path
              d='M3.21793 24.1229C4.022 26.0641 5.20055 27.828 6.68629 29.3137C8.17203 30.7994 9.93585 31.978 11.8771 32.7821C13.8183 33.5861 15.8988 34 18 34C20.1011 34 22.1817 33.5861 24.1229 32.7821C26.0641 31.978 27.828 30.7994 29.3137 29.3137C30.7994 27.828 31.978 26.0641 32.7821 24.1229'
              stroke={`url(#${gradientId1})`}
              strokeWidth='4'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeDasharray='0.1 8'
            />
            <defs>
              <linearGradient
                id={gradientId0}
                x1='34'
                y1='18'
                x2='2'
                y2='18'
                gradientUnits='userSpaceOnUse'
              >
                <stop stopColor='currentColor' />
                <stop offset='1' stopColor='currentColor' stopOpacity='0.5' />
              </linearGradient>
              <linearGradient
                id={gradientId1}
                x1='33'
                y1='23.5'
                x2='3'
                y2='24'
                gradientUnits='userSpaceOnUse'
              >
                <stop stopOpacity='0' stopColor='currentColor' />
                <stop offset='1' stopColor='currentColor' stopOpacity='0.48' />
              </linearGradient>
            </defs>
          </svg>
        );
      }

      // Default: type === 'simple'
      return (
        <svg
          className={cn('animate-spin', spinnerClass)}
          viewBox='0 0 32 32'
          fill='none'
          aria-hidden='true'
        >
          <circle
            className='text-bg-soft-200'
            cx='16'
            cy='16'
            r='14'
            stroke='currentColor'
            strokeWidth='4'
          />
          <circle
            className='stroke-primary-base'
            cx='16'
            cy='16'
            r='14'
            fill='none'
            strokeWidth='4'
            strokeDashoffset='75'
            strokeDasharray='100'
            strokeLinecap='round'
          />
        </svg>
      );
    };

    return (
      <div
        ref={forwardedRef}
        className={styles.root({ class: className })}
        role='status'
        aria-label={label || 'Loading'}
        {...rest}
      >
        {renderSpinner()}
        {label && <span className={styles.label()}>{label}</span>}
      </div>
    );
  },
);
LoadingIndicator.displayName = LOADING_INDICATOR_NAME;

export { LoadingIndicator };
