'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface SkiaLiquidLogoProps {
  logoPath?: string
  className?: string
  speed?: number
  intensity?: number
}

// Global cache for CanvasKit
let canvasKitPromise: Promise<unknown> | null = null
let canvasKitInstance: unknown = null

// Load CanvasKit from CDN (avoids Turbopack fs module issues)
function loadCanvasKit(): Promise<unknown> {
  if (canvasKitInstance) return Promise.resolve(canvasKitInstance)
  if (canvasKitPromise) return canvasKitPromise

  canvasKitPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as unknown as Record<string, unknown>).CanvasKitInit) {
      const init = (window as unknown as Record<string, unknown>).CanvasKitInit as (opts: { locateFile: (file: string) => string }) => Promise<unknown>
      init({
        locateFile: (file: string) => `https://unpkg.com/canvaskit-wasm@0.40.0/bin/${file}`,
      }).then((ck) => {
        canvasKitInstance = ck
        resolve(ck)
      }).catch(reject)
      return
    }

    // Load script from CDN
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/canvaskit-wasm@0.40.0/bin/canvaskit.js'
    script.async = true
    script.onload = () => {
      const init = (window as unknown as Record<string, unknown>).CanvasKitInit as (opts: { locateFile: (file: string) => string }) => Promise<unknown>
      if (init) {
        init({
          locateFile: (file: string) => `https://unpkg.com/canvaskit-wasm@0.40.0/bin/${file}`,
        }).then((ck) => {
          canvasKitInstance = ck
          resolve(ck)
        }).catch(reject)
      } else {
        reject(new Error('CanvasKitInit not found'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load CanvasKit script'))
    document.head.appendChild(script)
  })

  return canvasKitPromise
}

/**
 * Skia/CanvasKit Liquid Metal Logo
 * Uses Skia's powerful rendering via CanvasKit WASM (loaded from CDN)
 * Creates a chrome/liquid metal effect with shaders
 */
export function SkiaLiquidLogo({
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  speed = 1,
  intensity = 1,
}: SkiaLiquidLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const animationRef = useRef<number>(0)
  const ckRef = useRef<{
    CanvasKit: unknown
    surface: unknown
  }>({ CanvasKit: null, surface: null })

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animationRef.current)
    if (ckRef.current.surface) {
      (ckRef.current.surface as { delete: () => void }).delete()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let isMounted = true

    async function initSkia() {
      try {
        // Load CanvasKit from CDN
        const CanvasKit = await loadCanvasKit() as Record<string, unknown>

        if (!isMounted || !canvas) return

        // Set canvas size
        const size = 400
        canvas.width = size * window.devicePixelRatio
        canvas.height = size * window.devicePixelRatio
        canvas.style.width = `${size}px`
        canvas.style.height = `${size}px`

        // Create Skia surface from canvas
        const surface = (CanvasKit.MakeCanvasSurface as (canvas: HTMLCanvasElement) => unknown)(canvas)
        if (!surface) {
          setError('Failed to create Skia surface')
          return
        }

        ckRef.current = { CanvasKit, surface }

        // Load the logo image
        const response = await fetch(logoPath)
        let logoImage: unknown = null

        // If SVG, we need to render it first
        if (logoPath.endsWith('.svg')) {
          const svgText = await response.text()
          // For SVG, create a temporary canvas to render
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = size
          tempCanvas.height = size
          const ctx = tempCanvas.getContext('2d')
          if (ctx) {
            const img = new Image()
            img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                ctx.drawImage(img, 0, 0, size, size)
                resolve()
              }
              img.onerror = reject
            })

            // Get image data and create Skia image
            const imgData = ctx.getImageData(0, 0, size, size)
            const ColorType = CanvasKit.ColorType as Record<string, unknown>
            const AlphaType = CanvasKit.AlphaType as Record<string, unknown>
            const ColorSpace = CanvasKit.ColorSpace as Record<string, unknown>
            logoImage = (CanvasKit.MakeImage as (info: unknown, data: Uint8ClampedArray, rowBytes: number) => unknown)(
              {
                width: size,
                height: size,
                colorType: ColorType.RGBA_8888,
                alphaType: AlphaType.Unpremul,
                colorSpace: ColorSpace.SRGB,
              },
              imgData.data,
              4 * size
            )
          }
        } else {
          const blob = await response.blob()
          const arrayBuffer = await blob.arrayBuffer()
          const imageData = new Uint8Array(arrayBuffer)
          logoImage = (CanvasKit.MakeImageFromEncoded as (data: Uint8Array) => unknown)(imageData)
        }

        if (!logoImage) {
          setError('Failed to load logo')
          return
        }

        // Simplified shader that works reliably
        const simpleShaderCode = `
          uniform float u_time;
          uniform float u_intensity;
          uniform shader u_image;
          uniform float2 u_resolution;

          half4 main(float2 fragCoord) {
            float2 uv = fragCoord / u_resolution;
            half4 logo = u_image.eval(fragCoord);
            if (logo.a < 0.1) return half4(0.0);

            float t = u_time * 0.5;

            // Simple flowing chrome effect
            float flow = uv.x + uv.y + sin(uv.x * 10.0 + t) * 0.1 + t * 0.2;
            float bands = sin(flow * 12.566) * 0.5 + 0.5;

            float3 chromeLight = float3(0.95, 0.95, 1.0);
            float3 chromeMid = float3(0.6, 0.65, 0.72);
            float3 chromeDark = float3(0.15, 0.15, 0.18);

            float3 color = mix(chromeDark, chromeMid, bands);

            // Simple highlight
            float highlight = pow(max(0.0, 1.0 - length(uv - float2(0.3 + sin(t) * 0.2, 0.3 + cos(t * 0.7) * 0.15))), 3.0);
            color = mix(color, chromeLight, highlight * 0.7);

            return half4(color, logo.a);
          }
        `

        const RuntimeEffect = CanvasKit.RuntimeEffect as { Make: (code: string) => unknown }
        const shader = RuntimeEffect.Make(simpleShaderCode)

        if (!shader) {
          setError('Failed to create shader')
          return
        }

        setIsLoaded(true)

        // Animation loop
        const startTime = performance.now()
        const TileMode = CanvasKit.TileMode as Record<string, unknown>
        const FilterMode = CanvasKit.FilterMode as Record<string, unknown>
        const MipmapMode = CanvasKit.MipmapMode as Record<string, unknown>

        function draw() {
          if (!isMounted || !ckRef.current.surface || !ckRef.current.CanvasKit) return

          const CK = ckRef.current.CanvasKit as Record<string, unknown>
          const skCanvas = (ckRef.current.surface as { getCanvas: () => unknown }).getCanvas() as Record<string, unknown>
          const elapsed = ((performance.now() - startTime) / 1000) * speed

          // Clear canvas
          const Color = CK.Color as (r: number, g: number, b: number, a: number) => unknown
          ;(skCanvas.clear as (color: unknown) => void)(Color(0, 0, 0, 0))

          // Create image shader from logo
          const logoImg = logoImage as { makeShaderOptions: (tm1: unknown, tm2: unknown, fm: unknown, mm: unknown) => unknown }
          const imageShader = logoImg.makeShaderOptions(
            TileMode.Clamp,
            TileMode.Clamp,
            FilterMode.Linear,
            MipmapMode.None
          )

          // Create the effect shader with uniforms
          const shaderObj = shader as { makeShaderWithChildren: (uniforms: number[], children: unknown[]) => unknown }
          const effectShader = shaderObj.makeShaderWithChildren(
            [elapsed, intensity, canvas!.width, canvas!.height],
            [imageShader]
          )

          // Create paint with shader
          const Paint = CK.Paint as new () => { setShader: (s: unknown) => void; delete: () => void }
          const paint = new Paint()
          paint.setShader(effectShader)

          // Draw
          const XYWHRect = CK.XYWHRect as (x: number, y: number, w: number, h: number) => unknown
          ;(skCanvas.drawRect as (rect: unknown, paint: unknown) => void)(XYWHRect(0, 0, canvas!.width, canvas!.height), paint)

          // Cleanup
          paint.delete()
          ;(effectShader as { delete: () => void }).delete()
          ;(imageShader as { delete: () => void }).delete()

          ;(ckRef.current.surface as { flush: () => void }).flush()

          animationRef.current = requestAnimationFrame(draw)
        }

        draw()
      } catch (e) {
        console.error('Skia init error:', e)
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Failed to initialize Skia')
        }
      }
    }

    initSkia()

    return () => {
      isMounted = false
      cleanup()
    }
  }, [logoPath, speed, intensity, cleanup])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-bg-weak-50 text-text-sub-600 text-paragraph-xs p-2 text-center ${className}`}>
        Skia: {error}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-weak-50">
          <div className="flex flex-col items-center gap-2">
            <div className="size-6 rounded-full border-2 border-primary-base border-t-transparent animate-spin" />
            <span className="text-paragraph-xs text-text-sub-600">Loading Skia...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkiaLiquidLogo
