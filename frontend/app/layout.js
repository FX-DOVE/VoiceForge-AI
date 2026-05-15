import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "VoiceForge AI — Natural AI Voices",
  description:
    "Studio-quality text-to-speech and voice cloning for creators and teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-screen overflow-hidden">
      <body
        className={`${inter.variable} ${geist.variable} h-screen overflow-hidden bg-background text-on-surface antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
