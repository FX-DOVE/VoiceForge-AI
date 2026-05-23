import { LegalPageShell, LegalSection } from "@/components/layout/legal-page-shell";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "no-refunds", label: "No Refund Policy" },
  { id: "testing", label: "Testing Requirement" },
  { id: "chargebacks", label: "Chargebacks" },
  { id: "exceptions", label: "Exceptions" },
  { id: "contact", label: "Contact" },
];

export const metadata = {
  title: "Refund Policy — VoiceForge AI",
  description:
    "VoiceForge AI's refund policy. All purchases are final and non-refundable.",
  alternates: {
    canonical: "/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Refund Policy"
      lastUpdated="May 18, 2026"
      sections={SECTIONS}
    >
      <LegalSection id="overview" title="1. Overview">
        <p>
          This Refund Policy outlines the terms and conditions regarding refunds for 
          purchases made on VoiceForge AI. By making a purchase, you acknowledge and 
          agree to this policy.
        </p>
      </LegalSection>

      <LegalSection id="no-refunds" title="2. No Refund Policy">
        <p className="font-semibold text-white">
          All purchases are final. All credit purchases are non-refundable.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>No refunds will be provided under any circumstances.</li>
          <li>No refunds will be issued for dissatisfaction, misunderstandings, technical limitations, or unused credits.</li>
          <li>No refunds will be provided for unused or partially used credit packages.</li>
          <li>No refunds will be provided for features not used or for changes in usage patterns.</li>
          <li>All sales of credits are final and non-refundable.</li>
        </ul>
      </LegalSection>

      <LegalSection id="testing" title="3. Testing Requirement">
        <p>
          Users should thoroughly test the platform using the complimentary credits 
          provided upon signup before purchasing additional credits.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>Every new user receives free trial credits for testing.</li>
          <li>Users are strongly encouraged to test all features thoroughly before making any purchase.</li>
          <li>By making a purchase, you confirm that you have tested the platform and are satisfied with its functionality.</li>
          <li>Free credits have no cash value and cannot be transferred.</li>
        </ul>
        <p className="mt-4 font-semibold text-white">
          All purchases are final and non-refundable. Please use your complimentary 
          credits to test the platform thoroughly before purchasing additional credits.
        </p>
      </LegalSection>

      <LegalSection id="chargebacks" title="4. Chargebacks and Payment Disputes">
        <p>
          Chargebacks or payment disputes are strictly prohibited and may result in 
          immediate account consequences.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>Chargebacks may result in immediate suspension or permanent termination of the account.</li>
          <li>All associated credits (free and paid) may be revoked.</li>
          <li>IP addresses, devices, and payment methods may be blocked.</li>
          <li>Fraudulent activity will be investigated and further action taken where permitted by law.</li>
        </ul>
        <p className="mt-4">
          If you have concerns about a charge, please contact us directly at{" "}
          <a className="text-primary hover:underline" href="mailto:billing@voiceforge.ai">
            billing@voiceforge.ai
          </a>{" "}
          before initiating a chargeback.
        </p>
      </LegalSection>

      <LegalSection id="exceptions" title="5. Exceptions">
        <p>
          In rare circumstances, we may consider exceptions to this policy at our sole discretion.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>Technical errors on our part that prevent delivery of purchased credits.</li>
          <li>Duplicate charges due to system errors.</li>
          <li>Cases required by applicable law.</li>
        </ul>
        <p className="mt-4">
          Any exceptions are granted solely at the discretion of VoiceForge AI and 
          do not establish a precedent for future cases.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="6. Contact">
        <p>
          Questions about this Refund Policy? Email{" "}
          <a className="text-primary hover:underline" href="mailto:billing@voiceforge.ai">
            billing@voiceforge.ai
          </a>{" "}
          or visit our{" "}
          <a className="text-primary hover:underline" href="/contact">
            Contact page
          </a>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
