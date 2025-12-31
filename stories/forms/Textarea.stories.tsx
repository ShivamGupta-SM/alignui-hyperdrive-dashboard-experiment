import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Root as TextareaRoot, CharCounter, AutoResizeTextarea } from "@/components/ui/forms/textarea"

const meta: Meta<typeof TextareaRoot> = {
	title: "Forms/Textarea",
	component: TextareaRoot,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof TextareaRoot>

// Basic textarea
export const Basic: Story = {
	render: function BasicTextarea() {
		const [value, setValue] = useState("")
		return (
			<div className="w-80">
				<TextareaRoot
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Enter your message..."
				/>
			</div>
		)
	},
}

// Simple variant
export const Simple: Story = {
	render: function SimpleTextarea() {
		const [value, setValue] = useState("")
		return (
			<div className="w-80">
				<TextareaRoot
					simple
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Simple textarea without container..."
				/>
			</div>
		)
	},
}

// With character counter
export const WithCharCounter: Story = {
	render: function CharCounterTextarea() {
		const [value, setValue] = useState("")
		const maxLength = 200

		return (
			<div className="w-80">
				<TextareaRoot
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Type your message..."
				>
					<CharCounter current={value.length} max={maxLength} />
				</TextareaRoot>
			</div>
		)
	},
}

// With error
export const WithError: Story = {
	render: function ErrorTextarea() {
		const [value, setValue] = useState("")
		const hasError = value.length === 0

		return (
			<div className="w-80 flex flex-col gap-2">
				<TextareaRoot
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Required field..."
					hasError={hasError}
					errorId="textarea-error"
				/>
				{hasError && (
					<span id="textarea-error" className="text-error-base text-sm">
						This field is required
					</span>
				)}
			</div>
		)
	},
}

// Disabled
export const Disabled: Story = {
	render: () => (
		<div className="w-80">
			<TextareaRoot
				disabled
				placeholder="Disabled textarea..."
				defaultValue="This textarea is disabled"
			/>
		</div>
	),
}

// Auto-resize textarea
export const AutoResize: Story = {
	render: function AutoResizeStory() {
		const [value, setValue] = useState("")

		return (
			<div className="w-80">
				<AutoResizeTextarea
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="This textarea grows with content..."
					minRows={2}
					maxRows={6}
				/>
			</div>
		)
	},
}

// Exceeding max length
export const ExceedingMax: Story = {
	render: function ExceedingMaxStory() {
		const [value, setValue] = useState(
			"This is a long text that exceeds the maximum character limit. The counter will turn red to indicate an error state."
		)
		const maxLength = 50

		return (
			<div className="w-80">
				<TextareaRoot
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Type your message..."
					hasError={value.length > maxLength}
				>
					<CharCounter current={value.length} max={maxLength} />
				</TextareaRoot>
			</div>
		)
	},
}

// Form example
export const FormExample: Story = {
	render: function FormExampleStory() {
		const [description, setDescription] = useState("")
		const [notes, setNotes] = useState("")

		return (
			<div className="w-96 p-6 rounded-xl bg-bg-white-0 shadow-regular-md flex flex-col gap-4">
				<h3 className="text-label-lg text-text-strong-950">Feedback Form</h3>
				<div className="flex flex-col gap-2">
					<label className="text-label-sm text-text-sub-600">Description</label>
					<TextareaRoot
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe your issue..."
					>
						<CharCounter current={description.length} max={500} />
					</TextareaRoot>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-label-sm text-text-sub-600">Additional Notes</label>
					<AutoResizeTextarea
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Any additional notes..."
						minRows={2}
						maxRows={4}
					/>
				</div>
			</div>
		)
	},
}
