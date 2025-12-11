import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hypedrive - The Influencer Marketing Platform That Actually Works',
  description:
    'Launch, manage, and scale creator campaigns with automated enrollment tracking, OCR-powered verification, and real-time wallet management. Trusted by 500+ brands.',
  openGraph: {
    title: 'Hypedrive - The Influencer Marketing Platform',
    description: 'Launch, manage, and scale creator campaigns with automated enrollment tracking.',
    type: 'website',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
