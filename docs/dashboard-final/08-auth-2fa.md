# Two-Factor Authentication

## Purpose
Second authentication factor for enhanced account security.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ◆ HYPEDRIVE                              │
│                                                             │
│              ┌──────────────────────────────────┐           │
│              │                                  │           │
│              │  Two-Factor Authentication       │           │
│              │                                  │           │
│              │  Enter the 6-digit code from     │           │
│              │  your authenticator app          │           │
│              │                                  │           │
│              │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │           │
│              │  │  │ │  │ │  │ │  │ │  │ │  │  │           │
│              │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │           │
│              │                                  │           │
│              │  ┌────────────────────────────┐  │           │
│              │  │       Verify               │  │           │
│              │  └────────────────────────────┘  │           │
│              │                                  │           │
│              │  Use backup code instead         │           │
│              │                                  │           │
│              └──────────────────────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Code Input
- 6-digit numerical code
- Auto-focus on next field
- Auto-submit when complete

### Backup Codes
- Alternative authentication method
- Used when authenticator app unavailable

### Error Handling
- Invalid code feedback
- Retry limit (5 attempts)
- Account lockout after max attempts

## API Endpoints
- `POST /auth/2fa/verify` - Verify 2FA code
- `POST /auth/2fa/backup-code` - Verify backup code
- `POST /auth/2fa/resend` - Resend code (if SMS-based)

---
