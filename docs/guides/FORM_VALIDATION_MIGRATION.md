# Form Validation Migration to RHF + Zod

This document tracks the migration of all forms to use React Hook Form (RHF) + Zod validation.

## ✅ Completed Migrations

### 1. Authentication Forms
- ✅ **Sign In** (`app/(auth)/sign-in/page.tsx`) - Using RHF + Zod
- ✅ **Sign Up** (`app/(auth)/sign-up/page.tsx`) - Using RHF + Zod
- ✅ **Forgot Password** (`app/forgot-password/page.tsx`) - Using RHF + Zod
- ✅ **Reset Password** (`app/reset-password/page.tsx`) - Using RHF + Zod

### 2. Settings Forms
- ✅ **Profile Section** (`app/(dashboard)/dashboard/settings/settings-client.tsx`)
  - Profile update form - Migrated to RHF + Zod
  - Uses `updateProfileBodySchema` from `lib/validations.ts`
- ✅ **Organization Section** (`app/(dashboard)/dashboard/settings/settings-client.tsx`)
  - Organization update form - Migrated to RHF + Zod
  - Uses `updateOrganizationBodySchema` from `lib/validations.ts`
- ✅ **Security Section** (`app/(dashboard)/dashboard/settings/settings-client.tsx`)
  - Password change form - Migrated to RHF + Zod
  - Uses `changePasswordSchema` from `lib/validations.ts`
- ⚠️ **GST Section** - No form (display only)
- ⚠️ **Billing Section** - No form (display only, hard-coded data)

### 3. Wallet Forms
- ✅ **Credit Request Form** (`app/(dashboard)/dashboard/wallet/wallet-client.tsx`)
  - Migrated to RHF + Zod
  - Uses `creditRequestSchema` from `lib/validations.ts`

### 4. Product Forms
- ✅ **Product Edit Modal** (`app/(dashboard)/dashboard/products/products-client.tsx`)
  - Migrated to RHF + Zod
  - Uses `productFormSchema` from `lib/validations.ts`
- ✅ **Product Creation Form** (`app/(dashboard)/dashboard/products/new/page.tsx`)
  - Migrated to RHF + Zod
  - Uses `productFormSchema` from `lib/validations.ts`

### 5. Team Forms
- ✅ **Invite Member Form** (`app/(dashboard)/dashboard/team/team-client.tsx`)
  - Migrated to RHF + Zod
  - Uses `inviteMemberSchema` from `lib/validations.ts`

---

## ⏳ Pending Migrations

### 1. Campaign Creation Form
**File:** `app/(dashboard)/dashboard/campaigns/create/page.tsx`

**Current State:**
- Using `useState` with `formData` object
- Multi-step form (4 steps)
- Manual validation with `canProceed()` function

**Required Changes:**
1. Create `campaignFormSchema` in `lib/validations.ts` (already exists as `campaignSchema`)
2. Use RHF's `useForm` with multi-step support
3. Replace all `formData` state with RHF `register` and `Controller`
4. Use `formState.errors` for validation display
5. Update step navigation to validate current step before proceeding

**Schema Needed:**
```typescript
export const campaignFormSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  productId: z.string().min(1),
  type: z.enum(['cashback', 'barter', 'hybrid']),
  isPublic: z.boolean(),
  maxEnrollments: z.number().min(1).max(100000),
  submissionDeadlineDays: z.number().min(1).max(90),
  startDate: z.date(),
  endDate: z.date(),
  deliverables: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    isRequired: z.boolean(),
  })),
  terms: z.array(z.string()).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})
```

**Priority:** 🔴 **HIGH** - Complex multi-step form

---

### 2. Onboarding Form
**File:** `app/(onboarding)/onboarding/page.tsx`

**Current State:**
- Using `useState` with nested `formData` object
- Multi-step form (4 steps)
- Manual validation with `canProceed()` function
- GST and PAN verification logic

**Required Changes:**
1. Create `onboardingFormSchema` in `lib/validations.ts`
2. Use RHF's `useForm` with multi-step support
3. Replace all `formData` state with RHF
4. Handle nested form structure (basicInfo, businessDetails, verification)
5. Integrate GST/PAN verification with form validation

**Schema Needed:**
```typescript
export const onboardingFormSchema = z.object({
  basicInfo: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    website: z.string().url().optional().or(z.literal('')),
  }),
  businessDetails: z.object({
    businessType: z.enum(['private_limited', 'public_limited', 'llp', 'partnership', 'sole_proprietorship']),
    industryCategory: z.string().min(1),
    contactPerson: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(1),
    pinCode: z.string().regex(/^\d{6}$/),
  }),
  verification: z.object({
    gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/),
    gstVerified: z.boolean(),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
    panVerified: z.boolean(),
    cinNumber: z.string().optional(),
  }),
})
```

**Priority:** 🔴 **HIGH** - Complex multi-step form with verification

---

## 📋 Schema Status in `lib/validations.ts`

### ✅ Existing Schemas (Ready to Use)
- `signInSchema` - ✅ Used
- `signUpSchema` - ✅ Used
- `forgotPasswordSchema` - ✅ Used
- `resetPasswordSchema` - ✅ Used
- `changePasswordSchema` - ✅ Used
- `updateProfileBodySchema` - ✅ Used
- `updateOrganizationBodySchema` - ✅ Used
- `productFormSchema` - ✅ Used (newly created)
- `creditRequestSchema` - ✅ Used
- `inviteMemberSchema` - ✅ Used (newly created)
- `campaignSchema` - ✅ Exists (needs to be used)
- `productSchema` - ✅ Exists (legacy, replaced by `productFormSchema`)

### ⚠️ Schemas That Need Creation
- `onboardingFormSchema` - ❌ Needs to be created

---

## 🔧 Implementation Notes

### FormField Component Update
**File:** `app/(dashboard)/dashboard/settings/settings-client.tsx`

Updated `FormField` component to accept `error` prop:
```typescript
function FormField({
  label,
  required,
  error,  // ← Added
  children
}: {
  label: string
  required?: boolean
  error?: string  // ← Added
  children: React.ReactNode
})
```

### Select Component with RHF
For Select components, use `Controller` from RHF:
```typescript
<Controller
  name="categoryId"
  control={control}
  render={({ field }) => (
    <Select.Root value={field.value || ''} onValueChange={field.onChange}>
      <Select.Trigger>
        <Select.Value placeholder="Select category" />
      </Select.Trigger>
      <Select.Content>
        {options.map((opt) => (
          <Select.Item key={opt.id} value={opt.id}>{opt.name}</Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )}
/>
```

### Radio Group with RHF
For Radio groups, use `Controller`:
```typescript
<Controller
  name="role"
  control={control}
  render={({ field }) => (
    <Radio.Group value={field.value} onValueChange={field.onChange}>
      {/* Radio items */}
    </Radio.Group>
  )}
/>
```

### Multi-Step Forms
For multi-step forms, use RHF's validation mode:
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange', // or 'onBlur' for better performance
  // Validate only current step
  criteriaMode: 'all',
})
```

---

## 📊 Migration Progress

**Total Forms:** 12
**Migrated:** 9 ✅
**Pending:** 2 ⏳ (Campaign Creation, Onboarding)
**No Form (Display Only):** 1 (GST Section)

**Progress:** 75% Complete

---

## 🎯 Next Steps

1. **Migrate Campaign Creation Form** (High Priority)
   - Complex multi-step form
   - Requires careful handling of step validation
   - Deliverables array management

2. **Migrate Onboarding Form** (High Priority)
   - Complex multi-step form
   - Nested form structure
   - GST/PAN verification integration

3. **Add Bank Account Form** (If exists)
   - Check if there's a form to add bank accounts in settings
   - Use `bankAccountBodySchema` if form exists

---

## ✅ Benefits of Migration

1. **Type Safety:** Full TypeScript support with Zod schema inference
2. **Better Validation:** Real-time validation with proper error messages
3. **Performance:** RHF only re-renders changed fields
4. **Consistency:** All forms use the same validation pattern
5. **Less Boilerplate:** No manual `useState` for each field
6. **Better UX:** Automatic error display and form state management

---

## 📝 Notes

- All migrated forms now use `handleSubmit` from RHF
- Error messages are displayed using `formState.errors`
- FormField component updated to show errors
- Select and Radio components use `Controller` for RHF integration
- Multi-step forms will need special handling for step-by-step validation
