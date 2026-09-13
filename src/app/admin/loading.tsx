export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-paper-300 dark:border-charcoal-300">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-paper-300 dark:bg-charcoal-300 rounded-lg"></div>
          <div className="h-4 w-80 bg-paper-200 dark:bg-charcoal-50 rounded"></div>
        </div>
        <div className="h-10 w-40 bg-paper-300 dark:bg-charcoal-300 rounded-lg"></div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-6 border-b border-paper-300 dark:border-charcoal-300 pb-3">
        <div className="h-5 w-28 bg-paper-200 dark:bg-charcoal-50 rounded"></div>
        <div className="h-5 w-28 bg-paper-200 dark:bg-charcoal-50 rounded"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-charcoal-200 rounded-xl border border-paper-300 dark:border-charcoal-300 overflow-hidden">
        {/* Table Header */}
        <div className="bg-paper-100 dark:bg-charcoal-50 border-b border-paper-300 dark:border-charcoal-300 p-4 flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-paper-300 dark:bg-charcoal-300 rounded flex-1"></div>
          ))}
        </div>
        {/* Table Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border-b border-paper-200 dark:border-charcoal-300 flex gap-4 items-center"
          >
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-paper-300 dark:bg-charcoal-300 rounded w-2/3"></div>
              <div className="h-3 bg-paper-200 dark:bg-charcoal-50 rounded w-1/3"></div>
            </div>
            <div className="h-4 bg-paper-200 dark:bg-charcoal-50 rounded w-24"></div>
            <div className="h-4 bg-paper-200 dark:bg-charcoal-50 rounded w-20"></div>
            <div className="h-6 bg-paper-300 dark:bg-charcoal-300 rounded-full w-20"></div>
            <div className="h-8 bg-paper-200 dark:bg-charcoal-50 rounded-lg w-28"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
