# Role-Based Access Control

## Role Hierarchy

```
OWNER (highest)
  ↓
ADMIN
  ↓
MEMBER (lowest)
```

## Role Definitions

### Owner
- **Count**: Exactly one per organization
- **Cannot be**: Removed or demoted
- **Can**: Transfer ownership to another admin
- **Permissions**: Full access to everything

### Admin
- **Count**: Unlimited
- **Permissions**: Nearly full access (except ownership transfer)
- **Can manage**: All organization resources except owner

### Member
- **Count**: Unlimited
- **Permissions**: View and review capabilities
- **Cannot**: Manage settings, team, or wallet funding

## Permission Matrix

| Feature | Owner | Admin | Member |
|---------|-------|-------|--------|
| **Dashboard** |
| View dashboard | ✅ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ✅ |
| **Campaigns** |
| View campaigns | ✅ | ✅ | ✅ |
| Create campaign | ✅ | ✅ | ❌ |
| Edit campaign | ✅ | ✅ | ❌ |
| Delete campaign | ✅ | ✅ | ❌ |
| Activate/pause campaign | ✅ | ✅ | ❌ |
| **Enrollments** |
| View enrollments | ✅ | ✅ | ✅ |
| Review enrollments | ✅ | ✅ | ✅ |
| Approve/reject | ✅ | ✅ | ✅ |
| Request changes | ✅ | ✅ | ✅ |
| **Products** |
| View products | ✅ | ✅ | ✅ |
| Add product | ✅ | ✅ | ❌ |
| Edit product | ✅ | ✅ | ❌ |
| Delete product | ✅ | ✅ | ❌ |
| **Wallet** |
| View balance | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| Fund wallet | ✅ | ✅ | ❌ |
| **Team** |
| View team members | ✅ | ✅ | ✅ |
| Invite members | ✅ | ✅ | ❌ |
| Change roles | ✅ | ✅ (except owner) | ❌ |
| Remove members | ✅ | ✅ (except owner) | ❌ |
| **Invoices** |
| View invoices | ✅ | ✅ | ✅ |
| Download invoices | ✅ | ✅ | ❌ |
| **Settings** |
| View settings | ✅ | ✅ | ❌ |
| Edit settings | ✅ | ✅ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ |

## Role Assignment Rules

### Invite Flow
1. Owner/Admin invites user with role selection
2. User receives email invitation
3. User accepts and joins with assigned role
4. Role can be changed later by owner/admin

### Role Changes
- **Owner → Admin**: Transfer ownership to another admin first
- **Admin → Member**: Allowed by owner or other admin
- **Member → Admin**: Allowed by owner or admin
- **Admin → Owner**: Only via ownership transfer

### Removal Rules
- Owner cannot be removed (must transfer ownership first)
- Admin can remove members
- Admin can remove other admins
- Admin cannot remove owner
- Members cannot remove anyone

## UI Permission Handling

### Hidden Features
- Hide buttons/menus user can't access
- Show disabled state with tooltip for context

### Blocked Actions
- Display permission error modal:
```
┌─────────────────────────────────────┐
│  Permission Required           [×]  │
├─────────────────────────────────────┤
│                                     │
│  You don't have permission to       │
│  perform this action.               │
│                                     │
│  Contact an admin or owner if you   │
│  need access.                       │
│                                     │
│                [OK]                 │
│                                     │
└─────────────────────────────────────┘
```

## API Permission Enforcement
- Server validates all permissions
- Returns 403 Forbidden if unauthorized
- Client-side permissions are for UX only
- Never trust client-side permission checks

---
