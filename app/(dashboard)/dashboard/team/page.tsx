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
  RiAddLine,
  RiUserLine,
  RiMailLine,
  RiTimeLine,
  RiDeleteBinLine,
  RiTeamLine,
  RiShieldUserLine,
  RiUserSettingsLine,
  RiEyeLine,
  RiInformationLine,
  RiAlertLine,
} from '@remixicon/react'
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
      return RiShieldUserLine
    case 'admin':
      return RiUserSettingsLine
    case 'manager':
      return RiUserLine
    case 'viewer':
      return RiEyeLine
    default:
      return RiUserLine
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">Team</h1>
          <p className="text-paragraph-sm text-text-sub-600 mt-1">
            Manage team members and their roles
          </p>
        </div>
        <Button.Root variant="primary" onClick={() => setIsInviteModalOpen(true)}>
          <Button.Icon as={RiAddLine} />
          Invite Member
        </Button.Root>
      </div>

      {/* Stats Overview */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <MetricGroup columns={4}>
            <Metric label="Total Members" value={stats.total} size="sm" />
            <Metric label="Admins" value={stats.admins} size="sm" />
            <Metric label="Managers" value={stats.managers} size="sm" />
            <Metric 
              label="Pending Invites" 
              value={stats.pending} 
              size="sm"
              className={stats.pending > 0 ? '[&>div>span:last-child]:text-warning-base' : ''}
            />
          </MetricGroup>
        </div>
        <div className="md:w-auto">
          <AvatarGroup.Root max={6} size="40">
            {mockMembers.map((member) => (
              <AvatarGroup.Item key={member.id}>
                <Avatar.Root size="40" color={getAvatarColor(member.name)}>
                  {member.name.charAt(0).toUpperCase()}
                </Avatar.Root>
              </AvatarGroup.Item>
            ))}
          </AvatarGroup.Root>
        </div>
      </div>

      {/* Team Members - Using List */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
        <h2 className="text-label-md text-text-strong-950 mb-4">Team Members</h2>
        <List.Root variant="divided" size="lg">
          {mockMembers.map((member) => {
            const isCurrentUser = member.id === currentUserId
            const isOwner = member.role === 'owner'
            const RoleIcon = getRoleIcon(member.role)

            return (
              <List.Item key={member.id} className="py-4">
                <List.ItemIcon>
                  <AvatarWithFallback
                    src={member.avatar}
                    name={member.name}
                    size="48"
                    color={getAvatarColor(member.name)}
                  />
                </List.ItemIcon>
                <List.ItemContent>
                  <div className="flex items-center gap-2">
                    <List.ItemTitle>{member.name}</List.ItemTitle>
                    {isCurrentUser && (
                      <span className="text-paragraph-xs text-text-soft-400">(You)</span>
                    )}
                  </div>
                  <List.ItemDescription>{member.email}</List.ItemDescription>
                  <span className="text-paragraph-xs text-text-soft-400">
                    Joined {formatDate(member.joinedAt)}
                  </span>
                </List.ItemContent>
                <List.ItemAction>
                  <div className="flex items-center gap-3">
                    <StatusBadge.Root status={getRoleStatus(member.role)} variant="light">
                      <StatusBadge.Icon as={RoleIcon} />
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </StatusBadge.Root>
                    {!isCurrentUser && !isOwner && (
                      <div className="flex items-center gap-2">
                        <Select.Root
                          value={member.role}
                          onValueChange={() => {}}
                        >
                          <Select.Trigger className="w-32">
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
                          <Button.Icon as={RiDeleteBinLine} />
                        </Button.Root>
                      </div>
                    )}
                  </div>
                </List.ItemAction>
              </List.Item>
            )
          })}
        </List.Root>
      </div>

      {/* Pending Invitations */}
      {mockInvitations.length > 0 && (
        <div className="rounded-20 bg-warning-lighter ring-1 ring-inset ring-warning-light p-5">
          <h2 className="text-label-md text-text-strong-950 mb-4">Pending Invitations</h2>
          <List.Root size="md">
            {mockInvitations.map((invitation) => (
              <List.Item key={invitation.id} className="p-4 rounded-10 bg-bg-white-0">
                  <List.ItemIcon>
                    <AvatarWithFallback
                      src={undefined}
                      name={invitation.email}
                      size="40"
                      color="gray"
                    />
                  </List.ItemIcon>
                <List.ItemContent>
                  <List.ItemTitle>{invitation.email}</List.ItemTitle>
                  <List.ItemDescription>
                    Role: {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)} • 
                    Sent: {formatDate(invitation.sentAt)} • 
                    Expires: {formatDate(invitation.expiresAt)}
                  </List.ItemDescription>
                </List.ItemContent>
                <List.ItemAction>
                  <div className="flex items-center gap-2">
                    <Button.Root variant="basic" size="small">
                      Resend
                    </Button.Root>
                    <Button.Root variant="ghost" size="small">
                      Cancel
                    </Button.Root>
                  </div>
                </List.ItemAction>
              </List.Item>
            ))}
          </List.Root>
        </div>
      )}

      {/* Role Permissions - Using DataTable */}
      <div className="rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
        <h2 className="text-label-md text-text-strong-950 mb-4">Role Permissions</h2>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Role</Table.Head>
              <Table.Head>Permissions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ROLE_OPTIONS.map((role) => {
              const RoleIcon = getRoleIcon(role.value)
              return (
                <Table.Row key={role.value}>
                  <Table.Cell>
                    <StatusBadge.Root status={getRoleStatus(role.value)} variant="light">
                      <StatusBadge.Icon as={RoleIcon} />
                      {role.label}
                    </StatusBadge.Root>
                  </Table.Cell>
                  <Table.Cell className="text-text-sub-600">
                    {role.description}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
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
            <RiInformationLine className="size-4 text-text-sub-600 shrink-0" />
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
            <RiAlertLine className="size-4 text-warning-base shrink-0" />
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
