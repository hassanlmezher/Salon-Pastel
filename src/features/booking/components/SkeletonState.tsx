export function SkeletonState({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3 rounded-[28px] border border-stroke bg-surface p-6">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 rounded-full bg-[rgba(46,39,35,0.08)]"
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
