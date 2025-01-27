import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutGrid, List, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { artists } from '@/data/artists';
import { albums } from '@/data/albums';
import { useTranslation } from '@/hooks/useTranslation';
import { FaSpotify, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

type ViewMode = 'grid' | 'list';

const ArtistDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const artist = artists.find(a => a.id === Number(id));
  const artistAlbums = albums.filter(album => artist?.releases.includes(album.id));
  
  const filteredAlbums = artistAlbums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!artist) {
    return <div>{t('product.notFound')}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Artist Header */}
        <div className="mb-12">
          <div className="flex items-center gap-8">
            <img 
              src={artist.image} 
              alt={artist.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{artist.name}</h1>
              <p className="text-gray-600 mb-4">{artist.bio}</p>
              <div className="flex items-center gap-4">
                {artist.social.spotify && (
                  <a 
                    href={artist.social.spotify} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <FaSpotify className="h-6 w-6" />
                  </a>
                )}
                {artist.social.instagram && (
                  <a 
                    href={artist.social.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    <FaInstagram className="h-6 w-6" />
                  </a>
                )}
                {artist.social.facebook && (
                  <a 
                    href={artist.social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <FaFacebook className="h-6 w-6" />
                  </a>
                )}
                {artist.social.twitter && (
                  <a 
                    href={artist.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <FaTwitter className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('artists.releases')} ({artistAlbums.length})
          </h2>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-400'}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-400'}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search.placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAlbums.map(album => (
              <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={album.image} 
                  alt={album.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{album.title}</h3>
                  <p className="text-sm text-gray-500">{album.tracks} tracks</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">{album.price}</span>
                    <Button size="sm">
                      {t('product.details.actions.addToCart')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md divide-y">
            {filteredAlbums.map(album => (
              <div key={album.id} className="p-4 flex items-center gap-4">
                <img 
                  src={album.image} 
                  alt={album.title}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{album.title}</h3>
                  <p className="text-sm text-gray-500">{album.tracks} tracks</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600 mb-2">{album.price}</div>
                  <Button size="sm">
                    {t('product.details.actions.addToCart')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ArtistDetail; 