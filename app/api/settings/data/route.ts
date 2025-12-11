import { NextResponse } from 'next/server'
import { getSettingsData } from '@/lib/data/settings'

export async function GET() {
  try {
    const data = await getSettingsData()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching settings data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings data' },
      { status: 500 }
    )
  }
}
