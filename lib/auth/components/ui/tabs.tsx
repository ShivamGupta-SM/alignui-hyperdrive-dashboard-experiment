// Auth UI Tabs - Adapter wrapping AlignUI TabMenuHorizontal with shadcn-compatible API
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as AlignTabs from "@/components/ui/tab-menu-horizontal"
import { cn } from "../../lib/utils"

// Re-export AlignUI Tabs with shadcn-compatible naming
const Tabs = AlignTabs.Root
const TabsContent = AlignTabs.Content

function TabsList({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
    return (
        <AlignTabs.List
            className={cn(className)}
            {...props}
        />
    )
}

function TabsTrigger({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
    return (
        <AlignTabs.Trigger
            className={cn(className)}
            {...props}
        />
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
