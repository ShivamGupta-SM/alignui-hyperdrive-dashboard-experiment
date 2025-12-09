// AlignUI FancyButton v0.0.0 - Converted from Button component

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { CircleNotch } from '@phosphor-icons/react';
import type { PolymorphicComponentProps } from '@/utils/polymorphic';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import { tv, type VariantProps } from '@/utils/tv';

const BUTTON_ROOT_NAME = 'ButtonRoot';
const BUTTON_ICON_NAME = 'ButtonIcon';

export const buttonVariants = tv({
  slots: {
    root: [
      // base
      'group relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-label-sm outline-none',
      'transition duration-200 ease-out',
      // focus
      'focus:outline-none',
      // disabled
      'disabled:pointer-events-none disabled:text-text-disabled-300',
      'disabled:bg-bg-weak-50 disabled:bg-none disabled:shadow-none disabled:before:hidden disabled:after:hidden',
    ],
    icon: 'relative z-10 size-5 shrink-0',
    spinner: 'relative z-10 animate-spin',
  },
  variants: {
    variant: {
      neutral: {
        root: [
          'bg-bg-strong-950 text-text-white-0 shadow-fancy-buttons-neutral',
          // focus
          'focus-visible:shadow-button-important-focus',
        ],
      },
      primary: {
        root: [
          'bg-primary-base text-static-white shadow-fancy-buttons-primary',
          // focus
          'focus-visible:shadow-button-primary-focus',
        ],
      },
      error: {
        root: [
          'bg-error-base text-static-white shadow-fancy-buttons-error',
          // focus
          'focus-visible:shadow-button-error-focus',
        ],
      },
      basic: {
        root: [
          // base
          'bg-bg-white-0 text-text-sub-600 shadow-fancy-buttons-stroke',
          // hover
          'hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none',
          // focus
          'focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus',
        ],
      },
      ghost: {
        root: [
          // base
          'bg-transparent text-text-sub-600 shadow-none',
          // hover
          'hover:bg-bg-weak-50 hover:text-text-strong-950',
          // focus
          'focus-visible:bg-bg-white-0 focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus',
        ],
      },
    },
    size: {
      medium: {
        root: 'h-10 gap-3 rounded-10 px-3.5',
        icon: '-mx-1',
      },
      small: {
        root: 'h-9 gap-3 rounded-lg px-3',
        icon: '-mx-1',
      },
      xsmall: {
        root: 'h-8 gap-2.5 rounded-lg px-2.5',
        icon: '-mx-1',
      },
      xxsmall: {
        root: 'h-7 gap-2.5 rounded-lg px-2 text-label-xs',
        icon: '-mx-1',
      },
    },
    isLoading: {
      true: {
        root: 'pointer-events-none opacity-80',
      },
    },
  },
  compoundVariants: [
    // Fancy gradient overlay for filled variants (neutral, primary, error)
    {
      variant: ['neutral', 'primary', 'error'],
      class: {
        root: [
          // before - top highlight border
          'before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit]',
          'before:bg-gradient-to-b before:p-px',
          'before:from-static-white/[.12] before:to-transparent',
          // before mask
          'before:[mask-clip:content-box,border-box] before:[mask-composite:exclude] before:[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)]',
          // after - hover glow
          'after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-to-b after:from-static-white after:to-transparent',
          'after:pointer-events-none after:opacity-[.16] after:transition after:duration-200 after:ease-out',
          // hover
          'hover:after:opacity-[.24]',
        ],
      },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

type ButtonSharedProps = VariantProps<typeof buttonVariants>;

type ButtonRootProps = VariantProps<typeof buttonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
  };

const ButtonRoot = React.forwardRef<HTMLButtonElement, ButtonRootProps>(
  (
    { children, variant, size, asChild, className, isLoading, loadingText, disabled, ...rest },
    forwardedRef,
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : 'button';
    const { root, spinner } = buttonVariants({ variant, size, isLoading });

    const sharedProps: ButtonSharedProps = {
      variant,
      size,
    };

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      sharedProps,
      [BUTTON_ICON_NAME],
      uniqueId,
      asChild,
    );

    return (
      <Component
        ref={forwardedRef}
        className={root({ class: className })}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? (
          <>
            <CircleNotch className={spinner({ class: 'size-5' })} aria-hidden="true" />
            {loadingText && <span className="relative z-10">{loadingText}</span>}
            {!loadingText && <span className="sr-only">Loading</span>}
          </>
        ) : (
          extendedChildren
        )}
      </Component>
    );
  },
);
ButtonRoot.displayName = BUTTON_ROOT_NAME;

function ButtonIcon<T extends React.ElementType>({
  variant,
  size,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, ButtonSharedProps>) {
  const Component = as || 'div';
  const { icon } = buttonVariants({ variant, size });

  return <Component className={icon({ class: className })} aria-hidden="true" {...rest} />;
}
ButtonIcon.displayName = BUTTON_ICON_NAME;

export { ButtonRoot as Root, ButtonIcon as Icon };
