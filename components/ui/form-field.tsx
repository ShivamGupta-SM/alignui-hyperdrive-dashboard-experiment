"use client"

import * as React from "react"
import * as Label from "@/components/ui/label"
import * as Hint from "@/components/ui/hint"

interface FormFieldProps {
	label: string
	required?: boolean
	error?: string
	hint?: string
	children: React.ReactNode
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
	const id = React.useId()
	return (
		<div className="space-y-1.5">
			<Label.Root htmlFor={id}>
				{label}
				{required && <Label.Asterisk />}
			</Label.Root>
			<div id={id}>{children}</div>
			{error && <Hint.Root hasError>{error}</Hint.Root>}
			{hint && !error && <Hint.Root>{hint}</Hint.Root>}
		</div>
	)
}
