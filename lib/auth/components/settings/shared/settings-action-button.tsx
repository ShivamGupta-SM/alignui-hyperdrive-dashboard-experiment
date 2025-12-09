"use client"

import { CircleNotch } from "@phosphor-icons/react"
import type { ComponentProps, ReactNode } from "react"
import { useFormState } from "react-hook-form"

import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import type { SettingsCardClassNames } from "./settings-card"

interface SettingsActionButtonProps extends ComponentProps<typeof Button> {
    classNames?: SettingsCardClassNames
    actionLabel: ReactNode
    disabled?: boolean
    isSubmitting?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    onClick?: () => void
}

export function SettingsActionButton({
    classNames,
    actionLabel,
    disabled,
    isSubmitting,
    variant,
    onClick,
    ...props
}: SettingsActionButtonProps) {
    if (!onClick) {
        const formState = useFormState()
        isSubmitting = formState.isSubmitting
    }

    return (
        <Button
            className={cn(
                "md:ms-auto",
                classNames?.button,
                variant === "default" && classNames?.primaryButton,
                variant === "destructive" && classNames?.destructiveButton
            )}
            disabled={isSubmitting || disabled}
            size="sm"
            type={onClick ? "button" : "submit"}
            variant={variant}
            onClick={onClick}
            {...props}
        >
            {isSubmitting && <CircleNotch className="animate-spin" size={20} />}
            {actionLabel}
        </Button>
    )
}
