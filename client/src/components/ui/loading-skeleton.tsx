import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Card skeleton for general content
function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
      </div>
    </div>
  )
}

// Task item skeleton
function TaskSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-4 p-4 border-b", className)}>
      <Skeleton className="h-4 w-4 rounded" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  )
}

// Financial record skeleton
function FinancialSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center justify-between p-4 border-b", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <Skeleton className="h-4 w-[60px] ml-auto" />
        <Skeleton className="h-3 w-[40px] ml-auto" />
      </div>
    </div>
  )
}

// Chat message skeleton
function MessageSkeleton({ className, isOwn = false }: SkeletonProps & { isOwn?: boolean }) {
  return (
    <div className={cn("flex gap-3 mb-4", isOwn && "flex-row-reverse", className)}>
      {!isOwn && <Skeleton className="h-8 w-8 rounded-full" />}
      <div className={cn("max-w-[70%] space-y-2", isOwn && "items-end")}>
        <div className={cn(
          "rounded-lg p-3 space-y-1",
          isOwn ? "bg-primary" : "bg-muted"
        )}>
          <Skeleton className={cn("h-3", isOwn ? "bg-primary-foreground/20" : "bg-foreground/20", "w-[150px]")} />
          <Skeleton className={cn("h-3", isOwn ? "bg-primary-foreground/20" : "bg-foreground/20", "w-[100px]")} />
        </div>
        <Skeleton className="h-2 w-[60px]" />
      </div>
    </div>
  )
}

// Analytics chart skeleton
function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
      <div className="h-[300px] flex items-end justify-between space-x-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  )
}

// Table skeleton
function TableSkeleton({ rows = 5, columns = 4, className }: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Profile skeleton
function ProfileSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-[180px]" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
  )
}

// List skeleton
function ListSkeleton({ items = 5, className }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Page skeleton for full page loading
function PageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export {
  Skeleton,
  CardSkeleton,
  TaskSkeleton,
  FinancialSkeleton,
  MessageSkeleton,
  ChartSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  ListSkeleton,
  PageSkeleton
}