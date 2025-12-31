// AlignUI Radio v0.1.0 - Enhanced with error states and accessibility
// Improvements: hasError prop, aria-invalid, aria-describedby, errorId support

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "@/lib/utils"

/** Shared props for radio components */
export interface RadioSharedProps {
	/** Whether the radio group has an error */
	hasError?: boolean
	/** ID of the error message element for aria-describedby */
	errorId?: string
}

export interface RadioGroupProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
		RadioSharedProps {}

/**
 * RadioGroup - Container for radio items with error state support
 * @example
 * <Radio.Group
 *   value={selected}
 *   onValueChange={setSelected}
 *   hasError={!!error}
 *   errorId="selection-error"
 * >
 *   <Radio.Item value="option1" />
 *   <Radio.Item value="option2" />
 * </Radio.Group>
 * {error && <span id="selection-error">{error}</span>}
 */
const RadioGroup = React.forwardRef<
	React.ComponentRef<typeof RadioGroupPrimitive.Root>,
	RadioGroupProps
>(({ className, hasError, errorId, ...rest }, forwardedRef) => {
	return (
		<RadioGroupPrimitive.Root
			ref={forwardedRef}
			className={className}
			aria-invalid={hasError || undefined}
			aria-describedby={errorId}
			{...rest}
		/>
	)
})
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
		RadioSharedProps {}

/**
 * RadioGroupItem - Individual radio button with visual error indicator
 */
const RadioGroupItem = React.forwardRef<
	React.ComponentRef<typeof RadioGroupPrimitive.Item>,
	RadioGroupItemProps
>(({ className, hasError, ...rest }, forwardedRef) => {
	const filterId = React.useId()

	return (
		<RadioGroupPrimitive.Item
			ref={forwardedRef}
			className={cn(
				"group/radio relative size-5 shrink-0 outline-none focus:outline-none",
				// Focus ring
				"focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-base focus-visible:rounded-full",
				className
			)}
			{...rest}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={cn(["absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"])}
				aria-hidden="true"
			>
				<circle
					cx="10"
					cy="10"
					r="8"
					className={cn(
						"fill-bg-soft-200 transition duration-200 ease-out",
						// hover
						"group-hover/radio:fill-bg-sub-300",
						// focus
						"group-focus/radio:fill-primary-base",
						// disabled
						"group-disabled/radio:fill-bg-soft-200",
						// disabled checked
						"group-data-[state=checked]/radio:fill-bg-white-0",
						// error state
						hasError && "fill-error-lighter group-hover/radio:fill-error-light"
					)}
				/>
				<g filter={`url(#${filterId})`}>
					<circle
						cx="10"
						cy="10"
						r="6.5"
						className={cn(
							"fill-bg-white-0",
							// disabled
							"group-disabled/radio:hidden"
						)}
					/>
				</g>
				<defs>
					<filter
						id={filterId}
						x="1.5"
						y="3.5"
						width="17"
						height="17"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feOffset dy="2" />
						<feGaussianBlur stdDeviation="1" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0.105882 0 0 0 0 0.109804 0 0 0 0 0.113725 0 0 0 0.12 0"
						/>
						<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_515_4243" />
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="effect1_dropShadow_515_4243"
							result="shape"
						/>
					</filter>
				</defs>
			</svg>

			<RadioGroupPrimitive.Indicator asChild>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
					aria-hidden="true"
				>
					<circle
						cx="10"
						cy="10"
						r="6"
						strokeWidth="4"
						className={cn(
							"stroke-primary-base transition duration-200 ease-out",
							// hover
							"group-hover/radio:stroke-primary-darker",
							// focus
							"group-focus/radio:stroke-primary-dark",
							// disabled
							"group-disabled/radio:stroke-bg-soft-200",
							// error state
							hasError && "stroke-error-base group-hover/radio:stroke-error-dark"
						)}
					/>
				</svg>
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	)
})
RadioGroupItem.displayName = "RadioGroupItem"

