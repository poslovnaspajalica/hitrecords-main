import React from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Play, Music, Headphones, Youtube } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { albums } from '@/data/albums';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/lib/utils';
import { FaSpotify, FaDeezer, FaYoutube } from 'react-icons/fa';

const MagazineProductDetail = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const { id } = useParams();
  const album = albums.find(a => a.id === Number(id));

  if (!album) {
    return <div>{t('product.notFound')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-orange-300">
      <Header variant="magazine" />
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative">
            <img 
              src={album.image}
              alt={album.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
          
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{album.title}</h1>
              <p className="text-2xl text-white/80">{album.artist}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-white/80">
                <div>
                  <span className="block font-semibold">{t('product.details.releaseDate')}</span>
                  <span>{album.duration}</span>
                </div>
                <div>
                  <span className="block font-semibold">{t('product.details.duration')}</span>
                  <span>{album.duration}</span>
                </div>
                <div>
                  <span className="block font-semibold">{t('product.details.tracks')}</span>
                  <span>{t('product.details.tracksCount', { count: album.tracks.toString() })}</span>
                </div>
                <div>
                  <span className="block font-semibold">{t('product.details.price')}</span>
                  <span className="text-2xl font-bold text-white">{album.price}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg">
                {t('product.details.actions.addToCart')}
              </Button>
              <Button variant="secondary" size="icon" aria-label={t('product.details.actions.addToWishlist')}>
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" aria-label={t('product.details.actions.play')}>
                <Play className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-xl font-semibold text-white mb-4">{t('product.details.listenOn')}</h3>
              <div className="flex gap-4">
                <Button variant="secondary" size="icon" asChild className="bg-white/10 hover:bg-white/20" aria-label={t('product.details.actions.stream.spotify')}>
                  <a href={album.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                    <FaSpotify className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="secondary" size="icon" asChild className="bg-white/10 hover:bg-white/20" aria-label={t('product.details.actions.stream.deezer')}>
                  <a href={album.streamingLinks.deezer} target="_blank" rel="noopener noreferrer">
                    <FaDeezer className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="secondary" size="icon" asChild className="bg-white/10 hover:bg-white/20" aria-label={t('product.details.actions.stream.youtube')}>
                  <a href={album.streamingLinks.youtube} target="_blank" rel="noopener noreferrer">
                    <FaYoutube className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagazineProductDetail;