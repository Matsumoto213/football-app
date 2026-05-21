export default function PlayerLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-4 w-12 bg-zinc-800 rounded" />

      {/* Player header skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-6 bg-zinc-800 rounded w-40" />
            <div className="h-4 bg-zinc-800 rounded w-24" />
            <div className="h-3 bg-zinc-800 rounded w-32" />
            <div className="h-3 bg-zinc-800 rounded w-28" />
          </div>
        </div>
      </div>

      {/* Season selector skeleton */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-7 w-16 bg-zinc-800 rounded-lg" />
        ))}
      </div>

      {/* Stats skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="h-3 w-20 bg-zinc-800 rounded mb-4" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-800/50 rounded-xl p-3 space-y-1.5">
              <div className="h-3 w-16 bg-zinc-700 rounded" />
              <div className="h-7 w-10 bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* League breakdown skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800/60">
          <div className="h-3 w-24 bg-zinc-800 rounded" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/40">
            <div className="w-6 h-6 bg-zinc-800 rounded" />
            <div className="flex-1 space-y-1">
              <div className="h-3.5 w-32 bg-zinc-800 rounded" />
              <div className="h-3 w-20 bg-zinc-800 rounded" />
            </div>
            <div className="flex gap-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-4 w-8 bg-zinc-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
