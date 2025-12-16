import type { Metadata } from "next"

// Force dynamic rendering globally for all pages
// This prevents prerendering issues with Button.Icon, function components, and useContext
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { Inter as FontSans } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { cn } from "@/utils/cn"
import { Providers } from "./providers"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const inter = FontSans({subsets:['latin'],variable:'--font-sans'})

const geistMono = localFont({
	src: "./fonts/GeistMono[wght].woff2",
	variable: "--font-geist-mono",
	weight: "100 900",
	display: "swap",
})

export const metadata: Metadata = {
	title: {
		default: "Hypedrive - Influencer Marketing Platform",
		template: "%s | Hypedrive",
	},
	description: "Launch, manage, and scale creator campaigns with automated enrollment tracking, OCR-powered verification, and real-time wallet management.",
	keywords: ["influencer marketing", "creator campaigns", "affiliate marketing", "campaign management"],
	authors: [{ name: "Hypedrive" }],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://hypedrive.in",
		siteName: "Hypedrive",
		title: "Hypedrive - Influencer Marketing Platform",
		description: "Launch, manage, and scale creator campaigns with automated enrollment tracking, OCR-powered verification, and real-time wallet management.",
	},
	twitter: {
		card: "summary_large_image",
		title: "Hypedrive - Influencer Marketing Platform",
		description: "Launch, manage, and scale creator campaigns",
	},
}

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	viewportFit: "cover" as const,
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	// Mocking disabled - removed MSW initialization

	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(inter.variable, geistMono.variable, "antialiased", "bg-bg-weak-50")}
		>
			<body className="text-text-strong-950 font-sans overscroll-none">
				<Providers>{children}</Providers>
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	)
}
