# Empty States Audit & Usage Guide

## ✅ Available Reusable Components

### 1. **Base EmptyState Component** (Recommended for custom empty states)
**Location:** `components/claude-generated-components/empty-state.tsx`

**Usage:**
```typescript
import * as EmptyState from '@/components/claude-generated-components/empty-state'

<EmptyState.Root size="large">
  <EmptyState.Header>
    <EmptyState.Icon color="gray">
      <Icon className="size-full" weight="duotone" />
    </EmptyState.Icon>
  </EmptyState.Header>
  <EmptyState.Content>
    <EmptyState.Title>No items found</EmptyState.Title>
    <EmptyState.Description>Description text here</EmptyState.Description>
  </EmptyState.Content>
  <EmptyState.Footer>
    <Button.Root variant="primary">Action</Button.Root>
  </EmptyState.Footer>
</EmptyState.Root>
```

**Sizes:** `small` | `medium` | `large` (default: `large`)
**Icon Colors:** `gray` | `primary` | `error` | `warning` | `success`

---

### 2. **Pre-built Empty State Components** (Recommended - Use these!)
**Location:** `components/dashboard/empty-states.tsx`

**Available Components:**
- ✅ `WelcomeEmptyState` - New organization welcome
- ✅ `NoCampaignsEmptyState` - No campaigns
- ✅ `NoPendingEnrollmentsEmptyState` - All caught up
- ✅ `NoProductsEmptyState` - No products
- ✅ `NoTeamMembersEmptyState` - No team members
- ✅ `NoSearchResultsEmptyState` - Search with no results
- ✅ `NoInvoicesEmptyState` - No invoices
- ✅ `NoNotificationsEmptyState` - No notifications
- ✅ `ErrorEmptyState` - Generic error
- ✅ `NetworkErrorEmptyState` - Network error
- ✅ `PermissionDeniedEmptyState` - Access denied
- ✅ `NoWalletTransactionsEmptyState` - No wallet transactions

**Usage:**
```typescript
import { NoCampaignsEmptyState } from '@/components/dashboard/empty-states'

{items.length === 0 && <NoCampaignsEmptyState />}
```

**Exported from:** `@/components/dashboard` (via index.ts)

---

### 3. **Table.Empty** (For table empty states)
**Location:** `components/ui/table.tsx`

**Usage:**
```typescript
<Table.Empty
  colSpan={columns.length}
  icon={<Icon className="size-8 text-text-soft-400" />}
  title="No items found"
  description="Description here"
/>
```

---

### 4. **ChartEmptyState** (For charts)
**Location:** `components/claude-generated-components/chart-utils.tsx`

**Usage:**
```typescript
import { ChartEmptyState } from '@/components/claude-generated-components/chart-utils'

<ChartEmptyState message="No data available" />
```

---

## ⚠️ Current Issues

### Places Using EmptyState Directly (Should use pre-built components)

1. **`app/(dashboard)/dashboard/campaigns/campaigns-client.tsx`**
   - ❌ Using `EmptyState.Root` directly
   - ✅ Should use: `NoCampaignsEmptyState` or create variant for filtered state

2. **`app/(dashboard)/dashboard/products/products-client.tsx`**
   - ❌ Using `EmptyState.Root` directly
   - ✅ Should use: `NoProductsEmptyState` (already exists!)

---

### Places Using Manual Empty States (Should use components)

1. **`app/(dashboard)/dashboard/campaigns/create/page.tsx`** (Line 467-471)
   ```typescript
   // ❌ Manual implementation
   <div className="col-span-full text-center py-8 text-text-soft-400">
     <Package weight="duotone" className="size-10 mx-auto mb-2 opacity-50" />
     <p className="text-paragraph-sm">No products found</p>
     <p className="text-paragraph-xs">Add a product to create a campaign</p>
   </div>
   ```
   **Should use:** `EmptyState.Root` or inline component

