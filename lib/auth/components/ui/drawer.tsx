// Auth UI Drawer - Adapter wrapping AlignUI Drawer with shadcn-compatible API
"use client"

import * as React from "react"
import * as AlignDrawer from "@/components/ui/drawer"
import { cn } from "../../lib/utils"

// Re-export AlignUI Drawer components with shadcn naming
const Drawer = AlignDrawer.Root
const DrawerTrigger = AlignDrawer.Trigger
const DrawerClose = AlignDrawer.Close
const DrawerPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DrawerOverlay = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => null

function DrawerContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <AlignDrawer.Content
            className={cn(className)}
            {...props}
        >
            {children}
        </AlignDrawer.Content>
    )
}

function DrawerHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <AlignDrawer.Header
            className={cn(className)}
            showCloseButton={false}
            {...props}
        />
    )
}

function DrawerFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <AlignDrawer.Footer
            className={cn("flex-col gap-2", className)}
            {...props}
        />
    )
}

function DrawerTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <AlignDrawer.Title
            className={cn(className)}
            {...props}
        />
    )
}

function DrawerDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-paragraph-sm text-text-sub-600", className)}
            {...props}
        />
    )
}

function DrawerBody({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <AlignDrawer.Body
            className={cn(className)}
            {...props}
        />
    )
}

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
    DrawerBody,
}
