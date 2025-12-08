// AlignUI Switch v0.3.0
// Clean iOS-style toggle switch design

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/utils/cn';
import { tv, type VariantProps } from '@/utils/tv';

const switchVariants = tv({
  slots: {
    root: [
      'group/switch relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    thumb: [
      'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
    ],
  },
  variants: {
    size: {
      sm: {
        root: 'h-5 w-9',
        thumb: 'size-4 translate-x-0.5 data-[state=checked]:translate-x-[18px]',
      },
      md: {
        root: 'h-6 w-11',
        thumb: 'size-5 translate-x-0.5 data-[state=checked]:translate-x-[22px]',
      },
      lg: {
        root: 'h-7 w-14',
        thumb: 'size-6 translate-x-0.5 data-[state=checked]:translate-x-[30px]',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> &
  VariantProps<typeof switchVariants> & {
    /** Whether the switch has an error state */
    hasError?: boolean;
  };

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, disabled, size, hasError, ...rest }, forwardedRef) => {
  const { root, thumb } = switchVariants({ size });

  return (
    <SwitchPrimitives.Root
      className={cn(
        root(),
        // Unchecked state
        'bg-bg-soft-200 data-[state=unchecked]:bg-bg-soft-200',
        // Checked state
        'data-[state=checked]:bg-primary-base',
        // Hover states
        'hover:data-[state=unchecked]:bg-bg-sub-300',
        'hover:data-[state=checked]:bg-primary-darker',
        // Error state
        hasError && 'ring-2 ring-error-base',
        className,
      )}
      ref={forwardedRef}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      {...rest}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          thumb(),
          // Add slight scale animation on press
          'group-active/switch:scale-95',
          // Ensure vertical centering
          'mt-0.5',
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

// Switch with label and description
interface LabeledSwitchProps extends SwitchProps {
  label: string;
  description?: string;
  labelPosition?: 'left' | 'right';
  id?: string;
}

function LabeledSwitch({
  label,
  description,
  labelPosition = 'right',
  id,
  disabled,
  size = 'md',
  className,
  ...rest
}: LabeledSwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const labelContent = (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor={switchId}
        className={cn(
          'text-label-sm text-text-strong-950 cursor-pointer select-none',
          disabled && 'cursor-not-allowed text-text-disabled-300',
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
  );

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        labelPosition === 'left' && 'flex-row-reverse',
        className,
      )}
    >
      <Switch id={switchId} disabled={disabled} size={size} {...rest} />
      {labelContent}
    </div>
  );
}
LabeledSwitch.displayName = 'LabeledSwitch';

// Switch Group for multiple switches
interface SwitchGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

function SwitchGroup({
  children,
  label,
  orientation = 'vertical',
  className,
  ...rest
}: SwitchGroupProps) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      role="group"
      aria-label={label}
      {...rest}
    >
      {label && (
        <span className="text-label-sm text-text-strong-950">{label}</span>
      )}
      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        )}
      >
        {children}
      </div>
    </div>
  );
}
SwitchGroup.displayName = 'SwitchGroup';

export { Switch as Root, LabeledSwitch, SwitchGroup, switchVariants, type SwitchProps };
