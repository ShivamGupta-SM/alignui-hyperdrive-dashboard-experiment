# Onboarding Steps Combined - Business & Verification

## Changes Made

### Before (4 Steps)
1. **Step 1:** Basic Info - Organization name, website, description
2. **Step 2:** Business Details - Business type, industry, contact, phone, address, city, state, PIN
3. **Step 3:** Verification - GST number (API returns: legal name, trade name, address)
4. **Step 4:** Review - Review all details and submit

### After (3 Steps)
1. **Step 1:** Basic Info - Organization name, website, description
2. **Step 2:** Business & Verification (Combined)
   - **First:** GST verification (API call)
   - **Auto-fill:** Address from GST API response
   - **Then:** User fills remaining: Business type, industry, contact person, phone, city, state, PIN, CIN
3. **Step 3:** Review - Review all details and submit

## Key Improvements

### 1. Auto-Fill Address from GST API
**Before:** User manually enters address in Step 2, then GST API returns address in Step 3 (duplicate entry)

**After:** 
- GST verification happens first
- Address automatically filled from API response
- User can edit if needed (field is disabled but editable)

### 2. Better UX Flow
**Before:** 
- Step 2: Enter address manually
- Step 3: Verify GST (API returns address again)
- User confused - why enter address if API gives it?

**After:**
- Step 2: Verify GST first → Address auto-filled → Fill remaining details
- Logical flow: Verify first, then complete

### 3. Reduced Steps
**Before:** 4 steps
**After:** 3 steps (25% reduction)

## Implementation Details

### File: `app/(onboarding)/onboarding/page.tsx`

1. **Updated Steps Array:**
   ```typescript
   const steps = [
     { label: "Basic Info", value: 1 },
     { label: "Business & Verification", value: 2 }, // Combined
     { label: "Review", value: 3 },
   ]
   ```

2. **Combined Component:**
   - `Step2BusinessAndVerification` - Merged Step 2 & 3
   - GST verification section at top
   - Business details section below (after GST verified)

3. **Auto-Fill Logic:**
   ```typescript
   // When GST verified, auto-fill address
   if (result.gstDetails.address) {
     setValue("businessDetails.address", result.gstDetails.address, { shouldValidate: true })
   }
   ```

4. **Address Field:**
   - Disabled when GST address is available
   - Shows hint: "Auto-filled from GST verification"
   - User can still edit if needed

5. **Validation:**
   - Step 2 now validates both GST verification AND business details
   - GST must be verified before proceeding

## Benefits

1. ✅ **No duplicate entry** - Address comes from API, not manual
2. ✅ **Better UX** - One step instead of two
3. ✅ **Auto-fill** - API data automatically populates fields
4. ✅ **Logical flow** - Verify first, then fill remaining details
5. ✅ **Faster onboarding** - 25% fewer steps

## Testing

1. Enter basic info (Step 1)
2. Verify GST (Step 2) → Address auto-fills
3. Complete business details (Step 2)
4. Review and submit (Step 3)
