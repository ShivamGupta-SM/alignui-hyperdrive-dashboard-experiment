import { NextResponse } from 'next/server'

/**
 * Novu Framework Route Handler
 *
 * This route is reserved for Novu framework integration.
 * Workflows are defined in the Novu dashboard or triggered via the Encore backend.
 *
 * For in-app notifications, the NovuInbox component handles
 * fetching and displaying notifications directly from Novu.
 */

export async function GET() {
  return NextResponse.json({
    message: 'Novu API endpoint',
    status: 'ok',
  })
}

export async function POST() {
  return NextResponse.json(
    { error: 'Notifications should be triggered via the backend API' },
    { status: 400 }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
