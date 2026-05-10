import { Container } from "./Container";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--outline-variant)]/20 mt-auto">
      <Container>
        <div className="min-h-14 py-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted-foreground)]">
          <span>&copy; {new Date().getFullYear()} RemixSo</span>
          <div className="flex items-center gap-3 flex-wrap">
            <a href="mailto:jeffwgr@gmail.com" className="hover:underline">
              Contact
            </a>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/cookie-policy" className="hover:underline">
              Cookies
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
