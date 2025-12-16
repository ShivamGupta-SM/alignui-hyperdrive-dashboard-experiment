import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
	// Transpile solid-primitives packages for Novu compatibility
	transpilePackages: [
		"@solid-primitives/props",
		"@solid-primitives/refs",
		"@solid-primitives/transition-group",
		"solid-motionone",
	],
	experimental: {
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},
	output: "standalone",
	typescript: {
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
			{
				protocol: "https",
				hostname: "example.com",
			},
		],
	},
	serverExternalPackages: ["canvaskit-wasm", "react", "react-dom"],
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
			}
		}
		config.resolve.alias = {
			...config.resolve.alias,
			react: path.resolve(__dirname, "node_modules/react"),
			"react-dom": path.resolve(__dirname, "node_modules/react-dom"),
		}
		config.resolve.extensionAlias = {
			".js": [".js", ".ts", ".tsx"],
		}
		return config
	},
}

export default nextConfig
