'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkle, Drop, Cube, Lightning } from '@phosphor-icons/react'
import * as Button from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { LavaLiquidLogo } from '@/components/ui/lava-liquid-logo'
import { LiquidMetalLogo } from '@/components/ui/liquid-metal-logo'
import { WebGLLiquidLogo } from '@/components/ui/webgl-liquid-logo'

export default function DemoPage() {
  const [speed, setSpeed] = useState(1)
  const [intensity, setIntensity] = useState(1)

  return (
    <main className="min-h-screen bg-bg-weak-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-white-0/90 backdrop-blur-xl border-b border-stroke-soft-200">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button.Root variant="ghost" size="small" asChild>
                <Link href="/v1">
                  <Button.Icon as={ArrowLeft} />
                  Back
                </Link>
              </Button.Root>
              <div className="h-6 w-px bg-stroke-soft-200" />
              <Logo width={100} height={22} />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-primary-lighter px-4 py-1.5">
              <Sparkle weight="fill" className="size-4 text-primary-base" />
              <span className="text-label-xs font-medium text-primary-dark">Liquid Metal Demos</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-title-h2 text-text-strong-950 mb-4">
            Liquid Metal Logo Effects
          </h1>
          <p className="text-paragraph-lg text-text-sub-600 max-w-2xl mx-auto">
            Three different implementations of liquid chrome/metal logo effects using various web technologies.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-bg-white-0 rounded-2xl p-6 shadow-custom-sm ring-1 ring-stroke-soft-200 mb-8">
          <h2 className="text-label-md text-text-strong-950 mb-4">Animation Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-label-sm text-text-sub-600">Speed</label>
                <span className="text-paragraph-sm text-text-strong-950 font-medium">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-bg-soft-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-label-sm text-text-sub-600">Intensity</label>
                <span className="text-paragraph-sm text-text-strong-950 font-medium">{intensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-bg-soft-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Lava Lamp / Airbnb Style */}
          <div className="bg-bg-white-0 rounded-2xl p-8 shadow-custom-md ring-1 ring-stroke-soft-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-error-lighter text-error-base">
                <Drop weight="duotone" className="size-6" />
              </div>
              <div>
                <h3 className="text-label-lg text-text-strong-950">Lava Lamp (Airbnb Style)</h3>
                <p className="text-paragraph-sm text-text-sub-600 mt-1">
                  Metaball physics with chrome finish
                </p>
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-64 mx-auto rounded-xl bg-gradient-to-br from-bg-weak-50 to-bg-soft-200 flex items-center justify-center overflow-hidden">
              <LavaLiquidLogo
                className="size-48"
                speed={speed}
                intensity={intensity}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {['Canvas 2D', 'Metaballs', 'Pixel Manipulation'].map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-bg-weak-50 text-paragraph-xs text-text-sub-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* WebGL Shaders */}
          <div className="bg-bg-white-0 rounded-2xl p-8 shadow-custom-md ring-1 ring-stroke-soft-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-success-lighter text-success-base">
                <Cube weight="duotone" className="size-6" />
              </div>
              <div>
                <h3 className="text-label-lg text-text-strong-950">WebGL Shaders</h3>
                <p className="text-paragraph-sm text-text-sub-600 mt-1">
                  GPU-accelerated GLSL shaders
                </p>
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-64 mx-auto rounded-xl bg-gradient-to-br from-bg-weak-50 to-bg-soft-200 flex items-center justify-center overflow-hidden">
              <WebGLLiquidLogo
                className="size-48"
                speed={speed}
                intensity={intensity}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {['WebGL2', 'GLSL', 'Simplex Noise', 'FBM'].map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-bg-weak-50 text-paragraph-xs text-text-sub-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* GSAP + SVG */}
          <div className="bg-bg-white-0 rounded-2xl p-8 shadow-custom-md ring-1 ring-stroke-soft-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-information-lighter text-information-base">
                <Lightning weight="duotone" className="size-6" />
              </div>
              <div>
                <h3 className="text-label-lg text-text-strong-950">GSAP + SVG Filters</h3>
                <p className="text-paragraph-sm text-text-sub-600 mt-1">
                  Animated SVG filter effects
                </p>
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-64 mx-auto rounded-xl bg-gradient-to-br from-bg-weak-50 to-bg-soft-200 flex items-center justify-center overflow-hidden">
              <LiquidMetalLogo
                className="size-48"
                speed={speed}
                intensity={intensity}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {['GSAP', 'SVG Filters', 'feSpecularLighting', 'feTurbulence'].map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-bg-weak-50 text-paragraph-xs text-text-sub-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Comparison Table */}
        <div className="bg-bg-white-0 rounded-2xl p-6 shadow-custom-sm ring-1 ring-stroke-soft-200 mb-8 overflow-x-auto">
          <h2 className="text-label-lg text-text-strong-950 mb-4">Implementation Comparison</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stroke-soft-200">
                <th className="py-3 px-4 text-label-sm text-text-sub-600">Implementation</th>
                <th className="py-3 px-4 text-label-sm text-text-sub-600">Technology</th>
                <th className="py-3 px-4 text-label-sm text-text-sub-600">Performance</th>
                <th className="py-3 px-4 text-label-sm text-text-sub-600">Bundle Size</th>
                <th className="py-3 px-4 text-label-sm text-text-sub-600">Browser Support</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stroke-soft-200">
                <td className="py-3 px-4 text-paragraph-sm text-text-strong-950">Lava Lamp</td>
                <td className="py-3 px-4 text-paragraph-sm text-text-sub-600">Canvas 2D</td>
                <td className="py-3 px-4"><span className="text-success-base">Excellent</span></td>
                <td className="py-3 px-4 text-paragraph-sm text-text-sub-600">~3KB</td>
                <td className="py-3 px-4"><span className="text-success-base">Universal</span></td>
              </tr>
              <tr className="border-b border-stroke-soft-200">
                <td className="py-3 px-4 text-paragraph-sm text-text-strong-950">WebGL Shaders</td>
                <td className="py-3 px-4 text-paragraph-sm text-text-sub-600">WebGL2 + GLSL</td>
                <td className="py-3 px-4"><span className="text-success-base">Excellent</span></td>
                <td className="py-3 px-4 text-paragraph-sm text-text-sub-600">~5KB</td>
                <td className="py-3 px-4"><span className="text-warning-base">Modern only</span></td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-paragraph-sm text-text-strong-950">GSAP + SVG</td>
                <td className="py-3 px-4 text-paragraph-sm text-text-sub-600">SVG Filters</td>
                <td className="py-3 px-4"><span className="text-warning-base">Good</span></td>
                <td className="py-3 px-4 text-paragraph-sm text-text-sub-600">~60KB (lib)</td>
                <td className="py-3 px-4"><span className="text-success-base">Excellent</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Technical Details */}
        <div className="bg-bg-white-0 rounded-2xl p-6 shadow-custom-sm ring-1 ring-stroke-soft-200">
          <h2 className="text-label-lg text-text-strong-950 mb-4">How They Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-label-md text-text-strong-950 mb-2">Lava Lamp (Canvas 2D)</h3>
              <p className="text-paragraph-sm text-text-sub-600">
                Uses the metaball formula (r²/d²) to create organic blob merging. 11 blobs with orbital motion and random wobble create the signature lava lamp effect.
              </p>
            </div>
            <div>
              <h3 className="text-label-md text-text-strong-950 mb-2">WebGL Shaders</h3>
              <p className="text-paragraph-sm text-text-sub-600">
                Pure GLSL fragment shaders with simplex noise and FBM for liquid distortion. GPU-accelerated for smooth 60fps performance.
              </p>
            </div>
            <div>
              <h3 className="text-label-md text-text-strong-950 mb-2">GSAP + SVG Filters</h3>
              <p className="text-paragraph-sm text-text-sub-600">
                Animates SVG filter primitives (feSpecularLighting, feDiffuseLighting) with GSAP timelines for dynamic chrome highlights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stroke-soft-200 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-paragraph-sm text-text-sub-600">
            Visit <Link href="/v1" className="text-primary-base hover:underline">/v1</Link> to see the logo in action on the marketing page.
          </p>
        </div>
      </footer>
    </main>
  )
}
