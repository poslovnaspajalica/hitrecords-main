import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const Cart = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex items-center gap-4 mb-12">
          <ShoppingCart className={`h-8 w-8 ${styles.accent}`} />
          <h1 className="text-4xl font-bold">{t('cart.title')}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className={`${styles.cardBg} rounded-lg overflow-hidden`}>
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{t('cart.product')}</span>
                  <div className="flex gap-20">
                    <span>{t('cart.quantity')}</span>
                    <span>{t('cart.total')}</span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-700">
                <div className="p-6">
                  <div className="flex items-center gap-6">
                    <img 
                      src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745"
                      alt="Album"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Summer Hits 2024</h3>
                      <p className="text-gray-400">Various Artists</p>
                      <p className="text-[#8B5CF6] mt-1">$19.99</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:bg-gray-700"
                          aria-label={t('cart.actions.decrease')}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">1</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:bg-gray-700"
                          aria-label={t('cart.actions.increase')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-semibold w-20 text-right">$19.99</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-white hover:bg-gray-700"
                        aria-label={t('cart.actions.remove')}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className={`${styles.cardBg} rounded-lg p-8 h-fit`}>
            <h2 className="text-xl font-semibold mb-6">{t('cart.summary.title')}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-400">
                <span>{t('cart.summary.subtotal')}</span>
                <span>$19.99</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{t('cart.summary.shipping')}</span>
                <span>$4.99</span>
              </div>
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('cart.summary.total')}</span>
                  <span className="text-[#8B5CF6]">$24.98</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{t('cart.summary.vat')}</p>
              </div>
            </div>
            
            <Link to="/checkout">
              <Button className="w-full mt-8 bg-[#8B5CF6] hover:bg-[#7C3AED]">
                {t('cart.actions.checkout')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;