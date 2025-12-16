import type { MetadataRoute } from "next"

// Disable static generation for robots
export const dynamic = "force-dynamic"

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/"],
			},
		],
		sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/sitemap.xml`,
	}
}
