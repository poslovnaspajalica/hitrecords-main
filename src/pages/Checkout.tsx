import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ShieldCheck, Package } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const Checkout = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-12">{t('checkout.title')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className={`${styles.cardBg} rounded-lg p-8`}>
              <h2 className="text-xl font-semibold mb-6">{t('checkout.form.shipping.title')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('checkout.form.shipping.firstName')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label>{t('checkout.form.shipping.lastName')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>{t('checkout.form.shipping.address')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label>{t('checkout.form.shipping.city')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label>{t('checkout.form.shipping.zip')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>{t('checkout.form.shipping.country')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className={`${styles.cardBg} rounded-lg p-8`}>
              <h2 className="text-xl font-semibold mb-6">{t('checkout.form.payment.title')}</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('checkout.form.payment.cardNumber')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('checkout.form.payment.expiry')}</Label>
                    <Input className="bg-white/5 border-gray-700" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('checkout.form.payment.cvv')}</Label>
                    <Input className="bg-white/5 border-gray-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('checkout.form.payment.nameOnCard')}</Label>
                  <Input className="bg-white/5 border-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`${styles.cardBg} rounded-lg p-8 h-fit`}>
            <h2 className="text-xl font-semibold mb-6">{t('checkout.summary.title')}</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-400">
                <span>{t('checkout.summary.subtotal')}</span>
                <span>$19.99</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{t('checkout.summary.shipping')}</span>
                <span>$4.99</span>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('checkout.summary.total')}</span>
                  <span className={styles.accent}>$24.98</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{t('checkout.summary.vat')}</p>
              </div>
            </div>
            
            <Button className="w-full mt-8 bg-[#8B5CF6] hover:bg-[#7C3AED]">
              {t('checkout.placeOrder')}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;