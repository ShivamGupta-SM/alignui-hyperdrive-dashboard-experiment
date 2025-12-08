---
inclusion: manual
---
# AlignUI Design System Rules

This project uses the AlignUI design system with Tailwind CSS v4. Follow these conventions.

## Color System

### Semantic Background Colors
```tsx
// Use semantic tokens, not raw colors
<div className="bg-bg-white-0" />      // Primary background
<div className="bg-bg-weak-50" />      // Secondary background
<div className="bg-bg-soft-200" />     // Tertiary background
<div className="bg-bg-sub-300" />      // Subtle background
<div className="bg-bg-surface-800" />  // Surface background
<div className="bg-bg-strong-950" />   // Strong/inverted background
```

### Semantic Text Colors
```tsx
<p className="text-text-strong-950" />   // Primary text
<p className="text-text-sub-600" />      // Secondary text
<p className="text-text-soft-400" />     // Tertiary text
<p className="text-text-disabled-300" /> // Disabled text
<p className="text-text-white-0" />      // Inverted text
```

### Semantic Stroke Colors
```tsx
<div className="border-stroke-soft-200" />   // Subtle borders
<div className="border-stroke-sub-300" />    // Secondary borders
<div className="border-stroke-strong-950" /> // Strong borders
```

### Status Colors
```tsx
// Success
<div className="bg-success-lighter text-success-dark" />
<div className="bg-success-base text-white" />

// Error
<div className="bg-error-lighter text-error-dark" />
<div className="bg-error-base text-white" />

// Warning
<div className="bg-warning-lighter text-warning-dark" />
<div className="bg-warning-base text-white" />

// Information
<div className="bg-information-lighter text-information-dark" />
<div className="bg-information-base text-white" />
```

### Primary Colors
```tsx
<button className="bg-primary-base text-white hover:bg-primary-darker" />
<div className="bg-primary-alpha-10" /> // 10% opacity
<div className="bg-primary-alpha-16" /> // 16% opacity
<div className="bg-primary-alpha-24" /> // 24% opacity
```

## Typography System

### Titles
```tsx
<h1 className="text-title-h1" />  // 3.5rem, 500 weight
<h2 className="text-title-h2" />  // 3rem, 500 weight
<h3 className="text-title-h3" />  // 2.5rem, 500 weight
<h4 className="text-title-h4" />  // 2rem, 500 weight
<h5 className="text-title-h5" />  // 1.5rem, 500 weight
<h6 className="text-title-h6" />  // 1.25rem, 500 weight
```

### Labels (Medium Weight)
```tsx
<span className="text-label-xl" />  // 1.5rem
<span className="text-label-lg" />  // 1.125rem
<span className="text-label-md" />  // 1rem
<span className="text-label-sm" />  // 0.875rem
<span className="text-label-xs" />  // 0.75rem
```

### Paragraphs (Regular Weight)
```tsx
<p className="text-paragraph-xl" />  // 1.5rem
<p className="text-paragraph-lg" />  // 1.125rem
<p className="text-paragraph-md" />  // 1rem
<p className="text-paragraph-sm" />  // 0.875rem
<p className="text-paragraph-xs" />  // 0.75rem
```

### Subheadings (Uppercase/Tracking)
```tsx
<span className="text-subheading-md" />  // 1rem, 0.06em tracking
<span className="text-subheading-sm" />  // 0.875rem, 0.06em tracking
<span className="text-subheading-xs" />  // 0.75rem, 0.04em tracking
<span className="text-subheading-2xs" /> // 0.6875rem, 0.02em tracking
```

## Shadow System

### Regular Shadows
```tsx
<div className="shadow-regular-xs" />  // Subtle shadow
<div className="shadow-regular-sm" />  // Small shadow
<div className="shadow-regular-md" />  // Medium shadow
```

### Custom Shadows
```tsx
<div className="shadow-custom-xs" />  // Complex layered shadow
<div className="shadow-custom-sm" />
<div className="shadow-custom-md" />
<div className="shadow-custom-lg" />
```

### Component-Specific Shadows
```tsx
<button className="shadow-fancy-buttons-primary" />
<button className="shadow-fancy-buttons-neutral" />
<button className="shadow-fancy-buttons-error" />
<button className="shadow-fancy-buttons-stroke" />
<div className="shadow-tooltip" />
<div className="shadow-toggle-switch" />
```

### Focus Shadows
```tsx
<button className="focus:shadow-button-primary-focus" />
<button className="focus:shadow-button-important-focus" />
<button className="focus:shadow-button-error-focus" />
```

## Border Radius

```tsx
<div className="rounded-10" />  // 0.625rem (10px)
<div className="rounded-20" />  // 1.25rem (20px)
```

## Component Patterns

### Button Example
```tsx
<button className="
  bg-primary-base 
  text-text-white-0 
  px-4 py-2 
  rounded-10 
  text-label-sm 
  shadow-fancy-buttons-primary
  hover:bg-primary-darker
  focus:shadow-button-primary-focus
  transition-colors
">
  Button
</button>
```

### Card Example
```tsx
<div className="
  bg-bg-white-0 
  border border-stroke-soft-200 
  rounded-20 
  p-6 
  shadow-custom-sm
">
  <h3 className="text-title-h6 text-text-strong-950">Card Title</h3>
  <p className="text-paragraph-sm text-text-sub-600 mt-2">Card content</p>
</div>
```

### Status Badge Example
```tsx
// Success badge
<span className="
  inline-flex items-center gap-1
  bg-success-lighter 
  text-success-dark 
  px-2 py-1 
  rounded-full 
  text-label-xs
">
  <CheckIcon className="size-3" />
  Success
</span>
```

## Dark Mode

The design system supports both system preference and class-based dark mode:

```tsx
// Semantic colors automatically adapt in dark mode
<div className="bg-bg-white-0">  // White in light, dark in dark mode
  <p className="text-text-strong-950">  // Dark in light, white in dark mode
    Content
  </p>
</div>
```

## Neutral Color Variants

The system uses `slate` as the base neutral. Available raw colors:
- `gray-*` - Pure gray scale
- `slate-*` - Slightly blue-tinted gray (default neutral)

```tsx
// Direct color usage (prefer semantic tokens)
<div className="bg-slate-100" />
<div className="bg-gray-100" />
```

## Animation

```tsx
<div className="animate-accordion-down" />
<div className="animate-accordion-up" />
<div className="animate-progress-indeterminate" />
```

## Icon Styling

RemixIcon icons use a custom scale transform:

```css
.remixicon path {
  transform: scale(0.8996);
  transform-origin: center;
}
```

## Best Practices

1. **Always use semantic color tokens** instead of raw color values
2. **Use the typography scale** for consistent text sizing
3. **Apply shadows from the system** rather than custom box-shadows
4. **Follow the spacing scale** (multiples of 4px: 1, 2, 3, 4, 5, 6, 8, 10, 12, etc.)
5. **Use focus shadows** for interactive elements
6. **Test in both light and dark modes** - semantic tokens handle this automatically
