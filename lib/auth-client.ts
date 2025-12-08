import {
    anonymousClient,
    apiKeyClient,
    emailOTPClient,
    genericOAuthClient,
    magicLinkClient,
    multiSessionClient,
    oneTapClient,
    organizationClient,
    twoFactorClient,
    usernameClient
} from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"
import { createAuthClient } from "better-auth/react"

// Create auth client with all plugins for full functionality
// Using type assertion to work around version mismatch between better-auth types
export const authClient = createAuthClient({
    // Use local API routes for dummy auth (point to external URL for real auth server)
    baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    plugins: [
        apiKeyClient(),
        multiSessionClient(),
        passkeyClient(),
        // @ts-expect-error - Plugin type mismatch between better-auth versions
        oneTapClient({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
        }),
        genericOAuthClient(),
        anonymousClient(),
        usernameClient(),
        magicLinkClient(),
        emailOTPClient(),
        twoFactorClient(),
        // @ts-expect-error - Plugin type mismatch between better-auth versions
        organizationClient()
    ]
})

export type AuthClient = typeof authClient

export type Session = AuthClient["$Infer"]["Session"]["session"]
export type User = AuthClient["$Infer"]["Session"]["user"]
