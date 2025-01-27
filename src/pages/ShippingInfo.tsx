import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Truck, Clock, Globe, CreditCard } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const ShippingInfo = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-12">{t('shipping.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`${styles.cardBg} rounded-lg p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <Truck className={`h-6 w-6 ${styles.accent}`} />
              <h2 className="text-xl font-semibold">{t('shipping.delivery.title')}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t('shipping.delivery.standard')}</p>
              <p>{t('shipping.delivery.express')}</p>
              <p>{t('shipping.delivery.free')}</p>
            </div>
          </div>
          
          <div className={`${styles.cardBg} rounded-lg p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <Clock className={`h-6 w-6 ${styles.accent}`} />
              <h2 className="text-xl font-semibold">{t('shipping.processing.title')}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t('shipping.processing.info')}</p>
              <p>{t('shipping.processing.weekend')}</p>
              <p>{t('shipping.processing.tracking')}</p>
            </div>
          </div>
          
          <div className={`${styles.cardBg} rounded-lg p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <Globe className={`h-6 w-6 ${styles.accent}`} />
              <h2 className="text-xl font-semibold">{t('shipping.international.title')}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t('shipping.international.info')}</p>
              <p>{t('shipping.international.time')}</p>
              <p>{t('shipping.international.customs')}</p>
            </div>
          </div>
          
          <div className={`${styles.cardBg} rounded-lg p-8`}>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className={`h-6 w-6 ${styles.accent}`} />
              <h2 className="text-xl font-semibold">{t('shipping.payment.title')}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t('shipping.payment.info')}</p>
              <p>{t('shipping.payment.secure')}</p>
              <p>{t('shipping.payment.protected')}</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShippingInfo; 