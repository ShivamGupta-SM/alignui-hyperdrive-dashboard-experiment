# Session Management

## Purpose
View and manage active login sessions across devices for security.

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  My Account                                                 │
│  Active Sessions                                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Profile] [Security] [Sessions] [API Keys]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ACTIVE SESSIONS                [Revoke All Others]  │   │
│  │                                                      │   │
│  │ ┌──────────────────────────────────────────────────┐ │   │
│  │ │ 🖥  Windows • Chrome           THIS DEVICE       │ │   │
│  │ │                                                  │ │   │
│  │ │ IP: 103.21.xxx.xxx                               │ │   │
│  │ │ Location: Mumbai, India                          │ │   │
│  │ │ Last active: Just now                            │ │   │
│  │ │ Signed in: Dec 5, 2024 at 9:30 AM                │ │   │
│  │ └──────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  │ ┌──────────────────────────────────────────────────┐ │   │
│  │ │ 📱  iPhone • Safari                    [Revoke]  │ │   │
│  │ │                                                  │ │   │
│  │ │ IP: 103.21.xxx.xxx                               │ │   │
│  │ │ Location: Mumbai, India                          │ │   │
│  │ │ Last active: 2 hours ago                         │ │   │
│  │ │ Signed in: Dec 4, 2024 at 3:45 PM                │ │   │
│  │ └──────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  │ ┌──────────────────────────────────────────────────┐ │   │
│  │ │ 💻  MacOS • Firefox                    [Revoke]  │ │   │
│  │ │                                                  │ │   │
│  │ │ IP: 49.36.xxx.xxx                                │ │   │
│  │ │ Location: Bengaluru, India                       │ │   │
│  │ │ Last active: 1 day ago                           │ │   │
│  │ │ Signed in: Dec 3, 2024 at 10:15 AM               │ │   │
│  │ └──────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  │ ℹ If you see a device you don't recognize, revoke   │   │
│  │   access immediately and change your password.      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Session Information

Each session card shows:
- **Device Icon**: 🖥 Desktop, 📱 Mobile, 💻 Laptop
- **OS & Browser**: Windows/MacOS/iPhone + Chrome/Safari/Firefox
- **IP Address**: Partially masked for security
- **Location**: City, Country (from IP geolocation)
- **Last Active**: Relative time
- **Signed In**: Full timestamp

### Current Device
- Highlighted with "THIS DEVICE" badge
- Cannot be revoked

### Other Devices
- [Revoke] button for each session
- Immediately terminates that session

## Bulk Actions

### Revoke All Others
- Terminates all sessions except current
- Confirmation dialog before executing
- Useful after password change

## Security Notes

### Warning Message
- Displayed at bottom
- Instructs users to revoke unknown devices
- Recommends password change if compromised

## API Endpoints
- `GET /auth/sessions` - List active sessions
- `DELETE /auth/sessions/:id` - Revoke specific session
- `DELETE /auth/sessions/others` - Revoke all except current

## Use Cases
- Detect unauthorized access
- Clean up forgotten sessions
- Force logout from lost devices
- Security audit

---
