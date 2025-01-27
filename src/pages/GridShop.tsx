import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { albums } from '@/data/albums';

const GridShop = () => {
  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Header />
      
      {/* Hero Section with Album Mosaic */}
      <section className="relative h-[80vh] flex items-center">
        {/* Album Mosaic Background */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-1 opacity-40">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <span className="text-[#8B5CF6] font-semibold text-lg">Our Collection</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Explore Our <br/>
              Music Collection
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Browse through our extensive collection of albums, featuring everything from 
              classic vinyl to modern digital releases.
            </p>
            <div className="flex gap-4 pt-4">
              <Button asChild size="lg" className="bg-[#8B5CF6] hover:bg-[#7C3AED] px-8">
                <Link to="/list-shop">View List</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-[#1E293B] hover:bg-gray-100">
                <Link to="/magazine-shop">Magazine View</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Albums Section */}
      <section className="bg-[#1E293B] py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-white">All Albums</h2>
            <Button variant="ghost" className="text-[#8B5CF6] hover:text-[#7C3AED]" asChild>
              <Link to="/list-shop">Switch to List View</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {albums.map((album) => (
              <Link to={`/grid-shop/product/${album.id}`} key={album.id} className="block group">
                <div className="bg-[#2A2F3C] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300 flex flex-col">
                  <div className="relative w-full pt-[100%] overflow-hidden">
                    <img 
                      src={album.image} 
                      alt={album.title} 
                      className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{album.title}</h3>
                    <p className="text-gray-400 mb-3">{album.artist}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-[#8B5CF6] font-bold text-lg">{album.price}</p>
                      <span className="text-sm text-gray-400">{album.tracks} tracks</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GridShop;