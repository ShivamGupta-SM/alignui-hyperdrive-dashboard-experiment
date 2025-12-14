# Encore TypeScript API Mocking Guide - Easiest Way

**Date:** 2024-12-19  
**Status:** 📋 Complete Guide

## 🎯 Question

**"encore ts k apis ko mock karne ka sabse aasan tarika kya hai?"**

---

## ✅ Current Setup (Already Working!)

### **MSW (Mock Service Worker) Setup:**
- ✅ MSW installed and configured
- ✅ Browser + Server support
- ✅ Type-safe handlers
- ✅ Database with @msw/data
- ✅ DevTools integration

### **Key Files:**
- `mocks/handlers/` - All API handlers
- `mocks/db/` - Mock database
- `mocks/handlers/utils.ts` - Helper functions
- `mocks/handlers/typed-responses.ts` - Type-safe response helpers

---

## 🚀 Easiest Way: Use Existing MSW Setup

### **Step 1: Create Handler File**

**File:** `mocks/handlers/your-feature.ts`

```typescript
import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  getAuthContext,
  encoreUrl,
  encoreResponse,
  encoreListResponse,
  encoreNotFoundResponse,
  encoreErrorResponse,
} from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

export const yourFeatureHandlers = [
  // GET /your-feature
  http.get(encoreUrl('/your-feature'), async ({ request }) => {
    await delay(DELAY.STANDARD) // Optional: Simulate network delay
    
    const auth = getAuthContext()
    const url = new URL(request.url)
    
    // Get query params
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    
    // Query database
    const items = db.yourFeature.findMany({
      where: { organizationId: auth.organizationId },
    })
    
    // Return typed response
    return encoreListResponse(
      items.slice(skip, skip + take),
      items.length,
      skip,
      take
    )
  }),

  // GET /your-feature/:id
  http.get(encoreUrl('/your-feature/:id'), async ({ params }) => {
    await delay(DELAY.STANDARD)
    
    const auth = getAuthContext()
    const { id } = params
    
    const item = db.yourFeature.findFirst({
      where: { id, organizationId: auth.organizationId },
    })
    
    if (!item) {
      return encoreNotFoundResponse('Item')
    }
    
    return encoreResponse(item)
  }),

  // POST /your-feature
  http.post(encoreUrl('/your-feature'), async ({ request }) => {
    await delay(DELAY.STANDARD)
    
    const auth = getAuthContext()
    const body = await request.json()
    
    // Create in database
    const newItem = db.yourFeature.create({
      ...body,
      organizationId: auth.organizationId,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
    
    return encoreResponse(newItem, 201)
  }),

  // PUT /your-feature/:id
  http.put(encoreUrl('/your-feature/:id'), async ({ params, request }) => {
    await delay(DELAY.STANDARD)
    
    const auth = getAuthContext()
    const { id } = params
    const body = await request.json()
    
    const existing = db.yourFeature.findFirst({
      where: { id, organizationId: auth.organizationId },
    })
    
    if (!existing) {
      return encoreNotFoundResponse('Item')
    }
    
    const updated = db.yourFeature.update({
      where: { id },
      data: { ...body, updatedAt: new Date().toISOString() },
    })
    
    return encoreResponse(updated)
  }),

  // DELETE /your-feature/:id
  http.delete(encoreUrl('/your-feature/:id'), async ({ params }) => {
    await delay(DELAY.STANDARD)
    
    const auth = getAuthContext()
    const { id } = params
    
    const existing = db.yourFeature.findFirst({
      where: { id, organizationId: auth.organizationId },
    })
    
    if (!existing) {
      return encoreNotFoundResponse('Item')
    }
    
    db.yourFeature.delete({ where: { id } })
    
    return encoreResponse({ success: true })
  }),
]
```

### **Step 2: Register Handler**

**File:** `mocks/handlers/index.ts`

```typescript
import { yourFeatureHandlers } from './your-feature'

export const handlers = [
  ...authHandlers,
  ...campaignsHandlers,
  ...enrollmentsHandlers,
  // ... other handlers
  ...yourFeatureHandlers, // ✅ Add your handlers here
]
```

### **Step 3: Add Database Schema (if needed)**

**File:** `mocks/db/schemas.ts`

