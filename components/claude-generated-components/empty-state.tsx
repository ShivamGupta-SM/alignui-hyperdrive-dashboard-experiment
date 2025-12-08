// AlignUI EmptyState v0.0.0

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';
import type { PolymorphicComponentProps } from '@/utils/polymorphic';

const EMPTY_STATE_ROOT_NAME = 'EmptyStateRoot';
const EMPTY_STATE_HEADER_NAME = 'EmptyStateHeader';
const EMPTY_STATE_ICON_NAME = 'EmptyStateIcon';
const EMPTY_STATE_CONTENT_NAME = 'EmptyStateContent';
const EMPTY_STATE_TITLE_NAME = 'EmptyStateTitle';
const EMPTY_STATE_DESCRIPTION_NAME = 'EmptyStateDescription';
const EMPTY_STATE_FOOTER_NAME = 'EmptyStateFooter';

export const emptyStateVariants = tv({
  slots: {
    root: 'mx-auto flex w-full max-w-lg flex-col items-center justify-center',
    header: 'relative mb-4',
    icon: [
      'relative z-10 flex shrink-0 items-center justify-center rounded-full',
      'bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200',
    ],
    pattern: [
      'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
      'pointer-events-none select-none',
    ],
    content: 'z-10 mb-6 flex w-full max-w-sm flex-col items-center justify-center gap-1',
    title: 'text-center text-text-strong-950',
    description: 'text-center text-text-sub-600',
    footer: 'z-10 flex gap-3',
  },
  variants: {
    size: {
      small: {
        header: 'mb-3',
        icon: 'size-10',
        content: 'mb-4 gap-1',
        title: 'text-label-md',
        description: 'text-paragraph-sm',
      },
      medium: {
        header: 'mb-4',
        icon: 'size-12',
        content: 'mb-6 gap-1.5',
        title: 'text-label-lg',
        description: 'text-paragraph-sm',
      },
      large: {
        header: 'mb-5',
        icon: 'size-14',
        content: 'mb-8 gap-2',
        title: 'text-title-h5',
        description: 'text-paragraph-md',
      },
    },
  },
  defaultVariants: {
    size: 'large',
  },
});

type EmptyStateContextType = VariantProps<typeof emptyStateVariants>;

const EmptyStateContext = React.createContext<EmptyStateContextType>({
  size: 'large',
});

const useEmptyStateContext = () => React.useContext(EmptyStateContext);

type EmptyStateRootProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof emptyStateVariants>;

const EmptyStateRoot = React.forwardRef<HTMLDivElement, EmptyStateRootProps>(
  ({ className, size = 'large', children, ...rest }, forwardedRef) => {
    const { root } = emptyStateVariants({ size });

    return (
      <EmptyStateContext.Provider value={{ size }}>
        <div ref={forwardedRef} className={root({ class: className })} {...rest}>
          {children}
        </div>
      </EmptyStateContext.Provider>
    );
  },
);
EmptyStateRoot.displayName = EMPTY_STATE_ROOT_NAME;

type EmptyStateHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  showPattern?: boolean;
  patternSize?: 'small' | 'medium' | 'large';
};

const EmptyStateHeader = React.forwardRef<HTMLDivElement, EmptyStateHeaderProps>(
  (
    { className, showPattern = true, patternSize = 'medium', children, ...rest },
    forwardedRef,
  ) => {
    const { size } = useEmptyStateContext();
    const { header, pattern } = emptyStateVariants({ size });
    const uniqueId = React.useId();
    const gradientId = `empty-state-pattern-${uniqueId}`;

    const patternSizes = {
      small: 120,
      medium: 160,
      large: 200,
    };

    const patternDimension = patternSizes[patternSize];

    return (
      <header ref={forwardedRef} className={header({ class: className })} {...rest}>
        {showPattern && (
          <svg
            className={pattern()}
            width={patternDimension}
            height={patternDimension}
            viewBox={`0 0 ${patternDimension} ${patternDimension}`}
            fill='none'
            aria-hidden='true'
          >
            <defs>
              <radialGradient
                id={gradientId}
                cx='50%'
                cy='50%'
                r='50%'
              >
                <stop offset='0%' stopColor='currentColor' stopOpacity='0.08' />
                <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
              </radialGradient>
            </defs>
            <circle
              cx={patternDimension / 2}
              cy={patternDimension / 2}
              r={patternDimension / 2}
              fill={`url(#${gradientId})`}
              className='text-text-soft-400'
            />
            {/* Concentric circles */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
              <circle
                key={i}
                cx={patternDimension / 2}
                cy={patternDimension / 2}
                r={(patternDimension / 2) * scale}
                fill='none'
                stroke='currentColor'
                strokeOpacity={0.08 - i * 0.01}
                className='text-stroke-soft-200'
              />
            ))}
          </svg>
        )}
        {children}
      </header>
    );
  },
);
EmptyStateHeader.displayName = EMPTY_STATE_HEADER_NAME;

