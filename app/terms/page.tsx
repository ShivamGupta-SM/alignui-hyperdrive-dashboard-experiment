import Link from 'next/link'
import * as Button from '@/components/ui/button'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-white-0">
      <header className="border-b border-stroke-soft-200">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <Button.Root variant="ghost" size="small" asChild>
            <Link href="/">
              <Button.Icon as={ArrowLeft} />
              Back to Home
            </Link>
          </Button.Root>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-title-h2 text-text-strong-950 mb-4">Terms of Service</h1>
        <p className="text-paragraph-sm text-text-sub-600 mb-8">
          Last updated: December 8, 2024
        </p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">1. Acceptance of Terms</h2>
            <p className="text-paragraph-md text-text-sub-600">
              By accessing and using Hypedrive, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">2. Use License</h2>
            <p className="text-paragraph-md text-text-sub-600">
              Permission is granted to temporarily use Hypedrive for personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">3. User Accounts</h2>
            <p className="text-paragraph-md text-text-sub-600">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">4. Payment Terms</h2>
            <p className="text-paragraph-md text-text-sub-600">
              All payments are processed securely. Refunds are subject to our refund policy. You agree to provide accurate billing information.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">5. Prohibited Uses</h2>
            <p className="text-paragraph-md text-text-sub-600">
              You may not use Hypedrive for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">6. Limitation of Liability</h2>
            <p className="text-paragraph-md text-text-sub-600">
              Hypedrive shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">7. Contact Information</h2>
            <p className="text-paragraph-md text-text-sub-600">
              For questions about these Terms, please contact us at legal@hypedrive.com
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
