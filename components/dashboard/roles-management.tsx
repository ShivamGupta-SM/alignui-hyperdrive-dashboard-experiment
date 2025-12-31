"use client"

import { useState, useCallback, useMemo } from "react"
import * as Button from "@/components/ui/primitives/button"
import * as Badge from "@/components/ui/data-display/badge"
import * as Modal from "@/components/ui/layout/modal"
import * as Input from "@/components/ui/forms/input"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Checkbox from "@/components/ui/forms/checkbox"
import {
	Plus,
	ShieldCheck,
	Trash,
	PencilSimple,
	Spinner,
	Key,
	Lock,
	Warning,
	Info,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
	useOrganizationRoles,
	useCreateOrganizationRole,
	useUpdateOrganizationRole,
	useDeleteOrganizationRole,
} from "@/features/team"

// Available permission subjects and actions
const PERMISSION_SUBJECTS = [
	{
		subject: "campaign",
		label: "Campaigns",
		description: "Manage marketing campaigns",
		actions: ["create", "read", "update", "delete", "publish"],
	},
	{
		subject: "enrollment",
		label: "Enrollments",
		description: "Manage shopper enrollments",
		actions: ["create", "read", "update", "delete", "approve", "reject"],
	},
	{
		subject: "member",
		label: "Team Members",
		description: "Manage organization members",
		actions: ["create", "read", "update", "delete", "invite"],
	},
	{
		subject: "wallet",
		label: "Wallet",
		description: "Manage organization wallet",
		actions: ["read", "deposit", "withdraw", "transfer"],
	},
	{
		subject: "settings",
		label: "Settings",
		description: "Organization settings",
		actions: ["read", "update"],
	},
	{
		subject: "analytics",
		label: "Analytics",
		description: "View analytics and reports",
		actions: ["read", "export"],
	},
]

// Built-in roles that cannot be deleted
const BUILT_IN_ROLES = ["owner", "admin", "member"]

interface RolesManagementProps {
	organizationId: string
}

