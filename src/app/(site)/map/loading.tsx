import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/shared/card-grid-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="mx-auto h-9 w-56" />
      <Skeleton className="mx-auto mt-3 h-4 w-80" />
      <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 " />
        ))}
      </div>
      <Skeleton className="mt-4 h-[420px] w-full sm:h-[520px]" />
      <div className="mt-10">
        <CardGridSkeleton />
      </div>
    </div>
  );
}
