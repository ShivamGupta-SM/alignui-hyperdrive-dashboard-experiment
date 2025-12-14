# Dependencies Documentation

This document provides a comprehensive overview of all dependencies used in the Hypedrive Brand Dashboard project, their purpose, and where they are used.

---

## Table of Contents

1. [Core Framework](#core-framework)
2. [Authentication](#authentication)
3. [Data Fetching & State Management](#data-fetching--state-management)
4. [UI Components & Design System](#ui-components--design-system)
5. [Forms & Validation](#forms--validation)
6. [Styling & CSS](#styling--css)
7. [Charts & Data Visualization](#charts--data-visualization)
8. [File Handling & Documents](#file-handling--documents)
9. [Notifications & Communication](#notifications--communication)
10. [Analytics & Monitoring](#analytics--monitoring)
11. [Utilities](#utilities)
12. [Dev Dependencies](#dev-dependencies)
13. [Unused Dependencies (Candidates for Removal)](#unused-dependencies-candidates-for-removal)

---

## Core Framework

### `next` (^16.0.7)
**Purpose**: React framework with App Router, Server Components, and Server Actions
**Used In**: Entire application
**Key Features Used**:
- App Router with route groups `(auth)`, `(dashboard)`, `(onboarding)`
- Server Components and Server Actions
- API Routes in `app/api/`
- Turbopack for development (`next dev --turbopack`)
- Image optimization, metadata API

### `react` (^19.2.1) & `react-dom` (^19.2.1)
**Purpose**: Core React library
**Used In**: Entire application
**Key Features Used**:
- React 19 features (use, useTransition, useOptimistic)
- Hooks (useState, useEffect, useCallback, useMemo, useRef)
- Server Components support

---

## Authentication

### `better-auth` (^1.4.5)
**Purpose**: Full-stack authentication solution
**Used In**: 35 files across `lib/auth/` components
**Key Files**:
- `lib/auth-client.ts` - Auth client configuration
- `lib/auth/components/` - Auth UI components
- `lib/auth/hooks/` - Auth hooks

**Features Used**:
- Email/Password authentication
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication
- Magic links
- Email OTP
- Passkey (WebAuthn)
- Organization management
- Session management

### `@better-auth/passkey` (^1.4.5)
**Purpose**: WebAuthn/Passkey support for Better Auth
**Used In**: `lib/auth/components/settings/passkey/`

### `@daveyplate/better-auth-ui` (^3.2.13)
**Purpose**: Pre-built UI components for Better Auth
**Used In**: `lib/auth/` - Vendored and customized
**Note**: This is a vendored library with 140+ files in `lib/auth/`

### `@better-fetch/fetch` (^1.1.18)
**Purpose**: Enhanced fetch wrapper used by Better Auth
**Used In**:
- `lib/auth/components/auth/forms/two-factor-form.tsx`
- `lib/auth/components/auth/forms/sign-in-form.tsx`
- `lib/auth/types/auth-hooks.ts`

### `@noble/hashes` (^2.0.1)
**Purpose**: Cryptographic hashing for Gravatar URLs
**Used In**: `lib/auth/lib/gravatar-utils.ts`

---

## Data Fetching & State Management

### `@tanstack/react-query` (^5.90.11)
**Purpose**: Server state management, caching, and data fetching
**Used In**: 31 files
**Key Files**:
- `lib/query-client.tsx` - Query client provider
- `lib/get-query-client.ts` - Server-side query client
- `hooks/use-api.ts` - Generic API hooks
- `hooks/use-campaigns.ts`, `hooks/use-enrollments.ts`, etc.
- All dashboard pages for data fetching

**Features Used**:
- `useQuery` for data fetching
- `useMutation` for data mutations
- `useQueryClient` for cache invalidation
- Stale time configuration
- Retry logic
- Prefetching

### `zustand` (^5.0.9)
**Purpose**: Client-side state management
**Used In**: `lib/store.ts`
**Features Used**:
- Global UI state
- Persist middleware for localStorage

### `axios` (^1.13.2)
**Purpose**: HTTP client with interceptors
**Used In**: 15 files
**Key Files**:
- `lib/axios.ts` - Configured instance with interceptors
- All `hooks/use-*.ts` files

**Features Used**:
- Request/response interceptors
- Auth token injection
- Error handling
- Base URL configuration

### `nuqs` (^2.8.4)
**Purpose**: Type-safe URL search params state management
**Used In**:
- `app/providers.tsx` - NuqsAdapter
- `hooks/use-search-params.ts` - Custom hook wrapper

**Features Used**:
- `parseAsString`, `parseAsInteger` parsers
- URL state synchronization

---

## UI Components & Design System

### Radix UI Primitives
**Purpose**: Unstyled, accessible UI primitives
**Used In**: 46 files across `components/ui/` and `lib/auth/components/`

| Package | Version | Used In |
|---------|---------|---------|
| `@radix-ui/react-accordion` | ^1.2.11 | `accordion.tsx` |
| `@radix-ui/react-avatar` | ^1.1.11 | `avatar.tsx` |
| `@radix-ui/react-checkbox` | ^1.3.2 | `checkbox.tsx` |
| `@radix-ui/react-dialog` | ^1.1.14 | `modal.tsx`, `drawer.tsx` |
| `@radix-ui/react-dropdown-menu` | ^2.1.15 | `dropdown.tsx` |
| `@radix-ui/react-label` | ^2.1.7 | `label.tsx` |
| `@radix-ui/react-popover` | ^1.1.14 | `popover.tsx`, `datepicker.tsx` |
| `@radix-ui/react-progress` | ^1.1.1 | `progress-bar.tsx` |
| `@radix-ui/react-radio-group` | ^1.3.7 | `radio.tsx` |
| `@radix-ui/react-scroll-area` | ^1.2.9 | Various scrollable components |
| `@radix-ui/react-select` | ^2.2.5 | `select.tsx` |
| `@radix-ui/react-separator` | ^1.1.8 | `divider.tsx` |
| `@radix-ui/react-slider` | ^1.3.5 | `slider.tsx` |
| `@radix-ui/react-slot` | ^1.2.3 | `button.tsx` (asChild pattern) |
| `@radix-ui/react-switch` | ^1.2.5 | `switch.tsx` |
| `@radix-ui/react-tabs` | ^1.1.12 | `tab-menu-*.tsx` |
| `@radix-ui/react-toast` | ^1.2.14 | Toast notifications |
| `@radix-ui/react-tooltip` | ^1.2.7 | `tooltip.tsx` |
| `@radix-ui/react-visually-hidden` | ^1.2.4 | Accessibility |

### `@phosphor-icons/react` (^2.1.10)
**Purpose**: Icon library with multiple weights
**Used In**: 119+ files
**Key Usage**: Throughout all UI components and pages
**Icon Weights Used**: Regular, Bold, Fill, Duotone

### `vaul` (^1.1.2)
**Purpose**: Drawer/bottom sheet component for mobile
**Used In**: `components/ui/bottom-sheet.tsx`

### `sonner` (^2.0.0)
**Purpose**: Toast notifications
**Used In**: 12 files
**Key Files**:
- `app/providers.tsx` - Toaster component
- Various client components for success/error toasts

### `cmdk` (^1.1.1)
**Purpose**: Command menu/palette component
**Used In**: `components/ui/command-menu.tsx`

---

## Forms & Validation

### `react-hook-form` (^7.67.0)
**Purpose**: Performant form state management
**Used In**: 24 files in `lib/auth/components/`
**Features Used**:
- `useForm` hook
- Form validation
- Error handling
- `FormProvider` for nested forms

### `@hookform/resolvers` (^5.2.2)
**Purpose**: Validation resolvers for react-hook-form
**Used In**: 20 files
**Features Used**:
- `zodResolver` for Zod schema validation

### `zod` (^4.1.13)
**Purpose**: TypeScript-first schema validation
**Used In**: 59 files
**Key Files**:
- `lib/validations.ts` - All validation schemas
- `lib/env.ts` - Environment variable validation
- `app/api/*/route.ts` - Request validation
- `app/actions/*.ts` - Server action validation

**Features Used**:
- Schema definitions
- Type inference (`z.infer<typeof schema>`)
- Refinements and transforms
- Error formatting

### `zod-to-json-schema` (^3.25.0)
**Purpose**: Convert Zod schemas to JSON Schema
**Used In**: Not currently imported (may be used by Novu)
**Status**: Potentially unused - verify before removing

---

## Styling & CSS

### `tailwindcss` (^4.1.17)
**Purpose**: Utility-first CSS framework
**Used In**: Entire application
**Config**: CSS-first configuration in `app/globals.css` using `@theme`

### `tailwind-merge` (^3.4.0)
**Purpose**: Merge Tailwind classes without conflicts
**Used In**:
- `utils/cn.ts` - `cn()` utility function
- `lib/auth/lib/utils.ts`

### `clsx` (^2.1.1)
**Purpose**: Conditional class name construction
**Used In**:
- `utils/cn.ts` - Combined with tailwind-merge
- `lib/auth/lib/utils.ts`

### `tailwind-variants` (^0.3.1)
**Purpose**: First-class variant API for Tailwind
**Used In**: `utils/tv.ts` - `tv()` utility function

### `tailwindcss-safe-area` (^1.2.0)
**Purpose**: iOS safe area inset utilities
**Used In**: `app/globals.css` for mobile viewport handling

### `tw-animate-css` (^1.4.0)
**Purpose**: Animation utilities for Tailwind
**Used In**: `app/globals.css` - Animation classes

---

## Charts & Data Visualization

### `recharts` (^3.5.1)
**Purpose**: Composable charting library
**Used In**:
- `components/ui/spark-chart.tsx`
- `components/claude-generated-components/charts.tsx`

**Charts Used**:
- Line charts (dashboard metrics)
- Bar charts
- Area charts
- Spark lines

### `@tanstack/react-table` (^8.21.3)
**Purpose**: Headless table/data grid library
**Used In**: `components/ui/data-table.tsx`
**Features Used**:
- Column definitions
- Sorting
- Filtering
- Pagination

### `@tanstack/react-virtual` (^3.13.13)
**Purpose**: Virtualized list rendering for performance
**Used In**: `components/ui/virtualized-list.tsx`
**Features Used**:
- Virtual scrolling for large lists

---

## File Handling & Documents

### `@react-pdf/renderer` (^4.3.1)
**Purpose**: Generate PDF documents in React
**Used In**:
- `lib/pdf/invoice-pdf.tsx` - Invoice PDF template
- `lib/pdf.tsx` - PDF utilities
- `app/api/invoices/[id]/pdf/route.ts` - PDF generation API

### `xlsx` (^0.18.5)
**Purpose**: Excel file parsing and generation
**Used In**: `lib/excel.ts`
**Features Used**:
- Export data to Excel
- Parse uploaded Excel files

### `react-dropzone` (^14.3.8)
**Purpose**: File upload drag-and-drop
**Used In**: `components/ui/file-dropzone.tsx`
**Features Used**:
- Drag and drop zone
- File type validation
- Multiple file upload

---

## Notifications & Communication

### Novu (Notification Infrastructure)
**Purpose**: Multi-channel notification system
**Packages**:
- `@novu/api` (^3.11.0)
- `@novu/framework` (^2.9.0)
- `@novu/nextjs` (^3.11.0)

**Used In**:
- `lib/novu.ts` - Novu client configuration
- `components/dashboard/novu-inbox.tsx` - In-app notification inbox
- `hooks/use-novu.ts` - Novu hooks
- `app/api/novu/` - Novu API routes

### `resend` (^6.6.0)
**Purpose**: Email sending service
**Used In**: `lib/email.ts`
**Features Used**:
- Transactional emails
- Email templates

### `@react-email/components` (^1.0.1)
**Purpose**: React components for email templates
**Used In**: `lib/auth/components/email/email-template.tsx`

---

## Analytics & Monitoring

### `@sentry/nextjs` (^10.29.0)
**Purpose**: Error tracking and performance monitoring
**Used In**:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

**Features Used**:
- Error capturing
- Performance tracing
- User session replay

### `@vercel/analytics` (^1.6.1)
**Purpose**: Vercel web analytics
**Used In**: `app/layout.tsx`

### `@vercel/speed-insights` (^1.3.1)
**Purpose**: Core Web Vitals monitoring
**Used In**: `app/layout.tsx`

### `posthog-js` (^1.302.2)
**Purpose**: Product analytics and feature flags
**Used In**: `lib/posthog.tsx`
**Features Used**:
- Event tracking
- User identification
- Feature flags

---

## Utilities

### `date-fns` (^3)
**Purpose**: Date manipulation and formatting
**Used In**: Throughout the application
**Note**: Not directly imported anywhere - may be used by `react-day-picker`

### `react-day-picker` (^9.4.4)
**Purpose**: Date picker component
**Used In**: `components/ui/datepicker.tsx`

### `next-themes` (^0.4.3)
**Purpose**: Dark/light mode theme switching
**Used In**:
- `app/providers.tsx` - ThemeProvider
- `components/dashboard/dashboard-shell.tsx`
- `components/dashboard/header.tsx`
- `components/ui/logo.tsx`
- `components/theme-switch.tsx`

### `usehooks-ts` (^3.1.1)
**Purpose**: Collection of TypeScript React hooks
**Used In**: 6 files
**Hooks Used**:
- `useMediaQuery` - Responsive breakpoints
- `useCopyToClipboard` - Clipboard operations
- `useDebounce` - Input debouncing

### `merge-refs` (^1.3.0)
**Purpose**: Merge multiple React refs
**Used In**:
- `components/ui/tab-menu-horizontal.tsx`
- `components/ui/segmented-control.tsx`

### `ua-parser-js` (^2.0.6)
**Purpose**: User agent string parsing
**Used In**: `lib/auth/components/settings/security/session-cell.tsx`
**Features Used**: Device/browser detection for session management

### `@t3-oss/env-nextjs` (^0.13.8)
**Purpose**: Type-safe environment variables
**Used In**: `lib/env.ts`
**Features Used**:
- Runtime validation
- Type inference

### `server-only` (^0.0.1)
**Purpose**: Mark modules as server-only
**Used In**: Not currently imported
**Status**: Potentially unused - verify before removing

---

## Input Components

### `input-otp` (^1.4.2)
**Purpose**: OTP/PIN input component
**Used In**: `components/claude-generated-components/pin-input.tsx`

### `react-otp-input` (^3.1.1)
**Purpose**: Alternative OTP input (6-digit codes)
**Used In**: `components/ui/digit-input.tsx`

### `react-number-format` (^5.4.4)
**Purpose**: Formatted number/currency input
**Used In**: `components/ui/currency-input.tsx`

### `react-qr-code` (^2.0.18)
**Purpose**: QR code generation
**Used In**: `lib/auth/components/auth/forms/two-factor-form.tsx`
**Features Used**: 2FA setup QR codes

---

## Dev Dependencies

### `@biomejs/biome` (^1.9.0)
**Purpose**: Fast linter and formatter (Rust-based)
**Scripts**:
- `pnpm lint` - Check code
- `pnpm format` - Format code
- `pnpm check` - Fix issues

### `typescript` (^5)
**Purpose**: TypeScript compiler
**Config**: `tsconfig.json` with strict mode

### `@tailwindcss/postcss` (^4.1.17)
**Purpose**: Tailwind CSS PostCSS plugin
**Config**: `postcss.config.js`

### `postcss` (^8)
**Purpose**: CSS transformations
**Used With**: Tailwind CSS

### `@tanstack/react-query-devtools` (^5.91.1)
**Purpose**: React Query debugging tools
**Used In**: Development only

### Type Definitions
| Package | Purpose |
|---------|---------|
| `@types/node` (^22) | Node.js types |
| `@types/react` (^19) | React types |
| `@types/react-dom` (^19) | React DOM types |
| `@types/ua-parser-js` (^0.7.39) | UA Parser types |

---

## Unused Dependencies (Candidates for Removal)

These dependencies are installed but have no imports found in the codebase:

| Package | Reason | Recommendation |
|---------|--------|----------------|
| `react-aria-components` | Only used in unused `color-picker.tsx` | Remove with color-picker |
| `embla-carousel-react` | Only in unused `carousel.tsx` | Remove if carousel not needed |
| `server-only` | No imports found | Verify usage then remove |
| `zod-to-json-schema` | No imports found | May be Novu dependency - verify |
| `class-variance-authority` | No imports found | Verify usage then remove |

### Verification Commands

```bash
# Check for any usage of a package
pnpm why <package-name>

# Search for imports
grep -r "from ['\"]<package-name>" --include="*.ts" --include="*.tsx"

# Remove unused dependencies
pnpm remove <package-name>
```

---

## Bundle Size Considerations

### Heavy Dependencies
1. **Recharts** (~400KB) - Consider lightweight alternatives if only using simple charts
2. **xlsx** (~300KB) - Only load on demand for Excel export
3. **@react-pdf/renderer** (~500KB) - Server-side only, no client impact
4. **@sentry/nextjs** (~100KB) - Essential for production monitoring

### Tree-Shaking Tips
- Import specific functions: `import { format } from 'date-fns'`
- Use dynamic imports for heavy components
- Radix UI primitives are well tree-shaken

---

## Version Policy

- **Major Updates**: Review changelog, test thoroughly
- **Minor Updates**: Generally safe, test critical paths
- **Patch Updates**: Safe to apply

### Lock File
Using `pnpm-lock.yaml` - Always commit lock file changes.

---

*Last Updated: December 2024*
