# Next.js 15 - Convention Over Configuration Guide

**Rails-like approach for Next.js 15** - Follow conventions, write less code, build faster.

> **Core Principle:** One way to do things. Follow folder structure, get features automatically. No configuration unless absolutely necessary.

---

## Quick Start

```bash
# Create project
npx create-next-app@latest my-app
cd my-app

# Development
npm run dev

# Build
npm run build
```

---

## Project Structure (Conventions)

### Next.js 15 Structure (App Router)

```
my-app/
├── app/                    # App Router (Next.js 13+)
│   ├── (auth)/            # Route groups
│   │   ├── login/
│   │   │   └── page.tsx  # → /login
│   │   └── register/
│   │       └── page.tsx  # → /register
│   ├── dashboard/
│   │   ├── page.tsx      # → /dashboard
│   │   ├── layout.tsx    # Layout for /dashboard/*
│   │   └── [id]/
│   │       └── page.tsx  # → /dashboard/:id
│   ├── api/              # API routes
│   │   └── users/
│   │       └── route.ts  # → /api/users
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # → /
│   ├── loading.tsx       # Loading UI
│   ├── error.tsx         # Error UI
│   ├── not-found.tsx     # 404 page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/              # UI components
│   │   └── button.tsx   # → <Button />
│   └── shared/          # Shared components
├── lib/                  # Utility functions
│   └── utils.ts
├── public/               # Static files
├── types/                # TypeScript types
├── next.config.ts        # Next.js configuration
└── package.json
```

**Rule:** Follow this structure. Next.js handles routing automatically.

### File Naming Conventions

```
✅ Pages:         page.tsx/jsx        → Route
✅ Layouts:       layout.tsx/jsx      → Layout wrapper
✅ Loading:       loading.tsx/jsx     → Loading UI
✅ Error:         error.tsx/jsx       → Error UI
✅ Not Found:     not-found.tsx/jsx   → 404 page
✅ API Routes:    route.ts/js         → API endpoint
✅ Components:    PascalCase          → Button.tsx, UserCard.tsx
✅ Utils:         camelCase           → formatDate.ts, validateEmail.ts
✅ Types:         camelCase           → user.ts, api.ts
```

**Rule:** Follow naming conventions. Next.js auto-detects based on these patterns.

### Next.js 15 Benefits

- **App Router** - Modern routing with layouts and nested routes
- **Server Components** - Default, no 'use client' needed
- **Streaming SSR** - Faster page loads with streaming
- **React Server Actions** - Server mutations without API routes
- **Better TypeScript** - Improved type safety and inference

---

## File-Based Routing (App Router)

### Pages = Routes

```tsx
// app/page.tsx → /
export default function HomePage() {
  return <div>Home</div>
}

// app/about/page.tsx → /about
export default function AboutPage() {
  return <div>About</div>
}

// app/users/[id]/page.tsx → /users/:id
export default function UserPage({ params }: { params: { id: string } }) {
  return <div>User ID: {params.id}</div>
}

// app/docs/[...slug]/page.tsx → /docs/*
export default function DocsPage({ params }: { params: { slug: string[] } }) {
  return <div>Docs: {params.slug.join('/')}</div>
}
```

### Route Groups

```tsx
// app/(auth)/login/page.tsx → /login (no (auth) in URL)
// app/(auth)/register/page.tsx → /register
// Use for shared layouts without affecting URL
```

### Dynamic Routes

```tsx
// app/products/[category]/[id]/page.tsx → /products/:category/:id
export default function ProductPage({
  params
}: {
  params: { category: string; id: string }
}) {
  return (
    <div>
      <p>Category: {params.category}</p>
      <p>Product ID: {params.id}</p>
    </div>
  )
}
```

### Page Metadata

```tsx
// app/dashboard/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'User dashboard'
}

export default function DashboardPage() {
  return <div>Dashboard</div>
}
```

### Navigation

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const router = useRouter()

  return (
    <div>
      {/* Use Link for navigation */}
      <Link href="/about">About</Link>
      <Link href={{ pathname: '/users', query: { id: '123' } }}>
        User 123
      </Link>

      {/* Programmatic navigation */}
      <button onClick={() => router.push('/dashboard')}>Go</button>
      <button onClick={() => router.replace('/login')}>Replace</button>
    </div>
  )
}
```

---

## Components

### Server Components (Default)

```tsx
// components/UserCard.tsx - Server Component (default)
// No 'use client' directive

