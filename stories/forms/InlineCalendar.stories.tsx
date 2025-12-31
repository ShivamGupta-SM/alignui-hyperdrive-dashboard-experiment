import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { InlineCalendar } from "@/components/ui/forms/inline-calendar"

const meta: Meta<typeof InlineCalendar> = {
	title: "Forms/InlineCalendar",
	component: InlineCalendar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof InlineCalendar>

// Basic calendar
export const Basic: Story = {
	render: function BasicDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		return (
			<InlineCalendar
				value={date}
				onChange={setDate}
			/>
		)
	},
}

// Without default value
export const NoDefaultValue: Story = {
	render: function NoDefaultDemo() {
		const [date, setDate] = useState<Date | null>(null)
		return (
			<div className="flex flex-col gap-4">
				<InlineCalendar
					value={date}
					onChange={setDate}
				/>
				<p className="text-paragraph-sm text-text-sub-600 text-center">
					Selected: {date ? date.toLocaleDateString() : "None"}
				</p>
			</div>
		)
	},
}

// With input field
export const WithInput: Story = {
	render: function WithInputDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		return (
			<InlineCalendar
				value={date}
				onChange={setDate}
				showInput
			/>
		)
	},
}

// With today button
export const WithTodayButton: Story = {
	render: function WithTodayDemo() {
		const [date, setDate] = useState<Date | null>(null)
		return (
			<InlineCalendar
				value={date}
				onChange={setDate}
				showTodayButton
			/>
		)
	},
}

// With both input and today button
export const FullFeatures: Story = {
	render: function FullFeaturesDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		return (
			<InlineCalendar
				value={date}
				onChange={setDate}
				showInput
				showTodayButton
			/>
		)
	},
}

// With min date
export const WithMinDate: Story = {
	render: function MinDateDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		const minDate = new Date()
		minDate.setDate(minDate.getDate() - 7) // 7 days ago

		return (
			<div className="flex flex-col gap-4">
				<InlineCalendar
					value={date}
					onChange={setDate}
					minDate={minDate}
				/>
				<p className="text-paragraph-xs text-text-sub-600 text-center">
					Min date: {minDate.toLocaleDateString()}
				</p>
			</div>
		)
	},
}

// With max date
export const WithMaxDate: Story = {
	render: function MaxDateDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		const maxDate = new Date()
		maxDate.setDate(maxDate.getDate() + 30) // 30 days from now

		return (
			<div className="flex flex-col gap-4">
				<InlineCalendar
					value={date}
					onChange={setDate}
					maxDate={maxDate}
				/>
				<p className="text-paragraph-xs text-text-sub-600 text-center">
					Max date: {maxDate.toLocaleDateString()}
				</p>
			</div>
		)
	},
}

// With date range
export const WithDateRange: Story = {
	render: function DateRangeDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		const minDate = new Date()
		const maxDate = new Date()
		minDate.setDate(minDate.getDate() - 15)
		maxDate.setDate(maxDate.getDate() + 15)

		return (
			<div className="flex flex-col gap-4">
				<InlineCalendar
					value={date}
					onChange={setDate}
					minDate={minDate}
					maxDate={maxDate}
				/>
				<p className="text-paragraph-xs text-text-sub-600 text-center">
					Available: {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
				</p>
			</div>
		)
	},
}

// With highlighted dates
export const WithHighlightedDates: Story = {
	render: function HighlightedDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		const today = new Date()

		// Highlight some dates
		const highlightedDates = [
			new Date(today.getFullYear(), today.getMonth(), 5),
			new Date(today.getFullYear(), today.getMonth(), 12),
			new Date(today.getFullYear(), today.getMonth(), 18),
			new Date(today.getFullYear(), today.getMonth(), 25),
		]

		return (
			<div className="flex flex-col gap-4">
				<InlineCalendar
					value={date}
					onChange={setDate}
					highlightedDates={highlightedDates}
				/>
				<p className="text-paragraph-xs text-text-sub-600 text-center">
					Highlighted dates: 5th, 12th, 18th, 25th
				</p>
			</div>
		)
	},
}

