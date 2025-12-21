# Hardcoding Audit - Frontend Codebase

**Date:** 2024-12-19  
**Status:** ✅ **MINIMAL HARDCODING** - Only Acceptable Static Data

This document audits all hardcoded values in the frontend to identify what should come from API vs what's acceptable as static configuration.

---

## ✅ ACCEPTABLE HARDCODING (Static Configuration)

### 1. **UI Constants & Configuration** ✅
**Location:** `lib/constants/index.ts`

These are frontend-only UI constants that don't need to come from API:
- ✅ Status configurations (colors, labels, icons)
- ✅ Dropdown options (roles, business types, industry categories)
- ✅ Validation boundaries (min/max lengths, amounts)
- ✅ Indian states list
- ✅ E-commerce platforms list
- ✅ Product categories
- ✅ Rejection reasons

**Status:** ✅ **ACCEPTABLE** - These are UI presentation constants

---

### 2. **Environment Variables** ✅
**Location:** `lib/encore.ts`, `lib/encore-browser.ts`

All API URLs use environment variables:
- ✅ `NEXT_PUBLIC_ENCORE_URL` - Public API URL
- ✅ `ENCORE_API_URL` - Server-side API URL
- ✅ `ENCORE_ENVIRONMENT` - Environment name
- ✅ `NEXT_PUBLIC_APP_URL` - App base URL

**Fallbacks:**
- `Local` (from Encore client) - Development fallback
- `http://localhost:3000` - URL validation fallback (only if env not set)

**Status:** ✅ **ACCEPTABLE** - Proper environment-based configuration

---

### 3. **Third-Party Service URLs** ✅
**Location:** `app/actions/settings.ts:313`

```typescript
const qrCodeUrl = result.totpURI
  ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.totpURI)}`
  : undefined
```

**Status:** ✅ **ACCEPTABLE** - Third-party QR code generation service

---

### 4. **Documentation Links** ✅
**Location:** `components/dashboard/settings-panel.tsx:277`

```typescript
href="https://docs.hypedrive.com"
```

**Status:** ✅ **ACCEPTABLE** - External documentation link

---

## ⚠️ MINOR ISSUES (Non-Critical)

### 1. **Pagination Defaults** ⚠️
**Location:** `lib/ssr-data.ts:416`

```typescript
const response = await client.invoices.listInvoices({ organizationId: orgId, skip: 0, take: 50 })
```

**Issue:** Hardcoded `skip: 0, take: 50`

**Recommendation:** 
- Use constant: `const DEFAULT_PAGE_SIZE = 50` (already exists in constants)
- Or make configurable via props/params

**Priority:** 🟢 **LOW** - Works fine, just not configurable

---

### 2. **URL Validation Fallback** ⚠️
**Location:** `lib/url-validation.ts:71`

```typescript
const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
```

**Issue:** Hardcoded `localhost:3000` fallback

**Status:** ✅ **ACCEPTABLE** - Only used if env vars not set (development only)

---

## ❌ REMOVED HARDCODING (Already Fixed)

### 1. **Billing/Subscription Data** ✅ FIXED
**Previous Issue:**
- Hardcoded plan names, prices, payment history
- Location: `app/(dashboard)/dashboard/settings/settings-client.tsx`

**Status:** ✅ **REMOVED** - Entire billing section removed (endpoints not available)

---

## 📋 API-DRIVEN DATA (All Good)

All business data comes from API:
- ✅ User data - `client.auth.me()`, `client.auth.getSession()`
- ✅ Organization data - `client.organizations.getOrganization()`
- ✅ Campaigns - `client.campaigns.listCampaigns()`
- ✅ Enrollments - `client.enrollments.listEnrollments()`
- ✅ Products - `client.products.listProducts()`
- ✅ Invoices - `client.invoices.listInvoices()`
- ✅ Wallet - `client.wallets.getWalletBalance()`
- ✅ Team members - `client.auth.listInvitations()`
- ✅ Dashboard stats - `client.organizations.getDashboardOverview()`

**Status:** ✅ **ALL API-DRIVEN** - No hardcoded business data

---

## 🔍 Mocking Configuration

### MSW (Mock Service Worker)
**Location:** `mocks/`, `lib/encore.ts`, `lib/encore-browser.ts`

**Configuration:**
- Controlled by `NEXT_PUBLIC_API_MOCKING` environment variable
- When `enabled`: All requests go to MSW mocks
- When `disabled` or not set: All requests go to real API

**Status:** ✅ **PROPERLY CONFIGURED** - No hardcoded mocking

---

## 📊 Summary

### Hardcoding Status:
- ✅ **UI Constants**: Acceptable (status configs, dropdowns, validation rules)
- ✅ **Environment Variables**: Properly used for all API URLs
- ✅ **Business Data**: All from API (no hardcoded business values)
- ⚠️ **Pagination**: Minor (hardcoded page size, but acceptable)
- ✅ **Third-Party URLs**: Acceptable (QR service, docs)

### Total Issues:
- **Critical:** 0
- **Minor:** 1 (pagination defaults)
- **Removed:** 1 (billing data - already fixed)

---

## ✅ Conclusion

**Status:** ✅ **NO CRITICAL HARDCODING**

The frontend properly uses:
- ✅ Environment variables for all API URLs
- ✅ API calls for all business data
- ✅ Static constants only for UI configuration (acceptable)
- ✅ No hardcoded business values (prices, plans, etc.)

**Only minor improvement:** Make pagination configurable (low priority)

---

## 🎯 Recommendations

1. ✅ **Keep current approach** - All business data from API
2. 🟢 **Optional:** Make pagination configurable (not critical)
3. ✅ **Continue using** environment variables for configuration
4. ✅ **Static constants are fine** for UI-only configuration

**Overall:** Frontend is properly architected with minimal, acceptable hardcoding.







