import { NextResponse } from 'next/server'
import { getProductsData } from '@/lib/data/products'

export async function GET() {
  try {
    const data = await getProductsData()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching products data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products data' },
      { status: 500 }
    )
  }
}
