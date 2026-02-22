export default function AnomaliesLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6 md:p-10">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-72 rounded-lg bg-gray-200" />
        <div className="h-4 w-96 rounded bg-gray-100" />
      </div>

      {/* Intro text skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
      </div>

      {/* Investigation panels */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-56 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-5/6 rounded bg-gray-100" />
              <div className="mt-4 h-40 rounded bg-gray-50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
