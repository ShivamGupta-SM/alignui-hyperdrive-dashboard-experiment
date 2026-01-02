import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import {
	CurrencyInput,
	CurrencyDisplay,
	NumberInput,
	PercentageInput,
} from "@/components/ui/forms/currency-input"

const meta: Meta<typeof CurrencyInput> = {
	title: "Forms/CurrencyInput",
	component: CurrencyInput,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		currency: {
			control: "select",
			options: ["INR", "USD", "EUR"],
		},
		size: {
			control: "select",
			options: ["xsmall", "small", "medium"],
		},
	},
}

export default meta
type Story = StoryObj<typeof CurrencyInput>

// Basic currency input
export const Basic: Story = {
	render: function BasicCurrencyInput() {
		const [value, setValue] = useState<number | null>(1234.56)

		return (
			<div className="w-64">
				<CurrencyInput value={value} onValueChange={setValue} />
				<p className="mt-2 text-paragraph-xs text-text-sub-600">Value: {value ?? "null"}</p>
			</div>
		)
	},
}

// All currencies
export const Currencies: Story = {
	render: function CurrenciesDemo() {
		const [inrValue, setInrValue] = useState<number | null>(125000)
		const [usdValue, setUsdValue] = useState<number | null>(1500)
		const [eurValue, setEurValue] = useState<number | null>(1350)

		return (
			<div className="w-64 flex flex-col gap-4">
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">Indian Rupee (INR)</label>
					<CurrencyInput value={inrValue} onValueChange={setInrValue} currency="INR" />
				</div>
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">US Dollar (USD)</label>
					<CurrencyInput value={usdValue} onValueChange={setUsdValue} currency="USD" />
				</div>
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">Euro (EUR)</label>
					<CurrencyInput value={eurValue} onValueChange={setEurValue} currency="EUR" />
				</div>
			</div>
		)
	},
}

// All sizes - aligned with Input/Select: xsmall (h-8), small (h-9), medium (h-10)
export const Sizes: Story = {
	render: function SizesDemo() {
		const [value, setValue] = useState<number | null>(50000)

		return (
			<div className="w-64 flex flex-col gap-4">
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">XSmall (h-8)</label>
					<CurrencyInput value={value} onValueChange={setValue} size="xsmall" />
				</div>
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">Small (h-9)</label>
					<CurrencyInput value={value} onValueChange={setValue} size="small" />
				</div>
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">Medium (h-10, default)</label>
					<CurrencyInput value={value} onValueChange={setValue} size="medium" />
				</div>
			</div>
		)
	},
}

// Error state
export const ErrorState: Story = {
	render: function ErrorStateDemo() {
		const [value, setValue] = useState<number | null>(null)

		return (
			<div className="w-64">
				<label className="text-label-sm text-text-sub-600 mb-1.5 block">Amount *</label>
				<CurrencyInput value={value} onValueChange={setValue} error placeholder="Enter amount" />
				<p className="mt-1.5 text-paragraph-xs text-error-base">Amount is required</p>
			</div>
		)
	},
}

// Disabled state
export const DisabledState: Story = {
	render: () => (
		<div className="w-64">
			<label className="text-label-sm text-text-sub-600 mb-1.5 block">Fixed Amount</label>
			<CurrencyInput value={10000} disabled />
		</div>
	),
}

// Currency display
export const CurrencyDisplayExamples: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div>
				<p className="text-label-sm text-text-sub-600 mb-2">Full format</p>
				<div className="flex gap-4">
					<CurrencyDisplay value={1234567} currency="INR" className="text-heading-sm text-text-strong-950" />
					<CurrencyDisplay value={1234567} currency="USD" className="text-heading-sm text-text-strong-950" />
					<CurrencyDisplay value={1234567} currency="EUR" className="text-heading-sm text-text-strong-950" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-sub-600 mb-2">Compact format (INR)</p>
				<div className="flex gap-4">
					<CurrencyDisplay value={1500} currency="INR" compact className="text-heading-sm text-text-strong-950" />
					<CurrencyDisplay value={250000} currency="INR" compact className="text-heading-sm text-text-strong-950" />
					<CurrencyDisplay value={15000000} currency="INR" compact className="text-heading-sm text-text-strong-950" />
				</div>
			</div>
			<div>
				<p className="text-label-sm text-text-sub-600 mb-2">Compact format (USD)</p>
				<div className="flex gap-4">
					<CurrencyDisplay value={1500} currency="USD" compact className="text-heading-sm text-text-strong-950" />
					<CurrencyDisplay value={250000} currency="USD" compact className="text-heading-sm text-text-strong-950" />
					<CurrencyDisplay value={1500000} currency="USD" compact className="text-heading-sm text-text-strong-950" />
				</div>
			</div>
		</div>
	),
}

// Number input
export const NumberInputExample: Story = {
	render: function NumberInputDemo() {
		const [quantity, setQuantity] = useState<number | null>(1500)

		return (
			<div className="w-64 flex flex-col gap-4">
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">Quantity</label>
					<NumberInput value={quantity} onValueChange={setQuantity} />
				</div>
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">With suffix</label>
					<NumberInput value={quantity} onValueChange={setQuantity} suffix="units" />
				</div>
			</div>
		)
	},
}

