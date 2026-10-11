export function FormSkeleton() {
  return (
    <div className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-border/70 sm:p-8" aria-hidden>
      <div className="shimmer h-6 w-40 rounded" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-11 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="shimmer h-28 rounded-2xl" />
      ))}
    </div>
  );
}
