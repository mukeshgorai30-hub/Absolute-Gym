import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { GalleryItem } from '../types';
import {
  Image as ImageIcon,
  Maximize2,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Flame,
  Award,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { config, themeColor, setCurrentPage, setIsTrialModalOpen } = useGym();
  const theme = themeStyles[themeColor];

  const categories = [
    'All',
    'Gym Floor',
    'Recovery & Spa',
    'Classes & Studio',
    'Equipment',
  ];

  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const galleryList = config.gallery || [];
  const filteredGallery = galleryList.filter((item) => {
    if (selectedCat === 'All' || selectedCat === 'Gallery') return true;
    return item.category === selectedCat;
  });

  const selectedPhoto =
    selectedPhotoIndex !== null && filteredGallery[selectedPhotoIndex]
      ? filteredGallery[selectedPhotoIndex]
      : null;

  // Keyboard navigation for photo lightbox
  React.useEffect(() => {
    if (selectedPhotoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (e.key === 'ArrowLeft') {
        if (selectedPhotoIndex > 0) {
          setSelectedPhotoIndex(selectedPhotoIndex - 1);
        } else {
          setSelectedPhotoIndex(filteredGallery.length - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedPhotoIndex < filteredGallery.length - 1) {
          setSelectedPhotoIndex(selectedPhotoIndex + 1);
        } else {
          setSelectedPhotoIndex(0);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, filteredGallery.length]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    } else if (selectedPhotoIndex === 0) {
      setSelectedPhotoIndex(filteredGallery.length - 1);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null && selectedPhotoIndex < filteredGallery.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    } else if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(0);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      {/* Hero Banner Header */}
      <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-b border-neutral-800 overflow-hidden">
        {/* Background Image / Ambient Glow */}
        {config.galleryBgImage && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={config.galleryBgImage}
              alt="Inside Facility Atmosphere"
              className="w-full h-full object-cover opacity-15 filter blur-xs scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/90 to-neutral-950" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
            <button
              type="button"
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-amber-400 font-bold">Inside Absolute Gym Facility</span>
          </div>

          <div className="max-w-3xl">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${theme.accentBadge}`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Explore our Gym</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
              Inside <span className={theme.accentText}>{config.name || 'Absolute Gym'}</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-300 leading-relaxed">
              Check out our workout areas, weightlifting zones, relaxing steam rooms, and group fitness studios.
            </p>
          </div>

          {/* Facility Key Metrics / Amenities Strip */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">15,000+</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                Sq Ft Floor Arena
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">Pro Equipment</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                Competition Platforms
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">Steam & Spa</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                Recovery Suite
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">Cafe area</div>
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-1">
                Clean Nutrition Cafe
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Gallery Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCat === cat
                    ? `${theme.accentBg} shadow-lg scale-102`
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-neutral-400">
            Showing <span className="text-white font-bold">{filteredGallery.length}</span> verified photographs
          </div>
        </div>

        {/* Gallery Image Grid */}
        {filteredGallery.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-neutral-900/50 border border-neutral-800">
            <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white uppercase">No photos in this category</h3>
            <p className="text-sm text-neutral-400 mt-1">Select "All" to view all facility pictures.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item: GalleryItem, idx: number) => (
              <div
                key={item.id || idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className="group relative h-80 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/30 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

                {/* Overlay Metadata */}
                <div className="absolute top-4 right-4 p-2.5 rounded-full bg-neutral-950/70 backdrop-blur-md border border-neutral-700 text-white opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                  <Maximize2 className="w-4 h-4" />
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.accentBadge}`}
                    >
                      {item.category || 'Gym Floor'}
                    </span>
                    <h3 className="text-lg font-black text-white uppercase mt-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Free VIP Trial Pass Strip */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complimentary Guest Access</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">
              Experience the equipment in person
            </h3>
            <p className="text-sm text-neutral-400 mt-2">
              Book a 1-day VIP workout pass to experience our platforms, steam therapy suites, and athlete community firsthand.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrentPage('plans');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition"
            >
              View Membership Rates
            </button>
            <button
              type="button"
              onClick={() => setIsTrialModalOpen(true)}
              className={`px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg ${theme.accentBg}`}
            >
              Send Inquiry / Book Tour
            </button>
          </div>
        </div>
      </section>

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          id="gallery-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 z-20 p-3 rounded-full bg-neutral-950/80 text-white hover:bg-neutral-800 transition border border-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-neutral-950/80 text-white hover:bg-neutral-800 transition border border-neutral-700"
              title="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-neutral-950/80 text-white hover:bg-neutral-800 transition border border-neutral-700"
              title="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Lightbox Image */}
            <div className="relative bg-black flex items-center justify-center min-h-[50vh] max-h-[75vh] overflow-hidden">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="w-full h-full max-h-[75vh] object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Caption Bar */}
            <div className="p-6 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.accentText}`}>
                  {selectedPhoto.category}
                </span>
                <h3 className="text-xl font-black text-white uppercase mt-0.5">
                  {selectedPhoto.title}
                </h3>
              </div>
              <div className="text-xs text-neutral-400 font-semibold">
                Photo {selectedPhotoIndex! + 1} of {filteredGallery.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
