'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as Input from '@/components/ui/input'
import * as Textarea from '@/components/ui/textarea'
import * as Switch from '@/components/ui/switch'
import { toast } from 'sonner'
import { updateCampaign } from '@/app/actions/campaigns'
import type { CampaignWithStats } from '@/hooks/use-campaigns'

interface SettingsTabProps {
  campaign: CampaignWithStats
}

export function SettingsTab({ campaign }: SettingsTabProps) {
  // State for form fields
  const [title, setTitle] = React.useState(campaign.title)
  const [description, setDescription] = React.useState(campaign.description)
  // const [maxEnrollments, setMaxEnrollments] = React.useState(campaign.maxEnrollments?.toString() || '') 
  // const [submissionDeadline, setSubmissionDeadline] = React.useState(campaign.submissionDeadlineDays?.toString() || '')

  const [isPending, startTransition] = React.useTransition()

  const handleSave = () => {
    startTransition(async () => {
        try {
            const res = await updateCampaign(campaign.id, {
                title,
                description,
                // maxEnrollments: maxEnrollments ? parseInt(maxEnrollments) : undefined,
                // submissionDeadlineDays: submissionDeadline ? parseInt(submissionDeadline) : undefined
            })
            if (res.success) {
                toast.success('Campaign settings updated')
            } else {
                toast.error(res.error || 'Failed to update settings')
            }
        } catch (e) {
            toast.error('An error occurred')
        }
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <h3 className="text-label-md text-text-strong-950 mb-4">General Settings</h3>
        
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-label-sm text-text-strong-950 mb-2">
              Campaign Title
            </label>
            <Input.Root>
              <Input.Wrapper>
                <Input.El 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                />
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div>
             <label className="block text-label-sm text-text-strong-950 mb-2">
              Description
            </label>
            <Textarea.Root 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
            />
          </div>
          
          <div className="pt-4">
            <Button.Root variant="primary" onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
            </Button.Root>
          </div>
        </div>
      </div>
    </div>
  )
}
