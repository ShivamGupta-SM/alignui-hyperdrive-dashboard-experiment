# Prop Drilling Analysis

**Question:** "propdrilling kaha kah reh gya hai? minimum hona chahiye na prop drilling?"

## ❌ Current Prop Drilling Issues

### 1. **DashboardShell - User & Organizations** ❌

**Problem:**
```typescript
// dashboard-shell.tsx
<DashboardShell user={user} organizations={organizations}>
  <DashboardShellInner user={user} organizations={organizations}>
    <Sidebar organizations={organizations} user={user} />
    <Header user={user} />
    <SettingsPanel user={user} />
    <CommandMenu user={user} />
  </DashboardShellInner>
</DashboardShell>
```

**Props being drilled:**
- `user` - Passed through 3 levels (DashboardShell → DashboardShellInner → Child components)
- `organizations` - Passed through 3 levels

**Why unnecessary:**
- ✅ `useSession()` hook already provides user data
- ✅ `useActiveOrganization()` hook can derive active org from session
- ✅ Organizations can be fetched via React Query hook
- ✅ All child components can use hooks directly

**Impact:** 7+ prop passes for data that's already available via hooks

---

### 2. **OnboardingPage - FormData** ⚠️

**Problem:**
```typescript
// onboarding/page.tsx
<Step1BasicInfo formData={formData} updateBasicInfo={updateBasicInfo} />
<Step2BusinessDetails formData={formData} updateBusinessDetails={updateBusinessDetails} />
<Step3Verification formData={formData} updateVerification={updateVerification} />
```

**Why acceptable:**
- ✅ Form state is local to the page
- ✅ Steps are sequential (not deeply nested)
- ✅ Only 1 level of prop passing
- ⚠️ Could use React Hook Form + Context for better DX

**Impact:** Low - acceptable pattern for multi-step forms

---

### 3. **CreateCampaignPage - FormData** ⚠️

**Problem:**
```typescript
// campaigns/create/page.tsx
<Step1BasicInfo formData={formData} updateFormData={updateFormData} />
<Step2Schedule formData={formData} updateFormData={updateFormData} />
```

**Why acceptable:**
- ✅ Form state is local to the page
- ✅ Steps are sequential
- ⚠️ Could use React Hook Form for better DX

**Impact:** Low - acceptable pattern

---

## ✅ Solutions

### Solution 1: Remove User/Organizations Props (HIGH PRIORITY)

**Before (Prop Drilling):**
```typescript
// dashboard-shell.tsx
export function DashboardShell({ children, user, organizations }: DashboardShellProps) {
  return (
    <DashboardShellInner user={user} organizations={organizations}>
      {children}
    </DashboardShellInner>
  )
}

function DashboardShellInner({ children, user, organizations }: DashboardShellProps) {
  return (
    <>
      <Sidebar organizations={organizations} user={user} />
      <Header user={user} />
      <SettingsPanel user={user} />
    </>
  )
}
```

**After (No Prop Drilling):**
```typescript
// dashboard-shell.tsx
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShellInner>
      {children}
    </DashboardShellInner>
  )
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  // No props needed - components use hooks directly
  return (
    <>
      <Sidebar />
      <Header />
      <SettingsPanel />
    </>
  )
}

// sidebar.tsx
export function Sidebar() {
  const { data: session } = useSession()
  const user = session?.user
  const { data: organizations } = useOrganizations() // or from session
  const currentOrganization = useActiveOrganization(organizations || [])
  // ... rest of component
}

// header.tsx
export function Header() {
  const { data: session } = useSession()
  const user = session?.user
  // ... rest of component
}
```

**Benefits:**
- ✅ No prop drilling
- ✅ Components are self-contained
- ✅ Easier to test (no prop mocking)
- ✅ Better performance (no unnecessary re-renders from prop changes)

---

### Solution 2: Use React Hook Form for Multi-Step Forms (OPTIONAL)

**Before:**
```typescript
const [formData, setFormData] = useState(...)
<Step1 formData={formData} updateFormData={updateFormData} />
```

**After:**
```typescript
const form = useForm({ resolver: zodResolver(schema) })
<Step1 form={form} />
```

**Benefits:**
- ✅ Less prop passing
- ✅ Better validation
- ✅ Better performance

---

## 📊 Summary

### Critical Issues (Must Fix):
1. ❌ **DashboardShell** - User & Organizations prop drilling (7+ passes)

### Acceptable Patterns:
2. ⚠️ **OnboardingPage** - FormData props (1 level, acceptable)
3. ⚠️ **CreateCampaignPage** - FormData props (1 level, acceptable)

### Recommendation:
**Priority 1:** Remove `user` and `organizations` props from DashboardShell and use hooks directly in child components.

**Priority 2 (Optional):** Migrate multi-step forms to React Hook Form for better DX.

---

## 🎯 Action Items

1. ✅ Remove `user` prop from DashboardShell
2. ✅ Remove `organizations` prop from DashboardShell
3. ✅ Update Sidebar to use `useSession()` and `useOrganizations()`
4. ✅ Update Header to use `useSession()`
5. ✅ Update SettingsPanel to use `useSession()`
6. ✅ Update CommandMenu to use `useSession()`
7. ✅ Update NotificationsDrawer to use `useSession()` (if needed)

**Result:** Zero prop drilling for user/organizations data! 🎉
