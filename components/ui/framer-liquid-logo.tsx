'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useSpring } from 'framer-motion'
import Image from 'next/image'

interface FramerLiquidLogoProps {
  logoPath?: string
  className?: string
  speed?: number
  intensity?: number
}

/**
 * Framer Motion Liquid Metal Logo
 * Creates a chrome/liquid metal effect using Framer Motion animations
 * with multiple gradient layers and dynamic lighting
 */
export function FramerLiquidLogo({
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  speed = 1,
  intensity = 1,
}: FramerLiquidLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Motion values for animation
  const time = useMotionValue(0)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  // Smooth mouse following
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  // Animated gradient positions
  const gradientX = useTransform(time, [0, 1], [0, 360])
  const gradientY = useTransform(time, [0, 1], [0, 180])

  // Light positions based on time and mouse
  const light1X = useTransform([time, smoothX], ([t, mx]: number[]) =>
    20 + Math.sin(t * Math.PI * 2) * 30 * intensity + (mx - 0.5) * 40
  )
  const light1Y = useTransform([time, smoothY], ([t, my]: number[]) =>
    20 + Math.cos(t * Math.PI * 2 * 0.7) * 20 * intensity + (my - 0.5) * 30
  )
  const light2X = useTransform(time, (t) =>
    80 + Math.cos(t * Math.PI * 2 * 0.8) * 25 * intensity
  )
  const light2Y = useTransform(time, (t) =>
    70 + Math.sin(t * Math.PI * 2 * 1.1) * 25 * intensity
  )

  // Hue rotation for rainbow chrome effect
  const hueRotate = useTransform(time, [0, 1], [0, 20])

  // Wave distortion values
  const waveOffset1 = useTransform(time, (t) => Math.sin(t * Math.PI * 4) * 2 * intensity)
  const waveOffset2 = useTransform(time, (t) => Math.cos(t * Math.PI * 3) * 2 * intensity)

  useEffect(() => {
    // Continuous time animation
    const controls = animate(time, 1, {
      duration: 6 / speed,
      repeat: Infinity,
      ease: 'linear',
    })

    return () => controls.stop()
  }, [time, speed])

  // Mouse tracking
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    }

    const handleMouseLeave = () => {
      mouseX.set(0.5)
      mouseY.set(0.5)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [mouseX, mouseY])

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image src={logoPath} alt="Logo" fill className="object-contain" sizes="100px" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden SVG definitions */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Main chrome gradient */}
          <motion.linearGradient
            id="chromeGradientFramer"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientTransform={useTransform(gradientX, (x) => `rotate(${x})`)}
          >
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="15%" stopColor="#d4d4d8" />
            <stop offset="30%" stopColor="#a1a1aa" />
            <stop offset="45%" stopColor="#e4e4e7" />
            <stop offset="60%" stopColor="#71717a" />
            <stop offset="75%" stopColor="#d4d4d8" />
            <stop offset="90%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#f4f4f5" />
          </motion.linearGradient>

          {/* Specular highlight gradient */}
          <motion.radialGradient
            id="specularHighlight1"
            cx={useTransform(light1X, (x) => `${x}%`)}
            cy={useTransform(light1Y, (y) => `${y}%`)}
            r="40%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="70%" stopColor="rgba(200,200,220,0.1)" />
            <stop offset="100%" stopColor="rgba(150,150,170,0)" />
          </motion.radialGradient>

          {/* Secondary specular */}
          <motion.radialGradient
            id="specularHighlight2"
            cx={useTransform(light2X, (x) => `${x}%`)}
            cy={useTransform(light2Y, (y) => `${y}%`)}
            r="30%"
          >
            <stop offset="0%" stopColor="rgba(200,210,255,0.7)" />
            <stop offset="40%" stopColor="rgba(180,190,220,0.2)" />
            <stop offset="100%" stopColor="rgba(150,160,200,0)" />
          </motion.radialGradient>

          {/* Liquid distortion filter */}
          <filter id="liquidDistortFramer" x="-20%" y="-20%" width="140%" height="140%">
            <motion.feTurbulence
              type="fractalNoise"
              baseFrequency={useTransform(time, (t) =>
                `${0.01 + Math.sin(t * Math.PI * 2) * 0.003 * intensity} ${0.015 + Math.cos(t * Math.PI * 2) * 0.003 * intensity}`
              )}
              numOctaves="3"
              seed="42"
              result="noise"
            />
            <motion.feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={useTransform(time, (t) => 3 + Math.sin(t * Math.PI * 4) * 2 * intensity)}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.3" result="smooth" />
            <feComposite in="smooth" in2="SourceAlpha" operator="in" />
          </filter>

          {/* Chrome bevel filter */}
          <filter id="chromeBevel" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="5"
              specularConstant="1.2"
              specularExponent="20"
              lightingColor="#ffffff"
              result="specular"
            >
              <fePointLight x="100" y="50" z="200" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>
      </svg>

      {/* Main logo container with liquid effect */}
      <motion.div
        className="relative w-full h-full"
        style={{
          filter: 'url(#liquidDistortFramer)',
        }}
      >
        {/* Base chrome layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #fafafa 0%, #a1a1aa 25%, #e4e4e7 50%, #71717a 75%, #d4d4d8 100%)',
            backgroundSize: '200% 200%',
            maskImage: `url(${logoPath})`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url(${logoPath})`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 8 / speed,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Flowing bands layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent 0px, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px, transparent 20px, transparent 30px, rgba(0,0,0,0.05) 30px, rgba(0,0,0,0.05) 40px)',
            backgroundSize: '100% 100%',
            mixBlendMode: 'overlay',
            maskImage: `url(${logoPath})`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url(${logoPath})`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '80px 80px'],
          }}
          transition={{
            duration: 4 / speed,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Specular highlight overlay 1 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at var(--light-x) var(--light-y), rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 20%, transparent 50%)',
            mixBlendMode: 'overlay',
            maskImage: `url(${logoPath})`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url(${logoPath})`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            '--light-x': useTransform(light1X, (x) => `${x}%`),
            '--light-y': useTransform(light1Y, (y) => `${y}%`),
          } as unknown as React.CSSProperties}
        />

        {/* Specular highlight overlay 2 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at var(--light-x) var(--light-y), rgba(200,220,255,0.6) 0%, rgba(180,200,240,0.2) 25%, transparent 45%)',
            mixBlendMode: 'overlay',
            maskImage: `url(${logoPath})`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url(${logoPath})`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            '--light-x': useTransform(light2X, (x) => `${x}%`),
            '--light-y': useTransform(light2Y, (y) => `${y}%`),
          } as unknown as React.CSSProperties}
        />

        {/* Shadow/depth layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
            mixBlendMode: 'multiply',
            maskImage: `url(${logoPath})`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url(${logoPath})`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />

        {/* Actual logo for loading detection */}
        <Image
          src={logoPath}
          alt="Logo"
          fill
          className="object-contain opacity-0"
          sizes="200px"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          priority
        />
      </motion.div>

      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="size-8 rounded-full bg-bg-weak-50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  )
}

export default FramerLiquidLogo
