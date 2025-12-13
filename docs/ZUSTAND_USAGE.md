# Zustand Usage - Where It Makes Things Better

**Principle:** Use Zustand wherever it makes things better - for client-side UI state, preferences, and temporary state.

## ✅ Where Zustand is Used (Better Than Alternatives)

### 1. **UI Store** - Global UI State ✅

**Location:** `lib/stores/ui-store.ts`

**What it manages:**
- ✅ Sidebar collapsed state (persisted)
- ✅ Mobile menu open/closed
- ✅ Notifications drawer open/closed
- ✅ Command menu open/closed
- ✅ Settings panel open/closed
- ✅ Modals state (global modal management)
- ✅ Client-side notifications (toast notifications)
- ✅ Loading states (global loading indicators)
- ✅ View preferences (persisted):
  - Campaigns view (grid/list)
  - Enrollments view (grid/list)
  - Table page size
  - Advanced filters visibility

**Why Zustand is better here:**
- ✅ **Global access** - No prop drilling
- ✅ **Persistence** - Sidebar and preferences persist across sessions
- ✅ **Performance** - Selective subscriptions (only re-render when needed)
- ✅ **Simple API** - Easy to use anywhere

**Usage:**
```typescript
import { useUIStore } from '@/lib/stores/ui-store'

// Sidebar
const { sidebarCollapsed, toggleSidebar } = useUIStore()

// Drawers
const { notificationsDrawerOpen, setNotificationsDrawerOpen } = useUIStore()

// View preferences
const { viewPreferences, setViewPreference } = useUIStore()
setViewPreference('campaignsView', 'list')
```

### 2. **Form State** (When Needed) ✅

**When to use Zustand for forms:**
- ✅ Multi-step forms (wizard forms)
- ✅ Forms that need to persist across navigation
- ✅ Forms shared across multiple components
- ✅ Complex form state with derived values

**When NOT to use Zustand:**
- ❌ Simple forms - Use React Hook Form
- ❌ Single component forms - Use `useState`
- ❌ Forms that don't need persistence

### 3. **Client-Side Preferences** ✅

**What to store in Zustand:**
- ✅ UI preferences (sidebar, view modes)
- ✅ Filter preferences (if you want to persist)
- ✅ Display settings (theme, density)
- ✅ Temporary state (draft forms, unsaved changes)

**What NOT to store in Zustand:**
- ❌ Server state - Use React Query
- ❌ Auth state - Use React Query (session)
- ❌ Organization state - Use React Query (from session)

## ❌ Where Zustand is NOT Used (React Query is Better)

### 1. **Server State** - React Query ✅

**Why React Query is better:**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Request deduplication
- ✅ Optimistic updates
- ✅ Error handling

**Examples:**
- ❌ Auth state → React Query (`useSession`)
- ❌ Organization state → React Query (from session)
- ❌ Data fetching → React Query (`useCampaigns`, `useEnrollments`)

### 2. **Simple Component State** - useState ✅

**When to use useState:**
- ✅ Component-local state
- ✅ Simple toggles
- ✅ Input values (unless shared)
- ✅ Temporary UI state

## 📊 Current Zustand Usage

### ✅ **Active Stores**

1. **UI Store** (`lib/stores/ui-store.ts`)
   - Sidebar state ✅
   - Mobile menu ✅
   - Drawers/Panels ✅
   - Modals ✅
   - Notifications ✅
   - Loading states ✅
   - View preferences ✅

### ❌ **Removed Stores** (React Query is Better)

1. **Auth Store** - Removed (React Query handles this)
2. **Organization Store** - Removed (React Query handles this)

## 🎯 Best Practices

### When to Use Zustand

✅ **Use Zustand for:**
1. **UI State** - Sidebar, modals, drawers
2. **Preferences** - View settings, display options
3. **Temporary State** - Draft forms, unsaved changes
4. **Cross-Component State** - State shared across unrelated components
5. **Persistence** - State that should persist across sessions

### When NOT to Use Zustand

❌ **Don't use Zustand for:**
1. **Server State** - Use React Query
2. **Form State** (simple) - Use React Hook Form
3. **Component State** (local) - Use useState
4. **Derived State** - Use useMemo/useSelector
5. **URL State** - Use URL params or nuqs

## 📝 Examples

### ✅ Good: Zustand for UI State

```typescript
// Global sidebar state
const { sidebarCollapsed, toggleSidebar } = useUIStore()

// Global drawer state
const { notificationsDrawerOpen, setNotificationsDrawerOpen } = useUIStore()

// View preferences
const { viewPreferences, setViewPreference } = useUIStore()
```

### ✅ Good: React Query for Server State

```typescript
// Session (server state)
const { data: session } = useSession()

// Active organization (derived from session)
const activeOrg = useActiveOrganization(organizations)

// Data fetching
const { data: campaigns } = useCampaigns()
```

### ❌ Bad: Zustand for Server State

```typescript
// ❌ Don't do this - use React Query instead
const { user } = useAuthStore()  // Wrong!
const { data: session } = useSession()  // ✅ Correct
```

## 🎯 Summary

**Zustand is used for:**
- ✅ UI state (sidebar, modals, drawers)
- ✅ Client-side preferences
- ✅ Temporary state
- ✅ Cross-component state

**React Query is used for:**
- ✅ Server state (auth, data)
- ✅ Caching
- ✅ Data fetching

**Result:** Clean separation of concerns, better performance, easier to maintain!
