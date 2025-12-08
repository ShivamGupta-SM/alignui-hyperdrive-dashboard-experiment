// Auth UI Checkbox - Adapter wrapping AlignUI Checkbox with shadcn-compatible API
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import * as AlignCheckbox from "@/components/ui/checkbox"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<
    React.ComponentRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
    return (
        <AlignCheckbox.Root
            ref={ref}
            className={cn(className)}
            {...props}
        />
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
