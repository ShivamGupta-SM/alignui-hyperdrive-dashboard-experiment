import Link from "next/link"
import ThemeSwitch from "@/components/theme-switch"
import { Logo } from "@/components/ui/logo"

// Auth pages require dynamic rendering due to client-side providers
export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b border-stroke-soft-200">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
                    <Link href="/">
                        <Logo width={140} height={32} />
                    </Link>
                    <ThemeSwitch />
                </div>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
                {children}
            </main>
        </div>
    )
}
