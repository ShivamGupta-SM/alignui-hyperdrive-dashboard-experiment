// Shared types for form components
// This file defines common interfaces used across all form components for consistency

/**
 * Standard error props for form components
 * All form components should implement these props for consistent error handling
 *
 * @example
 * // In a form component:
 * interface MyInputProps extends FormErrorProps {
 *   value: string
 *   onChange: (value: string) => void
 * }
 *
 * // Usage:
 * <MyInput
 *   value={value}
 *   onChange={setValue}
 *   hasError={!!errors.field}
 *   errorId="field-error"
 * />
 * {errors.field && (
 *   <span id="field-error" role="alert">
 *     {errors.field.message}
 *   </span>
 * )}
 */
export interface FormErrorProps {
	/**
	 * Whether the form element has an error state
	 * When true, applies visual error styling (red borders, colors, etc.)
	 * Also sets aria-invalid="true" for accessibility
	 */
	hasError?: boolean

	/**
	 * ID of the error message element for aria-describedby
	 * This links the form element to its error message for screen readers
	 *
	 * @example
	 * <Input hasError={!!error} errorId="email-error" />
	 * {error && <span id="email-error">{error}</span>}
	 */
	errorId?: string
}

/**
 * Props for group components (CheckboxGroup, RadioGroup, SwitchGroup)
 * Extends FormErrorProps with additional group-specific props
 */
export interface FormGroupErrorProps extends FormErrorProps {
	/**
	 * Error message to display below the group
	 * Only shown when hasError is true
	 */
	errorMessage?: string
}
