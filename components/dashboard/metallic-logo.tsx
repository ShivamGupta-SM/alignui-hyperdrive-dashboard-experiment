'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

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

/**
 * Metallic Logo with GSAP-powered liquid chrome effect
 */
export function MetallicLogo({
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  params = {},
}: MetallicLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const defaultParams = {
    speed: 0.3,
    liquid: 0.07,
    ...params,
  }

  useEffect(() => {
    if (!isLoaded || hasError || !svgRef.current) return

    const svg = svgRef.current
    const turbulence = svg.querySelector('#turbulence') as SVGFETurbulenceElement
    const displacement = svg.querySelector('#displacement') as SVGFEDisplacementMapElement
    const light1 = svg.querySelector('#light1') as SVGFEPointLightElement
    const light2 = svg.querySelector('#light2') as SVGFEPointLightElement
    const gradientStops = svg.querySelectorAll('.gradient-stop')

    if (!turbulence || !displacement) return

    const ctx = gsap.context(() => {
      // Turbulence animation for liquid effect
      gsap.to(turbulence, {
        attr: {
          baseFrequency: `${0.015 + defaultParams.liquid * 0.1} ${0.02 + defaultParams.liquid * 0.1}`,
        },
        duration: 3 / defaultParams.speed,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      // Seed animation for variation
      gsap.to(turbulence, {
        attr: { seed: 100 },
        duration: 10 / defaultParams.speed,
        ease: 'none',
        repeat: -1,
        modifiers: {
          seed: (value: string) => Math.floor(Number.parseFloat(value) % 100).toString(),
        },
      })

      // Displacement scale animation
      gsap.to(displacement, {
        attr: { scale: 6 + defaultParams.liquid * 20 },
        duration: 2 / defaultParams.speed,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      })

      // Light animations for dynamic chrome reflections
      if (light1) {
        gsap.to(light1, {
          attr: { x: 200, y: 50 },
          duration: 4 / defaultParams.speed,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      if (light2) {
        gsap.to(light2, {
          attr: { x: 0, y: 150 },
          duration: 3 / defaultParams.speed,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      // Gradient stop animations for flowing chrome
      gradientStops.forEach((stop, index) => {
        gsap.to(stop, {
          attr: {
            offset: `${(index * 25 + 50) % 100}%`,
          },
          duration: (6 + index) / defaultParams.speed,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [isLoaded, hasError, defaultParams.speed, defaultParams.liquid])

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image src={logoPath} alt="Logo" fill className="object-contain" sizes="100px" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* SVG Filter Definitions */}
      <svg
        ref={svgRef}
        className="absolute w-0 h-0 overflow-hidden"
        aria-hidden="true"
      >
        <defs>
          {/* Chrome gradient */}
          <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop className="gradient-stop" offset="0%" stopColor="#fafafa" />
            <stop className="gradient-stop" offset="20%" stopColor="#b8b8b8" />
            <stop className="gradient-stop" offset="40%" stopColor="#e0e0e0" />
            <stop className="gradient-stop" offset="60%" stopColor="#909090" />
            <stop className="gradient-stop" offset="80%" stopColor="#d0d0d0" />
            <stop offset="100%" stopColor="#f5f5f5" />
          </linearGradient>

          {/* Liquid metal filter */}
          <filter id="liquidMetal" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            {/* Turbulence for organic liquid movement */}
            <feTurbulence
              id="turbulence"
              type="fractalNoise"
              baseFrequency="0.012 0.016"
              numOctaves="3"
              seed="5"
              result="noise"
            />

            {/* Displacement for morphing effect */}
            <feDisplacementMap
              id="displacement"
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />

            {/* Blur for smooth surface */}
            <feGaussianBlur in="displaced" stdDeviation="0.3" result="blurred" />

            {/* Specular lighting for chrome shine */}
            <feSpecularLighting
              in="blurred"
              surfaceScale="6"
              specularConstant="1.5"
              specularExponent="30"
              lightingColor="#ffffff"
              result="specular1"
            >
              <fePointLight id="light1" x="100" y="20" z="250" />
            </feSpecularLighting>

            {/* Secondary specular for depth */}
            <feSpecularLighting
              in="blurred"
              surfaceScale="3"
              specularConstant="0.8"
              specularExponent="15"
              lightingColor="#d0e8ff"
              result="specular2"
            >
              <fePointLight id="light2" x="50" y="100" z="150" />
            </feSpecularLighting>

            {/* Diffuse lighting for base metal look */}
            <feDiffuseLighting
              in="blurred"
              surfaceScale="4"
              diffuseConstant="0.9"
              result="diffuse"
            >
              <feDistantLight azimuth="235" elevation="50" />
            </feDiffuseLighting>

            {/* Combine specular highlights */}
            <feComposite
              in="specular1"
              in2="specular2"
              operator="arithmetic"
              k1="0"
              k2="0.6"
              k3="0.4"
              k4="0"
              result="combinedSpecular"
            />

            {/* Combine with diffuse */}
            <feComposite
              in="combinedSpecular"
              in2="diffuse"
              operator="arithmetic"
              k1="0"
              k2="0.7"
              k3="0.5"
              k4="0"
              result="lighting"
            />

            {/* Mask to source alpha */}
            <feComposite in="lighting" in2="SourceAlpha" operator="in" result="masked" />

            {/* Color adjustment for metallic tone */}
            <feColorMatrix
              in="masked"
              type="matrix"
              values="1.1 0.05 0 0 0.05
                      0.05 1.1 0.05 0 0.05
                      0 0.05 1.2 0 0.08
                      0 0 0 1 0"
              result="colored"
            />

            {/* Final output */}
            <feMerge>
              <feMergeNode in="colored" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Logo with liquid metal effect */}
      <div
        className="relative w-full h-full"
        style={{ filter: 'url(#liquidMetal)' }}
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

export default MetallicLogo
