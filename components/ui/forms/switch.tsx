// AlignUI Switch v0.4.0 - Enhanced with error states and accessibility
// Improvements: errorId prop, aria-describedby, enhanced error styling

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { tv, type VariantProps } from "@/lib/utils"

/** Shared props for switch error states */
export interface SwitchSharedProps {
	/** Whether the switch has an error state */
	hasError?: boolean
	/** ID of the error message element for aria-describedby */
	errorId?: string
}

const switchVariants = tv({
	slots: {
		root: [
			"group/switch relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2",
			"disabled:cursor-not-allowed disabled:opacity-50",
		],
		thumb: [
			"pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
		],
	},
	variants: {
		size: {
			sm: {
				root: "h-5 w-9",
				thumb: "size-4 translate-x-0.5 data-[state=checked]:translate-x-[18px]",
			},
			md: {
				root: "h-6 w-11",
				thumb: "size-5 translate-x-0.5 data-[state=checked]:translate-x-[22px]",
			},
			lg: {
				root: "h-7 w-14",
				thumb: "size-6 translate-x-0.5 data-[state=checked]:translate-x-[30px]",
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
})

export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> &
	VariantProps<typeof switchVariants> &
	SwitchSharedProps

/**
 * Switch - Toggle switch with error state support
 * @example
 * <Switch.Root
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 *   hasError={!!error}
 *   errorId="switch-error"
 * />
 * {error && <span id="switch-error">{error}</span>}
 */
const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitives.Root>, SwitchProps>(
	({ className, disabled, size, hasError, errorId, ...rest }, forwardedRef) => {
		const { root, thumb } = switchVariants({ size })

		return (
			<SwitchPrimitives.Root
				className={cn(
					root(),
					// Unchecked state
					"bg-bg-soft-200 data-[state=unchecked]:bg-bg-soft-200",
					// Checked state
					"data-[state=checked]:bg-primary-base",
					// Hover states
					"hover:data-[state=unchecked]:bg-bg-sub-300",
					"hover:data-[state=checked]:bg-primary-darker",
					// Error state
					hasError && [
						"ring-2 ring-error-base",
						"data-[state=checked]:bg-error-base",
						"hover:data-[state=checked]:bg-error-dark",
					],
					className
				)}
				ref={forwardedRef}
				disabled={disabled}
				aria-invalid={hasError || undefined}
				aria-describedby={errorId}
				{...rest}
			>
				<SwitchPrimitives.Thumb
					className={cn(
						thumb(),
						// Add slight scale animation on press
						"group-active/switch:scale-95",
						// Ensure vertical centering
						"mt-0.5"
					)}
				/>
			</SwitchPrimitives.Root>
		)
	}
)
Switch.displayName = SwitchPrimitives.Root.displayName

// ============================================
// Labeled Switch with description
// ============================================

export interface LabeledSwitchProps extends SwitchProps {
	/** Label text for the switch */
	label: string
	/** Optional description text */
	description?: string
	/** Position of the label relative to switch */
	labelPosition?: "left" | "right"
	/** Element ID (auto-generated if not provided) */
	id?: string
}

/**
 * LabeledSwitch - Switch with built-in label and optional description
 * @example
 * <LabeledSwitch
 *   checked={notifications}
 *   onCheckedChange={setNotifications}
 *   label="Enable notifications"
 *   description="Receive email updates"
 *   hasError={required && !notifications}
 *   errorId="notifications-error"
 * />
 */
function LabeledSwitch({
	label,
	description,
	labelPosition = "right",
	id,
	disabled,
	size = "md",
	hasError,
	errorId,
	className,
	...rest
}: LabeledSwitchProps) {
	const generatedId = React.useId()
	const descriptionId = React.useId()
	const switchId = id || generatedId

	const labelContent = (
		<div className="flex flex-col gap-0.5">
			<label
				htmlFor={switchId}
				className={cn(
					"text-label-sm cursor-pointer select-none",
					disabled && "cursor-not-allowed text-text-disabled-300",
					hasError ? "text-error-base" : "text-text-strong-950"
				)}
			>
				{label}
			</label>
			{description && (
				<span
					id={descriptionId}
					className={cn(
						"text-paragraph-xs text-text-sub-600",
						disabled && "text-text-disabled-300"
					)}
				>
					{description}
				</span>
			)}
		</div>
	)

	return (
		<div
			className={cn(
				"inline-flex items-center gap-3",
				labelPosition === "left" && "flex-row-reverse",
				className
			)}
		>
			<Switch
				id={switchId}
				disabled={disabled}
				size={size}
				hasError={hasError}
				errorId={errorId}
				aria-describedby={description ? descriptionId : errorId}
				{...rest}
			/>
			{labelContent}
		</div>
	)
}
LabeledSwitch.displayName = "LabeledSwitch"

// ============================================
// Switch Group for multiple switches
// ============================================

export interface SwitchGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
	/** Group label */
	label?: string
	/** Layout orientation */
	orientation?: "horizontal" | "vertical"
	/** Whether the group has an error */
	hasError?: boolean
	/** Error message to display */
	errorMessage?: string
	/** ID for the error message (auto-generated if not provided) */
	errorId?: string
}

/**
 * SwitchGroup - Container for multiple switches with error state support
 * @example
 * <SwitchGroup
 *   label="Notification Settings"
 *   hasError={!hasAnyEnabled}
 *   errorMessage="Enable at least one notification type"
 * >
 *   <LabeledSwitch label="Email" checked={email} onCheckedChange={setEmail} />
 *   <LabeledSwitch label="SMS" checked={sms} onCheckedChange={setSms} />
 * </SwitchGroup>
 */
function SwitchGroup({
	children,
	label,
	orientation = "vertical",
	hasError,
	errorMessage,
	errorId,
	className,
	...rest
}: SwitchGroupProps) {
	const generatedErrorId = React.useId()
	const actualErrorId = errorId || generatedErrorId

	return (
		<fieldset
			className={cn("flex flex-col gap-2 border-0 p-0 m-0", className)}
			aria-describedby={hasError && errorMessage ? actualErrorId : undefined}
			aria-invalid={hasError || undefined}
			{...rest}
		>
			{label && (
				<legend
					className={cn(
						"text-label-sm",
						hasError ? "text-error-base" : "text-text-strong-950"
					)}
				>
					{label}
				</legend>
			)}
			<div
				className={cn("flex gap-4", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap")}
			>
				{children}
			</div>
			{hasError && errorMessage && (
				<span id={actualErrorId} className="text-paragraph-xs text-error-base" role="alert">
					{errorMessage}
				</span>
			)}
		</fieldset>
	)
}
SwitchGroup.displayName = "SwitchGroup"

export { Switch as Root, LabeledSwitch, SwitchGroup, switchVariants }
