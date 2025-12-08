// AlignUI Slider v0.1.0 - Enhanced with labels, range, marks, and colors

'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { tv, type VariantProps } from '@/utils/tv';
import { cn } from '@/utils/cn';

const SLIDER_ROOT_NAME = 'SliderRoot';
const SLIDER_THUMB_NAME = 'SliderThumb';

const sliderVariants = tv({
  slots: {
    root: 'relative flex w-full touch-none select-none items-center',
    track: 'relative w-full overflow-hidden rounded-full bg-bg-soft-200',
    range: 'absolute h-full',
    thumb: 'box-content block shrink-0 cursor-pointer rounded-full border-static-white bg-primary-base shadow-toggle-switch outline-none focus:outline-none',
  },
  variants: {
    size: {
      sm: {
        root: 'h-3',
        track: 'h-1',
        thumb: 'size-1 border-[4px]',
      },
      md: {
        root: 'h-4',
        track: 'h-1.5',
        thumb: 'size-1.5 border-[5px]',
      },
      lg: {
        root: 'h-5',
        track: 'h-2',
        thumb: 'size-2 border-[5px]',
      },
    },
    color: {
      primary: {
        range: 'bg-primary-base',
        thumb: 'bg-primary-base',
      },
      blue: {
        range: 'bg-information-base',
        thumb: 'bg-information-base',
      },
      green: {
        range: 'bg-success-base',
        thumb: 'bg-success-base',
      },
      red: {
        range: 'bg-error-base',
        thumb: 'bg-error-base',
      },
      orange: {
        range: 'bg-warning-base',
        thumb: 'bg-warning-base',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

type SliderVariantProps = VariantProps<typeof sliderVariants>;

type SliderRootProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
  SliderVariantProps;

const SliderRoot = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderRootProps
>(({ className, children, size, color, ...rest }, forwardedRef) => {
  const { root, track, range } = sliderVariants({ size, color });

  return (
    <SliderPrimitive.Root
      ref={forwardedRef}
      className={cn(root(), className)}
      {...rest}
    >
      <SliderPrimitive.Track className={track()}>
        <SliderPrimitive.Range className={range()} />
      </SliderPrimitive.Track>
      {children}
    </SliderPrimitive.Root>
  );
});
SliderRoot.displayName = SLIDER_ROOT_NAME;

type SliderThumbProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb> &
  SliderVariantProps;

const SliderThumb = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Thumb>,
  SliderThumbProps
>(({ className, size, color, ...rest }, forwardedRef) => {
  const { thumb } = sliderVariants({ size, color });

  return (
    <SliderPrimitive.Thumb
      ref={forwardedRef}
      className={cn(thumb(), className)}
      {...rest}
    />
  );
});
SliderThumb.displayName = SLIDER_THUMB_NAME;

// Slider with label and value display
interface LabeledSliderProps extends SliderRootProps {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  valuePosition?: 'right' | 'tooltip';
}

function LabeledSlider({
  label,
  showValue = true,
  formatValue = (v) => v.toString(),
  valuePosition = 'right',
  value,
  defaultValue,
  size,
  color,
  className,
  onValueChange,
  ...rest
}: LabeledSliderProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || [0]);
  const currentValue = value || internalValue;

  const handleValueChange = (newValue: number[]) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const displayValue = Array.isArray(currentValue)
    ? currentValue.map(formatValue).join(' - ')
    : formatValue(currentValue as number);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || (showValue && valuePosition === 'right')) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-label-sm text-text-strong-950">{label}</span>
          )}
          {showValue && valuePosition === 'right' && (
            <span className="text-label-sm text-text-sub-600 tabular-nums">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <SliderRoot
        value={currentValue}
        onValueChange={handleValueChange}
        size={size}
        color={color}
        {...rest}
      >
        <SliderThumb size={size} color={color} />
        {Array.isArray(currentValue) && currentValue.length > 1 && (
          <SliderThumb size={size} color={color} />
        )}
      </SliderRoot>
    </div>
  );
}
LabeledSlider.displayName = 'LabeledSlider';

// Range Slider for selecting a range
interface RangeSliderProps extends Omit<SliderRootProps, 'value' | 'defaultValue'> {
  value?: [number, number];
  defaultValue?: [number, number];
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

function RangeSlider({
  value,
  defaultValue = [25, 75],
  label,
  showValue = true,
  formatValue = (v) => v.toString(),
  size,
  color,
  className,
  onValueChange,
  ...rest
}: RangeSliderProps) {
  const [internalValue, setInternalValue] = React.useState<[number, number]>(defaultValue);
  const currentValue = value || internalValue;

  const handleValueChange = (newValue: number[]) => {
    const rangeValue = [newValue[0], newValue[1]] as [number, number];
    setInternalValue(rangeValue);
    onValueChange?.(rangeValue);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-label-sm text-text-strong-950">{label}</span>
          )}
          {showValue && (
            <span className="text-label-sm text-text-sub-600 tabular-nums">
              {formatValue(currentValue[0])} - {formatValue(currentValue[1])}
            </span>
          )}
        </div>
      )}
      <SliderRoot
        value={currentValue}
        onValueChange={handleValueChange}
        size={size}
        color={color}
        {...rest}
      >
        <SliderThumb size={size} color={color} />
        <SliderThumb size={size} color={color} />
      </SliderRoot>
    </div>
  );
}
RangeSlider.displayName = 'RangeSlider';

// Slider with marks/steps
interface SliderMark {
  value: number;
  label?: string;
}

interface MarkedSliderProps extends SliderRootProps {
  marks: SliderMark[];
  label?: string;
  showValue?: boolean;
}

function MarkedSlider({
  marks,
  label,
  showValue = true,
  min = 0,
  max = 100,
  value,
  defaultValue,
  size,
  color,
  className,
  onValueChange,
  ...rest
}: MarkedSliderProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || [min]);
  const currentValue = value || internalValue;

  const handleValueChange = (newValue: number[]) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-label-sm text-text-strong-950">{label}</span>
          )}
          {showValue && (
            <span className="text-label-sm text-text-sub-600 tabular-nums">
              {Array.isArray(currentValue) ? currentValue[0] : currentValue}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <SliderRoot
          value={currentValue}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          size={size}
          color={color}
          {...rest}
        >
          <SliderThumb size={size} color={color} />
        </SliderRoot>
        <div className="mt-1 flex justify-between px-1">
          {marks.map((mark) => (
            <span
              key={mark.value}
              className="text-paragraph-xs text-text-soft-400"
              style={{
                position: 'absolute',
                left: `${((mark.value - min) / (max - min)) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {mark.label ?? mark.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
MarkedSlider.displayName = 'MarkedSlider';

export {
  SliderRoot as Root,
  SliderThumb as Thumb,
  LabeledSlider,
  RangeSlider,
  MarkedSlider,
  sliderVariants,
};
