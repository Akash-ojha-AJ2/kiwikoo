function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="aspect-[4/3] animate-pulse bg-[#EEE8DC]" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="h-6 w-3/4 animate-pulse bg-black/10" />
          <div className="h-4 w-1/2 animate-pulse bg-black/10" />
          <div className="h-4 w-full animate-pulse bg-black/5" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="h-11 flex-1 animate-pulse rounded-full bg-black/10" />
          <div className="h-11 flex-1 animate-pulse rounded-full bg-black/5" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="container mx-auto animate-fade-in px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-10 w-40 animate-pulse bg-black/10" />
          <div className="h-5 w-56 animate-pulse bg-black/5" />
        </div>
        <div className="h-12 w-full animate-pulse bg-black/10 sm:w-40" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
