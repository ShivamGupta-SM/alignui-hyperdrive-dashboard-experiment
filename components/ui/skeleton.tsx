// AlignUI Skeleton v0.1.0 - Loading placeholder component

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const skeletonVariants = tv({
  base: 'animate-pulse bg-bg-soft-200',
  variants: {
    variant: {
      default: 'rounded-md',
      circle: 'rounded-full',
      text: 'rounded h-4',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    SkeletonVariantProps {
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant,
  width,
  height,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
}
Skeleton.displayName = 'Skeleton';

// Common skeleton patterns
function SkeletonText({
  lines = 3,
  className,
  ...rest
}: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true" {...rest}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}
SkeletonText.displayName = 'SkeletonText';

function SkeletonAvatar({
  size = 40,
  className,
  ...rest
}: { size?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      variant="circle"
      width={size}
      height={size}
      className={className}
      {...rest}
    />
  );
}
SkeletonAvatar.displayName = 'SkeletonAvatar';

function SkeletonCard({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('space-y-4 rounded-xl border border-stroke-soft-200 p-4', className)}
      aria-hidden="true"
      {...rest}
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
SkeletonCard.displayName = 'SkeletonCard';

function SkeletonTableRow({
  columns = 4,
  className,
  ...rest
}: { columns?: number } & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={className} aria-hidden="true" {...rest}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="h-16 px-3">
          <Skeleton variant="text" className={i === 0 ? 'w-2/3' : 'w-full'} />
        </td>
      ))}
    </tr>
  );
}
SkeletonTableRow.displayName = 'SkeletonTableRow';

function SkeletonButton({
  className,
  size = 'medium',
  ...rest
}: { size?: 'small' | 'medium' | 'large' } & React.HTMLAttributes<HTMLDivElement>) {
  const heights = {
    small: 'h-9',
    medium: 'h-10',
    large: 'h-12',
  };

  return (
    <Skeleton
      className={cn(heights[size], 'w-24 rounded-lg', className)}
      {...rest}
    />
  );
}
SkeletonButton.displayName = 'SkeletonButton';

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonButton,
  type SkeletonProps,
};
