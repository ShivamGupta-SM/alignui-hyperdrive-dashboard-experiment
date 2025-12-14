"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import * as Button from "@/components/ui/button"
import * as Input from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { Building, Info } from "@phosphor-icons/react/dist/ssr"
import { z } from "zod"
import { createBasicOrganization } from "@/app/actions/organizations"

const simpleOrgSchema = z.object({
	name: z
		.string()
		.min(1, "Organization name is required")
		.min(2, "Organization name must be at least 2 characters")
		.max(100, "Organization name must be less than 100 characters"),
})

type SimpleOrgFormData = z.infer<typeof simpleOrgSchema>

export function SimpleOnboarding() {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SimpleOrgFormData>({
		resolver: zodResolver(simpleOrgSchema),
		defaultValues: {
			name: "",
		},
	})

	const onSubmit = async (data: SimpleOrgFormData) => {
		setIsLoading(true)
		try {
			const result = await createBasicOrganization(data.name)

			if (!result.success) {
				throw new Error(result.error || "Failed to create organization")
			}

			toast.success("Organization created successfully!")
			router.push("/dashboard")
			router.refresh()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create organization")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-lg">
				{/* Header */}
				<div className="mb-6 sm:mb-8 text-center">
					<div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary-base to-primary-darker mx-auto mb-4 shadow-md">
						<Building weight="duotone" className="size-7 sm:size-8 text-white" />
					</div>
					<h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">
						Create Your Organization
					</h1>
					<p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
						Get started by creating your organization. You can add more details later in settings.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
					<FormField label="Organization Name" required error={errors.name?.message}>
						<Input.Root hasError={!!errors.name}>
							<Input.Wrapper>
								<Input.El
									{...register("name")}
									placeholder="e.g., Acme Corporation"
									autoFocus
									aria-invalid={!!errors.name}
									aria-describedby={errors.name ? "name-error" : undefined}
								/>
							</Input.Wrapper>
						</Input.Root>
						{errors.name && (
							<p id="name-error" className="mt-2 text-paragraph-xs text-error-base" role="alert">
								{errors.name.message}
							</p>
						)}
					</FormField>

					{/* Info Note */}
					<div className="flex items-start gap-3 p-4 rounded-xl bg-information-lighter/50 ring-1 ring-inset ring-information-base/20">
						<Info weight="fill" className="size-5 text-information-base shrink-0 mt-0.5" />
						<div className="text-paragraph-sm text-text-sub-600">
							<strong className="text-information-base">Note:</strong> You can add business details,
							GST verification, and other information later in Settings.
						</div>
					</div>

					<Button.Root type="submit" variant="primary" className="w-full h-11" disabled={isLoading}>
						{isLoading ? "Creating..." : "Create Organization"}
					</Button.Root>
				</form>
			</div>
		</div>
	)
}
