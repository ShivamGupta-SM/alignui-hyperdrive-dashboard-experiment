# Investigation Guide: Hooks & Server Actions Patterns

> **Purpose:** This document guides AI agents to discover codebase issues through investigation prompts.
> Instead of direct answers, follow the investigation paths to uncover patterns and anti-patterns.

---

## How to Use This Guide

1. Pick an investigation area based on your current task
2. Follow the "Check For" prompts in order
3. Each finding may lead to related patterns - follow the "Also Check" links
4. Document findings with file paths and line numbers

---

## Investigation Area 1: Data Ownership & Authorization

### Starting Point
Look at dashboard route layouts: `app/(dashboard)/dashboard/[organizationId]/layout.tsx`

### Check For
1. **What validation exists in the layout?**
   - Does it verify the user owns the `organizationId`?
   - Does it check `approvalStatus` before rendering children?
   - Compare with middleware validation in `middleware.ts`

2. **Follow the data flow:**
   - Where does `organizationId` come from?
   - Who validates that this ID belongs to the user?
   - Is there a gap between "UUID format is valid" and "user owns this org"?

3. **What happens with non-approved orgs?**
   - Can you access `/dashboard/[rejectedOrgId]/campaigns`?
   - What blocks access to draft/pending/banned orgs?

### Also Check
- [Area 2: Cache & Query Patterns](#investigation-area-2-cache--query-patterns) - related to how org data is fetched
- [Area 5: SSR Patterns](#investigation-area-5-ssr-data-patterns) - server-side data fetching

---

## Investigation Area 2: Cache & Query Patterns

### Starting Point
Search for `queryClient.invalidateQueries` across the codebase.

### Check For
1. **Scope of invalidation:**
   - Does any call use `invalidateQueries()` with no arguments?
   - What about `invalidateQueries({})` - does it invalidate ALL queries?
   - Compare with targeted invalidation: `invalidateQueries({ queryKey: [...] })`

2. **Find the org switcher logic:**
   - Look in sidebar/navigation components
   - What happens to cached data when switching orgs?
   - Could data from org-A leak into org-B's view?

3. **Query key structure:**
   - Do query keys include `organizationId`?
   - Search for `queryKey:` definitions
   - Are there queries that could return wrong org's data?

### Pattern Check
```
Find all files with: useQuery.*queryKey
Compare query key structures across features:
- campaigns/hooks/*.ts
- enrollments/hooks/*.ts
- organizations/hooks/*.ts
```

### Also Check
- [Area 3: Hook Responsibilities](#investigation-area-3-hook-responsibilities) - hooks that fetch same data
- [Area 6: Mutation Patterns](#investigation-area-6-mutation-patterns) - cache updates after mutations

---

## Investigation Area 3: Hook Responsibilities

### Starting Point
Find the largest hook files: `wc -l features/*/hooks/*.ts | sort -n`

### Check For
1. **Hook size and scope:**
   - Are there files > 300 lines?
   - Count hooks per file - are there > 5 hooks in one file?
   - Does any single hook return > 8 properties?

2. **Duplicate data sources:**
   - Find hooks that call the same API endpoint
   - Example pattern to search: `client.auth.listOrganizations`
   - Are there multiple hooks for "current organization"?

3. **Derived vs Fetched:**
   - Find hooks that derive state from other hooks
   - Are they calling `useQuery` or using another hook's data?
   - Could they use `select` option instead of a separate hook?

### Pattern Check
```
Search for these patterns:
1. "export function use" - count hooks per file
2. Multiple hooks importing same base hook
3. Hooks with both query AND mutation logic
```

### Smell Indicators
- Hook name has "And" (e.g., `useOrganizationAndStats`)
- Return object has 10+ properties
- Same base hook imported in 5+ places
- Deprecated hooks still being used

### Also Check
- [Area 4: State Machine Complexity](#investigation-area-4-state-machine-complexity) - derived state hooks
- [Area 7: Loading State Patterns](#investigation-area-7-loading-state-patterns)

---

## Investigation Area 4: State Machine Complexity

### Starting Point
Search for: `type.*State.*=` and `type.*Status.*=`

### Check For
1. **Nested enums:**
   - Is there a "state" + "subState" pattern?
   - Are there helper functions to check state? (e.g., `isApproved()`)
   - Could the nested states be flattened?

2. **Status check utilities:**
   - Search for: `STATUS_CHECKS` or similar utilities
   - Compare: `STATUS_CHECKS.isApproved(x)` vs `x === "approved"`
   - Are these utilities adding value or indirection?

3. **Onboarding flow:**
   - Find onboarding-related hooks
   - How many states does a user go through?
   - Is the state machine clearly documented?

### Pattern Check
```
Find: useOnboarding, OnboardingState, OnboardingStatus
Trace: What triggers each state transition?
Check: Could a switch statement replace nested states?
```

### Also Check
- [Area 3: Hook Responsibilities](#investigation-area-3-hook-responsibilities) - state derivation logic
- [Area 7: Loading State Patterns](#investigation-area-7-loading-state-patterns)

---

## Investigation Area 5: SSR Data Patterns

### Starting Point
Find SSR files: `find . -name "ssr.ts" -o -name "*ssr*.ts"`

### Check For
1. **Return shape consistency:**
   - Compare return types across SSR functions
   - Are they using spread (`{ ...data }`) or explicit (`{ field1, field2 }`)?
   - Is type safety maintained?

2. **Hardcoded values:**
   - Search for constants in SSR files: `TAX_RATES`, `DEFAULT_*`
   - Should these come from API/config instead?
   - Are there fallbacks that hide data issues?

3. **Error handling:**
   - What happens when SSR fetch fails?
   - Is there consistent error shape?
   - Do errors propagate correctly to UI?

### Pattern Check
```
Compare these across features:
- campaigns/ssr.ts
- enrollments/ssr.ts
- organizations/ssr.ts

Check for:
- Return type definitions
- Error boundaries
- Fallback values
```

### Also Check
- [Area 2: Cache & Query Patterns](#investigation-area-2-cache--query-patterns) - client vs server data
- [Area 8: Bulk Operations](#investigation-area-8-bulk-operation-patterns)

---

## Investigation Area 6: Mutation Patterns

### Starting Point
Search for: `useMutation` in all hook files

### Check For
1. **Server Action usage:**
   - Do mutations call server actions or direct client?
   - Find pattern: `mutationFn: (data) => client.*.method()`
   - Compare with: `mutationFn: (data) => actions.method()`

2. **Consistency within feature:**
   - In same file, are all mutations using same pattern?
   - Is one mutation using server action while another uses client?

3. **Validation layer:**
   - Server actions have Zod validation
   - Direct client calls bypass this
   - Which pattern is safer?

### Pattern Check
```
For each feature folder:
1. List all useMutation hooks
2. Check mutationFn implementation
3. Flag any that bypass server actions
```

### Red Flag Example
```tsx
// Most mutations use actions:
mutationFn: (data) => actions.createThing(data)

// But one doesn't:
mutationFn: (data) => client.organizations.extendDeadline(data)  // Why?
```

### Also Check
- [Area 2: Cache & Query Patterns](#investigation-area-2-cache--query-patterns) - cache invalidation after mutation
- [Area 8: Bulk Operations](#investigation-area-8-bulk-operation-patterns)

---

## Investigation Area 7: Loading State Patterns

### Starting Point
Search for: `isLoading`, `isPending`, `isFetching` in hooks

### Check For
1. **Multiple loading flags:**
   - Does a hook return both `isPending` AND `isFetching`?
   - Are they used differently or redundantly?
   - Check React Query docs: when is each true?

2. **Race conditions:**
   - When does hook A depend on hook B's data?
   - Is there a loading state that covers both?
   - Can component render before all data is ready?

3. **Session dependency:**
   - Do hooks wait for session to load?
   - What happens if session loads slowly?
   - Is there a flash of wrong state?

### Pattern Check
```
Find hooks that:
1. Depend on useSession() or useUser()
2. Have enabled: !!someData condition
3. Return loading states

Check: Is combined loading state correct?
```

### Also Check
- [Area 3: Hook Responsibilities](#investigation-area-3-hook-responsibilities) - loading state sources
- [Area 4: State Machine Complexity](#investigation-area-4-state-machine-complexity)

---

## Investigation Area 8: Bulk Operation Patterns

### Starting Point
Search for: `bulk`, `batch`, `multiple` in action files

### Check For
1. **Response shape consistency:**
   - Compare return types of bulk operations
   - Are field names consistent? (`count` vs `updatedCount` vs `imported`)
   - Is success/failure clearly indicated?

2. **Error aggregation:**
   - How are individual errors returned?
   - Is there a standard error shape?
   - Can client tell which items failed?

3. **Partial success handling:**
   - What if 3 of 5 items succeed?
   - Is there `isPartialSuccess` flag?
   - How does UI show mixed results?

### Pattern Check
```
Find all bulk operations:
- bulkImport*
- bulkUpdate*
- bulkDelete*
- *Batch

Compare their return shapes.
```

### Also Check
- [Area 6: Mutation Patterns](#investigation-area-6-mutation-patterns) - mutation consistency
- [Area 5: SSR Patterns](#investigation-area-5-ssr-data-patterns) - response types

---

## Investigation Area 9: Code Duplication Patterns

### Starting Point
Look for near-identical hooks or components

### Check For
1. **Status transition hooks:**
   - Search for: `usePause`, `useResume`, `useEnd`, `useComplete`
   - Are these nearly identical with different action types?
   - Could a factory pattern reduce duplication?

2. **Repeated cache invalidation:**
   - Find hooks that invalidate same query keys
   - Is the invalidation logic duplicated?
   - Could it be extracted to utility?

3. **Similar component patterns:**
   - Modal components with same structure
   - List components with same pagination
   - Form components with same validation

### Pattern Check
```
Count occurrences of:
- onSuccess: () => { qc.invalidateQueries(...)
- Same toast messages
- Same error handlers
```

### Refactor Signal
If you find 3+ hooks doing:
```tsx
useMutation({
  mutationFn: () => actions.updateStatus(orgId, id, "someAction"),
  onSuccess: () => { /* same invalidation */ },
  onError: /* same handler */
})
```
→ Consider factory pattern

### Also Check
- [Area 3: Hook Responsibilities](#investigation-area-3-hook-responsibilities)
- [Area 6: Mutation Patterns](#investigation-area-6-mutation-patterns)

---

## Investigation Area 10: Import & Export Patterns

### Starting Point
Check `index.ts` files in each feature folder

### Check For
1. **Public API clarity:**
   - Does `features/*/index.ts` export only public hooks?
   - Are internal hooks unexported?
   - Can you tell what's meant for external use?

2. **Circular dependencies:**
   - Do features import from each other?
   - Is there a clear dependency direction?

3. **Re-export efficiency:**
   - Are deprecated hooks still exported?
   - Are there unused exports?

### Pattern Check
```
For each feature folder:
1. Check index.ts exports
2. grep -r "from '@/features/X'" to find consumers
3. Identify unused exports
```

---

## Investigation Area 11: Dead Code & Stub Files

### Starting Point
Search for: empty files, TODO comments, "removed" in comments

### Check For
1. **Empty/Stub files:**
   - Find files < 10 lines
   - Check `lib/stores/` - was state management removed?
   - Are there placeholder files from migrations?

2. **Orphaned code:**
   - Find functions with no callers
   - Look for commented-out imports
   - Check for "// deprecated" or "// removed" comments

3. **Migration remnants:**
   - Search for "TODO: remove", "FIXME"
   - Look for version-gated code
   - Check for old API patterns still present

### Pattern Check
```
Find potential dead code:
1. grep -r "// TODO" --include="*.ts"
2. grep -r "deprecated" --include="*.ts"
3. Find files with only exports but no implementation
```

### Also Check
- [Area 10: Import & Export Patterns](#investigation-area-10-import--export-patterns)
- [Area 3: Hook Responsibilities](#investigation-area-3-hook-responsibilities)

---

## Investigation Area 12: Form State Patterns

### Starting Point
Search for: `useState` in form components, `useForm`, form-related files

### Check For
1. **Create vs Edit duplication:**
   - Do Create and Edit forms share logic?
   - Is state management duplicated?
   - Could they use same form hook with different initial values?

2. **Form library usage:**
   - Is react-hook-form used consistently?
   - Are there raw useState forms mixed with RHF?
   - Is validation logic shared via Zod schemas?

3. **State persistence:**
   - Is form state saved to localStorage?
   - Is there a draft system?
   - Do multiple sources of truth exist?

### Pattern Check
```
For each form component:
1. Check if using react-hook-form or raw state
2. Compare Create/Edit versions of same form
3. Look for duplicated validation logic
```

### Red Flag Example
```tsx
// CreateTeamForm
const [name, setName] = useState("")

// EditTeamForm (same file)
const [name, setName] = useState(team.name)
// ↑ Same pattern duplicated - extract to hook!
```

### Also Check
- [Area 3: Hook Responsibilities](#investigation-area-3-hook-responsibilities)
- [Area 4: State Machine Complexity](#investigation-area-4-state-machine-complexity)

---

## Investigation Area 13: Deprecated Code Patterns

### Starting Point
Search for: `@deprecated`, `deprecated`, console.warn about deprecation

### Check For
1. **JSDoc deprecation:**
   - Find `@deprecated` tags
   - Are deprecated items still exported?
   - Is there migration guidance?

2. **Runtime warnings:**
   - Are deprecated functions logging warnings?
   - Do they work in development but not production?

3. **Cleanup status:**
   - How long has deprecated code existed?
   - Are there consumers still using it?
   - Is there a removal timeline?

### Pattern Check
```
Find deprecated code:
1. grep -r "@deprecated" --include="*.ts"
2. Check if deprecated hooks are still in index.ts exports
3. Search for "prefer" or "instead" in comments (migration hints)
```

### Also Check
- [Area 10: Import & Export Patterns](#investigation-area-10-import--export-patterns)
- [Area 11: Dead Code & Stub Files](#investigation-area-11-dead-code--stub-files)

---

## Investigation Area 14: Modal State & Animation Patterns

### Starting Point
Search for: `closeModal`, `setIsOpen`, modal-related state in client components

### Check For
1. **State reset timing:**
   - Is state reset BEFORE or AFTER modal close?
   - Does `closeModal(); setData(null)` cause flash of stale content?
   - Is there `onAnimationEnd` or `onExitComplete` handling?

2. **Multiple modal state hooks:**
   - Search for `use-modal.ts`, `use-modal-state.ts`
   - Are there duplicate implementations?
   - Which hook should be the SSOT?

3. **Confirmation modal patterns:**
   - Find `ConfirmationModal`, `DeleteModal` usages
   - Is the pattern consistent across features?
   - Do all modals handle loading state during async operations?

### Pattern Check
```
Find modal close patterns:
1. grep -r "closeModal" --include="*.tsx"
2. Look for state updates immediately after close
3. Check if onSuccess callbacks wait for animation
```

### Red Flag Example
```tsx
// ❌ BAD: Race condition
closeDeleteModal()
setDeletingCampaignId(null)  // Modal animating out shows stale ID

// ✅ GOOD: Reset first, then close
setDeletingCampaignId(null)
closeDeleteModal()

// OR: Use animation callback
onAnimationComplete={() => setDeletingCampaignId(null)}
```

### Also Check
- [Area 7: Loading State Patterns](#investigation-area-7-loading-state-patterns)
- [Area 9: Code Duplication Patterns](#investigation-area-9-code-duplication-patterns)

---

## Investigation Area 15: Entity Ownership Validation

### Starting Point
Look at nested entity pages: `[organizationId]/campaigns/[id]/page.tsx`

### Check For
1. **URL parameter trust:**
   - Is `campaignId` validated to belong to `organizationId`?
   - Could user access `/dashboard/org-A/campaigns/campaign-from-org-B`?
   - Is validation client-side only or server-side?

2. **API response trust:**
   - Does frontend blindly render API response?
   - Is there org mismatch detection?
   - What if API returns entity from different org?

3. **Detail page guards:**
   - Do entity detail pages use OrganizationGuard?
   - Is there entity-level ownership check?
   - Compare with list pages - same protection?

### Pattern Check
```
For each entity detail page:
1. Check if page validates entity.organizationId === URL.organizationId
2. Check if API validates ownership server-side
3. Look for guard components wrapping content
```

### Red Flag Example
```tsx
// ❌ BAD: No ownership validation
export default function CampaignPage({ params }) {
  const { data } = useCampaign(params.id)  // Trusts URL param blindly
  return <CampaignDetail campaign={data} />
}

// ✅ GOOD: Validates ownership
export default function CampaignPage({ params }) {
  const { data } = useCampaign(params.organizationId, params.id)
  if (data?.organizationId !== params.organizationId) {
    redirect('/dashboard')  // Entity doesn't belong to this org
  }
  return <CampaignDetail campaign={data} />
}
```

### Also Check
- [Area 1: Data Ownership & Authorization](#investigation-area-1-data-ownership--authorization)
- [Area 5: SSR Data Patterns](#investigation-area-5-ssr-data-patterns)

---

## Investigation Area 16: Async Error Handling Patterns

### Starting Point
Search for: `Promise.all`, `await`, try-catch blocks in SSR and page components

### Check For
1. **Promise.all vs Promise.allSettled:**
   - Does `Promise.all` fail fast on any error?
   - Could one failed fetch crash entire page?
   - Should use `Promise.allSettled` for graceful degradation?

2. **Error boundaries:**
   - Are error boundaries at right granularity?
   - Does one section error crash whole page?
   - Is there fallback UI for partial failures?

3. **SSR error handling:**
   - What happens when SSR fetch fails?
   - Is there graceful fallback or hard error?
   - Do dev fallbacks hide production issues?

### Pattern Check
```
Find Promise.all usage:
1. grep -r "Promise.all" --include="*.ts" --include="*.tsx"
2. Check if results are destructured assuming all succeed
3. Look for missing error handling on individual results
```

### Red Flag Example
```tsx
// ❌ BAD: Fails completely if any fetch fails
const [stats, campaigns, enrollments] = await Promise.all([
  getStats(orgId),
  getCampaigns(orgId),
  getEnrollments(orgId),
])

// ✅ GOOD: Graceful degradation
const results = await Promise.allSettled([
  getStats(orgId),
  getCampaigns(orgId),
  getEnrollments(orgId),
])
const stats = results[0].status === 'fulfilled' ? results[0].value : null
const campaigns = results[1].status === 'fulfilled' ? results[1].value : []
const enrollments = results[2].status === 'fulfilled' ? results[2].value : []
```

### Also Check
- [Area 5: SSR Data Patterns](#investigation-area-5-ssr-data-patterns)
- [Area 7: Loading State Patterns](#investigation-area-7-loading-state-patterns)

---

## Investigation Area 17: Large Hook File Patterns

### Starting Point
Find largest hook files: Count lines in `features/*/hooks/*.ts`

### Known Large Files
| File | Lines | Issue |
|------|-------|-------|
| `use-campaigns.ts` | ~600 | 15+ hooks, queries + mutations mixed |
| `use-team.ts` | ~479 | 12 hooks, auth operations mixed |
| `use-settings.ts` | ~431 | 10 hooks, multiple domains |
| `use-organizations.ts` | ~400 | 13 hooks, monster hook present |

### Check For
1. **Hook count per file:**
   - Are there > 5 hooks in single file?
   - Could they be split by responsibility?
   - Is there a "monster hook" doing too much?

2. **Query + Mutation mixing:**
   - Are queries and mutations in same file?
   - Could split into `/queries/` and `/mutations/` folders?
   - Is cache invalidation logic duplicated?

3. **Feature domain mixing:**
   - Is settings hook handling multiple domains (profile, team, wallet)?
   - Could split by feature subdomain?

### Pattern Check
```
For each large hook file:
1. Count "export function use" occurrences
2. Count useMutation vs useQuery occurrences
3. Identify if single hook returns > 8 properties
4. Look for "monster hooks" doing query + mutations + derived state
```

### Refactor Signal
If file has:
- > 300 lines → Split into multiple files
- > 5 hooks → Consider feature subdomain split
- Queries + Mutations → Split into `/queries/` and `/mutations/`

### Also Check
- [Area 3: Hook Responsibilities](#investigation-area-3-hook-responsibilities)
- [Area 9: Code Duplication Patterns](#investigation-area-9-code-duplication-patterns)

---

## Quick Investigation Checklists

### When Reviewing a Hook File
- [ ] Count hooks in file (should be < 5 for focused files)
- [ ] Check line count (should be < 300)
- [ ] Verify query keys include org-specific segments
- [ ] Check all mutations use server actions
- [ ] Look for deprecated hooks (JSDoc @deprecated)

### When Reviewing a Server Action File
- [ ] All inputs have Zod schemas
- [ ] organizationId is in all schemas
- [ ] revalidateTag is called appropriately
- [ ] Return shapes are typed and consistent

### When Reviewing SSR File
- [ ] Return type is explicitly defined
- [ ] No spread operators on return
- [ ] Error handling is consistent
- [ ] No hardcoded business values

### When Reviewing Cache Patterns
- [ ] No bare `invalidateQueries()` calls
- [ ] Query keys include relevant IDs
- [ ] Org switch clears org-specific data only
- [ ] Loading states are composited correctly

---

## Cross-Reference Matrix

| If You Find | Also Check |
|-------------|------------|
| Bare `invalidateQueries()` | Org switcher logic, data leaks |
| Direct client calls in mutation | Other mutations in same file |
| 400+ line hook file | Hook count, split opportunities (Area 17) |
| Nested state types | Helper utilities, simplification |
| SSR spread return | Type safety, field consistency |
| Duplicate mutation hooks | Factory pattern opportunities |
| `enabled: !!session` | Race condition with other data |
| Bulk operation | Compare with other bulk ops |
| Multiple loading flags | React Query docs, composite states |
| Empty/stub files | Migration remnants, dead imports |
| Create/Edit form duplication | Shared form hooks, Zod schemas |
| `@deprecated` JSDoc | Export cleanup, consumer search |
| Raw useState in forms | react-hook-form adoption |
| `closeModal()` before state reset | Modal animation race conditions (Area 14) |
| `Promise.all` in SSR/pages | Graceful degradation with allSettled (Area 16) |
| Entity detail page without guard | Ownership validation missing (Area 15) |
| URL param trusted without validation | Cross-org access vulnerability (Area 15) |
| 600+ line hook file | Split into queries/mutations (Area 17) |
| Multiple `use-modal*.ts` files | Consolidate to single SSOT (Area 14) |
| Global-scope query keys (no orgId) | Data leak risk, multi-tab issues |
| Raw `useState` in forms | Migrate to react-hook-form + Zod |
| Duplicate CRUD/status hooks | Factory pattern opportunities |
| Inconsistent loading flag names | Standardize to `isPending`/`isFetching` |

---

## Investigation Area 18: Query Key Scoping

### Starting Point
Search for query key definitions: `queryKey:`, `*Keys = {`

### Check For
1. **Org-scoped keys:**
   - Do query keys include `organizationId`?
   - Could data from org-A appear in org-B's cache?
   - Multi-tab scenarios safe?

2. **Global vs scoped:**
   - `['storage', 'files']` ← BAD (global)
   - `['storage', 'files', orgId]` ← GOOD (scoped)

3. **Invalidation scope:**
   - Does invalidation clear correct scope?
   - Are related queries invalidated together?

### Red Flag Example
```tsx
// ❌ BAD: Global scope - data leak risk
storageKeys.files: () => ['storage', 'files']

// ✅ GOOD: Org-scoped
storageKeys.files: (orgId: string) => ['storage', 'files', orgId]
```

### Known Issues
| File | Key | Issue |
|------|-----|-------|
| `use-storage.ts:129` | `storageKeys.files()` | Global scope |
| `use-organizations.ts:196` | `organizationKeys.lists()` | Global invalidation |
| `use-team.ts:186` | `organizationKeys.lists()` | Team ops global clear |

### Also Check
- [Area 2: Cache & Query Patterns](#investigation-area-2-cache--query-patterns)
- [Area 6: Mutation Patterns](#investigation-area-6-mutation-patterns)

---

## Investigation Area 19: Form State Patterns

### Starting Point
Search for: `useState` in modal/form components, compare with `useForm`

### Check For
1. **Raw useState forms:**
   - Forms using `const [field, setField] = useState('')`
   - No validation library
   - Manual reset on close

2. **Mixed patterns:**
   - Some forms use react-hook-form
   - Some use raw useState
   - Inconsistent error handling

3. **Validation gaps:**
   - No Zod schema
   - Client-only validation
   - No error display

### Known Issues (6+ modals)
| File | Form | Fields |
|------|------|--------|
| `add-funds-modal.tsx` | Add Funds | amount, upiId |
| `withdrawal-modal.tsx` | Withdrawal | amount, selectedBank |
| `invite-team-member-modal.tsx` | Invite | email, role |
| `teams-management.tsx` | Create/Edit Team | 6 fields |
| `roles-management.tsx` | Create/Edit Role | roleName, permissions |

### Red Flag Example
```tsx
// ❌ BAD: Raw useState, no validation
const [amount, setAmount] = useState('')
const [upiId, setUpiId] = useState('')

// ✅ GOOD: react-hook-form + Zod
const form = useForm({
  resolver: zodResolver(addFundsSchema),
  defaultValues: { amount: '', upiId: '' }
})
```

### Also Check
- [Area 12: Form State Patterns](#investigation-area-12-form-state-patterns)
- [Area 9: Code Duplication Patterns](#investigation-area-9-code-duplication-patterns)

---

## Investigation Output Template

When documenting findings:

```markdown
## Finding: [Short Title]

**Location:** `path/to/file.ts:line`

**Pattern Found:**
```tsx
// code snippet
```

**Issue:**
[1-2 sentences describing the problem]

**Related Patterns:**
- [Link to related finding]
- [Files with same issue]

**Suggested Investigation:**
- [ ] Check if same pattern exists elsewhere
- [ ] Verify impact on user experience
- [ ] Identify fix complexity
```

---

*Guide Version: 1.2*
*Last Updated: 2026-01-02*
*Investigation Areas: 19 total (Areas 14-17: modal state, entity ownership, async errors, large files; Areas 18-19: query key scoping, form state patterns)*
