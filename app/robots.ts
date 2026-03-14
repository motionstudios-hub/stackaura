import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/contact", "/privacy", "/terms", "/docs"],
        disallow: ["/dashboard"],
      },
    ],
    sitemap: "https://stackaura.co.za/sitemap.xml",
  };
}