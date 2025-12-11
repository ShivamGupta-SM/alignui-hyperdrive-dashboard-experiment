import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Activity types for organization events
type ActivityType =
  | 'campaign_created'
  | 'campaign_activated'
  | 'campaign_paused'
  | 'campaign_completed'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'enrollment_bulk_approved'
  | 'withdrawal_requested'
  | 'withdrawal_completed'
  | 'member_invited'
  | 'member_joined'
  | 'member_removed'
  | 'invoice_generated'
  | 'product_created'
  | 'settings_updated'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  actorId: string
  actorName: string
  actorAvatar: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    // Verify the user has access to this organization
    if (id !== orgId) {
      return forbiddenResponse('You do not have access to this organization')
    }

    const url = new URL(request.url)
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    await delay(DELAY.FAST)

    // Generate mock activity data
    const allActivities = generateMockActivities(orgId)

    // Apply pagination
    const paginatedActivities = allActivities.slice(skip, skip + take)

    return successResponse({
      data: paginatedActivities,
      total: allActivities.length,
      skip,
      take,
      hasMore: skip + take < allActivities.length,
    })
  } catch (error) {
    console.error('Organization activity error:', error)
    return serverErrorResponse('Failed to fetch organization activity')
  }
}

function generateMockActivities(orgId: string): Activity[] {
  const now = new Date()
  const activities: Activity[] = []

  const activityTemplates: Array<{
    type: ActivityType
    title: string
    description: string
    actor: { id: string; name: string; avatar: string | null }
    metadata: Record<string, unknown>
  }> = [
    {
      type: 'enrollment_approved',
      title: 'Enrollment approved',
      description: 'Approved enrollment for Winter Sale campaign',
      actor: { id: 'user-1', name: 'Rahul Sharma', avatar: null },
      metadata: { enrollmentId: 'enr-1', campaignId: 'camp-1', campaignTitle: 'Winter Sale' },
    },
    {
      type: 'campaign_activated',
      title: 'Campaign activated',
      description: 'Summer Promo campaign is now live',
      actor: { id: 'user-2', name: 'Priya Patel', avatar: null },
      metadata: { campaignId: 'camp-2', campaignTitle: 'Summer Promo' },
    },
    {
      type: 'enrollment_bulk_approved',
      title: 'Bulk approval completed',
      description: '15 enrollments approved for Festival Sale',
      actor: { id: 'user-1', name: 'Rahul Sharma', avatar: null },
      metadata: { count: 15, campaignId: 'camp-3', campaignTitle: 'Festival Sale' },
    },
    {
      type: 'withdrawal_completed',
      title: 'Withdrawal processed',
      description: '₹50,000 transferred to bank account',
      actor: { id: 'system', name: 'System', avatar: null },
      metadata: { amount: 50000, bankLast4: '4532' },
    },
    {
      type: 'member_invited',
      title: 'Team member invited',
      description: 'Invited ankit@example.com to join the team',
      actor: { id: 'user-2', name: 'Priya Patel', avatar: null },
      metadata: { email: 'ankit@example.com', role: 'member' },
    },
    {
      type: 'campaign_created',
      title: 'Campaign created',
      description: 'New campaign "Diwali Special" created as draft',
      actor: { id: 'user-1', name: 'Rahul Sharma', avatar: null },
      metadata: { campaignId: 'camp-4', campaignTitle: 'Diwali Special' },
    },
    {
      type: 'invoice_generated',
      title: 'Invoice generated',
      description: 'Invoice #INV-2024-042 generated for ₹53,100',
      actor: { id: 'system', name: 'System', avatar: null },
      metadata: { invoiceId: 'inv-42', invoiceNumber: 'INV-2024-042', amount: 53100 },
    },
    {
      type: 'enrollment_rejected',
      title: 'Enrollment rejected',
      description: 'Rejected enrollment due to invalid receipt',
      actor: { id: 'user-1', name: 'Rahul Sharma', avatar: null },
      metadata: { enrollmentId: 'enr-5', reason: 'Invalid receipt' },
    },
    {
      type: 'product_created',
      title: 'Product added',
      description: 'New product "Premium Headphones" added to catalog',
      actor: { id: 'user-2', name: 'Priya Patel', avatar: null },
      metadata: { productId: 'prod-10', productName: 'Premium Headphones' },
    },
    {
      type: 'campaign_paused',
      title: 'Campaign paused',
      description: 'Winter Sale campaign paused due to stock issues',
      actor: { id: 'user-1', name: 'Rahul Sharma', avatar: null },
      metadata: { campaignId: 'camp-1', reason: 'Stock issues' },
    },
    {
      type: 'settings_updated',
      title: 'Settings updated',
      description: 'Organization billing address updated',
      actor: { id: 'user-2', name: 'Priya Patel', avatar: null },
      metadata: { field: 'billingAddress' },
    },
    {
      type: 'member_joined',
      title: 'New team member',
      description: 'Ankit Kumar joined the team',
      actor: { id: 'user-3', name: 'Ankit Kumar', avatar: null },
      metadata: { role: 'member' },
    },
  ]

  // Generate 50 activities spread over the last 30 days
  for (let i = 0; i < 50; i++) {
    const template = activityTemplates[i % activityTemplates.length]
    const hoursAgo = Math.floor(Math.random() * 720) // Up to 30 days ago
    const activityDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)

    activities.push({
      id: `activity-${orgId}-${i}`,
      type: template.type,
      title: template.title,
      description: template.description,
      actorId: template.actor.id,
      actorName: template.actor.name,
      actorAvatar: template.actor.avatar,
      metadata: template.metadata,
      createdAt: activityDate.toISOString(),
    })
  }

  // Sort by date descending (most recent first)
  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return activities
}