2. **`app/(dashboard)/dashboard/settings/settings-client.tsx`** (Line 1188)
   ```typescript
   // ❌ Manual implementation
   <p className="text-paragraph-sm text-text-sub-600 text-center py-4">
     No active sessions found
   </p>
   ```
   **Should use:** `EmptyState.Root` with appropriate icon

3. **`app/(dashboard)/dashboard/invoices/invoices-client.tsx`**
   - Need to check if using `NoInvoicesEmptyState` or manual

4. **`app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx`** (Line 191-192)
   ```typescript
   // ❌ Manual error state
   <p className="text-label-md text-warning-base mb-1">Enrollment not found</p>
   <p className="text-paragraph-sm text-text-sub-600">...</p>
   ```
   **Should use:** `ErrorEmptyState` or custom not-found state

5. **`app/(dashboard)/dashboard/campaigns/[id]/campaign-detail-client.tsx`** (Line 251-252)
   ```typescript
   // ❌ Manual error state
   <h2 className="text-label-md text-error-dark mb-2">Campaign not found</h2>
   ```
   **Should use:** `ErrorEmptyState` or custom not-found state

---

## ✅ Places Using Components Correctly

1. **`app/(dashboard)/dashboard/enrollments/enrollments-client.tsx`**
   - ✅ Using `Table.Empty` correctly

2. **`app/(dashboard)/dashboard/campaigns/[id]/campaign-detail-client.tsx`**
   - ✅ Using `Table.Empty` for enrollments table

---

## 🎯 Recommendations

### 1. Use Pre-built Components When Available
Always prefer pre-built components from `components/dashboard/empty-states.tsx`:

```typescript
// ✅ Good
import { NoProductsEmptyState } from '@/components/dashboard/empty-states'
{products.length === 0 && <NoProductsEmptyState />}

// ❌ Avoid
<EmptyState.Root>
  <EmptyState.Header>...</EmptyState.Header>
  ...
</EmptyState.Root>
```

### 2. Use Base EmptyState for Custom Cases
When pre-built component doesn't exist, use base `EmptyState` component:

```typescript
import * as EmptyState from '@/components/claude-generated-components/empty-state'

<EmptyState.Root size="medium">
  <EmptyState.Header>
    <EmptyState.Icon color="primary">
      <CustomIcon className="size-full" weight="duotone" />
    </EmptyState.Icon>
  </EmptyState.Header>
  <EmptyState.Content>
    <EmptyState.Title>Custom Title</EmptyState.Title>
    <EmptyState.Description>Custom description</EmptyState.Description>
  </EmptyState.Content>
  <EmptyState.Footer>
    <Button.Root variant="primary">Action</Button.Root>
  </EmptyState.Footer>
</EmptyState.Root>
```

### 3. Use Table.Empty for Tables
Always use `Table.Empty` for table empty states:

```typescript
<Table.Empty
  colSpan={columns.length}
  icon={<Icon className="size-8 text-text-soft-400" />}
  title="No items found"
  description="Description"
/>
```

### 4. Never Use Manual Empty States
Avoid manual implementations like:
```typescript
// ❌ Don't do this
<div className="text-center py-8">
  <p>No items</p>
</div>
```

---

## 📋 Action Items

1. ✅ **Replace manual empty states** with components
2. ✅ **Replace direct EmptyState usage** with pre-built components where available
3. ✅ **Create new pre-built components** for common patterns (e.g., "No sessions")
4. ✅ **Document** when to use which component

---

## 📚 Component Hierarchy

```
EmptyState (Base Component)
├── Pre-built Components (components/dashboard/empty-states.tsx)
│   ├── WelcomeEmptyState
│   ├── NoCampaignsEmptyState
│   ├── NoProductsEmptyState
│   └── ... (others)
├── Table.Empty (for tables)
└── ChartEmptyState (for charts)
```

**Rule:** Always use the most specific component available, fall back to base `EmptyState` for custom cases.


