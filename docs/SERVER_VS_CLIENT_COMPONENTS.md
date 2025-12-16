# Server vs Client Components - Complete Guide

## 🎯 Golden Rule

**Default = Server Component (NO "use client" needed)**
**Only add "use client" when absolutely necessary**

---

## ✅ SERVER COMPONENTS (Default - 90% of your code)

### When to Use:
- ✅ Data fetching (async/await)
- ✅ Database queries
- ✅ File system access
- ✅ Environment variables
- ✅ Static content
- ✅ SEO-friendly pages
- ✅ Layouts (mostly)

### What You CAN Do:
```typescript
// ✅ app/dashboard/campaigns/page.tsx - SERVER COMPONENT
import { getCampaignsData } from "@/lib/ssr-data"

export default async function CampaignsPage() {
  // ✅ Can use async/await
  const data = await getCampaignsData()
  
  // ✅ Can access cookies, headers
  const { cookies } = await import("next/headers")
  
  return <CampaignsClient initialData={data} />
}
```

### What You CANNOT Do:
```typescript
// ❌ CANNOT use hooks
const [state, setState] = useState() // ERROR!

// ❌ CANNOT use browser APIs
localStorage.getItem() // ERROR!
window.location // ERROR!

// ❌ CANNOT use event handlers directly
<button onClick={...} /> // ERROR! (unless in client component)
```

---

## 🔴 CLIENT COMPONENTS (Only when needed - 10% of your code)

### When to Use:
- ✅ React hooks (`useState`, `useEffect`, `useRouter`, `useForm`)
- ✅ Browser APIs (`localStorage`, `window`, `document`)
- ✅ Event handlers (`onClick`, `onChange`, `onSubmit`)
- ✅ Third-party libraries that use hooks
- ✅ Interactive UI (forms, buttons, modals)

### Example from Your Codebase:

```typescript
// ✅ app/(auth)/sign-in/page.tsx - MUST be CLIENT COMPONENT
"use client" // ✅ REQUIRED because:

import { useRouter } from "next/navigation" // ✅ Hook
import { useForm } from "react-hook-form" // ✅ Hook
import { useState } from "react" // ✅ Hook

export default function SignInPage() {
  const router = useRouter() // ✅ Hook usage
  const [showPassword, setShowPassword] = useState(false) // ✅ Hook usage
  
  const { register, handleSubmit } = useForm() // ✅ Hook usage
  
  const onSubmit = async (data) => {
    // ✅ Can call server actions
    await signInEmail(data.email, data.password)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}> {/* ✅ Event handler */}
      <button onClick={() => setShowPassword(!showPassword)}> {/* ✅ Event handler */}
        Toggle
      </button>
    </form>
  )
}
```

---

## 🏗️ Best Practice Pattern (Your Current Structure)

### ✅ CORRECT Pattern:

```typescript
// 1. SERVER COMPONENT (page.tsx) - Fetches data
// app/dashboard/campaigns/page.tsx
export default async function CampaignsPage() {
  const data = await getCampaignsData() // ✅ Server-side fetch
  return <CampaignsClient initialData={data} /> // ✅ Pass to client
}

// 2. CLIENT COMPONENT (campaigns-client.tsx) - Handles interactivity
// app/dashboard/campaigns/campaigns-client.tsx
"use client" // ✅ Required for hooks

export function CampaignsClient({ initialData }) {
  const [search, setSearch] = useState("") // ✅ Hook
  const router = useRouter() // ✅ Hook
  
  return (
    <div>
      <input onChange={(e) => setSearch(e.target.value)} /> {/* ✅ Event */}
      {/* Render campaigns */}
    </div>
  )
}
```

---

## 📊 Your Codebase Analysis

### ✅ CORRECTLY Server Components:
- `app/(dashboard)/dashboard/campaigns/page.tsx` ✅
- `app/(dashboard)/dashboard/page.tsx` ✅
- `app/(dashboard)/dashboard/enrollments/page.tsx` ✅
- `app/(auth)/layout.tsx` ✅ (after our fix)

### ✅ CORRECTLY Client Components:
- `app/(auth)/sign-in/page.tsx` ✅ (uses `useForm`, `useState`, `useRouter`)
- `app/(auth)/sign-up/page.tsx` ✅ (uses `useForm`, `useState`)
- `app/(dashboard)/dashboard/campaigns/campaigns-client.tsx` ✅ (uses hooks, event handlers)

### ⚠️ Could Be Improved:
- `app/page.tsx` - Currently client component for mobile menu
  - Could split: Server component + Client component for Navigation

---

## 🎯 Decision Tree

```
Do you need any of these?
├─ React hooks (useState, useEffect, etc.)? → CLIENT
├─ Browser APIs (localStorage, window)? → CLIENT
├─ Event handlers (onClick, onChange)? → CLIENT
├─ Third-party library with hooks? → CLIENT
└─ None of the above? → SERVER ✅
```

---

## 💡 Key Takeaways

1. **Start with Server Component** - Default is server
2. **Add "use client" only when needed** - For hooks, events, browser APIs
3. **Split when possible** - Server component fetches data, Client component handles UI
4. **Your current structure is mostly correct!** ✅

---

## 🔍 Quick Check

**Ask yourself:**
- "Do I need `useState`, `useEffect`, or `onClick`?" → Client Component
- "Am I just fetching data and displaying it?" → Server Component
- "Is this a form or interactive UI?" → Client Component
- "Is this just layout or static content?" → Server Component



