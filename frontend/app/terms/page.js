import { LegalPageShell, LegalSection } from "@/components/layout/legal-page-shell";

const SECTIONS = [
  { id: "acceptance", label: "Acceptance" },
  { id: "accounts", label: "Accounts" },
  { id: "license", label: "License" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "voice-content", label: "Voice & Content" },
  { id: "fees", label: "Fees & Billing" },
  { id: "termination", label: "Termination" },
  { id: "warranty", label: "Disclaimer & Liability" },
  { id: "law", label: "Governing Law" },
];

export const metadata = {
  title: "Terms of Service — VoiceForge AI",
  description:
    "The terms governing your use of VoiceForge AI's voice generation platform.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated="October 24, 2026"
      sections={SECTIONS}
    >
      <LegalSection id="acceptance" title="1. Acceptance of Terms">
        <p>
          By accessing VoiceForge AI ("the Service") you agree to be bound by
          these Terms of Service ("Terms"). If you do not agree, do not use the
          Service. These Terms apply to all visitors, users, and others who
          access the Service.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="2. Accounts">
        <p>
          You must be at least 13 years old to use the Service, and at least 18
          to clone a voice. You are responsible for safeguarding your account
          credentials and for all activity that occurs under your account.
        </p>
      </LegalSection>

      <LegalSection id="license" title="3. License">
        <p>
          Subject to these Terms and your subscription, we grant you a limited,
          non-exclusive, non-transferable license to use the Service for
          personal or internal business purposes. You retain ownership of audio
          you generate; we retain ownership of the platform, models, and
          stock voices.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="4. Acceptable Use">
        <p>You agree NOT to use the Service to:</p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Impersonate any real person without explicit, verifiable consent.</li>
          <li>Generate fraudulent, defamatory, or harassing content.</li>
          <li>Produce audio for political deepfakes or to spread misinformation.</li>
          <li>Generate sexual content involving real, identifiable persons.</li>
          <li>Reverse-engineer, scrape, or harvest model weights or voice data.</li>
          <li>Resell raw API access without a written reseller agreement.</li>
        </ul>
        <p>
          We reserve the right to remove content and suspend accounts that
          violate these rules.
        </p>
      </LegalSection>

      <LegalSection id="voice-content" title="5. Voice & Content">
        <p>
          You represent that you own, or have written permission to use, every
          voice sample uploaded for cloning. You grant us a limited license to
          process your content solely to operate the Service. Output audio is
          yours to use, subject to applicable law and the rights of any voice
          owner.
        </p>
      </LegalSection>

      <LegalSection id="fees" title="6. Fees & Billing">
        <p>
          Paid plans are billed in advance on a recurring basis (monthly or
          annually). All fees are non-refundable except where required by law
          or our 7-day refund policy for first-time subscribers. We may change
          pricing with 30 days' notice; changes do not apply mid-cycle.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="7. Termination">
        <p>
          You may cancel your subscription at any time from{" "}
          <a className="text-primary hover:underline" href="/billing">Billing</a>.
          We may suspend or terminate access immediately for breach of these
          Terms. Upon termination, your generated audio remains exportable for
          30 days; cloned voice models are deleted within 30 days.
        </p>
      </LegalSection>

      <LegalSection id="warranty" title="8. Disclaimer & Limitation of Liability">
        <p>
          The Service is provided "as is" and "as available" without warranties
          of any kind, express or implied. To the maximum extent permitted by
          law, our aggregate liability arising out of these Terms or the
          Service is limited to the fees you paid in the 12 months preceding
          the claim.
        </p>
      </LegalSection>

      <LegalSection id="law" title="9. Governing Law">
        <p>
          These Terms are governed by the laws of the State of Delaware, USA,
          without regard to conflict-of-laws principles. Disputes will be
          resolved in the state or federal courts located in Wilmington,
          Delaware.
        </p>
        <p className="mt-4">
          Questions? Email{" "}
          <a className="text-primary hover:underline" href="mailto:legal@voiceforge.ai">
            legal@voiceforge.ai
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
