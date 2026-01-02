/**
 * Error Handling - Public API
 *
 * SSOT for all error handling utilities
 *
 * @example
 * import { getErrorMessage, isAuthenticationError } from "@/lib/errors"
 */

export {
	getErrorMessage,
	extractErrorCode,
	extractErrorStatus,
	isAuthenticationError,
	isNotFoundError,
	isValidationError,
	getErrorDetails,
	handleAuthError,
} from "./encore-error-handler"
