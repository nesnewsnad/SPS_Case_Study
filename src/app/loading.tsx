export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6 md:p-10">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-gray-200" />
        <div className="h-4 w-96 rounded bg-gray-100" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-gray-100 bg-white p-4">
            <div className="h-3 w-20 rounded bg-gray-100" />
            <div className="mt-3 h-7 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-16 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Chart area skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl border border-gray-100 bg-white p-4">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-4 h-52 rounded bg-gray-50" />
        </div>
        <div className="h-72 rounded-xl border border-gray-100 bg-white p-4">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-4 h-52 rounded bg-gray-50" />
        </div>
      </div>
    </div>
  );
}
