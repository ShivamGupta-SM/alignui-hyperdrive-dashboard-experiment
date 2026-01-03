"use client"

import Link from "next/link"
import Image from "next/image"
import { Megaphone, CaretRight } from "@phosphor-icons/react"
import { useCurrentOrganization } from "@/hooks"

interface Campaign {
	id: string
	name: string
	enrollments: number
	approvalRate: number
	status: string
	daysLeft?: number
	image?: string
}

interface DashboardCampaignsSectionProps {
	campaigns: Campaign[]
	metrics: {
		activeCampaigns: number
		endingSoon: number
		pausedCampaigns: number
	}
}

/**
 * Dashboard campaigns section
 * Shows campaign stats and top campaigns list
 */
export function DashboardCampaignsSection({
	campaigns,
	metrics,
}: DashboardCampaignsSectionProps) {
	const { organizationId } = useCurrentOrganization()
	return (
		<div className="lg:col-span-5 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
			<div className="flex items-center justify-between p-3 sm:p-4 border-b border-stroke-soft-200">
				<div className="flex items-center gap-2">
					<Megaphone weight="duotone" className="size-4 sm:size-5 text-primary-base" />
					<h2 className="text-label-xs sm:text-label-sm text-text-strong-950 font-medium">Campaigns</h2>
				</div>
				<Link
					href={`/dashboard/${organizationId}/campaigns`}
					className="text-paragraph-xs text-primary-base hover:underline"
				>
					View all
				</Link>
			</div>

			<div className="grid grid-cols-3 border-b border-stroke-soft-200 divide-x divide-stroke-soft-200">
				<div className="p-2 sm:p-4 text-center">
					<div className="text-title-h6 sm:text-title-h4 text-success-base font-semibold">
						{metrics.activeCampaigns}
					</div>
					<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">Active</div>
				</div>
				<div className="p-2 sm:p-4 text-center">
					<div className="text-title-h6 sm:text-title-h4 text-warning-base font-semibold">
						{metrics.endingSoon}
					</div>
					<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">Ending</div>
				</div>
				<div className="p-2 sm:p-4 text-center">
					<div className="text-title-h6 sm:text-title-h4 text-text-soft-400 font-semibold">
						{metrics.pausedCampaigns}
					</div>
					<div className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">Paused</div>
				</div>
			</div>

			<div className="divide-y divide-stroke-soft-200">
				{campaigns.map((campaign) => (
					<Link
						key={campaign.id}
						href={`/dashboard/${organizationId}/campaigns/${campaign.id}`}
						className="flex items-center gap-2.5 p-2.5 sm:p-3 hover:bg-bg-weak-50 transition-colors group"
					>
						<div className="relative size-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
							{campaign.image ? (
								<Image
									src={campaign.image}
									alt={campaign.name}
									fill
									sizes="40px"
									className="object-contain p-0.5"
								/>
							) : (
								<div className="size-full flex items-center justify-center text-text-soft-400">
									<Megaphone className="size-5" />
								</div>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-label-xs text-text-strong-950 group-hover:text-primary-base transition-colors truncate">
								{campaign.name}
							</div>
							<div className="flex items-center gap-2 text-label-xs text-text-sub-600 mt-0.5">
								<span>{campaign.enrollments} enrolled</span>
								<span>•</span>
								<span className="text-success-base">{campaign.approvalRate}%</span>
							</div>
						</div>
						{campaign.status === "ending" ? (
							<span className="text-label-xs font-medium text-warning-base bg-warning-lighter px-2 py-0.5 rounded-full shrink-0">
								{campaign.daysLeft}d left
							</span>
						) : (
							<CaretRight className="size-4 text-text-soft-400 opacity-0 group-hover:opacity-100 group-hover:text-text-sub-600 transition-opacity shrink-0" />
						)}
					</Link>
				))}
			</div>
		</div>
	)
}
