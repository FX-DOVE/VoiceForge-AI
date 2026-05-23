export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voiceforge.ai";

  const routes = [
    "",
    "/pricing",
    "/features",
    "/faq",
    "/voices",
    "/voice-cloning",
    "/api",
    "/blog",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" || route === "/blog" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
