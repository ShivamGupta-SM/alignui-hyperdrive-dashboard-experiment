import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Root as SliderRoot, Thumb as SliderThumb, LabeledSlider, RangeSlider, MarkedSlider } from "@/components/ui/forms/slider"

const meta: Meta<typeof SliderRoot> = {
	title: "Forms/Slider",
	component: SliderRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof SliderRoot>

// Basic slider
export const Basic: Story = {
	render: function BasicSlider() {
		const [value, setValue] = useState([50])
		return (
			<div className="w-80">
				<SliderRoot value={value} onValueChange={setValue}>
					<SliderThumb />
				</SliderRoot>
			</div>
		)
	},
}

// Sizes
export const Sizes: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Small</span>
				<SliderRoot defaultValue={[30]} size="sm">
					<SliderThumb size="sm" />
				</SliderRoot>
			</div>
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Medium</span>
				<SliderRoot defaultValue={[50]} size="md">
					<SliderThumb size="md" />
				</SliderRoot>
			</div>
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Large</span>
				<SliderRoot defaultValue={[70]} size="lg">
					<SliderThumb size="lg" />
				</SliderRoot>
			</div>
		</div>
	),
}

// Colors
export const Colors: Story = {
	render: () => (
		<div className="w-80 flex flex-col gap-6">
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Primary</span>
				<SliderRoot defaultValue={[60]} color="primary">
					<SliderThumb color="primary" />
				</SliderRoot>
			</div>
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Blue</span>
				<SliderRoot defaultValue={[60]} color="blue">
					<SliderThumb color="blue" />
				</SliderRoot>
			</div>
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Green</span>
				<SliderRoot defaultValue={[60]} color="green">
					<SliderThumb color="green" />
				</SliderRoot>
			</div>
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Orange</span>
				<SliderRoot defaultValue={[60]} color="orange">
					<SliderThumb color="orange" />
				</SliderRoot>
			</div>
			<div>
				<span className="text-xs text-text-sub-600 mb-2 block">Red</span>
				<SliderRoot defaultValue={[60]} color="red">
					<SliderThumb color="red" />
				</SliderRoot>
			</div>
		</div>
	),
}

// Labeled slider
export const Labeled: Story = {
	render: function LabeledSliderStory() {
		const [value, setValue] = useState([50])
		return (
			<div className="w-80">
				<LabeledSlider
					label="Volume"
					value={value}
					onValueChange={setValue}
					color="primary"
				/>
			</div>
		)
	},
}

// With custom value format
export const CustomFormat: Story = {
	render: function CustomFormatSlider() {
		const [value, setValue] = useState([75])
		return (
			<div className="w-80">
				<LabeledSlider
					label="Opacity"
					value={value}
					onValueChange={setValue}
					formatValue={(v) => `${v}%`}
					color="blue"
				/>
			</div>
		)
	},
}

// Range slider
export const Range: Story = {
	render: function RangeSliderStory() {
		const [value, setValue] = useState<[number, number]>([25, 75])
		return (
			<div className="w-80">
				<RangeSlider
					label="Price Range"
					value={value}
					onValueChange={(v) => setValue(v as [number, number])}
					formatValue={(v) => `$${v}`}
					color="green"
				/>
			</div>
		)
	},
}

// Marked slider
export const Marked: Story = {
	render: function MarkedSliderStory() {
		const [value, setValue] = useState([50])
		return (
			<div className="w-80">
				<MarkedSlider
					label="Temperature"
					value={value}
					onValueChange={setValue}
					marks={[
						{ value: 0, label: "0°" },
						{ value: 25, label: "25°" },
						{ value: 50, label: "50°" },
						{ value: 75, label: "75°" },
						{ value: 100, label: "100°" },
					]}
					color="orange"
				/>
			</div>
		)
	},
}

// Step slider
export const WithSteps: Story = {
	render: function StepSlider() {
		const [value, setValue] = useState([50])
		return (
			<div className="w-80">
				<LabeledSlider
					label="Quality"
					value={value}
					onValueChange={setValue}
					step={25}
					color="primary"
				/>
			</div>
		)
	},
}

// Disabled slider
export const Disabled: Story = {
	render: () => (
		<div className="w-80">
			<SliderRoot defaultValue={[50]} disabled className="opacity-50">
				<SliderThumb />
			</SliderRoot>
		</div>
	),
}

// Form example
export const FormExample: Story = {
	render: function FormExampleStory() {
		const [volume, setVolume] = useState([75])
		const [brightness, setBrightness] = useState([50])
		const [price, setPrice] = useState<[number, number]>([20, 80])

		return (
			<div className="w-96 p-6 bg-bg-white-0 rounded-xl shadow-regular-md flex flex-col gap-6">
				<h3 className="text-heading-sm text-text-strong-950">Settings</h3>
				<LabeledSlider
					label="Volume"
					value={volume}
					onValueChange={setVolume}
					formatValue={(v) => `${v}%`}
					color="primary"
				/>
				<LabeledSlider
					label="Brightness"
					value={brightness}
					onValueChange={setBrightness}
					formatValue={(v) => `${v}%`}
					color="orange"
				/>
				<RangeSlider
					label="Price Filter"
					value={price}
					onValueChange={(v) => setPrice(v as [number, number])}
					formatValue={(v) => `$${v}`}
					color="green"
				/>
			</div>
		)
	},
}
