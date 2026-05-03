import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/account/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://remixso.com"}/sitemap.xml`,
  };
}
