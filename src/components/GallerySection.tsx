import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { GalleryItem } from '../types';
import { Image, Maximize2, X, Eye } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { config, themeColor } = useGym();
  const theme = themeStyles[themeColor];

  const categories = ['Gallery', 'Gym Floor', 'Recovery & Spa', 'Classes & Studio', 'Equipment'];
  const [selectedCat, setSelectedCat] = useState<string>('Gallery');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filteredGallery = config.gallery.filter((item) => {
    if (selectedCat === 'Gallery' || selectedCat === 'All') return true;
    return item.category === selectedCat;
  });

  return (
    <section id="gallery" className="w-full max-w-full py-24 bg-neutral-950 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.galleryBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.galleryBgImage}
            alt="Gallery Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/85 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <Image className="w-3.5 h-3.5" />
            <span>Facility Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Inside {config.name || 'Absolute Gym'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Take a visual tour through our pristine training arenas, recovery lounges, and athlete studios.
          </p>

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`gallery-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCat === cat
                    ? `${theme.accentBg} shadow-md`
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item: GalleryItem) => (
            <div
              key={item.id}
              id={`gallery-item-${item.id}`}
              onClick={() => setSelectedPhoto(item)}
              className="group relative h-72 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer transition-all duration-300 hover:border-neutral-600 shadow-md"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

              {/* Caption & Category */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${theme.accentBadge}`}>
                    {item.category}
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-1.5 uppercase tracking-tight">
                    {item.title}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Photo Lightbox Modal */}
        {selectedPhoto && (
          <div
            id="gallery-lightbox-modal"
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="close-lightbox-btn"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-950/80 text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="w-full max-h-[70vh] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-6 bg-neutral-950 flex items-center justify-between">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${theme.accentText}`}>
                    {selectedPhoto.category}
                  </span>
                  <h3 className="text-xl font-black text-white uppercase mt-0.5">
                    {selectedPhoto.title}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
