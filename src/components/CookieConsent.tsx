import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const CookieConsent = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm mr-8">{t('cookieConsent.message')}</p>
        <div className="flex items-center gap-4">
          <Button onClick={handleAccept} variant="secondary">
            {t('cookieConsent.accept')}
          </Button>
          <Button onClick={handleDecline} variant="ghost">
            {t('cookieConsent.decline')}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDecline}
            aria-label={t('cookieConsent.decline')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 