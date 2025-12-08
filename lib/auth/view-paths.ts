export const authViewPaths = {
    CALLBACK: "callback",
    EMAIL_OTP: "email-otp",
    FORGOT_PASSWORD: "forgot-password",
    MAGIC_LINK: "magic-link",
    RECOVER_ACCOUNT: "recover-account",
    RESET_PASSWORD: "reset-password",
    SIGN_IN: "sign-in",
    SIGN_OUT: "sign-out",
    SIGN_UP: "sign-up",
    TWO_FACTOR: "two-factor",
    ACCEPT_INVITATION: "accept-invitation"
}

export type AuthViewPaths = typeof authViewPaths

export const accountViewPaths = {
    SETTINGS: "settings",
    SECURITY: "security",
    API_KEYS: "api-keys",
    ORGANIZATIONS: "organizations"
}

export type AccountViewPaths = typeof accountViewPaths

export const organizationViewPaths = {
    SETTINGS: "settings",
    MEMBERS: "members",
    API_KEYS: "api-keys"
}

export type OrganizationViewPaths = typeof organizationViewPaths
export type AuthViewPath = keyof AuthViewPaths
export type AccountViewPath = keyof AccountViewPaths
export type OrganizationViewPath = keyof OrganizationViewPaths
