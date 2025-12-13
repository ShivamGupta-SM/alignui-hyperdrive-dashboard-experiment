# Broken APIs - Missing Data Points

**Status:** ❌ **Backend Fix Required** - No frontend workarounds/transforms should be used

This document lists all APIs that return incomplete data (missing fields). These require backend fixes - frontend should NOT do gymnastics/transforms.

---

## 🔴 Critical: Missing Fields in Existing Endpoints

### 1. **`GET /auth/me` - MeResponse Missing Fields** ❌ **HIGH PRIORITY**

**Endpoint:** `client.auth.me()`  
**File:** `Hypedrive Encore/auth/auth.ts` (line 272-301)  
**Response Type:** `MeResponse`

**Missing Fields:**
- ❌ `phone: string | undefined` - User phone number
- ❌ `twoFactorEnabled: boolean | undefined` - 2FA status

**Current Response:**
```typescript
interface MeResponse {
  userID: string
  email: string
  name: string
  image?: string
  emailVerified: boolean
  role: string
  activeOrganizationId?: string
  organizationRole?: string
  organizationIds?: string[]
  shopperId?: string
  adminId?: string
  isImpersonating?: boolean
  impersonatedBy?: string
  // ❌ MISSING: phone
  // ❌ MISSING: twoFactorEnabled
}
```

**Where Used:**
- `lib/ssr-data.ts:264` - `phone: me.phone || ''` (empty string fallback)
- `lib/ssr-data.ts:268` - `twoFactorEnabled: me.twoFactorEnabled` (undefined)
- `app/(dashboard)/dashboard/profile/profile-client.tsx` - Uses `user.twoFactorEnabled`
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - Uses `user.phone`

**Backend Fix Required:**
```typescript
// Hypedrive Encore/auth/auth.ts
interface MeResponse {
  // ... existing fields
  phone?: string  // ← ADD THIS (from user table)
  twoFactorEnabled?: boolean  // ← ADD THIS (from user table or 2FA plugin)
}
```

**Priority:** 🔴 **HIGH** - Used in profile and settings pages

---

### 2. **`GET /enrollments/:id/detail` - EnrollmentDetail Missing Locked Fields** ❌ **HIGH PRIORITY**

**Endpoint:** `client.enrollments.getEnrollmentDetail(id)`  
**File:** `Hypedrive Encore/enrollments/enrollments.ts` (line 724-948)  
**Response Type:** `EnrollmentDetail`

**Missing Fields:**
- ❌ `lockedBillRate: number` - Locked bill rate at enrollment time
- ❌ `lockedPlatformFee: number` - Locked platform fee at enrollment time
- ❌ `lockedRebatePercentage: number` - Locked rebate percentage (exists but may not be in base Enrollment)
- ❌ `lockedBonusAmount: number` - Locked bonus amount (exists but may not be in base Enrollment)

**Current Response:**
```typescript
interface EnrollmentDetail extends Enrollment {
  // ... other fields
  pricing: {
    orderValue: number
    rebatePercentage: number
    billRate: number
    platformFee: number
    // ... other pricing fields
  }
  // ❌ MISSING: lockedBillRate (directly on EnrollmentDetail)
  // ❌ MISSING: lockedPlatformFee (directly on EnrollmentDetail)
  // ❌ MISSING: lockedRebatePercentage (directly on EnrollmentDetail)
  // ❌ MISSING: lockedBonusAmount (directly on EnrollmentDetail)
}
```

**Where Used:**
- `app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:37` - `(enrollment as any).lockedBillRate` (type assertion workaround)
- `app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:39` - `(enrollment as any).lockedPlatformFee` (type assertion workaround)
- `app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:282-284` - Direct access to `enrollment.lockedRebatePercentage`, `lockedBillRate`, `lockedPlatformFee`

**Backend Fix Required:**
```typescript
// Hypedrive Encore/enrollments/enrollments.ts
interface EnrollmentDetail extends Enrollment {
  // ... existing fields
  lockedBillRate: number  // ← ADD THIS (from enrollment table)
  lockedPlatformFee: number  // ← ADD THIS (from enrollment table)
  lockedRebatePercentage: number  // ← ADD THIS (from enrollment table)
  lockedBonusAmount: number  // ← ADD THIS (from enrollment table)
}
```

**Note:** These fields exist in the `Enrollment` base type, but may not be properly included in `EnrollmentDetail` response. Verify they're being returned.

**Priority:** 🔴 **HIGH** - Required for cost calculations and display

---

### 3. **`GET /organizations/:id` - Organization Missing Fields** ❌ **MEDIUM PRIORITY**

**Endpoint:** `client.organizations.getOrganization(id)`  
**File:** `Hypedrive Encore/organizations/organizations.ts`  
**Response Type:** `Organization`

