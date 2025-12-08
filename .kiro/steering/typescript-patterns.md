---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx']
---

# TypeScript Development Rules

Follow these TypeScript patterns and best practices.

## Type Definitions

### Interface vs Type

Use `interface` for object shapes that may be extended:
```tsx
interface User {
  id: string
  name: string
  email: string
}

interface AdminUser extends User {
  permissions: string[]
}
```

Use `type` for unions, intersections, and computed types:
```tsx
type Status = 'idle' | 'loading' | 'success' | 'error'
type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type WithId<T> = T & { id: string }
type Nullable<T> = T | null
```

### Component Props

```tsx
// Simple props
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
}

// With HTML element extension
interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary'
}

// With ref forwarding
interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary'
}
```

### Generic Components

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}

// Usage
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

## Next.js 16 Types

### Page Props
```tsx
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page } = await searchParams
  // ...
}
```

### Layout Props
```tsx
type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function Layout({ children, params }: LayoutProps) {
  const { slug } = await params
  return <div>{children}</div>
}
```

### Route Handler
```tsx
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json({ id })
}
```

### Server Actions
```tsx
'use server'

interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export async function createUser(
  formData: FormData
): Promise<ActionResult<User>> {
  try {
    const name = formData.get('name') as string
    const user = await db.user.create({ data: { name } })
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to create user' }
  }
}
```

## Utility Types

### Common Patterns
```tsx
// Make all properties optional
type PartialUser = Partial<User>

// Make all properties required
type RequiredUser = Required<User>

// Pick specific properties
type UserPreview = Pick<User, 'id' | 'name'>

// Omit specific properties
type UserWithoutEmail = Omit<User, 'email'>

// Make properties readonly
type ReadonlyUser = Readonly<User>

// Record for object maps
type UserMap = Record<string, User>

// Extract from union
type SuccessStatus = Extract<Status, 'success'>

// Exclude from union
type PendingStatus = Exclude<Status, 'success' | 'error'>
```

### Custom Utility Types
```tsx
// Make specific keys optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific keys required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Non-nullable
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}
```

## Type Guards

```tsx
// Type predicate
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

// Discriminated union guard
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success
}

// Usage
const result = await fetchUser()
if (isSuccess(result)) {
  console.log(result.data) // TypeScript knows data exists
} else {
  console.error(result.error) // TypeScript knows error exists
}
```

## Assertion Functions

```tsx
function assertDefined<T>(
  value: T | null | undefined,
  message = 'Value is not defined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message)
  }
}

// Usage
const user = await getUser(id)
assertDefined(user, 'User not found')
// TypeScript now knows user is defined
console.log(user.name)
```

## Const Assertions

```tsx
// Array as tuple
const colors = ['red', 'green', 'blue'] as const
type Color = typeof colors[number] // 'red' | 'green' | 'blue'

// Object as readonly
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const

type Config = typeof config
// { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }
```

## Template Literal Types

```tsx
type EventName = 'click' | 'focus' | 'blur'
type HandlerName = `on${Capitalize<EventName>}` // 'onClick' | 'onFocus' | 'onBlur'

type CSSProperty = 'margin' | 'padding'
type CSSDirection = 'top' | 'right' | 'bottom' | 'left'
type CSSSpacing = `${CSSProperty}-${CSSDirection}` // 'margin-top' | 'margin-right' | ...
```

## Zod Schema Inference

```tsx
import { z } from 'zod'

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.date(),
})

// Infer type from schema
type User = z.infer<typeof userSchema>

// Usage in server action
export async function createUser(formData: FormData) {
  const result = userSchema.safeParse({
    id: crypto.randomUUID(),
    name: formData.get('name'),
    email: formData.get('email'),
    role: 'user',
    createdAt: new Date(),
  })

  if (!result.success) {
    return { error: result.error.flatten() }
  }

  const user: User = result.data
  // ...
}
```

## API Response Types

```tsx
// Generic API response
interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    totalPages: number
    totalItems: number
  }
}

// Error response
interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}

// Combined result type
type ApiResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

// Usage
async function fetchUsers(): Promise<ApiResult<User[]>> {
  try {
    const response = await fetch('/api/users')
    if (!response.ok) {
      const error = await response.json()
      return { ok: false, error }
    }
    const data = await response.json()
    return { ok: true, data }
  } catch {
    return { ok: false, error: { message: 'Network error', code: 'NETWORK_ERROR' } }
  }
}
```

## Best Practices

1. **Enable strict mode** - Use `"strict": true` in tsconfig.json
2. **Avoid `any`** - Use `unknown` and narrow with type guards
3. **Use `satisfies`** - For type checking without widening
4. **Prefer interfaces** - For object shapes that may be extended
5. **Use discriminated unions** - For state machines and results
6. **Export types** - Use `export type` for type-only exports
7. **Avoid type assertions** - Use type guards instead of `as`
8. **Document complex types** - Add JSDoc comments for clarity
