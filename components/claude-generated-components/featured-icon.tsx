// AlignUI FeaturedIcon v0.0.0

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import type { PolymorphicComponentProps } from '@/utils/polymorphic';

const FEATURED_ICON_NAME = 'FeaturedIcon';

export const featuredIconVariants = tv({
  slots: {
    root: 'relative flex shrink-0 items-center justify-center',
    iconWrapper: 'z-10 flex items-center justify-center',
  },
  variants: {
    size: {
      small: {
        iconWrapper: '*:size-4',
      },
      medium: {
        iconWrapper: '*:size-5',
      },
      large: {
        iconWrapper: '*:size-6',
      },
      xlarge: {
        iconWrapper: '*:size-7',
      },
    },
    theme: {
      light: {
        root: 'rounded-full',
      },
      gradient: {
        root: [
          'rounded-full text-static-white',
          'before:absolute before:inset-0 before:size-full before:rounded-full before:border before:mask-b-from-0%',
          'after:absolute after:block after:rounded-full',
        ],
      },
      dark: {
        root: [
          'text-static-white shadow-md',
          'before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%',
        ],
      },
      outline: {
        root: [
          'before:absolute before:rounded-full before:border-2',
          'after:absolute after:rounded-full after:border-2',
        ],
      },
      modern: {
        root: 'bg-bg-white-0 shadow-md ring-1 ring-inset ring-stroke-soft-200',
      },
      'modern-neue': {
        root: [
          'bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200',
          'before:absolute before:inset-1 before:shadow-lg before:ring-1 before:ring-stroke-soft-200',
        ],
      },
    },
    color: {
      gray: {},
      primary: {},
      error: {},
      warning: {},
      success: {},
    },
  },
  compoundVariants: [
    // Size + theme combinations for root sizing
    // Light theme sizes
    { size: 'small', theme: 'light', class: { root: 'size-8' } },
    { size: 'medium', theme: 'light', class: { root: 'size-10' } },
    { size: 'large', theme: 'light', class: { root: 'size-12' } },
    { size: 'xlarge', theme: 'light', class: { root: 'size-14' } },

    // Gradient theme sizes
    { size: 'small', theme: 'gradient', class: { root: 'size-8 after:size-6' } },
    { size: 'medium', theme: 'gradient', class: { root: 'size-10 after:size-7' } },
    { size: 'large', theme: 'gradient', class: { root: 'size-12 after:size-8' } },
    { size: 'xlarge', theme: 'gradient', class: { root: 'size-14 after:size-10' } },

    // Dark theme sizes
    { size: 'small', theme: 'dark', class: { root: 'size-8 rounded-lg before:rounded-[5px]' } },
    { size: 'medium', theme: 'dark', class: { root: 'size-10 rounded-xl before:rounded-[7px]' } },
    { size: 'large', theme: 'dark', class: { root: 'size-12 rounded-xl before:rounded-[9px]' } },
    { size: 'xlarge', theme: 'dark', class: { root: 'size-14 rounded-2xl before:rounded-[11px]' } },

    // Outline theme sizes
    { size: 'small', theme: 'outline', class: { root: 'size-4 before:size-6 after:size-8' } },
    { size: 'medium', theme: 'outline', class: { root: 'size-5 before:size-7 after:size-9' } },
    { size: 'large', theme: 'outline', class: { root: 'size-6 before:size-8 after:size-10' } },
    { size: 'xlarge', theme: 'outline', class: { root: 'size-7 before:size-9 after:size-11' } },

    // Modern theme sizes
    { size: 'small', theme: 'modern', class: { root: 'size-8 rounded-lg' } },
    { size: 'medium', theme: 'modern', class: { root: 'size-10 rounded-xl' } },
    { size: 'large', theme: 'modern', class: { root: 'size-12 rounded-xl' } },
    { size: 'xlarge', theme: 'modern', class: { root: 'size-14 rounded-2xl' } },

    // Modern-neue theme sizes
    { size: 'small', theme: 'modern-neue', class: { root: 'size-8 rounded-lg before:rounded' } },
    { size: 'medium', theme: 'modern-neue', class: { root: 'size-10 rounded-xl before:rounded-md' } },
    { size: 'large', theme: 'modern-neue', class: { root: 'size-12 rounded-xl before:rounded-lg' } },
    { size: 'xlarge', theme: 'modern-neue', class: { root: 'size-14 rounded-2xl before:rounded-xl' } },

    // Light theme colors
    { theme: 'light', color: 'gray', class: { root: 'bg-bg-weak-50 text-text-sub-600' } },
    { theme: 'light', color: 'primary', class: { root: 'bg-primary-lighter text-primary-base' } },
    { theme: 'light', color: 'error', class: { root: 'bg-error-lighter text-error-base' } },
    { theme: 'light', color: 'warning', class: { root: 'bg-warning-lighter text-warning-base' } },
    { theme: 'light', color: 'success', class: { root: 'bg-success-lighter text-success-base' } },

    // Gradient theme colors
    { theme: 'gradient', color: 'gray', class: { root: 'before:border-stroke-soft-200 before:bg-bg-weak-50 after:bg-faded-base' } },
    { theme: 'gradient', color: 'primary', class: { root: 'before:border-primary-lighter before:bg-primary-lighter after:bg-primary-base' } },
    { theme: 'gradient', color: 'error', class: { root: 'before:border-error-lighter before:bg-error-lighter after:bg-error-base' } },
    { theme: 'gradient', color: 'warning', class: { root: 'before:border-warning-lighter before:bg-warning-lighter after:bg-warning-base' } },
    { theme: 'gradient', color: 'success', class: { root: 'before:border-success-lighter before:bg-success-lighter after:bg-success-base' } },

    // Dark theme colors
    { theme: 'dark', color: 'gray', class: { root: 'bg-faded-base' } },
    { theme: 'dark', color: 'primary', class: { root: 'bg-primary-base' } },
    { theme: 'dark', color: 'error', class: { root: 'bg-error-base' } },
    { theme: 'dark', color: 'warning', class: { root: 'bg-warning-base' } },
    { theme: 'dark', color: 'success', class: { root: 'bg-success-base' } },

    // Outline theme colors
    { theme: 'outline', color: 'gray', class: { root: 'text-text-sub-600 before:border-text-sub-600/30 after:border-text-sub-600/10' } },
    { theme: 'outline', color: 'primary', class: { root: 'text-primary-base before:border-primary-base/30 after:border-primary-base/10' } },
    { theme: 'outline', color: 'error', class: { root: 'text-error-base before:border-error-base/30 after:border-error-base/10' } },
    { theme: 'outline', color: 'warning', class: { root: 'text-warning-base before:border-warning-base/30 after:border-warning-base/10' } },
    { theme: 'outline', color: 'success', class: { root: 'text-success-base before:border-success-base/30 after:border-success-base/10' } },

    // Modern theme colors
    { theme: 'modern', color: 'gray', class: { root: 'text-text-sub-600' } },
    { theme: 'modern', color: 'primary', class: { root: 'text-primary-base' } },
    { theme: 'modern', color: 'error', class: { root: 'text-error-base' } },
    { theme: 'modern', color: 'warning', class: { root: 'text-warning-base' } },
    { theme: 'modern', color: 'success', class: { root: 'text-success-base' } },

    // Modern-neue theme colors
    { theme: 'modern-neue', color: 'gray', class: { root: 'text-text-sub-600' } },
    { theme: 'modern-neue', color: 'primary', class: { root: 'text-primary-base' } },
    { theme: 'modern-neue', color: 'error', class: { root: 'text-error-base' } },
    { theme: 'modern-neue', color: 'warning', class: { root: 'text-warning-base' } },
    { theme: 'modern-neue', color: 'success', class: { root: 'text-success-base' } },
  ],
  defaultVariants: {
    size: 'medium',
    theme: 'light',
    color: 'gray',
  },
});

type FeaturedIconProps<T extends React.ElementType = 'div'> = PolymorphicComponentProps<
  T,
  VariantProps<typeof featuredIconVariants> & {
    icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  }
>;

function FeaturedIcon<T extends React.ElementType = 'div'>({
  className,
  as,
  size = 'medium',
  theme = 'light',
  color = 'gray',
  icon: Icon,
  children,
  ...rest
}: FeaturedIconProps<T>) {
  const Component = as || 'div';
  const { root, iconWrapper } = featuredIconVariants({ size, theme, color });

  const renderIcon = () => {
    if (React.isValidElement(Icon)) {
      return <div className={iconWrapper()}>{Icon}</div>;
    }

    if (typeof Icon === 'function') {
      const IconComponent = Icon as React.ComponentType<{ className?: string }>;
      return (
        <div className={iconWrapper()}>
          <IconComponent />
        </div>
      );
    }

    return null;
  };

  return (
    <Component
      data-featured-icon
      className={root({ class: className })}
      {...rest}
    >
      {renderIcon()}
      {children}
    </Component>
  );
}
FeaturedIcon.displayName = FEATURED_ICON_NAME;

export { FeaturedIcon };
