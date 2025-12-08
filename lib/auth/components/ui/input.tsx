// Auth UI Input - Adapter wrapping AlignUI Input with shadcn-compatible API
import * as React from "react"
import * as AlignInput from "@/components/ui/input"
import { cn } from "../../lib/utils"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    hasError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", hasError, ...props }, ref) => {
        return (
            <AlignInput.Root hasError={hasError} size="small">
                <AlignInput.Wrapper>
                    <AlignInput.El
                        ref={ref}
                        type={type}
                        className={cn(className)}
                        {...props}
                    />
                </AlignInput.Wrapper>
            </AlignInput.Root>
        )
    }
)
Input.displayName = "Input"

export { Input }
