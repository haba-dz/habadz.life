import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/shared/card-grid-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="mx-auto h-9 w-72 sm:mx-0" />
      <Skeleton className="mx-auto mt-3 h-4 w-96 sm:mx-0" />
      <div className="mt-6 space-y-4">
        {[4, 6, 8].map((n) => (
          <div key={n} className="flex flex-wrap gap-2">
            {Array.from({ length: n }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <CardGridSkeleton />
      </div>
    </div>
  );
}
