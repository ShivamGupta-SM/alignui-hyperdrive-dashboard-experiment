export const settingsQueryKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsQueryKeys.all, 'profile'] as const,
  organization: (orgId: string) => [...settingsQueryKeys.all, 'organization', orgId] as const,
  bankAccounts: () => [...settingsQueryKeys.all, 'bankAccounts'] as const,
  gst: () => [...settingsQueryKeys.all, 'gst'] as const,
  data: () => [...settingsQueryKeys.all, 'data'] as const,
  activity: (orgId: string) => [...settingsQueryKeys.all, 'activity', orgId] as const,
} as const
