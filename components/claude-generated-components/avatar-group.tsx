// AlignUI AvatarGroup v0.0.0
// Stacked avatar display with overflow indicator

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const AVATAR_GROUP_ROOT_NAME = 'AvatarGroupRoot';
const AVATAR_GROUP_OVERFLOW_NAME = 'AvatarGroupOverflow';

export const avatarGroupVariants = tv({
  slots: {
    root: 'flex items-center',
    item: 'relative rounded-full ring-2 ring-bg-white-0',
    overflow: [
      'relative flex items-center justify-center rounded-full',
      'bg-bg-soft-200 text-text-sub-600 ring-2 ring-bg-white-0',
      'select-none font-medium',
    ],
  },
  variants: {
    size: {
      '20': {
        root: '-space-x-1.5',
        item: 'size-5',
        overflow: 'size-5 text-[10px]',
      },
      '24': {
        root: '-space-x-2',
        item: 'size-6',
        overflow: 'size-6 text-label-xs',
      },
      '32': {
        root: '-space-x-2.5',
        item: 'size-8',
        overflow: 'size-8 text-label-xs',
      },
      '40': {
        root: '-space-x-3',
        item: 'size-10',
        overflow: 'size-10 text-label-sm',
      },
      '48': {
        root: '-space-x-3.5',
        item: 'size-12',
        overflow: 'size-12 text-label-sm',
      },
      '56': {
        root: '-space-x-4',
        item: 'size-14',
        overflow: 'size-14 text-label-md',
      },
    },
    direction: {
      left: {
        root: 'flex-row',
      },
      right: {
        root: 'flex-row-reverse',
      },
    },
  },
  defaultVariants: {
    size: '40',
    direction: 'left',
  },
});

type AvatarGroupContextType = VariantProps<typeof avatarGroupVariants>;

const AvatarGroupContext = React.createContext<AvatarGroupContextType>({
  size: '40',
  direction: 'left',
});

export const useAvatarGroupContext = () => React.useContext(AvatarGroupContext);

type AvatarGroupRootProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof avatarGroupVariants> & {
    /** Maximum number of avatars to display before showing overflow */
    max?: number;
  };

const AvatarGroupRoot = React.forwardRef<HTMLDivElement, AvatarGroupRootProps>(
  (
    { className, size = '40', direction = 'left', max, children, ...rest },
    forwardedRef,
  ) => {
    const { root } = avatarGroupVariants({ size, direction });
    const childArray = React.Children.toArray(children);
    const totalCount = childArray.length;
    const displayCount = max ? Math.min(max, totalCount) : totalCount;
    const overflowCount = max ? totalCount - max : 0;

    const displayedChildren = max ? childArray.slice(0, max) : childArray;

    return (
      <AvatarGroupContext.Provider value={{ size, direction }}>
        <div
          ref={forwardedRef}
          className={root({ class: className })}
          role='group'
          aria-label={`Group of ${totalCount} avatars`}
          {...rest}
        >
          {React.Children.map(displayedChildren, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
                style: {
                  ...((child as React.ReactElement<{ style?: React.CSSProperties }>).props.style || {}),
                  zIndex: direction === 'left' ? displayCount - index : index + 1,
                },
              });
            }
            return child;
          })}
          {overflowCount > 0 && (
            <AvatarGroupOverflow
              count={overflowCount}
              style={{ zIndex: direction === 'left' ? 0 : displayCount + 1 }}
            />
          )}
        </div>
      </AvatarGroupContext.Provider>
    );
  },
);
AvatarGroupRoot.displayName = AVATAR_GROUP_ROOT_NAME;

type AvatarGroupOverflowProps = React.HTMLAttributes<HTMLDivElement> & {
  count: number;
};

function AvatarGroupOverflow({
  className,
  count,
  ...rest
}: AvatarGroupOverflowProps) {
  const { size } = useAvatarGroupContext();
  const { overflow } = avatarGroupVariants({ size });

  const displayCount = count > 99 ? '99+' : `+${count}`;

  return (
    <div
      className={overflow({ class: className })}
      aria-label={`${count} more avatars`}
      {...rest}
    >
      {displayCount}
    </div>
  );
}
AvatarGroupOverflow.displayName = AVATAR_GROUP_OVERFLOW_NAME;

// Helper component for wrapping Avatar inside group
type AvatarGroupItemProps = React.HTMLAttributes<HTMLDivElement>;

function AvatarGroupItem({ className, children, ...rest }: AvatarGroupItemProps) {
  const { size } = useAvatarGroupContext();
  const { item } = avatarGroupVariants({ size });

  return (
    <div className={cn(item(), className)} {...rest}>
      {children}
    </div>
  );
}

export {
  AvatarGroupRoot as Root,
  AvatarGroupOverflow as Overflow,
  AvatarGroupItem as Item,
};
