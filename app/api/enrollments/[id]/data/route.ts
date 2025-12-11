import { NextResponse } from 'next/server'
import { getEnrollmentDetailData } from '@/lib/data/enrollments'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await getEnrollmentDetailData(id)

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching enrollment detail data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollment detail data' },
      { status: 500 }
    )
  }
}
