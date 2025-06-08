// Arabic font optimization with CDN delivery
export class ArabicFontOptimizer {
  private fontCache = new Map<string, boolean>();
  private loadingPromises = new Map<string, Promise<void>>();

  async optimizeArabicFonts(language: string): Promise<void> {
    if (language !== 'ar') return;

    const fonts = [
      {
        family: 'Noto Sans Arabic',
        weights: ['400', '500', '600', '700'],
        display: 'swap'
      }
    ];

    await Promise.all(fonts.map(font => this.loadFont(font)));
  }

  private async loadFont(fontConfig: {
    family: string;
    weights: string[];
    display: string;
  }): Promise<void> {
    const cacheKey = `${fontConfig.family}-${fontConfig.weights.join(',')}`;
    
    if (this.fontCache.has(cacheKey)) return;
    
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const loadPromise = this.performFontLoad(fontConfig, cacheKey);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    return loadPromise;
  }

  private async performFontLoad(
    fontConfig: { family: string; weights: string[]; display: string },
    cacheKey: string
  ): Promise<void> {
    try {
      // Preload critical Arabic font weights
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      
      // Use Google Fonts CDN with optimal parameters for Arabic
      const weightParam = fontConfig.weights.join(';');
      link.href = `https://fonts.googleapis.com/css2?family=${fontConfig.family.replace(/ /g, '+')}:wght@${weightParam}&display=${fontConfig.display}&subset=arabic`;
      
      document.head.appendChild(link);

      // Create stylesheet link
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = link.href;
      
      await new Promise<void>((resolve, reject) => {
        styleLink.onload = () => resolve();
        styleLink.onerror = () => reject(new Error(`Failed to load font: ${fontConfig.family}`));
        document.head.appendChild(styleLink);
      });

      this.fontCache.set(cacheKey, true);
      this.loadingPromises.delete(cacheKey);
    } catch (error) {
      console.warn(`Font loading failed for ${fontConfig.family}:`, error);
      this.loadingPromises.delete(cacheKey);
    }
  }

  // Performance monitoring for Arabic font rendering
  measureArabicRenderPerformance(): {
    renderTime: number;
    layoutShift: number;
    fontLoadTime: number;
  } {
    const startTime = performance.now();
    
    // Create test element with Arabic text
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.visibility = 'hidden';
    testDiv.style.fontFamily = 'Noto Sans Arabic, Arial, sans-serif';
    testDiv.style.fontSize = '16px';
    testDiv.innerHTML = 'مرحباً بكم في منصة المساعد الذكي للمهنيين العمانيين';
    
    document.body.appendChild(testDiv);
    
    const initialHeight = testDiv.offsetHeight;
    const renderTime = performance.now() - startTime;
    
    // Measure layout shift
    setTimeout(() => {
      const finalHeight = testDiv.offsetHeight;
      const layoutShift = Math.abs(finalHeight - initialHeight) / initialHeight;
      
      document.body.removeChild(testDiv);
      
      return {
        renderTime,
        layoutShift,
        fontLoadTime: renderTime
      };
    }, 100);

    document.body.removeChild(testDiv);
    
    return {
      renderTime,
      layoutShift: 0,
      fontLoadTime: renderTime
    };
  }
}

export const arabicFontOptimizer = new ArabicFontOptimizer();