type EmptyStateIconProps<T extends React.ElementType> = PolymorphicComponentProps<
  T,
  VariantProps<typeof emptyStateVariants> & {
    color?: 'gray' | 'primary' | 'error' | 'warning' | 'success';
  }
>;

function EmptyStateIcon<T extends React.ElementType = 'div'>({
  className,
  as,
  color = 'gray',
  children,
  ...rest
}: EmptyStateIconProps<T>) {
  const { size } = useEmptyStateContext();
  const { icon } = emptyStateVariants({ size });
  const Component = as || 'div';

  const colorClasses = {
    gray: 'bg-bg-weak-50 text-text-sub-600',
    primary: 'bg-primary-lighter text-primary-base',
    error: 'bg-error-lighter text-error-base',
    warning: 'bg-warning-lighter text-warning-base',
    success: 'bg-success-lighter text-success-base',
  };

  const iconSizes = {
    small: 'size-5',
    medium: 'size-6',
    large: 'size-7',
  };

  return (
    <Component
      className={cn(icon({ class: className }), colorClasses[color])}
      {...rest}
    >
      <div className={iconSizes[size || 'large']}>{children}</div>
    </Component>
  );
}
EmptyStateIcon.displayName = EMPTY_STATE_ICON_NAME;

type EmptyStateContentProps = React.HTMLAttributes<HTMLDivElement>;

const EmptyStateContent = React.forwardRef<HTMLDivElement, EmptyStateContentProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { size } = useEmptyStateContext();
    const { content } = emptyStateVariants({ size });

    return (
      <div ref={forwardedRef} className={content({ class: className })} {...rest} />
    );
  },
);
EmptyStateContent.displayName = EMPTY_STATE_CONTENT_NAME;

type EmptyStateTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const EmptyStateTitle = React.forwardRef<HTMLHeadingElement, EmptyStateTitleProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { size } = useEmptyStateContext();
    const { title } = emptyStateVariants({ size });

    return (
      <h2 ref={forwardedRef} className={title({ class: className })} {...rest} />
    );
  },
);
EmptyStateTitle.displayName = EMPTY_STATE_TITLE_NAME;

type EmptyStateDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  EmptyStateDescriptionProps
>(({ className, ...rest }, forwardedRef) => {
  const { size } = useEmptyStateContext();
  const { description } = emptyStateVariants({ size });

  return (
    <p ref={forwardedRef} className={description({ class: className })} {...rest} />
  );
});
EmptyStateDescription.displayName = EMPTY_STATE_DESCRIPTION_NAME;

type EmptyStateFooterProps = React.HTMLAttributes<HTMLDivElement>;

const EmptyStateFooter = React.forwardRef<HTMLDivElement, EmptyStateFooterProps>(
  ({ className, ...rest }, forwardedRef) => {
    const { footer } = emptyStateVariants();

    return (
      <footer ref={forwardedRef} className={footer({ class: className })} {...rest} />
    );
  },
);
EmptyStateFooter.displayName = EMPTY_STATE_FOOTER_NAME;

export {
  EmptyStateRoot as Root,
  EmptyStateHeader as Header,
  EmptyStateIcon as Icon,
  EmptyStateContent as Content,
  EmptyStateTitle as Title,
  EmptyStateDescription as Description,
  EmptyStateFooter as Footer,
};
