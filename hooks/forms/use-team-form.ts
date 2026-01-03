"use client"

/**
 * useTeamForm - Shared hook for team create/edit forms
 *
 * ✅ FIX Bug 27: Extracts duplicated team form logic
 * Used by: CreateTeamModal, EditTeamModal in teams-management.tsx
 *
 * @example
 * ```tsx
 * const { name, setName, description, setDescription, ... } = useTeamForm()
 * const { name, setName, ... } = useTeamForm({ initialName: team.name })
 * ```
 */

import { useState, useMemo, useCallback } from "react"
import { z } from "zod"

// Zod schema for validation
const teamFormSchema = z.object({
	name: z.string().min(1, "Team name is required").max(100, "Team name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
	department: z.string().max(100, "Department name is too long").optional(),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
	icon: z.string().max(2, "Icon must be 1-2 characters").optional(),
	slackChannel: z.string().max(100, "Slack channel name is too long").optional(),
})

interface UseTeamFormOptions {
	/** Initial name value */
	initialName?: string
	/** Initial description value */
	initialDescription?: string
	/** Initial department value */
	initialDepartment?: string
	/** Initial color value (hex) */
	initialColor?: string
	/** Initial icon value (emoji) */
	initialIcon?: string
	/** Initial slack channel value */
	initialSlackChannel?: string
}

interface TeamMetadata {
	description?: string
	department?: string
	color?: string
	icon?: string
	slackChannel?: string
}

interface UseTeamFormReturn {
	// Field values
	name: string
	setName: (value: string) => void
	description: string
	setDescription: (value: string) => void
	department: string
	setDepartment: (value: string) => void
	color: string
	setColor: (value: string) => void
	icon: string
	setIcon: (value: string) => void
	slackChannel: string
	setSlackChannel: (value: string) => void
	// Validation
	isValid: boolean
	nameError: string | null
	// Actions
	reset: () => void
	getFormData: () => { name: string; metadata?: TeamMetadata }
}

export function useTeamForm(options: UseTeamFormOptions = {}): UseTeamFormReturn {
	const {
		initialName = "",
		initialDescription = "",
		initialDepartment = "",
		initialColor = "#6366F1",
		initialIcon = "",
		initialSlackChannel = "",
	} = options

	const [name, setName] = useState(initialName)
	const [description, setDescription] = useState(initialDescription)
	const [department, setDepartment] = useState(initialDepartment)
	const [color, setColor] = useState(initialColor)
	const [icon, setIcon] = useState(initialIcon)
	const [slackChannel, setSlackChannel] = useState(initialSlackChannel)

	const { isValid, nameError } = useMemo(() => {
		if (!name) {
			return { isValid: false, nameError: null }
		}

		const result = teamFormSchema.safeParse({
			name,
			description: description || undefined,
			department: department || undefined,
			color: color || undefined,
			icon: icon || undefined,
			slackChannel: slackChannel || undefined,
		})

		if (!result.success) {
			const nameIssue = result.error.issues.find((i) => i.path[0] === "name")
			return {
				isValid: false,
				nameError: nameIssue?.message ?? null,
			}
		}

		return { isValid: true, nameError: null }
	}, [name, description, department, color, icon, slackChannel])

	const reset = useCallback(() => {
		setName(initialName)
		setDescription(initialDescription)
		setDepartment(initialDepartment)
		setColor(initialColor)
		setIcon(initialIcon)
		setSlackChannel(initialSlackChannel)
	}, [initialName, initialDescription, initialDepartment, initialColor, initialIcon, initialSlackChannel])

	const getFormData = useCallback(() => {
		return {
			name,
			metadata: {
				description: description || undefined,
				department: department || undefined,
				color: color || undefined,
				icon: icon || undefined,
				slackChannel: slackChannel || undefined,
			},
		}
	}, [name, description, department, color, icon, slackChannel])

	return {
		name,
		setName,
		description,
		setDescription,
		department,
		setDepartment,
		color,
		setColor,
		icon,
		setIcon,
		slackChannel,
		setSlackChannel,
		isValid,
		nameError,
		reset,
		getFormData,
	}
}

export type { UseTeamFormOptions, UseTeamFormReturn, TeamMetadata }
