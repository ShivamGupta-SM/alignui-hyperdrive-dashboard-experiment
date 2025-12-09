'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as Avatar from '@/components/ui/avatar'
import { AvatarWithFallback } from '@/components/ui/avatar'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Modal from '@/components/ui/modal'
import * as Input from '@/components/ui/input'
import * as Textarea from '@/components/ui/textarea'
import * as Radio from '@/components/ui/radio'
import * as Select from '@/components/ui/select'
import * as List from '@/components/ui/list'
import * as Table from '@/components/ui/table'
import { Metric, MetricGroup } from '@/components/ui/metric'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import * as AvatarGroup from '@/components/claude-generated-components/avatar-group'
import { getAvatarColor } from '@/utils/avatar-color'
import {
  Plus,
  User,
  Trash,
  ShieldCheck,
  UserGear,
  Eye,
  Info,
  Warning,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'
import type { TeamMember, Invitation, UserRole } from '@/lib/types'
import { ROLE_OPTIONS } from '@/lib/constants'

// Mock data
const mockMembers: TeamMember[] = [
  {
    id: '1',
    email: 'john@company.com',
    name: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    role: 'owner',
    joinedAt: new Date('2024-10-15'),
    organizationId: '1',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15'),
  },
  {
    id: '2',
    email: 'sarah@company.com',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'admin',
    joinedAt: new Date('2024-11-01'),
    organizationId: '1',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: '3',
    email: 'mike@company.com',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    role: 'manager',
    joinedAt: new Date('2024-11-20'),
    organizationId: '1',
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-20'),
  },
]

const mockInvitations: Invitation[] = [
  {
    id: '1',
    email: 'emily@company.com',
    role: 'manager',
    sentAt: new Date('2024-12-03'),
    expiresAt: new Date('2024-12-10'),
    status: 'pending',
  },
]

const currentUserId = '1' // Mock current user

// Map role to StatusBadge status
const getRoleStatus = (role: UserRole) => {
  switch (role) {
    case 'owner':
      return 'completed' as const
    case 'admin':
      return 'pending' as const
    case 'manager':
      return 'completed' as const
    case 'viewer':
      return 'disabled' as const
    default:
      return 'disabled' as const
  }
}

// Get role icon
const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'owner':
      return ShieldCheck
    case 'admin':
      return UserGear
    case 'manager':
      return User
    case 'viewer':
      return Eye
    default:
      return User
  }
}

