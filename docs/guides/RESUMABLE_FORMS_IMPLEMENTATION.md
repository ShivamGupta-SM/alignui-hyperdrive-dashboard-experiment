# Resumable Forms Implementation Guide

## Overview

This document outlines the implementation strategy for resumable forms, allowing users to save their progress and resume later from the same or different device.

## Two Scenarios

### Scenario 1: Same Machine (Local Storage)
- **Storage**: `localStorage` or `sessionStorage`
- **Pros**: Fast, no API calls, works offline
- **Cons**: Device-specific, lost if browser data cleared
- **Use Case**: Temporary draft while user is actively filling form

### Scenario 2: Different Machine (Backend Storage)
- **Storage**: Database (organization table with `approvalStatus: "draft"`)
- **Pros**: Cross-device, persistent, secure
- **Cons**: Requires API calls, needs organization ID
- **Use Case**: Long-term draft, resume from any device

## Current State

### Backend Support ✅
- Organizations can be in `draft` status
- `PATCH /organizations/:id` allows updating draft organizations
- `GET /organizations/:id` can retrieve draft organization data
- Organization created early in onboarding flow (Step 1)

### Frontend Support ❌
- No auto-save functionality
- No draft loading on page load
- Form data lost on page refresh

## Implementation Strategy

### Hybrid Approach (Recommended)

**Best of Both Worlds:**
1. **Local Storage** - For immediate auto-save (every field change)
2. **Backend Storage** - For persistence across devices (periodic save)

**Flow:**
```
User types → Auto-save to localStorage (instant)
           → Debounced save to backend (every 2-3 seconds)
           → Load from backend on page load (if org exists)
           → Fallback to localStorage if backend fails
```

## Implementation Plan

### Phase 1: Local Storage Auto-Save

**File**: `app/(onboarding)/onboarding/page.tsx`

**Changes:**
1. Add `useEffect` to watch form values and save to localStorage
2. Add `useEffect` to load from localStorage on mount
3. Debounce saves to avoid excessive writes

**Code:**
```typescript
// Auto-save to localStorage
React.useEffect(() => {
  const subscription = watch((value) => {
    // Save to localStorage with debounce
    const timeoutId = setTimeout(() => {
      localStorage.setItem('onboarding-draft', JSON.stringify(value))
      localStorage.setItem('onboarding-draft-timestamp', Date.now().toString())
    }, 1000) // 1 second debounce
    
    return () => clearTimeout(timeoutId)
  })
  
  return () => subscription.unsubscribe()
}, [watch])

// Load from localStorage on mount
React.useEffect(() => {
  const saved = localStorage.getItem('onboarding-draft')
  if (saved) {
    try {
      const draft = JSON.parse(saved)
      reset(draft) // Restore form state
      // Optionally show a toast: "Draft restored"
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
}, [reset])
```

### Phase 2: Backend Auto-Save

**Prerequisites:**
- Organization must be created first (Step 1 - Basic Info)
- Organization ID needed for saving

**New Server Action**: `app/actions/onboarding.ts`

```typescript
/**
 * Save onboarding draft to backend
 */
export async function saveOnboardingDraft(
  organizationId: string,
  formData: Partial<OrganizationDraft>
) {
  const client = getEncoreClient()
  
  try {
    // Update organization with draft data
    await client.organizations.updateOrganization(organizationId, {
      // Map formData to organization fields
      description: formData.basicInfo?.description,
      website: formData.basicInfo?.website,
      businessType: formData.businessDetails?.businessType,
      // ... other fields
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Load onboarding draft from backend
 */
export async function loadOnboardingDraft(organizationId: string) {
  const client = getEncoreClient()
  
  try {
    const org = await client.organizations.getOrganization(organizationId)
    
    // Map organization data back to form format
    return {
      basicInfo: {
        name: org.name,
        description: org.description,
        website: org.website,
        logo: org.logo,
      },
      businessDetails: {
        businessType: org.businessType,
        industryCategory: org.industryCategory,
        contactPerson: org.contactPerson,
        phone: org.phoneNumber,
        address: org.address,
        city: org.city,
        state: org.state,
        pinCode: org.postalCode,
      },
      verification: {
        gstNumber: org.gstNumber,
        gstVerified: org.gstVerified,
        panNumber: org.panNumber,
        panVerified: org.panVerified,
        cinNumber: org.cinNumber,
      },
    }
  } catch (error) {
    return null
  }
}
```

