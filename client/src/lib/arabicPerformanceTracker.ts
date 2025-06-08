interface ArabicPerformanceMetrics {
  rtlRenderTime: number;
  fontLoadTime: number;
  layoutShiftScore: number;
  textDirectionSwitchTime: number;
  arabicTextRenderScore: number;
  timestamp: number;
}

interface PerformanceThresholds {
  rtlRenderTime: number;
  fontLoadTime: number;
  layoutShiftScore: number;
  textDirectionSwitchTime: number;
}

export class ArabicPerformanceTracker {
  private metrics: ArabicPerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds = {
    rtlRenderTime: 50, // ms
    fontLoadTime: 200, // ms
    layoutShiftScore: 0.1,
    textDirectionSwitchTime: 100 // ms
  };

  trackRTLPerformance(language: string): ArabicPerformanceMetrics {
    const startTime = performance.now();
    
    // Measure RTL layout rendering
    const rtlContainer = document.createElement('div');
    rtlContainer.style.direction = language === 'ar' ? 'rtl' : 'ltr';
    rtlContainer.style.position = 'absolute';
    rtlContainer.style.visibility = 'hidden';
    rtlContainer.innerHTML = language === 'ar' 
      ? 'مرحباً بكم في منصة المساعد الذكي للمهنيين العمانيين' 
      : 'Welcome to MenAssist Professional Platform';
    
    document.body.appendChild(rtlContainer);
    const rtlRenderTime = performance.now() - startTime;
    
    // Measure font loading for Arabic
    const fontStartTime = performance.now();
    const fontTestElement = document.createElement('span');
    fontTestElement.style.fontFamily = language === 'ar' ? 'Noto Sans Arabic' : 'Inter';
    fontTestElement.style.fontSize = '16px';
    fontTestElement.innerHTML = language === 'ar' ? 'اختبار الخط' : 'Font Test';
    rtlContainer.appendChild(fontTestElement);
    
    const fontLoadTime = performance.now() - fontStartTime;
    
    // Measure layout shift
    const initialWidth = rtlContainer.offsetWidth;
    const layoutShiftScore = this.measureLayoutShift(rtlContainer, initialWidth);
    
    // Measure direction switch performance
    const directionSwitchTime = this.measureDirectionSwitch(rtlContainer, language);
    
    document.body.removeChild(rtlContainer);
    
    const metrics: ArabicPerformanceMetrics = {
      rtlRenderTime,
      fontLoadTime,
      layoutShiftScore,
      textDirectionSwitchTime: directionSwitchTime,
      arabicTextRenderScore: this.calculateTextRenderScore(rtlRenderTime, fontLoadTime),
      timestamp: Date.now()
    };
    
    this.metrics.push(metrics);
    this.analyzePerformanceIssues(metrics);
    
    return metrics;
  }

  private measureLayoutShift(element: HTMLElement, initialWidth: number): number {
    // Simulate font loading completion
    element.style.fontDisplay = 'swap';
    const finalWidth = element.offsetWidth;
    return Math.abs(finalWidth - initialWidth) / initialWidth;
  }

  private measureDirectionSwitch(element: HTMLElement, currentLanguage: string): number {
    const startTime = performance.now();
    
    // Switch direction
    element.style.direction = currentLanguage === 'ar' ? 'ltr' : 'rtl';
    element.style.textAlign = currentLanguage === 'ar' ? 'left' : 'right';
    
    // Force reflow
    element.offsetHeight;
    
    return performance.now() - startTime;
  }

  private calculateTextRenderScore(rtlTime: number, fontTime: number): number {
    const totalTime = rtlTime + fontTime;
    if (totalTime < 50) return 100;
    if (totalTime < 100) return 90;
    if (totalTime < 200) return 80;
    if (totalTime < 300) return 70;
    return 60;
  }

