# Best Patterns Summary - One Pattern Per Issue

## 1. Mixed Patterns - Best Pattern

**Centralized API Layer + React Query Hooks + Server Actions** - API layer में सभी API calls, hooks में React Query use करें, server actions में mutations के लिए।

## 2. File Organization - Best Pattern

**Feature-based organization** (`features/campaigns/`) - related code (components, hooks, actions, types) एक feature folder में।

## 3. Type Definitions - Best Pattern

**Single source from Encore client with re-exports** - Encore client से types re-export करें, feature folder में feature-specific types add करें।

## 4. Error Handling - Best Pattern

**Result pattern** (`{ success: true/false, data/error }`) - सभी functions Result type return करें, centralized handleAPIError() use करें।

## 5. Documentation - Best Pattern

**JSDoc comments with @description, @param, @returns, @example** - हर function/hook पर JSDoc comments with examples।

