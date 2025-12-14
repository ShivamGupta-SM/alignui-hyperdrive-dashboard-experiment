# MSW Mocking Setup

This directory contains the complete Mock Service Worker (MSW) setup for intercepting and mocking API requests in both browser and server environments.

## 📁 Directory Structure

```
mocks/
├── index.ts              # Main entry point for MSW initialization
├── server.ts             # Node.js server setup (for RSC/Server Actions)
├── browser.ts            # Service Worker setup (for client-side)
├── db.ts                 # Database re-export (convenience wrapper)
├── network.ts            # Network simulation utilities
├── handlers/             # API request handlers
│   ├── index.ts         # Combines all handlers
│   ├── auth.ts          # Authentication endpoints
│   ├── campaigns.ts     # Campaign management
│   ├── enrollments.ts   # Enrollment management
│   ├── products.ts      # Product management
│   ├── wallet.ts        # Wallet & transactions
│   ├── organizations.ts # Organization management
│   └── ...              # Other handlers
└── db/                   # Mock database
    ├── index.ts         # Database exports
    ├── schemas.ts       # Zod schemas for type safety
    ├── collections.ts   # @msw/data Collection instances
    └── seed.ts          # Database seeding functions
```

## 🚀 Quick Start

### 1. Enable Mocking

Set environment variable:
```bash
NEXT_PUBLIC_API_MOCKING=enabled
```

### 2. Initialize MSW

MSW is automatically initialized via:
- `instrumentation.ts` - Early initialization at Next.js startup
- `app/layout.tsx` - Re-initialization (workaround for Next.js fetch patching)
- Server Actions - Explicit initialization before API calls

### 3. Use Mocked API

All requests to `http://localhost:4000` are automatically intercepted and handled by MSW handlers.

## 📊 Database Structure

The mock database uses `@msw/data` with Zod schemas for type-safe data management:

- **Collections**: All data is stored in typed collections (campaigns, enrollments, products, etc.)
- **Persistence**: Data persists across page refreshes using IndexedDB
- **Seeding**: Use `seedDatabase()` to populate with dummy data

### Available Collections

```ts
import { db } from '@/mocks/db'

// Access collections
db.campaigns.findMany()
db.enrollments.findFirst()
db.products.create({ ... })
db.organizations.update({ ... })
```

## 🎯 Handler Organization

Handlers are organized by domain/feature:
- **Auth** - Authentication & authorization
- **Dashboard** - Analytics & stats
- **Campaigns** - Campaign management
- **Enrollments** - Enrollment management
- **Products** - Product catalog
- **Wallet** - Financial transactions
- **Organizations** - Organization management
- **Team** - Team member management
- **Notifications** - User notifications

## 🔧 Database Management

### Seed Database

```ts
import { seedDatabase } from '@/mocks/db'

// Seed with full data (multiple organizations)
await seedDatabase('full', '1')

// Seed with minimal data
await seedDatabase('minimal', '1')

// Seed empty database
await seedDatabase('empty', '1')
```

### Clear Database

```ts
import { clearDatabase } from '@/mocks/db'

await clearDatabase()
```

### Reset Database

```ts
import { resetDatabase } from '@/mocks/db'

await resetDatabase('full', '1')
```

## 📝 Adding New Handlers

1. Create handler file in `mocks/handlers/`:
   ```ts
   // mocks/handlers/my-feature.ts
   import { http } from 'msw'
   import { encoreUrl, encoreResponse } from './utils'
   
   export const myFeatureHandlers = [
     http.get(encoreUrl('/my-feature'), () => {
       return encoreResponse({ data: 'mock' })
     }),
   ]
   ```

2. Import and add to `mocks/handlers/index.ts`:
   ```ts
   import { myFeatureHandlers } from './my-feature'
   
   export const handlers = [
     ...myFeatureHandlers,
     // ... other handlers
   ]
   ```

## 🐛 Debugging

### Check if MSW is Active

Look for console logs:
- `[MSW] ✅ Server mocking enabled`
- `[MSW] ✅ Browser mocking enabled`

### Check Unhandled Requests

MSW will warn about unhandled requests:
```
[MSW] Unhandled server request: GET http://localhost:4000/unknown-endpoint
```

### Verify Fetch is Patched

```ts
console.log(globalThis.fetch.toString())
// Should show MSW-related code if patched
```

## 🔍 Key Files

- **`mocks/index.ts`** - Main initialization logic
- **`mocks/server.ts`** - Server-side MSW setup
- **`mocks/handlers/index.ts`** - All handlers combined
- **`mocks/db/collections.ts`** - Database collections
- **`mocks/db/seed.ts`** - Database seeding logic

## 📚 Related Documentation

- [MSW Documentation](https://mswjs.io/)
- [@msw/data Documentation](https://github.com/mswjs/data)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

