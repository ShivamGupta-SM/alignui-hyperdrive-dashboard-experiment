// Auth UI Label - Adapter wrapping AlignUI Label with shadcn-compatible API
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import * as AlignLabel from "@/components/ui/label"
import { cn } from "../../lib/utils"

const Label = React.forwardRef<
    React.ComponentRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
    return (
        <AlignLabel.Root
            ref={ref}
            className={cn(className)}
            {...props}
        />
    )
})
Label.displayName = "Label"

export { Label }
