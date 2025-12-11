// User & Auth Types

export type UserRole = 'owner' | 'admin' | 'manager' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  role: string
  emailVerified?: boolean
  twoFactorEnabled?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember extends User {
  role: UserRole
  joinedAt: Date
  organizationId: string
}

export interface Invitation {
  id: string
  email: string
  role: UserRole
  sentAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}