```typescript
import { factory, primaryKey } from '@msw/data/db'

export const yourFeatureFactory = factory({
  yourFeature: {
    id: primaryKey(String),
    organizationId: String,
    name: String,
    // ... other fields
    createdAt: String,
    updatedAt: String,
  },
})
```

---

## 📋 Helper Functions (Already Available)

### **1. `encoreUrl(path)` - URL Helper**
```typescript
encoreUrl('/campaigns') // → 'http://localhost:4000/campaigns'
encoreUrl('/campaigns/:id') // → 'http://localhost:4000/campaigns/:id'
```

### **2. `encoreResponse(data, status?)` - Single Response**
```typescript
encoreResponse({ id: '1', name: 'Test' }) // 200 OK
encoreResponse({ id: '1', name: 'Test' }, 201) // 201 Created
```

### **3. `encoreListResponse(items, total, skip, take)` - List Response**
```typescript
encoreListResponse(
  items,      // Array of items
  total,      // Total count
  skip,       // Skip offset
  take        // Take limit
)
```

### **4. `encoreNotFoundResponse(resource)` - 404 Response**
```typescript
encoreNotFoundResponse('Campaign') // 404 with error message
```

### **5. `encoreErrorResponse(message, code?, status?)` - Error Response**
```typescript
encoreErrorResponse('Invalid input', 'invalid_argument', 400)
```

### **6. `getAuthContext()` - Auth Helper**
```typescript
const auth = getAuthContext()
// Returns: { userId, organizationId, email, etc. }
```

### **7. `delay(ms)` - Network Delay**
```typescript
await delay(DELAY.STANDARD) // 300ms
await delay(DELAY.SLOW)     // 1000ms
await delay(DELAY.FAST)     // 100ms
```

---

## 🎯 Complete Example: New Feature Handler

### **Example: Products Handler**

```typescript
// mocks/handlers/products.ts
import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  getAuthContext,
  encoreUrl,
  encoreResponse,
  encoreListResponse,
  encoreNotFoundResponse,
} from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

export const productsHandlers = [
  // GET /products
  http.get(encoreUrl('/products'), async ({ request }) => {
    await delay(DELAY.STANDARD)
    
    const auth = getAuthContext()
    const url = new URL(request.url)
    
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const search = url.searchParams.get('search')
    
    let products = db.products.findMany({
      where: { organizationId: auth.organizationId },
    })
    
    // Filter by search
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    return encoreListResponse(
      products.slice(skip, skip + take),
      products.length,
      skip,
      take
    )
  }),

  // GET /products/:id
  http.get(encoreUrl('/products/:id'), async ({ params }) => {
    await delay(DELAY.STANDARD)
    
    const auth = getAuthContext()
    const { id } = params
    
    const product = db.products.findFirst({
      where: { id, organizationId: auth.organizationId },
    })
    
    if (!product) {
      return encoreNotFoundResponse('Product')
    }
    
    return encoreResponse(product)
  }),

  // POST /products
  http.post(encoreUrl('/products'), async ({ request }) => {
    await delay(DELAY.STANDARD)
    
    const auth = getAuthContext()
    const body = await request.json()
    
    const newProduct = db.products.create({
      ...body,
      organizationId: auth.organizationId,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    
    return encoreResponse(newProduct, 201)
  }),
]
```

---

## 🔧 Quick Reference: Common Patterns

### **Pattern 1: List with Pagination**
```typescript
http.get(encoreUrl('/items'), async ({ request }) => {
  const url = new URL(request.url)
  const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
  const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
  
  const items = db.items.findMany({ where: { organizationId } })
  
  return encoreListResponse(
    items.slice(skip, skip + take),
    items.length,
    skip,
    take
  )
})
```

### **Pattern 2: Get by ID**
```typescript
http.get(encoreUrl('/items/:id'), async ({ params }) => {
  const { id } = params
  const item = db.items.findFirst({ where: { id, organizationId } })
  
  if (!item) return encoreNotFoundResponse('Item')
  return encoreResponse(item)
})
```

### **Pattern 3: Create**
```typescript
http.post(encoreUrl('/items'), async ({ request }) => {
  const body = await request.json()
  const newItem = db.items.create({
    ...body,
    id: crypto.randomUUID(),
    organizationId,
    createdAt: new Date().toISOString(),
  })
  return encoreResponse(newItem, 201)
})
```

