// AlignUI Card v0.1.0 - Card component with variants

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const cardVariants = tv({
  slots: {
    root: 'rounded-xl bg-bg-white-0',
    header: 'flex items-center justify-between',
    title: 'text-label-md text-text-strong-950',
    description: 'text-paragraph-sm text-text-sub-600',
    content: '',
    footer: 'flex items-center',
  },
  variants: {
    variant: {
      default: {
        root: 'border border-stroke-soft-200',
      },
      elevated: {
        root: 'shadow-regular-md',
      },
      ghost: {
        root: 'bg-transparent',
      },
      outlined: {
        root: 'border-2 border-stroke-soft-200',
      },
    },
    size: {
      sm: {
        root: 'p-3',
        header: 'pb-2',
        footer: 'pt-2',
      },
      md: {
        root: 'p-4',
        header: 'pb-3',
        footer: 'pt-3',
      },
      lg: {
        root: 'p-6',
        header: 'pb-4',
        footer: 'pt-4',
      },
    },
    interactive: {
      true: {
        root: 'cursor-pointer transition-all duration-200 ease-out hover:shadow-regular-md hover:border-stroke-sub-300',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

type CardVariantProps = VariantProps<typeof cardVariants>;

interface CardRootProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardVariantProps {}

const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>(
  ({ className, variant, size, interactive, ...rest }, forwardedRef) => {
    const { root } = cardVariants({ variant, size, interactive });

    return (
      <div
        ref={forwardedRef}
        className={cn(root(), className)}
        {...rest}
      />
    );
  },
);
CardRoot.displayName = 'CardRoot';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: CardVariantProps['size'];
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = 'md', ...rest }, forwardedRef) => {
    const { header } = cardVariants({ size });

    return (
      <div
        ref={forwardedRef}
        className={cn(header(), className)}
        {...rest}
      />
    );
  },
);
CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...rest }, forwardedRef) => {
    const { title } = cardVariants();

    return (
      <Component
        ref={forwardedRef}
        className={cn(title(), className)}
        {...rest}
      />
    );
  },
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...rest }, forwardedRef) => {
  const { description } = cardVariants();

  return (
    <p
      ref={forwardedRef}
      className={cn(description(), className)}
      {...rest}
    />
  );
});
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, forwardedRef) => {
  const { content } = cardVariants();

  return (
    <div
      ref={forwardedRef}
      className={cn(content(), className)}
      {...rest}
    />
  );
});
CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: CardVariantProps['size'];
  align?: 'left' | 'center' | 'right' | 'between';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size = 'md', align = 'right', ...rest }, forwardedRef) => {
    const { footer } = cardVariants({ size });

    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={forwardedRef}
        className={cn(footer(), alignClasses[align], className)}
        {...rest}
      />
    );
  },
);
CardFooter.displayName = 'CardFooter';

// Stat Card - For displaying metrics
interface StatCardProps extends Omit<CardRootProps, 'children'> {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

function StatCard({
  title,
  value,
  change,
  icon,
  footer,
  size = 'md',
  ...rest
}: StatCardProps) {
  const trendColors = {
    up: 'text-success-base',
    down: 'text-error-base',
    neutral: 'text-text-sub-600',
  };

  const trendSymbols = {
    up: '+',
    down: '',
    neutral: '',
  };

  return (
    <CardRoot size={size} {...rest}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-paragraph-sm text-text-sub-600">{title}</span>
          <span className="text-title-h4 text-text-strong-950">{value}</span>
          {change && (
            <span className={cn('text-label-sm', trendColors[change.trend])}>
              {trendSymbols[change.trend]}{change.value}%
            </span>
          )}
        </div>
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-lg bg-bg-soft-200 text-text-sub-600">
            {icon}
          </div>
        )}
      </div>
      {footer && <div className="mt-3 pt-3 border-t border-stroke-soft-200">{footer}</div>}
    </CardRoot>
  );
}
StatCard.displayName = 'StatCard';

// Selectable Card
interface SelectableCardProps extends CardRootProps {
  selected?: boolean;
  onSelect?: () => void;
}

const SelectableCard = React.forwardRef<HTMLDivElement, SelectableCardProps>(
  ({ className, selected, onSelect, children, ...rest }, forwardedRef) => {
    return (
      <CardRoot
        ref={forwardedRef}
        interactive
        className={cn(
          'transition-all duration-200',
          selected && 'border-primary-base ring-2 ring-primary-alpha-10',
          className,
        )}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.();
          }
        }}
        tabIndex={0}
        role="button"
        aria-pressed={selected}
        {...rest}
      >
        {children}
      </CardRoot>
    );
  },
);
SelectableCard.displayName = 'SelectableCard';

export {
  CardRoot as Root,
  CardHeader as Header,
  CardTitle as Title,
  CardDescription as Description,
  CardContent as Content,
  CardFooter as Footer,
  StatCard,
  SelectableCard,
  cardVariants,
};
