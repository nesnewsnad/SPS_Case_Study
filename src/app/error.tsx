'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-600">
            An unexpected error occurred while loading this page.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-gray-400">Error ID: {error.digest}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
