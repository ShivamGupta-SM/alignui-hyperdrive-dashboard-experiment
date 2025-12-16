"use client"

import Link from "next/link"
import { useSession } from "@/features/auth"
import { UserAvatar } from "@/components/shared/user-avatar"
import * as Button from "@/components/ui/primitives/button"
import { Logo } from "@/components/ui/branding/logo"
import { House } from "@phosphor-icons/react"
import ThemeSwitch from "@/components/shared/theme-switch"
import type { auth } from "@/lib/api/encore-client"

export default function Header() {
	const { data: sessionData, isPending } = useSession()
	const user = sessionData?.user

	return (
		<div className="border-b border-stroke-soft-200">
			<header className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
				<Link href="/">
					<Logo width={140} height={32} />
				</Link>

				<div className="flex items-center gap-3">
					<ThemeSwitch />

					{isPending ? (
						<div className="h-9 w-20 animate-pulse rounded-lg bg-bg-soft-200" />
					) : user ? (
						<div className="flex items-center gap-2">
							<Button.Root variant="primary" size="small" asChild>
								<Link href="/dashboard">
									<Button.Icon>
										<House className="size-5" />
									</Button.Icon>
									Dashboard
								</Link>
							</Button.Root>
							<Link href="/dashboard">
								<UserAvatar user={user ? (user as unknown as auth.MeResponse) : null} size="40" className="size-9" />
							</Link>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Button.Root variant="ghost" size="small" asChild>
								<Link href="/sign-in">Sign In</Link>
							</Button.Root>
							<Button.Root variant="primary" size="small" asChild>
								<Link href="/sign-up">Sign Up</Link>
							</Button.Root>
						</div>
					)}
				</div>
			</header>
		</div>
	)
}
