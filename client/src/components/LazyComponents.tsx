import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load large components to improve bundle performance
export const LazyBudgetPlanner = lazy(() => import('@/components/financial/BudgetPlanner'));
export const LazyProjectManager = lazy(() => import('@/components/tasks/ProjectManager'));
export const LazyAIChat = lazy(() => import('@/components/ai/AIChat'));
export const LazyConversationHistory = lazy(() => import('@/components/ai/ConversationHistory'));
export const LazySystemMonitoring = lazy(() => import('@/pages/SystemMonitoringPage'));
export const LazyPerformanceBenchmark = lazy(() => import('@/components/PerformanceBenchmark'));

// Reusable loading fallback for Arabic RTL support
const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);

// Higher-order component for lazy loading with Arabic RTL loading states
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingClassName?: string
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingSkeleton className={loadingClassName} />}>
      <Component {...props} />
    </Suspense>
  );
};

// Pre-configured lazy components with loading states
export const BudgetPlannerWithLoading = withLazyLoading(LazyBudgetPlanner, "p-6");
export const ProjectManagerWithLoading = withLazyLoading(LazyProjectManager, "p-4");
export const AIChatWithLoading = withLazyLoading(LazyAIChat, "h-96");
export const ConversationHistoryWithLoading = withLazyLoading(LazyConversationHistory);
export const SystemMonitoringWithLoading = withLazyLoading(LazySystemMonitoring);
export const PerformanceBenchmarkWithLoading = withLazyLoading(LazyPerformanceBenchmark, "p-6");