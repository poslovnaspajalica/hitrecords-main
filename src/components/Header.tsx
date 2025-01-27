import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, ChevronDown, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderProps {
  variant?: 'light' | 'dark' | 'magazine';
}

const Header = ({ variant = 'dark' }: HeaderProps) => {
  const { t } = useTranslation();
  const isLight = variant === 'light';
  const isMagazine = variant === 'magazine';
  
  return (
    <header className={`sticky top-0 z-50 w-full border-b ${
      variant === 'magazine' ? 'bg-white/10 backdrop-blur-md border-white/20' :
      isLight ? 'bg-white border-gray-200' : 'bg-[#1E293B] border-gray-800'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-[#8B5CF6]">
              {t('common.brand')}
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className={`${
                variant === 'magazine' ? 'text-white hover:text-white/80' :
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
              }`}>
                {t('common.home')}
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-1 ${
                  variant === 'magazine' ? 'text-white hover:text-white/80' :
                  isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
                }`}>
                  {t('common.shop')}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link to="/grid-shop">{t('shop.view.grid')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/list-shop">{t('shop.view.list')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/magazine-shop">{t('shop.view.magazine')}</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/artists" className={`${
                variant === 'magazine' ? 'text-white hover:text-white/80' :
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
              }`}>
                {t('common.artists')}
              </Link>

              <Link to="/genres" className={`${
                variant === 'magazine' ? 'text-white hover:text-white/80' :
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
              }`}>
                {t('common.genres')}
              </Link>

              <Link to="/about" className={`${
                variant === 'magazine' ? 'text-white hover:text-white/80' :
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
              }`}>
                {t('common.about')}
              </Link>

              <Link to="/contact" className={`${
                variant === 'magazine' ? 'text-white hover:text-white/80' :
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'
              }`}>
                {t('common.contact')}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost"
                  className={`${isLight ? 'text-gray-600' : 'text-gray-200'} hover:text-[#8B5CF6]`}
                >
                  <Search className="h-5 w-5 mr-2" />
                  {t('common.search')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('search.title')}</DialogTitle>
                </DialogHeader>
                <Input 
                  placeholder={t('search.placeholder')} 
                  className="mt-4"
                />
              </DialogContent>
            </Dialog>

            <Link to="/cart">
              <Button 
                variant="ghost"
                className={`${isLight ? 'text-gray-600' : 'text-gray-200'} hover:text-[#8B5CF6]`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('common.cart')}
              </Button>
            </Link>

            <Link to="/auth">
              <Button 
                variant="ghost"
                className={`${isLight ? 'text-gray-600' : 'text-gray-200'} hover:text-[#8B5CF6]`}
              >
                <User className="h-5 w-5 mr-2" />
                {t('common.signIn')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;