import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      {/* 棱镜幽灵图 */}
      <div className="w-20 h-20 bg-[var(--surface-container)] rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-[var(--outline-variant)]/30 shadow-[3px_3px_0_0_rgba(0,0,0,0.04)]">
        <svg width="36" height="36" viewBox="0 0 1024 1024" fill="none" aria-hidden="true">
          <polygon points="340,390 340,650 530,520" fill="var(--outline-variant)" opacity="0.4"/>
          <polygon points="320,372 320,632 510,502" fill="var(--surface-container)" stroke="var(--outline-variant)" strokeWidth="14" strokeLinejoin="round" opacity="0.6"/>
          <path d="M 60 502 L 310 502" stroke="var(--outline-variant)" strokeWidth="24" strokeLinecap="round" opacity="0.6"/>
          <path d="M 60 502 L 310 502" stroke="white" strokeWidth="16" strokeLinecap="round"/>
          <circle cx="310" cy="502" r="10" fill="var(--outline-variant)" opacity="0.4"/>
        </svg>
      </div>

      <h1 className="font-[family-name:var(--font-headline)] text-5xl font-extrabold tracking-tighter mb-3">
        404
      </h1>
      <p className="text-[var(--on-surface-variant)] mb-2 text-lg">
        This page doesn&apos;t exist.
      </p>
      <p className="text-sm text-[var(--on-surface-variant)]/60 mb-8">
        Maybe it was moved, or maybe you mistyped the URL.
      </p>

      <div className="flex justify-center gap-3">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </Container>
  );
}
