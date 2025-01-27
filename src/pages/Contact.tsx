import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const Contact = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className={styles.textMuted}>{t('contact.description')}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className={`${styles.cardBg} rounded-lg p-8`}>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      {t('contact.form.name')}
                    </label>
                    <Input 
                      className="bg-white/5 border-gray-700 text-white" 
                      placeholder={t('contact.form.name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      {t('contact.form.email')}
                    </label>
                    <Input 
                      type="email" 
                      className="bg-white/5 border-gray-700 text-white"
                      placeholder={t('contact.form.email')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    {t('contact.form.subject')}
                  </label>
                  <Input 
                    className="bg-white/5 border-gray-700 text-white"
                    placeholder={t('contact.form.subject')}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    {t('contact.form.message')}
                  </label>
                  <Textarea 
                    className="bg-white/5 border-gray-700 text-white min-h-[200px]"
                    placeholder={t('contact.form.message')}
                  />
                </div>
                
                <Button className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]">
                  {t('contact.form.send')}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className={`${styles.cardBg} rounded-lg p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <MapPin className={`h-5 w-5 ${styles.accent}`} />
                <h3 className="font-semibold">{t('contact.info.address.title')}</h3>
              </div>
              <p className={styles.textMuted}>{t('contact.info.address.text')}</p>
            </div>
            
            <div className={`${styles.cardBg} rounded-lg p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <Phone className={`h-5 w-5 ${styles.accent}`} />
                <h3 className="font-semibold">{t('contact.info.phone.title')}</h3>
              </div>
              <p className={styles.textMuted}>{t('contact.info.phone.text')}</p>
            </div>
            
            <div className={`${styles.cardBg} rounded-lg p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <Mail className={`h-5 w-5 ${styles.accent}`} />
                <h3 className="font-semibold">{t('contact.info.email.title')}</h3>
              </div>
              <p className={styles.textMuted}>{t('contact.info.email.text')}</p>
            </div>
            
            <div className={`${styles.cardBg} rounded-lg p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className={`h-5 w-5 ${styles.accent}`} />
                <h3 className="font-semibold">{t('contact.info.hours.title')}</h3>
              </div>
              <p className={styles.textMuted}>{t('contact.info.hours.text')}</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;