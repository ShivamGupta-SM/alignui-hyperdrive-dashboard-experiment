// AlignUI Toggle v0.0.0
// Enhanced toggle/switch component with label and hint support

'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { tv, type VariantProps } from '@/utils/tv';

const TOGGLE_ROOT_NAME = 'ToggleRoot';
const TOGGLE_LABEL_NAME = 'ToggleLabel';
const TOGGLE_HINT_NAME = 'ToggleHint';

export const toggleVariants = tv({
  slots: {
    root: 'group/toggle flex items-start',
    switch: 'shrink-0 outline-none focus:outline-none',
    track: [
      'rounded-full bg-bg-soft-200',
      'transition duration-200 ease-out',
    ],
    thumb: [
      'pointer-events-none relative block rounded-full',
      'transition-transform duration-200 ease-out',
      // before - main circle
      'before:absolute before:inset-y-0 before:left-1/2 before:w-3 before:-translate-x-1/2 before:rounded-full before:bg-static-white',
      'before:[mask:var(--mask)]',
      // after - shadow
      'after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2 after:rounded-full after:shadow-switch-thumb',
    ],
    wrapper: 'flex flex-col',
    label: 'select-none text-text-strong-950',
    hint: 'text-text-sub-600',
  },
  variants: {
    //#region size
    size: {
      small: {
        root: 'gap-2',
        track: 'h-4 w-7 p-0.5',
        thumb: 'size-3 data-[state=checked]:translate-x-3',
        wrapper: '',
        label: 'text-label-sm',
        hint: 'text-paragraph-xs',
      },
      medium: {
        root: 'gap-3',
        track: 'h-5 w-9 p-0.5',
        thumb: 'size-4 data-[state=checked]:translate-x-4',
        wrapper: 'gap-0.5',
        label: 'text-label-md',
        hint: 'text-paragraph-sm',
      },
    },
    //#endregion

    //#region variant
    variant: {
      default: {
        track: [
          // hover
          'group-hover/toggle:bg-bg-sub-300',
          // focus
          'group-focus-visible/toggle:bg-bg-sub-300',
          // pressed
          'group-active/toggle:bg-bg-soft-200',
          // checked
          'data-[state=checked]:bg-primary-base',
          // checked hover
          'group-hover/toggle:data-[state=checked]:bg-primary-darker',
          // checked pressed
          'group-active/toggle:data-[state=checked]:bg-primary-base',
        ],
        thumb: [
          // pressed
          'group-active/toggle:scale-[.833]',
        ],
      },
      slim: {
        track: [
          // base
          'ring-1 ring-inset ring-stroke-soft-200',
          // hover
          'group-hover/toggle:ring-stroke-strong-950',
          // checked
          'data-[state=checked]:bg-primary-base data-[state=checked]:ring-transparent',
          // checked hover
          'group-hover/toggle:data-[state=checked]:bg-primary-darker',
        ],
        thumb: [
          // base
          'shadow-xs',
          'border border-stroke-soft-200',
          // checked
          'data-[state=checked]:border-primary-darker',
        ],
      },
    },
    //#endregion

    //#region disabled
    disabled: {
      true: {
        root: 'cursor-not-allowed',
        track: [
          // base
          'bg-bg-white-0 p-[3px] ring-1 ring-inset ring-stroke-soft-200',
          'pointer-events-none',
        ],
        thumb: 'size-2.5 rounded-full bg-bg-soft-200 shadow-none before:hidden after:hidden',
        label: 'text-text-disabled-300',
        hint: 'text-text-disabled-300',
      },
    },
    //#endregion
  },
  compoundVariants: [
    {
      size: 'small',
      variant: 'slim',
      class: {
        track: 'h-4 w-8',
      },
    },
    {
      size: 'medium',
      variant: 'slim',
      class: {
        track: 'h-5 w-10',
      },
    },
  ],
  defaultVariants: {
    size: 'small',
    variant: 'default',
    disabled: false,
  },
});

type ToggleSharedProps = VariantProps<typeof toggleVariants>;

type ToggleRootProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> &
  ToggleSharedProps & {
    label?: React.ReactNode;
    hint?: React.ReactNode;
  };

const ToggleRoot = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  ToggleRootProps
>(
  (
    {
      className,
      size = 'small',
      variant = 'default',
      disabled = false,
      label,
      hint,
      id,
      ...rest
    },
    forwardedRef,
  ) => {
    const styles = toggleVariants({ size, variant, disabled: disabled ?? false });
    const generatedId = React.useId();
    const switchId = id || generatedId;
    const labelId = `${switchId}-label`;
    const hintId = `${switchId}-hint`;

    return (
      <div className={styles.root({ class: className })}>
        <SwitchPrimitives.Root
          ref={forwardedRef}
          id={switchId}
          className={styles.switch()}
          disabled={disabled ?? false}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={hint ? hintId : undefined}
          {...rest}
        >
          <div className={styles.track()}>
            <SwitchPrimitives.Thumb
              className={styles.thumb()}
              style={{
                ['--mask' as string]:
                  'radial-gradient(circle farthest-side at 50% 50%, #0000 1.95px, #000 2.05px 100%) 50% 50%/100% 100% no-repeat',
              }}
            />
          </div>
        </SwitchPrimitives.Root>

        {(label || hint) && (
          <div className={styles.wrapper()}>
            {label && (
              <label id={labelId} htmlFor={switchId} className={styles.label()}>
                {label}
              </label>
            )}
            {hint && (
              <span id={hintId} className={styles.hint()}>
                {hint}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
ToggleRoot.displayName = TOGGLE_ROOT_NAME;

type ToggleLabelProps = React.HTMLAttributes<HTMLSpanElement> & ToggleSharedProps;

function ToggleLabel({ className, size, variant, disabled, ...rest }: ToggleLabelProps) {
  const { label } = toggleVariants({ size, variant, disabled });

  return <span className={label({ class: className })} {...rest} />;
}
ToggleLabel.displayName = TOGGLE_LABEL_NAME;

type ToggleHintProps = React.HTMLAttributes<HTMLSpanElement> & ToggleSharedProps;

function ToggleHint({ className, size, variant, disabled, ...rest }: ToggleHintProps) {
  const { hint } = toggleVariants({ size, variant, disabled });

  return <span className={hint({ class: className })} {...rest} />;
}
ToggleHint.displayName = TOGGLE_HINT_NAME;

export { ToggleRoot as Root, ToggleLabel as Label, ToggleHint as Hint };
