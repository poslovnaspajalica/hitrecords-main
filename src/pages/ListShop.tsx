import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { albums } from '@/data/albums';
import { FaSpotify, FaDeezer, FaYoutube } from 'react-icons/fa';
import { LayoutGrid, LayoutList, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';

const ListShop = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [genre, setGenre] = useState<string>('all');

  return (
    <div className="min-h-screen bg-white">
      <Header variant="light" />
      
      {/* Hero Section with Album Mosaic */}
      <section className="relative h-[80vh] flex items-center">
        {/* Album Mosaic Background */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-1 opacity-30">
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0F9FF]/90 to-[#E0F2FE]/80" />
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <span className="text-blue-600">{t('shop.view.list')}</span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900">
              {t('shop.hero.title.list')}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              {t('shop.hero.subtitle.list')}
            </p>
            <div className="flex gap-4 pt-4">
              <Button asChild size="lg" className="bg-[#0EA5E9] hover:bg-[#0284C7] px-8">
                <Link to="/grid-shop">{t('shop.view.grid')}</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/magazine-shop">{t('shop.view.magazine')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Albums Section with Filters */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col space-y-6 mb-12">
            {/* Header with View Toggle and Filters */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-6">
              <h2 className="text-4xl font-bold text-gray-900">{t('shop.featured.title')}</h2>
              <div className="flex items-center gap-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">{t('shop.filters.title')}:</span>
                  </div>
                  
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                      <SelectValue placeholder={t('shop.filters.price.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('shop.filters.price.all')}</SelectItem>
                      <SelectItem value="0-20">{t('shop.filters.price.under20')}</SelectItem>
                      <SelectItem value="20-30">{t('shop.filters.price.between')}</SelectItem>
                      <SelectItem value="30+">{t('shop.filters.price.over30')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                      <SelectValue placeholder={t('shop.filters.genre.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('shop.filters.genre.all')}</SelectItem>
                      <SelectItem value="rock">{t('shop.filters.genre.rock')}</SelectItem>
                      <SelectItem value="pop">{t('shop.filters.genre.pop')}</SelectItem>
                      <SelectItem value="jazz">{t('shop.filters.genre.jazz')}</SelectItem>
                      <SelectItem value="classical">{t('shop.filters.genre.classical')}</SelectItem>
                      <SelectItem value="electronic">{t('shop.filters.genre.electronic')}</SelectItem>
                      <SelectItem value="hiphop">{t('shop.filters.genre.hiphop')}</SelectItem>
                      <SelectItem value="folk">{t('shop.filters.genre.folk')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {(priceRange !== 'all' || genre !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 h-9 px-3 text-sm"
                      onClick={() => {
                        setPriceRange('all');
                        setGenre('all');
                      }}
                    >
                      {t('shop.filters.clear')}
                    </Button>
                  )}
                </div>

                <div className="h-4 w-px bg-gray-200" /> {/* Divider */}

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={`h-9 w-9 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={`h-9 w-9 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Albums Grid/List View */}
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : 
            "space-y-6"
          }>
            {albums.map((album) => (
              <Link to={`/list-shop/product/${album.id}`} key={album.id} className="block group">
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square">
                      <img 
                        src={album.image} 
                        alt={album.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{album.title}</h3>
                      <p className="text-gray-600 mb-3">{album.artist}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-blue-600 font-bold">{album.price}</p>
                        <Button size="sm">{t('shop.product.addToCart')}</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="flex">
                      <div className="w-48 h-48 flex-shrink-0">
                        <img 
                          src={album.image} 
                          alt={album.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6 flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{album.title}</h3>
                          <p className="text-gray-600 mb-3">{album.artist}</p>
                          <div className="flex items-center gap-6">
                            <p className="text-blue-600 font-bold text-lg">{album.price}</p>
                            <span className="text-sm text-gray-500">{album.tracks} tracks • {album.duration}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" asChild>
                              <a href={album.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                                <FaSpotify className="h-5 w-5" />
                              </a>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <a href={album.streamingLinks.deezer} target="_blank" rel="noopener noreferrer">
                                <FaDeezer className="h-5 w-5" />
                              </a>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <a href={album.streamingLinks.youtube} target="_blank" rel="noopener noreferrer">
                                <FaYoutube className="h-5 w-5" />
                              </a>
                            </Button>
                          </div>
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            {t('shop.product.addToCart')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ListShop;
