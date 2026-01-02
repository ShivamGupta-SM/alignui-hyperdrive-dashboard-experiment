"use client"

import * as React from "react"
import * as Button from "@/components/ui/primitives/button"
import * as Badge from "@/components/ui/data-display/badge"
import * as Dropdown from "@/components/ui/layout/dropdown"
import * as Modal from "@/components/ui/layout/modal"
import { ConfirmationModal } from "@/components/dashboard/modals"
import { cn, getErrorMessage } from "@/lib/utils"
import {
	Plus,
	PencilSimple,
	Trash,
	ListChecks,
	Camera,
	Image as ImageIcon,
	Star,
	ShareNetwork,
	VideoCamera,
	ClipboardText,
	DotsThree,
	Info,
} from "@phosphor-icons/react"
import {
	useDeliverableTypes,
	useAddCampaignDeliverable,
	useUpdateCampaignDeliverable,
	useRemoveCampaignDeliverable,
} from "@/features/campaigns"
import type { organizations, platforms, campaigns } from "@/brand-client"
import { toast } from "sonner"
import { useModal } from "@/hooks"

interface DeliverablesTabProps {
	organizationId: string
	campaignId: string
	deliverables: organizations.CampaignDeliverableResponse[]
	platforms: platforms.Platform[]
	canEdit: boolean
}