export default function TeamPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Stats
  const stats = React.useMemo(() => ({
    total: mockMembers.length,
    admins: mockMembers.filter(m => m.role === 'admin' || m.role === 'owner').length,
    managers: mockMembers.filter(m => m.role === 'manager').length,
    pending: mockInvitations.filter(i => i.status === 'pending').length,
  }), [])

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Team</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Manage team members and their roles
          </p>
        </div>
        <Button.Root variant="primary" size="small" onClick={() => setIsInviteModalOpen(true)} className="shrink-0">
          <Button.Icon as={Plus} />
          <span className="hidden sm:inline">Invite Member</span>
          <span className="sm:hidden">Invite</span>
        </Button.Root>
      </div>

      {/* Stats Overview - Grid of Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Members */}
        <div className="rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-lighter">
              <User weight="bold" className="size-4 text-primary-base" />
            </div>
            <span className="text-[10px] text-text-soft-400 uppercase tracking-wide">Members</span>
          </div>
          <p className="text-title-h5 text-text-strong-950 font-semibold">{stats.total}</p>
        </div>

        {/* Admins */}
        <div className="rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-success-lighter">
              <ShieldCheck weight="bold" className="size-4 text-success-base" />
            </div>
            <span className="text-[10px] text-text-soft-400 uppercase tracking-wide">Admins</span>
          </div>
          <p className="text-title-h5 text-text-strong-950 font-semibold">{stats.admins}</p>
        </div>

        {/* Managers */}
        <div className="rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-information-lighter">
              <UserGear weight="bold" className="size-4 text-information-base" />
            </div>
            <span className="text-[10px] text-text-soft-400 uppercase tracking-wide">Managers</span>
          </div>
          <p className="text-title-h5 text-text-strong-950 font-semibold">{stats.managers}</p>
        </div>

        {/* Pending Invites */}
        <div className={cn(
          "rounded-xl p-4 ring-1 ring-inset shadow-sm",
          stats.pending > 0 
            ? "bg-warning-lighter/50 ring-warning-base/20" 
            : "bg-bg-white-0 ring-stroke-soft-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              stats.pending > 0 ? "bg-warning-base text-white" : "bg-bg-soft-200"
            )}>
              <Plus weight="bold" className={cn("size-4", stats.pending > 0 ? "" : "text-text-sub-600")} />
            </div>
            <span className="text-[10px] text-text-soft-400 uppercase tracking-wide">Pending</span>
          </div>
          <p className={cn(
            "text-title-h5 font-semibold",
            stats.pending > 0 ? "text-warning-dark" : "text-text-strong-950"
          )}>{stats.pending}</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
          <h2 className="text-label-md text-text-strong-950">Team Members</h2>
          <span className="text-paragraph-xs text-text-soft-400">{mockMembers.length} members</span>
        </div>
        <div className="divide-y divide-stroke-soft-200">
          {mockMembers.map((member) => {
            const isCurrentUser = member.id === currentUserId
            const isOwner = member.role === 'owner'
            const RoleIcon = getRoleIcon(member.role)

            return (
              <div key={member.id} className="p-4 hover:bg-bg-weak-50 transition-colors">
                {/* Mobile Layout - Stacked */}
                <div className="flex items-start gap-3 sm:hidden">
                  <AvatarWithFallback
                    src={member.avatar}
                    name={member.name}
                    size="40"
                    color={getAvatarColor(member.name)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-label-sm text-text-strong-950">{member.name}</span>
                      {isCurrentUser && (
                        <span className="text-[9px] text-text-soft-400 bg-bg-soft-200 px-1.5 py-0.5 rounded">You</span>
                      )}
                    </div>
                    <p className="text-paragraph-xs text-text-sub-600">{member.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge.Root status={getRoleStatus(member.role)} variant="light">
                          <StatusBadge.Icon as={RoleIcon} />
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </StatusBadge.Root>
                        <span className="text-[10px] text-text-soft-400">
                          {formatDate(member.joinedAt)}
                        </span>
                      </div>
                      {!isCurrentUser && !isOwner && (
                        <Button.Root
                          variant="ghost"
                          size="xsmall"
                          onClick={() => {
                            setSelectedMember(member)
                            setIsRemoveModalOpen(true)
                          }}
                        >
                          <Button.Icon as={Trash} />
                        </Button.Root>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden sm:flex sm:items-center sm:gap-4">
                  <AvatarWithFallback
                    src={member.avatar}
                    name={member.name}
                    size="48"
                    color={getAvatarColor(member.name)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-label-sm text-text-strong-950">{member.name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] text-text-soft-400 bg-bg-soft-200 px-1.5 py-0.5 rounded">You</span>
                      )}
                    </div>
                    <p className="text-paragraph-xs text-text-sub-600">{member.email}</p>
                    <span className="text-[10px] text-text-soft-400">Joined {formatDate(member.joinedAt)}</span>
                  </div>
                  
                  <StatusBadge.Root status={getRoleStatus(member.role)} variant="light" className="shrink-0">
                    <StatusBadge.Icon as={RoleIcon} />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </StatusBadge.Root>
                  
                  {!isCurrentUser && !isOwner && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Select.Root value={member.role} onValueChange={() => {}} size="small">
                        <Select.Trigger className="w-28">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((option) => (
                            <Select.Item key={option.value} value={option.value}>
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                      <Button.Root
                        variant="ghost"
                        size="small"
                        onClick={() => {
                          setSelectedMember(member)
                          setIsRemoveModalOpen(true)
                        }}
                      >
                        <Button.Icon as={Trash} />
                      </Button.Root>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {mockInvitations.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-warning-lighter to-warning-lighter/50 ring-1 ring-inset ring-warning-base/20 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-warning-light/50">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-warning-base text-white">
                <Plus weight="bold" className="size-4" />
              </div>
              <h2 className="text-label-md text-text-strong-950">Pending Invitations</h2>
            </div>
            <span className="text-paragraph-xs text-warning-dark">{mockInvitations.length} pending</span>
          </div>
          <div className="p-3">
            <div className="space-y-2">
              {mockInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
                  <AvatarWithFallback
                    src={undefined}
                    name={invitation.email}
                    size="40"
                    color="gray"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-sm text-text-strong-950 truncate">{invitation.email}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-text-sub-600 mt-0.5">
                      <span>Role: {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">Sent: {formatDate(invitation.sentAt)}</span>
                      <span>•</span>
                      <span className="text-warning-dark">Expires: {formatDate(invitation.expiresAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button.Root variant="basic" size="xsmall">
                      Resend
                    </Button.Root>
                    <Button.Root variant="ghost" size="xsmall">
                      Cancel
                    </Button.Root>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
          <h2 className="text-label-md text-text-strong-950">Role Permissions</h2>
          <span className="text-paragraph-xs text-text-soft-400">{ROLE_OPTIONS.length} roles</span>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {ROLE_OPTIONS.map((role) => {
              const RoleIcon = getRoleIcon(role.value)
              return (
                <div key={role.value} className="flex items-center gap-3 p-3 rounded-lg bg-bg-weak-50">
                  <div className={cn(
                    "flex size-9 items-center justify-center rounded-lg shrink-0",
                    role.value === 'owner' ? "bg-success-lighter" :
                    role.value === 'admin' ? "bg-warning-lighter" :
                    role.value === 'manager' ? "bg-information-lighter" : "bg-bg-soft-200"
                  )}>
                    <RoleIcon weight="bold" className={cn(
                      "size-4",
                      role.value === 'owner' ? "text-success-base" :
                      role.value === 'admin' ? "text-warning-base" :
                      role.value === 'manager' ? "text-information-base" : "text-text-sub-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-label-sm text-text-strong-950">{role.label}</span>
                      {role.value === 'owner' && (
                        <span className="text-[9px] uppercase tracking-wider text-success-base bg-success-lighter px-1.5 py-0.5 rounded font-medium">
                          Full Access
                        </span>
                      )}
                    </div>
                    <p className="text-paragraph-xs text-text-sub-600 mt-0.5">{role.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteMemberModal open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen} />

      {/* Remove Member Modal */}
      <RemoveMemberModal
        open={isRemoveModalOpen}
        onOpenChange={setIsRemoveModalOpen}
        member={selectedMember}
      />
    </div>
  )
}

// Invite Member Modal
function InviteMemberModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<UserRole>('manager')
  const [message, setMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onOpenChange(false)
      setEmail('')
      setRole('manager')
      setMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Invite Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">
                Email Address <span className="text-error-base">*</span>
              </label>
              <Input.Root>
                <Input.Wrapper>
                  <Input.El
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">
                Role <span className="text-error-base">*</span>
              </label>
              <Radio.Group
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                className="space-y-3"
              >
                {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((option) => {
                  const RoleIcon = getRoleIcon(option.value)
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-10 cursor-pointer transition-colors',
                        'ring-1 ring-inset',
                        role === option.value
                          ? 'ring-primary-base bg-primary-alpha-10'
                          : 'ring-stroke-soft-200 hover:bg-bg-weak-50'
                      )}
                    >
                      <Radio.Item value={option.value} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <RoleIcon className="size-4 text-text-sub-600" />
                          <span className="text-label-sm text-text-strong-950">{option.label}</span>
                        </div>
                        <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </Radio.Group>
            </div>

            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">
                Personal Message (Optional)
              </label>
              <Textarea.Root
                placeholder="Hey! I'm inviting you to join our Hypedrive organization..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <p className="mt-1 text-paragraph-xs text-text-soft-400 text-right">
                {message.length}/200 characters
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 p-3 rounded-10 bg-bg-weak-50">
            <Info className="size-4 text-text-sub-600 shrink-0" />
            <span className="text-paragraph-xs text-text-sub-600">
              Invite expires in 7 days
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="basic" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// Remove Member Modal
function RemoveMemberModal({
  open,
  onOpenChange,
  member,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
}) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleRemove = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!member) return null

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Remove Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex items-center gap-2 p-3 rounded-10 bg-warning-lighter mb-4">
            <Warning className="size-4 text-warning-base shrink-0" />
            <span className="text-paragraph-sm text-warning-dark">
              Remove {member.name} from team?
            </span>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-10 bg-bg-weak-50 mb-4">
            <Avatar.Root size="48" color={getAvatarColor(member.name)}>
              {member.name.charAt(0).toUpperCase()}
            </Avatar.Root>
            <div>
              <div className="text-label-md text-text-strong-950">{member.name}</div>
              <div className="text-paragraph-sm text-text-sub-600">{member.email}</div>
              <div className="text-paragraph-xs text-text-soft-400">
                Role: {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </div>
            </div>
          </div>

          <div className="text-paragraph-sm text-text-sub-600">
            This will:
          </div>
          <List.Root size="sm" className="mt-2">
            <List.Item>
              <List.ItemIcon>
                <span className="size-1.5 rounded-full bg-text-sub-600" />
              </List.ItemIcon>
              <List.ItemContent>
                <List.ItemDescription>Revoke their access immediately</List.ItemDescription>
              </List.ItemContent>
            </List.Item>
            <List.Item>
              <List.ItemIcon>
                <span className="size-1.5 rounded-full bg-text-sub-600" />
              </List.ItemIcon>
              <List.ItemContent>
                <List.ItemDescription>Remove from campaign notifications</List.ItemDescription>
              </List.ItemContent>
            </List.Item>
            <List.Item>
              <List.ItemIcon>
                <span className="size-1.5 rounded-full bg-text-sub-600" />
              </List.ItemIcon>
              <List.ItemContent>
                <List.ItemDescription>Not affect their personal Hypedrive account</List.ItemDescription>
              </List.ItemContent>
            </List.Item>
          </List.Root>
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="basic" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root variant="error" onClick={handleRemove} disabled={isLoading}>
            {isLoading ? 'Removing...' : 'Remove Member'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
