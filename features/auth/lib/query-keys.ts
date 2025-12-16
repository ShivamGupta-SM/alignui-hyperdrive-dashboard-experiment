export const authQueryKeys = {
  all: ['auth'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  organizations: () => [...authQueryKeys.all, 'organizations'] as const,
} as const
