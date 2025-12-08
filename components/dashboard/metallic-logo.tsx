'use client'

import { useState, useEffect } from 'react'
import MetallicPaint, { parseLogoImage } from '@/components/ui/metallic-paint'

interface MetallicLogoProps {
  logoPath?: string
  className?: string
  params?: {
    patternScale?: number
    refraction?: number
    edge?: number
    patternBlur?: number
    liquid?: number
    speed?: number
  }
}

export function MetallicLogo({ 
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  params = {}
}: MetallicLogoProps) {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const defaultParams = {
    edge: 2,
    patternBlur: 0.005,
    patternScale: 2,
    refraction: 0.015,
    speed: 0.3,
    liquid: 0.07,
    ...params
  }

  useEffect(() => {
    let mounted = true
    
    async function loadLogo() {
      try {
        console.log('[MetallicLogo] Starting to load:', logoPath)
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(logoPath)
        console.log('[MetallicLogo] Fetch response:', response.status, response.ok)
        
        if (!response.ok) {
          throw new Error(`Failed to load logo: ${response.status}`)
        }
        
        const blob = await response.blob()
        console.log('[MetallicLogo] Blob loaded:', blob.type, blob.size, 'bytes')
        
        const file = new File([blob], 'logo.svg', { type: blob.type })
        console.log('[MetallicLogo] Parsing image...')
        
        const parsedData = await parseLogoImage(file)
        console.log('[MetallicLogo] Image parsed:', parsedData.imageData.width, 'x', parsedData.imageData.height)
        
        if (mounted) {
          setImageData(parsedData?.imageData ?? null)
        }
      } catch (err) {
        console.error('[MetallicLogo] Error:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load logo')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    loadLogo()
    
    return () => {
      mounted = false
    }
  }, [logoPath])

  // Show what state we're in
  console.log('[MetallicLogo] Render state:', { isLoading, hasError: !!error, hasImageData: !!imageData, logoPath })

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="size-8 rounded-full bg-bg-weak-50 animate-pulse" />
      </div>
    )
  }

  if (error || !imageData) {
    console.warn('[MetallicLogo] Using fallback image:', { error, hasImageData: !!imageData, logoPath })
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img src={logoPath} alt="Logo" className="w-full h-full object-contain" />
      </div>
    )
  }

  console.log('[MetallicLogo] Rendering metallic effect:', imageData.width, 'x', imageData.height)

  return (
    <div className={className}>
      <MetallicPaint imageData={imageData} params={defaultParams} />
    </div>
  )
}
