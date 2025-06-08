import { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { arabicFontOptimizer } from '@/lib/fontOptimization';
import { arabicPerformanceTracker } from '@/lib/arabicPerformanceTracker';

interface RTLContextType {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const RTLContext = createContext<RTLContextType>({
  isRTL: false,
  direction: 'ltr'
});

export const useRTL = () => useContext(RTLContext);

interface RTLProviderProps {
  children: React.ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', i18n.language);
    
    // Apply Arabic font optimization
    if (isRTL) {
      document.body.classList.add('arabic-text');
    } else {
      document.body.classList.remove('arabic-text');
    }
  }, [direction, isRTL, i18n.language]);

  return (
    <RTLContext.Provider value={{ isRTL, direction }}>
      {children}
    </RTLContext.Provider>
  );
}