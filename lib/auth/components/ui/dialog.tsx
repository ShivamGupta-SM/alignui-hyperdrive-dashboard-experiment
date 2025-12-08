// Auth UI Dialog - Adapter wrapping AlignUI Modal with shadcn-compatible API
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as Modal from "@/components/ui/modal"
import { cn } from "../../lib/utils"

// Re-export AlignUI Modal as Dialog with shadcn-compatible API
const Dialog = Modal.Root
const DialogTrigger = Modal.Trigger
const DialogPortal = Modal.Portal
const DialogClose = Modal.Close
const DialogOverlay = Modal.Overlay

function DialogContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
    overlayClassName?: string
}) {
    return (
        <Modal.Content
            className={cn("max-w-lg", className)}
            showClose={showCloseButton}
            {...props}
        >
            {children}
        </Modal.Content>
    )
}

function DialogHeader({
    className,
    icon,
    title,
    description,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ComponentType<{ className?: string }>
    title?: string
    description?: string
}) {
    // If children provided, use custom content, otherwise use Modal.Header
    if (children) {
        return (
            <div
                className={cn("flex flex-col gap-2 text-center sm:text-left p-5 pb-0", className)}
                {...props}
            >
                {children}
            </div>
        )
    }

    return (
        <Modal.Header
            className={className}
            icon={icon}
            title={title}
            description={description}
            {...props}
        />
    )
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Modal.Footer
            className={cn("flex-col-reverse sm:flex-row sm:justify-end gap-2", className)}
            {...props}
        />
    )
}

function DialogTitle({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
    return (
        <Modal.Title
            className={cn("text-lg leading-none font-semibold", className)}
            {...props}
        />
    )
}

function DialogDescription({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
    return (
        <Modal.Description
            className={cn(className)}
            {...props}
        />
    )
}

// Body component for content area
function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <Modal.Body className={className} {...props} />
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
    DialogBody,
}
