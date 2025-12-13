# Encore Auth Service - Available Endpoints

**Last Updated:** 2024-12-19

## ✅ All Better Auth Endpoints Available in Encore Client

The Encore client (`client.auth`) provides **all Better Auth functionality** through typed endpoints. All authentication operations should use these endpoints instead of Better Auth directly.

## 📋 Available Auth Endpoints

### 🔐 Authentication

#### Sign In/Up
- `signInEmail(params)` - Sign in with email and password
- `signUpEmail(params)` - Sign up with email and password
- `signInSocial(params)` - Sign in with social provider (Google, GitHub, Microsoft)
- `signOut()` - Sign out current user

#### Password Management
- `forgotPassword(params)` - Request password reset email
- `resetPassword(params)` - Reset password with token
- `resetPasswordCallback(token)` - Password reset callback (GET)
- `changePassword(params)` - Change password (authenticated)
- `setPassword(params)` - Set password for user

#### Email Verification
- `sendVerificationEmail()` - Send email verification
- `verifyEmail(params)` - Verify email with token

#### Session Management
- `getSession()` - Get current session
- `listSessions()` - List all user sessions
- `listDeviceSessions()` - List device sessions
- `revokeSession(sessionId)` - Revoke specific session
- `revokeSessions(params)` - Revoke multiple sessions
- `revokeOtherSessions()` - Revoke all other sessions
- `revokeDeviceSession(deviceId)` - Revoke device session
- `setActiveSession(sessionId)` - Set active session

### 👤 User Management

- `me()` - Get current user info (`MeResponse`)
- `updateUser(params)` - Update user profile
- `deleteUser()` - Delete user account
- `deleteUserCallback(token)` - Delete user callback
- `getAccountInfo()` - Get account information
- `listAccounts()` - List linked accounts

### 🔗 Social Accounts

- `linkSocial(params)` - Link social account
- `unlinkAccount(accountId)` - Unlink social account
- `oauthCallback(params)` - OAuth callback handler

### 🔒 Two-Factor Authentication (2FA)

- `twoFactorEnable()` - Enable 2FA
- `twoFactorDisable(params)` - Disable 2FA
- `twoFactorGetTotpUri()` - Get TOTP URI for QR code
- `twoFactorGenerateBackupCodes()` - Generate backup codes
- `twoFactorViewBackupCodes()` - View backup codes
- `twoFactorSendOtp(params)` - Send OTP for 2FA
- `twoFactorVerifyTotp(params)` - Verify TOTP code
- `twoFactorVerifyOtp(params)` - Verify OTP code
- `twoFactorVerifyBackupCode(params)` - Verify backup code

### 🏢 Organization Management

- `createOrganization(params)` - Create organization
- `updateOrganizationAuth(params)` - Update organization
- `deleteOrganization(organizationId)` - Delete organization
- `listOrganizations()` - List user's organizations
- `getFullOrganization(organizationId)` - Get full organization details
- `setActiveOrganization(organizationId)` - Set active organization
- `checkSlug(slug)` - Check if organization slug is available

#### Organization Members

- `addMember(params)` - Add member to organization
- `removeMember(params)` - Remove member from organization
- `listMembersAuth(organizationId)` - List organization members
- `getActiveMember()` - Get active member info
- `getActiveMemberRole()` - Get active member role
- `updateMemberRole(params)` - Update member role

#### Organization Invitations

- `inviteMemberAuth(params)` - Invite member to organization
- `acceptInvitation(params)` - Accept invitation
- `rejectInvitation(invitationId)` - Reject invitation
- `cancelInvitation(invitationId)` - Cancel invitation
- `getInvitation(invitationId)` - Get invitation details
- `listInvitations(organizationId)` - List organization invitations
- `listUserInvitations()` - List user's pending invitations

#### Organization Roles

- `createOrganizationRole(params)` - Create organization role
- `updateOrganizationRole(params)` - Update organization role
- `deleteOrganizationRole(roleId)` - Delete organization role
- `getOrganizationRole(roleId)` - Get organization role
- `listOrganizationRoles(organizationId)` - List organization roles

### 👥 Team Management

- `createTeam(params)` - Create team
- `updateTeam(params)` - Update team
- `removeTeam(teamId)` - Remove team
- `listTeams(organizationId)` - List teams
- `listUserTeams()` - List user's teams
- `setActiveTeam(teamId)` - Set active team
- `addTeamMember(params)` - Add team member
- `removeTeamMember(params)` - Remove team member
- `listTeamMembers(teamId)` - List team members

### 🔑 Permissions & Roles

- `getPermissions()` - Get user permissions
- `hasPermission(permission)` - Check if user has permission
- `hasOrganizationPermission(organizationId, permission)` - Check org permission

### 🔄 Token Management

- `getAccessToken()` - Get access token
- `refreshToken(params)` - Refresh access token

### 🛠️ Admin Functions

- `adminCreateUser(params)` - Admin: Create user
- `adminGetUser(userId)` - Admin: Get user
- `adminUpdateUser(userId, params)` - Admin: Update user
- `adminRemoveUser(userId)` - Admin: Remove user
- `adminListUsers(params)` - Admin: List users
- `adminBanUser(userId, params)` - Admin: Ban user
- `adminUnbanUser(userId)` - Admin: Unban user
- `adminSetRole(userId, params)` - Admin: Set user role
- `adminListUserSessions(userId)` - Admin: List user sessions
- `adminRevokeUserSession(userId, sessionId)` - Admin: Revoke user session
- `adminRevokeUserSessions(userId)` - Admin: Revoke all user sessions
- `adminHasPermission(userId, permission)` - Admin: Check user permission
- `adminImpersonateUser(userId)` - Admin: Impersonate user
- `adminStopImpersonating()` - Admin: Stop impersonating

### 📡 Other

- `healthCheck()` - Health check endpoint
- `errorInfo()` - Get error information
- `getOpenAPISpec()` - Get OpenAPI specification
- `leaveOrganization(organizationId)` - Leave organization

### ⚠️ Deprecated

- `betterAuthHandler(method, path, body, options)` - **DEPRECATED** - Raw catch-all endpoint for Better Auth
  - Use typed endpoints above instead
  - This endpoint is kept for backwards compatibility only

## 📝 Usage Example

```typescript
import { getEncoreClient } from '@/lib/encore'

// Sign in
const client = getEncoreClient()
const result = await client.auth.signInEmail({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true
})

// Get current user
const user = await client.auth.me()

// Sign out
await client.auth.signOut()

// List sessions
const sessions = await client.auth.listSessions()

// Enable 2FA
const totpUri = await client.auth.twoFactorGetTotpUri()
```

## 🎯 Type Safety

All endpoints are fully typed with TypeScript:
- Request parameters are typed
- Response types are defined
- Errors are properly typed

## ✅ Current Implementation

All auth operations in the codebase now use Encore client:
- ✅ `app/actions/auth.ts` - Uses `client.auth.*` methods
- ✅ `hooks/use-session.ts` - Uses `getCurrentUser` (calls `client.auth.me()`)
- ✅ All server actions use Encore client

## 📊 Summary

- **Total Auth Endpoints:** 70+ endpoints
- **Better Auth Compatibility:** 100%
- **Type Safety:** Full TypeScript support
- **Status:** All Better Auth functionality available via Encore client

**Conclusion:** All Better Auth endpoints are available in the Encore client. No need for Better Auth client or library - use `client.auth.*` methods directly!