export function DeliverablesTab({ organizationId, campaignId, deliverables, platforms, canEdit }: DeliverablesTabProps) {
	const [isAddModalOpen, openAddModal, closeAddModal, , setIsAddModalOpen] = useModal()
	const [editingId, setEditingId] = React.useState<string | null>(null)
	const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

	// Fetch available deliverable types
	const { data: deliverableTypesData } = useDeliverableTypes("active")

	// Mutations - URL-based multi-tenancy: organizationId from props
	const addDeliverable = useAddCampaignDeliverable(organizationId)
	const updateDeliverable = useUpdateCampaignDeliverable(organizationId, campaignId)
	const removeDeliverable = useRemoveCampaignDeliverable(organizationId, campaignId)

	// Get icon based on deliverable category
	const getDeliverableIcon = (category: string) => {
		switch (category) {
			case "order_screenshot":
				return ImageIcon
			case "delivery_photo":
				return Camera
			case "product_review":
				return Star
			case "social_media_post":
				return ShareNetwork
			case "unboxing_video":
				return VideoCamera
			default:
				return ClipboardText
		}
	}

	const getPlatformName = (platformId: string): string => {
		const platform = platforms.find((p) => p.id === platformId)
		return platform?.name || platformId
	}

	// Get deliverable IDs already added
	const existingIds = new Set(deliverables.map((d) => d.deliverableId))
	const availableDeliverables = deliverableTypesData?.data?.filter((d) => !existingIds.has(d.id)) ?? []

	const handleAdd = async (deliverableId: string, isRequired: boolean, instructions?: string) => {
		try {
			await addDeliverable.mutateAsync({ campaignId, deliverableId, isRequired, instructions })
			toast.success("Deliverable added")
			closeAddModal()
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to add deliverable"))
		}
	}

	const handleUpdate = async (id: string, instructions: string) => {
		try {
			await updateDeliverable.mutateAsync({ id, instructions })
			toast.success("Deliverable updated")
			setEditingId(null)
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update"))
		}
	}

	const handleRemove = async (id: string) => {
		try {
			await removeDeliverable.mutateAsync(id)
			toast.success("Deliverable removed")
			setDeleteConfirmId(null)
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to remove"))
		}
	}

	if (!deliverables || deliverables.length === 0) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-label-md text-text-strong-950">Campaign Deliverables</h3>
						<p className="text-paragraph-sm text-text-sub-600 mt-1">Define what shoppers need to submit</p>
					</div>
					{canEdit && availableDeliverables.length > 0 && (
						<Button.Root variant="primary" size="small" onClick={openAddModal}>
							<Button.Icon><Plus className="size-5" /></Button.Icon>
							Add Deliverable
						</Button.Root>
					)}
				</div>
				<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-8 text-center">
					<div className="flex justify-center mb-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-bg-soft-200">
							<ListChecks weight="duotone" className="size-6 text-text-soft-400" />
						</div>
					</div>
					<h3 className="text-label-md text-text-strong-950 mb-1">No deliverables configured</h3>
					<p className="text-paragraph-sm text-text-sub-600">
						Add deliverables to define what content creators need to submit.
					</p>
					{canEdit && availableDeliverables.length > 0 && (
						<Button.Root variant="primary" size="small" className="mt-4" onClick={openAddModal}>
							<Button.Icon><Plus className="size-5" /></Button.Icon>
							Add First Deliverable
						</Button.Root>
					)}
				</div>
				{isAddModalOpen && (
					<AddDeliverableModal
						open={isAddModalOpen}
						onOpenChange={setIsAddModalOpen}
						availableDeliverables={availableDeliverables}
						onAdd={handleAdd}
						isLoading={addDeliverable.isPending}
					/>
				)}
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-label-md text-text-strong-950">Campaign Deliverables</h3>
					<p className="text-paragraph-sm text-text-sub-600 mt-1">{deliverables.length} deliverable{deliverables.length !== 1 ? "s" : ""} configured</p>
				</div>
				{canEdit && availableDeliverables.length > 0 && (
					<Button.Root variant="primary" size="small" onClick={openAddModal}>
						<Button.Icon><Plus className="size-5" /></Button.Icon>
						Add Deliverable
					</Button.Root>
				)}
			</div>

			<div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
				<div className="divide-y divide-stroke-soft-200">
					{deliverables.map((item, index) => {
						const category = item.deliverable?.category || "custom"
						const platformId = item.deliverable?.platformId
						const name = item.deliverable?.name || "Deliverable"
						const Icon = getDeliverableIcon(category)
						const isEditing = editingId === item.id

						return (
							<div key={item.id || index} className="p-4 sm:p-5">
								<div className="flex items-start gap-4">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-alpha-10">
										<Icon weight="duotone" className="size-5 text-primary-base" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-3">
											<div>
												<h4 className="text-label-sm text-text-strong-950">{name}</h4>
												{platformId && (
													<p className="text-paragraph-xs text-text-sub-600 mt-0.5">
														Platform: {getPlatformName(platformId)}
													</p>
												)}
											</div>
											<div className="flex items-center gap-2">
												{item.isRequired ? (
													<Badge.Root size="small" color="red">Required</Badge.Root>
												) : (
													<Badge.Root size="small" color="gray">Optional</Badge.Root>
												)}
												{canEdit && (
													<Dropdown.Root>
														<Dropdown.Trigger asChild>
															<Button.Root variant="ghost" size="xsmall" aria-label="Deliverable options">
																<Button.Icon><DotsThree className="size-5" /></Button.Icon>
															</Button.Root>
														</Dropdown.Trigger>
														<Dropdown.Content align="end">
															<Dropdown.Item onClick={() => setEditingId(item.id)}>
																<Dropdown.ItemIcon as={PencilSimple} />
																Edit Instructions
															</Dropdown.Item>
															<Dropdown.Separator />
															<Dropdown.Item onClick={() => setDeleteConfirmId(item.id)} className="text-error-base">
																<Dropdown.ItemIcon as={Trash} />
																Remove
															</Dropdown.Item>
														</Dropdown.Content>
													</Dropdown.Root>
												)}
											</div>
										</div>

										{isEditing ? (
											<div className="mt-3 space-y-2">
												<textarea
													id={`edit-${item.id}`}
													className="w-full rounded-lg border border-stroke-soft-200 p-2.5 text-paragraph-sm"
													placeholder="Instructions for shoppers..."
													defaultValue={item.instructions || ""}
													rows={2}
												/>
												<div className="flex items-center gap-2">
													<Button.Root
														variant="primary"
														size="xsmall"
														disabled={updateDeliverable.isPending}
														onClick={() => {
															const el = document.getElementById(`edit-${item.id}`) as HTMLTextAreaElement
															handleUpdate(item.id, el?.value || "")
														}}
													>
														{updateDeliverable.isPending ? "Saving..." : "Save"}
													</Button.Root>
													<Button.Root variant="ghost" size="xsmall" onClick={() => setEditingId(null)}>
														Cancel
													</Button.Root>
												</div>
											</div>
										) : item.instructions ? (
											<p className="text-paragraph-sm text-text-sub-600 mt-2 flex items-start gap-1.5">
												<Info weight="fill" className="size-4 shrink-0 mt-0.5 text-text-soft-400" />
												{item.instructions}
											</p>
										) : null}
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>

			{isAddModalOpen && (
				<AddDeliverableModal
					open={isAddModalOpen}
					onOpenChange={setIsAddModalOpen}
					availableDeliverables={availableDeliverables}
					onAdd={handleAdd}
					isLoading={addDeliverable.isPending}
				/>
			)}

			{deleteConfirmId && (
				<ConfirmationModal
					open={!!deleteConfirmId}
					onOpenChange={(open) => !open && setDeleteConfirmId(null)}
					title="Remove Deliverable"
					description="Are you sure you want to remove this deliverable?"
					variant="danger"
					confirmLabel={removeDeliverable.isPending ? "Removing..." : "Remove"}
					onConfirm={() => handleRemove(deleteConfirmId)}
				/>
			)}
		</div>
	)
}

// Add Deliverable Modal
interface AddDeliverableModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	availableDeliverables: campaigns.Deliverable[]
	onAdd: (deliverableId: string, isRequired: boolean, instructions?: string) => void
	isLoading: boolean
}

function AddDeliverableModal({ open, onOpenChange, availableDeliverables, onAdd, isLoading }: AddDeliverableModalProps) {
	const [selectedId, setSelectedId] = React.useState("")
	const [isRequired, setIsRequired] = React.useState(true)
	const [instructions, setInstructions] = React.useState("")

	const selected = availableDeliverables.find((d) => d.id === selectedId)

	const handleSubmit = () => {
		if (selectedId) {
			onAdd(selectedId, isRequired, instructions || undefined)
		}
	}

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Add Deliverable</Modal.Title>
					<Modal.Description>Select a deliverable type to add to this campaign</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<div className="space-y-4">
						<div>
							<label htmlFor="deliverable-type" className="text-label-sm text-text-strong-950 mb-2 block">Deliverable Type</label>
							<select
								id="deliverable-type"
								className="w-full rounded-lg border border-stroke-soft-200 p-2.5 text-paragraph-sm"
								value={selectedId}
								onChange={(e) => setSelectedId(e.target.value)}
							>
								<option value="">Select...</option>
								{availableDeliverables.map((d) => (
									<option key={d.id} value={d.id}>{d.name} {d.category ? `(${d.category})` : ""}</option>
								))}
							</select>
						</div>

						{selected && (
							<>
								<div className="flex items-center justify-between">
									<span className="text-label-sm text-text-strong-950">Required</span>
									<button
										type="button"
										role="switch"
										aria-checked={isRequired}
										aria-label="Required deliverable"
										onClick={() => setIsRequired(!isRequired)}
										className={cn(
											"relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
											isRequired ? "bg-primary-base" : "bg-stroke-soft-200"
										)}
									>
										<span className={cn("inline-block size-4 rounded-full bg-white transition-transform", isRequired ? "translate-x-6" : "translate-x-1")} />
									</button>
								</div>
								<div>
									<label htmlFor="deliverable-instructions" className="text-label-sm text-text-strong-950 mb-2 block">Instructions (Optional)</label>
									<textarea
										id="deliverable-instructions"
										className="w-full rounded-lg border border-stroke-soft-200 p-2.5 text-paragraph-sm"
										placeholder="Instructions for shoppers..."
										value={instructions}
										onChange={(e) => setInstructions(e.target.value)}
										rows={3}
									/>
								</div>
							</>
						)}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button.Root variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button.Root>
					<Button.Root variant="primary" onClick={handleSubmit} disabled={!selectedId || isLoading}>
						{isLoading ? "Adding..." : "Add Deliverable"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