**Missing/Incorrect Fields:**
- ❌ `email: string | undefined` - Organization contact email (completely missing)
- ⚠️ Field name mismatch: `phoneNumber` (backend) vs `phone` (frontend expects)
- ⚠️ Field name mismatch: `industryCategory` (backend) vs `industry` (frontend expects)

**Current Response:**
```typescript
interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  website?: string
  phoneNumber?: string  // ← Frontend expects 'phone'
  industryCategory?: string  // ← Frontend expects 'industry'
  // ❌ MISSING: email
  // ... other fields
}
```

**Where Used:**
- `lib/ssr-data.ts:238-240` - Field mapping workaround:
  ```typescript
  phone: organization.phoneNumber || '',
  industry: organization.industryCategory || '',
  email: '', // ❌ Missing in backend - needs to be added
  ```
- `app/(dashboard)/dashboard/settings/settings-client.tsx` - Uses `organization.email`, `organization.phone`, `organization.industry`

**Backend Fix Required:**
```typescript
// Hypedrive Encore/organizations/organizations.ts
interface Organization {
  // ... existing fields
  email?: string  // ← ADD THIS (organization contact email)
  phone?: string  // ← ADD THIS (or keep phoneNumber and add phone as alias)
  industry?: string  // ← ADD THIS (or keep industryCategory and add industry as alias)
}
```

**OR** Standardize field names:
- Rename `phoneNumber` → `phone`
- Rename `industryCategory` → `industry`
- Add `email` field

**Priority:** 🟡 **MEDIUM** - Used in settings page, field mapping workaround exists

---

### 4. **`GET /auth/list-sessions` - SessionResponse Missing Device Info** ❌ **MEDIUM PRIORITY**

**Endpoint:** `client.auth.listSessions()`  
**File:** `Hypedrive Encore/auth/auth.ts`  
**Response Type:** `{ sessions: SessionResponse[] }`

**Missing Fields:**
- ❌ `device: string | undefined` - Device name (e.g., "iPhone 14 Pro", "MacBook Pro")
- ❌ `browser: string | undefined` - Browser name (e.g., "Chrome", "Safari")
- ❌ `location: string | undefined` - Location (e.g., "Mumbai, India")
- ❌ `lastActive: string | undefined` - Last active timestamp
- ❌ `current: boolean` - Whether this is the current session
- ❌ `iconType: 'computer' | 'smartphone' | 'mac' | undefined` - Device type for icon

**Current Response:**
```typescript
interface SessionResponse {
  id: string
  token: string
  userId: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  // ❌ MISSING: device
  // ❌ MISSING: browser
  // ❌ MISSING: location
  // ❌ MISSING: lastActive
  // ❌ MISSING: current
  // ❌ MISSING: iconType
}
```

**Where Used:**
- `app/(dashboard)/dashboard/settings/settings-client.tsx:855-862` - `Session` interface expects these fields
- `app/(dashboard)/dashboard/settings/settings-client.tsx:876-889` - `getUserSessions()` server action
- Settings page security section displays device info

**Backend Fix Required:**
```typescript
// Hypedrive Encore/auth/auth.ts
interface SessionResponse {
  // ... existing fields
  device?: string  // ← ADD THIS (parse from userAgent)
  browser?: string  // ← ADD THIS (parse from userAgent)
  location?: string  // ← ADD THIS (IP geolocation)
  lastActive?: string  // ← ADD THIS (last activity timestamp)
  current?: boolean  // ← ADD THIS (compare with current session token)
  iconType?: 'computer' | 'smartphone' | 'mac'  // ← ADD THIS (infer from userAgent)
}
```

**Implementation Notes:**
- Parse `userAgent` to extract device and browser names
- Use IP geolocation service for location
- Track last activity timestamp per session
- Compare session token with current session to set `current`
- Infer `iconType` from userAgent (mobile → 'smartphone', Mac → 'mac', else → 'computer')

**Priority:** 🟡 **MEDIUM** - Used in settings security section

---

### 5. **`GET /auth/list-device-sessions` - DeviceSession Missing Fields** ❌ **LOW PRIORITY**

**Endpoint:** `client.auth.listDeviceSessions()`  
**File:** `Hypedrive Encore/auth/auth.ts`  
**Response Type:** `{ sessions: DeviceSession[] }`

**Missing Fields:**
- ❌ Same as SessionResponse (device, browser, location, lastActive, iconType)

**Current Response:**
```typescript
interface DeviceSession {
  id: string
  userId: string
  token: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  current: boolean
  // ❌ MISSING: device, browser, location, lastActive, iconType
}
```

**Backend Fix Required:**
Same as Fix 4 (SessionResponse)

**Priority:** 🟢 **LOW** - Similar to listSessions

---

