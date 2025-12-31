"use client"

/**
 * FormField - Compound component for form field layouts
 *
 * Provides proper accessibility by:
 * - Generating unique IDs for input and error elements
 * - Passing these IDs to children via React context
 * - Ensuring label is properly associated with input via htmlFor
 * - Ensuring error message is linked via aria-describedby
 *
 * @example
 * <FormField label="Email" required error={errors.email}>
 *   {({ inputId, errorId, hasError }) => (
 *     <Input.Root hasError={hasError} errorId={errorId}>
 *       <Input.Wrapper>
 *         <Input.El id={inputId} type="email" />
 *       </Input.Wrapper>
 *     </Input.Root>
 *   )}
 * </FormField>
 *
 * // Or with simple string children (less accessible, but works)
 * <FormField label="Name" hint="Enter your full name">
 *   <Input.Root>
 *     <Input.Wrapper>
 *       <Input.El />
 *     </Input.Wrapper>
 *   </Input.Root>
 * </FormField>
 */

import * as React from "react"
import * as Label from "@/components/ui/forms/label"
import * as Hint from "@/components/ui/feedback/hint"
import { cn } from "@/lib/utils"

// Context for passing IDs to children
interface FormFieldContextValue {
	/** ID to use on the input element */
	inputId: string
	/** ID of the error message element (for aria-describedby) */
	errorId: string
	/** Whether the field has an error */
	hasError: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

/**
 * Hook to access form field context
 * Use this in custom input components to get proper IDs
 */
export function useFormField() {
	const context = React.useContext(FormFieldContext)
	if (!context) {
		// Return defaults if not within FormField - allows standalone usage
		return {
			inputId: undefined,
			errorId: undefined,
			hasError: false,
		}
	}
	return context
}

interface FormFieldProps {
	/** Label text for the field */
	label: string
	/** Whether the field is required */
	required?: boolean
	/** Error message to display */
	error?: string
	/** Hint text to display (shown when no error) */
	hint?: string
	/** Additional class name for the wrapper */
	className?: string
	/** Render prop or React node children */
	children: React.ReactNode | ((context: FormFieldContextValue) => React.ReactNode)
}

export function FormField({ label, required, error, hint, className, children }: FormFieldProps) {
	const generatedId = React.useId()
	const inputId = `field-${generatedId}`
	const errorId = `error-${generatedId}`
	const hintId = `hint-${generatedId}`
	const hasError = !!error

	const contextValue: FormFieldContextValue = {
		inputId,
		errorId,
		hasError,
	}

	// Support both render prop and regular children
	const renderedChildren = typeof children === "function" ? children(contextValue) : children

	return (
		<FormFieldContext.Provider value={contextValue}>
			<div className={cn("space-y-1.5", className)}>
				<Label.Root htmlFor={inputId}>
					{label}
					{required && <Label.Asterisk />}
				</Label.Root>
				{renderedChildren}
				{error && (
					<Hint.Root id={errorId} hasError role="alert">
						{error}
					</Hint.Root>
				)}
				{hint && !error && (
					<Hint.Root id={hintId}>
						{hint}
					</Hint.Root>
				)}
			</div>
		</FormFieldContext.Provider>
	)
}

/**
 * FormFieldGroup - Container for grouping multiple form fields
 */
interface FormFieldGroupProps {
	/** Group label */
	legend?: string
	/** Group description */
	description?: string
	/** Whether the group has an error */
	hasError?: boolean
	/** Error message for the group */
	errorMessage?: string
	/** Additional class name */
	className?: string
	/** Children */
	children: React.ReactNode
}

export function FormFieldGroup({
	legend,
	description,
	hasError,
	errorMessage,
	className,
	children,
}: FormFieldGroupProps) {
	const errorId = React.useId()
	const descId = React.useId()

	return (
		<fieldset
			className={cn("space-y-4 border-0 p-0 m-0", className)}
			aria-describedby={cn(
				description ? descId : undefined,
				hasError && errorMessage ? errorId : undefined
			) || undefined}
			aria-invalid={hasError || undefined}
		>
			{(legend || description) && (
				<div className="space-y-1">
					{legend && (
						<legend className={cn(
							"text-label-md text-text-strong-950",
							hasError && "text-error-base"
						)}>
							{legend}
						</legend>
					)}
					{description && (
						<p id={descId} className="text-paragraph-sm text-text-sub-600">
							{description}
						</p>
					)}
				</div>
			)}
			<div className="space-y-4">
				{children}
			</div>
			{hasError && errorMessage && (
				<Hint.Root id={errorId} hasError role="alert">
					{errorMessage}
				</Hint.Root>
			)}
		</fieldset>
	)
}
