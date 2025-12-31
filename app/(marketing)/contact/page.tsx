"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import { Logo } from "@/components/ui/branding/logo"
import { EXTERNAL_URLS, CONTACT_INFO } from "@/lib/constants"
import {
	Envelope,
	Phone,
	MapPin,
	PaperPlaneTilt,
	CheckCircle,
	Buildings,
	User,
	ChatCircleText,
	ArrowLeft,
} from "@phosphor-icons/react"

const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	company: z.string().optional(),
	message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactSchema),
	})

	const onSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true)
		// Simulate API call - replace with actual API call
		await new Promise((resolve) => setTimeout(resolve, 1000))
		// TODO: Replace with actual API call to backend
		if (process.env.NODE_ENV === 'development') {
			console.log("Contact form submitted:", data)
		}
		setIsSubmitting(false)
		setIsSuccess(true)
		reset()
	}

	return (
		<div className="min-h-dvh bg-linear-to-br from-bg-weak-50 via-bg-white-0 to-bg-soft-200">
			{/* Header */}
			<header className="border-b border-stroke-soft-200 bg-bg-white-0/80 backdrop-blur-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<Link href="/" className="flex items-center gap-2">
							<Logo width={110} height={24} />
						</Link>
						<div className="flex items-center gap-3">
							<Button.Root variant="ghost" size="small" asChild>
								<Link href="/">
									<Button.Icon>
										<ArrowLeft className="size-4" />
									</Button.Icon>
									Back to Home
								</Link>
							</Button.Root>
							<Button.Root variant="primary" size="small" asChild>
								<Link href="/sign-in">Sign In</Link>
							</Button.Root>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="py-12 sm:py-16 lg:py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
						{/* Left Column - Info */}
						<div>
							<h1 className="text-title-h2 sm:text-title-h1 text-text-strong-950 mb-4">
								Get in Touch
							</h1>
							<p className="text-paragraph-md text-text-sub-600 mb-8 max-w-lg">
								Have questions about Hypedrive? Want to discuss enterprise plans or
								partnership opportunities? We&apos;re here to help.
							</p>

							{/* Contact Info Cards */}
							<div className="space-y-4 mb-8">
								<div className="flex items-start gap-4 p-4 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
									<div className="flex size-10 items-center justify-center rounded-lg bg-primary-lighter">
										<Envelope weight="duotone" className="size-5 text-primary-base" />
									</div>
									<div>
										<p className="text-label-sm text-text-strong-950 mb-1">Email Us</p>
										<a
											href={`mailto:${CONTACT_INFO.EMAIL}`}
											className="text-paragraph-sm text-primary-base hover:underline"
										>
											{CONTACT_INFO.EMAIL}
										</a>
									</div>
								</div>

								<div className="flex items-start gap-4 p-4 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
									<div className="flex size-10 items-center justify-center rounded-lg bg-success-lighter">
										<Phone weight="duotone" className="size-5 text-success-base" />
									</div>
									<div>
										<p className="text-label-sm text-text-strong-950 mb-1">WhatsApp Support</p>
										<a
											href={EXTERNAL_URLS.WHATSAPP_SUPPORT}
											target="_blank"
											rel="noopener noreferrer"
											className="text-paragraph-sm text-primary-base hover:underline"
										>
											{CONTACT_INFO.PHONE}
										</a>
									</div>
								</div>

								<div className="flex items-start gap-4 p-4 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
									<div className="flex size-10 items-center justify-center rounded-lg bg-warning-lighter">
										<MapPin weight="duotone" className="size-5 text-warning-base" />
									</div>
									<div>
										<p className="text-label-sm text-text-strong-950 mb-1">Office</p>
										<p className="text-paragraph-sm text-text-sub-600">
											{CONTACT_INFO.OFFICE_LOCATION}
										</p>
									</div>
								</div>
							</div>

							{/* Response Time */}
							<div className="p-4 rounded-xl bg-primary-lighter/30 border border-primary-lighter">
								<p className="text-label-sm text-primary-base mb-1">Response Time</p>
								<p className="text-paragraph-sm text-text-sub-600">
									We typically respond within 24 hours during business days.
								</p>
							</div>
						</div>

						{/* Right Column - Form */}
						<div className="rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-lg">
							{isSuccess ? (
								<div className="text-center py-12">
									<div className="flex size-16 items-center justify-center rounded-full bg-success-lighter mx-auto mb-6">
										<CheckCircle weight="duotone" className="size-8 text-success-base" />
									</div>
									<h2 className="text-title-h4 text-text-strong-950 mb-2">Message Sent!</h2>
									<p className="text-paragraph-sm text-text-sub-600 mb-6">
										Thank you for reaching out. We&apos;ll get back to you soon.
									</p>
									<Button.Root variant="ghost" onClick={() => setIsSuccess(false)}>
										Send Another Message
									</Button.Root>
								</div>
							) : (
								<>
									<h2 className="text-title-h4 text-text-strong-950 mb-6">Send us a Message</h2>

									<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
										<div>
											<label htmlFor="name" className="block text-label-sm text-text-strong-950 mb-2">
												Your Name <span className="text-error-base">*</span>
											</label>
											<Input.Root hasError={!!errors.name}>
												<Input.Wrapper>
													<Input.Icon as={User} />
													<Input.El
														id="name"
														type="text"
														placeholder="John Doe"
														{...register("name")}
													/>
												</Input.Wrapper>
											</Input.Root>
											{errors.name && (
												<p className="mt-1 text-paragraph-xs text-error-base">
													{errors.name.message}
												</p>
											)}
										</div>

										<div>
											<label htmlFor="email" className="block text-label-sm text-text-strong-950 mb-2">
												Email Address <span className="text-error-base">*</span>
											</label>
											<Input.Root hasError={!!errors.email}>
												<Input.Wrapper>
													<Input.Icon as={Envelope} />
													<Input.El
														id="email"
														type="email"
														placeholder="you@company.com"
														{...register("email")}
													/>
												</Input.Wrapper>
											</Input.Root>
											{errors.email && (
												<p className="mt-1 text-paragraph-xs text-error-base">
													{errors.email.message}
												</p>
											)}
										</div>

										<div>
											<label htmlFor="company" className="block text-label-sm text-text-strong-950 mb-2">
												Company Name
											</label>
											<Input.Root>
												<Input.Wrapper>
													<Input.Icon as={Buildings} />
													<Input.El
														id="company"
														type="text"
														placeholder="Your company (optional)"
														{...register("company")}
													/>
												</Input.Wrapper>
											</Input.Root>
										</div>

										<div>
											<label htmlFor="message" className="block text-label-sm text-text-strong-950 mb-2">
												Message <span className="text-error-base">*</span>
											</label>
											<div className={`relative rounded-10 ring-1 ring-inset ${errors.message ? "ring-error-base" : "ring-stroke-soft-200"} focus-within:ring-2 focus-within:ring-primary-base`}>
												<div className="flex items-start gap-2 p-3">
													<ChatCircleText className="size-5 text-text-soft-400 shrink-0 mt-0.5" />
													<textarea
														id="message"
														rows={4}
														placeholder="Tell us how we can help..."
														className="flex-1 bg-transparent text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 outline-none resize-none"
														{...register("message")}
													/>
												</div>
											</div>
											{errors.message && (
												<p className="mt-1 text-paragraph-xs text-error-base">
													{errors.message.message}
												</p>
											)}
										</div>

										<Button.Root
											type="submit"
											variant="primary"
											className="w-full h-12"
											disabled={isSubmitting}
											isLoading={isSubmitting}
											loadingText="Sending..."
										>
											<Button.Icon>
												<PaperPlaneTilt className="size-5" />
											</Button.Icon>
											Send Message
										</Button.Root>
									</form>
								</>
							)}
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-stroke-soft-200 bg-bg-white-0/50 py-6">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="text-paragraph-xs text-text-soft-400">
							&copy; 2025 Hypedrive. All rights reserved.
						</p>
						<div className="flex items-center gap-6">
							<Link href="/privacy" className="text-paragraph-xs text-text-soft-400 hover:text-text-sub-600">
								Privacy Policy
							</Link>
							<Link href="/terms" className="text-paragraph-xs text-text-soft-400 hover:text-text-sub-600">
								Terms of Service
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
