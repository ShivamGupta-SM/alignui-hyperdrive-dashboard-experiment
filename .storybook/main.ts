import type { StorybookConfig } from "@storybook/react-vite"
import { mergeConfig } from "vite"
import path from "path"

const config: StorybookConfig = {
	stories: [
		"../stories/**/*.mdx",
		"../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
	],
	addons: [
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-links",
		"@storybook/addon-themes",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	staticDirs: ["../public"],
	docs: {},
	typescript: {
		reactDocgen: "react-docgen-typescript",
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			propFilter: (prop) =>
				prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
		},
	},
	viteFinal: async (config) => {
		return mergeConfig(config, {
			esbuild: {
				jsx: "automatic",
			},
			define: {
				"process.env": {},
			},
			resolve: {
				alias: {
					"@": path.resolve(__dirname, "../"),
					"@/components": path.resolve(__dirname, "../components"),
					"@/lib": path.resolve(__dirname, "../lib"),
					"@/hooks": path.resolve(__dirname, "../hooks"),
					"@/utils": path.resolve(__dirname, "../lib/utils"),
					"@/features": path.resolve(__dirname, "../features"),
				},
			},
			css: {
				postcss: path.resolve(__dirname, "../"),
			},
		})
	},
}

export default config
