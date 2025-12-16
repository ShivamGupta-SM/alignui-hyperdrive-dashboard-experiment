# Onboarding Steps Combine Plan

## Current Flow (4 Steps)

1. **Step 1: Basic Info** - Organization name, website, description
2. **Step 2: Business Details** - Business type, industry, contact, phone, address, city, state, PIN
3. **Step 3: Verification** - GST number (API returns: legal name, trade name, address)
4. **Step 4: Review** - Review all details and submit

## Problem

- **Step 2** asks user to manually enter address
- **Step 3** GST verification API returns address automatically
- **Duplicate data entry** - User enters address in Step 2, then GST API returns address in Step 3
- **Poor UX** - User has to enter same information twice

## Solution: Combine Step 2 & 3

### New Flow (3 Steps)

1. **Step 1: Basic Info** - Organization name, website, description
2. **Step 2: Business & Verification** (Combined)
   - First: GST verification (API call)
   - Auto-fill from API: Legal name, Trade name, Address
   - Then: User fills remaining: Business type, industry, contact person, phone, city, state, PIN, CIN
3. **Step 3: Review** - Review all details and submit

### Benefits

1. ✅ **No duplicate entry** - Address comes from GST API, not manual entry
2. ✅ **Better UX** - One step instead of two
3. ✅ **Auto-fill** - API data automatically populates fields
4. ✅ **Logical flow** - Verify first, then fill remaining details

### Implementation

1. Combine `Step2BusinessDetails` and `Step3Verification` into one component
2. GST verification happens first (at top of form)
3. When GST verified, auto-fill:
   - Legal name → Can be used for organization name (if not set)
   - Trade name → Display for reference
   - Address → Auto-fill address field
4. User then fills remaining fields:
   - Business type
   - Industry category
   - Contact person
   - Phone number
   - City, State, PIN (can be extracted from address or manual)
   - CIN (if applicable)

### Code Changes

- Merge `Step2BusinessDetails` and `Step3Verification` components
- Update step navigation (1, 2, 3 instead of 1, 2, 3, 4)
- Auto-fill address from GST API response
- Update validation logic
