// Auth UI Button - Adapter wrapping AlignUI Button with shadcn-compatible API
'use client'

import * as React from "react"
import * as AlignButton from "@/components/ui/button"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

// Map shadcn variants to AlignUI FancyButton variants
function mapVariant(variant: ButtonProps["variant"]): "primary" | "neutral" | "error" | "basic" | "ghost" {
    switch (variant) {
        case "destructive":
            return "error"
        case "outline":
            return "basic"
        case "secondary":
            return "neutral"
        case "ghost":
            return "ghost"
        case "link":
            return "ghost"
        case "default":
        default:
            return "primary"
    }
}

// Map shadcn sizes to AlignUI sizes
function mapSize(size: ButtonProps["size"]): "medium" | "small" | "xsmall" | "xxsmall" {
    switch (size) {
        case "sm":
            return "small"
        case "lg":
            return "medium"
        case "icon":
            return "small"
        case "default":
        default:
            return "small"
    }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
        const alignVariant = mapVariant(variant)
        const alignSize = mapSize(size)

        // Handle link variant specially with underline styling
        const linkStyles = variant === "link"
            ? "bg-transparent ring-0 shadow-none hover:bg-transparent hover:underline underline-offset-4 text-primary-base"
            : ""

        // Handle icon size specially
        const iconStyles = size === "icon" ? "h-9 w-9 p-0" : ""

        return (
            <AlignButton.Root
                ref={ref}
                variant={alignVariant}
                size={alignSize}
                asChild={asChild}
                className={cn(linkStyles, iconStyles, className)}
                {...props}
            >
                {children}
            </AlignButton.Root>
        )
    }
)
Button.displayName = "Button"

// Re-export the AlignUI button variants for any direct usage
export { AlignButton }
export { Button }
