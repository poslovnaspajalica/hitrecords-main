import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const genreImages = {
  rock: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee',
  jazz: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629',
  electronic: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
  classical: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76',
  hiphop: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
  pop: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae'
} as const;

const genres = [
  'rock',
  'jazz',
  'electronic',
  'classical',
  'hiphop',
  'pop'
] as const;

const Genres = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <Header variant={theme === 'light' ? 'light' : theme === 'magazine' ? 'magazine' : 'dark'} />
      
      <main className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-12 text-center">{t('genres.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {genres.map((genre) => (
            <div key={genre} className={`group relative overflow-hidden rounded-lg ${styles.cardBg}`}>
              <img 
                src={genreImages[genre]}
                alt={t(`genres.categories.${genre}.name`)}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-semibold mb-2">
                  {t(`genres.categories.${genre}.name`)}
                </h3>
                <p className={`${styles.textMuted} mb-4`}>
                  {t(`genres.categories.${genre}.description`)}
                </p>
                <Button 
                  variant="secondary"
                  className="w-full justify-center"
                >
                  {t('genres.explore', { 
                    genre: t(`genres.categories.${genre}.name`).toLowerCase() 
                  })}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Genres;