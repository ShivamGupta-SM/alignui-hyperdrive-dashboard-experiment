// AlignUI Stepper v0.0.0
// Multi-step progress indicator for wizards and forms

'use client';

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';
import { Check } from '@phosphor-icons/react/dist/ssr';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';

const STEPPER_ROOT_NAME = 'StepperRoot';
const STEPPER_ITEM_NAME = 'StepperItem';
const STEPPER_TRIGGER_NAME = 'StepperTrigger';
const STEPPER_INDICATOR_NAME = 'StepperIndicator';
const STEPPER_TITLE_NAME = 'StepperTitle';
const STEPPER_DESCRIPTION_NAME = 'StepperDescription';
const STEPPER_SEPARATOR_NAME = 'StepperSeparator';
const STEPPER_CONTENT_NAME = 'StepperContent';

export const stepperVariants = tv({
  slots: {
    root: 'flex w-full',
    item: 'group relative flex',
    trigger: [
      // base
      'flex items-center gap-3 outline-none',
      // focus
      'focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 rounded',
    ],
    indicator: [
      // base
      'relative z-10 flex shrink-0 items-center justify-center rounded-full',
      'font-medium transition-colors duration-200',
    ],
    title: 'font-medium text-text-strong-950',
    description: 'text-text-sub-600',
    separator: 'bg-stroke-soft-200 transition-colors duration-200',
    content: '',
  },
  variants: {
    //#region orientation
    orientation: {
      horizontal: {
        root: 'flex-row items-start',
        item: 'flex-1 flex-col items-center',
        trigger: 'flex-col',
        separator: 'absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-5 h-0.5',
      },
      vertical: {
        root: 'flex-col',
        item: 'flex-row gap-4',
        trigger: 'flex-row',
        separator: 'ml-5 mt-2 h-8 w-0.5',
      },
    },
    //#endregion

    //#region size
    size: {
      small: {
        indicator: 'size-8 text-label-sm',
        title: 'text-label-sm',
        description: 'text-paragraph-xs',
      },
      medium: {
        indicator: 'size-10 text-label-md',
        title: 'text-label-md',
        description: 'text-paragraph-sm',
      },
      large: {
        indicator: 'size-12 text-label-lg',
        title: 'text-label-lg',
        description: 'text-paragraph-sm',
      },
    },
    //#endregion

    //#region status
    status: {
      inactive: {
        indicator: 'bg-bg-soft-200 text-text-sub-600',
      },
      active: {
        indicator: 'bg-primary-base text-static-white ring-4 ring-primary-lighter',
      },
      completed: {
        indicator: 'bg-primary-base text-static-white',
      },
      error: {
        indicator: 'bg-error-base text-static-white ring-4 ring-error-lighter',
      },
    },
    //#endregion
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'small',
      class: {
        separator: 'left-[calc(50%+16px)] right-[calc(-50%+16px)] top-4',
      },
    },
    {
      orientation: 'horizontal',
      size: 'large',
      class: {
        separator: 'left-[calc(50%+24px)] right-[calc(-50%+24px)] top-6',
      },
    },
    {
      orientation: 'vertical',
      size: 'small',
      class: {
        separator: 'ml-4',
      },
    },
    {
      orientation: 'vertical',
      size: 'large',
      class: {
        separator: 'ml-6',
      },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    size: 'medium',
    status: 'inactive',
  },
});

type StepperContextType = {
  orientation: 'horizontal' | 'vertical';
  size: 'small' | 'medium' | 'large';
  activeStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  clickable: boolean;
};

const StepperContext = React.createContext<StepperContextType>({
  orientation: 'horizontal',
  size: 'medium',
  activeStep: 0,
  totalSteps: 0,
  clickable: false,
});

export const useStepperContext = () => React.useContext(StepperContext);

type StepperRootProps = React.HTMLAttributes<HTMLDivElement> &
  Pick<VariantProps<typeof stepperVariants>, 'orientation' | 'size'> & {
    /** Current active step (0-indexed) */
    activeStep: number;
    /** Callback when step is clicked (if clickable) */
    onStepClick?: (step: number) => void;
    /** Whether steps are clickable */
    clickable?: boolean;
  };

const StepperRoot = React.forwardRef<HTMLDivElement, StepperRootProps>(
  (
    {
      className,
      orientation = 'horizontal',
      size = 'medium',
      activeStep,
      onStepClick,
      clickable = false,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const { root } = stepperVariants({ orientation, size });
    const totalSteps = React.Children.count(children);

    return (
      <StepperContext.Provider
        value={{
          orientation,
          size,
          activeStep,
          totalSteps,
          onStepClick,
          clickable,
        }}
      >
        <div
          ref={forwardedRef}
          className={root({ class: className })}
          role='navigation'
          aria-label='Progress steps'
          {...rest}
        >
          {children}
        </div>
      </StepperContext.Provider>
    );
  },
);
StepperRoot.displayName = STEPPER_ROOT_NAME;

type StepperItemProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Step index (0-indexed) */
  step: number;
  /** Whether this step has an error */
  hasError?: boolean;
};

