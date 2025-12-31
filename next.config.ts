import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
		// Modern image formats for better compression
		formats: ["image/avif", "image/webp"],
		// Responsive device sizes
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		// Icon/thumbnail sizes
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
			}
		}
		config.resolve.extensionAlias = {
			".js": [".js", ".ts", ".tsx"],
		}
		return config
	},
}

export default nextConfig
