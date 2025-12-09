// AlignUI Badge v0.1.0 - Enhanced with removable badges and badge groups

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import type { PolymorphicComponentProps } from '@/utils/polymorphic';
import { Slot } from '@radix-ui/react-slot';
import { X } from '@phosphor-icons/react';
import { cn } from '@/utils/cn';

const BADGE_ROOT_NAME = 'BadgeRoot';
const BADGE_ICON_NAME = 'BadgeIcon';
const BADGE_DOT_NAME = 'BadgeDot';

export const badgeVariants = tv({
  slots: {
    root: [
      'inline-flex items-center justify-center rounded-full',
      'font-medium transition duration-200 ease-out',
    ],
    icon: 'shrink-0',
    dot: [
      // base
      'dot',
      'flex items-center justify-center',
      // before
      'before:size-1.5 before:rounded-full before:bg-current',
    ],
  },
  variants: {
    size: {
      small: {
        root: 'h-5 gap-1 px-2 text-[11px] leading-5',
        icon: '-mx-0.5 size-3',
        dot: '-mx-0.5 size-3',
      },
      medium: {
        root: 'h-6 gap-1.5 px-2.5 text-xs leading-6',
        icon: '-mx-0.5 size-3.5',
        dot: '-mx-0.5 size-3.5',
      },
    },
    variant: {
      filled: {
        root: 'text-static-white',
      },
      light: {},
      lighter: {},
      soft: {},
      stroke: {
        root: 'ring-1 ring-inset ring-current',
      },
    },
    color: {
      gray: {},
      blue: {},
      orange: {},
      red: {},
      green: {},
      yellow: {},
      purple: {},
      sky: {},
      pink: {},
      teal: {},
    },
    disabled: {
      true: {
        root: 'pointer-events-none',
      },
    },
    square: {
      true: {},
    },
  },
  compoundVariants: [
    //#region variant=filled
    {
      variant: 'filled',
      color: 'gray',
      class: {
        root: 'bg-faded-base',
      },
    },
    {
      variant: 'filled',
      color: 'blue',
      class: {
        root: 'bg-information-base',
      },
    },
    {
      variant: 'filled',
      color: 'orange',
      class: {
        root: 'bg-warning-base',
      },
    },
    {
      variant: 'filled',
      color: 'red',
      class: {
        root: 'bg-error-base',
      },
    },
    {
      variant: 'filled',
      color: 'green',
      class: {
        root: 'bg-success-base',
      },
    },
    {
      variant: 'filled',
      color: 'yellow',
      class: {
        root: 'bg-away-base',
      },
    },
    {
      variant: 'filled',
      color: 'purple',
      class: {
        root: 'bg-feature-base',
      },
    },
    {
      variant: 'filled',
      color: 'sky',
      class: {
        root: 'bg-verified-base',
      },
    },
    {
      variant: 'filled',
      color: 'pink',
      class: {
        root: 'bg-highlighted-base',
      },
    },
    {
      variant: 'filled',
      color: 'teal',
      class: {
        root: 'bg-stable-base',
      },
    },
    // #endregion

    //#region variant=light
    {
      variant: 'light',
      color: 'gray',
      class: {
        root: 'bg-faded-light text-faded-dark',
      },
    },
    {
      variant: 'light',
      color: 'blue',
      class: {
        root: 'bg-information-light text-information-dark',
      },
    },
    {
      variant: 'light',
      color: 'orange',
      class: {
        root: 'bg-warning-light text-warning-dark',
      },
    },
    {
      variant: 'light',
      color: 'red',
      class: {
        root: 'bg-error-light text-error-dark',
      },
    },
    {
      variant: 'light',
      color: 'green',
      class: {
        root: 'bg-success-light text-success-dark',
      },
    },
    {
      variant: 'light',
      color: 'yellow',
      class: {
        root: 'bg-away-light text-away-dark',
      },
    },
    {
      variant: 'light',
      color: 'purple',
      class: {
        root: 'bg-feature-light text-feature-dark',
      },
    },
    {
      variant: 'light',
      color: 'sky',
      class: {
        root: 'bg-verified-light text-verified-dark',
      },
    },
    {
      variant: 'light',
      color: 'pink',
      class: {
        root: 'bg-highlighted-light text-highlighted-dark',
      },
    },
    {
      variant: 'light',
      color: 'teal',
      class: {
        root: 'bg-stable-light text-stable-dark',
      },
    },
    //#endregion

    //#region variant=lighter
    {
      variant: 'lighter',
      color: 'gray',
      class: {
        root: 'bg-faded-lighter text-faded-base',
      },
    },
    {
      variant: 'lighter',
      color: 'blue',
      class: {
        root: 'bg-information-lighter text-information-base',
      },
    },
    {
      variant: 'lighter',
      color: 'orange',
      class: {
        root: 'bg-warning-lighter text-warning-base',
      },
    },
    {
      variant: 'lighter',
      color: 'red',
      class: {
        root: 'bg-error-lighter text-error-base',
      },
    },
    {
      variant: 'lighter',
      color: 'green',
      class: {
        root: 'bg-success-lighter text-success-base',
      },
    },
    {
      variant: 'lighter',
      color: 'yellow',
      class: {
        root: 'bg-away-lighter text-away-base',
      },
    },
    {
      variant: 'lighter',
      color: 'purple',
      class: {
        root: 'bg-feature-lighter text-feature-base',
      },
    },
    {
      variant: 'lighter',
      color: 'sky',
      class: {
        root: 'bg-verified-lighter text-verified-base',
      },
    },
    {
      variant: 'lighter',
      color: 'pink',
      class: {
        root: 'bg-highlighted-lighter text-highlighted-base',
      },
    },
    {
      variant: 'lighter',
      color: 'teal',
      class: {
        root: 'bg-stable-lighter text-stable-base',
      },
    },
    //#endregion

    //#region variant=soft (modern alpha backgrounds with vibrant text)
    {
      variant: 'soft',
      color: 'gray',
      class: {
        root: 'bg-neutral-alpha-10 text-text-sub-600',
      },
    },
    {
      variant: 'soft',
      color: 'blue',
      class: {
        root: 'bg-blue-alpha-10 text-blue-600',
      },
    },
    {
      variant: 'soft',
      color: 'orange',
      class: {
        root: 'bg-orange-alpha-10 text-orange-600',
      },
    },
    {
      variant: 'soft',
      color: 'red',
      class: {
        root: 'bg-red-alpha-10 text-red-600',
      },
    },
    {
      variant: 'soft',
      color: 'green',
      class: {
        root: 'bg-green-alpha-10 text-green-600',
      },
    },
    {
      variant: 'soft',
      color: 'yellow',
      class: {
        root: 'bg-yellow-alpha-10 text-yellow-700',
      },
    },
    {
      variant: 'soft',
      color: 'purple',
      class: {
        root: 'bg-purple-alpha-10 text-purple-600',
      },
    },
    {
      variant: 'soft',
      color: 'sky',
      class: {
        root: 'bg-sky-alpha-10 text-sky-600',
      },
    },
    {
      variant: 'soft',
      color: 'pink',
      class: {
        root: 'bg-pink-alpha-10 text-pink-600',
      },
    },
    {
      variant: 'soft',
      color: 'teal',
      class: {
        root: 'bg-teal-alpha-10 text-teal-600',
      },
    },
    //#endregion

    //#region variant=stroke
    {
      variant: 'stroke',
      color: 'gray',
      class: {
        root: 'text-faded-base',
      },
    },
    {
      variant: 'stroke',
      color: 'blue',
      class: {
        root: 'text-information-base',
      },
    },
    {
      variant: 'stroke',
      color: 'orange',
      class: {
        root: 'text-warning-base',
      },
    },
    {
      variant: 'stroke',
      color: 'red',
      class: {
        root: 'text-error-base',
      },
    },
    {
      variant: 'stroke',
      color: 'green',
      class: {
        root: 'text-success-base',
      },
    },
    {
      variant: 'stroke',
      color: 'yellow',
      class: {
        root: 'text-away-base',
      },
    },
    {
      variant: 'stroke',
      color: 'purple',
      class: {
        root: 'text-feature-base',
      },
    },
    {
      variant: 'stroke',
      color: 'sky',
      class: {
        root: 'text-verified-base',
      },
    },
    {
      variant: 'stroke',
      color: 'pink',
      class: {
        root: 'text-highlighted-base',
      },
    },
    {
      variant: 'stroke',
      color: 'teal',
      class: {
        root: 'text-stable-base',
      },
    },
    //#endregion

    //#region square
    {
      size: 'small',
      square: true,
      class: {
        root: 'min-w-5 px-1',
      },
    },
    {
      size: 'medium',
      square: true,
      class: {
        root: 'min-w-6 px-1.5',
      },
    },
    //#endregion

    //#region disabled
    {
      disabled: true,
      variant: ['stroke', 'filled', 'light', 'lighter', 'soft'],
      color: [
        'red',
        'gray',
        'blue',
        'orange',
        'green',
        'yellow',
        'purple',
        'sky',
        'pink',
        'teal',
      ],
      class: {
        root: [
          'ring-1 ring-inset ring-stroke-soft-200',
          'bg-transparent text-text-disabled-300',
        ],
      },
    },
    //#endregion
  ],
  defaultVariants: {
    variant: 'filled',
    size: 'small',
    color: 'gray',
  },
});

type BadgeSharedProps = VariantProps<typeof badgeVariants>;

type BadgeRootProps = VariantProps<typeof badgeVariants> &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
  };

const BadgeRoot = React.forwardRef<HTMLDivElement, BadgeRootProps>(
  (
    {
      asChild,
      size,
      variant,
      color,
      disabled,
      square,
      children,
      className,
      ...rest
    },
    forwardedRef,
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'div';
    const { root } = badgeVariants({ size, variant, color, disabled, square });

    const sharedProps: BadgeSharedProps = {
      size,
      variant,
      color,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [BADGE_ICON_NAME, BADGE_DOT_NAME],
      uniqueId,
      asChild,
    );

    return (
      <Component
        ref={forwardedRef}
        className={root({ class: className })}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  },
);
BadgeRoot.displayName = BADGE_ROOT_NAME;

function BadgeIcon<T extends React.ElementType>({
  className,
  size,
  variant,
  color,
  as,
  ...rest
}: PolymorphicComponentProps<T, BadgeSharedProps>) {
  const Component = as || 'div';
  const { icon } = badgeVariants({ size, variant, color });

  return <Component className={icon({ class: className })} {...rest} />;
}
BadgeIcon.displayName = BADGE_ICON_NAME;

type BadgeDotProps = BadgeSharedProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>;

function BadgeDot({ size, variant, color, className, ...rest }: BadgeDotProps) {
  const { dot } = badgeVariants({ size, variant, color });

  return <div className={dot({ class: className })} {...rest} />;
}
BadgeDot.displayName = BADGE_DOT_NAME;

// Removable Badge with close button
interface RemovableBadgeProps extends Omit<BadgeRootProps, 'asChild'> {
  onRemove?: () => void;
  removeAriaLabel?: string;
}

function RemovableBadge({
  children,
  size = 'medium',
  variant = 'light',
  color = 'gray',
  disabled,
  className,
  onRemove,
  removeAriaLabel = 'Remove',
  ...rest
}: RemovableBadgeProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);
  const { root } = badgeVariants({ size, variant, color, disabled });

  const handleRemove = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onRemove?.();
    }, 150);
  }, [onRemove]);

  if (!isVisible) return null;

  const closeIconSize = size === 'small' ? 'size-3' : 'size-3.5';

  return (
    <div
      className={cn(
        root({ class: className }),
        'pr-1.5 transition-all duration-150 ease-out',
        isExiting && 'scale-95 opacity-0',
      )}
      {...rest}
    >
      {children}
      <button
        type="button"
        onClick={handleRemove}
        disabled={disabled ?? false}
        className={cn(
          closeIconSize,
          'shrink-0 cursor-pointer rounded-full opacity-70 transition-opacity hover:opacity-100',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-current',
          disabled && 'cursor-not-allowed opacity-30',
        )}
        aria-label={removeAriaLabel}
      >
        <X className="size-full" weight="bold" />
      </button>
    </div>
  );
}
RemovableBadge.displayName = 'RemovableBadge';

