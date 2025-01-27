import { useLanguage } from '@/contexts/LanguageContext';
import { en } from '@/translations/en';
import { hr } from '@/translations/hr';
import { de } from '@/translations/de';

const translations = {
  en,
  hr,
  de,
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value[k] === undefined) {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        return key;
      }
      value = value[k];
    }
    
    if (params) {
      return Object.entries(params).reduce((acc, [key, value]) => {
        return acc.replace(`{{${key}}}`, value);
      }, value);
    }
    
    return value;
  };

  return { t };
}; 