import PricingPageClient from "./page-client";
import { Schema } from "@/components/seo/Schema";

export const metadata = {
  title: "Pricing | Buy Text to Speech Credits",
  description:
    "Transparent pricing for VoiceForge AI. Buy text to speech credits with our pay as you go model. Affordable text to speech API with no subscriptions.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function Page() {
  const productSchema = {
    name: "VoiceForge AI Credits",
    description: "Pay-as-you-go text to speech credits for premium AI voices.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "1.00",
      highPrice: "100.00",
      offerCount: "6",
    },
  };

  const faqSchema = {
    mainEntity: [
      {
        "@type": "Question",
        name: "Do credits expire?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Credits never expire — they roll over indefinitely until you use them.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between VoiceForge Free, Pro, and Premium?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "VoiceForge Free: basic voices and free generation. VoiceForge Pro: enhanced quality voices with pay-as-you-go credits. VoiceForge Premium ($2.99/mo): studio-quality voices, voice cloning, custom uploads + professional badge. All paid generations use credits from your wallet.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods are accepted?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We accept all major credit/debit cards via Stripe. No PayPal or crypto at this time.",
        },
      },
    ],
  };

  return (
    <>
      <Schema type="Product" data={productSchema} />
      <Schema type="FAQPage" data={faqSchema} />
      <PricingPageClient />
    </>
  );
}