// Percentage input
export const PercentageInputExample: Story = {
	render: function PercentageInputDemo() {
		const [discount, setDiscount] = useState<number | null>(15)
		const [rate, setRate] = useState<number | null>(8.5)

		return (
			<div className="w-64 flex flex-col gap-4">
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">Discount</label>
					<PercentageInput value={discount} onValueChange={setDiscount} />
				</div>
				<div>
					<label className="text-label-sm text-text-sub-600 mb-1.5 block">Interest Rate (with decimals)</label>
					<PercentageInput value={rate} onValueChange={setRate} allowDecimals />
				</div>
			</div>
		)
	},
}

// Invoice form example
export const InvoiceFormExample: Story = {
	render: function InvoiceFormDemo() {
		const [subtotal, setSubtotal] = useState<number | null>(50000)
		const [discount, setDiscount] = useState<number | null>(10)
		const [tax, setTax] = useState<number | null>(18)

		const discountAmount = subtotal && discount ? (subtotal * discount) / 100 : 0
		const afterDiscount = (subtotal || 0) - discountAmount
		const taxAmount = afterDiscount * ((tax || 0) / 100)
		const total = afterDiscount + taxAmount

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Invoice Calculator</h3>
				<div className="space-y-4">
					<div>
						<label className="text-label-sm text-text-sub-600 mb-1.5 block">Subtotal</label>
						<CurrencyInput value={subtotal} onValueChange={setSubtotal} currency="INR" />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-label-sm text-text-sub-600 mb-1.5 block">Discount</label>
							<PercentageInput value={discount} onValueChange={setDiscount} />
						</div>
						<div>
							<label className="text-label-sm text-text-sub-600 mb-1.5 block">GST</label>
							<PercentageInput value={tax} onValueChange={setTax} />
						</div>
					</div>
				</div>
				<div className="mt-6 pt-4 border-t border-stroke-soft-200 space-y-2">
					<div className="flex justify-between text-paragraph-sm">
						<span className="text-text-sub-600">Subtotal</span>
						<CurrencyDisplay value={subtotal || 0} currency="INR" />
					</div>
					<div className="flex justify-between text-paragraph-sm">
						<span className="text-text-sub-600">Discount ({discount || 0}%)</span>
						<span className="text-error-base">- <CurrencyDisplay value={discountAmount} currency="INR" /></span>
					</div>
					<div className="flex justify-between text-paragraph-sm">
						<span className="text-text-sub-600">GST ({tax || 0}%)</span>
						<CurrencyDisplay value={taxAmount} currency="INR" />
					</div>
					<div className="flex justify-between text-label-md pt-2 border-t border-stroke-soft-200">
						<span className="text-text-strong-950">Total</span>
						<CurrencyDisplay value={total} currency="INR" className="text-text-strong-950" />
					</div>
				</div>
			</div>
		)
	},
}

// Product pricing example
export const ProductPricingExample: Story = {
	render: function ProductPricingDemo() {
		const [mrp, setMrp] = useState<number | null>(2999)
		const [sellingPrice, setSellingPrice] = useState<number | null>(1999)

		const discount = mrp && sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0

		return (
			<div className="w-80 p-6 border border-stroke-soft-200 rounded-xl">
				<h3 className="text-label-md text-text-strong-950 mb-4">Product Pricing</h3>
				<div className="space-y-4">
					<div>
						<label className="text-label-sm text-text-sub-600 mb-1.5 block">MRP</label>
						<CurrencyInput value={mrp} onValueChange={setMrp} currency="INR" />
					</div>
					<div>
						<label className="text-label-sm text-text-sub-600 mb-1.5 block">Selling Price</label>
						<CurrencyInput value={sellingPrice} onValueChange={setSellingPrice} currency="INR" />
					</div>
				</div>
				<div className="mt-4 p-4 bg-success-lighter rounded-lg">
					<p className="text-label-sm text-success-base">Discount: {discount}% off</p>
					{mrp && sellingPrice && (
						<p className="text-paragraph-xs text-text-sub-600 mt-1">
							Customer saves <CurrencyDisplay value={mrp - sellingPrice} currency="INR" />
						</p>
					)}
				</div>
			</div>
		)
	},
}

// Stats cards with currency display
export const StatCardsExample: Story = {
	render: () => (
		<div className="grid grid-cols-3 gap-4">
			<div className="p-4 border border-stroke-soft-200 rounded-xl">
				<p className="text-paragraph-sm text-text-sub-600 mb-1">Today&apos;s Sales</p>
				<CurrencyDisplay value={125000} currency="INR" compact className="text-title-h4 text-text-strong-950" />
				<p className="text-paragraph-xs text-success-base mt-1">+12% vs yesterday</p>
			</div>
			<div className="p-4 border border-stroke-soft-200 rounded-xl">
				<p className="text-paragraph-sm text-text-sub-600 mb-1">Monthly Revenue</p>
				<CurrencyDisplay value={4500000} currency="INR" compact className="text-title-h4 text-text-strong-950" />
				<p className="text-paragraph-xs text-success-base mt-1">+8% vs last month</p>
			</div>
			<div className="p-4 border border-stroke-soft-200 rounded-xl">
				<p className="text-paragraph-sm text-text-sub-600 mb-1">Average Order</p>
				<CurrencyDisplay value={2850} currency="INR" className="text-title-h4 text-text-strong-950" />
				<p className="text-paragraph-xs text-error-base mt-1">-3% vs last month</p>
			</div>
		</div>
	),
}
