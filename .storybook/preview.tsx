import type { Preview } from "@storybook/react"
import { withThemeByClassName } from "@storybook/addon-themes"
import React from "react"

// Import global styles
import "../app/globals.css"

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: "light",
			values: [
				{ name: "light", value: "#ffffff" },
				{ name: "dark", value: "#0f172a" },
				{ name: "neutral", value: "#f8fafc" },
			],
		},
		layout: "centered",
		options: {
			storySort: {
				method: "alphabetical",
				order: [
					"Introduction",
					"Getting Started",
					"Primitives",
					[
						"Button",
						"CompactButton",
						"FancyButton",
						"LinkButton",
						"SocialButton",
						"ButtonGroup",
						"Avatar",
						"AvatarGroup",
						"AvatarGroupCompact",
						"Badge",
						"Tag",
						"StatusBadge",
						"Kbd",
						"Skeleton",
						"ProgressBar",
						"ProgressCircle",
						"Stepper",
						"DotStepper",
						"HorizontalStepper",
						"VerticalStepper",
						"FeaturedIcon",
						"FileFormatIcon",
						"AppStoreButtons",
						"AccountSwitcher",
						"*",
					],
					"Forms",
					[
						"Input",
						"Textarea",
						"Select",
						"Checkbox",
						"Radio",
						"Switch",
						"Toggle",
						"Slider",
						"Datepicker",
						"InlineCalendar",
						"ColorPicker",
						"CurrencyInput",
						"DigitInput",
						"PinInput",
						"FileUpload",
						"FileDropzone",
						"Label",
						"*",
					],
					"Data Display",
					[
						"Card",
						"FeaturedCard",
						"MeetingCard",
						"Table",
						"DataTable",
						"List",
						"BarList",
						"Metric",
						"Charts",
						"SparkChart",
						"CategoryBar",
						"DeltaBar",
						"Legend",
						"Tracker",
						"VirtualizedList",
						"*",
					],
					"Feedback",
					[
						"Alert",
						"Callout",
						"Hint",
						"Notification",
						"EmptyState",
						"LoadingIndicator",
						"*",
					],
					"Layout",
					[
						"Modal",
						"Drawer",
						"SidePanel",
						"BottomSheet",
						"Popover",
						"Dropdown",
						"Tooltip",
						"Accordion",
						"Divider",
						"Grid",
						"Carousel",
						"Fade",
						"*",
					],
					"Navigation",
					[
						"Breadcrumb",
						"Pagination",
						"PaginationDots",
						"TabMenuHorizontal",
						"TabMenuVertical",
						"SidebarNavigation",
						"SlideoutMenu",
						"CommandMenu",
						"BackButton",
						"*",
					],
					"Branding",
					[
						"Logo",
						"Illustrations",
						"BackgroundPatterns",
						"PaymentIcons",
						"SocialIcons",
						"*",
					],
					"*",
				],
			},
		},
	},
	decorators: [
		withThemeByClassName({
			themes: {
				light: "",
				dark: "dark",
			},
			defaultTheme: "light",
		}),
		(Story) => (
			<div className="font-sans antialiased">
				<Story />
			</div>
		),
	],
	tags: ["autodocs"],
}

export default preview
