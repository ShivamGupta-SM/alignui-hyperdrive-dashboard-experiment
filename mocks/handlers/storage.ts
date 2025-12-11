/**
 * Storage API Mock Handlers
 *
 * Handles file upload URL generation and file management.
 */

import { http } from 'msw'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  errorResponse,
  notFoundResponse,
} from './utils'

// Mock storage for tracking uploaded files
const mockUploadedFiles: Map<string, {
  id: string
  key: string
  filename: string
  contentType: string
  size: number
  uploadedAt: Date
  organizationId: string
  userId: string
}> = new Map()

export const storageHandlers = [
  // POST /api/storage/upload-url - Generate presigned upload URL
  http.post('/api/storage/upload-url', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const body = await request.json() as Record<string, unknown>

    const { filename, contentType, folder } = body as {
      filename?: string
      contentType?: string
      folder?: string
    }

    if (!filename || !contentType) {
      return errorResponse('Filename and content type are required', 400)
    }

    // Generate a unique key for the file
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = folder
      ? `${folder}/${auth.organizationId}/${timestamp}-${randomId}-${sanitizedFilename}`
      : `uploads/${auth.organizationId}/${timestamp}-${randomId}-${sanitizedFilename}`

    // In a real app, this would be a presigned S3/GCS URL
    const uploadUrl = `/api/storage/mock-upload/${key}`

    return successResponse({
      uploadUrl,
      key,
      expiresIn: 3600, // 1 hour
    })
  }),

  // PUT /api/storage/mock-upload/* - Mock upload endpoint
  http.put('/api/storage/mock-upload/*', async ({ request, params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const key = (params['0'] as string) || ''

    // Extract filename from key
    const parts = key.split('/')
    const filename = parts[parts.length - 1].split('-').slice(2).join('-')

    const contentType = request.headers.get('content-type') || 'application/octet-stream'
    const contentLength = request.headers.get('content-length')

    const fileId = `file-${Date.now()}`

    mockUploadedFiles.set(fileId, {
      id: fileId,
      key,
      filename,
      contentType,
      size: contentLength ? parseInt(contentLength, 10) : 0,
      uploadedAt: new Date(),
      organizationId: auth.organizationId,
      userId: auth.userId,
    })

    return successResponse({
      id: fileId,
      key,
      url: `/api/storage/files/${key}`,
    })
  }),

  // GET /api/storage/files/* - Get file URL
  http.get('/api/storage/files/*', async ({ params }) => {
    await delay(DELAY.FAST)

    const key = (params['0'] as string) || ''

    // In real app, this would return a presigned download URL
    return successResponse({
      url: `https://storage.example.com/${key}`,
      expiresIn: 3600,
    })
  }),

  // DELETE /api/storage/files/:id - Delete uploaded file
  http.delete('/api/storage/files/:id', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const file = mockUploadedFiles.get(id as string)

    if (!file) {
      return notFoundResponse('File')
    }

    if (file.organizationId !== auth.organizationId) {
      return errorResponse('Access denied', 403)
    }

    mockUploadedFiles.delete(id as string)

    return successResponse({ message: 'File deleted successfully' })
  }),

  // POST /api/storage/upload - Direct file upload (multipart)
  http.post('/api/storage/upload', async ({ request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()

    // In a real scenario, we'd parse multipart form data
    // For mock purposes, we simulate a successful upload
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const key = `uploads/${auth.organizationId}/${timestamp}-${randomId}-uploaded-file`
    const fileId = `file-${timestamp}`

    mockUploadedFiles.set(fileId, {
      id: fileId,
      key,
      filename: 'uploaded-file',
      contentType: 'application/octet-stream',
      size: 0,
      uploadedAt: new Date(),
      organizationId: auth.organizationId,
      userId: auth.userId,
    })

    return successResponse({
      id: fileId,
      key,
      url: `/api/storage/files/${key}`,
    })
  }),
]
