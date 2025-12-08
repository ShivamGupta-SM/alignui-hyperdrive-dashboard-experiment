// Hypedrive Brand Dashboard - Constants

import type { 
  OrganizationStatus, 
  CampaignStatus, 
  EnrollmentStatus, 
  InvoiceStatus,
  UserRole,
  BusinessType,
  IndustryCategory,
  CampaignType,
  DeliverableType,
  TransactionType
} from '@/lib/types'

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

export const ORGANIZATION_STATUS_CONFIG: Record<OrganizationStatus, {
  label: string
  color: 'yellow' | 'green' | 'red' | 'gray'
  description: string
}> = {
  pending: {
    label: 'Pending Approval',
    color: 'yellow',
    description: 'Awaiting admin review'
  },
  approved: {
    label: 'Active',
    color: 'green',
    description: 'Fully operational'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    description: 'Application rejected'
  },
  suspended: {
    label: 'Suspended',
    color: 'gray',
    description: 'Temporarily disabled'
  }
}

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, {
  label: string
  color: 'yellow' | 'orange' | 'blue' | 'green' | 'gray' | 'red'
  iconName: 'draft' | 'pending' | 'rejected' | 'approved' | 'active' | 'paused' | 'ended' | 'expired' | 'completed' | 'cancelled' | 'archived'
  description: string
}> = {
  draft: {
    label: 'Draft',
    color: 'yellow',
    iconName: 'draft',
    description: 'Being edited'
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'orange',
    iconName: 'pending',
    description: 'Awaiting admin review'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    iconName: 'rejected',
    description: 'Rejected by admin'
  },
  approved: {
    label: 'Approved',
    color: 'blue',
    iconName: 'approved',
    description: 'Ready to activate'
  },
  active: {
    label: 'Active',
    color: 'green',
    iconName: 'active',
    description: 'Live and accepting enrollments'
  },
  paused: {
    label: 'Paused',
    color: 'gray',
    iconName: 'paused',
    description: 'Temporarily stopped'
  },
  ended: {
    label: 'Ended',
    color: 'gray',
    iconName: 'ended',
    description: 'Campaign period ended'
  },
  expired: {
    label: 'Expired',
    color: 'gray',
    iconName: 'expired',
    description: 'Past end date without completion'
  },
  completed: {
    label: 'Completed',
    color: 'green',
    iconName: 'completed',
    description: 'Successfully completed'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    iconName: 'cancelled',
    description: 'Cancelled before completion'
  },
  archived: {
    label: 'Archived',
    color: 'gray',
    iconName: 'archived',
    description: 'Historical record'
  }
}

export const ENROLLMENT_STATUS_CONFIG: Record<EnrollmentStatus, {
  label: string
  color: 'yellow' | 'blue' | 'orange' | 'green' | 'red' | 'gray'
  description: string
}> = {
  enrolled: {
    label: 'Enrolled',
    color: 'blue',
    description: 'Just enrolled'
  },
  awaiting_submission: {
    label: 'Awaiting Submission',
    color: 'yellow',
    description: 'Waiting for proofs'
  },
  awaiting_review: {
    label: 'Awaiting Review',
    color: 'blue',
    description: 'Ready for brand review'
  },
  changes_requested: {
    label: 'Changes Requested',
    color: 'orange',
    description: 'Needs shopper action'
  },
  approved: {
    label: 'Approved',
    color: 'green',
    description: 'Approved for payout'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    description: 'Permanently rejected'
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'gray',
    description: 'Shopper withdrew'
  },
  expired: {
    label: 'Expired',
    color: 'gray',
    description: 'Deadline passed'
  }
}

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, {
  label: string
  color: 'yellow' | 'green' | 'red' | 'gray'
}> = {
  pending: {
    label: 'Pending',
    color: 'yellow'
  },
  paid: {
    label: 'Paid',
    color: 'green'
  },
  overdue: {
    label: 'Overdue',
    color: 'red'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'gray'
  }
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, {
  label: string
  color: 'green' | 'red' | 'blue' | 'gray'
  sign: '+' | '-' | ''
}> = {
  credit: {
    label: 'Credit',
    color: 'green',
    sign: '+'
  },
  hold_created: {
    label: 'Hold Created',
    color: 'red',
    sign: '-'
  },
  hold_committed: {
    label: 'Hold Committed',
    color: 'red',
    sign: '-'
  },
  hold_voided: {
    label: 'Hold Released',
    color: 'green',
    sign: '+'
  },
  withdrawal: {
    label: 'Withdrawal',
    color: 'red',
    sign: '-'
  },
  refund: {
    label: 'Refund',
    color: 'green',
    sign: '+'
  }
}

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

export const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'owner',
    label: 'Owner',
    description: 'Full access, cannot be removed'
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Manage campaigns, enrollments, wallet, team'
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Manage campaigns and review enrollments'
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'View-only access to dashboard'
  }
]

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
  { value: 'private_limited', label: 'Private Limited' },
  { value: 'public_limited', label: 'Public Limited' }
]

