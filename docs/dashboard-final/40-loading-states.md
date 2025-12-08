# Loading States

## Purpose
Show skeleton loaders while data is fetching to maintain layout stability.

## Skeleton Pattern

```
░░░░░░░░░░░░░░░░░░░░
```

## Dashboard Loading

```
┌─────────────────────────────────────┐
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │░░░░░░░│ │░░░░░░░│ │░░░░░░░│    │
│  │░░░░░░░│ │░░░░░░░│ │░░░░░░░│    │
│  │░░░░░░░│ │░░░░░░░│ │░░░░░░░│    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  └─────────────────────────────┘   │
│                                     │
│        Loading dashboard...         │
│                                     │
└─────────────────────────────────────┘
```

## Table Loading

```
┌──────────────────────────────────────┐
│  Name       Status    Actions        │
│  ──────────────────────────────────  │
│  ░░░░░░░    ░░░░░░    ░░░░░░░       │
│  ░░░░░░░    ░░░░░░    ░░░░░░░       │
│  ░░░░░░░    ░░░░░░    ░░░░░░░       │
│  ░░░░░░░    ░░░░░░    ░░░░░░░       │
└──────────────────────────────────────┘
```

## Card Grid Loading

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│░░░░░░░░░░│ │░░░░░░░░░░│ │░░░░░░░░░░│
│░░░░░░░░░░│ │░░░░░░░░░░│ │░░░░░░░░░░│
│░░░░░░░░░░│ │░░░░░░░░░░│ │░░░░░░░░░░│
│░░░░░░░░░░│ │░░░░░░░░░░│ │░░░░░░░░░░│
└──────────┘ └──────────┘ └──────────┘
```

## Stat Card Loading

```
┌──────────────┐
│ ░░░░         │
│              │
│ ░░░░░░░░     │
│ ░░░░░░░      │
│              │
│ ░░░░░░       │
│              │
│ [░░░░░░░]    │
└──────────────┘
```

## Inline Loading Spinner

```
⟳ Loading...
```

Use for:
- Button loading states
- Inline actions
- Small sections

## Loading Text
- "Loading dashboard..."
- "Loading campaigns..."
- "Loading team members..."
- "Processing..."

## Design Guidelines
- Match skeleton shape to actual content
- Animate subtle pulse effect
- Keep visual hierarchy consistent
- Show progress indicator if operation takes >3s
- Minimum display time: 300ms (prevent flashing)

---
