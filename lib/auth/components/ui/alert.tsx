// Auth UI Alert - Adapter wrapping AlignUI Alert with shadcn-compatible API
import * as React from "react"
import * as AlignAlert from "@/components/ui/alert"
import { cn } from "../../lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "destructive"
}

function Alert({
    className,
    variant = "default",
    children,
    ...props
}: AlertProps) {
    // Map shadcn variants to AlignUI
    const alignStatus = variant === "destructive" ? "error" : "information"

    return (
        <AlignAlert.Root
            variant="stroke"
            status={alignStatus}
            size="large"
            className={cn(className)}
            {...props}
        >
            {children}
        </AlignAlert.Root>
    )
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight text-label-sm",
                className
            )}
            {...props}
        />
    )
}

function AlertDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "col-start-2 grid justify-items-start gap-1 text-paragraph-sm text-text-sub-600 [&_p]:leading-relaxed",
                className
            )}
            {...props}
        />
    )
}

export { Alert, AlertTitle, AlertDescription }
