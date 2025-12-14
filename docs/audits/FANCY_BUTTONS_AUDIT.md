# Fancy Buttons Audit - Remaining Places

**Date:** 2024-12-19

---

## 📊 Summary

**Total `<button>` elements found**: ~35+  
**Using Button component**: Most action buttons ✅  
**Using plain `<button>`**: ~35 (mostly custom UI patterns)

---

## ✅ Already Using Button Component (Fancy Variants)

These are good - they use `Button.Root` with proper variants:
- Campaign create/submit buttons
- Product add/edit buttons  
- Settings action buttons (update, delete, etc.)
- Most primary action buttons

---

## ⚠️ Plain `<button>` Elements Found

### 1. **Status Filter Tabs** (campaigns-client.tsx)
**Location**: Line 263-281  
**Type**: Tab buttons for filtering campaigns  
**Current**: Custom styled with `bg-primary-base`, `shadow-sm`  
**Should Convert?**: ❌ **NO** - These are tabs, not buttons. Custom styling is appropriate.

### 2. **Stepper Navigation** (create-campaign-client.tsx)
**Location**: Line 291-320  
**Type**: Step navigation buttons  
**Current**: Custom styled with conditional classes  
**Should Convert?**: ❌ **NO** - These are stepper controls, custom styling needed.

### 3. **Date Picker Buttons** (create-campaign-client.tsx)
**Location**: Line 646, 674  
**Type**: Date picker triggers  
**Current**: Custom styled for date picker UI  
**Should Convert?**: ❌ **NO** - These are part of Popover/Calendar component pattern.

### 4. **Product Selection Cards** (create-campaign-client.tsx)
**Location**: Line 472-491  
**Type**: Product selection cards (clickable)  
**Current**: Custom styled cards with hover states  
**Should Convert?**: ❌ **NO** - These are selection cards, not buttons. Custom styling appropriate.

### 5. **Settings Toggle Buttons** (settings-client.tsx)
**Location**: Multiple (176, 205, 299, 446, etc.)  
**Type**: Toggle switches, radio buttons, custom controls  
**Current**: Custom styled for specific UI patterns  
**Should Convert?**: ❌ **NO** - These are form controls (toggles, radios), not action buttons.

### 6. **Enrollment Filter/Status Buttons** (enrollments-client.tsx)
**Location**: Line 326, 380, 419, 448, 615, 670  
**Type**: Filter tabs, status badges, action buttons  
**Current**: Mix of custom styled and Button components  
**Should Convert?**: ⚠️ **PARTIAL** - Some could use Button component, but tabs are fine as-is.

### 7. **Wallet Action Buttons** (wallet-client.tsx)
**Location**: Line 253, 291, 303, 645, 664, 683  
**Type**: Filter tabs, action buttons  
**Current**: Mix of custom styled  
**Should Convert?**: ⚠️ **REVIEW** - Check if these are tabs or actual action buttons.

### 8. **Invoice Buttons** (invoices-client.tsx)
**Location**: Line 325, 409  
**Type**: Filter/action buttons  
**Current**: Custom styled  
**Should Convert?**: ⚠️ **REVIEW** - Check if these should use Button component.

---

## 🎯 Recommendation

### ✅ Keep as-is (Custom Styling Appropriate):
1. **Tab buttons** - Status filters, category filters (custom styling for tabs is standard)
2. **Stepper controls** - Multi-step form navigation (needs custom styling)
3. **Date picker triggers** - Part of Popover/Calendar pattern
4. **Selection cards** - Product selection, etc. (cards, not buttons)
5. **Form controls** - Toggles, radios, switches (not action buttons)
6. **Badge-like buttons** - Status indicators, filters (custom styling appropriate)

### ⚠️ Review (Could Potentially Use Button Component):
1. **Enrollment action buttons** - If they're actual actions (not tabs)
2. **Wallet action buttons** - If they're actual actions (not tabs)
3. **Invoice action buttons** - If they're actual actions (not tabs)

---

## 📋 Action Items

1. ✅ **Most buttons already use Button component** - Primary actions are good
2. ⚠️ **Review enrollment/wallet/invoice buttons** - Check if they're tabs or actions
3. ✅ **Custom styled buttons are appropriate** - Tabs, steppers, form controls should stay custom

---

## 🎨 Conclusion

**Status**: ✅ **Mostly Good**

- **Action buttons** (create, submit, delete, etc.) → ✅ Using Button component with fancy variants
- **UI pattern buttons** (tabs, steppers, pickers) → ✅ Custom styling is appropriate
- **Form controls** (toggles, radios) → ✅ Custom styling is appropriate

**No major changes needed** - The fancy button variants are being used correctly for action buttons. Custom styled buttons for UI patterns (tabs, steppers, etc.) are standard practice and should remain as-is.
