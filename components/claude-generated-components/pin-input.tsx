// AlignUI PinInput v0.0.0

'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const PIN_INPUT_ROOT_NAME = 'PinInputRoot';
const PIN_INPUT_GROUP_NAME = 'PinInputGroup';
const PIN_INPUT_SLOT_NAME = 'PinInputSlot';
const PIN_INPUT_SEPARATOR_NAME = 'PinInputSeparator';
const PIN_INPUT_LABEL_NAME = 'PinInputLabel';
const PIN_INPUT_DESCRIPTION_NAME = 'PinInputDescription';

export const pinInputVariants = tv({
  slots: {
    root: 'flex h-max flex-col gap-1.5',
    group: 'flex flex-row',
    slot: [
      'relative flex items-center justify-center rounded-12 bg-bg-white-0 text-center text-text-strong-950',
      'ring-1 ring-inset ring-stroke-soft-200',
      'transition duration-200 ease-out',
    ],
    separator: 'flex items-center justify-center text-text-soft-400',
    label: 'text-label-sm text-text-strong-950',
    description: 'text-paragraph-sm text-text-sub-600',
  },
  variants: {
    size: {
      small: {
        group: 'gap-2',
        slot: 'size-12 text-title-h4',
        separator: 'px-1 text-title-h4',
      },
      medium: {
        group: 'gap-3',
        slot: 'size-16 text-title-h3',
        separator: 'px-1.5 text-title-h3',
      },
      large: {
        group: 'gap-3',
        slot: 'size-20 text-title-h2',
        separator: 'px-2 text-title-h2',
      },
    },
    hasError: {
      true: {
        slot: 'ring-error-base',
      },
    },
    disabled: {
      true: {
        slot: [
          'bg-bg-weak-50 text-text-disabled-300',
          'ring-stroke-soft-200',
          'cursor-not-allowed',
        ],
      },
    },
  },
  compoundVariants: [
    {
      hasError: false,
      disabled: false,
      class: {
        slot: [
          // hover
          'hover:ring-stroke-strong-950',
          // focus
          'focus-within:ring-2 focus-within:ring-stroke-strong-950',
        ],
      },
    },
  ],
  defaultVariants: {
    size: 'medium',
    hasError: false,
    disabled: false,
  },
});

type PinInputContextType = VariantProps<typeof pinInputVariants> & {
  id: string;
};

const PinInputContext = React.createContext<PinInputContextType>({
  size: 'medium',
  hasError: false,
  disabled: false,
  id: '',
});

const usePinInputContext = () => {
  const context = React.useContext(PinInputContext);

  if (!context) {
    throw new Error(
      "The 'usePinInputContext' hook must be used within a '<PinInput />'",
    );
  }

  return context;
};

type PinInputRootProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof pinInputVariants>;

const PinInputRoot = React.forwardRef<HTMLDivElement, PinInputRootProps>(
  ({ className, size = 'medium', hasError = false, disabled = false, children, ...rest }, forwardedRef) => {
    const id = React.useId();
    const { root } = pinInputVariants({ size, hasError, disabled });

    return (
      <PinInputContext.Provider value={{ size, hasError, disabled, id }}>
        <div
          ref={forwardedRef}
          role='group'
          className={root({ class: className })}
          {...rest}
        >
          {children}
        </div>
      </PinInputContext.Provider>
    );
  },
);
PinInputRoot.displayName = PIN_INPUT_ROOT_NAME;

type PinInputGroupProps = Omit<React.ComponentPropsWithoutRef<typeof OTPInput>, 'children'> & {
  containerClassName?: string;
  inputClassName?: string;
  children?: React.ReactNode;
};

const PinInputGroup = React.forwardRef<
  React.ComponentRef<typeof OTPInput>,
  PinInputGroupProps
>(
  (
    { containerClassName, inputClassName, maxLength = 4, children, render, ...rest },
    forwardedRef,
  ) => {
    const { id, size, disabled } = usePinInputContext();
    const { group } = pinInputVariants({ size });

    return (
      <OTPInput
        ref={forwardedRef}
        maxLength={maxLength}
        disabled={disabled ?? false}
        id={'pin-input-' + id}
        aria-label='Enter your pin'
        aria-labelledby={'pin-input-label-' + id}
        aria-describedby={'pin-input-description-' + id}
        containerClassName={group({ class: containerClassName })}
        className={cn('w-full disabled:cursor-not-allowed', inputClassName)}
        render={render ?? (() => <>{children}</>)}
        {...rest}
      />
    );
  },
);
PinInputGroup.displayName = PIN_INPUT_GROUP_NAME;

type PinInputSlotProps = React.HTMLAttributes<HTMLDivElement> & {
  index: number;
};

const PinInputSlot = React.forwardRef<HTMLDivElement, PinInputSlotProps>(
  ({ index, className, ...rest }, forwardedRef) => {
    const { size, hasError, disabled } = usePinInputContext();
    const { slots, isFocused } = React.useContext(OTPInputContext);
    const currentSlot = slots[index];
    const { slot } = pinInputVariants({ size, hasError, disabled });

    const isActive = isFocused && currentSlot?.isActive;
    const hasChar = Boolean(currentSlot?.char);

    return (
      <div
        ref={forwardedRef}
        aria-label={`Enter digit ${index + 1} of ${slots.length}`}
        className={cn(
          slot({ class: className }),
          isActive && 'ring-2 ring-primary-base',
          hasChar && 'ring-2 ring-stroke-strong-950',
        )}
        {...rest}
      >
        {currentSlot?.char ? (
          currentSlot.char
        ) : currentSlot?.hasFakeCaret ? (
          <FakeCaret />
        ) : (
          <span className='text-text-soft-400'>0</span>
        )}
      </div>
    );
  },
);
PinInputSlot.displayName = PIN_INPUT_SLOT_NAME;

function FakeCaret() {
  return (
    <div className='pointer-events-none h-[1em] w-0.5 animate-caret-blink bg-primary-base' />
  );
}

type PinInputSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

function PinInputSeparator({ className, children, ...rest }: PinInputSeparatorProps) {
  const { size } = usePinInputContext();
  const { separator } = pinInputVariants({ size });

  return (
    <div
      role='separator'
      className={separator({ class: className })}
      {...rest}
    >
      {children ?? '-'}
    </div>
  );
}
PinInputSeparator.displayName = PIN_INPUT_SEPARATOR_NAME;

type PinInputLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function PinInputLabel({ className, ...rest }: PinInputLabelProps) {
  const { id } = usePinInputContext();
  const { label } = pinInputVariants();

  return (
    <label
      htmlFor={'pin-input-' + id}
      id={'pin-input-label-' + id}
      className={label({ class: className })}
      {...rest}
    />
  );
}
PinInputLabel.displayName = PIN_INPUT_LABEL_NAME;

type PinInputDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

function PinInputDescription({ className, ...rest }: PinInputDescriptionProps) {
  const { id } = usePinInputContext();
  const { description } = pinInputVariants();

  return (
    <p
      id={'pin-input-description-' + id}
      role='description'
      className={description({ class: className })}
      {...rest}
    />
  );
}
PinInputDescription.displayName = PIN_INPUT_DESCRIPTION_NAME;

export {
  PinInputRoot as Root,
  PinInputGroup as Group,
  PinInputSlot as Slot,
  PinInputSeparator as Separator,
  PinInputLabel as Label,
  PinInputDescription as Description,
  usePinInputContext,
};
