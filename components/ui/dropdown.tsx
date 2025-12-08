// AlignUI Dropdown v0.1.0
// Improvements: Flexible width variants, better accessibility, JSDoc, type exports

'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/cn';
import { tv, type VariantProps } from '@/utils/tv';
import { RiArrowRightSLine, RiCheckLine } from '@remixicon/react';
import { PolymorphicComponentProps } from '@/utils/polymorphic';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/** Variants for styled dropdown trigger (matches FancyButton basic style) */
export const dropdownTriggerVariants = tv({
  base: [
    // base
    'group inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-label-sm outline-none',
    'bg-bg-white-0 text-text-sub-600 shadow-fancy-buttons-stroke',
    'transition duration-200 ease-out',
    // hover
    'hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none',
    // focus
    'focus:outline-none focus-visible:text-text-strong-950 focus-visible:shadow-button-important-focus',
    // disabled
    'disabled:pointer-events-none disabled:text-text-disabled-300',
    'disabled:bg-bg-weak-50 disabled:shadow-none',
  ],
  variants: {
    size: {
      medium: 'h-10 gap-3 rounded-10 px-3.5',
      small: 'h-9 gap-3 rounded-lg px-3',
      xsmall: 'h-8 gap-2.5 rounded-lg px-2.5',
      xxsmall: 'h-7 gap-2.5 rounded-lg px-2 text-label-xs',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
const DropdownMenuArrow = DropdownMenuPrimitive.Arrow;

/** Variants for dropdown content width */
const dropdownContentVariants = tv({
  base: [
    'z-50 overflow-hidden rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200',
    'flex flex-col gap-1',
    // origin
    'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
    // animation
    'data-[state=open]:animate-in data-[state=open]:fade-in-0',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  ],
  variants: {
    width: {
      auto: 'w-auto min-w-[180px]',
      sm: 'w-[200px]',
      md: 'w-[280px]',
      lg: 'w-[320px]',
      xl: 'w-[400px]',
      full: 'w-full',
      trigger: 'w-[var(--radix-dropdown-menu-trigger-width)]',
    },
  },
  defaultVariants: {
    width: 'auto',
  },
});

/** Props for DropdownMenuContent */
export interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof dropdownContentVariants> {}

/**
 * DropdownMenuContent - Container for dropdown menu items
 * @example
 * <Dropdown.Content width="md">
 *   <Dropdown.Item>Option 1</Dropdown.Item>
 *   <Dropdown.Item>Option 2</Dropdown.Item>
 * </Dropdown.Content>
 */
const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 8, width, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={forwardedRef}
      sideOffset={sideOffset}
      className={cn(dropdownContentVariants({ width }), className)}
      {...rest}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    asChild?: boolean;
  }
>(({ className, inset, asChild, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    ref={forwardedRef}
    asChild={asChild}
    className={cn(
      // base
      'group/item relative cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950 outline-none',
      'flex items-center gap-2',
      'transition duration-200 ease-out',
      // hover
      'data-highlighted:bg-bg-weak-50',
      // focus
      'focus:outline-none',
      // disabled
      'data-[disabled]:text-text-disabled-300',
      inset && 'pl-9',
      className,
    )}
    {...rest}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

function DropdownItemIcon<T extends React.ElementType>({
  className,
  as,
  ...rest
}: PolymorphicComponentProps<T>) {
  const Component = as || 'div';

  return (
    <Component
      className={cn(
        // base
        'size-5 text-text-sub-600',
        // disabled
        'group-has-[[data-disabled]]:text-text-disabled-300',
        className,
      )}
      {...rest}
    />
  );
}
DropdownItemIcon.displayName = 'DropdownItemIcon';

const DropdownMenuGroup = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Group>
>(({ className, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Group
    ref={forwardedRef}
    className={cn('flex flex-col gap-1', className)}
    {...rest}
  />
));
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Label
    ref={forwardedRef}
    className={cn(
      'px-2 py-1 text-subheading-xs uppercase text-text-soft-400',
      className,
    )}
    {...rest}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={forwardedRef}
    className={cn(
      // base
      'group/item relative cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950 outline-0',
      'flex items-center gap-2',
      'transition duration-200 ease-out',
      // hover
      'data-highlighted:bg-bg-weak-50',
      // disabled
      'data-[disabled]:text-text-disabled-300',
      inset && 'pl-9',
      className,
    )}
    {...rest}
  >
    {children}
    <span className='flex-1' />
    <DropdownItemIcon as={RiArrowRightSLine} />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.SubContent
    ref={forwardedRef}
    className={cn(
      'z-50 w-max min-w-[180px] overflow-hidden rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200',
      'flex flex-col gap-1',
      // animation
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...rest}
  />
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

/** Props for DropdownMenuCheckboxItem */
export interface DropdownMenuCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {
  /** Optional shortcut key hint */
  shortcut?: string;
}

/**
 * DropdownMenuCheckboxItem - Checkbox item with indicator
 * @example
 * <Dropdown.CheckboxItem checked={isChecked} onCheckedChange={setIsChecked}>
 *   Show sidebar
 * </Dropdown.CheckboxItem>
 */
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, checked, shortcut, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={forwardedRef}
    checked={checked}
    className={cn(
      'group/item relative cursor-pointer select-none rounded-lg p-2 pl-8 text-paragraph-sm text-text-strong-950 outline-none',
      'flex items-center gap-2',
      'transition duration-200 ease-out',
      'data-highlighted:bg-bg-weak-50',
      'focus:outline-none',
      'data-[disabled]:text-text-disabled-300 data-[disabled]:pointer-events-none',
      className,
    )}
    {...rest}
  >
    <span className="absolute left-2 flex size-5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <RiCheckLine className="size-4 text-primary-base" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className="flex-1">{children}</span>
    {shortcut && (
      <span className="ml-auto text-paragraph-xs text-text-soft-400">{shortcut}</span>
    )}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

/** Props for DropdownMenuRadioItem */
export interface DropdownMenuRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> {
  /** Optional shortcut key hint */
  shortcut?: string;
}

/**
 * DropdownMenuRadioItem - Radio item with indicator
 * @example
 * <Dropdown.RadioGroup value={value} onValueChange={setValue}>
 *   <Dropdown.RadioItem value="option1">Option 1</Dropdown.RadioItem>
 *   <Dropdown.RadioItem value="option2">Option 2</Dropdown.RadioItem>
 * </Dropdown.RadioGroup>
 */
const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, shortcut, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.RadioItem
    ref={forwardedRef}
    className={cn(
      'group/item relative cursor-pointer select-none rounded-lg p-2 pl-8 text-paragraph-sm text-text-strong-950 outline-none',
      'flex items-center gap-2',
      'transition duration-200 ease-out',
      'data-highlighted:bg-bg-weak-50',
      'focus:outline-none',
      'data-[disabled]:text-text-disabled-300 data-[disabled]:pointer-events-none',
      className,
    )}
    {...rest}
  >
    <span className="absolute left-2 flex size-5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <div className="size-2 rounded-full bg-primary-base" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <span className="flex-1">{children}</span>
    {shortcut && (
      <span className="ml-auto text-paragraph-xs text-text-soft-400">{shortcut}</span>
    )}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

/** Props for StyledTrigger */
export interface StyledTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>,
    VariantProps<typeof dropdownTriggerVariants> {}

/**
 * StyledTrigger - A pre-styled trigger that matches FancyButton basic style
 * @example
 * <Dropdown.StyledTrigger size="small">
 *   Options
 *   <RiArrowDownSLine className="size-5" />
 * </Dropdown.StyledTrigger>
 */
const StyledTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  StyledTriggerProps
>(({ className, size, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Trigger
    ref={forwardedRef}
    className={cn(dropdownTriggerVariants({ size }), className)}
    {...rest}
  />
));
StyledTrigger.displayName = 'DropdownStyledTrigger';

export {
  DropdownMenu as Root,
  DropdownMenuPortal as Portal,
  DropdownMenuTrigger as Trigger,
  StyledTrigger,
  DropdownMenuContent as Content,
  DropdownMenuItem as Item,
  DropdownItemIcon as ItemIcon,
  DropdownMenuGroup as Group,
  DropdownMenuLabel as Label,
  DropdownMenuSub as MenuSub,
  DropdownMenuSubTrigger as MenuSubTrigger,
  DropdownMenuSubContent as MenuSubContent,
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRadioItem as RadioItem,
  DropdownMenuSeparator as Separator,
  DropdownMenuArrow as Arrow,
};
