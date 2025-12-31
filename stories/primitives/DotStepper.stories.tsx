import type { Meta, StoryObj } from "@storybook/react"
import * as DotStepper from "@/components/ui/primitives/dot-stepper"
import { useState } from "react"

const meta: Meta<typeof DotStepper.Root> = {
	title: "Primitives/DotStepper",
	component: DotStepper.Root,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["small", "xsmall"],
		},
	},
}

export default meta
type Story = StoryObj<typeof DotStepper.Root>

// Basic dot stepper
export const Basic: Story = {
	render: () => (
		<DotStepper.Root>
			<DotStepper.Item active />
			<DotStepper.Item />
			<DotStepper.Item />
			<DotStepper.Item />
		</DotStepper.Root>
	),
}

// All sizes
export const AllSizes: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">Small</p>
				<DotStepper.Root size="small">
					<DotStepper.Item active />
					<DotStepper.Item />
					<DotStepper.Item />
					<DotStepper.Item />
				</DotStepper.Root>
			</div>
			<div>
				<p className="text-label-sm text-text-strong-950 mb-3">XSmall</p>
				<DotStepper.Root size="xsmall">
					<DotStepper.Item active />
					<DotStepper.Item />
					<DotStepper.Item />
					<DotStepper.Item />
				</DotStepper.Root>
			</div>
		</div>
	),
}

// Interactive stepper
export const Interactive: Story = {
	render: function InteractiveDemo() {
		const [activeStep, setActiveStep] = useState(0)
		const totalSteps = 5

		return (
			<div className="space-y-4">
				<DotStepper.Root>
					{Array.from({ length: totalSteps }).map((_, index) => (
						<DotStepper.Item
							key={index}
							active={index === activeStep}
							onClick={() => setActiveStep(index)}
						/>
					))}
				</DotStepper.Root>
				<p className="text-paragraph-sm text-text-sub-600 text-center">
					Step {activeStep + 1} of {totalSteps}
				</p>
			</div>
		)
	},
}

// With navigation
export const WithNavigation: Story = {
	render: function NavigationDemo() {
		const [activeStep, setActiveStep] = useState(0)
		const totalSteps = 4

		const goNext = () => {
			if (activeStep < totalSteps - 1) {
				setActiveStep(activeStep + 1)
			}
		}

		const goPrev = () => {
			if (activeStep > 0) {
				setActiveStep(activeStep - 1)
			}
		}

		return (
			<div className="flex items-center gap-6">
				<button
					onClick={goPrev}
					disabled={activeStep === 0}
					className="px-3 py-1.5 text-label-sm text-text-sub-600 hover:text-text-strong-950 disabled:opacity-50"
				>
					Prev
				</button>
				<DotStepper.Root>
					{Array.from({ length: totalSteps }).map((_, index) => (
						<DotStepper.Item
							key={index}
							active={index === activeStep}
							onClick={() => setActiveStep(index)}
						/>
					))}
				</DotStepper.Root>
				<button
					onClick={goNext}
					disabled={activeStep === totalSteps - 1}
					className="px-3 py-1.5 text-label-sm text-text-sub-600 hover:text-text-strong-950 disabled:opacity-50"
				>
					Next
				</button>
			</div>
		)
	},
}

// Multiple dots
export const MultipleDots: Story = {
	render: () => (
		<div className="space-y-4">
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">3 dots</p>
				<DotStepper.Root>
					<DotStepper.Item active />
					<DotStepper.Item />
					<DotStepper.Item />
				</DotStepper.Root>
			</div>
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">5 dots</p>
				<DotStepper.Root>
					<DotStepper.Item />
					<DotStepper.Item active />
					<DotStepper.Item />
					<DotStepper.Item />
					<DotStepper.Item />
				</DotStepper.Root>
			</div>
			<div>
				<p className="text-paragraph-xs text-text-soft-400 mb-2">7 dots</p>
				<DotStepper.Root>
					<DotStepper.Item />
					<DotStepper.Item />
					<DotStepper.Item />
					<DotStepper.Item active />
					<DotStepper.Item />
					<DotStepper.Item />
					<DotStepper.Item />
				</DotStepper.Root>
			</div>
		</div>
	),
}

