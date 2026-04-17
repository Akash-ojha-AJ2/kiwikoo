import { NextResponse } from 'next/server'
import { getTryOnPresetListV3, getTryOnPresetCategoriesV3 } from '@/lib/tryon/presets'

export async function GET() {
  try {
    const presets = getTryOnPresetListV3()
    const categories = getTryOnPresetCategoriesV3()

    // Group presets by category
    const groupedPresets = categories.reduce((acc, category) => {
      acc[category] = presets.filter(p => p.category === category)
      return acc
    }, {} as Record<string, typeof presets>)

    return NextResponse.json({
      presets,
      categories,
      groupedPresets,
    })
  } catch (error) {
    console.error('Failed to fetch presets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presets' },
      { status: 500 }
    )
  }
}

