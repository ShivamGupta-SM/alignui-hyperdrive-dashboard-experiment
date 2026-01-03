"use client"

import * as React from "react"
import * as Modal from "@/components/ui/layout/modal"
import * as Button from "@/components/ui/primitives/button"
import * as Input from "@/components/ui/forms/input"
import * as Radio from "@/components/ui/forms/radio"
import { cn } from "@/lib/utils"

interface InviteTeamMemberModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (email: string, role: string) => void
	isLoading?: boolean
}

export function InviteTeamMemberModal({
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
}: InviteTeamMemberModalProps) {
	const [email, setEmail] = React.useState("")
	const [role, setRole] = React.useState("viewer")

	const roles = [
		{ value: "admin", label: "Admin", description: "Full access except owner actions" },
		{ value: "manager", label: "Manager", description: "Manage campaigns and enrollments" },
		{ value: "viewer", label: "Viewer", description: "View-only access" },
	]

	const handleConfirm = () => {
		onConfirm(email, role)
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Invite Team Member</Modal.Title>
					<Modal.Description>Send an invitation to join your organization</Modal.Description>
				</Modal.Header>
				<Modal.Body className="space-y-4">
					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Email Address <span className="text-error-base">*</span>
						</label>
						<Input.Root>
							<Input.Wrapper>
								<Input.El
									type="email"
									placeholder="colleague@company.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					<div>
						<label className="block text-label-sm text-text-strong-950 mb-2">
							Role <span className="text-error-base">*</span>
						</label>
						<Radio.Group value={role} onValueChange={setRole}>
							<div className="space-y-2">
								{roles.map((r) => (
									<label
										key={r.value}
										className={cn(
											"flex items-start gap-3 p-3 rounded-10 border cursor-pointer transition-colors",
											role === r.value
												? "border-primary-base bg-primary-alpha-10"
												: "border-stroke-soft-200 hover:bg-bg-weak-50"
										)}
									>
										<Radio.Item value={r.value} className="mt-0.5" />
										<div>
											<div className="text-label-sm text-text-strong-950">{r.label}</div>
											<div className="text-paragraph-xs text-text-sub-600">{r.description}</div>
										</div>
									</label>
								))}
							</div>
						</Radio.Group>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root variant="primary" onClick={handleConfirm} disabled={!email || isLoading}>
						{isLoading ? "Sending..." : "Send Invitation"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
