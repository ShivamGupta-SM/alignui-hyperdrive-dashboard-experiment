/**
 * Storage API Mock Handlers
 */

import { http } from 'msw'
import { encoreUrl, encoreResponse, encoreErrorResponse } from './utils'

export const storageHandlers = [
  // POST /storage/upload-url
  http.post(encoreUrl('/storage/upload-url'), async ({ request }) => {
    const body = await request.json() as { fileName: string; fileType: string }
    
    if (!body.fileName) {
      return encoreErrorResponse('File name is required', 400)
    }

    return encoreResponse({
      uploadUrl: `https://storage.example.com/upload/${Date.now()}`,
      fileKey: `uploads/${Date.now()}-${body.fileName}`,
    })
  }),

  // GET /storage/download-url
  http.get(encoreUrl('/storage/download-url'), async ({ request }) => {
    const url = new URL(request.url)
    const fileKey = url.searchParams.get('fileKey')
    
    if (!fileKey) {
      return encoreErrorResponse('File key is required', 400)
    }

    return encoreResponse({
      downloadUrl: `https://storage.example.com/download/${fileKey}`,
    })
  }),

  // DELETE /storage/files/:key
  http.delete(encoreUrl('/storage/files/:key'), async () => {
    return encoreResponse({ deleted: true })
  }),
]