export function RolesManagement({ organizationId }: RolesManagementProps) {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [selectedRole, setSelectedRole] = useState<{
		id: string
		role: string
		permission?: Record<string, string[]>
	} | null>(null)

	// Fetch roles
	const { data: rolesData, isPending: isLoadingRoles } = useOrganizationRoles(organizationId)
	const roles = rolesData?.roles || []

	// Mutations
	const createRoleMutation = useCreateOrganizationRole(organizationId)
	const updateRoleMutation = useUpdateOrganizationRole(organizationId)
	const deleteRoleMutation = useDeleteOrganizationRole(organizationId)

	const handleEditRole = useCallback((role: typeof selectedRole) => {
		setSelectedRole(role)
		setIsEditModalOpen(true)
	}, [])

	const handleDeleteRole = useCallback((role: typeof selectedRole) => {
		setSelectedRole(role)
		setIsDeleteModalOpen(true)
	}, [])

	// Check if role is built-in
	const isBuiltInRole = (roleName: string) => BUILT_IN_ROLES.includes(roleName.toLowerCase())

	if (isLoadingRoles) {
		return (
			<div className="flex items-center justify-center p-8">
				<Spinner className="size-6 animate-spin text-primary-base" />
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-label-md text-text-strong-950">Custom Roles</h3>
					<p className="text-paragraph-xs text-text-sub-600 mt-0.5">
						Create custom roles with specific permissions for your organization
					</p>
				</div>
				<Button.Root
					variant="primary"
					size="small"
					onClick={() => setIsCreateModalOpen(true)}
				>
					<Button.Icon><Plus className="size-5" /></Button.Icon>
					Create Role
				</Button.Root>
			</div>

			{/* Info Banner */}
			<div className="flex items-start gap-3 p-4 rounded-xl bg-information-lighter ring-1 ring-inset ring-information-base/20">
				<Info className="size-5 text-information-base shrink-0 mt-0.5" />
				<div className="text-paragraph-sm text-information-dark">
					<p className="font-medium mb-1">About Dynamic Roles</p>
					<p>
						Custom roles allow you to define granular permissions for team members.
						Built-in roles (Owner, Admin, Member) cannot be modified or deleted.
					</p>
				</div>
			</div>

			{/* Roles List */}
			<div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
				<div className="flex items-center justify-between p-4 bg-bg-weak-50 border-b border-stroke-soft-200">
					<span className="text-label-sm text-text-strong-950">All Roles</span>
					<span className="text-paragraph-xs text-text-soft-400">
						{roles.length} roles
					</span>
				</div>

				{roles.length === 0 ? (
					<div className="p-8 text-center">
						<div className="flex size-12 items-center justify-center rounded-full bg-bg-soft-200 mx-auto mb-3">
							<ShieldCheck className="size-6 text-text-sub-600" />
						</div>
						<p className="text-label-sm text-text-strong-950 mb-1">No custom roles yet</p>
						<p className="text-paragraph-xs text-text-sub-600 mb-4">
							Create custom roles to give team members specific permissions
						</p>
						<Button.Root
							variant="neutral"
							size="small"
							onClick={() => setIsCreateModalOpen(true)}
						>
							<Button.Icon><Plus className="size-5" /></Button.Icon>
							Create First Role
						</Button.Root>
					</div>
				) : (
					<div className="divide-y divide-stroke-soft-200">
						{roles.map((role) => {
							const builtIn = isBuiltInRole(role.role)
							const permissionCount = Object.values(role.permission || {}).flat().length

							return (
								<div
									key={role.id}
									className="flex items-center justify-between p-4 hover:bg-bg-weak-50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div
											className={cn(
												"flex size-10 items-center justify-center rounded-lg",
												builtIn ? "bg-primary-lighter" : "bg-bg-soft-200"
											)}
										>
											{builtIn ? (
												<Lock className="size-5 text-primary-base" />
											) : (
												<Key className="size-5 text-text-sub-600" />
											)}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<h4 className="text-label-sm text-text-strong-950 capitalize">
													{role.role}
												</h4>
												{builtIn && (
													<Badge.Root color="gray" variant="lighter" size="small">
														Built-in
													</Badge.Root>
												)}
											</div>
											<p className="text-paragraph-xs text-text-sub-600">
												{permissionCount} permissions
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button.Root
											variant="ghost"
											size="small"
											onClick={() => handleEditRole(role)}
										>
											<Button.Icon><PencilSimple className="size-4" /></Button.Icon>
											{builtIn ? "View" : "Edit"}
										</Button.Root>
										{!builtIn && (
											<Button.Root
												variant="ghost"
												size="small"
												onClick={() => handleDeleteRole(role)}
												aria-label={`Delete ${role.role} role`}
											>
												<Button.Icon><Trash className="size-4" /></Button.Icon>
											</Button.Root>
										)}
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>

			{/* Create Role Modal */}
			<CreateRoleModal
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
				onSubmit={async (data) => {
					await createRoleMutation.mutateAsync(data)
					setIsCreateModalOpen(false)
				}}
				isPending={createRoleMutation.isPending}
			/>

			{/* Edit Role Modal */}
			{selectedRole && (
				<EditRoleModal
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					role={selectedRole}
					isBuiltIn={isBuiltInRole(selectedRole.role)}
					onSubmit={async (data) => {
						await updateRoleMutation.mutateAsync({
							roleId: selectedRole.id,
							permission: data.permission,
						})
						setIsEditModalOpen(false)
					}}
					isPending={updateRoleMutation.isPending}
				/>
			)}

			{/* Delete Role Modal */}
			{selectedRole && (
				<DeleteRoleModal
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					role={selectedRole}
					onConfirm={async () => {
						await deleteRoleMutation.mutateAsync(selectedRole.id)
						setIsDeleteModalOpen(false)
					}}
					isPending={deleteRoleMutation.isPending}
				/>
			)}
		</div>
	)
}

// Permission Editor Component
function PermissionEditor({
	permissions,
	onChange,
	disabled = false,
}: {
	permissions: Record<string, string[]>
	onChange: (permissions: Record<string, string[]>) => void
	disabled?: boolean
}) {
	const togglePermission = (subject: string, action: string) => {
		if (disabled) return

		const currentActions = permissions[subject] || []
		const hasAction = currentActions.includes(action)

		let newActions: string[]
		if (hasAction) {
			newActions = currentActions.filter((a) => a !== action)
		} else {
			newActions = [...currentActions, action]
		}

		const newPermissions = { ...permissions }
		if (newActions.length === 0) {
			delete newPermissions[subject]
		} else {
			newPermissions[subject] = newActions
		}

		onChange(newPermissions)
	}

	const toggleAllActions = (subject: string, allActions: string[]) => {
		if (disabled) return

		const currentActions = permissions[subject] || []
		const hasAll = allActions.every((a) => currentActions.includes(a))

		const newPermissions = { ...permissions }
		if (hasAll) {
			delete newPermissions[subject]
		} else {
			newPermissions[subject] = allActions
		}

		onChange(newPermissions)
	}

	return (
		<div className="space-y-3">
			{PERMISSION_SUBJECTS.map((subject) => {
				const currentActions = permissions[subject.subject] || []
				const hasAll = subject.actions.every((a) => currentActions.includes(a))
				const hasSome = currentActions.length > 0 && !hasAll

				return (
					<div
						key={subject.subject}
						className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 overflow-hidden"
					>
						<div
							className={cn(
								"flex items-center justify-between p-3 bg-bg-weak-50 cursor-pointer",
								disabled && "opacity-60 cursor-not-allowed"
							)}
							onClick={() => toggleAllActions(subject.subject, subject.actions)}
						>
							<div className="flex items-center gap-3">
								<Checkbox.Root
									checked={hasAll ? true : hasSome ? "indeterminate" : false}
									disabled={disabled}
									onCheckedChange={() => toggleAllActions(subject.subject, subject.actions)}
								/>
								<div>
									<p className="text-label-sm text-text-strong-950">{subject.label}</p>
									<p className="text-paragraph-xs text-text-sub-600">{subject.description}</p>
								</div>
							</div>
							<Badge.Root
								color={hasAll ? "green" : hasSome ? "yellow" : "gray"}
								variant="lighter"
								size="small"
							>
								{currentActions.length}/{subject.actions.length}
							</Badge.Root>
						</div>
						<div className="p-3 flex flex-wrap gap-2">
							{subject.actions.map((action) => {
								const isSelected = currentActions.includes(action)
								return (
									<button
										key={action}
										type="button"
										disabled={disabled}
										onClick={() => togglePermission(subject.subject, action)}
										className={cn(
											"px-3 py-1.5 rounded-lg text-label-xs transition-colors",
											isSelected
												? "bg-primary-base text-white"
												: "bg-bg-soft-200 text-text-sub-600 hover:bg-bg-soft-200/80",
											disabled && "opacity-60 cursor-not-allowed"
										)}
									>
										{action}
									</button>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}

// Create Role Modal
function CreateRoleModal({
	open,
	onOpenChange,
	onSubmit,
	isPending,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: { role: string; permission?: Record<string, string[]> }) => Promise<void>
	isPending: boolean
}) {
	const [roleName, setRoleName] = useState("")
	const [permissions, setPermissions] = useState<Record<string, string[]>>({})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await onSubmit({
			role: roleName.toLowerCase().replace(/\s+/g, "_"),
			permission: Object.keys(permissions).length > 0 ? permissions : undefined,
		})
		// Reset form
		setRoleName("")
		setPermissions({})
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-2xl">
				<Modal.Header>
					<Modal.Title>Create Custom Role</Modal.Title>
				</Modal.Header>
				<Modal.Body className="max-h-[60vh] overflow-y-auto">
					<form id="create-role-form" onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-label-sm text-text-strong-950 mb-2">
								Role Name <span className="text-error-base">*</span>
							</label>
							<Input.Root>
								<Input.Wrapper>
									<Input.El
										name="roleName"
										placeholder="e.g., Campaign Manager, Finance Admin"
										required
										value={roleName}
										onChange={(e) => setRoleName(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
							<p className="mt-1 text-paragraph-xs text-text-soft-400">
								Will be saved as: {roleName.toLowerCase().replace(/\s+/g, "_") || "role_name"}
							</p>
						</div>

						<div>
							<label className="block text-label-sm text-text-strong-950 mb-3">
								Permissions
							</label>
							<PermissionEditor permissions={permissions} onChange={setPermissions} />
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="submit"
						form="create-role-form"
						variant="primary"
						disabled={isPending || !roleName}
					>
						{isPending ? "Creating..." : "Create Role"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

// Edit Role Modal
function EditRoleModal({
	open,
	onOpenChange,
	role,
	isBuiltIn,
	onSubmit,
	isPending,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	role: { id: string; role: string; permission?: Record<string, string[]> }
	isBuiltIn: boolean
	onSubmit: (data: { permission?: Record<string, string[]> }) => Promise<void>
	isPending: boolean
}) {
	const [permissions, setPermissions] = useState<Record<string, string[]>>(
		role.permission || {}
	)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await onSubmit({
			permission: Object.keys(permissions).length > 0 ? permissions : undefined,
		})
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-2xl">
				<Modal.Header>
					<Modal.Title>
						{isBuiltIn ? "View Role" : "Edit Role"}: {role.role}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="max-h-[60vh] overflow-y-auto">
					{isBuiltIn && (
						<div className="flex items-start gap-3 p-4 rounded-xl bg-warning-lighter ring-1 ring-inset ring-warning-base/20 mb-6">
							<Lock className="size-5 text-warning-base shrink-0 mt-0.5" />
							<div className="text-paragraph-sm text-warning-dark">
								<p className="font-medium mb-1">Built-in Role</p>
								<p>
									This is a built-in role and cannot be modified. You can view its permissions below.
								</p>
							</div>
						</div>
					)}

					<form id="edit-role-form" onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-label-sm text-text-strong-950 mb-3">
								Permissions
							</label>
							<PermissionEditor
								permissions={permissions}
								onChange={setPermissions}
								disabled={isBuiltIn}
							/>
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						{isBuiltIn ? "Close" : "Cancel"}
					</Button.Root>
					{!isBuiltIn && (
						<Button.Root
							type="submit"
							form="edit-role-form"
							variant="primary"
							disabled={isPending}
						>
							{isPending ? "Saving..." : "Save Changes"}
						</Button.Root>
					)}
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

// Delete Role Modal
function DeleteRoleModal({
	open,
	onOpenChange,
	role,
	onConfirm,
	isPending,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	role: { id: string; role: string }
	onConfirm: () => Promise<void>
	isPending: boolean
}) {
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Delete Role</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex items-center gap-3 p-4 rounded-xl bg-error-lighter mb-4">
						<Warning className="size-5 text-error-base shrink-0" />
						<p className="text-paragraph-sm text-error-dark">
							Are you sure you want to delete the &quot;{role.role}&quot; role? This action cannot be undone.
						</p>
					</div>
					<p className="text-paragraph-sm text-text-sub-600">
						Members with this role will need to be assigned a different role.
					</p>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button.Root>
					<Button.Root
						variant="error"
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending ? "Deleting..." : "Delete Role"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
