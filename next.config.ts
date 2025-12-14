import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
	// Enable Next.js 16 Cache Components feature
	cacheComponents: true,
	// Transpile solid-primitives packages for Novu compatibility
	transpilePackages: [
		"@solid-primitives/props",
		"@solid-primitives/refs",
		"@solid-primitives/transition-group",
		"solid-motionone",
	],
	// Note: instrumentation.ts is now recognized by default in Next.js 16
	// No need for experimental.instrumentationHook (deprecated)
	experimental: {
		turbopackFileSystemCacheForDev: true,
		// turbopackFileSystemCacheForBuild: true, // Only available in canary version
	},
	// Enable TypeScript type checking during build
	typescript: {
		// Don't ignore TypeScript errors during build
		ignoreBuildErrors: false,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
			{
				protocol: "https",
				hostname: "logo.clearbit.com",
			},
			{
				protocol: "https",
				hostname: "picsum.photos",
			},
			{
				protocol: "https",
				hostname: "loremflickr.com",
			},
			{
				protocol: "https",
				hostname: "*.loremflickr.com",
			},
		],
	},
	// Exclude canvaskit-wasm from server-side bundling
	serverExternalPackages: ["canvaskit-wasm"],
	// Turbopack config to resolve solid-primitives for Novu
	turbopack: {
		resolveAlias: {
			// Point to the package directories - Turbopack will resolve the entry points automatically
			"@solid-primitives/props": path.join(__dirname, "node_modules/@solid-primitives/props"),
			"@solid-primitives/refs": path.join(__dirname, "node_modules/@solid-primitives/refs"),
			"@solid-primitives/transition-group": path.join(__dirname, "node_modules/@solid-primitives/transition-group"),
		},
	},
	webpack: (config, { isServer }) => {
		// Stub out fs and path for client-side builds
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
			}
		}
		// Add resolve aliases for solid-primitives to fix Novu dependency issues
		config.resolve.alias = {
			...config.resolve.alias,
			"@solid-primitives/props": require.resolve("@solid-primitives/props"),
			"@solid-primitives/refs": require.resolve("@solid-primitives/refs"),
			"@solid-primitives/transition-group": require.resolve("@solid-primitives/transition-group"),
		}
		return config
	},
}

export default nextConfig
