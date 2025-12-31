import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { parseColor, Color } from "react-aria-components"
import {
	Root as ColorPicker,
	Area as ColorArea,
	Slider as ColorSlider,
	SliderTrack,
	Thumb as ColorThumb,
	SwatchPicker as ColorSwatchPicker,
	SwatchPickerItem as ColorSwatchPickerItem,
	Swatch as ColorSwatch,
	EyeDropperButton,
} from "@/components/ui/forms/color-picker"
import { Eyedropper } from "@phosphor-icons/react"

const meta: Meta = {
	title: "Forms/ColorPicker",
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj

// Basic color picker
export const Basic: Story = {
	render: function BasicColorPicker() {
		const [color, setColor] = useState(parseColor("hsl(220, 90%, 50%)"))

		return (
			<div className="w-64">
				<ColorPicker value={color} onChange={setColor}>
					<ColorArea xChannel="saturation" yChannel="lightness">
						<ColorThumb />
					</ColorArea>
					<div className="mt-4 space-y-2">
						<ColorSlider channel="hue">
							<SliderTrack>
								<ColorThumb />
							</SliderTrack>
						</ColorSlider>
					</div>
				</ColorPicker>
				<div className="mt-4 flex items-center gap-2">
					<div
						className="size-8 rounded-lg border border-stroke-soft-200"
						style={{ backgroundColor: color.toString("css") }}
					/>
					<span className="text-paragraph-sm text-text-sub-600">{color.toString("hex")}</span>
				</div>
			</div>
		)
	},
}

// With alpha channel
export const WithAlpha: Story = {
	render: function WithAlphaColorPicker() {
		const [color, setColor] = useState(parseColor("hsla(220, 90%, 50%, 0.8)"))

		return (
			<div className="w-64">
				<ColorPicker value={color} onChange={setColor}>
					<ColorArea xChannel="saturation" yChannel="lightness">
						<ColorThumb />
					</ColorArea>
					<div className="mt-4 space-y-2">
						<ColorSlider channel="hue">
							<SliderTrack>
								<ColorThumb />
							</SliderTrack>
						</ColorSlider>
						<ColorSlider channel="alpha">
							<SliderTrack>
								<ColorThumb />
							</SliderTrack>
						</ColorSlider>
					</div>
				</ColorPicker>
				<div className="mt-4 flex items-center gap-2">
					<div
						className="size-8 rounded-lg border border-stroke-soft-200"
						style={{ backgroundColor: color.toString("css") }}
					/>
					<span className="text-paragraph-sm text-text-sub-600">{color.toString("hexa")}</span>
				</div>
			</div>
		)
	},
}

// Swatch picker
export const SwatchPickerExample: Story = {
	render: function SwatchPickerStory() {
		const [color, setColor] = useState(parseColor("#3b82f6"))

		const presetColors = [
			"#ef4444",
			"#f97316",
			"#eab308",
			"#22c55e",
			"#14b8a6",
			"#3b82f6",
			"#8b5cf6",
			"#ec4899",
			"#6b7280",
			"#000000",
		]

		return (
			<div className="w-64">
				<ColorPicker value={color} onChange={setColor}>
					<ColorSwatchPicker>
						{presetColors.map((c) => (
							<ColorSwatchPickerItem key={c} color={c}>
								<ColorSwatch />
							</ColorSwatchPickerItem>
						))}
					</ColorSwatchPicker>
				</ColorPicker>
				<div className="mt-4 flex items-center gap-2">
					<div
						className="size-8 rounded-lg border border-stroke-soft-200"
						style={{ backgroundColor: color.toString("css") }}
					/>
					<span className="text-paragraph-sm text-text-sub-600">{color.toString("hex")}</span>
				</div>
			</div>
		)
	},
}

// Full color picker
export const FullColorPicker: Story = {
	render: function FullColorPickerStory() {
		const [color, setColor] = useState(parseColor("hsl(220, 90%, 50%)"))

		const presetColors = [
			"#ef4444",
			"#f97316",
			"#eab308",
			"#22c55e",
			"#14b8a6",
			"#3b82f6",
			"#8b5cf6",
			"#ec4899",
		]

		return (
			<div className="w-72 p-4 border border-stroke-soft-200 rounded-xl">
				<ColorPicker value={color} onChange={setColor}>
					<ColorArea xChannel="saturation" yChannel="lightness">
						<ColorThumb />
					</ColorArea>
					<div className="mt-4 space-y-2">
						<ColorSlider channel="hue">
							<SliderTrack>
								<ColorThumb />
							</SliderTrack>
						</ColorSlider>
						<ColorSlider channel="alpha">
							<SliderTrack>
								<ColorThumb />
							</SliderTrack>
						</ColorSlider>
					</div>
					<div className="mt-4 pt-4 border-t border-stroke-soft-200">
						<p className="text-label-xs text-text-sub-600 mb-2">Preset colors</p>
						<ColorSwatchPicker>
							{presetColors.map((c) => (
								<ColorSwatchPickerItem key={c} color={c}>
									<ColorSwatch />
								</ColorSwatchPickerItem>
							))}
						</ColorSwatchPicker>
					</div>
				</ColorPicker>
				<div className="mt-4 pt-4 border-t border-stroke-soft-200 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className="size-10 rounded-lg border border-stroke-soft-200"
							style={{ backgroundColor: color.toString("css") }}
						/>
						<div>
							<p className="text-label-sm text-text-strong-950">{color.toString("hex")}</p>
							<p className="text-paragraph-xs text-text-sub-600">
								{Math.round(color.getChannelValue("alpha") * 100)}% opacity
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	},
}

// With eye dropper
export const WithEyeDropper: Story = {
	render: function WithEyeDropperStory() {
		const [color, setColor] = useState(parseColor("hsl(220, 90%, 50%)"))

		return (
			<div className="w-72 p-4 border border-stroke-soft-200 rounded-xl">
				<ColorPicker value={color} onChange={setColor}>
					<ColorArea xChannel="saturation" yChannel="lightness">
						<ColorThumb />
					</ColorArea>
					<div className="mt-4">
						<ColorSlider channel="hue">
							<SliderTrack>
								<ColorThumb />
							</SliderTrack>
						</ColorSlider>
					</div>
					<div className="mt-4 flex items-center gap-2">
						<div
							className="size-10 rounded-lg border border-stroke-soft-200"
							style={{ backgroundColor: color.toString("css") }}
						/>
						<input
							type="text"
							value={color.toString("hex")}
							readOnly
							className="flex-1 px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm font-mono"
						/>
						<EyeDropperButton className="p-2 rounded-lg border border-stroke-soft-200 hover:bg-bg-weak-50 transition-colors">
							<Eyedropper className="size-5 text-text-sub-600" />
						</EyeDropperButton>
					</div>
				</ColorPicker>
			</div>
		)
	},
}

// Brand colors example
export const BrandColorsExample: Story = {
	render: function BrandColorsStory() {
		const [primaryColor, setPrimaryColor] = useState(parseColor("#3b82f6"))
		const [secondaryColor, setSecondaryColor] = useState(parseColor("#8b5cf6"))

		const presetColors = [
			"#ef4444",
			"#f97316",
			"#eab308",
			"#22c55e",
			"#3b82f6",
			"#8b5cf6",
		]

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Brand Colors</h3>
				<div className="space-y-6">
					<div>
						<label className="text-label-sm text-text-sub-600 mb-2 block">Primary Color</label>
						<ColorPicker value={primaryColor} onChange={setPrimaryColor}>
							<div className="flex items-center gap-2">
								<div
									className="size-10 rounded-lg border border-stroke-soft-200"
									style={{ backgroundColor: primaryColor.toString("css") }}
								/>
								<ColorSwatchPicker className="flex-1">
									{presetColors.map((c) => (
										<ColorSwatchPickerItem key={c} color={c}>
											<ColorSwatch />
										</ColorSwatchPickerItem>
									))}
								</ColorSwatchPicker>
							</div>
						</ColorPicker>
					</div>
					<div>
						<label className="text-label-sm text-text-sub-600 mb-2 block">Secondary Color</label>
						<ColorPicker value={secondaryColor} onChange={setSecondaryColor}>
							<div className="flex items-center gap-2">
								<div
									className="size-10 rounded-lg border border-stroke-soft-200"
									style={{ backgroundColor: secondaryColor.toString("css") }}
								/>
								<ColorSwatchPicker className="flex-1">
									{presetColors.map((c) => (
										<ColorSwatchPickerItem key={c} color={c}>
											<ColorSwatch />
										</ColorSwatchPickerItem>
									))}
								</ColorSwatchPicker>
							</div>
						</ColorPicker>
					</div>
				</div>
				<div className="mt-6 pt-4 border-t border-stroke-soft-200">
					<p className="text-label-xs text-text-sub-600 mb-2">Preview</p>
					<div
						className="h-20 rounded-lg flex items-center justify-center"
						style={{
							background: `linear-gradient(135deg, ${primaryColor.toString("css")}, ${secondaryColor.toString("css")})`,
						}}
					>
						<span className="text-static-white text-label-md">Your Brand</span>
					</div>
				</div>
			</div>
		)
	},
}

// Compact color picker
export const CompactColorPicker: Story = {
	render: function CompactColorPickerStory() {
		const [color, setColor] = useState(parseColor("#3b82f6"))

		const presetColors = [
			"#ef4444",
			"#f97316",
			"#eab308",
			"#22c55e",
			"#14b8a6",
			"#3b82f6",
			"#8b5cf6",
			"#ec4899",
			"#6b7280",
			"#000000",
			"#ffffff",
		]

		return (
			<div className="flex items-center gap-3">
				<ColorPicker value={color} onChange={setColor}>
					<ColorSwatchPicker className="gap-1.5">
						{presetColors.map((c) => (
							<ColorSwatchPickerItem key={c} color={c}>
								<ColorSwatch className="size-6" />
							</ColorSwatchPickerItem>
						))}
					</ColorSwatchPicker>
				</ColorPicker>
			</div>
		)
	},
}

// Form integration example
export const FormIntegration: Story = {
	render: function FormIntegrationStory() {
		const [backgroundColor, setBackgroundColor] = useState(parseColor("#ffffff"))
		const [textColor, setTextColor] = useState(parseColor("#1f2937"))

		const presetBgColors = ["#ffffff", "#f3f4f6", "#e5e7eb", "#1f2937", "#111827", "#000000"]
		const presetTextColors = ["#1f2937", "#374151", "#6b7280", "#ffffff", "#f3f4f6"]

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Appearance Settings</h3>
				<div className="space-y-4">
					<div>
						<label className="text-label-sm text-text-sub-600 mb-2 block">Background</label>
						<div className="flex items-center gap-2 p-2 border border-stroke-soft-200 rounded-lg">
							<ColorPicker value={backgroundColor} onChange={setBackgroundColor}>
								<div className="flex items-center gap-2">
									<div
										className="size-8 rounded border border-stroke-soft-200"
										style={{ backgroundColor: backgroundColor.toString("css") }}
									/>
									<ColorSwatchPicker className="gap-1">
										{presetBgColors.map((c) => (
											<ColorSwatchPickerItem key={c} color={c}>
												<ColorSwatch className="size-5" />
											</ColorSwatchPickerItem>
										))}
									</ColorSwatchPicker>
								</div>
							</ColorPicker>
						</div>
					</div>
					<div>
						<label className="text-label-sm text-text-sub-600 mb-2 block">Text Color</label>
						<div className="flex items-center gap-2 p-2 border border-stroke-soft-200 rounded-lg">
							<ColorPicker value={textColor} onChange={setTextColor}>
								<div className="flex items-center gap-2">
									<div
										className="size-8 rounded border border-stroke-soft-200"
										style={{ backgroundColor: textColor.toString("css") }}
									/>
									<ColorSwatchPicker className="gap-1">
										{presetTextColors.map((c) => (
											<ColorSwatchPickerItem key={c} color={c}>
												<ColorSwatch className="size-5" />
											</ColorSwatchPickerItem>
										))}
									</ColorSwatchPicker>
								</div>
							</ColorPicker>
						</div>
					</div>
				</div>
				<div className="mt-6 pt-4 border-t border-stroke-soft-200">
					<p className="text-label-xs text-text-sub-600 mb-2">Preview</p>
					<div
						className="p-4 rounded-lg"
						style={{
							backgroundColor: backgroundColor.toString("css"),
							color: textColor.toString("css"),
						}}
					>
						<p className="text-label-md">Sample Text</p>
						<p className="text-paragraph-sm">This is how your text will look.</p>
					</div>
				</div>
			</div>
		)
	},
}