### **Pattern 4: Update**
```typescript
http.put(encoreUrl('/items/:id'), async ({ params, request }) => {
  const { id } = params
  const body = await request.json()
  
  const existing = db.items.findFirst({ where: { id, organizationId } })
  if (!existing) return encoreNotFoundResponse('Item')
  
  const updated = db.items.update({
    where: { id },
    data: { ...body, updatedAt: new Date().toISOString() },
  })
  return encoreResponse(updated)
})
```

### **Pattern 5: Delete**
```typescript
http.delete(encoreUrl('/items/:id'), async ({ params }) => {
  const { id } = params
  const existing = db.items.findFirst({ where: { id, organizationId } })
  if (!existing) return encoreNotFoundResponse('Item')
  
  db.items.delete({ where: { id } })
  return encoreResponse({ success: true })
})
```

### **Pattern 6: Filter by Query Params**
```typescript
http.get(encoreUrl('/items'), async ({ request }) => {
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')
  
  let items = db.items.findMany({ where: { organizationId } })
  
  if (status) items = items.filter(i => i.status === status)
  if (search) items = items.filter(i => i.name.includes(search))
  
  return encoreListResponse(items, items.length, 0, items.length)
})
```

---

## 🎨 Type Safety with Encore Types

### **Import Encore Types:**
```typescript
import type { campaigns, enrollments } from '@/lib/encore-client'
// or
import type { campaigns, enrollments } from '@/lib/encore-browser'
```

### **Type-Safe Response:**
```typescript
import type { campaigns } from '@/lib/encore-client'

// Response matches Encore type
const campaign: campaigns.CampaignWithStats = {
  id: '1',
  title: 'Test Campaign',
  // ... all required fields
}

return encoreResponse(campaign)
```

---

## 🗄️ Database Operations

### **Available Operations:**
```typescript
// Find one
const item = db.items.findFirst({ where: { id: '1' } })

// Find many
const items = db.items.findMany({ where: { status: 'active' } })

// Create
const newItem = db.items.create({
  id: crypto.randomUUID(),
  name: 'New Item',
  // ...
})

// Update
const updated = db.items.update({
  where: { id: '1' },
  data: { name: 'Updated Name' },
})

// Delete
db.items.delete({ where: { id: '1' } })

// Count
const count = db.items.count({ where: { status: 'active' } })
```

---

## 🚀 Enable Mocking

### **1. Set Environment Variable:**
```bash
# .env.local
NEXT_PUBLIC_API_MOCKING=enabled
```

### **2. MSW is Already Initialized:**
- ✅ `instrumentation.ts` - Server-side
- ✅ `components/msw-init.tsx` - Client-side
- ✅ Auto-initializes when `NEXT_PUBLIC_API_MOCKING=enabled`

### **3. Access DevTools:**
- Open browser console
- Use `window.__MSW_DB__` to access database
- MSW DevTools panel available

---

## 📝 Step-by-Step: Add New API Mock

### **Example: Add "Coupons" API Mock**

#### **Step 1: Create Handler File**
```typescript
// mocks/handlers/coupons.ts
import { http } from 'msw'
import { db } from '@/mocks/db'
import { getAuthContext, encoreUrl, encoreResponse, encoreListResponse } from './utils'

export const couponsHandlers = [
  http.get(encoreUrl('/coupons'), async ({ request }) => {
    const auth = getAuthContext()
    const coupons = db.coupons.findMany({
      where: { organizationId: auth.organizationId },
    })
    return encoreListResponse(coupons, coupons.length, 0, coupons.length)
  }),
]
```

#### **Step 2: Register in Index**
```typescript
// mocks/handlers/index.ts
import { couponsHandlers } from './coupons'

export const handlers = [
  // ... existing handlers
  ...couponsHandlers, // ✅ Add here
]
```

#### **Step 3: Add Database Schema (if needed)**
```typescript
// mocks/db/schemas.ts
export const couponsFactory = factory({
  coupons: {
    id: primaryKey(String),
    organizationId: String,
    code: String,
    discount: Number,
    // ...
  },
})
```

#### **Step 4: Done! ✅**
- Restart dev server
- Mocking automatically enabled
- API calls intercepted

---

## 🎯 Best Practices

### ✅ **DO:**

1. **Use Helper Functions:**
   ```typescript
   // ✅ Good
   return encoreResponse(data)
   return encoreListResponse(items, total, skip, take)
   ```

