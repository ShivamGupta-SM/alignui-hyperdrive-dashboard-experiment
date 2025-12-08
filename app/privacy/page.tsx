import Link from 'next/link'
import * as Button from '@/components/ui/button'
import { RiArrowLeftLine } from '@remixicon/react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-white-0">
      <header className="border-b border-stroke-soft-200">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <Button.Root variant="ghost" size="small" asChild>
            <Link href="/">
              <Button.Icon as={RiArrowLeftLine} />
              Back to Home
            </Link>
          </Button.Root>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-title-h2 text-text-strong-950 mb-4">Privacy Policy</h1>
        <p className="text-paragraph-sm text-text-sub-600 mb-8">
          Last updated: December 8, 2024
        </p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">1. Information We Collect</h2>
            <p className="text-paragraph-md text-text-sub-600">
              We collect information you provide directly to us, including name, email address, organization details, and payment information.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">2. How We Use Your Information</h2>
            <p className="text-paragraph-md text-text-sub-600">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">3. Information Sharing</h2>
            <p className="text-paragraph-md text-text-sub-600">
              We do not share your personal information with third parties except as described in this policy or with your consent.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">4. Data Security</h2>
            <p className="text-paragraph-md text-text-sub-600">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">5. Your Rights</h2>
            <p className="text-paragraph-md text-text-sub-600">
              You have the right to access, update, or delete your personal information. You may also object to processing or request data portability.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">6. Cookies</h2>
            <p className="text-paragraph-md text-text-sub-600">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">7. Changes to This Policy</h2>
            <p className="text-paragraph-md text-text-sub-600">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-title-h5 text-text-strong-950 mb-3">8. Contact Us</h2>
            <p className="text-paragraph-md text-text-sub-600">
              If you have questions about this Privacy Policy, please contact us at privacy@hypedrive.com
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
