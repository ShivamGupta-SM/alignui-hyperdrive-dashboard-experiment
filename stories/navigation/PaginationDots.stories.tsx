import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { PaginationDots } from "@/components/ui/navigation/pagination-dots"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"

const meta: Meta<typeof PaginationDots> = {
	title: "Navigation/PaginationDots",
	component: PaginationDots,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "outline", "pill"],
		},
		size: {
			control: "select",
			options: ["small", "medium", "large"],
		},
	},
}

export default meta
type Story = StoryObj<typeof PaginationDots>

// Basic pagination dots
export const Basic: Story = {
	render: function BasicDemo() {
		const [activeIndex, setActiveIndex] = useState(0)
		return (
			<PaginationDots
				count={5}
				activeIndex={activeIndex}
				onDotClick={setActiveIndex}
			/>
		)
	},
}

// All variants
export const AllVariants: Story = {
	render: function AllVariantsDemo() {
		const [activeIndex, setActiveIndex] = useState(2)
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Default</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						variant="default"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Outline</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						variant="outline"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Pill</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						variant="pill"
					/>
				</div>
			</div>
		)
	},
}

// All sizes
export const AllSizes: Story = {
	render: function AllSizesDemo() {
		const [activeIndex, setActiveIndex] = useState(1)
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Small</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						size="small"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Medium (default)</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						size="medium"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Large</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						size="large"
					/>
				</div>
			</div>
		)
	},
}

// Pill sizes
export const PillSizes: Story = {
	render: function PillSizesDemo() {
		const [activeIndex, setActiveIndex] = useState(2)
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Small Pill</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						variant="pill"
						size="small"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Medium Pill</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						variant="pill"
						size="medium"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">Large Pill</span>
					<PaginationDots
						count={5}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						variant="pill"
						size="large"
					/>
				</div>
			</div>
		)
	},
}

// Many dots
export const ManyDots: Story = {
	render: function ManyDotsDemo() {
		const [activeIndex, setActiveIndex] = useState(5)
		return (
			<PaginationDots
				count={10}
				activeIndex={activeIndex}
				onDotClick={setActiveIndex}
			/>
		)
	},
}

// Few dots
export const FewDots: Story = {
	render: function FewDotsDemo() {
		const [activeIndex, setActiveIndex] = useState(0)
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">2 dots</span>
					<PaginationDots count={2} activeIndex={activeIndex % 2} onDotClick={setActiveIndex} />
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-paragraph-xs text-text-sub-600">3 dots</span>
					<PaginationDots count={3} activeIndex={activeIndex % 3} onDotClick={setActiveIndex} />
				</div>
			</div>
		)
	},
}

// Image carousel example
export const ImageCarouselExample: Story = {
	render: function ImageCarouselDemo() {
		const [activeIndex, setActiveIndex] = useState(0)
		const images = [
			"Product Image 1",
			"Product Image 2",
			"Product Image 3",
			"Product Image 4",
		]

		const prev = () => setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1))
		const next = () => setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0))

		return (
			<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="relative h-48 bg-bg-weak-50 flex items-center justify-center">
					<span className="text-paragraph-sm text-text-sub-600">{images[activeIndex]}</span>
					<button
						onClick={prev}
						className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
					>
						<CaretLeft className="size-4" />
					</button>
					<button
						onClick={next}
						className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
					>
						<CaretRight className="size-4" />
					</button>
				</div>
				<div className="p-4 flex justify-center">
					<PaginationDots
						count={images.length}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
					/>
				</div>
			</div>
		)
	},
}

// Onboarding example
export const OnboardingExample: Story = {
	render: function OnboardingDemo() {
		const [step, setStep] = useState(0)
		const steps = [
			{ title: "Welcome", description: "Get started with our platform" },
			{ title: "Profile", description: "Set up your profile information" },
			{ title: "Preferences", description: "Customize your experience" },
			{ title: "Ready!", description: "You're all set to begin" },
		]

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<div className="h-32 flex flex-col items-center justify-center text-center mb-6">
					<h3 className="text-heading-md text-text-strong-950 mb-2">{steps[step].title}</h3>
					<p className="text-paragraph-sm text-text-sub-600">{steps[step].description}</p>
				</div>
				<div className="flex items-center justify-between">
					<button
						onClick={() => setStep((s) => Math.max(0, s - 1))}
						disabled={step === 0}
						className="px-4 py-2 text-paragraph-sm text-text-sub-600 disabled:opacity-50"
					>
						Back
					</button>
					<PaginationDots
						count={steps.length}
						activeIndex={step}
						onDotClick={setStep}
						variant="pill"
						size="small"
					/>
					<button
						onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
						disabled={step === steps.length - 1}
						className="px-4 py-2 text-paragraph-sm text-primary-base disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		)
	},
}

