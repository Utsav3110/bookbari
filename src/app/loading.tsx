export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse w-full max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div className="h-8 w-48 bg-paper-300 dark:bg-charcoal-300 rounded-lg"></div>
        <div className="h-4 w-72 bg-paper-200 dark:bg-charcoal-50 rounded"></div>
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="h-12 w-full bg-paper-200 dark:bg-charcoal-300 rounded-xl border border-paper-300 dark:border-charcoal-50"></div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-paper-100 dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 p-4 flex flex-col justify-between"
          >
            <div className="h-32 bg-paper-200 dark:bg-charcoal-50 rounded-lg w-full"></div>
            <div className="space-y-2 pt-3">
              <div className="h-4 bg-paper-300 dark:bg-charcoal-300 rounded w-3/4"></div>
              <div className="h-3 bg-paper-200 dark:bg-charcoal-50 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-paper-200 dark:bg-charcoal-50 rounded-lg w-full mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
