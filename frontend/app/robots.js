export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voiceforge.ai";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/", "/blog/", "/docs/"], // Let bots access public routes
      disallow: [
        "/dashboard/",
        "/dashboard/*",
        "/admin/",
        "/admin/*",
        "/billing/",
        "/billing/*",
        "/settings/",
        "/settings/*",
        "/checkout/",
        "/checkout/*",
        "/auth/",
        "/auth/*",
        "/cloning/",
        "/cloning/*"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
