"use client"

/**
 * useInviteMemberForm - Shared hook for team member invitation forms
 *
 * ✅ FIX Bug 27: Extracts duplicated invitation form logic
 * Used by: InviteTeamMemberModal, TeamSubPanel
 *
 * @example
 * ```tsx
 * const { email, setEmail, role, setRole, isValid, reset, getFormData } = useInviteMemberForm()
 * ```
 */

import { useState, useMemo, useCallback } from "react"
import { z } from "zod"

// Zod schema for validation
const inviteMemberSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	role: z.enum(["admin", "manager", "member", "viewer"]),
})

type InviteMemberRole = "admin" | "manager" | "member" | "viewer"

interface UseInviteMemberFormOptions {
	/** Default role (default: "viewer") */
	defaultRole?: InviteMemberRole
	/** Initial email value */
	initialEmail?: string
}

interface UseInviteMemberFormReturn {
	/** Current email value */
	email: string
	/** Set email value */
	setEmail: (value: string) => void
	/** Current role value */
	role: InviteMemberRole
	/** Set role value */
	setRole: (value: InviteMemberRole) => void
	/** Whether form is valid */
	isValid: boolean
	/** Email validation error */
	emailError: string | null
	/** Reset form to initial state */
	reset: () => void
	/** Get form data for submission */
	getFormData: () => { email: string; role: InviteMemberRole }
}

export function useInviteMemberForm(options: UseInviteMemberFormOptions = {}): UseInviteMemberFormReturn {
	const { defaultRole = "viewer", initialEmail = "" } = options

	const [email, setEmail] = useState(initialEmail)
	const [role, setRole] = useState<InviteMemberRole>(defaultRole)

	const { isValid, emailError } = useMemo(() => {
		if (!email) {
			return { isValid: false, emailError: null }
		}

		const result = inviteMemberSchema.safeParse({ email, role })

		if (!result.success) {
			const emailIssue = result.error.issues.find((i) => i.path[0] === "email")
			return {
				isValid: false,
				emailError: emailIssue?.message ?? "Invalid email",
			}
		}

		return { isValid: true, emailError: null }
	}, [email, role])

	const reset = useCallback(() => {
		setEmail(initialEmail)
		setRole(defaultRole)
	}, [initialEmail, defaultRole])

	const getFormData = useCallback(() => {
		return { email, role }
	}, [email, role])

	return {
		email,
		setEmail,
		role,
		setRole,
		isValid,
		emailError,
		reset,
		getFormData,
	}
}

export type { UseInviteMemberFormOptions, UseInviteMemberFormReturn, InviteMemberRole }
