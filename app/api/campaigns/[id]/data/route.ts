import { NextResponse } from 'next/server'
import { getCampaignDetailData } from '@/lib/data/campaigns'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await getCampaignDetailData(id)

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching campaign detail data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign detail data' },
      { status: 500 }
    )
  }
}
