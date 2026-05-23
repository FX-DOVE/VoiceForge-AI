import FaqPageClient from "./page-client";
import { Schema } from "@/components/seo/Schema";

export const metadata = {
  title: "Frequently Asked Questions | VoiceForge AI",
  description:
    "Find answers to the most common questions about VoiceForge AI, our text to speech platform, voice cloning capabilities, billing, and API integration.",
  alternates: {
    canonical: "/faq",
  },
};

export default function Page() {
  const faqSchema = {
    mainEntity: [
      {
        "@type": "Question",
        name: "What is VoiceForge AI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "VoiceForge AI is a cutting-edge platform that leverages advanced artificial intelligence to generate high-quality, natural-sounding synthetic voices for various applications.",
        },
      },
      {
        "@type": "Question",
        name: "What languages are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently, we support over 30 languages including English, Spanish, French, German, Mandarin, and Japanese.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a free trial?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Every new account gets unlimited access to free VoiceForge standard voices at no cost, forever.",
        },
      },
      {
        "@type": "Question",
        name: "How do credits work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Credits power premium VoiceForge TTS generations. Each character costs 2 credits. You purchase credits in any amount from $1 to $100+. Credits never expire — they roll over indefinitely.",
        },
      },
    ],
  };

  return (
    <>
      <Schema type="FAQPage" data={faqSchema} />
      <FaqPageClient />
    </>
  );
}