2. **Use Type-Safe Responses:**
   ```typescript
   // ✅ Good
   import type { campaigns } from '@/lib/encore-client'
   const campaign: campaigns.Campaign = { ... }
   return encoreResponse(campaign)
   ```

3. **Add Network Delays:**
   ```typescript
   // ✅ Good - Simulates real network
   await delay(DELAY.STANDARD)
   ```

4. **Use Database:**
   ```typescript
   // ✅ Good - Persistent data
   const item = db.items.findFirst({ where: { id } })
   ```

5. **Handle Auth:**
   ```typescript
   // ✅ Good - Filter by organization
   const auth = getAuthContext()
   const items = db.items.findMany({
     where: { organizationId: auth.organizationId },
   })
   ```

### ❌ **DON'T:**

1. **Don't Hard-code URLs:**
   ```typescript
   // ❌ Bad
   http.get('http://localhost:4000/campaigns', ...)
   
   // ✅ Good
   http.get(encoreUrl('/campaigns'), ...)
   ```

2. **Don't Return Raw Data:**
   ```typescript
   // ❌ Bad
   return HttpResponse.json(items)
   
   // ✅ Good
   return encoreListResponse(items, total, skip, take)
   ```

3. **Don't Skip Auth:**
   ```typescript
   // ❌ Bad
   const items = db.items.findMany()
   
   // ✅ Good
   const auth = getAuthContext()
   const items = db.items.findMany({
     where: { organizationId: auth.organizationId },
   })
   ```

---

## 🔍 Debugging

### **1. Check MSW is Running:**
```typescript
// Browser console
console.log('[MSW] Browser mocking enabled')
```

### **2. Access Database:**
```typescript
// Browser console
window.__MSW_DB__.db.campaigns.findMany()
window.__MSW_DB__.getStats()
```

### **3. Check Network Tab:**
- Open DevTools → Network
- Look for requests to `localhost:4000`
- Should show "MSW" badge

### **4. MSW DevTools:**
- Bottom-right corner in dev mode
- Shows all intercepted requests
- Can toggle handlers on/off

---

## 📚 Reference: Existing Handlers

### **Examples to Follow:**
- ✅ `mocks/handlers/campaigns.ts` - Full CRUD example
- ✅ `mocks/handlers/enrollments.ts` - Complex filtering
- ✅ `mocks/handlers/invoices.ts` - Pagination example
- ✅ `mocks/handlers/products.ts` - Simple CRUD

---

## 🎯 Summary

### **Easiest Way: 3 Steps**

1. **Create handler file** → Use helper functions
2. **Register in index** → Add to handlers array
3. **Done!** → Restart dev server

### **Key Helpers:**
- `encoreUrl()` - URL helper
- `encoreResponse()` - Single response
- `encoreListResponse()` - List response
- `getAuthContext()` - Auth helper
- `delay()` - Network delay

### **No Complex Setup Needed:**
- ✅ MSW already configured
- ✅ Helpers already available
- ✅ Database already set up
- ✅ Type safety built-in

---

## 🚀 Quick Start Template

```typescript
// mocks/handlers/my-feature.ts
import { http } from 'msw'
import { db } from '@/mocks/db'
import { getAuthContext, encoreUrl, encoreResponse, encoreListResponse } from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

export const myFeatureHandlers = [
  // GET /my-feature
  http.get(encoreUrl('/my-feature'), async ({ request }) => {
    await delay(DELAY.STANDARD)
    const auth = getAuthContext()
    const items = db.myFeature.findMany({
      where: { organizationId: auth.organizationId },
    })
    return encoreListResponse(items, items.length, 0, items.length)
  }),

  // GET /my-feature/:id
  http.get(encoreUrl('/my-feature/:id'), async ({ params }) => {
    await delay(DELAY.STANDARD)
    const auth = getAuthContext()
    const { id } = params
    const item = db.myFeature.findFirst({
      where: { id, organizationId: auth.organizationId },
    })
    return item ? encoreResponse(item) : encoreNotFoundResponse('Item')
  }),
]
```

**Copy, paste, modify! That's it!** 🎉

---

**Next Steps:**
1. ✅ Use existing helper functions
2. ✅ Follow existing handler patterns
3. ✅ Register in `handlers/index.ts`
4. ✅ Test with `NEXT_PUBLIC_API_MOCKING=enabled`


