import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'pulse'
}

function Skeleton({
  className,
  variant = 'shimmer',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-zinc-200 dark:bg-zinc-800",
        variant === 'shimmer' && "skeleton-shimmer",
        variant === 'pulse' && "animate-pulse",
        variant === 'default' && "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

// Product Card Skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-subtle overflow-hidden">
      {/* Image */}
      <Skeleton className="aspect-[4/5] rounded-none" />
      {/* Content */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

// Influencer Card Skeleton
function InfluencerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-subtle p-6">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-8" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-5 w-10" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-6" />
        </div>
      </div>
      {/* Button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

// Generic List Skeleton
function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-subtle">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// Page Loading Skeleton
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-cream pt-24 pb-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  ProductCardSkeleton,
  InfluencerCardSkeleton,
  ListSkeleton,
  PageSkeleton
}


