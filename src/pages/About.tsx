import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const About = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-12 text-center">{t('about.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4"
              alt={t('about.title')}
              className="rounded-lg shadow-xl"
            />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t('about.story.title')}</h2>
            <p className={styles.textMuted}>
              {t('about.story.description')}
            </p>
            
            <h2 className="text-2xl font-semibold">{t('about.mission.title')}</h2>
            <p className={styles.textMuted}>
              {t('about.mission.description')}
            </p>
            
            <Button>{t('about.cta')}</Button>
          </div>
        </div>
        
        <div className="mt-24">
          <h2 className="text-2xl font-semibold mb-8 text-center">{t('about.features.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${styles.cardBg} p-6 rounded-lg text-center`}>
              <h3 className="text-xl font-semibold mb-4">{t('about.features.quality.title')}</h3>
              <p className={styles.textMuted}>{t('about.features.quality.description')}</p>
            </div>
            
            <div className={`${styles.cardBg} p-6 rounded-lg text-center`}>
              <h3 className="text-xl font-semibold mb-4">{t('about.features.team.title')}</h3>
              <p className={styles.textMuted}>{t('about.features.team.description')}</p>
            </div>
            
            <div className={`${styles.cardBg} p-6 rounded-lg text-center`}>
              <h3 className="text-xl font-semibold mb-4">{t('about.features.service.title')}</h3>
              <p className={styles.textMuted}>{t('about.features.service.description')}</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;