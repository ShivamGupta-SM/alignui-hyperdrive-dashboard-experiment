'use client'

import * as React from 'react'
import Link from 'next/link'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Accordion from '@/components/ui/accordion'
import {
  RiSearchLine,
  RiBookOpenLine,
  RiVideoLine,
  RiCodeSSlashLine,
  RiQuestionLine,
  RiTeamLine,
  RiMailLine,
  RiPhoneLine,
  RiMessage2Line,
  RiArrowRightLine,
  RiExternalLinkLine,
} from '@remixicon/react'
import { cn } from '@/utils/cn'

const quickLinks = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using Hypedrive',
    icon: RiBookOpenLine,
    href: '/docs/getting-started',
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    description: 'Step-by-step video walkthroughs',
    icon: RiVideoLine,
    href: '/docs/tutorials',
  },
  {
    id: 'api-docs',
    title: 'API Documentation',
    description: 'Integration guides for developers',
    icon: RiCodeSSlashLine,
    href: '/docs/api',
    external: true,
  },
  {
    id: 'faqs',
    title: 'FAQs',
    description: 'Common questions answered',
    icon: RiQuestionLine,
    href: '#faqs',
  },
  {
    id: 'community',
    title: 'Community Forum',
    description: 'Ask the community',
    icon: RiTeamLine,
    href: 'https://community.hypedrive.com',
    external: true,
  },
  {
    id: 'contact',
    title: 'Contact Support',
    description: 'Get personal help',
    icon: RiMailLine,
    href: '#contact',
  },
]

