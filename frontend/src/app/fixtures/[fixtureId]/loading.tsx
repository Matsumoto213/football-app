export default function FixtureLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-4 w-12 bg-zinc-800 rounded" />

      {/* Score card skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-4 h-4 bg-zinc-800 rounded" />
          <div className="h-3 w-24 bg-zinc-800 rounded" />
          <div className="h-5 w-12 bg-zinc-800 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-zinc-800 rounded-xl" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="h-10 w-20 bg-zinc-800 rounded" />
            <div className="h-3 w-28 bg-zinc-800 rounded" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-zinc-800 rounded-xl" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="h-3 w-20 bg-zinc-800 rounded mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center">
                <div className="w-12 h-4 bg-zinc-800 rounded" />
                <div className="flex-1 mx-2 h-3 bg-zinc-800 rounded" />
                <div className="w-12 h-4 bg-zinc-800 rounded" />
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Lineup skeleton */}
      <div className="space-y-4">
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        {[0, 1].map((t) => (
          <div key={t} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
              <div className="w-5 h-5 bg-zinc-800 rounded" />
              <div className="h-4 w-28 bg-zinc-800 rounded" />
            </div>
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/40">
                <div className="h-4 w-5 bg-zinc-800 rounded" />
                <div className="h-4 flex-1 bg-zinc-800 rounded" />
                <div className="h-4 w-10 bg-zinc-800 rounded" />
                <div className="h-4 w-6 bg-zinc-800 rounded" />
                <div className="h-4 w-6 bg-zinc-800 rounded" />
                <div className="h-4 w-8 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