export const INDUSTRY_CATEGORY_OPTIONS: { value: IndustryCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'home_appliances', label: 'Home Appliances' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'other', label: 'Other' }
]

export const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType; label: string; description: string }[] = [
  {
    value: 'cashback',
    label: 'Cashback',
    description: 'Shoppers receive cashback on purchase'
  },
  {
    value: 'barter',
    label: 'Barter',
    description: 'Product exchange for content'
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Combination of cashback and barter'
  }
]

export const DELIVERABLE_TYPE_OPTIONS: { value: DeliverableType; label: string; description: string }[] = [
  {
    value: 'order_screenshot',
    label: 'Order Screenshot',
    description: 'Screenshot of order confirmation'
  },
  {
    value: 'delivery_photo',
    label: 'Delivery Photo',
    description: 'Photo of received product'
  },
  {
    value: 'product_review',
    label: 'Product Review',
    description: 'Written review on platform'
  },
  {
    value: 'social_media_post',
    label: 'Social Media Post',
    description: 'Post on social media'
  },
  {
    value: 'unboxing_video',
    label: 'Unboxing Video',
    description: 'Video of product unboxing'
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Custom deliverable'
  }
]

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh'
]

export const E_COMMERCE_PLATFORMS = [
  'Amazon',
  'Flipkart',
  'Myntra',
  'Ajio',
  'Nykaa',
  'Tata CLiQ',
  'Reliance Digital',
  'Croma',
  'Any Platform'
]

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Footwear',
  'Beauty & Personal Care',
  'Home & Kitchen',
  'Sports & Fitness',
  'Toys & Games',
  'Books',
  'Automotive',
  'Other'
]

// ============================================================================
// NAVIGATION
// ============================================================================

export const SIDEBAR_NAVIGATION = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'RiDashboardLine'
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: 'RiMegaphoneLine'
  },
  {
    id: 'enrollments',
    label: 'Enrollments',
    href: '/dashboard/enrollments',
    icon: 'RiUserFollowLine',
    badge: true // Show pending count
  },
  {
    id: 'products',
    label: 'Products',
    href: '/dashboard/products',
    icon: 'RiShoppingBag3Line'
  },
  {
    id: 'wallet',
    label: 'Wallet',
    href: '/dashboard/wallet',
    icon: 'RiWallet3Line'
  },
  {
    id: 'invoices',
    label: 'Invoices',
    href: '/dashboard/invoices',
    icon: 'RiFileList3Line'
  },
  {
    id: 'team',
    label: 'Team',
    href: '/dashboard/team',
    icon: 'RiTeamLine'
  }
]

export const SIDEBAR_FOOTER_NAVIGATION = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'RiSettings4Line'
  },
  {
    id: 'help',
    label: 'Help & Support',
    href: '/dashboard/help',
    icon: 'RiQuestionLine'
  }
]

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export const QUICK_ACTIONS = [
  {
    id: 'create-campaign',
    label: 'Create Campaign',
    description: 'Start a new influencer campaign',
    href: '/dashboard/campaigns/create',
    icon: 'RiAddLine',
    shortcut: '⌘+N'
  },
  {
    id: 'review-enrollments',
    label: 'Review Submissions',
    description: 'Review pending enrollments',
    href: '/dashboard/enrollments?status=awaiting_review',
    icon: 'RiCheckDoubleLine',
    shortcut: '⌘+R'
  },
  {
    id: 'fund-wallet',
    label: 'Fund Wallet',
    description: 'Add funds to your wallet',
    href: '#fund-wallet',
    icon: 'RiWallet3Line',
    shortcut: '⌘+F'
  },
  {
    id: 'invite-team',
    label: 'Invite Team Member',
    description: 'Invite a colleague to join',
    href: '#invite-team',
    icon: 'RiUserAddLine',
    shortcut: '⌘+I'
  }
]

// ============================================================================
// REJECTION REASONS
// ============================================================================

export const REJECTION_REASONS = [
  { id: 'fraudulent_screenshot', label: 'Fraudulent order screenshot' },
  { id: 'wrong_platform', label: 'Order not from approved platform' },
  { id: 'value_mismatch', label: 'Order value mismatch' },
  { id: 'fake_review', label: 'Fake/plagiarized review' },
  { id: 'wrong_date', label: 'Order date outside campaign period' },
  { id: 'max_rejections', label: 'Exceeded maximum rejection attempts' },
  { id: 'other', label: 'Other' }
]

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_SUBMISSION_DEADLINE_DAYS = 45
export const DEFAULT_PAGE_SIZE = 10
export const MIN_WALLET_BALANCE_WARNING = 10000 // ₹10,000
export const INVITATION_EXPIRY_DAYS = 7

