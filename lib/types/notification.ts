// Notification Types

export type NotificationType =
  | 'enrollment_new'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'campaign_approved'
  | 'campaign_rejected'
  | 'wallet_credit'
  | 'wallet_low_balance'
  | 'team_member_joined'
  | 'invoice_generated'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  isRead: boolean
  createdAt: Date
}
