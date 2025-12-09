// Auth UI InputOTP - Adapter wrapping AlignUI DigitInput with shadcn-compatible API
"use client"

import * as React from "react"
import * as AlignDigitInput from "@/components/ui/digit-input"
import { Minus } from "@phosphor-icons/react"
import { cn } from "../../lib/utils"

// AlignUI DigitInput uses react-otp-input which has a different API
// We need to provide a compatible wrapper

interface InputOTPProps {
    value?: string
    onChange?: (value: string) => void
    maxLength?: number
    disabled?: boolean
    className?: string
    containerClassName?: string
    children?: React.ReactNode
    render?: (props: { slots: Array<{ char: string; hasFakeCaret: boolean; isActive: boolean }> }) => React.ReactNode
}

function InputOTP({
    value = "",
    onChange,
    maxLength = 6,
    disabled,
    className,
    containerClassName,
    children,
    ...props
}: InputOTPProps) {
    // If children are provided (slot-based API), use the old pattern
    // Otherwise use AlignUI DigitInput
    if (children) {
        return (
            <div className={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}>
                {children}
            </div>
        )
    }

    return (
        <AlignDigitInput.Root
            value={value}
            onChange={onChange ?? (() => {})}
            numInputs={maxLength}
            disabled={disabled}
            className={cn(containerClassName, className)}
            {...props}
        />
    )
}

function InputOTPGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex items-center", className)}
            {...props}
        />
    )
}

// Context for slot-based OTP (compatibility layer)
const InputOTPContext = React.createContext<{
    value: string
    activeIndex: number
} | null>(null)

function InputOTPSlot({
    index,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    index: number
}) {
    const context = React.useContext(InputOTPContext)
    const char = context?.value?.[index] ?? ""
    const isActive = context?.activeIndex === index

    return (
        <div
            data-active={isActive}
            className={cn(
                "relative flex h-16 w-full min-w-0 items-center justify-center rounded-10 bg-bg-white-0 text-center text-title-h5 text-text-strong-950 shadow-regular-xs outline-none ring-1 ring-inset ring-stroke-soft-200",
                "transition duration-200 ease-out",
                "hover:bg-bg-weak-50 hover:shadow-none hover:ring-transparent",
                "data-[active=true]:shadow-button-important-focus data-[active=true]:ring-stroke-strong-950",
                "disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:shadow-none disabled:ring-transparent",
                className
            )}
            {...props}
        >
            {char}
        </div>
    )
}

function InputOTPSeparator({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div role="separator" className="text-text-soft-400" {...props}>
            <Minus size={20} />
        </div>
    )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, InputOTPContext }
