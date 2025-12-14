# Complete Workflow Diagram - Backend to Frontend

**Date:** 2024-12-19  
**Status:** ✅ **COMPLETE AUDIT & FIXED**

---

## 🎯 Industry Standard: Single Source of Truth (Session-Based)

**Pattern:** Like Stripe, Notion, Clerk, Auth0
- ✅ Session is the only source of truth
- ✅ No cookies for active organization
- ✅ Automatic data filtering
- ✅ Simple API calls

---

## 📊 Complete Workflow Diagrams

### 1. **Organization Creation Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CREATES ORGANIZATION                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: app/actions/organizations.ts                         │
│ createBasicOrganization(name)                                   │
│  1. Get auth-token from cookies                                 │
│  2. Call client.auth.createOrganization({ name })               │
│     → Better Auth API (NOT our backend endpoint)                │
│     → Better Auth does NOT auto-set by default                  │
│  3. Call client.auth.setActiveOrganization({ organizationId })   │
│     → REQUIRED: Better Auth doesn't auto-set                    │
│     → Updates session.activeOrganizationId                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BETTER AUTH: auth/better-auth.config.ts                        │
│ createOrganization()                                            │
│  1. Create organization in DB (via Better Auth)                  │
│  2. Add user as owner member (via Better Auth)                  │
│  3. Does NOT auto-set as active (by default)                    │
│ setActiveOrganization()                                         │
│  Updates session.activeOrganizationId in DB                     │
│  ✅ Single source of truth                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ NOTE: Our backend endpoint (organizations/organizations.ts)     │
│ DOES auto-set, but frontend doesn't use it                      │
│ Frontend uses Better Auth directly for simplicity               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BETTER AUTH: auth/better-auth.config.ts                         │
│ setActiveOrganization()                                         │
│  Updates session.activeOrganizationId in DB                     │
│  ✅ Single source of truth                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: Server Action Returns                                 │
│  - revalidatePath("/dashboard")                                 │
│  - revalidatePath("/onboarding")                                │
│  ✅ No cookie setting needed                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ NEXT REQUEST: User accesses dashboard                          │
│  - getOrganizationIdOrNull() reads from session                 │
│  - All data fetching uses session context                       │
│  ✅ Automatic - no manual sync needed                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. **Organization Approval Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN APPROVES ORGANIZATION                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: Hypedrive Encore/admin/admin.ts                       │
│ approveOrganization()                                           │
│  1. Update org.approvalStatus = "approved"                      │
│  2. Create Blnk wallet & identity                              │
│  3. Create Razorpay virtual account                             │
│  4. Get organization owner                                      │
│  5. Check owner's current active org:                           │
│     - No active org → Set approved org as active                │
│     - Active org is draft/pending → Switch to approved          │
│     - Active org is approved → Keep it                          │
│  6. Update ALL owner's active sessions                          │
│     UPDATE session SET activeOrganizationId = approvedOrgId      │
│     WHERE userId = ownerId AND expiresAt > NOW()                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ NEXT REQUEST: Owner accesses dashboard                          │
│  - getAuthData() returns activeOrganizationId = approvedOrgId   │
│  - All data fetching uses approved org context                  │
│  ✅ Automatic switch - no manual action needed                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3. **Organization Switching Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER CLICKS ORGANIZATION IN SWITCHER                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: hooks/use-organizations.ts                            │
│ useSwitchOrganization()                                         │
│  onMutate: Optimistic update (instant UI)                       │
│    - Update React Query cache                                   │
│    - Update session.activeOrganizationId in cache              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: app/actions/organizations.ts                         │
│ switchOrganization(organizationId)                              │
│  1. Get auth-token from cookies                                 │
│  2. Call client.auth.setActiveOrganization({ organizationId }) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: Hypedrive Encore/auth/endpoints-organization.ts       │
│ setActiveOrganization()                                        │
│  1. Validate user is member of organization                     │
│  2. Call Better Auth API                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BETTER AUTH: auth/better-auth.config.ts                         │
│ setActiveOrganization()                                         │
│  Updates session.activeOrganizationId in DB                     │
│  ✅ Single source of truth                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: Server Action                                         │
│  - revalidatePath("/", "layout")                                │
│  - revalidatePath("/dashboard")                                 │
│  ✅ No cookie setting needed                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: React Query Hook                                      │
│  onSuccess:                                                      │
│    - Invalidate session query                                   │
│    - Invalidate all queries                                     │
│    - router.refresh() (updates server components)               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ NEXT REQUEST: All pages refetch                                 │
│  - getOrganizationIdOrNull() reads from session                 │
│  - All data fetching uses new org context                       │
│  ✅ Automatic - all pages show new org data                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. **Data Fetching Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER VISITS DASHBOARD PAGE                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: app/(dashboard)/dashboard/page.tsx                   │
│ DashboardPage()                                                 │
│  1. Call getOrganizationIdOrNull()                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: lib/ssr-data.ts                                       │
│ getOrganizationIdOrNull()                                      │
│  1. getAuthClient() - reads auth-token from cookies             │
│  2. client.auth.me() - gets user with activeOrganizationId      │
│  3. Return activeOrganizationId from session                    │
│  ✅ Single source of truth - session only                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: lib/ssr-data.ts                                       │
│ getDashboardData()                                              │
│  1. getAuthClient() - reads auth-token from cookies             │
│  2. getOrganizationIdOrNull() - gets orgId from session         │
│  3. Fetch data with orgId context                               │
│  ✅ Automatic filtering by active org                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: All endpoints                                          │
│  - Read activeOrganizationId from session                       │
│  - Filter data by activeOrganizationId                          │
│  ✅ Automatic - no manual orgId passing needed                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: DashboardClient receives data                         │
│  - Data is already filtered by active org                      │
│  - No client-side filtering needed                              │
│  ✅ Clean, simple data flow                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. **Invitation Acceptance Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACCEPTS INVITATION                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: Hypedrive Encore/auth/endpoints-organization.ts       │
│ acceptInvitation()                                              │
│  1. Call Better Auth acceptInvitation()                         │
│  2. Get joined organization's approval status                   │
│  3. Get current active org status                               │
│  4. Decision logic:                                             │
│     - Joined org is approved AND current is not → Set active   │
│     - No active org → Set joined org as active                  │
│     - Otherwise → Keep current active                          │
│  5. Call auth.api.setActiveOrganization() if needed            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BETTER AUTH: Updates session                                    │
│  session.activeOrganizationId = joinedOrgId                     │
│  ✅ Single source of truth                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ NEXT REQUEST: User accesses dashboard                           │
│  - getOrganizationIdOrNull() returns joinedOrgId                │
│  - All data fetching uses joined org context                    │
│  ✅ Automatic - seamless transition                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Key Points

