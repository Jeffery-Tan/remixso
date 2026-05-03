import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Details about the cookies used by RemixSo and how we use them.",
};

export default function CookiePolicyPage() {
  return (
    <Container className="py-16 max-w-3xl">
      <h1 className="font-[family-name:var(--font-headline)] text-3xl font-bold mb-2 tracking-tight">
        Cookie Policy
      </h1>
      <p className="text-sm text-[var(--on-surface-variant)] mb-10">
        Last updated: May 2026
      </p>

      <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-[var(--foreground)]">
        <section>
          <h2 className="font-semibold text-lg mb-2">1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help the site remember your preferences and enable
            core functionality like authentication.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">2. Cookies We Use</h2>
          <p>
            RemixSo uses only two categories of cookies. We do not use
            advertising or third-party tracking cookies.
          </p>

          <h3 className="font-medium mt-4 mb-2">Essential (Functional) Cookies</h3>
          <p>These are required for the Service to work and cannot be disabled:</p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--outline-variant)]/30">
                  <th className="py-2 pr-4 font-medium">Cookie</th>
                  <th className="py-2 pr-4 font-medium">Provider</th>
                  <th className="py-2 pr-4 font-medium">Purpose</th>
                  <th className="py-2 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--outline-variant)]/10">
                  <td className="py-2 pr-4">
                    <code className="text-[11px] bg-[var(--surface-container)] px-1 py-0.5 rounded">
                      sb-*-auth-token
                    </code>
                  </td>
                  <td className="py-2 pr-4">Supabase</td>
                  <td className="py-2 pr-4">
                    User authentication session management
                  </td>
                  <td className="py-2">Session</td>
                </tr>
                <tr className="border-b border-[var(--outline-variant)]/10">
                  <td className="py-2 pr-4">
                    <code className="text-[11px] bg-[var(--surface-container)] px-1 py-0.5 rounded">
                      sb-*-refresh-token
                    </code>
                  </td>
                  <td className="py-2 pr-4">Supabase</td>
                  <td className="py-2 pr-4">
                    Automatic session renewal
                  </td>
                  <td className="py-2">Persistent</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    <code className="text-[11px] bg-[var(--surface-container)] px-1 py-0.5 rounded">
                      stripe.*
                    </code>
                  </td>
                  <td className="py-2 pr-4">Stripe</td>
                  <td className="py-2 pr-4">
                    Fraud detection and security during payment flow
                  </td>
                  <td className="py-2">Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-medium mt-6 mb-2">Analytics Cookies (Optional)</h3>
          <p>
            These help us understand how the site is used so we can improve it.
            They are only set if you choose &quot;Accept All&quot; in the cookie
            banner:
          </p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--outline-variant)]/30">
                  <th className="py-2 pr-4 font-medium">Cookie</th>
                  <th className="py-2 pr-4 font-medium">Provider</th>
                  <th className="py-2 pr-4 font-medium">Purpose</th>
                  <th className="py-2 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 pr-4">
                    <code className="text-[11px] bg-[var(--surface-container)] px-1 py-0.5 rounded">
                      _vercel_insights
                    </code>
                  </td>
                  <td className="py-2 pr-4">Vercel</td>
                  <td className="py-2 pr-4">
                    Anonymous page view analytics (no PII)
                  </td>
                  <td className="py-2">90 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">3. Managing Cookies</h2>
          <p>
            You can change your cookie preferences at any time by clearing your
            browser data for this site. This will reset the consent banner and
            let you make a new choice.
          </p>
          <p className="mt-1">
            Most browsers also allow you to block all cookies in settings.
            However, blocking essential cookies will prevent you from signing
            in to RemixSo.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">4. Updates to This Policy</h2>
          <p>
            We may update this policy from time to time. The &quot;Last
            updated&quot; date at the top shows when the latest changes were
            made.
          </p>
        </section>
      </div>
    </Container>
  );
}
