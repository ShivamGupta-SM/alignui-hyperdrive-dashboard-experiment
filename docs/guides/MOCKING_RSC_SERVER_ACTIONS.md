# Mocking for Next.js 16 RSC + Server Actions

## Current Setup Analysis

**Current:** MSW (Mock Service Worker) - Works for client-side but has limitations with Server Actions

**Challenge:** Server Actions run on the server, so client-side MSW can't intercept them directly.

---

## Best Solutions for RSC + Server Actions

### Option 1: Enhanced MSW with Server-Side Interception ✅ **RECOMMENDED**

**Pros:**
- Already set up in your project
- Works for both client and server
- Good developer experience

**Implementation:**
- MSW server setup intercepts `fetch` calls in RSC
- MSW browser setup intercepts client-side calls
- Works because Server Actions use `fetch` internally

**Your current setup already supports this!** Just needs better configuration.

---

### Option 2: Next.js Experimental Testmode (For Testing Only)

**Pros:**
- Official Next.js solution
- Great for E2E testing with Playwright
- Integrates MSW automatically

**Cons:**
- Only for testing, not development
- Still experimental

**When to use:** E2E tests with Playwright

---

### Option 3: Scenarist (Newer Alternative)

**Pros:**
- Built specifically for Node.js/server-side
- Better test isolation
- Parallel test support

**Cons:**
- Newer, less community support
- Requires migration from MSW

**When to use:** If you need better test isolation

---

### Option 4: Mock Encore Client (Custom Solution)

**Pros:**
- Full control
- Works perfectly with RSC
- No network interception needed

**Cons:**
- More code to maintain
- Need to mock entire client

**When to use:** If you want complete control

---

## Recommended: Enhanced MSW Setup

Your current MSW setup is good! Here's how to make it work better with RSC:

### 1. Ensure Server-Side MSW is Properly Initialized

MSW server already intercepts `fetch` in RSC because Server Actions use `fetch` internally.

### 2. Add Better Error Handling

```typescript
// mocks/index.ts - Enhanced version
export async function initMocks() {
  if (process.env.NODE_ENV !== "development") {
    return
  }

  if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") {
    return
  }

  if (typeof window === "undefined") {
    // Server-side: intercepts RSC and Server Actions
    const { server } = await import("./server")
    server.listen({
      onUnhandledRequest: (req) => {
        // Log unhandled requests for debugging
        if (req.url.includes('localhost:4000')) {
          console.warn(`[MSW] Unhandled server request: ${req.method} ${req.url}`)
        }
        return 'bypass'
      },
    })
    console.log("[MSW] Server mocking enabled (RSC + Server Actions)")
  } else {
    // Client-side: intercepts client components
    const { worker, startOptions } = await import("./browser")
    await worker.start(startOptions)
    console.log("[MSW] Browser mocking enabled")
  }
}
```

### 3. Create Server Action Mock Helpers

```typescript
// mocks/utils/server-action-helpers.ts
/**
 * Helper to mock Server Actions in tests
 * Server Actions use fetch internally, so MSW intercepts them
 */

export function mockServerAction<T>(
  actionName: string,
  mockResponse: T
) {
  // MSW will intercept the fetch call made by Server Action
  // Just ensure your handler matches the endpoint
  return mockResponse
}
```

---

## Testing Strategy

### For Development Mocking (Current Setup ✅)

**Use:** MSW (what you have now)
- Works for both RSC and client components
- Intercepts `fetch` calls automatically
- Good DX with DevTools

### For E2E Testing

**Use:** Next.js Experimental Testmode + Playwright

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from 'next/experimental/testmode/playwright'
import { http, HttpResponse } from 'next/experimental/testmode/playwright/msw'

test('dashboard loads data', async ({ page, msw }) => {
  msw.use(
    http.get('http://localhost:4000/organizations/:id/dashboard', () => {
      return HttpResponse.json({
        stats: { /* mock data */ },
        // ...
      })
    })
  )

  await page.goto('/dashboard')
  await expect(page.getByText('Dashboard')).toBeVisible()
})
```

### For Unit Testing Server Actions

**Use:** MSW Node Server

```typescript
// __tests__/actions/dashboard.test.ts
import { server } from '@/mocks/server'
import { getDashboardData } from '@/lib/ssr-data'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('getDashboardData returns mock data', async () => {
  const data = await getDashboardData()
  expect(data.stats).toBeDefined()
})
```

---

## Quick Fixes for Your Current Setup

### 1. Ensure Server MSW Initializes Early

```typescript
// app/providers.tsx or app/layout.tsx
// Add at the top level
if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  // Initialize server MSW early
  import('@/mocks').then(({ initMocks }) => initMocks())
}
```

### 2. Better Handler Organization

```typescript
// mocks/handlers/index.ts
export const handlers = [
  // Server Actions (RSC) handlers
  ...dashboardHandlers,
  ...campaignHandlers,
  // Client-side handlers
  ...notificationHandlers,
]
```

---

## Migration to Scenarist (Optional Future)

If you want better server-side mocking:

```bash
npm install scenarist
```

```typescript
// scenarist.config.ts
import { defineScenarios } from 'scenarist'

export const scenarios = defineScenarios({
  default: {
    handlers: [
      // Your handlers
    ]
  },
  emptyDashboard: {
    handlers: [
      // Different handlers
    ]
  }
})
```

---

## Recommendation

**Stick with MSW** - Your current setup is good! Just:

1. ✅ Ensure server MSW initializes properly
2. ✅ Add better error logging
3. ✅ Use Next.js testmode for E2E tests
4. ✅ Consider Scenarist only if you need better test isolation

**Your MSW setup already works with RSC** because:
- Server Actions use `fetch` internally
- MSW server intercepts `fetch` in Node.js
- RSC runs on server, so MSW server catches it

The issue might be initialization timing, not the tool itself!