// Booking calendar example
export const BookingCalendarExample: Story = {
	render: function BookingCalendarDemo() {
		const [date, setDate] = useState<Date | null>(null)
		const today = new Date()
		const maxDate = new Date()
		maxDate.setMonth(maxDate.getMonth() + 3)

		// Available dates (weekdays only, no past dates)
		const highlightedDates = Array.from({ length: 90 }, (_, i) => {
			const d = new Date(today)
			d.setDate(d.getDate() + i)
			return d
		}).filter(d => d.getDay() !== 0 && d.getDay() !== 6) // Exclude weekends

		return (
			<div className="p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-2">Book an Appointment</h3>
				<p className="text-paragraph-sm text-text-sub-600 mb-4">Select an available date</p>
				<InlineCalendar
					value={date}
					onChange={setDate}
					minDate={today}
					maxDate={maxDate}
					highlightedDates={highlightedDates}
					showTodayButton
				/>
				{date && (
					<div className="mt-4 p-3 bg-success-base/10 rounded-lg">
						<p className="text-label-sm text-success-base">
							Selected: {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
						</p>
					</div>
				)}
			</div>
		)
	},
}

// Event planner example
export const EventPlannerExample: Story = {
	render: function EventPlannerDemo() {
		const [date, setDate] = useState<Date | null>(new Date())
		const today = new Date()

		// Events on certain dates
		const eventDates = [
			new Date(today.getFullYear(), today.getMonth(), 8),
			new Date(today.getFullYear(), today.getMonth(), 15),
			new Date(today.getFullYear(), today.getMonth(), 22),
			new Date(today.getFullYear(), today.getMonth() + 1, 5),
		]

		const events = [
			{ date: 8, title: "Team Meeting" },
			{ date: 15, title: "Product Launch" },
			{ date: 22, title: "Quarterly Review" },
		]

		return (
			<div className="p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Event Calendar</h3>
				<InlineCalendar
					value={date}
					onChange={setDate}
					highlightedDates={eventDates}
					showInput
				/>
				<div className="mt-4 pt-4 border-t border-stroke-soft-200">
					<h4 className="text-label-sm text-text-strong-950 mb-2">Upcoming Events</h4>
					<div className="flex flex-col gap-2">
						{events.map((event) => (
							<div key={event.date} className="flex items-center gap-2">
								<div className="size-2 rounded-full bg-primary-base" />
								<span className="text-paragraph-sm text-text-sub-600">
									{event.date}th - {event.title}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	},
}

// Date picker form example
export const DatePickerFormExample: Story = {
	render: function DatePickerFormDemo() {
		const [startDate, setStartDate] = useState<Date | null>(null)
		const [endDate, setEndDate] = useState<Date | null>(null)

		return (
			<div className="p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Select Date Range</h3>
				<div className="grid grid-cols-2 gap-6">
					<div>
						<label className="text-label-sm text-text-strong-950 mb-2 block">Start Date</label>
						<InlineCalendar
							value={startDate}
							onChange={(date) => {
								setStartDate(date)
								if (endDate && date && date > endDate) {
									setEndDate(null)
								}
							}}
							maxDate={endDate || undefined}
							showTodayButton
						/>
					</div>
					<div>
						<label className="text-label-sm text-text-strong-950 mb-2 block">End Date</label>
						<InlineCalendar
							value={endDate}
							onChange={setEndDate}
							minDate={startDate || undefined}
							showTodayButton
						/>
					</div>
				</div>
				{startDate && endDate && (
					<div className="mt-4 p-3 bg-bg-weak-50 rounded-lg">
						<p className="text-paragraph-sm text-text-sub-600">
							Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
						</p>
					</div>
				)}
			</div>
		)
	},
}

// Birthday picker example
export const BirthdayPickerExample: Story = {
	render: function BirthdayPickerDemo() {
		const [date, setDate] = useState<Date | null>(null)
		const maxDate = new Date()
		maxDate.setFullYear(maxDate.getFullYear() - 13) // Must be at least 13 years old
		const minDate = new Date()
		minDate.setFullYear(minDate.getFullYear() - 120) // Max 120 years old

		return (
			<div className="p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-2">Date of Birth</h3>
				<p className="text-paragraph-sm text-text-sub-600 mb-4">You must be at least 13 years old</p>
				<InlineCalendar
					value={date}
					onChange={setDate}
					minDate={minDate}
					maxDate={maxDate}
					showInput
				/>
				{date && (
					<div className="mt-4">
						<p className="text-paragraph-sm text-text-sub-600">
							Age: {new Date().getFullYear() - date.getFullYear()} years old
						</p>
					</div>
				)}
			</div>
		)
	},
}

// Deadline picker example
export const DeadlinePickerExample: Story = {
	render: function DeadlinePickerDemo() {
		const [date, setDate] = useState<Date | null>(null)
		const today = new Date()

		const getDaysUntil = (targetDate: Date) => {
			const diff = targetDate.getTime() - today.getTime()
			return Math.ceil(diff / (1000 * 60 * 60 * 24))
		}

		return (
			<div className="p-6 border border-stroke-soft-200 rounded-xl w-80">
				<h3 className="text-label-md text-text-strong-950 mb-2">Set Deadline</h3>
				<p className="text-paragraph-sm text-text-sub-600 mb-4">Choose a future date</p>
				<InlineCalendar
					value={date}
					onChange={setDate}
					minDate={today}
					showInput
					showTodayButton
				/>
				{date && (
					<div className={`mt-4 p-3 rounded-lg ${
						getDaysUntil(date) <= 3
							? "bg-error-base/10"
							: getDaysUntil(date) <= 7
								? "bg-warning-base/10"
								: "bg-success-base/10"
					}`}>
						<p className={`text-label-sm ${
							getDaysUntil(date) <= 3
								? "text-error-base"
								: getDaysUntil(date) <= 7
									? "text-warning-base"
									: "text-success-base"
						}`}>
							{getDaysUntil(date)} days until deadline
						</p>
					</div>
				)}
			</div>
		)
	},
}