**Frontend Integration:**
```typescript
// Auto-save to backend (after organization is created)
React.useEffect(() => {
  // Only save if organization exists
  if (!organizationId) return
  
  const subscription = watch(async (value) => {
    // Debounce backend saves (less frequent than localStorage)
    const timeoutId = setTimeout(async () => {
      try {
        await saveOnboardingDraft(organizationId, value)
        // Optional: Show subtle indicator "Draft saved"
      } catch (error) {
        console.error('Failed to save draft:', error)
        // Fallback to localStorage only
      }
    }, 3000) // 3 second debounce for backend
    
    return () => clearTimeout(timeoutId)
  })
  
  return () => subscription.unsubscribe()
}, [watch, organizationId])

// Load from backend on mount
React.useEffect(() => {
  async function loadDraft() {
    // Check if user has draft organization
    const orgs = await client.auth.listOrganizations()
    const draftOrg = orgs.organizations?.find(
      org => org.approvalStatus === 'draft'
    )
    
    if (draftOrg) {
      const draft = await loadOnboardingDraft(draftOrg.id)
      if (draft) {
        reset(draft)
        setOrganizationId(draftOrg.id)
        // Show toast: "Resuming your draft"
      }
    }
  }
  
  loadDraft()
}, [])
```

## Schema Requirements

### Do We Need Separate Schema?

**Answer: NO** ✅

**Why:**
- Organization table already supports all onboarding fields
- `approvalStatus: "draft"` indicates incomplete form
- Can use existing `updateOrganization` endpoint
- No need for separate `onboarding_drafts` table

**Current Organization Schema Supports:**
- ✅ Basic Info (name, description, website, logo)
- ✅ Business Details (businessType, industryCategory, contactPerson, phone, address)
- ✅ Verification (gstNumber, panNumber, cinNumber, verification statuses)

## API Endpoints

### Existing Endpoints (Can Use As-Is)

1. **Create Organization** (Step 1)
   - `POST /auth/organization/create`
   - Creates org with `approvalStatus: "draft"`

2. **Update Organization** (Auto-save)
   - `PATCH /organizations/:id`
   - Updates draft organization fields

3. **Get Organization** (Load draft)
   - `GET /organizations/:id`
   - Retrieves draft organization data

### Optional: New Endpoints (If Needed)

**Only if you want explicit draft management:**

1. **Save Draft**
   - `POST /organizations/:id/draft`
   - Explicitly save draft (redundant with PATCH)

2. **Get Draft**
   - `GET /organizations/:id/draft`
   - Get draft data (redundant with GET)

**Recommendation**: Use existing endpoints, no new ones needed.

## Implementation Steps

### Step 1: Local Storage Auto-Save
- [ ] Add `watch` subscription to save form values
- [ ] Add debounce (1 second)
- [ ] Load from localStorage on mount
- [ ] Clear localStorage on successful submission

### Step 2: Backend Auto-Save
- [ ] Create `saveOnboardingDraft` server action
- [ ] Create `loadOnboardingDraft` server action
- [ ] Add backend save with debounce (3 seconds)
- [ ] Load from backend on mount (check for draft org)
- [ ] Handle organization creation in Step 1

### Step 3: UX Enhancements
- [ ] Show "Draft saved" indicator
- [ ] Show "Resuming draft" message on load
- [ ] Add "Clear draft" option
- [ ] Handle conflicts (localStorage vs backend)

### Step 4: Edge Cases
- [ ] Handle organization already exists
- [ ] Handle draft from different user
- [ ] Handle expired drafts (optional: TTL)
- [ ] Handle form schema changes

## Benefits

1. **User Experience**
   - No data loss on refresh
   - Resume from any device
   - Peace of mind while filling long forms

2. **Conversion**
   - Reduces abandonment
   - Allows users to complete at their pace
   - Better onboarding completion rates

3. **Technical**
   - Uses existing backend infrastructure
   - No new database tables needed
   - Leverages existing endpoints

## Considerations

1. **Privacy**: Draft data stored in database (encrypted if sensitive)
2. **Storage**: localStorage has size limits (~5-10MB)
3. **Performance**: Debounce prevents excessive API calls
4. **Security**: Only user's own drafts accessible
5. **Cleanup**: Optionally delete drafts after TTL (e.g., 30 days)

## Conclusion

**No separate endpoints or schemas needed!** ✅

- Use existing `PATCH /organizations/:id` for saving
- Use existing `GET /organizations/:id` for loading
- Use `approvalStatus: "draft"` to identify incomplete forms
- Add localStorage for immediate saves
- Add backend saves for cross-device persistence

