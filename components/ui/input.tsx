// AlignUI Input v0.2.0 - Enhanced with password toggle, search, and number inputs
// Improvements: Better accessibility (aria-invalid, aria-describedby), JSDoc documentation, exported types

import * as React from 'react';
import { tv, type VariantProps } from '@/utils/tv';
import { recursiveCloneChildren } from '@/utils/recursive-clone-children';
import type { PolymorphicComponentProps } from '@/utils/polymorphic';
import { Slot } from '@radix-ui/react-slot';
import {
  Eye,
  EyeSlash,
  MagnifyingGlass,
  Plus,
  Minus,
  X,
} from '@phosphor-icons/react';

const INPUT_ROOT_NAME = 'InputRoot';
const INPUT_WRAPPER_NAME = 'InputWrapper';
const INPUT_EL_NAME = 'InputEl';
const INPUT_ICON_NAME = 'InputIcon';
const INPUT_AFFIX_NAME = 'InputAffixButton';
const INPUT_INLINE_AFFIX_NAME = 'InputInlineAffixButton';

export const inputVariants = tv({
  slots: {
    root: [
      // base
      'group relative flex w-full overflow-hidden bg-bg-white-0 text-text-strong-950 shadow-regular-xs',
      'transition duration-200 ease-out',
      'divide-x divide-stroke-soft-200',
      // border
      'border border-stroke-soft-200',
      // hover
      'hover:shadow-none',
      // focus
      'has-[input:focus]:shadow-button-important-focus has-[input:focus]:border-stroke-strong-950',
      // disabled
      'has-[input:disabled]:shadow-none has-[input:disabled]:border-transparent',
    ],
    wrapper: [
      // base
      'group/input-wrapper flex w-full cursor-text items-center bg-bg-white-0',
      'transition duration-200 ease-out',
      // hover
      'hover:[&:not(&:has(input:focus))]:bg-bg-weak-50',
      // disabled
      'has-[input:disabled]:pointer-events-none has-[input:disabled]:bg-bg-weak-50',
    ],
    input: [
      // base
      // Use text-base (16px) to prevent iOS zoom on focus
      'w-full bg-transparent bg-none text-base sm:text-paragraph-sm text-text-strong-950 outline-none',
      'transition duration-200 ease-out',
      // placeholder
      'placeholder:select-none placeholder:text-text-soft-400 placeholder:transition placeholder:duration-200 placeholder:ease-out',
      // hover placeholder
      'group-hover/input-wrapper:placeholder:text-text-sub-600',
      // focus
      'focus:outline-none',
      // focus placeholder
      'group-has-[input:focus]:placeholder:text-text-sub-600',
      // disabled
      'disabled:text-text-disabled-300 disabled:placeholder:text-text-disabled-300',
    ],
    icon: [
      // base
      'flex size-5 shrink-0 select-none items-center justify-center',
      'transition duration-200 ease-out',
      // placeholder state
      'group-has-placeholder-shown:text-text-soft-400',
      // filled state
      'text-text-sub-600',
      // hover
      'group-has-placeholder-shown:group-hover/input-wrapper:text-text-sub-600',
      // focus
      'group-has-placeholder-shown:group-has-[input:focus]/input-wrapper:text-text-sub-600',
      // disabled
      'group-has-[input:disabled]/input-wrapper:text-text-disabled-300',
    ],
    affix: [
      // base
      'shrink-0 bg-bg-white-0 text-paragraph-sm text-text-sub-600',
      'flex items-center justify-center truncate',
      'transition duration-200 ease-out',
      // placeholder state
      'group-has-placeholder-shown:text-text-soft-400',
      // focus state
      'group-has-placeholder-shown:group-has-[input:focus]:text-text-sub-600',
    ],
    inlineAffix: [
      // base
      'text-paragraph-sm text-text-sub-600',
      // placeholder state
      'group-has-placeholder-shown:text-text-soft-400',
      // focus state
      'group-has-placeholder-shown:group-has-[input:focus]:text-text-sub-600',
    ],
  },
  variants: {
    size: {
      medium: {
        root: 'rounded-10',
        wrapper: 'gap-2 px-3',
        input: 'h-10',
      },
      small: {
        root: 'rounded-lg',
        wrapper: 'gap-2 px-2.5',
        input: 'h-9',
      },
      xsmall: {
        root: 'rounded-lg',
        wrapper: 'gap-1.5 px-2',
        input: 'h-8',
      },
    },
    hasError: {
      true: {
        root: [
          // base
          'before:ring-error-base',
          // base
          'hover:before:ring-error-base hover:[&:not(&:has(input:focus)):has(>:only-child)]:before:ring-error-base',
          // focus
          'has-[input:focus]:shadow-button-error-focus has-[input:focus]:before:ring-error-base',
        ],
      },
      false: {
        root: [
          // hover
          'hover:[&:not(:has(input:focus)):has(>:only-child)]:before:ring-transparent',
        ],
      },
    },
  },
  compoundVariants: [
    //#region affix
    {
      size: 'medium',
      class: {
        affix: 'px-3',
      },
    },
    {
      size: ['small', 'xsmall'],
      class: {
        affix: 'px-2.5',
      },
    },
    //#endregion
  ],
  defaultVariants: {
    size: 'medium',
  },
});

