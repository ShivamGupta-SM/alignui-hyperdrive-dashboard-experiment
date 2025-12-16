"use client"

import ThemeSwitch from "@/components/shared/theme-switch"

interface AuthHeaderProps {
	isMobile?: boolean
}

export function AuthHeader({ isMobile = false }: AuthHeaderProps) {
	return <ThemeSwitch />
}