// Onboarding carousel example
export const OnboardingCarouselExample: Story = {
	render: function OnboardingDemo() {
		const [currentSlide, setCurrentSlide] = useState(0)
		const slides = [
			{ title: "Welcome", description: "Get started with our platform" },
			{ title: "Create", description: "Build something amazing" },
			{ title: "Share", description: "Collaborate with your team" },
			{ title: "Launch", description: "Ship to production" },
		]

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl text-center">
				<div className="h-32 flex flex-col justify-center mb-6">
					<h3 className="text-heading-md text-text-strong-950 mb-2">{slides[currentSlide].title}</h3>
					<p className="text-paragraph-sm text-text-sub-600">{slides[currentSlide].description}</p>
				</div>
				<DotStepper.Root className="justify-center mb-6">
					{slides.map((_, index) => (
						<DotStepper.Item
							key={index}
							active={index === currentSlide}
							onClick={() => setCurrentSlide(index)}
						/>
					))}
				</DotStepper.Root>
				<div className="flex gap-3">
					<button
						onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
						disabled={currentSlide === 0}
						className="flex-1 px-4 py-2 border border-stroke-soft-200 rounded-lg text-label-sm disabled:opacity-50"
					>
						Back
					</button>
					<button
						onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
						disabled={currentSlide === slides.length - 1}
						className="flex-1 px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm disabled:opacity-50"
					>
						{currentSlide === slides.length - 1 ? "Done" : "Next"}
					</button>
				</div>
			</div>
		)
	},
}

// Image gallery example
export const ImageGalleryExample: Story = {
	render: function GalleryDemo() {
		const [activeImage, setActiveImage] = useState(0)
		const images = ["🏔️", "🌊", "🌅", "🏙️", "🌲"]

		return (
			<div className="w-64 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="aspect-square bg-bg-weak-50 flex items-center justify-center text-6xl">
					{images[activeImage]}
				</div>
				<div className="p-4 flex justify-center">
					<DotStepper.Root>
						{images.map((_, index) => (
							<DotStepper.Item
								key={index}
								active={index === activeImage}
								onClick={() => setActiveImage(index)}
							/>
						))}
					</DotStepper.Root>
				</div>
			</div>
		)
	},
}

// Testimonial slider example
export const TestimonialSliderExample: Story = {
	render: function TestimonialDemo() {
		const [activeIndex, setActiveIndex] = useState(0)
		const testimonials = [
			{ quote: "Amazing product! Changed our workflow completely.", author: "John D." },
			{ quote: "Best tool we've ever used for project management.", author: "Sarah M." },
			{ quote: "Highly recommend to any team looking to scale.", author: "Mike R." },
		]

		return (
			<div className="w-96 p-6 bg-bg-weak-50 rounded-xl">
				<div className="mb-6">
					<p className="text-paragraph-md text-text-strong-950 italic mb-4">
						"{testimonials[activeIndex].quote}"
					</p>
					<p className="text-label-sm text-text-sub-600">
						— {testimonials[activeIndex].author}
					</p>
				</div>
				<div className="flex justify-center">
					<DotStepper.Root>
						{testimonials.map((_, index) => (
							<DotStepper.Item
								key={index}
								active={index === activeIndex}
								onClick={() => setActiveIndex(index)}
							/>
						))}
					</DotStepper.Root>
				</div>
			</div>
		)
	},
}

