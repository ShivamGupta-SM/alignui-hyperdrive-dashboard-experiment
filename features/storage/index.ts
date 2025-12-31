/**
 * Storage Feature - Public API
 */

// Types
export type {
	storage,
	UploadUrlRequest,
	UploadUrlResponse,
	DownloadUrlRequest,
	DownloadUrlResponse,
	StorageFolder,
} from "./types"

// Hooks
export {
	// Query Keys
	storageKeys,
	// Queries
	useFiles,
	useLogoPreview,
	// Mutations
	useRequestUploadUrl,
	useRequestDownloadUrl,
	useRequestProfilePictureUploadUrl,
	useRequestKycDocumentUploadUrl,
	useRequestKycDocumentDownloadUrl,
	useRequestOrgLogoUploadUrl,
	useDeleteFile,
	// Composite Hooks
	useUploadProfilePicture,
} from "./hooks/use-storage"

// Actions
export {
	deleteFile,
	requestUploadUrl,
	requestDownloadUrl,
	requestOrgLogoUploadUrl,
	requestProfilePictureUploadUrl,
	requestKycDocumentUploadUrl,
	requestKycDocumentDownloadUrl,
} from "./actions/storage"
