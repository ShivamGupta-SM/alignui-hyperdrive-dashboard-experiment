# Quick Start: Mocking for RSC + Server Actions

## ✅ Your Setup is Already Good!

Your MSW setup **already works** with RSC and Server Actions! Here's why:

1. **Server Actions use `fetch` internally** → MSW server intercepts it
2. **RSC runs on server** → MSW server catches the requests
3. **Client components** → MSW browser worker catches them

## 🚀 What I Just Improved

### 1. Enhanced MSW Initialization
- ✅ Better error handling
- ✅ Prevents double initialization
- ✅ Better logging for unhandled requests
- ✅ Early server-side initialization

### 2. Early Server Initialization
- ✅ MSW now initializes before RSC executes
- ✅ Works automatically when you import `ssr-data.ts`

## 📝 How to Use

### Enable Mocking

```bash
# .env.local
NEXT_PUBLIC_API_MOCKING=enabled
```

### Your Mocking Already Works For:

✅ **RSC (React Server Components)**
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await getDashboardData() // ✅ MSW intercepts this
  return <DashboardClient initialData={data} />
}
```

✅ **Server Actions**
```typescript
// app/actions/campaigns.ts
"use server"
export async function createCampaign(data) {
  const client = getEncoreClient()
  // ✅ MSW intercepts fetch calls inside
  return await client.campaigns.createCampaign(data)
}
```

✅ **Client Components**
```typescript
// Any client component
const { data } = useQuery({
  queryFn: async () => {
    // ✅ MSW browser worker intercepts this
    return fetch('/api/campaigns')
  }
})
```

## 🔍 Debugging

### Check if MSW is Running

Open browser console:
```
[MSW] ✅ Server mocking enabled (RSC + Server Actions)
[MSW] ✅ Browser mocking enabled
```

### Unhandled Requests

If you see warnings:
```
[MSW] Unhandled server request: GET http://localhost:4000/...
```

Add a handler in `mocks/handlers/` for that endpoint.

## 🧪 Testing

### E2E Tests (Recommended)

Use Next.js experimental testmode:

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from 'next/experimental/testmode/playwright'
import { http, HttpResponse } from 'next/experimental/testmode/playwright/msw'

test('dashboard loads', async ({ page, msw }) => {
  msw.use(
    http.get('http://localhost:4000/organizations/:id/dashboard', () => {
      return HttpResponse.json({ stats: { /* ... */ } })
    })
  )

  await page.goto('/dashboard')
  await expect(page.getByText('Dashboard')).toBeVisible()
})
```

### Unit Tests

```typescript
// __tests__/ssr-data.test.ts
import { server } from '@/mocks/server'
import { getDashboardData } from '@/lib/ssr-data'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('getDashboardData', async () => {
  const data = await getDashboardData()
  expect(data).toBeDefined()
})
```

## 🎯 Best Practices

1. **Keep MSW handlers in sync** with your actual API
2. **Use MSW DevTools** to inspect requests
3. **Test with real data** - seed your mock database
4. **Document your handlers** - add comments explaining scenarios

## 🆘 Troubleshooting

### MSW not intercepting Server Actions?

1. Check `NEXT_PUBLIC_API_MOCKING=enabled` in `.env.local`
2. Check console for `[MSW] ✅ Server mocking enabled`
3. Verify handler matches the exact URL pattern
4. Check network tab - is request going to `localhost:4000`?

### Double initialization warnings?

Fixed! The new code prevents double initialization.

### Requests not being mocked?

1. Check handler URL pattern matches exactly
2. Check HTTP method (GET, POST, etc.)
3. Check if request is going to correct domain
4. Add a catch-all handler for debugging

## 📚 More Info

See `docs/guides/MOCKING_RSC_SERVER_ACTIONS.md` for:
- Alternative solutions (Scenarist, etc.)
- Advanced patterns
- Migration guides
