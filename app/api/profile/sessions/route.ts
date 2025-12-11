import { NextResponse } from 'next/server'
import { mockSessions } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'

export async function GET() {
  try {
    await delay(DELAY.FAST)

    return NextResponse.json({
      success: true,
      data: mockSessions,
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')
    const revokeAll = searchParams.get('all') === 'true'

    await delay(DELAY.MEDIUM)

    if (revokeAll) {
      return NextResponse.json({
        success: true,
        message: 'All sessions revoked successfully',
      })
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Session ${sessionId} revoked successfully`,
    })
  } catch (error) {
    console.error('Error revoking session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke session' },
      { status: 500 }
    )
  }
}
