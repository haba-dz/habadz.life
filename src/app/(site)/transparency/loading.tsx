import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Skeleton className="mx-auto h-9 w-64" />
      <Skeleton className="mx-auto mt-3 h-4 w-96" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 " />
        <Skeleton className="h-24 " />
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 " />
        ))}
      </div>
    </div>
  );
}
