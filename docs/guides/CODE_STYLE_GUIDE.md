# Code Style Guide

**Last Updated:** 2025-01-27  
**Status:** ✅ **ACTIVE**

---

## 📋 Table of Contents

1. [Component Naming Conventions](#component-naming-conventions)
2. [Import Patterns](#import-patterns)
3. [Type Exports](#type-exports)
4. [Error Handling](#error-handling)
5. [JSDoc Comments](#jsdoc-comments)
6. [TODO Comments](#todo-comments)

---

## Component Naming Conventions

### Standard Pattern

- **Client Components:** Use `Client` suffix (e.g., `CampaignsClient`, `EnrollmentsClient`)
- **Page Components:** Use `Page` suffix (e.g., `SignInPage`, `DashboardPage`)
- **Shared Components:** No suffix (e.g., `DashboardShell`, `CampaignCard`)
- **UI Components:** Descriptive names (e.g., `Button`, `Input`, `Card`)

### Examples

```typescript
// ✅ CORRECT - Client Component
export function CampaignsClient({ ... }: CampaignsClientProps) { ... }

// ✅ CORRECT - Page Component
export default function SignInPage() { ... }

// ✅ CORRECT - Shared Component
export function DashboardShell({ ... }: DashboardShellProps) { ... }

// ✅ CORRECT - UI Component
export function Button({ ... }: ButtonProps) { ... }
```

---

## Import Patterns

### React Imports

**Standard:** Use named imports for hooks and utilities

```typescript
// ✅ CORRECT - Named imports
import { useEffect, useState, useCallback } from "react"

// ⚠️ ACCEPTABLE - Namespace import (for class components or when needed)
import * as React from "react"
```

### UI Component Imports

**Standard:** Use namespace imports for UI components

```typescript
// ✅ CORRECT - Namespace import
import * as Button from "@/components/ui/button"
import * as Tooltip from "@/components/ui/tooltip"

// Usage
<Button.Root variant="primary">
  <Button.Icon as={ArrowClockwise} />
  Click me
</Button.Root>
```

### Utility Imports

**Standard:** Use named imports

```typescript
// ✅ CORRECT
import { cn } from "@/utils/cn"
import { formatCurrency } from "@/lib/format"
```

---

## Type Exports

### Component Props

**Always export prop types** to make them reusable:

```typescript
// ✅ CORRECT - Export prop types
export interface CampaignsClientProps {
	initialStatus?: string
	initialData?: {
		campaigns?: CampaignWithStats[]
	}
}

export function CampaignsClient(props: CampaignsClientProps) {
	// ...
}
```

### Shared Types

**Create shared type files** for common types:

```typescript
// lib/types/campaigns.ts
export interface CampaignWithStats {
	id: string
	name: string
	status: CampaignStatus
	// ...
}

export type CampaignStatus = "draft" | "active" | "completed"
```

---

## Error Handling

### Standard Pattern

**Client Components:**
```typescript
import { logError } from "@/lib/error-logger-simple"

try {
	// ...
} catch (error) {
	logError(error, {
		source: "ComponentName",
		data: { context: "..." }
	})
}
```

**Server Components:**
```typescript
import { logSSRError } from "@/lib/error-logger-simple"

try {
	// ...
} catch (error) {
	logSSRError(error, "functionName", "query-key", {
		data: { context: "..." }
	})
}
```

**Error Boundaries:**
```typescript
"use client"

import { useEffect } from "react"
import { PageError } from "@/components/error-boundary"
import { handleAuthError, isAuthError } from "@/lib/error-handler"
import { logError } from "@/lib/error-logger-simple"

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function ComponentError({ error, reset }: ErrorProps) {
	useEffect(() => {
		logError(error, {
			source: "ComponentErrorBoundary",
			data: { digest: error.digest, component: "component-name" },
		})

		if (isAuthError(error)) {
			handleAuthError(error)
		}
	}, [error])

	if (isAuthError(error)) {
		return <div>Redirecting to login...</div>
	}

	return <PageError error={error} reset={reset} />
}
```

---

## JSDoc Comments

### Component Documentation

**Always document exported components:**

```typescript
/**
 * CampaignsClient Component
 * 
 * Displays and manages campaigns with filtering, searching, and status management.
 * Supports status filtering, search, export, and campaign actions.
 * 
 * @param props - Component props
 * @param props.initialStatus - Initial status filter (default: "all")
 * @param props.initialData - Initial campaign data to display
 * @returns Campaigns management interface
 */
export function CampaignsClient(props: CampaignsClientProps) {
	// ...
}
```

### Function Documentation

**Document complex functions:**

```typescript
/**
 * Formats a currency value with proper locale and symbol
 * 
 * @param amount - The amount to format (in smallest currency unit)
 * @param currency - Currency code (default: "INR")
 * @returns Formatted currency string (e.g., "₹1,234.56")
 * 
 * @example
 * formatCurrency(123456) // "₹1,234.56"
 * formatCurrency(123456, "USD") // "$1,234.56"
 */
export function formatCurrency(amount: number, currency = "INR"): string {
	// ...
}
```

### Prop Type Documentation

**Document prop types with JSDoc:**

```typescript
/**
 * Props for the CampaignsClient component
 */
export interface CampaignsClientProps {
	/** Initial status filter to apply */
	initialStatus?: string
	/** Initial campaign data to display */
	initialData?: {
		campaigns?: CampaignWithStats[]
		data?: CampaignWithStats[]
		total?: number
	}
}
```

---

## TODO Comments

### Standard Format

**Always include context and ticket reference:**

```typescript
// ✅ CORRECT - With context and ticket
// TODO: Implement notification settings update when endpoint is available
// See: Backend ticket #123 - Add notification settings update endpoint
// await client.settings.updateNotifications(validation.data)

// ❌ WRONG - No context
// TODO: Fix this
```

### TODO Categories

1. **Backend Dependencies:** Mark with backend ticket reference
2. **Future Features:** Mark with feature ticket reference
3. **Technical Debt:** Mark with refactoring ticket reference

---

## Code Consistency Checklist

### Before Committing

- [ ] Component names follow naming conventions
- [ ] Imports use standard patterns
- [ ] Prop types are exported
- [ ] JSDoc comments added to exported functions
- [ ] Error handling uses standard patterns
- [ ] TODO comments include context and ticket references
- [ ] No `console.log` in production code (use logging utilities)
- [ ] No `any` types (use proper types or `unknown`)
- [ ] No `@ts-ignore` (fix type errors properly)
- [ ] All lists use stable unique keys (not index)

---

## Quick Reference

### Import Patterns
```typescript
// React
import { useEffect, useState } from "react"

// UI Components
import * as Button from "@/components/ui/button"

// Utilities
import { cn } from "@/utils/cn"
```

### Error Handling
```typescript
// Client
logError(error, { source: "Component" })

// Server
logSSRError(error, "function", "key")
```

### Type Exports
```typescript
export interface ComponentProps { ... }
export type ComponentType = ...
```

---

**Last Updated:** 2025-01-27

