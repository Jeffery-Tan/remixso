import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <Container className="py-16">
      <Skeleton className="w-40 h-9 mb-8" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-[var(--border)] p-6 space-y-4">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-64 h-4" />
          <div className="rounded-lg border border-[var(--border)] p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="w-36 h-5" />
                <Skeleton className="w-48 h-4" />
              </div>
              <Skeleton className="w-40 h-9" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-6 space-y-4">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-48 h-4" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    </Container>
  );
}
