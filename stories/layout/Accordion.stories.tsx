import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as AccordionRoot,
	Item as AccordionItem,
	Trigger as AccordionTrigger,
	Content as AccordionContent,
	Icon as AccordionIcon,
	Arrow as AccordionArrow,
} from "@/components/ui/layout/accordion"
import { Question, ShieldCheck, CreditCard, Gear } from "@phosphor-icons/react"

const meta: Meta<typeof AccordionRoot> = {
	title: "Layout/Accordion",
	component: AccordionRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof AccordionRoot>

// Basic accordion
export const Basic: Story = {
	render: () => (
		<div className="w-96">
			<AccordionRoot type="single" collapsible className="flex flex-col gap-2">
				<AccordionItem value="item-1">
					<AccordionTrigger>
						<AccordionIcon as={Question} />
						<span>What is your refund policy?</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						We offer a 30-day money-back guarantee. If you&apos;re not satisfied with your
						purchase, contact our support team for a full refund.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>
						<AccordionIcon as={ShieldCheck} />
						<span>Is my data secure?</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Yes, we use industry-standard encryption and security measures to protect
						your data. All information is encrypted in transit and at rest.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>
						<AccordionIcon as={CreditCard} />
						<span>What payment methods do you accept?</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						We accept all major credit cards (Visa, MasterCard, American Express),
						PayPal, and bank transfers for enterprise customers.
					</AccordionContent>
				</AccordionItem>
			</AccordionRoot>
		</div>
	),
}

// Multiple items open
export const Multiple: Story = {
	render: () => (
		<div className="w-96">
			<AccordionRoot type="multiple" defaultValue={["item-1"]} className="flex flex-col gap-2">
				<AccordionItem value="item-1">
					<AccordionTrigger>
						<AccordionIcon as={Gear} />
						<span>Account Settings</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Manage your account settings, including profile information, email
						preferences, and notification settings.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>
						<AccordionIcon as={ShieldCheck} />
						<span>Privacy & Security</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Control your privacy settings, enable two-factor authentication, and
						manage connected devices.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>
						<AccordionIcon as={CreditCard} />
						<span>Billing Information</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						View and update your billing information, manage payment methods, and
						download invoices.
					</AccordionContent>
				</AccordionItem>
			</AccordionRoot>
		</div>
	),
}

// Default open
export const DefaultOpen: Story = {
	render: () => (
		<div className="w-96">
			<AccordionRoot type="single" defaultValue="item-1" collapsible className="flex flex-col gap-2">
				<AccordionItem value="item-1">
					<AccordionTrigger>
						<AccordionIcon as={Question} />
						<span>Getting Started</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Welcome to our platform! Here you&apos;ll find everything you need to get
						started. Follow our quick setup guide to begin.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>
						<AccordionIcon as={Question} />
						<span>Advanced Features</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Explore our advanced features including analytics, integrations, and
						automation tools.
					</AccordionContent>
				</AccordionItem>
			</AccordionRoot>
		</div>
	),
}

// FAQ section
export const FAQSection: Story = {
	render: () => (
		<div className="w-[500px] p-6 rounded-xl bg-bg-white-0 shadow-regular-md">
			<h2 className="text-heading-sm text-text-strong-950 mb-4">Frequently Asked Questions</h2>
			<AccordionRoot type="single" collapsible className="flex flex-col gap-2">
				<AccordionItem value="faq-1">
					<AccordionTrigger>
						<AccordionIcon as={Question} />
						<span>How do I create an account?</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Click the &quot;Sign Up&quot; button in the top right corner. Fill in your email
						and create a password. You&apos;ll receive a verification email to complete
						the registration.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="faq-2">
					<AccordionTrigger>
						<AccordionIcon as={Question} />
						<span>Can I upgrade my plan later?</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Yes! You can upgrade your plan at any time from your account settings.
						The new plan will take effect immediately, and you&apos;ll only be charged
						the prorated difference.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="faq-3">
					<AccordionTrigger>
						<AccordionIcon as={Question} />
						<span>Do you offer team plans?</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						Yes, we offer team and enterprise plans with additional features like
						shared workspaces, team analytics, and priority support. Contact our
						sales team for more information.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="faq-4">
					<AccordionTrigger>
						<AccordionIcon as={Question} />
						<span>How can I contact support?</span>
						<AccordionArrow />
					</AccordionTrigger>
					<AccordionContent>
						You can reach our support team via email at support@example.com or
						through the in-app chat. We typically respond within 24 hours.
					</AccordionContent>
				</AccordionItem>
			</AccordionRoot>
		</div>
	),
}
