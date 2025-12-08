import Link from 'next/link'
import ThemeSwitch from '@/components/theme-switch'
import { Logo } from '@/components/ui/logo'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-white-0">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo width={160} height={40} />
        </Link>
        <ThemeSwitch />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}

