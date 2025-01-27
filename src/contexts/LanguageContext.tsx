import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hr' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Prvo provjeri localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) return savedLanguage as Language;
    
    // Ako nema u localStorage, provjeri browser jezik
    const browserLang = navigator.language.split('-')[0];
    if (['hr', 'de'].includes(browserLang)) return browserLang as Language;
    
    // Default na engleski
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 