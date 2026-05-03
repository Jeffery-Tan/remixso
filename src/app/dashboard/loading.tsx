import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <Container className="py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 标题骨架 */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        {/* 输入区骨架 */}
        <Skeleton className="h-32 w-full rounded-xl" />

        {/* 平台选择器骨架 */}
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>

        {/* 按钮骨架 */}
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </Container>
  );
}
