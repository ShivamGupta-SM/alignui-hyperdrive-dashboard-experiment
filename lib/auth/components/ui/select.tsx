// Auth UI Select - Adapter wrapping AlignUI Select with shadcn-compatible API
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as AlignSelect from "@/components/ui/select"
import { cn } from "../../lib/utils"

// Re-export AlignUI Select with shadcn-compatible naming
const Select = AlignSelect.Root
const SelectGroup = AlignSelect.Group
const SelectValue = AlignSelect.Value
const SelectSeparator = AlignSelect.Separator

function SelectTrigger({
    className,
    size = "default",
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "default"
}) {
    return (
        <AlignSelect.Trigger
            className={cn(className)}
            {...props}
        >
            {children}
        </AlignSelect.Trigger>
    )
}

function SelectContent({
    className,
    children,
    position = "popper",
    ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
    return (
        <AlignSelect.Content
            className={cn(className)}
            position={position}
            {...props}
        >
            {children}
        </AlignSelect.Content>
    )
}

function SelectLabel({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>) {
    return (
        <AlignSelect.GroupLabel
            className={cn(className)}
            {...props}
        />
    )
}

function SelectItem({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
    return (
        <AlignSelect.Item
            className={cn(className)}
            {...props}
        >
            {children}
        </AlignSelect.Item>
    )
}

// These are not needed in AlignUI but kept for API compatibility
function SelectScrollUpButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return null
}

function SelectScrollDownButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return null
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
}