/** Shared props for input variants */
export type InputSharedProps = VariantProps<typeof inputVariants>;

/** Props for the InputRoot component */
export interface InputRootProps extends React.HTMLAttributes<HTMLDivElement>, InputSharedProps {
  /** Use Slot pattern for composition */
  asChild?: boolean;
  /** ID for error message element (for aria-describedby) */
  errorId?: string;
}

/**
 * InputRoot - Container component for compound input
 * @example
 * <Input.Root size="medium" hasError={!!error}>
 *   <Input.Wrapper>
 *     <Input.El placeholder="Enter text" aria-invalid={!!error} />
 *   </Input.Wrapper>
 * </Input.Root>
 */
function InputRoot({
  className,
  children,
  size,
  hasError,
  asChild,
  errorId,
  ...rest
}: InputRootProps) {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : 'div';

  const { root } = inputVariants({
    size,
    hasError,
  });

  const sharedProps: InputSharedProps = {
    size,
    hasError,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [
      INPUT_WRAPPER_NAME,
      INPUT_EL_NAME,
      INPUT_ICON_NAME,
      INPUT_AFFIX_NAME,
      INPUT_INLINE_AFFIX_NAME,
    ],
    uniqueId,
    asChild,
  );

  return (
    <Component className={root({ class: className })} {...rest}>
      {extendedChildren}
    </Component>
  );
}
InputRoot.displayName = INPUT_ROOT_NAME;

