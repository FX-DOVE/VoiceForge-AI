import { LegalPageShell, LegalSection } from "@/components/layout/legal-page-shell";

const SECTIONS = [
  { id: "acceptance", label: "Acceptance" },
  { id: "free-trial", label: "Free Trial Credits" },
  { id: "no-refund", label: "No Refund Policy" },
  { id: "accounts", label: "Accounts" },
  { id: "license", label: "License" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "voice-cloning", label: "Voice Cloning Disclaimer" },
  { id: "multiple-accounts", label: "Multiple Account Abuse" },
  { id: "voice-content", label: "Voice & Content" },
  { id: "fees", label: "Fees & Billing" },
  { id: "data-protection", label: "Data Protection" },
  { id: "termination", label: "Termination" },
  { id: "warranty", label: "Disclaimer & Liability" },
  { id: "law", label: "Governing Law" },
];

export const metadata = {
  title: "Terms of Service — VoiceForge AI",
  description:
    "The terms governing your use of VoiceForge AI's voice generation platform.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated="May 18, 2026"
      sections={SECTIONS}
    >
      <LegalSection id="acceptance" title="1. Acceptance of Terms">
        <p>
          By accessing VoiceForge AI ("the Service") you agree to be bound by
          these Terms of Service ("Terms"), the Privacy Policy, and the Refund Policy. 
          If you do not agree, do not use the Service. These Terms apply to all visitors, 
          users, and others who access the Service.
        </p>
        <p className="mt-4">
          You must accept these Terms of Service, the Privacy Policy, and the Refund Policy 
          before creating an account and before making any purchase.
        </p>
      </LegalSection>

      <LegalSection id="free-trial" title="2. Free Trial Credits">
        <p>
          Every new user receives complimentary credits for testing the platform upon successful 
          registration. Users are strongly encouraged to test all features thoroughly before making 
          any purchase.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>Free credits have no cash value and cannot be transferred or exchanged.</li>
          <li>Welcome credits are granted once per email address and IP address.</li>
          <li>Creating multiple accounts to obtain additional free credits is strictly prohibited.</li>
          <li>Free credits are provided "as is" for testing purposes only.</li>
        </ul>
      </LegalSection>

      <LegalSection id="no-refund" title="3. No Refund Policy">
        <p className="font-semibold text-white">
          All purchases are final and non-refundable.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>No refunds will be provided under any circumstances, including dissatisfaction, misuse, misunderstanding, or unmet expectations.</li>
          <li>Users must fully test the platform using their free credits before purchasing additional credits.</li>
          <li>All credit purchases are final and non-refundable.</li>
          <li>No refunds will be issued for dissatisfaction, misunderstandings, technical limitations, or unused credits.</li>
          <li>Chargebacks or payment disputes may result in immediate account suspension or permanent termination.</li>
        </ul>
        <p className="mt-4">
          By making a purchase, you acknowledge that you have tested the platform using your 
          complimentary credits and agree that all purchases are final and non-refundable.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="4. Accounts">
        <p>
          You must be at least 13 years old to use the Service, and at least 18
          to clone a voice. You are responsible for safeguarding your account
          credentials and for all activity that occurs under your account.
        </p>
      </LegalSection>

      <LegalSection id="license" title="5. License">
        <p>
          Subject to these Terms and your subscription, we grant you a limited,
          non-exclusive, non-transferable license to use the Service for
          personal or internal business purposes. You retain ownership of audio
          you generate; we retain ownership of the platform, models, and
          stock voices.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="6. Acceptable Use">
        <p>You agree NOT to use the Service to:</p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Impersonate any real person without explicit, verifiable consent.</li>
          <li>Generate fraudulent, defamatory, or harassing content.</li>
          <li>Produce audio for political deepfakes or to spread misinformation.</li>
          <li>Generate sexual content involving real, identifiable persons.</li>
          <li>Reverse-engineer, scrape, or harvest model weights or voice data.</li>
          <li>Resell raw API access without a written reseller agreement.</li>
          <li>Create multiple accounts to obtain additional free credits.</li>
        </ul>
        <p>
          We reserve the right to remove content and suspend accounts that
          violate these rules.
        </p>
      </LegalSection>

      <LegalSection id="voice-cloning" title="7. Voice Cloning Disclaimer">
        <p>
          Exact voice cloning may not always be available depending on plan limitations 
          and technical constraints.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>When exact cloning is unavailable, the system may return the closest matching voice.</li>
          <li>Voice similarity is not guaranteed.</li>
          <li>The quality of cloned voices depends on the quality and length of uploaded samples.</li>
          <li>Technical limitations may prevent perfect voice replication.</li>
        </ul>
        <p className="mt-4">
          By using the voice cloning feature, you acknowledge that exact voice cloning 
          is not guaranteed and results may vary.
        </p>
      </LegalSection>

      <LegalSection id="multiple-accounts" title="8. Multiple Account Abuse">
        <p>
          Creating multiple accounts to obtain additional free credits is strictly prohibited.
        </p>
        <p className="mt-4">If detected, VoiceForge AI may:</p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Suspend or permanently ban all related accounts.</li>
          <li>Revoke all free and paid credits.</li>
          <li>Block IP addresses, devices, and payment methods.</li>
          <li>Investigate fraudulent activity and take further action where permitted by law.</li>
        </ul>
        <p className="mt-4 font-semibold text-white">
          Creating multiple accounts to obtain additional free credits is strictly 
          prohibited and may result in account suspension, credit forfeiture, and permanent bans.
        </p>
      </LegalSection>

      <LegalSection id="voice-content" title="9. Voice & Content">
        <p>
          You represent that you own, or have written permission to use, every
          voice sample uploaded for cloning. You grant us a limited license to
          process your content solely to operate the Service. Output audio is
          yours to use, subject to applicable law and the rights of any voice
          owner.
        </p>
      </LegalSection>

      <LegalSection id="fees" title="10. Fees & Billing">
        <p>
          Paid plans are billed in advance on a recurring basis (monthly or
          annually). All fees are non-refundable except where required by law.
          We may change pricing with 30 days' notice; changes do not apply mid-cycle.
        </p>
        <p className="mt-4 font-semibold text-white">
          All purchases are final and non-refundable. Please use your complimentary 
          credits to test the platform thoroughly before purchasing additional credits.
        </p>
      </LegalSection>

      <LegalSection id="data-protection" title="11. Data Protection">
        <p>
          User information, uploaded files, and account data are stored securely using 
          industry-standard security measures. Access is restricted to authorized systems 
          and personnel only.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>We implement industry-standard technical and organizational safeguards.</li>
          <li>Data is protected from unauthorized access, disclosure, alteration, or destruction.</li>
          <li>Access is restricted to authorized personnel only.</li>
        </ul>
      </LegalSection>

      <LegalSection id="termination" title="12. Termination">
        <p>
          You may cancel your subscription at any time from{" "}
          <a className="text-primary hover:underline" href="/billing">Billing</a>.
          We may suspend or terminate access immediately for breach of these
          Terms. Upon termination, your generated audio remains exportable for
          30 days; cloned voice models are deleted within 30 days.
        </p>
      </LegalSection>

      <LegalSection id="warranty" title="13. Disclaimer & Limitation of Liability">
        <p>
          The Service is provided "as is" and "as available" without warranties
          of any kind, express or implied. To the maximum extent permitted by
          law, our aggregate liability arising out of these Terms or the
          Service is limited to the fees you paid in the 12 months preceding
          the claim.
        </p>
      </LegalSection>

      <LegalSection id="law" title="14. Governing Law">
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
