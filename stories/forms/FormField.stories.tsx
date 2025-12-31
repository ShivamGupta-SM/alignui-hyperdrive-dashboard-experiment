import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { FormField } from "@/components/ui/forms/form-field"
import { ButtonRoot } from "@/components/ui/primitives"

const meta: Meta<typeof FormField> = {
	title: "Forms/FormField",
	component: FormField,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof FormField>

// Basic form field
export const Basic: Story = {
	render: () => (
		<div className="w-80">
			<FormField label="Email">
				<input
					type="email"
					placeholder="you@example.com"
					className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
			</FormField>
		</div>
	),
}

// Required field
export const Required: Story = {
	render: () => (
		<div className="w-80">
			<FormField label="Full Name" required>
				<input
					type="text"
					placeholder="John Doe"
					className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
			</FormField>
		</div>
	),
}

// With hint
export const WithHint: Story = {
	render: () => (
		<div className="w-80">
			<FormField label="Password" required hint="Must be at least 8 characters">
				<input
					type="password"
					placeholder="Enter password"
					className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
				/>
			</FormField>
		</div>
	),
}

// With error
export const WithError: Story = {
	render: () => (
		<div className="w-80">
			<FormField label="Email" required error="Please enter a valid email address">
				<input
					type="email"
					value="invalid-email"
					className="w-full px-3 py-2 rounded-lg border border-error-base text-paragraph-sm"
					readOnly
				/>
			</FormField>
		</div>
	),
}

// Error takes priority over hint
export const ErrorOverHint: Story = {
	render: () => (
		<div className="w-80">
			<FormField
				label="Username"
				required
				hint="Only letters and numbers allowed"
				error="Username must be at least 3 characters"
			>
				<input
					type="text"
					value="ab"
					className="w-full px-3 py-2 rounded-lg border border-error-base text-paragraph-sm"
					readOnly
				/>
			</FormField>
		</div>
	),
}

// With textarea
export const WithTextarea: Story = {
	render: () => (
		<div className="w-80">
			<FormField label="Description" hint="Maximum 500 characters">
				<textarea
					placeholder="Tell us about yourself..."
					rows={4}
					className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm resize-none"
				/>
			</FormField>
		</div>
	),
}

// With select
export const WithSelect: Story = {
	render: () => (
		<div className="w-80">
			<FormField label="Country" required>
				<select className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm bg-bg-white-0">
					<option value="">Select a country</option>
					<option value="us">United States</option>
					<option value="uk">United Kingdom</option>
					<option value="in">India</option>
					<option value="de">Germany</option>
				</select>
			</FormField>
		</div>
	),
}

// Interactive validation example
export const InteractiveValidation: Story = {
	render: function InteractiveValidationDemo() {
		const [email, setEmail] = useState("")
		const [touched, setTouched] = useState(false)

		const validateEmail = (email: string) => {
			if (!email) return "Email is required"
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email"
			return undefined
		}

		const error = touched ? validateEmail(email) : undefined

		return (
			<div className="w-80">
				<FormField label="Email" required error={error}>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onBlur={() => setTouched(true)}
						placeholder="you@example.com"
						className={`w-full px-3 py-2 rounded-lg border text-paragraph-sm ${
							error ? "border-error-base" : "border-stroke-soft-200"
						}`}
					/>
				</FormField>
			</div>
		)
	},
}

// Registration form example
export const RegistrationFormExample: Story = {
	render: function RegistrationFormDemo() {
		const [formData, setFormData] = useState({
			firstName: "",
			lastName: "",
			email: "",
			password: "",
		})
		const [errors, setErrors] = useState<Record<string, string>>({})

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault()
			const newErrors: Record<string, string> = {}

			if (!formData.firstName) newErrors.firstName = "First name is required"
			if (!formData.lastName) newErrors.lastName = "Last name is required"
			if (!formData.email) newErrors.email = "Email is required"
			else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
				newErrors.email = "Please enter a valid email"
			if (!formData.password) newErrors.password = "Password is required"
			else if (formData.password.length < 8)
				newErrors.password = "Password must be at least 8 characters"

			setErrors(newErrors)
		}

		return (
			<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
				<h2 className="text-heading-sm text-text-strong-950 mb-6">Create Account</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField label="First Name" required error={errors.firstName}>
							<input
								type="text"
								value={formData.firstName}
								onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
								className={`w-full px-3 py-2 rounded-lg border text-paragraph-sm ${
									errors.firstName ? "border-error-base" : "border-stroke-soft-200"
								}`}
							/>
						</FormField>
						<FormField label="Last Name" required error={errors.lastName}>
							<input
								type="text"
								value={formData.lastName}
								onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
								className={`w-full px-3 py-2 rounded-lg border text-paragraph-sm ${
									errors.lastName ? "border-error-base" : "border-stroke-soft-200"
								}`}
							/>
						</FormField>
					</div>
					<FormField label="Email" required error={errors.email}>
						<input
							type="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className={`w-full px-3 py-2 rounded-lg border text-paragraph-sm ${
								errors.email ? "border-error-base" : "border-stroke-soft-200"
							}`}
						/>
					</FormField>
					<FormField
						label="Password"
						required
						error={errors.password}
						hint={!errors.password ? "Min. 8 characters with uppercase and number" : undefined}
					>
						<input
							type="password"
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							className={`w-full px-3 py-2 rounded-lg border text-paragraph-sm ${
								errors.password ? "border-error-base" : "border-stroke-soft-200"
							}`}
						/>
					</FormField>
					<ButtonRoot type="submit" variant="primary" className="w-full">
						Create Account
					</ButtonRoot>
				</form>
			</div>
		)
	},
}

// Contact form example
export const ContactFormExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 mb-2">Contact Us</h2>
			<p className="text-paragraph-sm text-text-sub-600 mb-6">
				We&apos;ll get back to you within 24 hours.
			</p>
			<form className="space-y-4">
				<FormField label="Name" required>
					<input
						type="text"
						placeholder="Your name"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</FormField>
				<FormField label="Email" required>
					<input
						type="email"
						placeholder="you@example.com"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</FormField>
				<FormField label="Subject">
					<select className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm bg-bg-white-0">
						<option value="">Select a topic</option>
						<option value="general">General Inquiry</option>
						<option value="support">Technical Support</option>
						<option value="billing">Billing Question</option>
						<option value="other">Other</option>
					</select>
				</FormField>
				<FormField label="Message" required hint="Be as detailed as possible">
					<textarea
						placeholder="How can we help?"
						rows={4}
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm resize-none"
					/>
				</FormField>
				<ButtonRoot type="submit" variant="primary" className="w-full">
					Send Message
				</ButtonRoot>
			</form>
		</div>
	),
}

// Profile settings example
export const ProfileSettingsExample: Story = {
	render: () => (
		<div className="w-96 p-6 border border-stroke-soft-200 rounded-xl">
			<h2 className="text-heading-sm text-text-strong-950 mb-6">Profile Settings</h2>
			<form className="space-y-6">
				<div className="flex items-center gap-4 pb-6 border-b border-stroke-soft-200">
					<div className="size-16 rounded-full bg-primary-base flex items-center justify-center text-static-white text-heading-sm">
						JD
					</div>
					<div>
						<ButtonRoot variant="basic" size="small">
							Change Photo
						</ButtonRoot>
					</div>
				</div>
				<FormField label="Display Name" required hint="This will be visible to other users">
					<input
						type="text"
						defaultValue="John Doe"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</FormField>
				<FormField label="Username" required>
					<input
						type="text"
						defaultValue="johndoe"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</FormField>
				<FormField label="Bio" hint="Write a short description about yourself">
					<textarea
						defaultValue="Software developer based in San Francisco"
						rows={3}
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm resize-none"
					/>
				</FormField>
				<FormField label="Website">
					<input
						type="url"
						placeholder="https://example.com"
						className="w-full px-3 py-2 rounded-lg border border-stroke-soft-200 text-paragraph-sm"
					/>
				</FormField>
				<div className="flex gap-3 pt-4">
					<ButtonRoot variant="basic" className="flex-1">
						Cancel
					</ButtonRoot>
					<ButtonRoot variant="primary" className="flex-1">
						Save Changes
					</ButtonRoot>
				</div>
			</form>
		</div>
	),
}