const faqs = [
  {
    id: '1',
    question: 'How do I create my first campaign?',
    answer: `To create your first campaign:
1. Go to the Campaigns page and click "Create Campaign"
2. Fill in the campaign details (title, product, dates)
3. Set your bill rate and enrollment limits
4. Submit for approval

Once approved by Hypedrive admins, your campaign will go live and shoppers can start enrolling.`,
  },
  {
    id: '2',
    question: 'What happens when I approve an enrollment?',
    answer: `When you approve an enrollment:
• The held amount is committed from your wallet
• The shopper receives their payout (managed by Hypedrive)
• The enrollment is marked as completed
• Your billing is updated with the final cost

Make sure you have sufficient wallet balance before approving enrollments.`,
  },
  {
    id: '3',
    question: 'How do wallet holds work?',
    answer: `Wallet holds are temporary reservations on your balance:
• When a shopper enrolls, we hold the estimated cost
• This ensures funds are available for payout
• Holds are released if you reject the enrollment
• Holds become permanent charges when you approve

You can see your held amount separately from your available balance.`,
  },
  {
    id: '4',
    question: 'How long does GST verification take?',
    answer: `GST verification is usually instant:
• Enter your 15-digit GSTIN
• Click "Verify GST"
• We validate with the government GST portal
• Results appear within seconds

If verification fails, double-check your GSTIN format. For persistent issues, contact support.`,
  },
  {
    id: '5',
    question: 'What are the different enrollment statuses?',
    answer: `Enrollment statuses track the lifecycle:
• **Awaiting Submission**: Shopper enrolled, waiting for proof
• **Awaiting Review**: Proof submitted, needs your review
• **Changes Requested**: You asked for updated proof
• **Approved**: Verified and payout initiated
• **Rejected**: Enrollment denied with reason
• **Withdrawn**: Shopper cancelled their enrollment`,
  },
  {
    id: '6',
    question: 'How do I add funds to my wallet?',
    answer: `You can add funds via:
1. **UPI**: Enter your UPI ID or scan QR code
2. **Bank Transfer**: Transfer to our bank account with your reference
3. **Credit Line**: Use your approved credit limit (if available)

Funds are typically credited within minutes for UPI, 1-2 hours for bank transfers.`,
  },
  {
    id: '7',
    question: 'Can I have multiple team members?',
    answer: `Yes! You can invite team members with different roles:
• **Owner**: Full access, cannot be removed
• **Admin**: Full access except ownership transfer
• **Manager**: Manage campaigns and enrollments
• **Viewer**: View-only access to dashboard

Go to Team page to invite members and manage permissions.`,
  },
  {
    id: '8',
    question: 'What happens if my campaign is rejected?',
    answer: `If your campaign is rejected:
• You'll receive an email with the reason
• Common reasons: incomplete details, policy violations
• You can edit and resubmit the campaign
• Contact support if you need clarification

Most rejections can be resolved by updating the campaign details.`,
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filteredFaqs, setFilteredFaqs] = React.useState(faqs)

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqs)
      return
    }

    const query = searchQuery.toLowerCase()
    setFilteredFaqs(
      faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      )
    )
  }, [searchQuery])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-title-h3 text-text-strong-950">Help & Support</h1>
        <p className="text-paragraph-md text-text-sub-600 mt-2">
          Get help with using Hypedrive
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <Input.Root>
          <Input.Wrapper>
            <Input.Icon as={RiSearchLine} />
            <Input.El
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Input.Wrapper>
        </Input.Root>
      </div>

      {/* Quick Links */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <h2 className="text-label-md text-text-strong-950 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon
            const isExternal = link.external
            const isAnchor = link.href.startsWith('#')

            const content = (
              <div className="flex items-start gap-4 p-4 rounded-10 bg-bg-weak-50 transition-colors hover:bg-bg-soft-200 cursor-pointer group">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0">
                  <Icon className="size-5 text-text-sub-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-label-sm text-text-strong-950">{link.title}</span>
                    {isExternal && (
                      <RiExternalLinkLine className="size-3.5 text-text-soft-400" />
                    )}
                  </div>
                  <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                    {link.description}
                  </p>
                </div>
                <RiArrowRightLine className="size-5 text-text-soft-400 group-hover:text-text-sub-600 transition-colors shrink-0" />
              </div>
            )

            if (isAnchor) {
              return (
                <a key={link.id} href={link.href}>
                  {content}
                </a>
              )
            }

            if (isExternal) {
              return (
                <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              )
            }

            return (
              <Link key={link.id} href={link.href}>
                {content}
              </Link>
            )
          })}
        </div>
      </div>

      {/* FAQs */}
      <div id="faqs" className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <h2 className="text-label-md text-text-strong-950 mb-4">Frequently Asked Questions</h2>
        
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <RiSearchLine className="size-12 text-text-soft-400 mx-auto mb-4" />
            <p className="text-paragraph-sm text-text-sub-600">
              No results found for "{searchQuery}"
            </p>
            <Button.Root
              variant="basic"
              size="small"
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button.Root>
          </div>
        ) : (
          <Accordion.Root type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq) => (
              <Accordion.Item key={faq.id} value={faq.id}>
                <Accordion.Header>
                  <Accordion.Trigger>
                    <Accordion.Arrow />
                    {faq.question}
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  <div className="whitespace-pre-line">
                    {faq.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}

        {filteredFaqs.length > 0 && filteredFaqs.length < faqs.length && (
          <div className="text-center mt-4">
            <Button.Root variant="basic" onClick={() => setSearchQuery('')}>
              View All FAQs
            </Button.Root>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div id="contact" className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6">
        <h2 className="text-label-md text-text-strong-950 mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 p-4 rounded-10 bg-bg-weak-50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0">
              <RiMailLine className="size-5 text-text-sub-600" />
            </div>
            <div>
              <div className="text-label-sm text-text-strong-950">Email</div>
              <a
                href="mailto:support@hypedrive.com"
                className="text-paragraph-sm text-primary-base hover:underline"
              >
                support@hypedrive.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-10 bg-bg-weak-50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0">
              <RiPhoneLine className="size-5 text-text-sub-600" />
            </div>
            <div>
              <div className="text-label-sm text-text-strong-950">Phone</div>
              <div className="text-paragraph-sm text-text-sub-600">
                +91 1800-XXX-XXXX
              </div>
              <div className="text-paragraph-xs text-text-soft-400">
                Mon-Sat, 9 AM - 6 PM
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-10 bg-bg-weak-50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0">
              <RiMessage2Line className="size-5 text-text-sub-600" />
            </div>
            <div>
              <div className="text-label-sm text-text-strong-950">Live Chat</div>
              <div className="text-paragraph-sm text-text-sub-600">
                Available 24/7
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Button.Root variant="primary">
            <Button.Icon as={RiMessage2Line} />
            Start Live Chat
          </Button.Root>
        </div>
      </div>
    </div>
  )
}

