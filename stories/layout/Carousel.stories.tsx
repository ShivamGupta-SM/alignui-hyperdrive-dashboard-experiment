import type { Meta, StoryObj } from "@storybook/react"
import {
	Root as CarouselRoot,
	Content as CarouselContent,
	Item as CarouselItem,
	PrevTrigger as CarouselPrevTrigger,
	NextTrigger as CarouselNextTrigger,
	Indicator as CarouselIndicator,
	IndicatorGroup as CarouselIndicatorGroup,
} from "@/components/ui/layout/carousel"

const meta: Meta<typeof CarouselRoot> = {
	title: "Layout/Carousel",
	component: CarouselRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof CarouselRoot>

// Basic carousel
export const Basic: Story = {
	render: () => (
		<div className="w-[500px]">
			<CarouselRoot>
				<CarouselContent>
					{[1, 2, 3, 4, 5].map((i) => (
						<CarouselItem key={i}>
							<div className="h-64 flex items-center justify-center bg-bg-weak-50 rounded-xl border border-stroke-soft-200">
								<span className="text-heading-lg text-text-strong-950">Slide {i}</span>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<div className="flex items-center justify-center gap-4 mt-4">
					<CarouselPrevTrigger />
					<CarouselIndicatorGroup>
						{({ index }) => <CarouselIndicator key={index} index={index} />}
					</CarouselIndicatorGroup>
					<CarouselNextTrigger />
				</div>
			</CarouselRoot>
		</div>
	),
}

// With images
export const WithImages: Story = {
	render: () => {
		const images = [
			"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
			"https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=800&h=400&fit=crop",
			"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop",
			"https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop",
		]

		return (
			<div className="w-[600px]">
				<CarouselRoot>
					<CarouselContent>
						{images.map((src, i) => (
							<CarouselItem key={i}>
								<img
									src={src}
									alt={`Landscape ${i + 1}`}
									className="w-full h-80 object-cover rounded-xl"
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<div className="flex items-center justify-between mt-4">
						<CarouselPrevTrigger />
						<CarouselIndicatorGroup>
							{({ index }) => <CarouselIndicator key={index} index={index} />}
						</CarouselIndicatorGroup>
						<CarouselNextTrigger />
					</div>
				</CarouselRoot>
			</div>
		)
	},
}

// Cards carousel
export const CardsCarousel: Story = {
	render: () => (
		<div className="w-[400px]">
			<CarouselRoot opts={{ align: "start" }}>
				<CarouselContent className="gap-4">
					{[1, 2, 3, 4].map((i) => (
						<CarouselItem key={i} className="basis-[85%]">
							<div className="p-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
								<div className="size-12 rounded-full bg-primary-lighter flex items-center justify-center mb-4">
									<span className="text-label-lg text-primary-base">0{i}</span>
								</div>
								<h3 className="text-label-lg text-text-strong-950 mb-2">Feature {i}</h3>
								<p className="text-paragraph-sm text-text-sub-600">
									This is a description of feature {i}. It explains what this feature does.
								</p>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<div className="flex items-center gap-2 mt-4">
					<CarouselPrevTrigger className="size-8" />
					<CarouselNextTrigger className="size-8" />
				</div>
			</CarouselRoot>
		</div>
	),
}

// Testimonials carousel
export const TestimonialsCarousel: Story = {
	render: () => {
		const testimonials = [
			{
				quote: "This product has completely transformed how we work. Highly recommended!",
				author: "Sarah Johnson",
				role: "CEO, TechCorp",
				avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
			},
			{
				quote: "The best investment we've made this year. Our productivity increased by 50%.",
				author: "Michael Chen",
				role: "CTO, StartupXYZ",
				avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
			},
			{
				quote: "Outstanding customer support and amazing features. Five stars!",
				author: "Emily Davis",
				role: "Product Manager, BigCo",
				avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
			},
		]

		return (
			<div className="w-[500px]">
				<CarouselRoot>
					<CarouselContent>
						{testimonials.map((testimonial, i) => (
							<CarouselItem key={i}>
								<div className="p-8 rounded-xl bg-bg-weak-50 text-center">
									<p className="text-paragraph-md text-text-strong-950 mb-6 italic">
										&ldquo;{testimonial.quote}&rdquo;
									</p>
									<img
										src={testimonial.avatar}
										alt={testimonial.author}
										className="size-12 rounded-full mx-auto mb-3 object-cover"
									/>
									<p className="text-label-sm text-text-strong-950">{testimonial.author}</p>
									<p className="text-paragraph-xs text-text-sub-600">{testimonial.role}</p>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<div className="flex justify-center mt-4">
						<CarouselIndicatorGroup>
							{({ index }) => <CarouselIndicator key={index} index={index} />}
						</CarouselIndicatorGroup>
					</div>
				</CarouselRoot>
			</div>
		)
	},
}

// Navigation with arrows only
export const ArrowsOnly: Story = {
	render: () => (
		<div className="w-[500px] relative">
			<CarouselRoot>
				<CarouselContent>
					{[1, 2, 3, 4, 5].map((i) => (
						<CarouselItem key={i}>
							<div className="h-64 flex items-center justify-center bg-gradient-to-br from-primary-lighter to-primary-base rounded-xl">
								<span className="text-heading-lg text-static-white">Slide {i}</span>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevTrigger className="absolute left-4 top-1/2 -translate-y-1/2" />
				<CarouselNextTrigger className="absolute right-4 top-1/2 -translate-y-1/2" />
			</CarouselRoot>
		</div>
	),
}

// Indicators only
export const IndicatorsOnly: Story = {
	render: () => (
		<div className="w-[500px]">
			<CarouselRoot>
				<CarouselContent>
					{[1, 2, 3, 4, 5].map((i) => (
						<CarouselItem key={i}>
							<div className="h-64 flex items-center justify-center bg-bg-soft-200 rounded-xl">
								<span className="text-heading-lg text-text-strong-950">Slide {i}</span>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<div className="flex justify-center mt-4">
					<CarouselIndicatorGroup>
						{({ index }) => <CarouselIndicator key={index} index={index} />}
					</CarouselIndicatorGroup>
				</div>
			</CarouselRoot>
		</div>
	),
}

// Product showcase
export const ProductShowcase: Story = {
	render: () => {
		const products = [
			{
				name: "Wireless Headphones",
				price: "$199",
				image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
			},
			{
				name: "Smart Watch",
				price: "$299",
				image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
			},
			{
				name: "Laptop Stand",
				price: "$79",
				image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
			},
			{
				name: "Desk Lamp",
				price: "$49",
				image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
			},
		]

		return (
			<div className="w-[350px]">
				<CarouselRoot opts={{ loop: true }}>
					<CarouselContent>
						{products.map((product, i) => (
							<CarouselItem key={i}>
								<div className="p-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
									<img
										src={product.image}
										alt={product.name}
										className="w-full h-48 object-cover rounded-lg mb-4"
									/>
									<h3 className="text-label-md text-text-strong-950">{product.name}</h3>
									<p className="text-heading-sm text-primary-base">{product.price}</p>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<div className="flex items-center justify-between mt-4">
						<CarouselPrevTrigger className="size-8" />
						<CarouselIndicatorGroup>
							{({ index }) => <CarouselIndicator key={index} index={index} />}
						</CarouselIndicatorGroup>
						<CarouselNextTrigger className="size-8" />
					</div>
				</CarouselRoot>
			</div>
		)
	},
}

// Looping carousel
export const LoopingCarousel: Story = {
	render: () => (
		<div className="w-[500px]">
			<CarouselRoot opts={{ loop: true }}>
				<CarouselContent>
					{[1, 2, 3].map((i) => (
						<CarouselItem key={i}>
							<div className="h-64 flex items-center justify-center bg-gradient-to-r from-feature-lighter to-feature-base rounded-xl">
								<span className="text-heading-lg text-static-white">Slide {i} (Loops)</span>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<div className="flex items-center justify-center gap-4 mt-4">
					<CarouselPrevTrigger />
					<CarouselIndicatorGroup>
						{({ index }) => <CarouselIndicator key={index} index={index} />}
					</CarouselIndicatorGroup>
					<CarouselNextTrigger />
				</div>
			</CarouselRoot>
		</div>
	),
}
