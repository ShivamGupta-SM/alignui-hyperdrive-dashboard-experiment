// Auth UI DropdownMenu - Adapter wrapping AlignUI Dropdown with shadcn-compatible API
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import * as AlignDropdown from "@/components/ui/dropdown"
import { Check, Circle } from "@phosphor-icons/react"
import { cn } from "../../lib/utils"

// Re-export AlignUI components with shadcn naming
const DropdownMenu = AlignDropdown.Root
const DropdownMenuPortal = AlignDropdown.Portal
const DropdownMenuTrigger = AlignDropdown.Trigger
const DropdownMenuGroup = AlignDropdown.Group
const DropdownMenuSub = AlignDropdown.MenuSub
const DropdownMenuSubTrigger = AlignDropdown.MenuSubTrigger
const DropdownMenuSubContent = AlignDropdown.MenuSubContent
const DropdownMenuSeparator = AlignDropdown.Separator

// Content with shadcn-compatible props
function DropdownMenuContent({
    className,
    sideOffset = 4,
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
    return (
        <AlignDropdown.Content
            sideOffset={sideOffset}
            className={cn(className)}
            {...props}
        />
    )
}

// Item with variant support
function DropdownMenuItem({
    className,
    inset,
    variant = "default",
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
    variant?: "default" | "destructive"
}) {
    return (
        <AlignDropdown.Item
            className={cn(
                variant === "destructive" && "text-error-base focus:text-error-base",
                inset && "pl-8",
                className
            )}
            {...props}
        />
    )
}

// Label with inset support
function DropdownMenuLabel({
    className,
    inset,
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
}) {
    return (
        <AlignDropdown.Label
            className={cn(inset && "pl-8", className)}
            {...props}
        />
    )
}

// Checkbox item
function DropdownMenuCheckboxItem({
    className,
    children,
    checked,
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            className={cn(
                "group/item relative cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950 outline-none",
                "flex items-center gap-2 pl-8",
                "transition duration-200 ease-out",
                "data-highlighted:bg-bg-weak-50",
                "focus:outline-none",
                "data-[disabled]:text-text-disabled-300",
                className
            )}
            checked={checked}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Check className="size-4" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    )
}

// Radio group
function DropdownMenuRadioGroup({
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioGroup>) {
    return <DropdownMenuPrimitive.RadioGroup {...props} />
}

// Radio item
function DropdownMenuRadioItem({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>) {
    return (
        <DropdownMenuPrimitive.RadioItem
            className={cn(
                "group/item relative cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950 outline-none",
                "flex items-center gap-2 pl-8",
                "transition duration-200 ease-out",
                "data-highlighted:bg-bg-weak-50",
                "focus:outline-none",
                "data-[disabled]:text-text-disabled-300",
                className
            )}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Circle className="size-2 fill-current" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    )
}

// Shortcut text
function DropdownMenuShortcut({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={cn(
                "ml-auto text-xs tracking-widest text-text-soft-400",
                className
            )}
            {...props}
        />
    )
}

export {
    DropdownMenu,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
}
