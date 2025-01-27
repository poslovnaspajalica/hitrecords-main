import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { albums } from '@/data/albums';
import { FaSpotify, FaDeezer, FaYoutube } from 'react-icons/fa';
import { Play, Heart } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const MagazineShop = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-orange-300">
      <Header variant="magazine" />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        {/* Album Mosaic Background */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-1 opacity-20">
          {albums.slice(0, 8).map((album, index) => (
            <div key={index} className="w-full h-full">
              <img 
                src={album.image} 
                alt={album.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/95 to-orange-800/90" />
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <span className="text-white/90 font-semibold text-lg">{t('shop.view.magazine')}</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              {t('shop.hero.title.magazine')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              {t('shop.hero.subtitle.magazine')}
            </p>
            <div className="flex gap-4 pt-4">
              <Button asChild size="lg" className="bg-white text-rose-500 hover:bg-white/90 px-8">
                <Link to="/grid-shop">{t('shop.view.grid')}</Link>
              </Button>
              <Button asChild size="lg" className="bg-rose-500 text-white hover:bg-rose-600">
                <Link to="/list-shop">{t('shop.view.list')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Albums Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-white">{t('shop.featured.title')}</h2>
            <Button className="bg-rose-500 text-white hover:bg-rose-600" asChild>
              <Link to="/list-shop">{t('shop.view.list')}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {albums.map((album) => (
              <Link to={`/magazine-shop/product/${album.id}`} key={album.id} className="group">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg hover:bg-white/20 transition-all">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={album.image}
                      alt={album.title} 
                      className="w-full aspect-square object-cover transform group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{album.title}</h3>
                  <p className="text-base text-white/80 mb-2">{album.artist}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-white">{album.price}</span>
                    <span className="text-sm text-white/70">{album.tracks} {t('shop.product.tracks')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="icon" asChild className="bg-white/10 hover:bg-white/20">
                        <a href={album.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                          <FaSpotify className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="secondary" size="icon" asChild className="bg-white/10 hover:bg-white/20">
                        <a href={album.streamingLinks.deezer} target="_blank" rel="noopener noreferrer">
                          <FaDeezer className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="secondary" size="icon" asChild className="bg-white/10 hover:bg-white/20">
                        <a href={album.streamingLinks.youtube} target="_blank" rel="noopener noreferrer">
                          <FaYoutube className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <Button variant="secondary" className="bg-white text-rose-500 hover:bg-white/90 text-sm">
                      {t('shop.product.addToCart')}
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient prijelaz prije footera */}
      <div className="h-24 bg-gradient-to-b from-transparent to-rose-900" />

      {/* Footer s prilagođenim stilovima za magazine temu */}
      <div className="bg-rose-900">
        <Footer />
      </div>
    </div>
  );
};

export default MagazineShop;
