---
inclusion: manual
---
# UI Component Guidelines

This project uses a custom UI component library based on AlignUI. Follow these patterns.

## Available Components

The `components/ui/` directory contains reusable components:

### Core Components
- `button.tsx` - Primary button component
- `input.tsx` - Text input with variants
- `textarea.tsx` - Multi-line text input
- `select.tsx` - Dropdown select
- `checkbox.tsx` - Checkbox input
- `radio.tsx` - Radio button group
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider

### Layout Components
- `card.tsx` - Content card container
- `modal.tsx` - Dialog modal
- `drawer.tsx` - Slide-out drawer
- `popover.tsx` - Popover tooltip
- `dropdown.tsx` - Dropdown menu
- `accordion.tsx` - Collapsible sections
- `divider.tsx` - Visual separator
- `grid.tsx` - Grid layout helper

### Feedback Components
- `alert.tsx` - Alert messages
- `callout.tsx` - Callout boxes
- `notification.tsx` - Toast notifications
- `skeleton.tsx` - Loading skeletons
- `progress-bar.tsx` - Progress indicator
- `progress-circle.tsx` - Circular progress

### Navigation Components
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Page navigation
- `tab-menu-horizontal.tsx` - Horizontal tabs
- `tab-menu-vertical.tsx` - Vertical tabs

### Data Display
- `table.tsx` - Data table
- `data-table.tsx` - Advanced data table
- `badge.tsx` - Status badges
- `tag.tsx` - Tags/chips
- `avatar.tsx` - User avatars
- `avatar-group.tsx` - Grouped avatars
- `tooltip.tsx` - Hover tooltips

## Component Usage Patterns

### Button
```tsx
import { Button } from '@/components/ui/button'

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// With icons
<Button>
  <PlusIcon className="size-4 mr-2" />
  Add Item
</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Hint } from '@/components/ui/hint'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    error={errors.email}
  />
  <Hint error={errors.email}>
    {errors.email || 'We will never share your email'}
  </Hint>
</div>
```

### Card
```tsx
import { Card } from '@/components/ui/card'

<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description text</Card.Description>
  </Card.Header>
  <Card.Content>
    Main content goes here
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Modal
```tsx
import { Modal } from '@/components/ui/modal'

<Modal open={isOpen} onOpenChange={setIsOpen}>
  <Modal.Trigger asChild>
    <Button>Open Modal</Button>
  </Modal.Trigger>
  <Modal.Content>
    <Modal.Header>
      <Modal.Title>Modal Title</Modal.Title>
      <Modal.Description>Modal description</Modal.Description>
    </Modal.Header>
    <div className="py-4">
      Modal content
    </div>
    <Modal.Footer>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button>Confirm</Button>
    </Modal.Footer>
  </Modal.Content>
</Modal>
```

### Dropdown
```tsx
import { Dropdown } from '@/components/ui/dropdown'

<Dropdown>
  <Dropdown.Trigger asChild>
    <Button variant="ghost">
      <MoreHorizontalIcon className="size-4" />
    </Button>
  </Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Item onClick={handleEdit}>
      <EditIcon className="size-4 mr-2" />
      Edit
    </Dropdown.Item>
    <Dropdown.Item onClick={handleDuplicate}>
      <CopyIcon className="size-4 mr-2" />
      Duplicate
    </Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item onClick={handleDelete} destructive>
      <TrashIcon className="size-4 mr-2" />
      Delete
    </Dropdown.Item>
  </Dropdown.Content>
</Dropdown>
```

### Table
```tsx
import { Table } from '@/components/ui/table'

<Table>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Email</Table.Head>
      <Table.Head>Status</Table.Head>
      <Table.Head className="text-right">Actions</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {users.map((user) => (
      <Table.Row key={user.id}>
        <Table.Cell>{user.name}</Table.Cell>
        <Table.Cell>{user.email}</Table.Cell>
        <Table.Cell>
          <Badge variant={user.active ? 'success' : 'neutral'}>
            {user.active ? 'Active' : 'Inactive'}
          </Badge>
        </Table.Cell>
        <Table.Cell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

### Avatar
```tsx
import { Avatar } from '@/components/ui/avatar'
import { AvatarGroup } from '@/components/ui/avatar-group'

// Single avatar
<Avatar
  src={user.avatar}
  alt={user.name}
  fallback={user.name.charAt(0)}
  size="md"
/>

// Avatar group
<AvatarGroup max={3}>
  {users.map((user) => (
    <Avatar key={user.id} src={user.avatar} alt={user.name} />
  ))}
</AvatarGroup>
```

### Badge
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">New</Badge>
<Badge variant="neutral">Draft</Badge>
```

### Tabs
```tsx
import { TabMenuHorizontal } from '@/components/ui/tab-menu-horizontal'

<TabMenuHorizontal defaultValue="overview">
  <TabMenuHorizontal.List>
    <TabMenuHorizontal.Trigger value="overview">Overview</TabMenuHorizontal.Trigger>
    <TabMenuHorizontal.Trigger value="analytics">Analytics</TabMenuHorizontal.Trigger>
    <TabMenuHorizontal.Trigger value="settings">Settings</TabMenuHorizontal.Trigger>
  </TabMenuHorizontal.List>
  <TabMenuHorizontal.Content value="overview">
    Overview content
  </TabMenuHorizontal.Content>
  <TabMenuHorizontal.Content value="analytics">
    Analytics content
  </TabMenuHorizontal.Content>
  <TabMenuHorizontal.Content value="settings">
    Settings content
  </TabMenuHorizontal.Content>
</TabMenuHorizontal>
```

### Skeleton
```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Loading state
<div className="space-y-4">
  <Skeleton className="h-8 w-48" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>

// Card skeleton
<Card>
  <Card.Header>
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-4 w-48" />
  </Card.Header>
  <Card.Content>
    <Skeleton className="h-32 w-full" />
  </Card.Content>
</Card>
```

### Notification/Toast
```tsx
import { useNotification } from '@/hooks/use-notification'

function MyComponent() {
  const { notify } = useNotification()

  const handleSuccess = () => {
    notify({
      title: 'Success!',
      description: 'Your changes have been saved.',
      variant: 'success',
    })
  }

  const handleError = () => {
    notify({
      title: 'Error',
      description: 'Something went wrong. Please try again.',
      variant: 'error',
    })
  }

  return <Button onClick={handleSuccess}>Save</Button>
}
```

## Creating New Components

When creating new UI components:

1. **Follow the file structure**:
```tsx
// components/ui/new-component.tsx
'use client' // Only if needed

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

interface NewComponentProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'outlined'
}

export const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-classes',
          variant === 'outlined' && 'border border-stroke-soft-200',
          className
        )}
        {...props}
      />
    )
  }
)
NewComponent.displayName = 'NewComponent'
```

2. **Use semantic AlignUI tokens** for colors
3. **Support className prop** for customization
4. **Forward refs** for DOM access
5. **Add TypeScript types** for all props
6. **Document with examples** in component file
