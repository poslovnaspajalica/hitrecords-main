import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RefreshCw, Package, Clock, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const Returns = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-12">{t('returns.title')}</h1>
        
        <div className="space-y-8">
          <div className={`${styles.cardBg} rounded-lg p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <RefreshCw className={`h-6 w-6 ${styles.accent}`} />
              <h2 className="text-xl font-semibold">{t('returns.policy.title')}</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p>{t('returns.policy.description')}</p>
              <h3>{t('returns.policy.conditions')}</h3>
              <ul>
                {t('returns.policy.list').map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${styles.cardBg} rounded-lg p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <Package className={`h-6 w-6 ${styles.accent}`} />
                <h2 className="text-xl font-semibold">{t('returns.process.title')}</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                {t('returns.process.steps').map((step, index) => (
                  <p key={index}>{`${index + 1}. ${step}`}</p>
                ))}
              </div>
            </div>
            
            <div className={`${styles.cardBg} rounded-lg p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className={`h-6 w-6 ${styles.accent}`} />
                <h2 className="text-xl font-semibold">{t('returns.help.title')}</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>{t('returns.help.contact')}</p>
                <p>{t('returns.help.email')}</p>
                <p>{t('returns.help.phone')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Returns; 