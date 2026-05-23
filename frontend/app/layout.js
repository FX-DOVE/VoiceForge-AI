import "./globals.css";
import { Providers } from "@/components/providers";
import { Schema } from "@/components/seo/Schema";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voiceforge.ai";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "VoiceForge AI — Natural AI Voices & Voice Cloning",
    template: "%s | VoiceForge AI",
  },
  description:
    "Generate realistic AI voices with our pay-as-you-go text to speech API, multilingual voices, and voice cloning platform.",
  keywords: [
    "AI text to speech",
    "text to speech API",
    "AI voice generator",
    "realistic text to speech",
    "voice cloning software",
    "xAI text to speech",
  ],
  openGraph: {
    title: "VoiceForge AI — Natural AI Voices & Voice Cloning",
    description: "Generate realistic AI voices with our pay-as-you-go text to speech API, multilingual voices, and voice cloning platform.",
    url: baseUrl,
    siteName: "VoiceForge AI",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "VoiceForge AI Text to Speech Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceForge AI — Natural AI Voices",
    description: "Studio-quality text-to-speech and voice cloning.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
    yandex: process.env.YANDEX_VERIFICATION || "",
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
      "p:domain_verify": process.env.PINTEREST_VERIFICATION || "",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-screen">
      <body
        className="h-screen bg-background text-on-surface antialiased font-sans"
      >
        <Providers>
          <Schema
            type="Organization"
            data={{
              name: "VoiceForge AI",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              sameAs: [
                "https://twitter.com/voiceforgeai",
                "https://github.com/voiceforgeai",
              ],
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
