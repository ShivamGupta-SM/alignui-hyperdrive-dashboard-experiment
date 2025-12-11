import { NextResponse } from 'next/server'
import { getTeamData } from '@/lib/data/team'

export async function GET() {
  try {
    const data = await getTeamData()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}
