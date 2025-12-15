# Error Debugging & Root Cause Analysis Guide

## Problem Statement

**"Errors k bawjood kaam karega toh root cause dhund ka debug kaise karenge?"**

If we're catching errors and returning fallback data for resilience, how do we ensure errors are still visible for debugging?

## Solution: Comprehensive Error Logging

### ✅ Always Log Before Fallback

**CRITICAL RULE:** Never return fallback data without logging the error first.

```typescript
// ✅ CORRECT: Log first, then return fallback
try {
  const data = await fetchData()
  return data
} catch (error) {
  // ALWAYS log with full context BEFORE returning fallback
  logSSRError(error, "getDashboardData", "dashboard-overview", {
    data: { organizationId: orgId },
  })
  
  // Now return fallback
  return null
}
```

### ❌ WRONG: Silent Fallback

```typescript
// ❌ WRONG: Error is hidden
try {
  const data = await fetchData()
  return data
} catch (error) {
  // Error is lost - can't debug!
  return null
}
```

## Error Logging System

### 1. Error Logger (`lib/error-logger.ts`)

**Features:**
- ✅ Unique error ID for tracking
- ✅ Full context (source, data, user, request)
- ✅ Stack traces preserved
- ✅ API error details (code, status, details)
- ✅ Timestamp for debugging
- ✅ Production-ready (ready for Sentry integration)

### 2. Logging Functions

#### `logSSRError()` - For SSR data fetching
```typescript
logSSRError(error, "getDashboardData", "dashboard-overview", {
  data: { organizationId: orgId },
  userContext: { userId: "..." },
})
```

#### `logAPIError()` - For API calls
```typescript
logAPIError(error, "getSettingsData", {
  endpoint: "/organizations/123",
  method: "GET",
  params: { organizationId: "123" },
})
```

#### `logError()` - Generic error logging
```typescript
logError(error, {
  source: "ComponentName",
  data: { additionalContext: "..." },
})
```

## Debugging Workflow

### Step 1: Check Console Logs

**Development:**
```bash
# Errors are logged with full details:
🚨 ERROR [err_1234567890_abc123] [SSR] getDashboardData
{
  error: {
    name: "APIError",
    message: "an internal error occurred",
    code: "internal",
    status: 500,
    stack: "..."
  },
  context: {
    source: "[SSR] getDashboardData",
    data: {
      dataType: "dashboard-overview",
      organizationId: "org_123",
      fallbackUsed: true
    }
  },
  timestamp: "2024-12-19T10:30:00.000Z"
}
```

### Step 2: Search by Error ID

Each error has a unique ID:
```
ERROR ID: err_1234567890_abc123
```

Search logs for this ID to find all related errors.

### Step 3: Analyze Error Context

**Key Information Captured:**
- ✅ **Source**: Where error occurred
- ✅ **Error Type**: APIError, Error, Unknown
- ✅ **Error Code**: Encore error code (if APIError)
- ✅ **HTTP Status**: Status code (if APIError)
- ✅ **Stack Trace**: Full stack trace
- ✅ **Context Data**: Organization ID, user ID, etc.
- ✅ **API Details**: Endpoint, method, params
- ✅ **Fallback Flag**: Whether fallback data was used

### Step 4: Root Cause Analysis

**Check Error Type:**

1. **APIError (Backend Error)**
   - Check `error.code` and `error.status`
   - Check `error.details` for backend-specific info
   - Check `context.data.apiCall` for API endpoint details
   - **Action**: Fix in backend

2. **Error (Frontend/Network)**
   - Check `error.stack` for frontend code location
   - Check network tab for failed requests
   - **Action**: Fix in frontend

3. **Unknown**
   - Check `error.message` for clues
   - Check `context.data` for additional info
   - **Action**: Investigate further

## Example: Debugging Dashboard Error

### Error Log:
```
🚨 ERROR [err_1234567890_abc123] [SSR] getDashboardData
{
  error: {
    name: "APIError",
    message: "an internal error occurred",
    code: "internal",
    status: 500,
    details: { organizationId: "org_123" }
  },
  context: {
    source: "[SSR] getDashboardData",
    data: {
      dataType: "dashboard-overview",
      organizationId: "org_123",
      fallbackUsed: true
    }
  }
}
```

### Analysis:
1. **Error Type**: APIError (backend error)
2. **Status**: 500 (server error)
3. **Code**: "internal" (generic backend error)
4. **Source**: `getDashboardData` SSR function
5. **Fallback Used**: Yes (page still rendered)

### Root Cause Investigation:
1. Check backend logs for organization `org_123`
2. Check backend `getDashboardOverview` endpoint
3. Check database queries for this organization
4. Check if organization data is corrupted

### Fix:
- Fix backend `getDashboardOverview` endpoint
- Fix database query/decryption issue
- Test with organization `org_123`

## Production Error Tracking

### Current: Console Logging
- ✅ Works in development
- ✅ Full error details
- ⚠️ Not persistent in production

### Future: Error Tracking Service

**Recommended: Sentry**

```typescript
// lib/error-logger.ts
if (process.env.NODE_ENV === "production") {
  Sentry.captureException(error, {
    tags: {
      source: context.source,
      errorId: errorId,
    },
    extra: {
      context: loggedError.context,
      error: loggedError.error,
    },
  })
}
```

**Benefits:**
- ✅ Persistent error tracking
- ✅ Error grouping and trends
- ✅ User context
- ✅ Release tracking
- ✅ Performance monitoring

## Best Practices

### ✅ DO:
1. **Always log before fallback**
2. **Include full context** (org ID, user ID, etc.)
3. **Use unique error IDs** for tracking
4. **Preserve stack traces**
5. **Log API call details** (endpoint, method, params)

### ❌ DON'T:
1. **Silent fallbacks** - Always log first
2. **Generic error messages** - Include context
3. **Lose error details** - Preserve all info
4. **Log without context** - Include source, data, etc.

## Quick Reference

### Find All Errors in Logs
```bash
# Search for error IDs
grep "ERROR \[err_" logs.txt

# Search for specific function
grep "\[SSR\] getDashboardData" logs.txt

# Search for API errors
grep "APIError" logs.txt
```

### Debug Specific Error
1. Copy error ID from console
2. Search logs for that ID
3. Check error context and stack trace
4. Identify root cause (backend/frontend)
5. Fix at source

## Summary

**Key Principle:** 
> Errors are NEVER hidden. They're always logged with full context BEFORE returning fallback data.

**Result:**
- ✅ App continues working (resilience)
- ✅ Errors are visible for debugging (observability)
- ✅ Root cause can be identified (context)
- ✅ Fixes can be applied (actionable)




