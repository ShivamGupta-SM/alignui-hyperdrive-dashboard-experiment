"use client"

import { CampaignsClient } from "./campaigns-client"

interface CampaignsWrapperProps {
	initialData: {
		campaigns: any[]
		data: any[]
		total: number
	}
	initialStatus: string
}

export function CampaignsWrapper({ initialData, initialStatus }: CampaignsWrapperProps) {
	return <CampaignsClient initialData={initialData} initialStatus={initialStatus} />
}
