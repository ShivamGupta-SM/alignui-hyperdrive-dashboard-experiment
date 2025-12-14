# User Flow & Edge Cases - Complete Guide

## Current Flow Issues

### Problem 1: Sign Up → Dashboard → Onboarding (Confusing)
```
New User Signs Up
    ↓
Redirects to /dashboard
    ↓
requireOrganization() checks: No org?
    ↓
Redirects to /onboarding ❌ (User sees redirect, confusing)
```

### Problem 2: Onboarding Force
- Users with organizations are being shown onboarding
- Onboarding should be optional, not forced

## Proper Flow

### ✅ Correct Flow for New User

```
1. User Signs Up
   - User created in DB
   - NO organization yet
   - Session created
   
2. Sign Up Action Checks Organization
   - If no org → Redirect to /onboarding
   - If has org → Redirect to /dashboard
   
3. User Completes Onboarding
   - Organization created
   - User can now access dashboard
```

### ✅ Correct Flow for Existing User

```
1. User Signs In
   - Session restored
   
2. Middleware Checks Auth
   - Authenticated → Allow access
   
3. Dashboard Page Checks Organization
   - Has org → Show dashboard
   - No org → Redirect to onboarding
```

## Edge Cases to Handle

### Edge Case 1: New User (No Organization)
**Scenario**: User just signed up, no org in DB
**Expected**: Redirect to onboarding
**Current**: Redirects to dashboard, then redirects to onboarding (confusing)

### Edge Case 2: User with Organization
**Scenario**: User has completed onboarding, has org
**Expected**: Can access dashboard, onboarding is optional
**Current**: Might be forced to onboarding

### Edge Case 3: User Deletes Organization
**Scenario**: User deletes their only organization
**Expected**: Redirect to onboarding to create new one
**Current**: Should work (requireOrganization handles this)

### Edge Case 4: Multiple Organizations
**Scenario**: User has multiple organizations
**Expected**: Can switch between them, dashboard works
**Current**: Should work

### Edge Case 5: Session Expired
**Scenario**: User's session expires while using app
**Expected**: Redirect to sign-in, preserve intended destination
**Current**: Middleware handles this

## Implementation

### Fix 1: Sign Up Action - Check Organization

```typescript
// app/actions/auth.ts
export async function signUpEmail(...) {
  // ... create user ...
  
  // After successful sign up, check if user has organization
  try {
    const orgsResult = await client.auth.listOrganizations()
    const hasOrg = orgsResult.organizations.length > 0
    
    return {
      success: true,
      user: result.user,
      token: result.token,
      hasOrganization: hasOrg, // Add this flag
    }
  } catch (error) {
    // If check fails, assume no org (safe default)
    return {
      success: true,
      user: result.user,
      token: result.token,
      hasOrganization: false,
    }
  }
}
```

### Fix 2: Sign Up Page - Smart Redirect

```typescript
// app/(auth)/sign-up/page.tsx
const onSubmit = async (data: SignUpFormData) => {
  const result = await signUpEmail(...)
  
  if (result.success) {
    // Smart redirect based on organization status
    if (result.hasOrganization) {
      router.push("/dashboard")
    } else {
      router.push("/onboarding")
    }
    router.refresh()
  }
}
```

### Fix 3: Onboarding Page - Don't Force

```typescript
// app/(onboarding)/onboarding/page.tsx
useEffect(() => {
  // Check if user already has organization
  // If yes, redirect to dashboard (don't force onboarding)
  if (hasOrg) {
    router.replace("/dashboard")
  }
}, [hasOrg])
```

### Fix 4: Dashboard Page - Graceful Redirect

```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  try {
    await requireOrganization() // This will redirect if no org
    // ... load dashboard ...
  } catch (error) {
    // Redirect errors are re-thrown, don't catch them
    throw error
  }
}
```

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    NEW USER FLOW                         │
└─────────────────────────────────────────────────────────┘

1. User visits /sign-up
   ↓
2. User fills form and submits
   ↓
3. signUpEmail() creates user account
   - User created in DB
   - Session created
   - NO organization yet
   ↓
4. signUpEmail() checks organizations
   - listOrganizations() → Returns []
   - hasOrganization = false
   ↓
5. Sign up page redirects
   - hasOrganization = false
   - Redirect to /onboarding ✅
   ↓
6. User completes onboarding
   - Organization created via submitOnboarding()
   - Organization saved to DB
   ↓
7. Onboarding redirects to /dashboard
   ↓
8. Dashboard page loads
   - requireOrganization() checks: Has org? → YES ✅
   - Dashboard loads successfully
```

```
┌─────────────────────────────────────────────────────────┐
│                 EXISTING USER FLOW                       │
└─────────────────────────────────────────────────────────┘

1. User visits /sign-in
   ↓
2. User signs in
   - Session restored
   ↓
3. Sign in redirects to /dashboard (or redirect param)
   ↓
4. Middleware checks
   - Has session? → YES
   - Allow access to /dashboard
   ↓
5. Dashboard page loads
   - requireOrganization() checks: Has org? → YES ✅
   - Dashboard loads successfully
```

```
┌─────────────────────────────────────────────────────────┐
│            USER WITHOUT ORGANIZATION                    │
└─────────────────────────────────────────────────────────┘

1. User signs in (or signs up)
   ↓
2. User tries to access /dashboard
   ↓
3. requireOrganization() checks
   - listOrganizations() → Returns []
   - No organization found
   ↓
4. Redirect to /onboarding ✅
   ↓
5. User completes onboarding
   - Organization created
   ↓
6. Redirect to /dashboard
   ↓
7. Dashboard loads successfully
```

## Testing Checklist

- [ ] New user signs up → Redirects to onboarding (not dashboard)
- [ ] New user completes onboarding → Redirects to dashboard
- [ ] Existing user with org signs in → Goes to dashboard
- [ ] Existing user with org tries onboarding → Redirects to dashboard
- [ ] User without org tries dashboard → Redirects to onboarding
- [ ] User deletes org → Redirects to onboarding
- [ ] Session expires → Redirects to sign-in with return URL
