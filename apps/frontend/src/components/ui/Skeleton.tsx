export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-bg-elevated ${className}`} />
  );
}

export function ModelCardSkeleton() {
  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
      {/* 3D preview area */}
      <Skeleton className="h-40 w-full rounded-none" />
      {/* Body */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-1 mt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
