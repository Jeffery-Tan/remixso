import { Container } from "./Container";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--outline-variant)]/20 mt-auto">
      <Container>
        <div className="h-14 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>&copy; {new Date().getFullYear()} RemixSo</span>
          <div className="flex items-center gap-4">
            <a href="mailto:support@remixso.com" className="hover:underline">
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
