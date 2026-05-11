import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PricingCTA } from "@/components/landing/PricingCTA";
import { HomeDemo } from "@/components/home/HomeDemo";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { PlatformShowcase } from "@/components/home/PlatformShowcase";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlatformIcon } from "@/components/icons/PlatformIcon";
import { FREE_MONTHLY_LIMIT, PRO_MONTHLY_LIMIT } from "@/lib/credit-manager";
import { Sparkles, Mic, Share2, Pencil, Check, ClipboardPaste, Wand2 } from "lucide-react";

export const metadata: Metadata = {
  title: "RemixSo — AI Content Repurposing",
  description:
    "Turn one article into platform-perfect posts for X, LinkedIn, Instagram, email, TikTok and YouTube Shorts. Stop rewriting. Start creating.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RemixSo",
  applicationCategory: "ContentManagementApplication",
  operatingSystem: "Web",
  description:
    "AI-powered content repurposing tool that turns one article into platform-optimized posts for X, LinkedIn, Instagram, email, TikTok and YouTube Shorts.",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "0",
      priceCurrency: "USD",
      description: `${FREE_MONTHLY_LIMIT} generations per month across all 6 platforms`,
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "19",
      priceCurrency: "USD",
      description: `${PRO_MONTHLY_LIMIT} generations/month with unlimited AI refinements`,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="mesh-gradient" />

      {/* ====== Product ====== */}
      <section id="product" className="py-24 sm:py-32 relative z-[1] scroll-mt-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center motion-safe:animate-fade-in">
            <Sparkles className="text-[var(--primary)] mx-auto mb-4 motion-safe:animate-fade-in-up" size={32} style={{ animationDelay: "0ms" }} />
            <h1 className="font-[family-name:var(--font-headline)] text-5xl sm:text-7xl font-extrabold tracking-tighter mb-6 text-[var(--foreground)] motion-safe:animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Stop rewriting.
              <br />
              <span className="text-[var(--primary)] italic font-light">Start creating.</span>
            </h1>
            <p className="text-lg text-[var(--on-surface-variant)] mb-10 leading-relaxed max-w-2xl mx-auto font-light motion-safe:animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              Turn one article into platform-perfect posts for X, LinkedIn,
              Instagram, email, TikTok and YouTube Shorts —{" "}
              <span className="font-medium text-[var(--foreground)]">keeping your voice, just changing the format.</span>
            </p>

            {/* 内联试用区 */}
            <div className="max-w-xl mx-auto glass-card rounded-2xl p-2 shadow-sm motion-safe:animate-scale-in" style={{ animationDelay: "400ms" }}>
              <HomeDemo />
            </div>
          </div>
        </Container>
      </section>

      {/* How it works（来自 product 页） */}
      <section className="py-16 relative z-[1]">
        <Container>
          <RevealOnScroll>
            <h2 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-center mb-10 tracking-tight">How it works</h2>
          </RevealOnScroll>
          <div className="mx-auto max-w-4xl">
            <div className="grid sm:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <RevealOnScroll key={step.title} delay={i * 100}>
                  <Card className="text-center relative glass-card border-[var(--outline-variant)]/30 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</div>
                    <div className="w-10 h-10 bg-[var(--surface-container)] rounded-xl flex items-center justify-center mx-auto mb-3">{step.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-[var(--on-surface-variant)]">{step.description}</p>
                  </Card>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 平台展示 */}
      <section className="py-12 relative z-[1]">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {platforms.map((p, i) => (
              <RevealOnScroll key={p.id} delay={i * 60}>
                <div className="glass-card rounded-2xl text-center py-5 px-3 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <PlatformIcon platform={p.id} size={28} className="mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 text-[var(--on-surface-variant)]" />
                  <p className="text-xs font-semibold tracking-wider uppercase text-[var(--foreground)]/80">{p.name}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* Feature Grid */}
      <section className="py-12 relative z-[1]">
        <Container>
          <div className="grid md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
            {features.map((f, i) => (
              <RevealOnScroll key={f.title} delay={i * 150}>
                <Card className={`text-center glass-card border-[var(--outline-variant)]/30 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${i === 0 ? "md:mt-12" : i === 1 ? "md:-mt-8" : "md:mt-20"}`}>
                  <span className="text-[var(--primary)] mb-6 block">{f.icon && <f.icon size={28} className="mx-auto" />}</span>
                  <h3 className="font-[family-name:var(--font-headline)] text-xl font-bold mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-[var(--on-surface-variant)] font-light leading-relaxed">{f.description}</p>
                </Card>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* ====== Demo ====== */}
      <section id="demo" className="py-16 relative z-[1] scroll-mt-20">
        <Container>
          <RevealOnScroll>
            <h2 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-center mb-8 tracking-tight">See it in action</h2>
          </RevealOnScroll>
          <PlatformShowcase />
        </Container>
      </section>

      {/* ====== Pricing ====== */}
      <section id="pricing" className="py-20 relative z-[1] scroll-mt-20">
        <Container>
          <RevealOnScroll>
            <div className="text-center mb-14">
              <h2 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl font-bold tracking-tight mb-3">Simple, transparent pricing.</h2>
            </div>
          </RevealOnScroll>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
            {/* Starter */}
            <RevealOnScroll delay={0}>
              <Card className="glass-card border-[var(--primary)]/20 shadow-sm rounded-3xl text-center relative hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <Badge className="bg-[var(--primary-fixed)] text-[var(--primary)] text-[10px] uppercase tracking-widest border border-[var(--primary)]/20">Free Forever</Badge>
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-2xl font-bold mb-1">Starter</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mb-6 font-light">For casual creators.</p>
                <div className="mb-6">
                  <span className="font-[family-name:var(--font-headline)] text-4xl font-bold">$0</span>
                  <span className="text-sm text-[var(--on-surface-variant)] font-light">/mo</span>
                </div>
                <ul className="text-sm space-y-2.5 mb-8 text-left max-w-[240px] mx-auto">
                  {[`${FREE_MONTHLY_LIMIT} generations per month`, "All 6 platforms included", "Voice analysis included"].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={14} className="text-[var(--primary)] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <PricingCTA variant="starter" />
              </Card>
            </RevealOnScroll>

            {/* Pro */}
            <RevealOnScroll delay={150}>
              <Card className="relative rounded-3xl text-white border-[var(--primary)]/20 transform md:scale-105 z-10 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgba(124,58,237,0.5)] transition-all duration-300"
                style={{ background: "var(--foreground)", boxShadow: "0 0 40px -10px rgba(124, 58, 237, 0.3)" }}>
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <Badge className="bg-[var(--primary)] text-white text-[10px] uppercase tracking-widest border border-[var(--primary-fixed-dim)]/30">Most Popular</Badge>
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-2xl font-bold mb-1 text-center">RemixSo Pro</h3>
                <p className="text-sm text-white/60 mb-6 font-light text-center">Everything you need to scale.</p>
                <div className="mb-6 text-center">
                  <span className="font-[family-name:var(--font-headline)] text-4xl font-bold">$19</span>
                  <span className="text-sm text-white/60 font-light">/mo</span>
                </div>
                <ul className="text-sm space-y-2.5 mb-8 text-left max-w-[260px] mx-auto">
                  {[`${PRO_MONTHLY_LIMIT} generations/month`, "All 6 platforms included", "URL auto-fetch for blog posts", "Unlimited AI refinements", "Keep your unique writing voice"].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={14} className="text-[var(--primary-fixed)] mt-0.5 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
                <PricingCTA variant="pro" />
              </Card>
            </RevealOnScroll>
          </div>
        </Container>
      </section>

      {/* ====== FAQ ====== */}
      <section id="faq" className="py-16 relative z-[1] scroll-mt-20">
        <Container>
          <RevealOnScroll>
            <h2 className="font-[family-name:var(--font-headline)] text-3xl font-bold text-center mb-10 tracking-tight">FAQ</h2>
          </RevealOnScroll>
          <div className="mx-auto max-w-2xl divide-y divide-[var(--outline-variant)]/30">
            {faqs.map((faq, i) => (
              <RevealOnScroll key={faq.q} delay={i * 80}>
                <details className="py-4 group">
                  <summary className="font-medium cursor-pointer list-none flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded">
                    {faq.q}
                    <span className="text-[var(--on-surface-variant)] group-open:rotate-180 transition-transform ml-2">&#9660;</span>
                  </summary>
                  <p className="text-sm text-[var(--on-surface-variant)] mt-2 leading-relaxed">{faq.a}</p>
                </details>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

const platforms = [
  { id: "twitter", name: "X / Twitter" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
  { id: "newsletter", name: "Newsletter" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube-shorts", name: "YT Shorts" },
];

const features = [
  {
    icon: Mic,
    title: "Keep Your Voice",
    description:
      "Our AI analyzes your writing style first, then rewrites in your voice — not generic AI-speak.",
  },
  {
    icon: Share2,
    title: "One Click, Six Platforms",
    description:
      "Paste once, get perfectly formatted posts — character limits, hashtags, and line breaks handled for each platform automatically.",
  },
  {
    icon: Pencil,
    title: "Edit Before You Post",
    description:
      "Fine-tune any output with simple instructions — 'make it shorter', 'add a hook'.",
  },
];

const steps = [
  { icon: <ClipboardPaste size={18} className="text-[var(--primary)]" />, title: "Paste or URL", description: "Drop in your blog post, article, or any long-form text." },
  { icon: <Mic size={18} className="text-[var(--primary)]" />, title: "Analyze Voice", description: "Our AI learns your writing style — tone, pacing, vocabulary." },
  { icon: <Wand2 size={18} className="text-[var(--primary)]" />, title: "Generate", description: "Get platform-perfect posts in seconds, all keeping your voice." },
  { icon: <Pencil size={18} className="text-[var(--primary)]" />, title: "Refine & Share", description: "Quick-edit any output, copy, export, and publish." },
];

const faqs = [
  {
    q: "How does the free plan work?",
    a: `Starter is permanently free with ${FREE_MONTHLY_LIMIT} generations per month across all 6 platforms. No credit card required. Upgrade to RemixSo Pro anytime for ${PRO_MONTHLY_LIMIT} generations/month and more features.`,
  },
  {
    q: "Can I really keep my writing voice?",
    a: "Yes — our AI first analyzes your writing style (tone, pacing, vocabulary, signature phrases) and applies those patterns when generating content for each platform. The result feels like you wrote it, not an AI.",
  },
  {
    q: "What happens to my content?",
    a: "Your content is yours. We don't use your articles or posts to train AI models. We store your generations so you can access them, and you can delete them anytime.",
  },
  {
    q: "Is there a limit on content length?",
    a: "Starter supports up to 5,000 characters per input. RemixSo Pro supports up to 15,000 characters and includes URL auto-fetch for blog posts.",
  },
  {
    q: "Need help or have feedback?",
    a: "Email us at jeffwgr@gmail.com — we read every message and respond within 24 hours.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel with one click from your account page — no emails, no questions asked.",
  },
];
