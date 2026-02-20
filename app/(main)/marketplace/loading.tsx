export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900">
      {/* Header Skeleton */}
      <div className="border-b border-white/5 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="w-full h-48 bg-white/5 animate-pulse" />

              {/* Content Skeleton */}
              <div className="p-5 space-y-4">
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
                <div className="h-8 bg-white/10 rounded animate-pulse w-24" />

                {/* Seller Skeleton */}
                <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-24" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-16" />
                  </div>
                </div>

                {/* Button Skeleton */}
                <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
