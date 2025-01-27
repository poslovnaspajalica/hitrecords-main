import React from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { albums } from '@/data/albums';
import { useTranslation } from '@/hooks/useTranslation';
import { FaSpotify, FaDeezer, FaYoutube } from 'react-icons/fa';

const ListProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const album = albums.find(a => a.id === Number(id));

  if (!album) {
    return <div>{t('product.notFound')}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header variant="light" />
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative">
              <img 
                src={album.image}
                alt={album.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-gray-900">{album.title}</h1>
                <p className="text-2xl text-gray-600">{album.artist}</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block font-semibold text-gray-900">{t('product.details.releaseDate')}</span>
                    <span className="text-gray-600">{album.duration}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-gray-900">{t('product.details.duration')}</span>
                    <span className="text-gray-600">{album.duration}</span>
                  </div>
                  <div>
                    <span className="block font-semibold text-gray-900">{t('product.details.tracks')}</span>
                    <span className="text-gray-600">
                      {t('product.details.tracksCount', { count: album.tracks.toString() })}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-gray-900">{t('product.details.price')}</span>
                    <span className="text-2xl font-bold text-blue-600">{album.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  {t('product.details.actions.addToCart')}
                </Button>
                <Button variant="outline" size="icon" aria-label={t('product.details.actions.addToWishlist')}>
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" aria-label={t('product.details.actions.play')}>
                  <Play className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{t('product.details.listenOn')}</h3>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon" asChild aria-label={t('product.details.actions.stream.spotify')}>
                    <a href={album.streamingLinks.spotify} target="_blank" rel="noopener noreferrer">
                      <FaSpotify className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild aria-label={t('product.details.actions.stream.deezer')}>
                    <a href={album.streamingLinks.deezer} target="_blank" rel="noopener noreferrer">
                      <FaDeezer className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild aria-label={t('product.details.actions.stream.youtube')}>
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
    </div>
  );
};

export default ListProductDetail;