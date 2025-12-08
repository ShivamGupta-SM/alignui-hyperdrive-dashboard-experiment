# Error States

## Purpose
Handle errors gracefully with clear messaging and recovery actions.

## Error State Pattern

```
┌─────────────────────────────────────┐
│                                     │
│              ⚠️                     │
│                                     │
│          Error Headline             │
│                                     │
│  Clear explanation of what went     │
│  wrong and what the user can do.    │
│                                     │
│         [Primary Action]            │
│                                     │
└─────────────────────────────────────┘
```

## Failed to Load Data

```
┌─────────────────────────────────────┐
│                                     │
│              ⚠️                     │
│                                     │
│      Failed to load dashboard       │
│                                     │
│  We couldn't fetch your dashboard   │
│  data. Please check your connection │
│  and try again.                     │
│                                     │
│           [Try Again]               │
│                                     │
└─────────────────────────────────────┘
```

## Network Error

```
┌─────────────────────────────────────┐
│                                     │
│              🔌                     │
│                                     │
│       Connection Lost               │
│                                     │
│  Please check your internet         │
│  connection and try again.          │
│                                     │
│           [Retry]                   │
│                                     │
└─────────────────────────────────────┘
```

## Permission Denied

```
┌─────────────────────────────────────┐
│                                     │
│              🔒                     │
│                                     │
│       Access Denied                 │
│                                     │
│  You don't have permission to view  │
│  this page. Contact your admin if   │
│  you believe this is a mistake.     │
│                                     │
│        [Back to Dashboard]          │
│                                     │
└─────────────────────────────────────┘
```

## Server Error (500)

```
┌─────────────────────────────────────┐
│                                     │
│              💥                     │
│                                     │
│      Something went wrong           │
│                                     │
│  Our servers encountered an error.  │
│  We've been notified and are        │
│  working to fix it.                 │
│                                     │
│  [Try Again]  [Contact Support]     │
│                                     │
└─────────────────────────────────────┘
```

## Form Validation Error

```
┌─────────────────────────────────────┐
│  Campaign Title *                   │
│  ┌───────────────────────────────┐  │
│  │ [empty]                       │  │
│  └───────────────────────────────┘  │
│  ❌ Campaign title is required      │
│                                     │
│  Email Address *                    │
│  ┌───────────────────────────────┐  │
│  │ invalid-email                 │  │
│  └───────────────────────────────┘  │
│  ❌ Please enter a valid email      │
└─────────────────────────────────────┘
```

## Inline Error Toast

```
┌──────────────────────────┐
│ ⚠️ Failed to save        │
│    Please try again      │
│    [Retry]               │
└──────────────────────────┘
```

Position: Top-right corner
Duration: Until dismissed (errors don't auto-dismiss)

## Error Types

### Network Errors
- Connection lost
- Timeout
- DNS failure

### Client Errors (4xx)
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

### Server Errors (5xx)
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable

## Design Guidelines
- Use ⚠️ icon for general errors
- Use specific icons for specific errors (🔌 🔒 💥)
- Clear, non-technical language
- Always provide action to recover
- Log errors for debugging
- Don't expose sensitive error details to users
- Auto-retry for transient network errors

---
