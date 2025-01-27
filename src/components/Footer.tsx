import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from '@/hooks/useTranslation';

const Footer = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const languages = {
    en: { name: 'English', flag: '🇬🇧' },
    hr: { name: 'Hrvatski', flag: '🇭🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' }
  };

  return (
    <footer className="py-16 bg-[#1A1F2C]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.aboutUs.title')}
            </h3>
            <p className="text-gray-400">
              {t('footer.aboutUs.description')}
            </p>
            <div className="mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-gray-400 border-gray-700">
                    <Globe className="h-4 w-4 mr-2" />
                    {languages[language].flag} {languages[language].name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {Object.entries(languages).map(([code, { name, flag }]) => (
                    <DropdownMenuItem
                      key={code}
                      onClick={() => setLanguage(code as 'en' | 'hr' | 'de')}
                      className={`${language === code ? 'bg-gray-100' : ''}`}
                    >
                      <span className="mr-2">{flag}</span>
                      {name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.quickLinks.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#8B5CF6] transition-colors">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#8B5CF6] transition-colors">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#8B5CF6] transition-colors">
                  {t('common.contact')}
                </Link>
              </li>
              <li>
                <Link to="/genres" className="text-gray-400 hover:text-[#8B5CF6] transition-colors">
                  {t('common.genres')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.customerService.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping-info" className="text-gray-400 hover:text-[#8B5CF6] transition-colors">
                  {t('footer.customerService.shippingInfo')}
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-[#8B5CF6] transition-colors">
                  {t('footer.customerService.returns')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-[#8B5CF6] transition-colors">
                  {t('footer.customerService.faq')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t('footer.newsletter.title')}
            </h3>
            <p className="text-gray-400 mb-4">
              {t('footer.newsletter.description')}
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder={t('footer.newsletter.placeholder')} 
                className="bg-gray-800 border-gray-700" 
              />
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                {t('footer.newsletter.button')}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;