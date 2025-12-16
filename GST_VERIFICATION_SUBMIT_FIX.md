# GST Verification Before Submit - Fix

## Problem

User verified GST successfully in step 3 (verification step), but when submitting the onboarding form, they got error:
```
GST verification is required before submitting for approval. Please verify your GST number first.
```

## Root Cause

1. **GST verification in step 3** saved `gstVerified: true` to the organization
2. **But in `submitOnboarding`**, the code was:
   - Not passing `organizationId` to `verifyGST` API call
   - Relying on `activeOrganizationId` from session
   - If active organization wasn't set correctly, verification might not be saved to the right org
   - Then when checking `gstVerified` before submission, it was `false` because verification was saved to wrong org or not saved at all

## Solution

### 1. Check GST Status First
**Before:** Always tried to verify GST again (even if already verified)

**After:** 
- First check if organization already has `gstVerified: true`
- If already verified, skip verification (avoid duplicate API calls)
- If not verified, verify now with explicit `organizationId`

### 2. Pass `organizationId` Explicitly
**Before:**
```typescript
await client.organizations.verifyGST({
  gstNumber: formData.verification.gstNumber,
  // ❌ No organizationId - relies on activeOrganizationId from session
})
```

**After:**
```typescript
await client.organizations.verifyGST({
  gstNumber: formData.verification.gstNumber,
  organizationId: basicOrg.id, // ✅ Pass organizationId explicitly
})
```

### 3. Better Error Handling
**Before:** Silently continued if GST verification failed

**After:** 
- Throws error if GST verification fails
- Clear error message: "GST verification is required before submitting for approval"
- Proper logging for debugging

## Code Changes

**File:** `Hypedrive Brand/features/organizations/actions/onboarding.ts`

**Changes:**
1. Check organization GST status first using `getOrganization()`
2. If already verified, skip verification
3. If not verified, verify with explicit `organizationId`
4. Throw error if verification fails (don't silently continue)

## Flow After Fix

```
1. User verifies GST in step 3
   → Saves gstVerified: true to organization ✅

2. User clicks "Submit for Approval"
   → submitOnboarding() called

3. Check organization GST status
   → If gstVerified: true → Skip verification ✅
   → If gstVerified: false → Verify with organizationId ✅

4. Submit for approval
   → Backend checks gstVerified: true ✅
   → Submission succeeds ✅
```

## Benefits

1. ✅ **No duplicate verification** - Checks first, verifies only if needed
2. ✅ **Correct organization** - Always uses explicit `organizationId`
3. ✅ **Better error messages** - Clear feedback if GST not verified
4. ✅ **Performance** - Skips unnecessary API calls if already verified

## Testing

1. Verify GST in step 3
2. Submit onboarding form
3. Should succeed without "GST verification required" error
