/**
 * DEPRECATED: This file is a temporary stub.
 * All hooks should be migrated to use @/lib/encore-browser directly.
 * These functions will throw errors to identify remaining usages.
 */

const MIGRATION_ERROR = 'This hook needs to be migrated to use Encore client directly. See hooks/use-campaigns.ts for reference.'

export async function get<T>(_url: string, _config?: unknown): Promise<T> {
  throw new Error(MIGRATION_ERROR)
}

export async function post<T>(_url: string, _data?: unknown, _config?: unknown): Promise<T> {
  throw new Error(MIGRATION_ERROR)
}

export async function put<T>(_url: string, _data?: unknown, _config?: unknown): Promise<T> {
  throw new Error(MIGRATION_ERROR)
}

export async function patch<T>(_url: string, _data?: unknown, _config?: unknown): Promise<T> {
  throw new Error(MIGRATION_ERROR)
}

export async function del<T>(_url: string, _config?: unknown): Promise<T> {
  throw new Error(MIGRATION_ERROR)
}
