import { useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  rtlPerformance: number;
}

export function usePerformanceOptimization() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Optimize font loading for Arabic
  useEffect(() => {
    if (isRTL) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap';
      link.as = 'style';
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [isRTL]);

  // Memory cleanup for large components
  const cleanupMemory = useCallback(() => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }, []);

  // Optimize RTL layout calculations
  const optimizeRTLLayout = useCallback(() => {
    if (isRTL) {
      document.documentElement.style.setProperty('--direction-factor', '-1');
      document.documentElement.style.setProperty('--text-align', 'right');
    } else {
      document.documentElement.style.setProperty('--direction-factor', '1');
      document.documentElement.style.setProperty('--text-align', 'left');
    }
  }, [isRTL]);

  // Performance monitoring
  const measurePerformance = useCallback((): PerformanceMetrics => {
    const renderStart = performance.now();
    
    // Simulate component render time
    const renderTime = performance.now() - renderStart;
    
    const memory = (performance as any).memory;
    const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
    
    const networkRequests = performance.getEntriesByType('resource').length;
    
    // Measure RTL specific performance
    const rtlStart = performance.now();
    const testElement = document.createElement('div');
    testElement.style.direction = isRTL ? 'rtl' : 'ltr';
    testElement.innerHTML = isRTL ? 'اختبار الأداء' : 'Performance Test';
    document.body.appendChild(testElement);
    document.body.removeChild(testElement);
    const rtlPerformance = performance.now() - rtlStart;

    return {
      renderTime,
      memoryUsage,
      networkRequests,
      rtlPerformance
    };
  }, [isRTL]);

  // Memoized optimization settings
  const optimizationSettings = useMemo(() => ({
    enableVirtualization: true,
    prefetchRoutes: ['/', '/tasks', '/finances'],
    cacheSize: 50,
    rtlOptimizations: isRTL
  }), [isRTL]);

  useEffect(() => {
    optimizeRTLLayout();
  }, [optimizeRTLLayout]);

  return {
    cleanupMemory,
    measurePerformance,
    optimizationSettings,
    isRTL
  };
}