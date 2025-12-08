---
inclusion: manual
---
# Tailwind CSS v4 Development Rules

You are an expert in Tailwind CSS v4. Follow these patterns and best practices.

## Core Principles

- **CSS-first configuration**: Use `@theme` in CSS instead of `tailwind.config.js`
- **Single import**: Use `@import "tailwindcss"` (not `@tailwind` directives)
- **Automatic content detection**: No `content` array needed
- **OKLCH color space**: More vivid, wider gamut colors
- **Dynamic values**: Use `grid-cols-15` instead of `grid-cols-[15]`

## CSS Entry Point

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --color-brand-500: oklch(0.65 0.2 250);
  --breakpoint-3xl: 120rem;
  --spacing-18: 4.5rem;
}
```

## Theme Variable Namespaces

| Namespace | Generated Utilities |
|-----------|-------------------|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*` |
| `--font-*` | `font-*` (font family) |
| `--text-*` | `text-*` (font size) |
| `--font-weight-*` | `font-*` (weight) |
| `--breakpoint-*` | `sm:`, `md:`, `lg:`, etc. |
| `--spacing-*` | `p-*`, `m-*`, `gap-*`, `w-*`, `h-*` |
| `--radius-*` | `rounded-*` |
| `--shadow-*` | `shadow-*` |
| `--animate-*` | `animate-*` |

## Custom Utilities

Register custom utilities with full variant support:

```css
@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

@utility tab-4 {
  tab-size: 4;
}
```

Usage: `scrollbar-hidden`, `hover:scrollbar-hidden`, `lg:tab-4`

## Custom Variants

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
@custom-variant loading (&:where([data-loading="true"]));
```

Usage: `theme-midnight:bg-black`, `loading:opacity-50`

## Dark Mode

### System Preference (Default)
```html
<div class="bg-white dark:bg-gray-900">Content</div>
```

### Class-based Toggle
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

```html
<html class="dark">
  <body class="bg-white dark:bg-black">Content</body>
</html>
```

## Container Queries (First-class)

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row @lg:grid @lg:grid-cols-3">
    Content responds to container width
  </div>
</div>
```

Container sizes: `@3xs` (256px) to `@7xl` (1280px)

### Named Containers
```html
<div class="@container/main">
  <div class="@sm/main:flex-row">Responds to main container</div>
</div>
```

## Gradients

```html
<!-- Linear gradients -->
<div class="bg-linear-to-r from-blue-500 to-purple-500"></div>
<div class="bg-linear-45 from-blue-500 to-purple-500"></div>

<!-- Radial gradients -->
<div class="bg-radial from-white to-black"></div>
<div class="bg-radial-at-br from-blue-500 to-purple-500"></div>

<!-- Conic gradients -->
<div class="bg-conic from-red-500 via-blue-500 to-red-500"></div>
```

## 3D Transforms

```html
<div class="rotate-x-45">Rotate on X axis</div>
<div class="rotate-y-12">Rotate on Y axis</div>
<div class="translate-z-10">Translate on Z axis</div>
<div class="perspective-500">
  <div class="rotate-y-45">Child with perspective</div>
</div>
<div class="transform-3d">Preserve 3D</div>
<div class="backface-hidden">Hidden backface</div>
```

## Shadows (v4 Naming)

```html
<div class="shadow-2xs">Extra extra small</div>
<div class="shadow-xs">Extra small (was shadow-sm)</div>
<div class="shadow-sm">Small (was shadow)</div>
<div class="shadow-md">Medium</div>

<!-- Inset shadows -->
<div class="inset-shadow-sm inset-shadow-white/20">Inset shadow</div>

<!-- Text shadows (v4.1) -->
<h1 class="text-shadow-lg text-shadow-black/50">Text shadow</h1>
```

## New Variants

```html
<!-- State variants -->
<div class="inert:opacity-30">Inert attribute</div>

<!-- Starting style (entry animations) -->
<div popover class="transition-opacity starting:opacity-0">Fades in</div>

<!-- Not variant (negation) -->
<div class="not-hover:opacity-75">Not hovered</div>
<div class="not-first:mt-4">Not first child</div>

<!-- Nth child -->
<div class="nth-3:bg-red-500">3rd child</div>
<div class="nth-odd:bg-gray-100">Odd children</div>

<!-- In variant -->
<div class="in-[.card]:p-4">Padding when inside .card</div>

<!-- Descendant variant -->
<div class="**:text-red-500">All descendants red</div>

<!-- User validation (v4.1) -->
<input class="user-invalid:border-red-500 user-valid:border-green-500" />
```

## Dynamic Values (No Config Needed)

```html
<div class="p-13"></div>
<div class="mt-22"></div>
<div class="grid-cols-15"></div>
<div class="z-999"></div>
```

## CSS Variable Syntax (v4)

```html
<!-- v3 (old) -->
<div class="bg-[--brand-color]"></div>

<!-- v4 (new) - use parentheses -->
<div class="bg-(--brand-color)"></div>
<div class="text-(--heading-color)"></div>
```

## Important Modifier (v4)

```html
<!-- v3 (old) -->
<div class="!flex"></div>

<!-- v4 (new) - suffix -->
<div class="flex!"></div>
```

## Variant Stacking Order (v4)

```html
<!-- v3: right-to-left -->
<div class="last:*:pb-0"></div>

<!-- v4: left-to-right -->
<div class="*:last:pb-0"></div>
```

## Opacity Modifiers

```html
<div class="bg-blue-500/50">50% opacity</div>
<div class="text-white/75">75% opacity</div>
<div class="border-black/10">10% opacity</div>
<div class="bg-[var(--brand-color)]/50">CSS var with opacity</div>
```

## Renamed Utilities (v3 → v4)

| v3 | v4 |
|----|-----|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `blur-sm` | `blur-xs` |
| `blur` | `blur-sm` |
| `rounded-sm` | `rounded-xs` |
| `rounded` | `rounded-sm` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |

## Removed Utilities

| Removed | Replacement |
|---------|-------------|
| `bg-opacity-*` | `bg-color/opacity` |
| `text-opacity-*` | `text-color/opacity` |
| `flex-grow` | `grow` |
| `flex-shrink` | `shrink` |
| `overflow-ellipsis` | `text-ellipsis` |

## Default Changes

| Property | v3 Default | v4 Default |
|----------|-----------|-----------|
| Border color | `gray-200` | `currentColor` |
| Ring width | `3px` | `1px` |
| Ring color | `blue-500` | `currentColor` |
| Placeholder | `gray-400` | `currentColor` at 50% |

## Source Detection

```css
/* Include additional paths */
@source "../node_modules/@my-company/ui-lib";

/* Exclude paths */
@source not "./src/legacy";
```

## Safelist Classes

```css
/* Basic safelist */
@source inline("bg-red-500 bg-blue-500 bg-green-500");

/* With brace expansion */
@source inline("bg-{red,blue,green}-{100,500,900}");
```

## @apply Directive

```css
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply btn bg-blue-500 text-white hover:bg-blue-600;
}
```

## @variant in Custom CSS

```css
.my-element {
  background: white;

  @variant dark {
    background: black;
  }

  @variant hover {
    background: gray;
  }

  @variant md {
    padding: 2rem;
  }
}
```
