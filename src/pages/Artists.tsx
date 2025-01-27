import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { artists } from '@/data/artists';
import { useTranslation } from '@/hooks/useTranslation';
import { FaSpotify, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

type ViewMode = 'grid' | 'list';

const Artists = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredArtists = artists
    .filter(artist => 
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedGenre === 'all' || artist.genres.includes(selectedGenre))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const uniqueGenres = Array.from(
    new Set(artists.flatMap(artist => artist.genres))
  ).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('artists.title')}</h1>
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

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('artists.search.placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('artists.filter.genre')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('genres.allGenres')}</SelectItem>
              {uniqueGenres.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('artists.filter.sort.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t('artists.filter.sort.name')}</SelectItem>
              <SelectItem value="popularity">{t('artists.filter.sort.popularity')}</SelectItem>
              <SelectItem value="releases">{t('artists.filter.sort.releases')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map(artist => (
              <div key={artist.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{artist.name}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                  <div className="flex items-center gap-2 mb-4">
                    {artist.social.spotify && (
                      <a 
                        href={artist.social.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-500 transition-colors"
                        title={t('artists.social.spotify')}
                      >
                        <FaSpotify className="h-5 w-5" />
                      </a>
                    )}
                    {artist.social.instagram && (
                      <a 
                        href={artist.social.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                        title={t('artists.social.instagram')}
                      >
                        <FaInstagram className="h-5 w-5" />
                      </a>
                    )}
                    {artist.social.facebook && (
                      <a 
                        href={artist.social.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title={t('artists.social.facebook')}
                      >
                        <FaFacebook className="h-5 w-5" />
                      </a>
                    )}
                    {artist.social.twitter && (
                      <a 
                        href={artist.social.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title={t('artists.social.twitter')}
                      >
                        <FaTwitter className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/artists/${artist.id}`} className="flex items-center justify-center gap-2">
                      {t('artists.viewAll')}
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full h-6 px-2 text-sm">
                        {artist.releases.length}
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            {filteredArtists.map(artist => (
              <Link
                key={artist.id}
                to={`/artists/${artist.id}`}
                className="flex items-center p-4 hover:bg-gray-50 border-b last:border-b-0"
              >
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4 flex-1">
                  <h2 className="font-semibold">{artist.name}</h2>
                  <p className="text-sm text-gray-500">{artist.genres.join(', ')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {t('artists.releases')}: 
                    <span className="ml-1 font-semibold text-gray-900">
                      {artist.releases.length}
                    </span>
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Artists; 