interface UserCardProps {
  name: string
  email: string
}

export default function UserCard({ name, email }: UserCardProps) {
  // Can use async/await directly
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  )
}
```

### Client Components

```tsx
'use client'

// components/Counter.tsx - Client Component
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

### Component Best Practices

✅ **DO:**
- Use Server Components by default
- Only use 'use client' when needed (hooks, events, browser APIs)
- Keep Client Components small and focused
- Pass Server Component data as props to Client Components

❌ **DON'T:**
- Don't use 'use client' unnecessarily
- Don't import Client Components in Server Components (pass as children)
- Don't use hooks in Server Components
- Don't use browser APIs in Server Components

### Component Template

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  disabled = false,
  onClick,
  children
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

---

## Data Fetching

### Server Components (Recommended)

```tsx
// app/users/page.tsx - Server Component
async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    cache: 'no-store' // or 'force-cache', 'revalidate'
  })
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      {users.map((user: any) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Fetch Options

```tsx
// Static (default)
fetch(url, { cache: 'force-cache' })

// Dynamic
fetch(url, { cache: 'no-store' })

// Revalidate
fetch(url, { next: { revalidate: 3600 } }) // 1 hour

// ISR
export const revalidate = 3600
```

### Client-Side Fetching

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function ClientData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setData)
  }, [])

  return <div>{data && JSON.stringify(data)}</div>
}
```

### Rules

✅ **DO:**
- Use Server Components for data fetching (default)
- Use `fetch` in Server Components
- Use `useEffect` + `fetch` in Client Components
- Use React Query/SWR for complex client-side data

❌ **DON'T:**
- Don't use `fetch` in Client Components without `useEffect`
- Don't use `useState` + `fetch` in Server Components
- Don't forget error handling

---

## Server Actions

### Basic Server Action

```tsx
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  // Server-side validation
  if (!name || !email) {
    return { error: 'Name and email required' }
  }

  // Save to database
  const user = await db.users.create({ name, email })

  return { success: true, user }
}
```

### Using Server Actions

```tsx
// app/users/page.tsx
import { createUser } from './actions'

export default function UsersPage() {
  return (
    <form action={createUser}>
      <input name="name" type="text" />
      <input name="email" type="email" />
      <button type="submit">Create User</button>
    </form>
  )
}
```

### With useTransition

```tsx
'use client'

import { useTransition } from 'react'
import { createUser } from './actions'

export default function UserForm() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createUser(formData)
    })
  }

  return (
    <form action={handleSubmit}>
      <input name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

---

## API Routes

### Convention

```
app/api/
├── users/
│   └── route.ts        # GET, POST /api/users
└── users/[id]/
    └── route.ts        # GET, PUT, DELETE /api/users/:id
```

### Basic API Route

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = await getUsers()
  return NextResponse.json({ users })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: 'Name and email required' },
      { status: 400 }
    )
  }

  const user = await createUser(body)
  return NextResponse.json({ user }, { status: 201 })
}
```

### Dynamic API Route

```tsx
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserById(params.id)
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ user })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const user = await updateUser(params.id, body)
  return NextResponse.json({ user })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deleteUser(params.id)
  return NextResponse.json({ success: true })
}
```

---

## Layouts

### Root Layout

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'App description'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>Header</header>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  )
}
```

### Nested Layout

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  )
}
```

---

## Middleware

### Basic Middleware

```tsx
// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*'
}
```

### Advanced Middleware

```tsx
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add custom header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}
```

---

## State Management

### Server State (Server Components)

```tsx
// app/users/page.tsx
async function getUsers() {
  const res = await fetch('https://api.example.com/users')
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()
  return <UsersList users={users} />
}
```

### Client State (Client Components)

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

### Global State (Zustand/Context)

```tsx
// lib/store.ts
import { create } from 'zustand'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] }))
}))
```

---

## TypeScript

### Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}
```

### Types

```tsx
// types/user.ts
export interface User {
  id: string
  name: string
  email: string
}

