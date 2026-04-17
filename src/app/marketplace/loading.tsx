function MarketplaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="aspect-[4/5] animate-pulse bg-[#EEE8DC]" />
      <div className="space-y-3 p-3.5">
        <div className="h-5 w-2/3 animate-pulse bg-black/10" />
        <div className="h-4 w-1/2 animate-pulse bg-black/5" />
        <div className="flex items-center justify-between gap-2">
          <div className="h-8 w-24 animate-pulse rounded-md bg-black/5" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-[#FFD93D]/50" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-white pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 space-y-6 animate-fade-in">
          <div className="max-w-2xl space-y-3 rounded-[28px] border-[3px] border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
            <div className="h-5 w-40 animate-pulse bg-black/10" />
            <div className="h-16 w-64 animate-pulse bg-black/10" />
            <div className="h-5 w-full max-w-xl animate-pulse bg-black/5" />
          </div>
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 w-28 animate-pulse bg-black/10" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MarketplaceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
