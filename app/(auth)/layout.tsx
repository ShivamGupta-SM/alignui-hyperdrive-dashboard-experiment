import Link from 'next/link'
import ThemeSwitch from '@/components/theme-switch'
import { Logo } from '@/components/ui/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-white-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/">
          <Logo width={130} height={32} className="sm:w-[160px] sm:h-[40px]" />
        </Link>
        <ThemeSwitch />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 sm:py-6 text-center px-4">
        <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary-base hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary-base hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}

