// Auth UI Textarea - Adapter wrapping AlignUI Textarea with shadcn-compatible API
import * as React from "react"
import * as AlignTextarea from "@/components/ui/textarea"
import { cn } from "../../lib/utils"

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> {
    hasError?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, hasError, ...props }, ref) => {
        return (
            <AlignTextarea.Root
                ref={ref}
                simple={true}
                hasError={hasError}
                className={cn(className)}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
