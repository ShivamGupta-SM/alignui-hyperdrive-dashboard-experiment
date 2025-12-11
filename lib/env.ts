import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * Server-side environment variables schema
   * These are only available on the server and will throw if accessed on the client
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Encore Backend
    ENCORE_API_URL: z.string().url().optional(),
    ENCORE_ENVIRONMENT: z.string().optional(),

    // Database (when you add one)
    // DATABASE_URL: z.string().url().optional(),

    // Email (Resend)
    RESEND_API_KEY: z.string().min(1).optional(),

    // Sentry
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),

    // Analytics
    POSTHOG_API_KEY: z.string().optional(),

    // Auth secrets
    BETTER_AUTH_SECRET: z.string().min(32).optional(),

    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Novu Notifications
    NOVU_SECRET_KEY: z.string().optional(),

    // Mock/Development Features
    ENABLE_MOCK_AUTH: z.enum(['true', 'false']).optional(),
    ENABLE_MOCK_DELAYS: z.enum(['true', 'false']).optional(),
  },

  /**
   * Client-side environment variables schema
   * These are exposed to the client via the `NEXT_PUBLIC_` prefix
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_NOVU_APP_ID: z.string().optional(),
  },

  /**
   * Runtime environment variables
   * Map environment variables to the schema
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // Server
    ENCORE_API_URL: process.env.ENCORE_API_URL,
    ENCORE_ENVIRONMENT: process.env.ENCORE_ENVIRONMENT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NOVU_SECRET_KEY: process.env.NOVU_SECRET_KEY,
    ENABLE_MOCK_AUTH: process.env.ENABLE_MOCK_AUTH,
    ENABLE_MOCK_DELAYS: process.env.ENABLE_MOCK_DELAYS,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_NOVU_APP_ID: process.env.NEXT_PUBLIC_NOVU_APP_ID,
  },

  /**
   * Skip validation in certain environments
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Allow empty strings for optional variables
   */
  emptyStringAsUndefined: true,
})
