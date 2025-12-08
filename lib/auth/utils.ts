import { z } from "zod"
import type { AuthLocalization } from "./localization"

export function isValidEmail(email: string) {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function errorCodeToCamelCase(errorCode: string): string {
    return errorCode
        .toLowerCase()
        .replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

export function getLocalizedError({
    error,
    localization,
    localizeErrors = true
}: {
    error: unknown
    localization?: Partial<AuthLocalization>
    localizeErrors: boolean
}) {
    const DEFAULT_ERROR_MESSAGE = "Request failed"

    if (!localizeErrors) {
        if (error && typeof error === "object" && "message" in error) {
            return (error as { message: string }).message
        }
        if (error && typeof error === "object" && "error" in error) {
            const nestedError = (error as { error: { message?: string } }).error
            if (nestedError?.message) return nestedError.message
        }
        return DEFAULT_ERROR_MESSAGE
    }

    if (typeof error === "string") {
        if (localization?.[error as keyof AuthLocalization])
            return localization[error as keyof AuthLocalization]
    }

    if (error && typeof error === "object" && "error" in error) {
        const errorObj = error as { error: { code?: string; message?: string; statusText?: string } }
        if (errorObj.error?.code) {
            const errorCode = errorObj.error.code as keyof AuthLocalization
            if (localization?.[errorCode]) return localization[errorCode]
        }

        return (
            errorObj.error?.message ||
            errorObj.error?.code ||
            errorObj.error?.statusText ||
            localization?.REQUEST_FAILED
        )
    }

    if (error && typeof error === "object" && "message" in error) {
        return (error as { message: string }).message
    }

    return localization?.REQUEST_FAILED || DEFAULT_ERROR_MESSAGE
}

export function getSearchParam(paramName: string) {
    return typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get(paramName)
        : null
}

export function getViewByPath<T extends object>(viewPaths: T, path?: string) {
    for (const key in viewPaths) {
        if (viewPaths[key] === path) {
            return key
        }
    }
}

export interface PasswordValidation {
    minLength?: number
    maxLength?: number
    regex?: RegExp
}

export function getPasswordSchema(
    passwordValidation?: PasswordValidation,
    localization?: AuthLocalization
) {
    let schema = z.string().min(1, {
        message: localization?.PASSWORD_REQUIRED
    })
    if (passwordValidation?.minLength) {
        schema = schema.min(passwordValidation.minLength, {
            message: localization?.PASSWORD_TOO_SHORT
        })
    }
    if (passwordValidation?.maxLength) {
        schema = schema.max(passwordValidation.maxLength, {
            message: localization?.PASSWORD_TOO_LONG
        })
    }
    if (passwordValidation?.regex) {
        schema = schema.regex(passwordValidation.regex, {
            message: localization?.INVALID_PASSWORD
        })
    }
    return schema
}
