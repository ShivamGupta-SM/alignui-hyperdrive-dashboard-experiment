import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Calendar } from "@/components/ui/forms/datepicker"
import type { DateRange } from "react-day-picker"

const meta: Meta<typeof Calendar> = {
	title: "Forms/Datepicker",
	component: Calendar,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Calendar>

// Basic calendar
export const Basic: Story = {
	render: function BasicCalendar() {
		const [date, setDate] = useState<Date | undefined>(new Date())
		return (
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
				<Calendar mode="single" selected={date} onSelect={setDate} />
			</div>
		)
	},
}

// Multiple selection
export const MultipleSelection: Story = {
	render: function MultipleCalendar() {
		const [dates, setDates] = useState<Date[] | undefined>([])
		return (
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
				<Calendar mode="multiple" selected={dates} onSelect={setDates} />
			</div>
		)
	},
}

// Range selection
export const RangeSelection: Story = {
	render: function RangeCalendar() {
		const [range, setRange] = useState<DateRange | undefined>({
			from: new Date(),
			to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		})
		return (
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
				<Calendar mode="range" selected={range} onSelect={setRange} />
			</div>
		)
	},
}

// Multiple months
export const MultipleMonths: Story = {
	render: function MultipleMonthsCalendar() {
		const [date, setDate] = useState<Date | undefined>(new Date())
		return (
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
				<Calendar mode="single" selected={date} onSelect={setDate} numberOfMonths={2} />
			</div>
		)
	},
}

// With disabled dates
export const WithDisabledDates: Story = {
	render: function DisabledDatesCalendar() {
		const [date, setDate] = useState<Date | undefined>(new Date())

		// Disable weekends and past dates
		const disabledDays = [
			{ dayOfWeek: [0, 6] }, // Disable weekends
			{ before: new Date() }, // Disable past dates
		]

		return (
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
				<Calendar mode="single" selected={date} onSelect={setDate} disabled={disabledDays} />
			</div>
		)
	},
}

// Hide outside days
export const HideOutsideDays: Story = {
	render: function HideOutsideDaysCalendar() {
		const [date, setDate] = useState<Date | undefined>(new Date())
		return (
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
				<Calendar mode="single" selected={date} onSelect={setDate} showOutsideDays={false} />
			</div>
		)
	},
}

// With footer
export const WithFooter: Story = {
	render: function FooterCalendar() {
		const [date, setDate] = useState<Date | undefined>(new Date())
		return (
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
				<Calendar
					mode="single"
					selected={date}
					onSelect={setDate}
					footer={
						<div className="border-t border-stroke-soft-200 p-4 text-center">
							<p className="text-paragraph-sm text-text-sub-600">
								{date ? `Selected: ${date.toLocaleDateString()}` : "Please pick a date"}
							</p>
						</div>
					}
				/>
			</div>
		)
	},
}

// Form example with input
export const FormExample: Story = {
	render: function FormExampleCalendar() {
		const [date, setDate] = useState<Date | undefined>(new Date())
		const [isOpen, setIsOpen] = useState(false)

		return (
			<div className="w-80 flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<label className="text-label-sm text-text-sub-600">Select Date</label>
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="w-full px-3 py-2.5 text-left rounded-lg border border-stroke-soft-200 text-paragraph-sm hover:border-stroke-sub-300 transition-colors"
					>
						{date ? date.toLocaleDateString() : "Pick a date"}
					</button>
				</div>
				{isOpen && (
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
						<Calendar
							mode="single"
							selected={date}
							onSelect={(newDate) => {
								setDate(newDate)
								setIsOpen(false)
							}}
						/>
					</div>
				)}
			</div>
		)
	},
}

// Range picker for booking
export const BookingExample: Story = {
	render: function BookingCalendar() {
		const [range, setRange] = useState<DateRange | undefined>()

		const formatRange = () => {
			if (!range?.from) return "Select check-in date"
			if (!range.to) return `Check-in: ${range.from.toLocaleDateString()}`
			return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
		}

		const nights =
			range?.from && range?.to
				? Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
				: 0

		return (
			<div className="flex flex-col gap-4">
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md">
					<Calendar
						mode="range"
						selected={range}
						onSelect={setRange}
						numberOfMonths={2}
						disabled={{ before: new Date() }}
					/>
				</div>
				<div className="p-4 rounded-lg bg-bg-weak-50">
					<p className="text-label-sm text-text-strong-950">{formatRange()}</p>
					{nights > 0 && <p className="text-paragraph-sm text-text-sub-600">{nights} nights</p>}
				</div>
			</div>
		)
	},
}
