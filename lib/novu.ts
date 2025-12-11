import { Novu } from '@novu/api'
import { createHmac } from 'node:crypto'

/**
 * Novu Integration for Hyprive Dashboard
 *
 * This module provides:
 * - HMAC hash generation for secure Inbox authentication
 * - Subscriber synchronization with Novu
 *
 * Note: Notification triggering is handled by the Encore backend.
 * The dashboard only displays notifications via the NovuInbox component.
 *
 * @see https://docs.novu.co/platform/quickstart/nextjs
 */

// ============================================
// Novu Client
// ============================================

let novuClient: Novu | null = null

function getNovuClient(): Novu | null {
  if (novuClient) return novuClient

  const secretKey = process.env.NOVU_SECRET_KEY
  if (!secretKey) {
    console.warn('[Novu] NOVU_SECRET_KEY not configured')
    return null
  }

  novuClient = new Novu({ secretKey })
  return novuClient
}

// ============================================
// HMAC Authentication
// ============================================

/**
 * Generate HMAC hash for subscriber authentication
 *
 * This hash is used to securely authenticate the subscriber
 * when loading the Novu Inbox. It should only be generated server-side.
 *
 * @see https://docs.novu.co/inbox/react/production
 */
export function generateSubscriberHash(subscriberId: string): string | null {
  const secretKey = process.env.NOVU_SECRET_KEY
  if (!secretKey) {
    return null
  }

  return createHmac('sha256', secretKey)
    .update(subscriberId)
    .digest('hex')
}

// ============================================
// Subscriber Management
// ============================================

export interface SubscriberData {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  organizationId?: string
  organizationName?: string
  role?: string
}

/**
 * Create or update a subscriber in Novu
 *
 * Call this after user authentication to ensure the user
 * exists as a subscriber in Novu for receiving notifications.
 */
export async function syncSubscriber(
  subscriberId: string,
  data: SubscriberData
): Promise<boolean> {
  const client = getNovuClient()
  if (!client) {
    console.log('[Novu] Mock: Syncing subscriber', subscriberId)
    return true
  }

  try {
    await client.subscribers.create({
      subscriberId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatar: data.avatar,
      data: {
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        role: data.role,
      },
    })
    return true
  } catch (error) {
    console.error('[Novu] Error syncing subscriber:', error)
    return false
  }
}

/**
 * Delete a subscriber from Novu
 */
export async function deleteSubscriber(subscriberId: string): Promise<boolean> {
  const client = getNovuClient()
  if (!client) {
    console.log('[Novu] Mock: Deleting subscriber', subscriberId)
    return true
  }

  try {
    await client.subscribers.delete(subscriberId)
    return true
  } catch (error) {
    console.error('[Novu] Error deleting subscriber:', error)
    return false
  }
}
