"use client"

/**
 * TeamsManagement - Team management component
 *
 * ✅ FIX Bug 27: Uses shared useTeamForm hook with Zod validation
 */

import { useState, useCallback } from "react"
import { useModal } from "@/hooks/ui"
import { useTeamForm } from "@/hooks/forms"
import * as Button from "@/components/ui/primitives/button"
import { AvatarWithFallback } from "@/components/ui/primitives/avatar"
import * as Modal from "@/components/ui/layout/modal"
import * as Input from "@/components/ui/forms/input"
import * as Textarea from "@/components/ui/forms/textarea"
import * as Select from "@/components/ui/forms/select"
import {
	Plus,
	Users,
	Trash,
	PencilSimple,
	UserPlus,
	UserMinus,
	Spinner,
} from "@phosphor-icons/react"
import { getAvatarColor, formatDateShort } from "@/lib/utils"
import {
	useTeams,
	useCreateTeam,
	useUpdateTeam,
	useRemoveTeam,
	useTeamMembersList,
	useAddTeamMember,
	useRemoveTeamMember,
	useTeamMembers,
} from "@/features/team"
import type { auth } from "@/brand-client"

type TeamMetadata = auth.TeamMetadata

// Team type from API - note: metadata is not returned by listTeams, only accepted by createTeam
type TeamFromAPI = {
	id: string
	name: string
	organizationId: string
	createdAt: string
}

interface TeamsManagementProps {
	organizationId: string
}

