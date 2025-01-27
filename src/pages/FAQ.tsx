import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const FAQ = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-12">{t('faq.title')}</h1>
        
        <div className={`${styles.cardBg} rounded-lg p-8`}>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('faq.shipping.question')}</AccordionTrigger>
              <AccordionContent>{t('faq.shipping.answer')}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>{t('faq.payment.question')}</AccordionTrigger>
              <AccordionContent>{t('faq.payment.answer')}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>{t('faq.returns.question')}</AccordionTrigger>
              <AccordionContent>{t('faq.returns.answer')}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>{t('faq.international.question')}</AccordionTrigger>
              <AccordionContent>{t('faq.international.answer')}</AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>{t('faq.tracking.question')}</AccordionTrigger>
              <AccordionContent>{t('faq.tracking.answer')}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ; 