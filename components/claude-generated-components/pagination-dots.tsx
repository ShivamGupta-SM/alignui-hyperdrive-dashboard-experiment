// AlignUI PaginationDots v0.0.0
// Dot-style pagination indicator for carousels and slideshows

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';

const PAGINATION_DOTS_ROOT_NAME = 'PaginationDotsRoot';
const PAGINATION_DOT_NAME = 'PaginationDot';

export const paginationDotsVariants = tv({
  slots: {
    root: 'flex items-center justify-center',
    dot: [
      'rounded-full transition-all duration-200 ease-out',
      'cursor-pointer outline-none',
      'focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2',
    ],
  },
  variants: {
    size: {
      small: {
        root: 'gap-1.5',
        dot: 'size-1.5',
      },
      medium: {
        root: 'gap-2',
        dot: 'size-2',
      },
      large: {
        root: 'gap-2.5',
        dot: 'size-2.5',
      },
    },
    variant: {
      default: {
        dot: 'bg-bg-soft-200 data-[active=true]:bg-primary-base',
      },
      outline: {
        dot: [
          'border border-stroke-soft-200 bg-transparent',
          'data-[active=true]:border-primary-base data-[active=true]:bg-primary-base',
        ],
      },
      pill: {
        dot: [
          'bg-bg-soft-200 data-[active=true]:bg-primary-base',
          'data-[active=true]:w-6',
        ],
      },
    },
  },
  defaultVariants: {
    size: 'medium',
    variant: 'default',
  },
});

type PaginationDotsContextType = VariantProps<typeof paginationDotsVariants> & {
  activeIndex: number;
  onDotClick?: (index: number) => void;
};

const PaginationDotsContext = React.createContext<PaginationDotsContextType>({
  size: 'medium',
  variant: 'default',
  activeIndex: 0,
});

export const usePaginationDotsContext = () =>
  React.useContext(PaginationDotsContext);

type PaginationDotsRootProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof paginationDotsVariants> & {
    /** Currently active dot index (0-based) */
    activeIndex: number;
    /** Total number of dots */
    count: number;
    /** Callback when a dot is clicked */
    onDotClick?: (index: number) => void;
  };

const PaginationDotsRoot = React.forwardRef<
  HTMLDivElement,
  PaginationDotsRootProps
>(
  (
    {
      className,
      size = 'medium',
      variant = 'default',
      activeIndex,
      count,
      onDotClick,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const { root } = paginationDotsVariants({ size, variant });

    // If no children, render default dots
    const renderDots = () => {
      if (children) return children;

      return Array.from({ length: count }, (_, index) => (
        <PaginationDot key={index} index={index} />
      ));
    };

    return (
      <PaginationDotsContext.Provider
        value={{ size, variant, activeIndex, onDotClick }}
      >
        <nav
          ref={forwardedRef}
          className={root({ class: className })}
          role='tablist'
          aria-label='Pagination'
          {...rest}
        >
          {renderDots()}
        </nav>
      </PaginationDotsContext.Provider>
    );
  },
);
PaginationDotsRoot.displayName = PAGINATION_DOTS_ROOT_NAME;

type PaginationDotProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> & {
  index: number;
};

function PaginationDot({ className, index, ...rest }: PaginationDotProps) {
  const { size, variant, activeIndex, onDotClick } = usePaginationDotsContext();
  const { dot } = paginationDotsVariants({ size, variant });
  const isActive = activeIndex === index;

  const handleClick = () => {
    onDotClick?.(index);
  };

  return (
    <button
      type='button'
      className={dot({ class: className })}
      data-active={isActive}
      role='tab'
      aria-selected={isActive}
      aria-label={`Go to slide ${index + 1}`}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      {...rest}
    />
  );
}
PaginationDot.displayName = PAGINATION_DOT_NAME;

// Simplified component for direct usage
type SimplePaginationDotsProps = Omit<
  PaginationDotsRootProps,
  'children'
>;

function PaginationDots(props: SimplePaginationDotsProps) {
  return <PaginationDotsRoot {...props} />;
}

export {
  PaginationDotsRoot as Root,
  PaginationDot as Dot,
  PaginationDots,
};
