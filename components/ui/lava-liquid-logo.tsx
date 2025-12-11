'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface LavaLiquidLogoProps {
  logoPath?: string
  className?: string
  speed?: number
  intensity?: number
  primaryColor?: string
  secondaryColor?: string
}

/**
 * Airbnb Lava Lamp Style Liquid Metal Logo
 * Inspired by Airbnb's famous lava lamp loading animation
 * Creates smooth, organic metaball-like movements with chrome finish
 */
export function LavaLiquidLogo({
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  speed = 1,
  intensity = 1,
  primaryColor = '#e0e0e0',
  secondaryColor = '#808080',
}: LavaLiquidLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const animationRef = useRef<number>(0)
  const logoImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Set canvas size
    const size = 400
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    // Load logo image
    const logoImg = new window.Image()
    logoImg.crossOrigin = 'anonymous'

    logoImg.onload = () => {
      logoImageRef.current = logoImg
      setIsLoaded(true)
    }

    logoImg.onerror = () => {
      setHasError(true)
    }

    logoImg.src = logoPath

    // Metaball/Lava blob class
    class Blob {
      x: number
      y: number
      radius: number
      xSpeed: number
      ySpeed: number
      angle: number
      angleSpeed: number

      constructor(x: number, y: number, radius: number) {
        this.x = x
        this.y = y
        this.radius = radius
        this.xSpeed = (Math.random() - 0.5) * 2 * speed
        this.ySpeed = (Math.random() - 0.5) * 2 * speed
        this.angle = Math.random() * Math.PI * 2
        this.angleSpeed = (Math.random() - 0.5) * 0.02 * speed
      }

      update(centerX: number, centerY: number, maxRadius: number) {
        // Orbital movement around center
        this.angle += this.angleSpeed

        // Add some organic wobble
        this.x += this.xSpeed * 0.5
        this.y += this.ySpeed * 0.5

        // Keep within bounds with smooth bounce
        const dist = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2)
        if (dist > maxRadius - this.radius) {
          const angle = Math.atan2(this.y - centerY, this.x - centerX)
          this.x = centerX + Math.cos(angle) * (maxRadius - this.radius)
          this.y = centerY + Math.sin(angle) * (maxRadius - this.radius)
          this.xSpeed *= -0.8
          this.ySpeed *= -0.8
        }

        // Random direction changes
        if (Math.random() < 0.02) {
          this.xSpeed += (Math.random() - 0.5) * 0.5 * speed
          this.ySpeed += (Math.random() - 0.5) * 0.5 * speed
        }

        // Limit speed
        const maxSpeed = 2 * speed
        this.xSpeed = Math.max(-maxSpeed, Math.min(maxSpeed, this.xSpeed))
        this.ySpeed = Math.max(-maxSpeed, Math.min(maxSpeed, this.ySpeed))
      }
    }

    // Create blobs
    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = size * 0.35
    const blobs: Blob[] = []

    // Main center blob
    blobs.push(new Blob(centerX, centerY, 60 * intensity))

    // Orbiting blobs
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const r = 40 + Math.random() * 40
      const blobRadius = 25 + Math.random() * 25 * intensity
      blobs.push(
        new Blob(
          centerX + Math.cos(angle) * r,
          centerY + Math.sin(angle) * r,
          blobRadius
        )
      )
    }

    // Smaller accent blobs
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 20 + Math.random() * 60
      blobs.push(
        new Blob(
          centerX + Math.cos(angle) * r,
          centerY + Math.sin(angle) * r,
          15 + Math.random() * 15 * intensity
        )
      )
    }

    // Metaball field function
    function calculateField(x: number, y: number): number {
      let sum = 0
      for (const blob of blobs) {
        const dx = x - blob.x
        const dy = y - blob.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        // Metaball formula: r^2 / d^2
        sum += (blob.radius * blob.radius) / (dist * dist + 1)
      }
      return sum
    }

    // Gradient for chrome effect based on field value and position
    function getColor(fieldValue: number, x: number, y: number, time: number): [number, number, number, number] {
      const threshold = 1.0
      if (fieldValue < threshold) {
        return [0, 0, 0, 0]
      }

      // Normalize field value
      const normalizedField = Math.min((fieldValue - threshold) / 2, 1)

      // Create chrome gradient based on position and time
      const angle = Math.atan2(y - centerY, x - centerX)
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)

      // Flowing chrome bands
      const flow = angle + dist * 0.02 + time * 0.5
      const bands = Math.sin(flow * 3) * 0.5 + 0.5

      // Light simulation
      const lightAngle = time * 0.3
      const lightX = centerX + Math.cos(lightAngle) * 50
      const lightY = centerY + Math.sin(lightAngle * 0.7) * 50
      const lightDist = Math.sqrt((x - lightX) ** 2 + (y - lightY) ** 2)
      const highlight = Math.max(0, 1 - lightDist / 80) ** 2

      // Second light
      const light2X = centerX + Math.cos(lightAngle + Math.PI) * 60
      const light2Y = centerY + Math.sin(lightAngle * 0.5 + Math.PI) * 60
      const light2Dist = Math.sqrt((x - light2X) ** 2 + (y - light2Y) ** 2)
      const highlight2 = Math.max(0, 1 - light2Dist / 100) ** 2

      // Chrome base colors
      const dark = 40
      const mid = 160
      const light = 245

      // Mix colors based on bands and highlights
      let r = dark + (mid - dark) * bands + (light - mid) * highlight + 50 * highlight2
      let g = dark + (mid - dark) * bands + (light - mid) * highlight + 60 * highlight2
      let b = dark + 10 + (mid - dark) * bands + (light - mid) * highlight + 80 * highlight2

      // Add subtle color tint
      r += Math.sin(time + angle) * 5
      g += Math.cos(time * 0.7 + angle) * 5
      b += Math.sin(time * 0.5 + angle * 2) * 10

      // Edge glow
      const edgeFactor = Math.pow(normalizedField, 0.5)
      r = r * edgeFactor + light * (1 - edgeFactor) * 0.3
      g = g * edgeFactor + light * (1 - edgeFactor) * 0.3
      b = b * edgeFactor + light * (1 - edgeFactor) * 0.4

      return [
        Math.min(255, Math.max(0, r)),
        Math.min(255, Math.max(0, g)),
        Math.min(255, Math.max(0, b)),
        255 * normalizedField
      ]
    }

    let startTime = performance.now()

    function render() {
      if (!ctx || !canvas) return

      const time = ((performance.now() - startTime) / 1000) * speed

      // Update blobs
      for (const blob of blobs) {
        blob.update(centerX, centerY, maxRadius)
      }

      // Clear canvas
      ctx.clearRect(0, 0, size, size)

      // Create image data for pixel manipulation
      const imageData = ctx.createImageData(size, size)
      const data = imageData.data

      // Calculate metaball field and color for each pixel
      const step = 2 // Render at half resolution for performance
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const fieldValue = calculateField(x, y)
          const [r, g, b, a] = getColor(fieldValue, x, y, time)

          // Fill the step x step block
          for (let dy = 0; dy < step && y + dy < size; dy++) {
            for (let dx = 0; dx < step && x + dx < size; dx++) {
              const idx = ((y + dy) * size + (x + dx)) * 4
              data[idx] = r
              data[idx + 1] = g
              data[idx + 2] = b
              data[idx + 3] = a
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)

      // Apply gaussian blur for smooth edges
      ctx.filter = 'blur(2px)'
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'

      // Mask with logo if loaded
      if (logoImageRef.current) {
        ctx.globalCompositeOperation = 'destination-in'
        const logoSize = size * 0.7
        const logoX = (size - logoSize) / 2
        const logoY = (size - logoSize) / 2
        ctx.drawImage(logoImageRef.current, logoX, logoY, logoSize, logoSize)
        ctx.globalCompositeOperation = 'source-over'
      }

      animationRef.current = requestAnimationFrame(render)
    }

    // Start animation when logo is loaded
    const checkAndStart = () => {
      if (logoImageRef.current) {
        render()
      } else {
        requestAnimationFrame(checkAndStart)
      }
    }
    checkAndStart()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [logoPath, speed, intensity, primaryColor, secondaryColor])

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image src={logoPath} alt="Logo" fill className="object-contain" sizes="100px" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'auto' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 rounded-full bg-bg-weak-50 animate-pulse" />
        </div>
      )}
    </div>
  )
}

export default LavaLiquidLogo
