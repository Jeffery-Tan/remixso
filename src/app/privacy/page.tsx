import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RemixSo collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-16 max-w-3xl">
      <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold mb-2 tracking-tight">
        Privacy Policy
      </h1>
      <p className="text-sm text-[var(--on-surface-variant)] mb-10">
        Last updated: May 2026
      </p>

      <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[var(--foreground)]">
        <section>
          <h2 className="font-semibold text-lg mb-2">1. Who We Are</h2>
          <p>
            RemixSo (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            provides an AI-powered content repurposing service. We are committed
            to protecting your privacy and handling your data transparently.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            2. What Data We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Account data:</strong> email address, name (if provided),
              and authentication credentials managed by Supabase Auth.
            </li>
            <li>
              <strong>Content data:</strong> articles, blog posts, and text you
              submit for AI processing, plus the AI-generated outputs.
            </li>
            <li>
              <strong>Payment data:</strong> billing information is collected and
              processed entirely by Dodo Payments. We do not store full credit card
              numbers on our servers.
            </li>
            <li>
              <strong>Usage data:</strong> how many generations you&apos;ve used
              in a billing period, and anonymous analytics via Vercel.
            </li>
            <li>
              <strong>Technical data:</strong> browser type, device information,
              and IP address (collected automatically by our hosting provider).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            3. How We Use Your Data
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide the content repurposing service.</li>
            <li>
              To analyze your writing style so AI outputs match your voice.
            </li>
            <li>To manage your account and subscription.</li>
            <li>To send transactional emails (e.g., billing receipts).</li>
            <li>
              To improve the service through aggregated, anonymous analytics.
            </li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> use your content to train AI models, and
            we do <strong>not</strong> sell your data.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            4. Third-Party Sub-processors
          </h2>
          <p>We rely on the following services to operate:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              <strong>Supabase</strong> — database, authentication, and file
              storage (GDPR compliant, data hosted in EU or US regions).
            </li>
            <li>
              <strong>Dodo Payments</strong> — payment processing (PCI DSS Level 1
              certified, data hosted in the US).
            </li>
            <li>
              <strong>DeepSeek</strong> — AI content generation. The text content
              you submit for repurposing is transmitted to DeepSeek&apos;s API for
              processing. DeepSeek&apos;s servers and legal entity are based in the
              People&apos;s Republic of China. DeepSeek does not use data submitted
              via API for model training. Data transmitted to DeepSeek is
              processed in real-time and is not stored by DeepSeek beyond the
              duration of the API request. We have executed Standard Contractual
              Clauses (SCCs) to ensure adequate data protection safeguards for
              this cross-border transfer, in compliance with GDPR Article 46.
            </li>
            <li>
              <strong>Vercel</strong> — hosting and edge functions (data hosted
              in the US region).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">5. Cookies</h2>
          <p>
            We use only functional cookies required for authentication (Supabase
            Auth session tokens) and payment processing (Dodo Payments). We do not use
            advertising or tracking cookies. See our cookie banner for details.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">6. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Active accounts:</strong> data is retained as long as your
              account remains active.
            </li>
            <li>
              <strong>Deleted accounts:</strong> all personal data, content, and
              generations are permanently deleted within 30 days. Anonymized
              aggregate statistics may be retained.
            </li>
            <li>
              <strong>Payment records:</strong> retained for the minimum period
              required by applicable tax law (typically 7 years in the US).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">7. Your Rights</h2>
          <p>
            Depending on your location, you may have the following rights under
            GDPR, CCPA, or equivalent laws:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              <strong>Access:</strong> request a copy of your personal data.
            </li>
            <li>
              <strong>Rectification:</strong> correct inaccurate data.
            </li>
            <li>
              <strong>Erasure:</strong> delete your account and all associated
              data (available directly in your Account settings).
            </li>
            <li>
              <strong>Portability:</strong> receive your data in a
              machine-readable format.
            </li>
            <li>
              <strong>Objection:</strong> object to certain processing
              activities.
            </li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email us at the address below. We
            will respond within 30 days as required by law.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            8. International Data Transfers
          </h2>
          <p>
            Our service infrastructure is hosted in the United States. If you are
            located outside the US, your account data, usage data, and payment
            data will be transferred to and processed in the US.
          </p>
          <p className="mt-2">
            In addition, the text content you submit for AI repurposing is
            transmitted to DeepSeek&apos;s API, which is operated by a company
            based in the People&apos;s Republic of China. This transfer is
            protected by Standard Contractual Clauses (SCCs) in compliance with
            GDPR Article 46. DeepSeek processes your content solely for the
            purpose of generating AI outputs in real-time and does not retain
            your data after the request completes.
          </p>
          <p className="mt-2">
            Where applicable, we ensure adequate safeguards for all
            international data transfers through Standard Contractual Clauses
            (SCCs), data processing agreements with each sub-processor, and
            data minimization practices.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            9. Children&apos;s Privacy
          </h2>
          <p>
            RemixSo is not intended for anyone under the age of 16. We do not
            knowingly collect data from children. If you believe a child has
            provided us with personal data, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. Material changes will
            be communicated via email or in-app notice. Continued use after
            changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">11. Contact</h2>
          <p>
            For privacy-related inquiries, data requests, or to exercise your
            rights:
            <br />
            Email:{" "}
            <a
              href="mailto:jeffwgr@gmail.com"
              className="text-[var(--primary)] underline"
            >
              jeffwgr@gmail.com
            </a>
          </p>
        </section>
      </div>
    </Container>
  );
}
