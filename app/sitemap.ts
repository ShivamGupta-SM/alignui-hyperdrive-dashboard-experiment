import type { MetadataRoute } from "next"

// Disable static generation for sitemap
export const dynamic = "force-dynamic"

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/dashboard`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
	]
}