// Badge Group for displaying multiple badges
interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'xs' | 'sm' | 'md';
  wrap?: boolean;
  maxVisible?: number;
  renderOverflow?: (count: number) => React.ReactNode;
}

function BadgeGroup({
  children,
  className,
  gap = 'sm',
  wrap = true,
  maxVisible,
  renderOverflow,
  ...rest
}: BadgeGroupProps) {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-1.5',
    md: 'gap-2',
  };

  const childArray = React.Children.toArray(children);
  const visibleChildren = maxVisible ? childArray.slice(0, maxVisible) : childArray;
  const overflowCount = maxVisible ? Math.max(0, childArray.length - maxVisible) : 0;

  return (
    <div
      className={cn(
        'inline-flex items-center',
        gapClasses[gap],
        wrap && 'flex-wrap',
        className,
      )}
      role="group"
      {...rest}
    >
      {visibleChildren}
      {overflowCount > 0 && renderOverflow && renderOverflow(overflowCount)}
    </div>
  );
}
BadgeGroup.displayName = 'BadgeGroup';

// Badge with count (for notifications, etc.)
interface CountBadgeProps extends Omit<BadgeRootProps, 'asChild' | 'children'> {
  count: number;
  max?: number;
  showZero?: boolean;
}

function CountBadge({
  count,
  max = 99,
  showZero = false,
  size = 'small',
  variant = 'filled',
  color = 'red',
  className,
  ...rest
}: CountBadgeProps) {
  const { root } = badgeVariants({ size, variant, color, square: true });

  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <div className={root({ class: className })} {...rest}>
      {displayCount}
    </div>
  );
}
CountBadge.displayName = 'CountBadge';

export {
  BadgeRoot as Root,
  BadgeIcon as Icon,
  BadgeDot as Dot,
  RemovableBadge,
  BadgeGroup,
  CountBadge,
};
