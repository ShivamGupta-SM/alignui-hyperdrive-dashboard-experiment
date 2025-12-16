"use client"

import * as React from "react"
import * as Input from "@/components/ui/forms/input"
import * as Button from "@/components/ui/primitives/button"
import * as Accordion from "@/components/ui/layout/accordion"
import { MagnifyingGlass, Question } from "@phosphor-icons/react"

interface FAQ {
	id: string
	question: string
	answer: string
}

interface HelpFAQsProps {
	faqs: FAQ[]
}

export function HelpFAQs({ faqs: initialFaqs }: HelpFAQsProps) {
	const [searchQuery, setSearchQuery] = React.useState("")
	const [filteredFaqs, setFilteredFaqs] = React.useState(initialFaqs)

	React.useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredFaqs(initialFaqs)
			return
		}

		const query = searchQuery.toLowerCase()
		setFilteredFaqs(
			initialFaqs.filter(
				(faq) =>
					faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
			)
		)
	}, [searchQuery, initialFaqs])

	return (
		<>
			{/* Search */}
			<div className="max-w-xl mx-auto">
				<Input.Root>
					<Input.Wrapper>
						<Input.Icon as={MagnifyingGlass} />
						<Input.El
							placeholder="Search for help..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			{/* FAQs */}
			<div
				id="faqs"
				className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-6"
			>
				<h2 className="text-label-md text-text-strong-950 mb-4">Frequently Asked Questions</h2>

				{filteredFaqs.length === 0 ? (
					<div className="text-center py-8">
						<MagnifyingGlass weight="duotone" className="size-12 text-text-soft-400 mx-auto mb-4" />
						<p className="text-paragraph-sm text-text-sub-600">
							No results found for "{searchQuery}"
						</p>
						<Button.Root
							variant="neutral"
							size="small"
							className="mt-4"
							onClick={() => setSearchQuery("")}
						>
							Clear Search
						</Button.Root>
					</div>
				) : (
					<>
						<Accordion.Root type="single" collapsible className="space-y-3">
							{filteredFaqs.map((faq) => (
								<Accordion.Item key={faq.id} value={faq.id}>
									<Accordion.Trigger>
										<Accordion.Icon as={Question} />
										{faq.question}
										<Accordion.Arrow />
									</Accordion.Trigger>
									<Accordion.Content className="pl-[30px]">
										<div className="whitespace-pre-line">{faq.answer}</div>
									</Accordion.Content>
								</Accordion.Item>
							))}
						</Accordion.Root>

						{filteredFaqs.length > 0 && filteredFaqs.length < initialFaqs.length && (
							<div className="text-center mt-4">
								<Button.Root variant="ghost" onClick={() => setSearchQuery("")}>
									View All FAQs
								</Button.Root>
							</div>
						)}
					</>
				)}
			</div>
		</>
	)
}



