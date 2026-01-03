/**
 * Hooks - Public API
 *
 * @description
 * Centralized exports for SHARED hooks only.
 *
 * IMPORTANT - SSOT Rules:
 * - Feature hooks: Import from `@/features/*` (auth, campaigns, etc.)
 * - Shared hooks: Import from `@/hooks` (this file)
 *
 * This file exports:
 * - UI utility hooks (media query, clipboard, keyboard, etc.)
 * - State management hooks (localStorage, search params)
 * - Cross-feature shared hooks (dashboard, current org, notifications)
 *
 * NOTE: For usehooks-ts hooks, import directly from "usehooks-ts"
 */

// ============================================
// UI Utility Hooks
// ============================================
export * from './ui'

// ============================================
// State Management Hooks
// ============================================
export * from './state'

// ============================================
// Shared Data Hooks (Cross-feature)
// ============================================
export * from './shared'

// ============================================
// Form Hooks
// ============================================
export * from './forms'

