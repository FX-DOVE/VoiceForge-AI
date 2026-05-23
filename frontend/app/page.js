import LandingPageClient from "./page-client";
import { Schema } from "@/components/seo/Schema";

export const metadata = {
  title: "AI Text to Speech API & Voice Cloning Platform | VoiceForge AI",
  description:
    "Generate realistic AI voices with our pay-as-you-go text to speech API, multilingual voices, and voice cloning platform.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  const websiteSchema = {
    name: "VoiceForge AI",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://voiceforge.ai",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://voiceforge.ai/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareSchema = {
    name: "VoiceForge AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <Schema type="WebSite" data={websiteSchema} />
      <Schema type="SoftwareApplication" data={softwareSchema} />
      <LandingPageClient />
    </>
  );
}
