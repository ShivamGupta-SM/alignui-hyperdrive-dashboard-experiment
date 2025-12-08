// AlignUI Skeleton v0.0.0
// Content placeholder loading component

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const SKELETON_NAME = 'Skeleton';
const SKELETON_TEXT_NAME = 'SkeletonText';
const SKELETON_AVATAR_NAME = 'SkeletonAvatar';
const SKELETON_BUTTON_NAME = 'SkeletonButton';
const SKELETON_CARD_NAME = 'SkeletonCard';

export const skeletonVariants = tv({
  base: [
    // base
    'animate-pulse bg-bg-soft-200',
    'relative overflow-hidden',
    // shimmer effect
    'before:absolute before:inset-0',
    'before:translate-x-[-100%] before:animate-[shimmer_2s_infinite]',
    'before:bg-linear-to-r before:from-transparent before:via-bg-white-0/60 before:to-transparent',
  ],
  variants: {
    //#region variant
    variant: {
      rectangular: 'rounded-md',
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      text: 'rounded',
    },
    //#endregion

    //#region animation
    animation: {
      pulse: 'animate-pulse before:hidden',
      shimmer: 'animate-none',
      none: 'animate-none before:hidden',
    },
    //#endregion
  },
  defaultVariants: {
    variant: 'rectangular',
    animation: 'shimmer',
  },
});

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants> & {
    /** Width of the skeleton (number for px, string for any unit) */
    width?: number | string;
    /** Height of the skeleton (number for px, string for any unit) */
    height?: number | string;
  };

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'rectangular',
      animation = 'shimmer',
      width,
      height,
      style,
      ...rest
    },
    forwardedRef,
  ) => {
    return (
      <div
        ref={forwardedRef}
        className={skeletonVariants({ variant, animation, class: className })}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        aria-hidden='true'
        {...rest}
      />
    );
  },
);
Skeleton.displayName = SKELETON_NAME;

// Preset: Text skeleton with multiple lines
type SkeletonTextProps = Omit<SkeletonProps, 'variant'> & {
  /** Number of lines to display */
  lines?: number;
  /** Gap between lines */
  gap?: 'small' | 'medium' | 'large';
  /** Whether the last line should be shorter */
  lastLineWidth?: number | string;
};

function SkeletonText({
  lines = 3,
  gap = 'small',
  lastLineWidth = '60%',
  className,
  animation,
  ...rest
}: SkeletonTextProps) {
  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-3',
    large: 'gap-4',
  };

  return (
    <div className={cn('flex flex-col', gapClasses[gap], className)} {...rest}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          variant='text'
          animation={animation}
          height={16}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}
SkeletonText.displayName = SKELETON_TEXT_NAME;

// Preset: Avatar skeleton
type SkeletonAvatarProps = Omit<SkeletonProps, 'variant'> & {
  size?: '20' | '24' | '32' | '40' | '48' | '56' | '64' | '80';
};

function SkeletonAvatar({
  size = '40',
  className,
  animation,
  ...rest
}: SkeletonAvatarProps) {
  const sizeMap = {
    '20': 'size-5',
    '24': 'size-6',
    '32': 'size-8',
    '40': 'size-10',
    '48': 'size-12',
    '56': 'size-14',
    '64': 'size-16',
    '80': 'size-20',
  };

  return (
    <Skeleton
      variant='circular'
      animation={animation}
      className={cn(sizeMap[size], className)}
      {...rest}
    />
  );
}
SkeletonAvatar.displayName = SKELETON_AVATAR_NAME;

// Preset: Button skeleton
type SkeletonButtonProps = Omit<SkeletonProps, 'variant'> & {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
};

function SkeletonButton({
  size = 'medium',
  className,
  animation,
  ...rest
}: SkeletonButtonProps) {
  const sizeClasses = {
    small: 'h-8 w-20',
    medium: 'h-9 w-24',
    large: 'h-10 w-28',
    xlarge: 'h-11 w-32',
  };

  return (
    <Skeleton
      variant='rounded'
      animation={animation}
      className={cn(sizeClasses[size], className)}
      {...rest}
    />
  );
}
SkeletonButton.displayName = SKELETON_BUTTON_NAME;

// Preset: Card skeleton with avatar, title, and description
type SkeletonCardProps = React.HTMLAttributes<HTMLDivElement> & {
  animation?: VariantProps<typeof skeletonVariants>['animation'];
  /** Show avatar in card */
  showAvatar?: boolean;
  /** Number of text lines */
  lines?: number;
};

function SkeletonCard({
  className,
  animation,
  showAvatar = true,
  lines = 2,
  ...rest
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-stroke-soft-200 p-4',
        className,
      )}
      {...rest}
    >
      {showAvatar && <SkeletonAvatar size='40' animation={animation} />}
      <div className='flex-1 space-y-2'>
        <Skeleton variant='text' animation={animation} height={20} width='50%' />
        <SkeletonText lines={lines} animation={animation} />
      </div>
    </div>
  );
}
SkeletonCard.displayName = SKELETON_CARD_NAME;

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
};
