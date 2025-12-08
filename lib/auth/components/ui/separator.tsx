// Auth UI Separator - Adapter wrapping AlignUI Divider with shadcn-compatible API
"use client"

import * as React from "react"
import * as Divider from "@/components/ui/divider"
import { cn } from "../../lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical"
    decorative?: boolean
}

function Separator({
    className,
    orientation = "horizontal",
    decorative = true,
    ...props
}: SeparatorProps) {
    // For vertical orientation, use custom styling since AlignUI Divider is horizontal-focused
    if (orientation === "vertical") {
        return (
            <div
                role={decorative ? "none" : "separator"}
                aria-orientation="vertical"
                className={cn(
                    "shrink-0 bg-stroke-soft-200 h-full w-px",
                    className
                )}
                {...props}
            />
        )
    }

    return (
        <Divider.Root
            className={cn(className)}
            {...props}
        />
    )
}

export { Separator }