// Usage
import type { User } from '@/types/user'
```

---

## Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com
```

```tsx
// Server-side (all .env variables)
const dbUrl = process.env.DATABASE_URL

// Client-side (only NEXT_PUBLIC_* variables)
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

---

## Error Handling

### Error Page

```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Not Found Page

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  )
}
```

### Loading UI

```tsx
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}
```

---

## Forms

### Server Action Form

```tsx
// app/actions.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  if (!name || !email) {
    return { error: 'Name and email required' }
  }

  const user = await db.users.create({ name, email })
  return { success: true, user }
}
```

```tsx
// app/users/new/page.tsx
import { createUser } from '../actions'

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="name" type="text" required />
      <input name="email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  )
}
```

---

## Next.js 15 Features

- **App Router** - Modern routing with layouts and nested routes
- **Server Components** - Default, better performance
- **Server Actions** - Server mutations without API routes
- **Streaming SSR** - Faster page loads
- **React Compiler** - Automatic optimizations
- **Turbopack** - Faster bundler (beta)

---

## Best Practices

### ✅ DO

1. **Use App Router** - Modern routing system
2. **Use Server Components** - Default, better performance
3. **Use Server Actions** - For mutations instead of API routes
4. **Use 'use client' sparingly** - Only when needed
5. **Use TypeScript** - Strict mode enabled
6. **Use metadata API** - For SEO
7. **Use loading.tsx** - For loading states
8. **Use error.tsx** - For error boundaries
9. **Use route groups** - For organization without affecting URLs
10. **Use fetch caching** - Appropriate cache strategies
11. **Use Server Actions** - For form submissions
12. **Use middleware** - For auth and redirects
13. **Use dynamic imports** - For code splitting
14. **Use Image component** - Optimized images
15. **Use Font optimization** - next/font

### ❌ DON'T

1. **Don't use 'use client' unnecessarily** - Server Components are default
2. **Don't use Pages Router** - Use App Router (Next.js 13+)
3. **Don't use API routes for mutations** - Use Server Actions
4. **Don't use useEffect for data fetching** - Use Server Components
5. **Don't use getServerSideProps** - Use Server Components
6. **Don't use getStaticProps** - Use fetch with caching
7. **Don't expose secrets** - Use environment variables properly
8. **Don't use client-side routing unnecessarily** - Use Link component
9. **Don't forget error handling** - Always handle errors
10. **Don't skip TypeScript** - Always use strict mode
11. **Don't use inline styles** - Use CSS modules or Tailwind
12. **Don't forget metadata** - Use metadata API for SEO
13. **Don't use document/window in Server Components** - Use Client Components
14. **Don't forget loading states** - Use loading.tsx
15. **Don't skip optimization** - Use Image, Font, and dynamic imports

---

## Common Patterns

### Authentication

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*'
}
```

### API Client Pattern

```tsx
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchUsers() {
  const res = await fetch(`${API_URL}/users`, {
    cache: 'no-store'
  })
  return res.json()
}
```

---

## Troubleshooting

- **Component not rendering:** Check if it's Server or Client Component
- **'use client' not working:** Ensure it's at the top of the file
- **API route not working:** Check route.ts file exists, export correct HTTP methods
- **TypeScript errors:** Run `npm run typecheck`, ensure strict mode enabled
- **Hydration mismatch:** Check for client-only code in Server Components

---

## Testing

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

```tsx
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

---

## Deployment

```bash
npm run build      # Production build
npm run start      # Start production server
```

**Vercel:** Auto-detects Next.js. No config needed.

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Common Libraries

```bash
npm install zustand              # State management
npm install @tanstack/react-query # Data fetching
npm install react-hook-form      # Form handling
npm install zod                   # Validation
npm install tailwindcss          # Styling
```

---

## Configuration

### next.config.ts

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com']
  },
  experimental: {
    serverActions: true
  }
}

export default nextConfig
```

---

## Resources

- [Next.js 15 Docs](https://nextjs.org)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Remember:** Convention over Configuration. Follow the structure, write less code, build faster. 🚀

**Last Updated:** 2024  
**Next.js Version:** 15.0+  
**Maintained by:** Corey (AI Assistant)



