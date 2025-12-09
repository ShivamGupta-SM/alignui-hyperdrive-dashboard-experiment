// AlignUI Callout v0.1.0 - Callout component for highlighting information

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';
import {
  Info,
  WarningCircle,
  CheckCircle,
  Warning,
  Lightbulb,
  X,
} from '@phosphor-icons/react';

type CalloutVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'tip';

const calloutVariants = tv({
  slots: {
    root: 'relative flex gap-3 rounded-xl p-4',
    icon: 'shrink-0',
    content: 'flex flex-1 flex-col gap-1',
    title: 'text-label-sm',
    description: 'text-paragraph-sm',
    close: 'absolute right-3 top-3 shrink-0 cursor-pointer opacity-50 transition-opacity hover:opacity-100',
  },
  variants: {
    variant: {
      info: {
        root: 'bg-information-lighter',
        icon: 'text-information-base',
        title: 'text-information-dark',
        description: 'text-information-dark/80',
      },
      success: {
        root: 'bg-success-lighter',
        icon: 'text-success-base',
        title: 'text-success-dark',
        description: 'text-success-dark/80',
      },
      warning: {
        root: 'bg-warning-lighter',
        icon: 'text-warning-base',
        title: 'text-warning-dark',
        description: 'text-warning-dark/80',
      },
      error: {
        root: 'bg-error-lighter',
        icon: 'text-error-base',
        title: 'text-error-dark',
        description: 'text-error-dark/80',
      },
      neutral: {
        root: 'bg-bg-soft-200',
        icon: 'text-text-sub-600',
        title: 'text-text-strong-950',
        description: 'text-text-sub-600',
      },
      tip: {
        root: 'bg-feature-lighter',
        icon: 'text-feature-base',
        title: 'text-feature-dark',
        description: 'text-feature-dark/80',
      },
    },
    size: {
      sm: {
        root: 'p-3 gap-2',
        icon: 'size-4',
        title: 'text-label-xs',
        description: 'text-paragraph-xs',
        close: 'right-2 top-2 size-4',
      },
      md: {
        root: 'p-4 gap-3',
        icon: 'size-5',
        title: 'text-label-sm',
        description: 'text-paragraph-sm',
        close: 'right-3 top-3 size-5',
      },
      lg: {
        root: 'p-5 gap-4',
        icon: 'size-6',
        title: 'text-label-md',
        description: 'text-paragraph-md',
        close: 'right-4 top-4 size-6',
      },
    },
  },
  defaultVariants: {
    variant: 'info',
    size: 'md',
  },
});

type CalloutVariantProps = VariantProps<typeof calloutVariants>;

const defaultIcons: Record<CalloutVariant, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
  neutral: Info,
  tip: Lightbulb,
};

interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CalloutVariantProps {
  title?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

function Callout({
  title,
  children,
  variant = 'info',
  size = 'md',
  icon,
  showIcon = true,
  dismissible = false,
  onDismiss,
  className,
  ...rest
}: CalloutProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);

  const {
    root,
    icon: iconClass,
    content,
    title: titleClass,
    description,
    close,
  } = calloutVariants({ variant, size });

  const handleDismiss = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 200);
  }, [onDismiss]);

  if (!isVisible) return null;

  const IconComponent = defaultIcons[variant || 'info'];

  return (
    <div
      className={cn(
        root(),
        'transition-all duration-200 ease-out',
        isExiting && 'opacity-0 scale-95',
        dismissible && 'pr-10',
        className,
      )}
      role="alert"
      {...rest}
    >
      {showIcon && (
        <div className={iconClass()}>
          {icon || <IconComponent className="size-full" weight="duotone" />}
        </div>
      )}
      <div className={content()}>
        {title && <span className={titleClass()}>{title}</span>}
        {children && <div className={description()}>{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={close()}
          aria-label="Dismiss"
        >
          <X className="size-full" weight="bold" />
        </button>
      )}
    </div>
  );
}
Callout.displayName = 'Callout';

// Callout with action buttons
interface CalloutWithActionsProps extends CalloutProps {
  actions?: React.ReactNode;
}

function CalloutWithActions({
  actions,
  children,
  ...rest
}: CalloutWithActionsProps) {
  return (
    <Callout {...rest}>
      {children}
      {actions && (
        <div className="mt-3 flex items-center gap-2">
          {actions}
        </div>
      )}
    </Callout>
  );
}
CalloutWithActions.displayName = 'CalloutWithActions';

// Inline callout (simpler, more compact)
interface InlineCalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<CalloutVariantProps, 'variant'> {
  icon?: React.ReactNode;
}

function InlineCallout({
  variant = 'info',
  icon,
  children,
  className,
  ...rest
}: InlineCalloutProps) {
  const { root, icon: iconClass, description } = calloutVariants({
    variant,
    size: 'sm',
  });

  const IconComponent = defaultIcons[variant || 'info'];

  return (
    <div
      className={cn(root(), 'inline-flex items-center gap-2 py-2 px-3', className)}
      role="status"
      {...rest}
    >
      <span className={iconClass()}>
        {icon || <IconComponent className="size-4" weight="duotone" />}
      </span>
      <span className={description()}>{children}</span>
    </div>
  );
}
InlineCallout.displayName = 'InlineCallout';

// Quote callout with left border
interface QuoteCalloutProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
  author?: string;
}

function QuoteCallout({
  children,
  author,
  className,
  ...rest
}: QuoteCalloutProps) {
  return (
    <blockquote
      className={cn(
        'border-l-4 border-primary-base bg-bg-soft-200 py-3 pl-4 pr-4 rounded-r-lg',
        className,
      )}
      {...rest}
    >
      <p className="text-paragraph-sm text-text-strong-950 italic">{children}</p>
      {author && (
        <footer className="mt-2 text-label-xs text-text-sub-600">
          — {author}
        </footer>
      )}
    </blockquote>
  );
}
QuoteCallout.displayName = 'QuoteCallout';

export {
  Callout,
  CalloutWithActions,
  InlineCallout,
  QuoteCallout,
  calloutVariants,
};