// ============================================
// Labeled Radio Item with description
// ============================================

export interface LabeledRadioItemProps extends RadioGroupItemProps {
	/** Label text for the radio */
	label: string
	/** Optional description text */
	description?: string
}

/**
 * LabeledRadioItem - Radio with built-in label and optional description
 * @example
 * <Radio.LabeledItem
 *   value="option1"
 *   label="Option 1"
 *   description="This is the first option"
 * />
 */
const LabeledRadioItem = React.forwardRef<
	React.ComponentRef<typeof RadioGroupPrimitive.Item>,
	LabeledRadioItemProps
>(({ label, description, className, hasError, ...rest }, forwardedRef) => {
	const labelId = React.useId()
	const descriptionId = React.useId()

	return (
		<div className={cn("flex items-start gap-3", className)}>
			<RadioGroupItem
				ref={forwardedRef}
				hasError={hasError}
				aria-labelledby={labelId}
				aria-describedby={description ? descriptionId : undefined}
				{...rest}
			/>
			<div className="flex flex-col">
				<label
					id={labelId}
					htmlFor={rest.id}
					className={cn(
						"text-label-sm cursor-pointer",
						hasError ? "text-error-base" : "text-text-strong-950"
					)}
				>
					{label}
				</label>
				{description && (
					<span
						id={descriptionId}
						className="text-paragraph-xs text-text-sub-600 mt-0.5"
					>
						{description}
					</span>
				)}
			</div>
		</div>
	)
})
LabeledRadioItem.displayName = "LabeledRadioItem"

// ============================================
// Radio Card - Card-style radio option
// ============================================

export interface RadioCardProps extends RadioGroupItemProps {
	/** Label text */
	label: string
	/** Optional description */
	description?: string
	/** Optional icon */
	icon?: React.ReactNode
}

/**
 * RadioCard - Card-style radio option with icon support
 * @example
 * <Radio.Card
 *   value="plan1"
 *   label="Basic Plan"
 *   description="$10/month"
 *   icon={<Package />}
 * />
 */
const RadioCard = React.forwardRef<
	React.ComponentRef<typeof RadioGroupPrimitive.Item>,
	RadioCardProps
>(({ label, description, icon, className, hasError, value, ...rest }, forwardedRef) => {
	const radioId = React.useId()
	const itemId = rest.id || radioId

	return (
		<div
			className={cn(
				"flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
				"hover:bg-bg-weak-50",
				// Selected state via CSS - when radio inside is checked
				"has-[button[data-state=checked]]:border-primary-base has-[button[data-state=checked]]:bg-primary-alpha-10",
				// Error state
				hasError
					? "border-error-base"
					: "border-stroke-soft-200",
				className
			)}
			onClick={() => {
				// Click the radio button when clicking the card
				const radio = document.getElementById(itemId) as HTMLButtonElement | null
				radio?.click()
			}}
		>
			<RadioGroupItem
				ref={forwardedRef}
				id={itemId}
				value={value}
				hasError={hasError}
				className="mt-0.5"
				{...rest}
			/>
			{icon && (
				<div className="shrink-0 text-text-sub-600" aria-hidden="true">
					{icon}
				</div>
			)}
			<div className="flex flex-col flex-1 min-w-0">
				<label
					htmlFor={itemId}
					className={cn(
						"text-label-sm cursor-pointer",
						hasError ? "text-error-base" : "text-text-strong-950"
					)}
				>
					{label}
				</label>
				{description && (
					<span className="text-paragraph-xs text-text-sub-600 mt-0.5">
						{description}
					</span>
				)}
			</div>
		</div>
	)
})
RadioCard.displayName = "RadioCard"

export {
	RadioGroup as Group,
	RadioGroupItem as Item,
	LabeledRadioItem as LabeledItem,
	RadioCard as Card,
}
