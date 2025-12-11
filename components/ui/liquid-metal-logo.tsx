'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Image from 'next/image'

interface LiquidMetalLogoProps {
  logoPath?: string
  className?: string
  intensity?: number
  speed?: number
}

/**
 * Liquid Metal Logo using GSAP + SVG Filters
 * Creates a chrome/liquid metal effect on any logo
 */
export function LiquidMetalLogo({
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  intensity = 1,
  speed = 1,
}: LiquidMetalLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gradientRef = useRef<SVGLinearGradientElement>(null)
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null)
  const lightRef = useRef<SVGFEPointLightElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!isLoaded || hasError) return

    const gradient = gradientRef.current
    const turbulence = turbulenceRef.current
    const displacement = displacementRef.current
    const light = lightRef.current

    if (!gradient || !turbulence || !displacement || !light) return

    // Create GSAP context for cleanup
    const ctx = gsap.context(() => {
      // Animate gradient stops for flowing chrome effect
      const stop1 = gradient.querySelector('#stop1') as SVGStopElement
      const stop2 = gradient.querySelector('#stop2') as SVGStopElement
      const stop3 = gradient.querySelector('#stop3') as SVGStopElement
      const stop4 = gradient.querySelector('#stop4') as SVGStopElement

      if (stop1 && stop2 && stop3 && stop4) {
        // Gradient flow animation
        gsap.to([stop1, stop2, stop3, stop4], {
          attr: { offset: '+=0.3' },
          duration: 3 / speed,
          ease: 'none',
          repeat: -1,
          modifiers: {
            offset: (value: string) => {
              const num = parseFloat(value)
              return (num % 1).toFixed(2)
            },
          },
        })
      }

      // Animate turbulence for liquid wobble
      gsap.to(turbulence, {
        attr: { baseFrequency: `${0.01 * intensity} ${0.015 * intensity}` },
        duration: 2 / speed,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      // Animate displacement scale for morphing effect
      gsap.to(displacement, {
        attr: { scale: 8 * intensity },
        duration: 1.5 / speed,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      })

      // Animate light position for dynamic highlights
      const lightTl = gsap.timeline({ repeat: -1 })
      lightTl
        .to(light, {
          attr: { x: 150, y: 30 },
          duration: 2 / speed,
          ease: 'power1.inOut',
        })
        .to(light, {
          attr: { x: 50, y: 70 },
          duration: 2 / speed,
          ease: 'power1.inOut',
        })
        .to(light, {
          attr: { x: 100, y: 20 },
          duration: 2 / speed,
          ease: 'power1.inOut',
        })

      // Subtle rotation for dynamic feel
      gsap.to(gradient, {
        attr: { gradientTransform: 'rotate(360 50 50)' },
        duration: 8 / speed,
        ease: 'none',
        repeat: -1,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [isLoaded, hasError, intensity, speed])

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image src={logoPath} alt="Logo" fill className="object-contain" sizes="100px" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* SVG Filters for liquid metal effect */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Liquid metal gradient */}
          <linearGradient
            ref={gradientRef}
            id="liquidMetalGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop id="stop1" offset="0%" stopColor="#f8f8f8" />
            <stop id="stop2" offset="25%" stopColor="#c0c0c0" />
            <stop id="stop3" offset="50%" stopColor="#808080" />
            <stop id="stop4" offset="75%" stopColor="#d0d0d0" />
            <stop offset="100%" stopColor="#f8f8f8" />
          </linearGradient>

          {/* Chrome/metallic filter */}
          <filter id="liquidMetalFilter" x="-20%" y="-20%" width="140%" height="140%">
            {/* Turbulence for liquid distortion */}
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="3"
              seed="42"
              result="turbulence"
            />

            {/* Displacement map for morphing */}
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="turbulence"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />

            {/* Create chrome bevel effect */}
            <feGaussianBlur in="displaced" stdDeviation="0.5" result="blur" />

            {/* Specular lighting for chrome shine */}
            <feSpecularLighting
              in="blur"
              surfaceScale="4"
              specularConstant="1.2"
              specularExponent="25"
              lightingColor="#ffffff"
              result="specular"
            >
              <fePointLight ref={lightRef} x="100" y="50" z="200" />
            </feSpecularLighting>

            {/* Diffuse lighting for metallic base */}
            <feDiffuseLighting
              in="blur"
              surfaceScale="3"
              diffuseConstant="0.8"
              result="diffuse"
            >
              <feDistantLight azimuth="225" elevation="45" />
            </feDiffuseLighting>

            {/* Combine specular and diffuse */}
            <feComposite in="specular" in2="diffuse" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lighting" />

            {/* Apply to source with color */}
            <feComposite in="lighting" in2="SourceAlpha" operator="in" result="lit" />

            {/* Add metallic color overlay */}
            <feColorMatrix
              in="lit"
              type="matrix"
              values="1.2 0 0 0 0
                      0 1.2 0 0 0
                      0 0 1.3 0 0
                      0 0 0 1 0"
              result="metallic"
            />

            {/* Merge with original for sharp edges */}
            <feMerge>
              <feMergeNode in="metallic" />
            </feMerge>
          </filter>

          {/* Simpler chrome filter for better performance */}
          <filter id="chromeFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="5"
              specularConstant="1"
              specularExponent="20"
              lightingColor="#ffffff"
              result="specLight"
            >
              <fePointLight ref={lightRef} x="100" y="50" z="150" />
            </feSpecularLighting>
            <feComposite in="specLight" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>
      </svg>

      {/* Logo with liquid metal effect */}
      <div
        className="relative w-full h-full"
        style={{ filter: 'url(#liquidMetalFilter)' }}
      >
        <Image
          src={logoPath}
          alt="Logo"
          fill
          className="object-contain"
          sizes="200px"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          priority
        />
      </div>

      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 rounded-full bg-bg-weak-50 animate-pulse" />
        </div>
      )}
    </div>
  )
}