### 6. **`GET /organizations/:id/members` - Missing Invitations** ❌ **LOW PRIORITY**

**Endpoint:** `client.organizations.listMembers(orgId)`  
**File:** `Hypedrive Encore/organizations/organizations.ts`  
**Response Type:** `{ data: MemberResponse[] }`

**Missing Endpoint:**
- ❌ `GET /organizations/:id/invitations` - List pending invitations
- ❌ `client.organizations.listInvitations(orgId)` - Method doesn't exist

**Current Workaround:**
- `lib/ssr-data.ts:209` - Returns empty array: `invitations: []`

**Where Used:**
- `app/(dashboard)/dashboard/team/team-client.tsx` - Team page expects invitations list
- `hooks/use-team.ts` - May use invitations

**Backend Fix Required:**
```typescript
// Hypedrive Encore/organizations/organizations.ts
export const listInvitations = api(
  { expose: true, auth: true, method: "GET", path: "/organizations/:organizationId/invitations" },
  async ({ organizationId }: { organizationId: string }): Promise<{ data: InvitationResponse[] }> => {
    // Fetch pending invitations for organization
    // Return invitations with status, email, role, expiresAt, etc.
  }
)
```

**Priority:** 🟢 **LOW** - Team page can work without invitations for now

---

## 📊 Summary of Missing Data

### 🔴 High Priority (Must Fix):
1. **`/auth/me`** - Missing `phone`, `twoFactorEnabled`
2. **`/enrollments/:id/detail`** - Missing `lockedBillRate`, `lockedPlatformFee`, `lockedRebatePercentage`, `lockedBonusAmount` (or not properly exposed)

### 🟡 Medium Priority (Should Fix):
3. **`/organizations/:id`** - Missing `email`, field name mismatches (`phoneNumber` vs `phone`, `industryCategory` vs `industry`)
4. **`/auth/list-sessions`** - Missing device info fields (`device`, `browser`, `location`, `lastActive`, `current`, `iconType`)

### 🟢 Low Priority (Nice to Have):
5. **`/auth/list-device-sessions`** - Missing device info fields (same as #4)
6. **`/organizations/:id/invitations`** - Endpoint completely missing

---

## 🚫 Frontend Workarounds to Remove (After Backend Fixes)

### Current Workarounds (Remove After Backend Fix):

1. **`lib/ssr-data.ts:264`** - Remove `|| ''` fallback for `phone`
2. **`lib/ssr-data.ts:268`** - Remove undefined check for `twoFactorEnabled`
3. **`lib/ssr-data.ts:238-240`** - Remove field mapping (`phoneNumber` → `phone`, `industryCategory` → `industry`, empty `email`)
4. **`app/(dashboard)/dashboard/enrollments/[id]/enrollment-detail-client.tsx:37,39`** - Remove `as any` type assertions for `lockedBillRate` and `lockedPlatformFee`
5. **`lib/ssr-data.ts:209`** - Remove empty `invitations: []` array (use actual endpoint)

---

## ✅ Verification Checklist

After backend fixes, verify:

- [ ] `MeResponse.phone` is returned
- [ ] `MeResponse.twoFactorEnabled` is returned
- [ ] `EnrollmentDetail.lockedBillRate` is returned
- [ ] `EnrollmentDetail.lockedPlatformFee` is returned
- [ ] `EnrollmentDetail.lockedRebatePercentage` is returned
- [ ] `EnrollmentDetail.lockedBonusAmount` is returned
- [ ] `Organization.email` is returned
- [ ] `Organization.phone` is returned (or `phoneNumber` standardized)
- [ ] `Organization.industry` is returned (or `industryCategory` standardized)
- [ ] `SessionResponse.device` is returned
- [ ] `SessionResponse.browser` is returned
- [ ] `SessionResponse.location` is returned
- [ ] `SessionResponse.lastActive` is returned
- [ ] `SessionResponse.current` is returned
- [ ] `SessionResponse.iconType` is returned
- [ ] `listInvitations(orgId)` endpoint exists

---

## 📝 Notes

- **No Frontend Transforms:** All fixes should be in backend. Frontend should receive correct data directly.
- **Type Safety:** After fixes, remove all `as any` type assertions and workarounds.
- **Field Naming:** Standardize field names (prefer `phone` over `phoneNumber`, `industry` over `industryCategory`).
- **Optional Fields:** Use `| undefined` for optional fields, not empty strings or nulls as fallbacks.

---

## 🔗 Related Documents

- `docs/MISSING_ENDPOINTS.md` - Completely missing endpoints (subscription, billing, etc.)
- `docs/INCOMPLETE_ENDPOINT_DATA.md` - Previous analysis (some overlap)
- `docs/HARD_CODED_VALUES.md` - Hard-coded values that need backend data
