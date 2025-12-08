---
inclusion: always
---
# React Component Development Rules

Follow these patterns for React components in this Next.js 16 project.

## Component Structure

### Server Components (Default)

```tsx
// components/product-card.tsx
import { type Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <div className={cn('rounded-20 bg-bg-white-0 p-4', className)}>
      <h3 className="text-label-md text-text-strong-950">{product.name}</h3>
      <p className="text-paragraph-sm text-text-sub-600">{product.description}</p>
    </div>
  )
}
```

### Client Components

Only use `'use client'` when necessary:

```tsx
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface CounterProps {
  initialCount?: number
  onCountChange?: (count: number) => void
}

export function Counter({ initialCount = 0, onCountChange }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  const increment = useCallback(() => {
    setCount(prev => {
      const newCount = prev + 1
      onCountChange?.(newCount)
      return newCount
    })
  }, [onCountChange])

  return (
    <div className="flex items-center gap-4">
      <span className="text-label-lg">{count}</span>
      <Button onClick={increment}>Increment</Button>
    </div>
  )
}
```

## Props Patterns

### With Children
```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div className={cn(cardVariants[variant], className)}>
      {children}
    </div>
  )
}
```

### Extending HTML Elements
```tsx
import { forwardRef, type ComponentPropsWithoutRef } from 'react'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

## Composition Pattern

Compose Server and Client Components:

```tsx
// app/dashboard/page.tsx (Server Component)
import { ClientInteraction } from './client-interaction'
import { ServerData } from './server-data'

export default async function DashboardPage() {
  const data = await fetchData()
  
  return (
    <div>
      <ServerData data={data} />
      <ClientInteraction initialData={data} />
    </div>
  )
}
```

## Custom Hooks

### Data Fetching Hook
```tsx
// hooks/use-api.ts
'use client'

import { useState, useEffect } from 'react'

interface UseApiOptions<T> {
  initialData?: T
  enabled?: boolean
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { initialData, enabled = true } = options
  const [data, setData] = useState<T | undefined>(initialData)
  const [isLoading, setIsLoading] = useState(!initialData && enabled)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    setIsLoading(true)

    fetcher()
      .then(result => {
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled])

  return { data, isLoading, error }
}
```

### Local Storage Hook
```tsx
// hooks/use-local-storage.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
```

## Event Handlers

```tsx
'use client'

import { useCallback, type MouseEvent, type KeyboardEvent } from 'react'

export function InteractiveCard() {
  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Handle click
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // Handle activation
    }
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus:outline-none focus:ring-2"
    >
      Interactive content
    </div>
  )
}
```

## Form Handling with Server Actions

```tsx
// app/actions.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
})

export async function submitForm(formData: FormData) {
  const result = schema.safeParse({
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!result.success) {
    return { error: result.error.flatten() }
  }

  // Process form
  return { success: true }
}
```

```tsx
// components/contact-form.tsx
'use client'

import { useActionState } from 'react'
import { submitForm } from '@/app/actions'

export function ContactForm() {
  const [state, action, pending] = useActionState(submitForm, null)

  return (
    <form action={action} className="space-y-4">
      <input
        type="email"
        name="email"
        placeholder="Email"
        disabled={pending}
        className="w-full rounded-10 border border-stroke-soft-200 px-4 py-2"
      />
      <textarea
        name="message"
        placeholder="Message"
        disabled={pending}
        className="w-full rounded-10 border border-stroke-soft-200 px-4 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-primary-base text-white px-4 py-2 rounded-10"
      >
        {pending ? 'Sending...' : 'Send'}
      </button>
      {state?.error && (
        <p className="text-error-base text-paragraph-sm">{state.error}</p>
      )}
    </form>
  )
}
```

## Conditional Rendering

```tsx
interface UserProfileProps {
  user: User | null
  isLoading: boolean
}

export function UserProfile({ user, isLoading }: UserProfileProps) {
  if (isLoading) {
    return <UserProfileSkeleton />
  }

  if (!user) {
    return <EmptyState message="User not found" />
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={user.avatar} alt={user.name} />
      <div>
        <p className="text-label-md text-text-strong-950">{user.name}</p>
        <p className="text-paragraph-sm text-text-sub-600">{user.email}</p>
      </div>
    </div>
  )
}
```

## List Rendering

```tsx
interface ItemListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
}

export function ItemList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items',
}: ItemListProps<T>) {
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}
```

## Error Boundaries

```tsx
'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 bg-error-lighter rounded-10">
          <p className="text-error-dark">Something went wrong</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Best Practices

1. **Prefer Server Components** - Only use `'use client'` when necessary
2. **Colocate related code** - Keep components, hooks, and types together
3. **Use TypeScript strictly** - Define interfaces for all props
4. **Forward refs** - Use `forwardRef` for reusable components
5. **Memoize callbacks** - Use `useCallback` for event handlers passed as props
6. **Handle loading states** - Always show loading indicators
7. **Handle error states** - Provide meaningful error messages
8. **Use semantic HTML** - Choose appropriate elements (button, a, etc.)
9. **Ensure accessibility** - Add ARIA attributes and keyboard support
