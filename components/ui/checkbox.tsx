// AlignUI Checkbox v0.1.0 - Enhanced with labels and groups

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/utils/cn';

function IconCheck({ ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='10'
      height='8'
      viewBox='0 0 10 8'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...rest}
    >
      <path
        d='M1 3.5L4 6.5L9 1.5'
        strokeWidth='1.5'
        className='stroke-static-white'
      />
    </svg>
  );
}

function IconIndeterminate({ ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='8'
      height='2'
      viewBox='0 0 8 2'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...rest}
    >
      <path d='M0 1H8' strokeWidth='1.5' className='stroke-static-white' />
    </svg>
  );
}

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, ...rest }, forwardedRef) => {
  const filterId = React.useId();

  // precalculated by .getTotalLength()
  const TOTAL_LENGTH_CHECK = 11.313708305358887;
  const TOTAL_LENGTH_INDETERMINATE = 8;

  return (
    <CheckboxPrimitive.Root
      ref={forwardedRef}
      checked={checked}
      className={cn(
        'group/checkbox relative flex size-5 shrink-0 items-center justify-center outline-none',
        'focus:outline-none',
        className,
      )}
      {...rest}
    >
      <svg
        width='20'
        height='20'
        viewBox='0 0 20 20'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <rect
          x='2'
          y='2'
          width='16'
          height='16'
          rx='4'
          className={cn(
            'fill-bg-soft-200 transition duration-200 ease-out',
            // hover
            'group-hover/checkbox:fill-bg-sub-300',
            // focus
            'group-focus/checkbox:fill-primary-base',
            // disabled
            'group-disabled/checkbox:fill-bg-soft-200',
            // hover
            'group-hover/checkbox:group-data-[state=checked]/checkbox:fill-primary-darker',
            'group-hover/checkbox:group-data-[state=indeterminate]/checkbox:fill-primary-darker',
            // focus
            'group-focus/checkbox:group-data-[state=checked]/checkbox:fill-primary-dark',
            'group-focus/checkbox:group-data-[state=indeterminate]/checkbox:fill-primary-dark',
            // checked
            'group-data-[state=checked]/checkbox:fill-primary-base',
            'group-data-[state=indeterminate]/checkbox:fill-primary-base',
            // disabled checked
            'group-disabled/checkbox:group-data-[state=checked]/checkbox:fill-bg-soft-200',
            'group-disabled/checkbox:group-data-[state=indeterminate]/checkbox:fill-bg-soft-200',
          )}
        />
        <g filter={`url(#${filterId})`}>
          <rect
            x='3.5'
            y='3.5'
            width='13'
            height='13'
            rx='2.6'
            className={cn(
              'fill-bg-white-0 transition duration-200 ease-out',
              // disabled
              'group-disabled/checkbox:hidden',
              // checked
              'group-data-[state=checked]/checkbox:opacity-0',
              'group-data-[state=indeterminate]/checkbox:opacity-0',
            )}
          />
        </g>
        <defs>
          <filter
            id={filterId}
            x='1.5'
            y='3.5'
            width='17'
            height='17'
            filterUnits='userSpaceOnUse'
            colorInterpolationFilters='sRGB'
          >
            <feFlood floodOpacity='0' result='BackgroundImageFix' />
            <feColorMatrix
              in='SourceAlpha'
              type='matrix'
              values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
              result='hardAlpha'
            />
            <feOffset dy='2' />
            <feGaussianBlur stdDeviation='1' />
            <feColorMatrix
              type='matrix'
              values='0 0 0 0 0.105882 0 0 0 0 0.109804 0 0 0 0 0.113725 0 0 0 0.12 0'
            />
            <feBlend
              mode='normal'
              in2='BackgroundImageFix'
              result='effect1_dropShadow_34646_2602'
            />
            <feBlend
              mode='normal'
              in='SourceGraphic'
              in2='effect1_dropShadow_34646_2602'
              result='shape'
            />
          </filter>
        </defs>
      </svg>
      <CheckboxPrimitive.Indicator
        forceMount
        className='[&_path]:transition-all [&_path]:duration-300 [&_path]:ease-out [&_svg]:opacity-0'
      >
        <IconCheck
          className={cn(
            'absolute left-1/2 top-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2',
            // checked
            'group-data-[state=checked]/checkbox:opacity-100',
            'group-data-[state=checked]/checkbox:[&>path]:[stroke-dashoffset:0]',
            // path
            '[&>path]:[stroke-dasharray:var(--total-length)] [&>path]:[stroke-dashoffset:var(--total-length)]',
            'group-data-[state=indeterminate]/checkbox:invisible',
          )}
          style={{
            ['--total-length']: TOTAL_LENGTH_CHECK,
          }}
        />
        <IconIndeterminate
          className={cn(
            'absolute left-1/2 top-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2',
            // indeterminate
            'group-data-[state=indeterminate]/checkbox:opacity-100',
            'group-data-[state=indeterminate]/checkbox:[&>path]:[stroke-dashoffset:0]',
            // path
            '[&>path]:[stroke-dasharray:var(--total-length)] [&>path]:[stroke-dashoffset:var(--total-length)]',
            'invisible group-data-[state=indeterminate]/checkbox:visible',
          )}
          style={{
            ['--total-length']: TOTAL_LENGTH_INDETERMINATE,
          }}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Checkbox with label and description
interface LabeledCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label: string;
  description?: string;
  hasError?: boolean;
}

const LabeledCheckbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  LabeledCheckboxProps
>(({ label, description, hasError, disabled, id, className, ...rest }, forwardedRef) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Checkbox
        ref={forwardedRef}
        id={checkboxId}
        disabled={disabled}
        {...rest}
      />
      <div className="flex flex-col gap-0.5 pt-0.5">
        <label
          htmlFor={checkboxId}
          className={cn(
            'text-label-sm text-text-strong-950 cursor-pointer select-none',
            disabled && 'cursor-not-allowed text-text-disabled-300',
            hasError && 'text-error-base',
          )}
        >
          {label}
        </label>
        {description && (
          <span
            className={cn(
              'text-paragraph-xs text-text-sub-600',
              disabled && 'text-text-disabled-300',
            )}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
});
LabeledCheckbox.displayName = 'LabeledCheckbox';

// Checkbox Group
interface CheckboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  orientation?: 'horizontal' | 'vertical';
  hasError?: boolean;
  errorMessage?: string;
}

function CheckboxGroup({
  children,
  label,
  description,
  orientation = 'vertical',
  hasError,
  errorMessage,
  className,
  ...rest
}: CheckboxGroupProps) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      role="group"
      aria-label={label}
      {...rest}
    >
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-label-sm text-text-strong-950">{label}</span>
          )}
          {description && (
            <span className="text-paragraph-xs text-text-sub-600">
              {description}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {children}
      </div>
      {hasError && errorMessage && (
        <span className="text-paragraph-xs text-error-base">{errorMessage}</span>
      )}
    </div>
  );
}
CheckboxGroup.displayName = 'CheckboxGroup';

// Checkbox Card - Checkbox inside a card-like container
interface CheckboxCardProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label: string;
  description?: string;
}

const CheckboxCard = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxCardProps
>(({ label, description, disabled, checked, id, className, ...rest }, forwardedRef) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border border-stroke-soft-200 p-4',
        'transition-all duration-200 ease-out',
        'hover:border-stroke-sub-300 hover:bg-bg-weak-50',
        checked && 'border-primary-base bg-primary-alpha-10',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <Checkbox
        ref={forwardedRef}
        id={checkboxId}
        disabled={disabled}
        checked={checked}
        {...rest}
      />
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            'text-label-sm text-text-strong-950',
            disabled && 'text-text-disabled-300',
          )}
        >
          {label}
        </span>
        {description && (
          <span
            className={cn(
              'text-paragraph-xs text-text-sub-600',
              disabled && 'text-text-disabled-300',
            )}
          >
            {description}
          </span>
        )}
      </div>
    </label>
  );
});
CheckboxCard.displayName = 'CheckboxCard';

export { Checkbox as Root, LabeledCheckbox, CheckboxGroup, CheckboxCard };