function InputWrapper({
  className,
  children,
  size,
  hasError,
  asChild,
  ...rest
}: React.HTMLAttributes<HTMLLabelElement> &
  InputSharedProps & {
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : 'label';

  const { wrapper } = inputVariants({
    size,
    hasError,
  });

  return (
    <Component className={wrapper({ class: className })} {...rest}>
      {children}
    </Component>
  );
}
InputWrapper.displayName = INPUT_WRAPPER_NAME;

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> &
    InputSharedProps & {
      asChild?: boolean;
    }
>(
  (
    { className, type = 'text', size, hasError, asChild, ...rest },
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : 'input';

    const { input } = inputVariants({
      size,
      hasError,
    });

    return (
      <Component
        type={type}
        className={input({ class: className })}
        ref={forwardedRef}
        {...rest}
      />
    );
  },
);
Input.displayName = INPUT_EL_NAME;

function InputIcon<T extends React.ElementType = 'div'>({
  size,
  hasError,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, InputSharedProps>) {
  const Component = as || 'div';
  const { icon } = inputVariants({ size, hasError });

  return <Component className={icon({ class: className })} {...rest} />;
}
InputIcon.displayName = INPUT_ICON_NAME;

function InputAffix({
  className,
  children,
  size,
  hasError,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & InputSharedProps) {
  const { affix } = inputVariants({
    size,
    hasError,
  });

  return (
    <div className={affix({ class: className })} {...rest}>
      {children}
    </div>
  );
}
InputAffix.displayName = INPUT_AFFIX_NAME;

function InputInlineAffix({
  className,
  children,
  size,
  hasError,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & InputSharedProps) {
  const { inlineAffix } = inputVariants({
    size,
    hasError,
  });

  return (
    <span className={inlineAffix({ class: className })} {...rest}>
      {children}
    </span>
  );
}
InputInlineAffix.displayName = INPUT_INLINE_AFFIX_NAME;

// ============================================
// Password Input with visibility toggle
// ============================================

/** Props for PasswordInput component */
export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
>, InputSharedProps {
  /** Show/hide password toggle button */
  showToggle?: boolean;
  /** ID of error message element for accessibility */
  errorId?: string;
}

/**
 * PasswordInput - Input with built-in password visibility toggle
 * @example
 * <PasswordInput
 *   hasError={!!error}
 *   errorId="password-error"
 *   aria-invalid={!!error}
 * />
 * {error && <span id="password-error">{error}</span>}
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, size, hasError, showToggle = true, errorId, ...rest }, forwardedRef) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const inputId = rest.id || `password-${generatedId}`;

    const { root, wrapper, input, icon } = inputVariants({
      size,
      hasError,
    });

    const toggleVisibility = () => setShowPassword((prev) => !prev);

    return (
      <div className={root({ class: className })}>
        <label className={wrapper()}>
          <input
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={input()}
            ref={forwardedRef}
            aria-invalid={hasError || undefined}
            aria-describedby={errorId}
            {...rest}
          />
          {showToggle && (
            <button
              type="button"
              onClick={toggleVisibility}
              className={icon({ class: 'cursor-pointer hover:text-text-strong-950' })}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-controls={inputId}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlash className="size-5" aria-hidden="true" />
              ) : (
                <Eye className="size-5" aria-hidden="true" />
              )}
            </button>
          )}
        </label>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

// ============================================
// Search Input with search icon
// ============================================

/** Props for SearchInput component */
export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, InputSharedProps {
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Show clear button when input has value */
  showClearButton?: boolean;
}

/**
 * SearchInput - Input with search icon and optional clear button
 * @example
 * <SearchInput
 *   value={search}
 *   onChange={(e) => setSearch(e.target.value)}
 *   onClear={() => setSearch('')}
 *   placeholder="Search..."
 * />
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, size, hasError, onClear, value, showClearButton = true, ...rest }, forwardedRef) => {
    const { root, wrapper, input, icon } = inputVariants({
      size,
      hasError,
    });

    const hasValue = value !== undefined && value !== '';

    return (
      <div className={root({ class: className })}>
        <label className={wrapper()}>
          <div className={icon()} aria-hidden="true">
            <MagnifyingGlass className="size-5" />
          </div>
          <input
            type="search"
            className={input()}
            ref={forwardedRef}
            value={value}
            role="searchbox"
            aria-label={rest['aria-label'] || 'Search'}
            {...rest}
          />
          {showClearButton && hasValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              className={icon({ class: 'cursor-pointer hover:text-text-strong-950' })}
              aria-label="Clear search"
              tabIndex={-1}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          )}
        </label>
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';

// ============================================
// Number Input with stepper controls
// ============================================

/** Props for NumberInput component */
export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'value' | 'size'
>, InputSharedProps {
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment/decrement value */
  step?: number;
  /** Current numeric value */
  value?: number;
  /** Callback when value changes */
  onChange?: (value: number) => void;
  /** Show increment/decrement buttons */
  showStepper?: boolean;
  /** ID of error message element for accessibility */
  errorId?: string;
}

/**
 * NumberInput - Numeric input with increment/decrement stepper buttons
 * @example
 * <NumberInput
 *   value={count}
 *   onChange={setCount}
 *   min={0}
 *   max={100}
 *   step={1}
 * />
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      size,
      hasError,
      min,
      max,
      step = 1,
      value = 0,
      onChange,
      showStepper = true,
      disabled,
      errorId,
      ...rest
    },
    forwardedRef,
  ) => {
    const { root, wrapper, input, icon } = inputVariants({
      size,
      hasError,
    });

    const clampValue = (val: number): number => {
      if (min !== undefined && val < min) return min;
      if (max !== undefined && val > max) return max;
      return val;
    };

    const increment = () => {
      const newValue = clampValue((value ?? 0) + step);
      onChange?.(newValue);
    };

    const decrement = () => {
      const newValue = clampValue((value ?? 0) - step);
      onChange?.(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      if (!isNaN(parsed)) {
        onChange?.(clampValue(parsed));
      }
    };

    const isAtMin = min !== undefined && value <= min;
    const isAtMax = max !== undefined && value >= max;

    return (
      <div className={root({ class: className })} role="group" aria-label="Number input">
        <label className={wrapper()}>
          {showStepper && (
            <button
              type="button"
              onClick={decrement}
              disabled={disabled || isAtMin}
              className={icon({
                class: 'cursor-pointer hover:text-text-strong-950 disabled:cursor-not-allowed disabled:text-text-disabled-300',
              })}
              aria-label="Decrease value"
              tabIndex={-1}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
          )}
          <input
            type="number"
            className={input({ class: 'text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' })}
            ref={forwardedRef}
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={errorId}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            {...rest}
          />
          {showStepper && (
            <button
              type="button"
              onClick={increment}
              disabled={disabled || isAtMax}
              className={icon({
                class: 'cursor-pointer hover:text-text-strong-950 disabled:cursor-not-allowed disabled:text-text-disabled-300',
              })}
              aria-label="Increase value"
              tabIndex={-1}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          )}
        </label>
      </div>
    );
  },
);
NumberInput.displayName = 'NumberInput';

export {
  InputRoot as Root,
  InputWrapper as Wrapper,
  Input as El,
  InputIcon as Icon,
  InputAffix as Affix,
  InputInlineAffix as InlineAffix,
  // Enhanced inputs
  PasswordInput,
  SearchInput,
  NumberInput,
  // Types are exported at declaration with 'export interface'
};