// Testimonial slider example
export const TestimonialSliderExample: Story = {
	render: function TestimonialSliderDemo() {
		const [activeIndex, setActiveIndex] = useState(0)
		const testimonials = [
			{ name: "Sarah J.", role: "CEO", text: "This product changed our workflow completely." },
			{ name: "Mike R.", role: "Designer", text: "The best tool I've used in years." },
			{ name: "Lisa M.", role: "Developer", text: "Incredibly intuitive and powerful." },
		]

		return (
			<div className="w-96 p-6 bg-primary-base/5 rounded-xl">
				<div className="text-center mb-6">
					<p className="text-paragraph-md text-text-strong-950 italic mb-4">
						"{testimonials[activeIndex].text}"
					</p>
					<p className="text-label-sm text-text-strong-950">{testimonials[activeIndex].name}</p>
					<p className="text-paragraph-xs text-text-sub-600">{testimonials[activeIndex].role}</p>
				</div>
				<div className="flex justify-center">
					<PaginationDots
						count={testimonials.length}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						variant="outline"
					/>
				</div>
			</div>
		)
	},
}

// Feature tour example
export const FeatureTourExample: Story = {
	render: function FeatureTourDemo() {
		const [step, setStep] = useState(0)
		const features = [
			{ icon: "1", title: "Dashboard", description: "Overview of your data" },
			{ icon: "2", title: "Analytics", description: "Deep dive into metrics" },
			{ icon: "3", title: "Reports", description: "Generate custom reports" },
			{ icon: "4", title: "Settings", description: "Customize your workspace" },
			{ icon: "5", title: "Team", description: "Collaborate with others" },
		]

		return (
			<div className="w-80 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-6 bg-gradient-to-br from-primary-base to-primary-dark text-white">
					<div className="size-12 rounded-lg bg-white/20 flex items-center justify-center text-heading-lg mb-4">
						{features[step].icon}
					</div>
					<h3 className="text-label-lg mb-1">{features[step].title}</h3>
					<p className="text-paragraph-sm opacity-80">{features[step].description}</p>
				</div>
				<div className="p-4 flex items-center justify-between">
					<button
						onClick={() => setStep(0)}
						className="text-paragraph-xs text-text-sub-600 hover:text-text-strong-950"
					>
						Skip tour
					</button>
					<PaginationDots
						count={features.length}
						activeIndex={step}
						onDotClick={setStep}
						size="small"
					/>
					<button
						onClick={() => setStep((s) => Math.min(features.length - 1, s + 1))}
						className="text-paragraph-xs text-primary-base font-medium"
					>
						{step === features.length - 1 ? "Finish" : "Next"}
					</button>
				</div>
			</div>
		)
	},
}

// Full-screen slider example
export const FullScreenSliderExample: Story = {
	render: function FullScreenSliderDemo() {
		const [activeIndex, setActiveIndex] = useState(0)
		const slides = ["Slide 1", "Slide 2", "Slide 3", "Slide 4", "Slide 5"]

		return (
			<div className="w-[500px] h-64 bg-gradient-to-br from-bg-weak-50 to-bg-soft-200 rounded-xl relative flex items-center justify-center">
				<span className="text-heading-lg text-text-sub-600">{slides[activeIndex]}</span>
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2">
					<div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
						<PaginationDots
							count={slides.length}
							activeIndex={activeIndex}
							onDotClick={setActiveIndex}
							variant="pill"
						/>
					</div>
				</div>
			</div>
		)
	},
}

// Story viewer example
export const StoryViewerExample: Story = {
	render: function StoryViewerDemo() {
		const [activeIndex, setActiveIndex] = useState(0)
		const stories = Array.from({ length: 6 }, (_, i) => `Story ${i + 1}`)

		return (
			<div className="w-64 h-[450px] bg-gray-900 rounded-2xl overflow-hidden relative">
				<div className="absolute top-0 left-0 right-0 p-2 z-10">
					<div className="flex gap-1">
						{stories.map((_, i) => (
							<div
								key={i}
								className={`h-0.5 flex-1 rounded-full transition-colors ${
									i === activeIndex
										? "bg-white"
										: i < activeIndex
											? "bg-white/60"
											: "bg-white/30"
								}`}
							/>
						))}
					</div>
				</div>
				<div className="h-full flex items-center justify-center">
					<span className="text-white text-heading-lg">{stories[activeIndex]}</span>
				</div>
				<div className="absolute bottom-4 left-0 right-0 flex justify-center">
					<PaginationDots
						count={stories.length}
						activeIndex={activeIndex}
						onDotClick={setActiveIndex}
						size="small"
					/>
				</div>
				<button
					onClick={() => setActiveIndex((i) => (i < stories.length - 1 ? i + 1 : 0))}
					className="absolute inset-0 w-full h-full"
				/>
			</div>
		)
	},
}

// Interactive playground
export const InteractivePlayground: Story = {
	args: {
		count: 5,
		variant: "default",
		size: "medium",
	},
	render: function InteractivePlaygroundDemo(args) {
		const [activeIndex, setActiveIndex] = useState(0)
		return (
			<div className="flex flex-col gap-4 items-center">
				<PaginationDots
					count={args.count || 5}
					activeIndex={activeIndex}
					onDotClick={setActiveIndex}
					variant={args.variant}
					size={args.size}
				/>
				<p className="text-paragraph-sm text-text-sub-600">
					Active: {activeIndex + 1} of {args.count || 5}
				</p>
			</div>
		)
	},
}
