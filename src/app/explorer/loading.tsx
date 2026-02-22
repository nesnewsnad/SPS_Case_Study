export default function ExplorerLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6 md:p-10">
      {/* Page title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-4 w-80 rounded bg-gray-100" />
      </div>

      {/* Mini trend skeleton */}
      <div className="h-44 rounded-xl border border-gray-100 bg-white p-4">
        <div className="h-3 w-28 rounded bg-gray-100" />
        <div className="mt-3 h-28 rounded bg-gray-50" />
      </div>

      {/* Drugs table + side charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-96 rounded-xl border border-gray-100 bg-white p-4 lg:col-span-3">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded bg-gray-50" />
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="h-44 rounded-xl border border-gray-100 bg-white p-4">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="mt-3 h-24 rounded bg-gray-50" />
          </div>
          <div className="h-44 rounded-xl border border-gray-100 bg-white p-4">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-3 h-24 rounded bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Bottom row: Groups + Manufacturers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-xl border border-gray-100 bg-white p-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
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
