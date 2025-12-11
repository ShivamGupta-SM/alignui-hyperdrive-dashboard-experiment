# Archive

This folder contains dead/unused code that was removed from the active codebase but preserved for reference.

## Archived: 2024-12-11

### Hooks (hooks/)

These hooks were never used anywhere in the application:

| File | Description | Reason |
|------|-------------|--------|
| `use-deliverables.ts` | Deliverable type hooks | Never imported/used |
| `use-organizations.ts` | Organization management hooks | Never imported/used |

**Note**: `use-categories.ts` and `use-platforms.ts` were initially archived but later **restored** because they are actively used in the products pages.

### API Routes (app/api/)

These API routes were orphaned after removing the corresponding hooks:

| Directory | Endpoints | Reason |
|-----------|-----------|--------|
| `deliverables/` | GET /api/deliverables, /api/deliverables/[id] | Never called (hooks removed) |

**Note**: `categories/` and `platforms/` API routes were initially archived but later **restored** because they are used by `use-categories.ts` and `use-platforms.ts` hooks.

### Previously Deleted (not in archive)

These files were already deleted from the codebase before archiving:

- `lib/app-store.ts` - Replaced by split stores in `lib/store.ts` (`useUIStore`, `usePreferencesStore`)
- `middleware.ts` - Auth protection moved to layouts/page components
- `lib/auth/components/captcha/recaptcha-badge.tsx` - Captcha removed, replaced with noop stubs
- `lib/auth/components/captcha/recaptcha-v2.tsx` - Captcha removed, replaced with noop stubs
- `lib/auth/types/captcha-provider.ts` - Captcha removed, replaced with noop stubs

### Also Cleaned Up

- `.history/` - Added to `.gitignore` (IDE local history folder)
- `lib/store.ts` - Removed deprecated `useAppStore` export alias

## Restoring Archived Code

If you need to restore any of this code:

1. **Hooks**: Move the file back to `hooks/` and re-export from `hooks/index.ts`
2. **API Routes**: Move the folder back to `app/api/`
