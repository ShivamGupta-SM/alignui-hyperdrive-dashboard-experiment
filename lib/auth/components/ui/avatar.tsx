// Auth UI Avatar - Adapter wrapping AlignUI Avatar with shadcn-compatible API
"use client"

import * as React from "react"
import * as AlignAvatar from "@/components/ui/avatar"
import { cn } from "../../lib/utils"

interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
    asChild?: boolean
}

function Avatar({
    className,
    children,
    ...props
}: AvatarProps) {
    // Don't pass size prop - let className control the size
    return (
        <div
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

interface AvatarImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "color"> {
    asChild?: boolean
}

function AvatarImage({
    className,
    src,
    alt,
    ...props
}: AvatarImageProps) {
    const [hasError, setHasError] = React.useState(false)
    const [isLoaded, setIsLoaded] = React.useState(false)

    React.useEffect(() => {
        setHasError(false)
        setIsLoaded(false)
    }, [src])

    if (!src || hasError) {
        return null
    }

    return (
        <img
            src={src}
            alt={alt}
            className={cn(
                "aspect-square size-full object-cover",
                !isLoaded && "hidden",
                className
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            {...props}
        />
    )
}

interface AvatarFallbackProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
    delayMs?: number
}

function AvatarFallback({
    className,
    children,
    delayMs,
    ...props
}: AvatarFallbackProps) {
    const [canRender, setCanRender] = React.useState(!delayMs)

    React.useEffect(() => {
        if (delayMs) {
            const timer = setTimeout(() => setCanRender(true), delayMs)
            return () => clearTimeout(timer)
        }
    }, [delayMs])

    if (!canRender) return null

    return (
        <span
            className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full bg-bg-soft-200 text-label-sm font-medium text-text-sub-600",
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}

export { Avatar, AvatarImage, AvatarFallback }
