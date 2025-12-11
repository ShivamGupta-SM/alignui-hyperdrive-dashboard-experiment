'use client'

import { useEffect, useRef, useState } from 'react'

interface WebGLLiquidLogoProps {
  logoPath?: string
  className?: string
  speed?: number
  intensity?: number
}

const vertexShader = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const fragmentShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_time;
uniform float u_intensity;
uniform vec2 u_resolution;

// Simplex noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for(int i = 0; i < 4; i++) {
    sum += amp * snoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = vUv;

  // Sample the logo texture
  vec4 logo = texture(u_texture, uv);

  // Only process non-transparent pixels
  if (logo.a < 0.1) {
    fragColor = vec4(0.0);
    return;
  }

  // Create animated noise for liquid distortion
  float t = u_time * 0.3;
  vec2 noiseCoord = uv * 3.0;
  float noise1 = fbm(noiseCoord + vec2(t, 0.0));
  float noise2 = fbm(noiseCoord + vec2(0.0, t * 0.7));

  // Calculate surface normal from noise (for lighting)
  float eps = 0.01;
  float nx = fbm(noiseCoord + vec2(eps, 0.0) + vec2(t, 0.0)) - fbm(noiseCoord - vec2(eps, 0.0) + vec2(t, 0.0));
  float ny = fbm(noiseCoord + vec2(0.0, eps) + vec2(t, 0.0)) - fbm(noiseCoord - vec2(0.0, eps) + vec2(t, 0.0));
  vec3 normal = normalize(vec3(nx * u_intensity * 2.0, ny * u_intensity * 2.0, 1.0));

  // Light positions (animated)
  vec3 light1Pos = normalize(vec3(sin(t * 1.3) * 0.5, cos(t * 0.9) * 0.3 + 0.5, 1.0));
  vec3 light2Pos = normalize(vec3(cos(t * 0.7) * 0.4 - 0.3, sin(t * 1.1) * 0.4 + 0.3, 0.8));

  // Calculate specular highlights
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir1 = normalize(light1Pos + viewDir);
  vec3 halfDir2 = normalize(light2Pos + viewDir);

  float spec1 = pow(max(dot(normal, halfDir1), 0.0), 60.0);
  float spec2 = pow(max(dot(normal, halfDir2), 0.0), 40.0);

  // Diffuse lighting
  float diff1 = max(dot(normal, light1Pos), 0.0);
  float diff2 = max(dot(normal, light2Pos), 0.0);

  // Chrome gradient colors
  vec3 chromeLight = vec3(0.95, 0.95, 1.0);
  vec3 chromeMid = vec3(0.7, 0.72, 0.78);
  vec3 chromeDark = vec3(0.15, 0.15, 0.18);

  // Create flowing chrome bands
  float flow = uv.x + uv.y + noise1 * 0.3 + t * 0.2;
  float bands = sin(flow * 6.28318 * 2.0) * 0.5 + 0.5;
  bands = smoothstep(0.3, 0.7, bands);

  // Mix chrome colors based on bands and lighting
  vec3 baseChrome = mix(chromeDark, chromeMid, bands);
  baseChrome = mix(baseChrome, chromeLight, diff1 * 0.4 + diff2 * 0.3);

  // Add specular highlights
  baseChrome += chromeLight * spec1 * 1.5;
  baseChrome += vec3(0.8, 0.85, 1.0) * spec2 * 0.8;

  // Add subtle color tint based on position
  vec3 tint = vec3(
    0.02 * sin(uv.x * 3.14159 + t),
    0.02 * cos(uv.y * 3.14159 - t * 0.5),
    0.04 * sin((uv.x + uv.y) * 3.14159 + t * 0.3)
  );
  baseChrome += tint;

  // Edge darkening for depth
  float edge = smoothstep(0.1, 0.3, logo.a);
  baseChrome *= 0.8 + 0.2 * edge;

  // Final color with logo alpha
  fragColor = vec4(clamp(baseChrome, 0.0, 1.0), logo.a);
}`

/**
 * WebGL-based Liquid Metal Logo
 * Creates a realistic chrome/liquid metal effect using WebGL2 shaders
 */
export function WebGLLiquidLogo({
  logoPath = '/images/hypedrive-icon.svg',
  className = '',
  speed = 1,
  intensity = 1,
}: WebGLLiquidLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const animationRef = useRef<number>(0)
  const glRef = useRef<{
    gl: WebGL2RenderingContext | null
    program: WebGLProgram | null
    texture: WebGLTexture | null
  }>({ gl: null, program: null, texture: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    })

    if (!gl) {
      setError('WebGL2 not supported')
      return
    }

    // Compile shaders
    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = gl!.createShader(type)
      if (!shader) return null
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(shader))
        gl!.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(vertexShader, gl.VERTEX_SHADER)
    const fs = compileShader(fragmentShader, gl.FRAGMENT_SHADER)

    if (!vs || !fs) {
      setError('Failed to compile shaders')
      return
    }

    const program = gl.createProgram()
    if (!program) {
      setError('Failed to create program')
      return
    }

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      setError('Failed to link program')
      return
    }

    gl.useProgram(program)

    // Create vertex buffer
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const uniforms = {
      u_texture: gl.getUniformLocation(program, 'u_texture'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_intensity: gl.getUniformLocation(program, 'u_intensity'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
    }

    // Load logo as texture
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const texture = gl.createTexture()
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)

      // Set texture parameters
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.uniform1i(uniforms.u_texture, 0)

      glRef.current = { gl, program, texture }
      setIsLoaded(true)

      // Set canvas size
      const size = Math.max(img.width, img.height, 200)
      canvas.width = size * 2
      canvas.height = size * 2
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.u_intensity, intensity)

      // Enable blending for transparency
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // Animation loop
      let startTime = performance.now()

      function render() {
        if (!gl) return
        const elapsed = (performance.now() - startTime) / 1000 * speed
        gl.uniform1f(uniforms.u_time, elapsed)

        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        animationRef.current = requestAnimationFrame(render)
      }

      render()
    }

    img.onerror = () => {
      setError('Failed to load logo')
    }

    img.src = logoPath

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (glRef.current.texture) gl.deleteTexture(glRef.current.texture)
      if (glRef.current.program) gl.deleteProgram(glRef.current.program)
    }
  }, [logoPath, speed, intensity])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-bg-weak-50 text-text-sub-600 text-paragraph-xs ${className}`}>
        {error}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'crisp-edges' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 rounded-full bg-bg-weak-50 animate-pulse" />
        </div>
      )}
    </div>
  )
}

export default WebGLLiquidLogo