export function TeamsManagement({ organizationId }: TeamsManagementProps) {
	// Modal states - using useModal hook for consistent pattern
	const [isCreateModalOpen, openCreateModal, closeCreateModal] = useModal()
	const [isEditModalOpen, openEditModal, closeEditModal] = useModal()
	const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useModal()
	const [isMembersModalOpen, openMembersModal, closeMembersModal] = useModal()
	const [selectedTeam, setSelectedTeam] = useState<TeamFromAPI | null>(null)

	// Fetch teams
	const { data: teamsData, isPending: isLoadingTeams } = useTeams(organizationId)
	const teams = teamsData?.teams || []

	// Mutations
	const createTeamMutation = useCreateTeam(organizationId)
	const updateTeamMutation = useUpdateTeam(organizationId)
	const removeTeamMutation = useRemoveTeam(organizationId)

	const handleEditTeam = useCallback((team: TeamFromAPI) => {
		setSelectedTeam(team)
		openEditModal()
	}, [openEditModal])

	const handleDeleteTeam = useCallback((team: TeamFromAPI) => {
		setSelectedTeam(team)
		openDeleteModal()
	}, [openDeleteModal])

	const handleManageMembers = useCallback((team: TeamFromAPI) => {
		setSelectedTeam(team)
		openMembersModal()
	}, [openMembersModal])

	// Show skeleton instead of blocking spinner for better UX
	if (isLoadingTeams) {
		return (
			<div className="space-y-4">
				{/* Header skeleton */}
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<div className="h-5 w-20 bg-bg-weak-50 rounded animate-pulse" />
						<div className="h-4 w-72 bg-bg-weak-50 rounded animate-pulse" />
					</div>
					<div className="h-9 w-28 bg-bg-weak-50 rounded-lg animate-pulse" />
				</div>
				{/* Teams grid skeleton */}
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200"
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className="size-10 bg-bg-weak-50 rounded-lg animate-pulse" />
									<div className="h-4 w-24 bg-bg-weak-50 rounded animate-pulse" />
								</div>
							</div>
							<div className="flex items-center justify-between pt-3 border-t border-stroke-soft-200">
								<div className="h-3 w-20 bg-bg-weak-50 rounded animate-pulse" />
								<div className="h-7 w-20 bg-bg-weak-50 rounded-lg animate-pulse" />
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-label-md text-text-strong-950">Teams</h3>
					<p className="text-paragraph-xs text-text-sub-600 mt-0.5">
						Create sub-groups within your organization for fine-grained access control
					</p>
				</div>
				<Button.Root
					variant="primary"
					size="small"
					onClick={openCreateModal}
				>
					<Button.Icon><Plus className="size-5" /></Button.Icon>
					Create Team
				</Button.Root>
			</div>

			{/* Teams List */}
			{teams.length === 0 ? (
				<div className="rounded-xl bg-bg-weak-50 p-8 text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-bg-soft-200 mx-auto mb-3">
						<Users className="size-6 text-text-sub-600" />
					</div>
					<p className="text-label-sm text-text-strong-950 mb-1">No teams yet</p>
					<p className="text-paragraph-xs text-text-sub-600 mb-4">
						Create teams to organize members into groups with specific permissions
					</p>
					<Button.Root
						variant="neutral"
						size="small"
						onClick={openCreateModal}
					>
						<Button.Icon><Plus className="size-5" /></Button.Icon>
						Create First Team
					</Button.Root>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{teams.map((team) => (
						<div
							key={team.id}
							className="rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 hover:ring-primary-base/30 transition-all"
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-3">
									<div
										className="flex size-10 items-center justify-center rounded-lg bg-bg-soft-200"
									>
										<Users className="size-5 text-text-sub-600" />
									</div>
									<div>
										<h4 className="text-label-sm text-text-strong-950">{team.name}</h4>
									</div>
								</div>
								<div className="flex items-center gap-1">
									<Button.Root
										variant="ghost"
										size="xsmall"
										onClick={() => handleEditTeam(team)}
										aria-label={`Edit ${team.name}`}
									>
										<Button.Icon><PencilSimple className="size-4" /></Button.Icon>
									</Button.Root>
									<Button.Root
										variant="ghost"
										size="xsmall"
										onClick={() => handleDeleteTeam(team)}
										aria-label={`Delete ${team.name}`}
									>
										<Button.Icon><Trash className="size-4" /></Button.Icon>
									</Button.Root>
								</div>
							</div>

							<div className="flex items-center justify-between pt-3 border-t border-stroke-soft-200">
								<div className="flex items-center gap-3 text-paragraph-xs text-text-soft-400">
									<span>Created {formatDateShort(team.createdAt)}</span>
								</div>
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={() => handleManageMembers(team)}
								>
									<Button.Icon><Users className="size-4" /></Button.Icon>
									Members
								</Button.Root>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create Team Modal */}
			<CreateTeamModal
				open={isCreateModalOpen}
				onOpenChange={(open) => !open && closeCreateModal()}
				onSubmit={async (data) => {
					await createTeamMutation.mutateAsync(data)
					closeCreateModal()
				}}
				isPending={createTeamMutation.isPending}
			/>

			{/* Edit Team Modal */}
			{selectedTeam && (
				<EditTeamModal
					open={isEditModalOpen}
					onOpenChange={(open) => !open && closeEditModal()}
					team={selectedTeam}
					onSubmit={async (data) => {
						await updateTeamMutation.mutateAsync({
							teamId: selectedTeam.id,
							data,
						})
						closeEditModal()
					}}
					isPending={updateTeamMutation.isPending}
				/>
			)}

			{/* Delete Team Modal */}
			{selectedTeam && (
				<DeleteTeamModal
					open={isDeleteModalOpen}
					onOpenChange={(open) => !open && closeDeleteModal()}
					team={selectedTeam}
					onConfirm={async () => {
						await removeTeamMutation.mutateAsync(selectedTeam.id)
						closeDeleteModal()
					}}
					isPending={removeTeamMutation.isPending}
				/>
			)}

			{/* Team Members Modal */}
			{selectedTeam && (
				<TeamMembersModal
					open={isMembersModalOpen}
					onOpenChange={(open) => !open && closeMembersModal()}
					team={selectedTeam}
					organizationId={organizationId}
				/>
			)}
		</div>
	)
}

// Create Team Modal
function CreateTeamModal({
	open,
	onOpenChange,
	onSubmit,
	isPending,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: { name: string; metadata?: TeamMetadata }) => Promise<void>
	isPending: boolean
}) {
	// ✅ FIX Bug 27: Using shared form hook with Zod validation
	const {
		name, setName,
		description, setDescription,
		department, setDepartment,
		color, setColor,
		icon, setIcon,
		slackChannel, setSlackChannel,
		isValid,
		reset,
		getFormData,
	} = useTeamForm()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await onSubmit(getFormData())
		reset()
	}

	// Reset form when modal closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			reset()
		}
		onOpenChange(newOpen)
	}

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Create Team</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form id="create-team-form" onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-label-sm text-text-strong-950 mb-2">
								Team Name <span className="text-error-base">*</span>
							</label>
							<Input.Root>
								<Input.Wrapper>
									<Input.El
										name="name"
										placeholder="e.g., Engineering, Marketing"
										required
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div>
							<label className="block text-label-sm text-text-strong-950 mb-2">
								Description
							</label>
							<Textarea.Root
								name="description"
								placeholder="What does this team do?"
								rows={2}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Department
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="department"
											placeholder="e.g., Product"
											value={department}
											onChange={(e) => setDepartment(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Color
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="color"
											type="color"
											value={color}
											onChange={(e) => setColor(e.target.value)}
											className="h-10 p-1"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Icon (Emoji)
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="icon"
											placeholder="e.g., ..."
											value={icon}
											onChange={(e) => setIcon(e.target.value)}
											maxLength={2}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Slack Channel
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="slackChannel"
											placeholder="e.g., engineering"
											value={slackChannel}
											onChange={(e) => setSlackChannel(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root
						type="button"
						variant="ghost"
						onClick={() => handleOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="submit"
						form="create-team-form"
						variant="primary"
						disabled={isPending || !isValid}
					>
						{isPending ? "Creating..." : "Create Team"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

// Edit Team Modal
function EditTeamModal({
	open,
	onOpenChange,
	team,
	onSubmit,
	isPending,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	team: TeamFromAPI
	onSubmit: (data: { name?: string; metadata?: TeamMetadata }) => Promise<void>
	isPending: boolean
}) {
	// ✅ FIX Bug 27: Using shared form hook with Zod validation
	const {
		name, setName,
		description, setDescription,
		department, setDepartment,
		color, setColor,
		icon, setIcon,
		slackChannel, setSlackChannel,
		isValid,
		getFormData,
	} = useTeamForm({ initialName: team.name })

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await onSubmit(getFormData())
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Edit Team</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form id="edit-team-form" onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-label-sm text-text-strong-950 mb-2">
								Team Name <span className="text-error-base">*</span>
							</label>
							<Input.Root>
								<Input.Wrapper>
									<Input.El
										name="name"
										required
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div>
							<label className="block text-label-sm text-text-strong-950 mb-2">
								Description
							</label>
							<Textarea.Root
								name="description"
								rows={2}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Department
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="department"
											value={department}
											onChange={(e) => setDepartment(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Color
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="color"
											type="color"
											value={color}
											onChange={(e) => setColor(e.target.value)}
											className="h-10 p-1"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Icon (Emoji)
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="icon"
											value={icon}
											onChange={(e) => setIcon(e.target.value)}
											maxLength={2}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div>
								<label className="block text-label-sm text-text-strong-950 mb-2">
									Slack Channel
								</label>
								<Input.Root>
									<Input.Wrapper>
										<Input.El
											name="slackChannel"
											value={slackChannel}
											onChange={(e) => setSlackChannel(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
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
						form="edit-team-form"
						variant="primary"
						disabled={isPending || !isValid}
					>
						{isPending ? "Saving..." : "Save Changes"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

// Delete Team Modal
function DeleteTeamModal({
	open,
	onOpenChange,
	team,
	onConfirm,
	isPending,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	team: { id: string; name: string }
	onConfirm: () => Promise<void>
	isPending: boolean
}) {
	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Delete Team</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex items-center gap-3 p-4 rounded-xl bg-error-lighter mb-4">
						<Trash className="size-5 text-error-base shrink-0" />
						<p className="text-paragraph-sm text-error-dark">
							Are you sure you want to delete &quot;{team.name}&quot;? This action cannot be undone.
						</p>
					</div>
					<p className="text-paragraph-sm text-text-sub-600">
						All team members will be removed from this team, but will remain in the organization.
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
						{isPending ? "Deleting..." : "Delete Team"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}

// Team Members Modal
function TeamMembersModal({
	open,
	onOpenChange,
	team,
	organizationId,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	team: { id: string; name: string }
	organizationId: string
}) {
	const [selectedUserId, setSelectedUserId] = useState("")

	// Fetch team members - requires both organizationId and teamId
	const { data: teamMembersData, isPending: isLoadingMembers } = useTeamMembersList(organizationId, team.id)
	const teamMembers = teamMembersData?.members || []

	// Fetch organization members (to add to team)
	const { data: orgMembersData } = useTeamMembers(organizationId)
	const orgMembers = orgMembersData?.members || []

	// Filter out members already in team
	const availableMembers = orgMembers.filter(
		(m) => !teamMembers.some((tm) => tm.userId === m.userId)
	)

	// Mutations
	const addMemberMutation = useAddTeamMember(organizationId)
	const removeMemberMutation = useRemoveTeamMember(organizationId)

	const handleAddMember = async () => {
		if (!selectedUserId) return
		await addMemberMutation.mutateAsync({ teamId: team.id, userId: selectedUserId })
		setSelectedUserId("")
	}

	const handleRemoveMember = async (userId: string) => {
		await removeMemberMutation.mutateAsync({ teamId: team.id, userId })
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-lg">
				<Modal.Header>
					<Modal.Title>Manage Team Members - {team.name}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{/* Add Member */}
					<div className="flex items-center gap-2 mb-4">
						<Select.Root
							value={selectedUserId}
							onValueChange={setSelectedUserId}
						>
							<Select.Trigger className="flex-1">
								<Select.Value placeholder="Select a member to add" />
							</Select.Trigger>
							<Select.Content>
								{availableMembers.length === 0 ? (
									<div className="p-2 text-paragraph-xs text-text-sub-600 text-center">
										All organization members are already in this team
									</div>
								) : (
									availableMembers.map((member) => (
										<Select.Item key={member.userId} value={member.userId}>
											{member.user?.name || member.user?.email || "Unknown"}
										</Select.Item>
									))
								)}
							</Select.Content>
						</Select.Root>
						<Button.Root
							variant="primary"
							size="small"
							onClick={handleAddMember}
							disabled={!selectedUserId || addMemberMutation.isPending}
						>
							<Button.Icon><UserPlus className="size-5" /></Button.Icon>
							Add
						</Button.Root>
					</div>

					{/* Members List */}
					<div className="rounded-xl ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
						<div className="flex items-center justify-between p-3 bg-bg-weak-50 border-b border-stroke-soft-200">
							<span className="text-label-sm text-text-strong-950">Members</span>
							<span className="text-paragraph-xs text-text-soft-400">
								{teamMembers.length} members
							</span>
						</div>
						{isLoadingMembers ? (
							<div className="flex items-center justify-center p-8">
								<Spinner className="size-5 animate-spin text-primary-base" />
							</div>
						) : teamMembers.length === 0 ? (
							<div className="p-6 text-center">
								<p className="text-paragraph-sm text-text-sub-600">
									No members in this team yet
								</p>
							</div>
						) : (
							<div className="divide-y divide-stroke-soft-200 max-h-64 overflow-y-auto">
								{teamMembers.map((member) => (
									<div
										key={member.userId}
										className="flex items-center justify-between p-3 hover:bg-bg-weak-50"
									>
										<div className="flex items-center gap-3">
											<AvatarWithFallback
												name={member.user?.name || "User"}
												size="32"
												color={getAvatarColor(member.user?.name || "User")}
											/>
											<div>
												<p className="text-label-sm text-text-strong-950">
													{member.user?.name || "Unknown"}
												</p>
												<p className="text-paragraph-xs text-text-sub-600">
													{member.user?.email}
												</p>
											</div>
										</div>
										<Button.Root
											variant="ghost"
											size="xsmall"
											onClick={() => handleRemoveMember(member.userId)}
											disabled={removeMemberMutation.isPending}
											aria-label={`Remove ${member.user?.name || "member"} from team`}
										>
											<Button.Icon><UserMinus className="size-4" /></Button.Icon>
										</Button.Root>
									</div>
								))}
							</div>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root
						variant="neutral"
						onClick={() => onOpenChange(false)}
					>
						Done
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
