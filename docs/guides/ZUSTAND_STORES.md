# Zustand Stores - Implementation

**Last Updated:** 2024-12-19

## ✅ Zustand Stores Created

Zustand is now used for global state management where needed.

## 📦 Stores

### 1. **Auth Store** (`lib/stores/auth-store.ts`)

Manages authentication state globally.

**State:**
- `user` - Current user (`auth.MeResponse`)
- `session` - Current session (`auth.SessionResponse`)
- `token` - Auth token
- `isAuthenticated` - Boolean flag
- `isLoading` - Loading state

**Actions:**
- `setUser(user)` - Set user
- `setSession(session)` - Set session
- `setToken(token)` - Set token
- `setLoading(loading)` - Set loading state
- `clearAuth()` - Clear all auth data

**Persistence:**
- Uses `zustand/middleware/persist`
- Persists token to localStorage
- User/session fetched fresh on mount

**Usage:**
```typescript
import { useAuthStore } from '@/lib/stores/auth-store'

// In component
const user = useAuthStore((state) => state.user)
const setUser = useAuthStore((state) => state.setUser)
const clearAuth = useAuthStore((state) => state.clearAuth)
```

### 2. **UI Store** (`lib/stores/ui-store.ts`)

Manages UI state globally (modals, sidebars, notifications, etc.).

**State:**
- `sidebarCollapsed` - Sidebar collapsed state
- `mobileMenuOpen` - Mobile menu open state
- `modals` - Record of open modals
- `notifications` - Array of notifications
- `loadingStates` - Record of loading states

**Actions:**
- `setSidebarCollapsed(collapsed)` - Set sidebar state
- `toggleSidebar()` - Toggle sidebar
- `setMobileMenuOpen(open)` - Set mobile menu state
- `toggleMobileMenu()` - Toggle mobile menu
- `openModal(modalId)` - Open modal
- `closeModal(modalId)` - Close modal
- `closeAllModals()` - Close all modals
- `addNotification(notification)` - Add notification
- `removeNotification(id)` - Remove notification
- `clearNotifications()` - Clear all notifications
- `setLoading(key, loading)` - Set loading state
- `clearLoading()` - Clear all loading states

**Usage:**
```typescript
import { useUIStore } from '@/lib/stores/ui-store'

// In component
const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed)
const toggleSidebar = useUIStore((state) => state.toggleSidebar)
```

## 🔌 Hooks

### `useSession()` (Updated)

Now syncs with Zustand auth store:
- Fetches user via React Query
- Updates Zustand store on success
- Returns Zustand user if available

### `useSignOut()` (Updated)

Now clears Zustand auth store on sign out.

### `useAuth()` (New)

Direct access to auth store without React Query:
```typescript
import { useAuth } from '@/hooks/use-auth'

const { user, isAuthenticated, isLoading } = useAuth()
```

## 🔄 Integration Points

### Updated Components

1. **`hooks/use-session.ts`**
   - Syncs with Zustand auth store
   - Updates store on user fetch

2. **`hooks/use-sign-out.ts`**
   - Clears Zustand store on sign out

3. **`components/dashboard/dashboard-shell.tsx`**
   - Uses Zustand UI store for sidebar state
   - Uses Zustand UI store for mobile menu state

## 📊 Benefits

1. **Global State Management**
   - Auth state accessible anywhere
   - UI state shared across components

2. **Performance**
   - No prop drilling
   - Selective subscriptions (only re-render when needed)

3. **Persistence**
   - Auth token persisted to localStorage
   - Sidebar state can be persisted if needed

4. **Type Safety**
   - Full TypeScript support
   - Type-safe state and actions

## 🎯 Usage Guidelines

### When to Use Zustand

✅ **Use Zustand for:**
- Global auth state
- UI state (modals, sidebars)
- Cross-component state
- State that needs persistence

❌ **Don't use Zustand for:**
- Server data (use React Query)
- Form state (use React Hook Form)
- Component-local state (use useState)
- Derived state (use useMemo/useSelector)

### Best Practices

1. **Selective Subscriptions**
   ```typescript
   // ✅ Good - only subscribes to user
   const user = useAuthStore((state) => state.user)
   
   // ❌ Bad - subscribes to entire state
   const { user } = useAuthStore()
   ```

2. **Actions Outside Components**
   ```typescript
   // ✅ Good - action outside component
   const clearAuth = useAuthStore((state) => state.clearAuth)
   
   // ❌ Bad - accessing store directly
   useAuthStore.getState().clearAuth()
   ```

3. **Combine with React Query**
   ```typescript
   // ✅ Good - React Query for server data, Zustand for client state
   const { data } = useQuery(['user'], fetchUser)
   const setUser = useAuthStore((state) => state.setUser)
   ```

## 📝 Summary

- ✅ Auth store for authentication state
- ✅ UI store for UI state (sidebars, modals, notifications)
- ✅ Integrated with existing hooks (`useSession`, `useSignOut`)
- ✅ Used in dashboard shell for sidebar state
- ✅ Full TypeScript support
- ✅ Persistence for auth token

**Zustand is now integrated and ready to use wherever global state management is needed!**
