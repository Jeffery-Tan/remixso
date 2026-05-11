import { Container } from "@/components/layout/Container";
import { PRO_MONTHLY_LIMIT } from "@/lib/credit-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using RemixSo — AI content repurposing for solo creators.",
};

export default function TermsPage() {
  return (
    <Container className="py-16 max-w-3xl">
      <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold mb-2 tracking-tight">
        Terms of Service
      </h1>
      <p className="text-sm text-[var(--on-surface-variant)] mb-10">
        Last updated: May 2026
      </p>

      <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[var(--foreground)]">
        <section>
          <h2 className="font-semibold text-lg mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using RemixSo (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service (&quot;Terms&quot;). If you do
            not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            2. Service Description
          </h2>
          <p>
            RemixSo is an AI-powered content repurposing tool. You provide a
            long-form article; we generate platform-adapted posts for X
            (Twitter), LinkedIn, Instagram, email newsletters, TikTok, and
            YouTube Shorts. Features and platform availability may change over
            time.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            3. Account Obligations
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must be at least 16 years old to use the Service.</li>
            <li>
              You are responsible for maintaining the confidentiality of your
              login credentials.
            </li>
            <li>
              You are responsible for all activity that occurs under your
              account.
            </li>
            <li>
              You must provide accurate, current, and complete account
              information.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            4. Free and Paid Plans
          </h2>
          <p>
            <strong>Starter (Free):</strong> includes a limited number of
            generations per month across all supported platforms. Limits are
            published on our pricing page and may change with notice.
          </p>
          <p className="mt-1">
            <strong>RemixSo Pro ($19/month):</strong> includes {PRO_MONTHLY_LIMIT} generations
            per month, URL auto-fetch, unlimited AI refinements, and priority
            access to new features. Billed monthly via Dodo Payments. A 7-day free
            trial is available for new subscribers.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            5. Payment and Billing
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Payments are processed securely through Dodo Payments. We do not store
              full payment card details.
            </li>
            <li>
              Subscriptions auto-renew each month unless cancelled before the
              renewal date.
            </li>
            <li>
              You can cancel anytime from your Account page. Cancellation takes
              effect at the end of the current billing period.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            6. Refund Policy
          </h2>
          <p>
            We do not offer refunds for partial months. If you cancel, you will
            retain access to Pro features until the end of your current billing
            period. If you believe you were charged in error, contact us within
            14 days and we will review your case.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            7. Intellectual Property
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Your content:</strong> You retain all rights to the
              articles, text, and other materials you submit to the Service. We
              claim no ownership over your content.
            </li>
            <li>
              <strong>Generated outputs:</strong> AI-generated posts are yours
              to use. We make no claim to the outputs.
            </li>
            <li>
              <strong>Our IP:</strong> The RemixSo name, logo, website code, and
              underlying technology are our exclusive property.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            8. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              Use the Service to generate spam, disinformation, hate speech, or
              illegal content.
            </li>
            <li>
              Attempt to reverse-engineer, scrape, or disrupt the Service.
            </li>
            <li>Resell or redistribute the Service without authorization.</li>
            <li>
              Use the Service to process content that violates third-party
              rights.
            </li>
          </ul>
          <p className="mt-2">
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            9. Third-Party Services
          </h2>
          <p>
            The Service integrates with third-party platforms (X, LinkedIn,
            Instagram, etc.). We are not responsible for the availability,
            policies, or actions of these third-party services. You are
            responsible for complying with each platform&apos;s terms when
            publishing content.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            10. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, RemixSo is provided
            &quot;as is&quot; without warranties of any kind. We are not liable
            for any indirect, incidental, or consequential damages arising from
            your use of the Service. Our total liability is limited to the
            amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless RemixSo and its operators
            from any claims, damages, or expenses arising from your use of the
            Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">12. Termination</h2>
          <p>
            You may delete your account at any time from your Account settings.
            We may terminate or suspend your account for violation of these
            Terms or for any reason with reasonable notice. Upon termination,
            your data will be handled per our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware,
            United States, without regard to conflict of law principles. Any
            disputes shall be resolved in the courts of Delaware.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">
            14. Changes to Terms
          </h2>
          <p>
            We may update these Terms from time to time. Material changes will
            be communicated via email or in-app notice at least 14 days before
            taking effect. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">15. Contact</h2>
          <p>
            For questions about these Terms, contact us at:
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
