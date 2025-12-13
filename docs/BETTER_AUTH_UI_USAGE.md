# Better Auth UI Components Usage

**Last Updated:** 2024-12-19

## 📍 Main Usage Locations

### 1. **Root Provider** (`app/providers.tsx`)
- **Component:** `AuthUIProvider`
- **Purpose:** Wraps entire app with Better Auth UI context
- **Provides:** `AuthUIContext` to all child components
- **Uses:** `authClient` from `@/lib/auth-client` (Better Auth React client)

```tsx
<AuthUIProvider
  authClient={authClient}
  navigate={router.push}
  replace={router.replace}
  onSessionChange={() => router.refresh()}
  Link={AuthLink}
>
  {children}
</AuthUIProvider>
```

### 2. **Auth Pages** (`app/auth/[path]/page.tsx`)
- **Component:** `AuthView`
- **Purpose:** Dynamic auth page that handles all auth flows
- **Routes:** `/auth/sign-in`, `/auth/sign-up`, `/auth/verify`, etc.
- **Features:** Handles OAuth callbacks, 2FA, password reset, etc.

### 3. **Header Component** (`components/header.tsx`)
- **Components Used:**
  - `AuthUIContext` - For accessing auth hooks
  - `UserAvatar` - Displays user avatar
  - `useSession()` hook - Gets current session
- **Purpose:** Shows user avatar and auth state in header

### 4. **Dashboard Sidebar** (`components/dashboard/sidebar.tsx`)
- **Component:** `OrganizationSwitcher`
- **Purpose:** Allows switching between organizations
- **Features:** Shows organization list, current org, invites

### 5. **Novu Components** (Notifications)
- **Files:**
  - `components/dashboard/novu-provider.tsx`
  - `components/dashboard/novu-inbox.tsx`
- **Usage:** `authClient.useSession()` hook for user session

### 6. **Team Client** (`app/(dashboard)/dashboard/team/team-client.tsx`)
- **Usage:** `authClient.useSession()` hook

## 📦 Better Auth UI Components Library

All Better Auth UI components are in `lib/auth/components/`:

### Auth Components
- `auth-view.tsx` - Main auth view router
- `auth-form.tsx` - Auth form wrapper
- `auth-callback.tsx` - OAuth callback handler
- `sign-out.tsx` - Sign out component
- `auth-loading.tsx` - Loading state

### Auth Forms
- `forms/sign-in-form.tsx` - Sign in form
- `forms/sign-up-form.tsx` - Sign up form
- `forms/email-otp-form.tsx` - Email OTP verification
- `forms/magic-link-form.tsx` - Magic link form
- `forms/two-factor-form.tsx` - 2FA form
- `forms/forgot-password-form.tsx` - Password reset
- `forms/reset-password-form.tsx` - Reset password
- `forms/recover-account-form.tsx` - Account recovery

### Organization Components
- `organization/organization-switcher.tsx` - Org switcher
- `organization/organization-view.tsx` - Org management
- `organization/organization-members-card.tsx` - Members list
- `organization/invite-member-dialog.tsx` - Invite dialog
- `organization/create-organization-dialog.tsx` - Create org
- `organization/accept-invitation-card.tsx` - Accept invites
- And 15+ more organization components

### Settings Components
- `settings/account/` - Account settings (8 components)
- `settings/security/` - Security settings (4 components)
- `settings/api-key/` - API key management (5 components)
- `settings/passkey/` - Passkey management (2 components)
- `settings/providers/` - OAuth providers (2 components)
- `settings/two-factor/` - 2FA settings (3 components)

### User Components
- `user-button.tsx` - User menu button
- `user-avatar.tsx` - User avatar display
- `user-view.tsx` - User profile view
- `signed-in.tsx` - Conditional render for signed in users
- `signed-out.tsx` - Conditional render for signed out users

### UI Components (Adapted)
- `ui/button.tsx`, `ui/input.tsx`, `ui/dialog.tsx`, etc.
- These are adapters wrapping AlignUI components with shadcn-compatible API

## 🔌 Context Usage

All Better Auth UI components use `AuthUIContext` which provides:

```typescript
{
  authClient: AuthClient,           // Better Auth React client
  basePath: string,                 // Base path for auth routes
  viewPaths: AuthViewPaths,         // Auth route paths
  navigate: (path: string) => void,  // Navigation function
  hooks: {
    useSession: () => {...},        // Session hook
    // ... other hooks
  },
  localization: {...},              // Localization strings
  // ... other context values
}
```

## 📊 Usage Statistics

- **Total Better Auth UI Components:** ~113 files
- **Main Usage Locations:** 6 key files
- **Components Using AuthUIContext:** ~80+ components
- **Hooks Used:** `useSession()` in 4 locations

## 🎯 Key Integration Points

1. **Provider Setup:** `app/providers.tsx` - Wraps entire app
2. **Auth Routes:** `app/auth/[path]/page.tsx` - Dynamic auth pages
3. **Header:** `components/header.tsx` - User avatar and auth state
4. **Sidebar:** `components/dashboard/sidebar.tsx` - Organization switcher
5. **Notifications:** Novu components - Session for user ID
6. **Team Page:** Team client - Session for user info

## ⚠️ Important Notes

- **Better Auth Client Required:** All UI components need `authClient` from `@/lib/auth-client`
- **React Hooks:** Components use `useSession()`, `useAuthData()`, etc. from Better Auth
- **API Route:** `/api/auth/[...all]` is required for Better Auth UI components to work
- **Cannot Remove:** Better Auth UI components cannot be replaced with Encore client directly because they need React hooks and context

## 🔄 Migration Status

- ✅ Auth operations (sign in, sign up) - Migrated to Encore client via server actions
- ✅ Better Auth UI components - Still use `authClient` (required for React hooks)
- ✅ `/api/auth/[...all]` route - Kept for Better Auth UI components

**Conclusion:** Better Auth UI components are correctly using `authClient` for React hooks, while all actual auth operations go through Encore client via server actions.
