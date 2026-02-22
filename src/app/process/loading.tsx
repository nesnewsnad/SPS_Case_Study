export default function ProcessLoading() {
  return (
    <div className="animate-pulse space-y-8 p-6 md:p-10">
      {/* Hero title skeleton */}
      <div className="space-y-3">
        <div className="h-9 w-96 rounded-lg bg-gray-200" />
        <div className="h-4 w-80 rounded bg-gray-100" />
      </div>

      {/* Stat bar skeleton */}
      <div className="flex gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-28 rounded-lg border border-gray-100 bg-white p-3">
            <div className="h-6 w-12 rounded bg-gray-200" />
            <div className="mt-1 h-3 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Pipeline section */}
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-gray-200" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-gray-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolkit section */}
      <div className="space-y-4">
        <div className="h-6 w-36 rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-gray-100 bg-white p-4">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
