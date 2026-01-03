import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: "2mb",
		},
		// Enable optimized imports for large libraries
		optimizePackageImports: [
			"@phosphor-icons/react",
			"@radix-ui/react-accordion",
			"@radix-ui/react-avatar",
			"@radix-ui/react-checkbox",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-label",
			"@radix-ui/react-popover",
			"@radix-ui/react-progress",
			"@radix-ui/react-radio-group",
			"@radix-ui/react-scroll-area",
			"@radix-ui/react-select",
			"@radix-ui/react-separator",
			"@radix-ui/react-slider",
			"@radix-ui/react-slot",
			"@radix-ui/react-switch",
			"@radix-ui/react-tabs",
			"@radix-ui/react-toast",
			"@radix-ui/react-tooltip",
			"@radix-ui/react-visually-hidden",
			"react-aria-components",
			"recharts",
			"date-fns",
			"@tanstack/react-query",
			"@tanstack/react-table",
			"react-day-picker",
			"usehooks-ts",
		],
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