function StepperItem({
  className,
  step,
  hasError = false,
  children,
  ...rest
}: StepperItemProps) {
  const uniqueId = React.useId();
  const { orientation, size, activeStep, totalSteps } = useStepperContext();
  const { item } = stepperVariants({ orientation, size });

  const isActive = step === activeStep;
  const isCompleted = step < activeStep;
  const isLast = step === totalSteps - 1;

  const status = hasError
    ? 'error'
    : isCompleted
      ? 'completed'
      : isActive
        ? 'active'
        : 'inactive';

  const sharedProps = { step, status, isLast };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [STEPPER_TRIGGER_NAME, STEPPER_INDICATOR_NAME, STEPPER_TITLE_NAME, STEPPER_SEPARATOR_NAME],
    uniqueId,
  );

  return (
    <div
      className={item({ class: className })}
      data-status={status}
      data-step={step}
      {...rest}
    >
      {extendedChildren}
    </div>
  );
}
StepperItem.displayName = STEPPER_ITEM_NAME;

type StepperTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  step?: number;
  status?: 'inactive' | 'active' | 'completed' | 'error';
};

const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ className, step = 0, status = 'inactive', children, ...rest }, forwardedRef) => {
    const { orientation, size, onStepClick, clickable } = useStepperContext();
    const { trigger } = stepperVariants({ orientation, size });

    const handleClick = () => {
      if (clickable && onStepClick) {
        onStepClick(step);
      }
    };

    const isClickable = clickable && onStepClick;

    return (
      <button
        ref={forwardedRef}
        type='button'
        className={trigger({ class: className })}
        onClick={handleClick}
        disabled={!isClickable}
        aria-current={status === 'active' ? 'step' : undefined}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
StepperTrigger.displayName = STEPPER_TRIGGER_NAME;

type StepperIndicatorProps = React.HTMLAttributes<HTMLDivElement> & {
  step?: number;
  status?: 'inactive' | 'active' | 'completed' | 'error';
  /** Custom icon for completed state */
  completedIcon?: React.ReactNode;
  /** Custom icon for error state */
  errorIcon?: React.ReactNode;
};

function StepperIndicator({
  className,
  step = 0,
  status = 'inactive',
  completedIcon,
  errorIcon,
  children,
  ...rest
}: StepperIndicatorProps) {
  const { size } = useStepperContext();
  const { indicator } = stepperVariants({
    size,
    status: status as 'inactive' | 'active' | 'completed' | 'error',
  });

  const renderContent = () => {
    if (status === 'completed') {
      return completedIcon || <Check weight="bold" className='size-5' />;
    }
    if (status === 'error' && errorIcon) {
      return errorIcon;
    }
    if (children) return children;
    return step + 1;
  };

  return (
    <div className={indicator({ class: className })} {...rest}>
      {renderContent()}
    </div>
  );
}
StepperIndicator.displayName = STEPPER_INDICATOR_NAME;

type StepperTitleProps = React.HTMLAttributes<HTMLSpanElement>;

function StepperTitle({ className, ...rest }: StepperTitleProps) {
  const { size } = useStepperContext();
  const { title } = stepperVariants({ size });

  return <span className={title({ class: className })} {...rest} />;
}
StepperTitle.displayName = STEPPER_TITLE_NAME;

type StepperDescriptionProps = React.HTMLAttributes<HTMLSpanElement>;

function StepperDescription({ className, ...rest }: StepperDescriptionProps) {
  const { size } = useStepperContext();
  const { description } = stepperVariants({ size });

  return <span className={description({ class: className })} {...rest} />;
}
StepperDescription.displayName = STEPPER_DESCRIPTION_NAME;

type StepperSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  isLast?: boolean;
  status?: string;
};

function StepperSeparator({
  className,
  isLast,
  status,
  ...rest
}: StepperSeparatorProps) {
  const { orientation, size } = useStepperContext();
  const { separator } = stepperVariants({ orientation, size });

  if (isLast) return null;

  const isCompleted = status === 'completed';

  return (
    <div
      className={cn(separator({ class: className }), {
        'bg-primary-base': isCompleted,
      })}
      aria-hidden='true'
      {...rest}
    />
  );
}
StepperSeparator.displayName = STEPPER_SEPARATOR_NAME;

type StepperContentProps = React.HTMLAttributes<HTMLDivElement>;

function StepperContent({ className, ...rest }: StepperContentProps) {
  const { orientation, size } = useStepperContext();
  const { content } = stepperVariants({ orientation, size });

  return (
    <div className={cn(content(), 'mt-2 text-center', className)} {...rest} />
  );
}
StepperContent.displayName = STEPPER_CONTENT_NAME;

export {
  StepperRoot as Root,
  StepperItem as Item,
  StepperTrigger as Trigger,
  StepperIndicator as Indicator,
  StepperTitle as Title,
  StepperDescription as Description,
  StepperSeparator as Separator,
  StepperContent as Content,
};