### ✅ Single Source of Truth
- **Session only** - `session.activeOrganizationId` in DB
- **No cookies** - Removed all `active-organization-id` cookie usage
- **No state sync** - Session is automatically used

### ✅ Automatic Data Filtering
- Backend reads `activeOrganizationId` from session
- All data automatically filtered by active org
- No manual orgId passing needed

### ✅ Industry Standard
- Matches Stripe, Notion, Clerk, Auth0 patterns
- Simple API calls
- Automatic context switching

---

## 📋 Complete Flow Summary

### Backend → Frontend Flow:

```
1. User Action (Create/Switch/Join)
   ↓
2. Backend Updates session.activeOrganizationId
   ↓
3. Better Auth persists to DB
   ↓
4. Next Request: getAuthData() returns activeOrganizationId
   ↓
5. All data fetching uses session context
   ↓
6. Frontend receives filtered data automatically
   ↓
✅ No manual sync needed!
```

---

## ✅ All Issues Fixed

### Removed:
- ✅ `active-organization-id` cookie from all server actions
- ✅ Token parameters from all data fetching functions
- ✅ Cookie usage from settings actions
- ✅ Complex state management

### Simplified:
- ✅ Organization creation (session-based)
- ✅ Organization switching (one API call)
- ✅ Data fetching (direct session access)
- ✅ Settings actions (session-based)

### Result:
- 🎯 Industry standard implementation
- 🎯 Single source of truth (session)
- 🎯 Automatic data filtering
- 🎯 Simple, clean code

---

## 🎯 Workflow Diagram (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
│  Create Org | Switch Org | Accept Invitation | View Data   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  • Server Actions (app/actions/*.ts)                        │
│  • React Hooks (hooks/use-organizations.ts)                 │
│  • Page Components (app/(dashboard)/**/page.tsx)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    ENCORE CLIENT                            │
│  • getAuthenticatedEncoreClient(token)                      │
│  • client.auth.setActiveOrganization()                       │
│  • client.auth.me() → returns activeOrganizationId           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                            │
│  • Hypedrive Encore/auth/endpoints-organization.ts          │
│  • Hypedrive Encore/organizations/organizations.ts          │
│  • Hypedrive Encore/admin/admin.ts                          │
│  • All validate membership & call Better Auth              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BETTER AUTH                              │
│  • Updates session.activeOrganizationId in DB               │
│  • Single source of truth                                   │
│  • Persists across requests                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA FETCHING                            │
│  • lib/ssr-data.ts functions                                │
│  • Read activeOrganizationId from session                    │
│  • Automatic data filtering                                 │
│  • No manual orgId passing                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND UI                              │
│  • Receives filtered data                                    │
│  • Shows correct organization context                        │
│  • Automatic updates on switch                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Audit Complete

**Status:** ✅ **ALL ISSUES FIXED**

- ✅ No cookie usage for active organization
- ✅ Session-based single source of truth
- ✅ Simplified data fetching
- ✅ Industry standard implementation
- ✅ Complete workflow documented

**Result:** Perfect industry-standard implementation! 🎯