  private analyzePerformanceIssues(metrics: ArabicPerformanceMetrics): void {
    const issues: string[] = [];
    
    if (metrics.rtlRenderTime > this.thresholds.rtlRenderTime) {
      issues.push('RTL rendering slower than optimal');
    }
    
    if (metrics.fontLoadTime > this.thresholds.fontLoadTime) {
      issues.push('Arabic font loading slower than optimal');
    }
    
    if (metrics.layoutShiftScore > this.thresholds.layoutShiftScore) {
      issues.push('Significant layout shift during font loading');
    }
    
    if (metrics.textDirectionSwitchTime > this.thresholds.textDirectionSwitchTime) {
      issues.push('Direction switching performance issue');
    }
    
    if (issues.length > 0) {
      console.warn('Arabic Performance Issues Detected:', issues);
      this.sendPerformanceAlert(metrics, issues);
    }
  }

  private sendPerformanceAlert(metrics: ArabicPerformanceMetrics, issues: string[]): void {
    // Send performance data to analytics endpoint
    fetch('/api/analytics/arabic-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics,
        issues,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.warn('Failed to send Arabic performance data:', error);
    });
  }

  getAverageMetrics(): Partial<ArabicPerformanceMetrics> {
    if (this.metrics.length === 0) return {};
    
    const totals = this.metrics.reduce((acc, metric) => ({
      rtlRenderTime: acc.rtlRenderTime + metric.rtlRenderTime,
      fontLoadTime: acc.fontLoadTime + metric.fontLoadTime,
      layoutShiftScore: acc.layoutShiftScore + metric.layoutShiftScore,
      textDirectionSwitchTime: acc.textDirectionSwitchTime + metric.textDirectionSwitchTime,
      arabicTextRenderScore: acc.arabicTextRenderScore + metric.arabicTextRenderScore
    }), {
      rtlRenderTime: 0,
      fontLoadTime: 0,
      layoutShiftScore: 0,
      textDirectionSwitchTime: 0,
      arabicTextRenderScore: 0
    });
    
    const count = this.metrics.length;
    return {
      rtlRenderTime: totals.rtlRenderTime / count,
      fontLoadTime: totals.fontLoadTime / count,
      layoutShiftScore: totals.layoutShiftScore / count,
      textDirectionSwitchTime: totals.textDirectionSwitchTime / count,
      arabicTextRenderScore: totals.arabicTextRenderScore / count
    };
  }

  getPerformanceReport(): {
    averageMetrics: Partial<ArabicPerformanceMetrics>;
    totalSamples: number;
    performanceGrade: string;
    recommendations: string[];
  } {
    const averageMetrics = this.getAverageMetrics();
    const totalSamples = this.metrics.length;
    
    const performanceGrade = this.calculatePerformanceGrade(averageMetrics);
    const recommendations = this.generateRecommendations(averageMetrics);
    
    return {
      averageMetrics,
      totalSamples,
      performanceGrade,
      recommendations
    };
  }

  private calculatePerformanceGrade(metrics: Partial<ArabicPerformanceMetrics>): string {
    const score = metrics.arabicTextRenderScore || 0;
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    return 'C';
  }

  private generateRecommendations(metrics: Partial<ArabicPerformanceMetrics>): string[] {
    const recommendations: string[] = [];
    
    if ((metrics.rtlRenderTime || 0) > this.thresholds.rtlRenderTime) {
      recommendations.push('Optimize CSS for RTL layouts using logical properties');
      recommendations.push('Implement CSS containment for Arabic text sections');
    }
    
    if ((metrics.fontLoadTime || 0) > this.thresholds.fontLoadTime) {
      recommendations.push('Preload Arabic fonts with font-display: swap');
      recommendations.push('Use font subsetting for Arabic character ranges');
    }
    
    if ((metrics.layoutShiftScore || 0) > this.thresholds.layoutShiftScore) {
      recommendations.push('Reserve space for Arabic text during font loading');
      recommendations.push('Use size-adjust property for Arabic font fallbacks');
    }
    
    return recommendations;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const arabicPerformanceTracker = new ArabicPerformanceTracker();