// Form wizard example
export const FormWizardExample: Story = {
	render: function WizardDemo() {
		const [step, setStep] = useState(0)
		const steps = ["Account", "Profile", "Settings", "Review"]

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<div className="flex items-center justify-between mb-4">
					<p className="text-label-sm text-text-strong-950">{steps[step]}</p>
					<p className="text-paragraph-xs text-text-soft-400">
						Step {step + 1} of {steps.length}
					</p>
				</div>
				<div className="h-24 bg-bg-weak-50 rounded-lg mb-4 flex items-center justify-center">
					<p className="text-paragraph-sm text-text-sub-600">{steps[step]} form content</p>
				</div>
				<div className="flex justify-center mb-4">
					<DotStepper.Root>
						{steps.map((_, index) => (
							<DotStepper.Item
								key={index}
								active={index === step}
								onClick={() => setStep(index)}
							/>
						))}
					</DotStepper.Root>
				</div>
				<div className="flex gap-3">
					<button
						onClick={() => setStep(Math.max(0, step - 1))}
						disabled={step === 0}
						className="flex-1 px-4 py-2 border border-stroke-soft-200 rounded-lg text-label-sm disabled:opacity-50"
					>
						Back
					</button>
					<button
						onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
						className="flex-1 px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm"
					>
						{step === steps.length - 1 ? "Submit" : "Continue"}
					</button>
				</div>
			</div>
		)
	},
}

// Auto-play carousel example
export const AutoPlayCarouselExample: Story = {
	render: function AutoPlayDemo() {
		const [activeSlide, setActiveSlide] = useState(0)
		const totalSlides = 5

		// Note: In real implementation, you would use useEffect for auto-play
		// This is just a static representation

		return (
			<div className="w-72 p-4 bg-bg-white-0 border border-stroke-soft-200 rounded-xl">
				<div className="aspect-video bg-gradient-to-br from-primary-lighter to-primary-base rounded-lg mb-4 flex items-center justify-center">
					<span className="text-2xl text-white font-bold">{activeSlide + 1}</span>
				</div>
				<div className="flex justify-center">
					<DotStepper.Root size="xsmall">
						{Array.from({ length: totalSlides }).map((_, index) => (
							<DotStepper.Item
								key={index}
								active={index === activeSlide}
								onClick={() => setActiveSlide(index)}
							/>
						))}
					</DotStepper.Root>
				</div>
			</div>
		)
	},
}

// Modal pagination example
export const ModalPaginationExample: Story = {
	render: function ModalDemo() {
		const [page, setPage] = useState(0)
		const pages = [
			{ title: "Feature 1", content: "Discover our first amazing feature" },
			{ title: "Feature 2", content: "Learn about advanced capabilities" },
			{ title: "Feature 3", content: "See integration options" },
		]

		return (
			<div className="w-96 bg-bg-white-0 border border-stroke-soft-200 rounded-xl overflow-hidden">
				<div className="p-6 pb-4">
					<h3 className="text-heading-sm text-text-strong-950 mb-2">{pages[page].title}</h3>
					<p className="text-paragraph-sm text-text-sub-600">{pages[page].content}</p>
				</div>
				<div className="px-6 pb-6">
					<div className="flex items-center justify-between">
						<DotStepper.Root>
							{pages.map((_, index) => (
								<DotStepper.Item
									key={index}
									active={index === page}
									onClick={() => setPage(index)}
								/>
							))}
						</DotStepper.Root>
						<button
							onClick={() => setPage(Math.min(pages.length - 1, page + 1))}
							className="px-4 py-2 bg-primary-base text-white rounded-lg text-label-sm"
						>
							{page === pages.length - 1 ? "Got it" : "Next"}
						</button>
					</div>
				</div>
			</div>
		)
	},
}

// Size comparison
export const SizeComparison: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<div className="flex flex-col items-center gap-2">
				<DotStepper.Root size="small">
					<DotStepper.Item active />
					<DotStepper.Item />
					<DotStepper.Item />
				</DotStepper.Root>
				<span className="text-paragraph-xs text-text-soft-400">Small</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<DotStepper.Root size="xsmall">
					<DotStepper.Item active />
					<DotStepper.Item />
					<DotStepper.Item />
				</DotStepper.Root>
				<span className="text-paragraph-xs text-text-soft-400">XSmall</span>
			</div>
		</div>
	),
}