/**
 * Alternative: Canvas-based liquid metal with GSAP
 * More performant for complex animations
 */
export function LiquidMetalLogoCanvas({
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  intensity = 1,
  speed = 1,
}: LiquidMetalLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<{ time: number; mouseX: number; mouseY: number }>({
    time: 0,
    mouseX: 0.5,
    mouseY: 0.5,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      // Set canvas size
      const size = Math.max(img.width, img.height)
      canvas.width = size * 2
      canvas.height = size * 2

      // GSAP animation for time-based effects
      const tween = gsap.to(animationRef.current, {
        time: Math.PI * 2,
        duration: 4 / speed,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          renderFrame(ctx, img, animationRef.current, intensity)
        },
      })

      return () => tween.kill()
    }

    img.onerror = () => {
      console.error('Failed to load logo for canvas animation')
    }

    img.src = logoPath
  }, [logoPath, intensity, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`${className}`}
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}

// Render frame for canvas-based animation
function renderFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  state: { time: number; mouseX: number; mouseY: number },
  intensity: number
) {
  const { width, height } = ctx.canvas

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Draw base image centered
  const scale = Math.min(width / img.width, height / img.height) * 0.8
  const x = (width - img.width * scale) / 2
  const y = (height - img.height * scale) / 2

  ctx.save()

  // Apply liquid metal gradient
  const gradient = ctx.createLinearGradient(
    x + Math.sin(state.time) * 50 * intensity,
    y,
    x + img.width * scale + Math.cos(state.time) * 50 * intensity,
    y + img.height * scale
  )

  // Chrome gradient stops
  gradient.addColorStop(0, '#e8e8e8')
  gradient.addColorStop(0.2, '#a0a0a0')
  gradient.addColorStop(0.4, '#d0d0d0')
  gradient.addColorStop(0.6, '#707070')
  gradient.addColorStop(0.8, '#c0c0c0')
  gradient.addColorStop(1, '#f0f0f0')

  // Draw image
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

  // Apply chrome overlay
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, img.width * scale, img.height * scale)

  // Add highlight
  const highlightX = x + (img.width * scale * 0.5) + Math.sin(state.time * 1.5) * 30 * intensity
  const highlightY = y + (img.height * scale * 0.3) + Math.cos(state.time * 1.5) * 20 * intensity

  const highlightGradient = ctx.createRadialGradient(
    highlightX, highlightY, 0,
    highlightX, highlightY, 40 * intensity
  )
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
  highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = highlightGradient
  ctx.fillRect(x, y, img.width * scale, img.height * scale)

  // Add shadow/depth
  ctx.globalCompositeOperation = 'multiply'
  const shadowGradient = ctx.createLinearGradient(x, y, x, y + img.height * scale)
  shadowGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  shadowGradient.addColorStop(0.5, 'rgba(200, 200, 200, 1)')
  shadowGradient.addColorStop(1, 'rgba(150, 150, 150, 1)')
  ctx.fillStyle = shadowGradient
  ctx.fillRect(x, y, img.width * scale, img.height * scale)

  ctx.restore()
}

export default LiquidMetalLogo
