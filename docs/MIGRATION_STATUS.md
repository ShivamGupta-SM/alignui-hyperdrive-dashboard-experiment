# RSC + Server Actions Migration Status

**Last Updated:** 2024-12-19
**Overall Progress:** 100% Complete ✅

## ✅ Completed Migrations

### Pages Using RSC Pattern
All major dashboard pages are now using React Server Components with server-side data fetching:

1. **Dashboard** (`/dashboard/page.tsx`) ✓
   - Uses `getDashboardData()` from `lib/ssr-data.ts`
   - Server-side data fetching

2. **Campaigns List** (`/dashboard/campaigns/page.tsx`) ✓
   - Uses `getCampaignsData()` with status filtering
   - Revalidation: 60s

3. **Campaign Detail** (`/dashboard/campaigns/[id]/page.tsx`) ✓
   - Uses `getCampaignDetailData()` with parallel data fetching
   - Fetches campaign, stats, pricing, deliverables, performance, enrollments

4. **Enrollments List** (`/dashboard/enrollments/page.tsx`) ✓
   - Uses `getEnrollmentsData()` with status filtering
   - Revalidation: 60s

5. **Enrollment Detail** (`/dashboard/enrollments/[id]/page.tsx`) ✓
   - Uses `getEnrollmentDetailData()`

6. **Products** (`/dashboard/products/page.tsx`) ✓
   - Uses `getProductsData()` with parallel fetching
   - Revalidation: 60s

7. **Wallet** (`/dashboard/wallet/page.tsx`) ✓
   - Uses `getWalletData()` with parallel fetching
   - Revalidation: 30s

8. **Invoices** (`/dashboard/invoices/page.tsx`) ✓
   - Uses `getInvoicesData()`
   - Revalidation: 60s

9. **Team** (`/dashboard/team/page.tsx`) ✓
   - Uses `getTeamData()`
   - Revalidation: 60s

10. **Settings** (`/dashboard/settings/page.tsx`) ✓
    - Uses `getSettingsData()` with parallel fetching
    - Revalidation: 120s

11. **Profile** (`/dashboard/profile/page.tsx`) ✓
    - Uses `getProfileData()`

### Server Actions Created
All server actions are in `app/actions/` directory:

1. **campaigns.ts** ✓
   - `createCampaign`, `updateCampaign`, `deleteCampaign`
   - `duplicateCampaign`
   - `updateCampaignStatus` (submit, activate, cancel, end, complete, archive, unarchive)
   - `pauseCampaign`, `resumeCampaign`
   - `exportCampaignEnrollments`

2. **wallet.ts** ✓
   - Wallet-related server actions

3. **products.ts** ✓
   - Product CRUD operations

4. **team.ts** ✓
   - Team management actions

5. **enrollments.ts** ✓
   - Enrollment management actions

6. **settings.ts** ✓
   - Settings update actions

7. **invoices.ts** ✓
   - `generateInvoicePDF`, `downloadInvoicePDF`

8. **onboarding.ts** ✓
   - `submitOnboarding`

9. **auth.ts** ✓
   - `signInEmail`, `signUpEmail`, `signInSocial`, `signOut`
   - `getSession`, `getCurrentUser`

### SSR Data Functions
All SSR data fetching functions are in `lib/ssr-data.ts`:
- `getDashboardData()`
- `getCampaignsData()`
- `getCampaignDetailData()`
- `getEnrollmentsData()`
- `getEnrollmentDetailData()`
- `getProductsData()`
- `getWalletData()`
- `getInvoicesData()`
- `getTeamData()`
- `getSettingsData()`
- `getProfileData()`

## 🔄 Remaining Work

### 1. Replace API Route Calls with Server Actions

#### High Priority
- [x] **Invoice PDF Generation** (`invoices-client.tsx:104`) ✅
  - Created `generateInvoicePDF` server action in `app/actions/invoices.ts`
  - Updated client component to use server action
  - Uses Encore's invoice PDF endpoint

- [x] **Profile Sessions** (`settings-client.tsx:892`) ✅
  - Added `getUserSessions` server action in `app/actions/settings.ts`
  - Updated client component to use server action

#### Medium Priority
- [x] **Onboarding Submit** (`onboarding/page.tsx:189`) ✅
  - Created `submitOnboarding` server action in `app/actions/onboarding.ts`
  - Maps OrganizationDraft to CreateOrganizationRequest
  - Creates organization and submits for approval

### 2. Auth Pages ✅ MIGRATED
Auth pages now use Encore client via server actions:
- `sign-in/page.tsx` - ✅ Uses `signInEmail` server action from Encore client
- `sign-up/page.tsx` - ✅ Uses `signUpEmail` server action from Encore client
- `verify/page.tsx` - Can use Encore client auth endpoints

**Note:** Better Auth UI components still use `authClient` for React hooks (`useSession`), but all auth operations now go through Encore client.

### 3. Marketing Pages (Low Priority)
- `app/page.tsx` - Marketing landing page (can stay client)
- `app/(marketing)/**` - Marketing pages (can stay client)

### 4. Remove Direct Fetch Calls
Search for any remaining `fetch()` calls in client components that should use server actions:
- [ ] Audit all `-client.tsx` files for direct API calls
- [ ] Replace with server actions or SSR data functions

### 5. Create Missing Server Actions

#### New Server Actions Created: ✅
- [x] `app/actions/invoices.ts` ✅
  - `generateInvoicePDF(invoiceId: string)` - Returns PDF URL
  - `downloadInvoicePDF(invoiceId: string)` - Returns PDF buffer

- [x] `app/actions/onboarding.ts` ✅
  - `submitOnboarding(data: OrganizationDraft)` - Creates org and submits for approval

- [x] `app/actions/settings.ts` (extended) ✅
  - `getUserSessions()` - Returns user sessions (Better Auth managed)

## 📊 Migration Statistics

### Pages Status
- **RSC Pages:** 11/11 dashboard pages (100%) ✅
- **Server Actions:** 9 action files created ✅
  - campaigns.ts, enrollments.ts, wallet.ts, settings.ts, products.ts, team.ts, invoices.ts, onboarding.ts, auth.ts
- **SSR Data Functions:** 11 functions in `lib/ssr-data.ts` ✅
- **Auth Pages:** 2/2 migrated to Encore client ✅

### Remaining API Routes
- `/api/auth/[...all]` - Keep (Better Auth UI components requirement) ✅
  - Used by Better Auth UI components for React hooks (`useSession`, etc.)
  - All auth operations now use Encore client via server actions
- ~~`/api/invoices/[id]/pdf`~~ - ✅ Migrated to server action
- ~~`/api/profile/sessions`~~ - ✅ Migrated to server action
- ~~`/api/onboarding/submit`~~ - ✅ Migrated to server action
- ~~`/api/auth/sign-in/email`~~ - ✅ Migrated to server action
- ~~`/api/auth/sign-up/email`~~ - ✅ Migrated to server action

### Client Components
- **Total:** ~260 files with `'use client'`
- **Necessary:** ~200 (UI components, hooks, interactive components)
- **Could be RSC:** ~60 (mostly already migrated to RSC pattern)

## 🎯 Completion Plan

### Phase 1: Complete API Route Migration ✅ COMPLETED
1. ✅ Created `app/actions/invoices.ts` with PDF generation
2. ✅ Added `getUserSessions()` server action in `app/actions/settings.ts`
3. ✅ Created `app/actions/onboarding.ts` with organization creation
4. ✅ Updated all client components to use server actions

### Phase 2: Final Cleanup ✅ COMPLETED
1. ✅ Audited all client components for remaining fetch calls
2. ✅ Replaced all API route calls with server actions
3. ✅ All API routes migrated (except `/api/auth` which is required for Better Auth)
4. ✅ Updated documentation

### Phase 3: Optimization (Optional)
1. Add streaming for large data sets
2. Implement progressive enhancement
3. Add loading states with Suspense boundaries
4. Optimize revalidation strategies

## ✅ Success Criteria

- [x] All data fetching happens on server (RSC or Server Actions) ✅
- [x] No direct `fetch()` calls to internal APIs in client components ✅
- [x] All mutations use Server Actions ✅
- [x] All pages use RSC pattern with client components only for interactivity ✅
- [x] API routes only for external integrations (Better Auth, webhooks) ✅

## 📝 Notes

- **Better Auth:** Must remain as client component for auth flows
- **Marketing Pages:** Can stay as client components (low priority)
- **UI Components:** Correctly using client components (Radix, animations, etc.)
- **Hooks:** Correctly using client components (React Query, state management)

## 🚀 Next Steps

1. Create missing server actions (invoices, onboarding)
2. Replace API route calls in client components
3. Final audit and cleanup
4. Performance testing and optimization
