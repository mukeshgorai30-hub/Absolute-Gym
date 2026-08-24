import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { CafeItem } from '../types';
import { CafeOrderModal } from './Modals/CafeOrderModal';
import {
  Coffee,
  Zap,
  Flame,
  Clock,
  Sparkles,
  Search,
  CheckCircle,
  Plus,
  ShieldCheck,
  Award,
  ArrowRight,
  ShoppingBag,
  Apple,
} from 'lucide-react';

const CATEGORIES = [
  'All Items',
  'Protein Shakes & Smoothies',
  'Pre-Workout & Energy',
  'Healthy Bowls & Meals',
  'Snacks & Protein Bars',
  'Cold Brew & Beverages',
];

const DIETARY_TAGS = ['All', 'High Protein', 'Bestseller', 'Sugar-Free', 'Keto', 'Vegan'];

export const CafeSection: React.FC = () => {
  const { config, themeColor, setIsAdminOpen, setAdminTab, setCurrentPage } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderingItem, setOrderingItem] = useState<CafeItem | null>(null);

  const cafeConfig = config.cafe || {
    enabled: true,
    name: 'Absolute Gym Cafe',
    tagline: 'Precision Macro Meals, Whey Shakes & Performance Nutrition',
    description:
      'Fuel your workout before and refuel your muscles immediately after with our certified organic smoothies, whey isolate blends, pre-workout shots, and chef-curated macro bowls.',
    hours: '6:00 AM – 10:30 PM (Daily)',
    items: [],
  };

  const allItems = cafeConfig.items || [];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'All Items' || item.category === selectedCategory;

      // Tag filter
      const matchesTag =
        selectedTag === 'All' ||
        (item.tags && item.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [allItems, selectedCategory, selectedTag, searchQuery]);

  if (cafeConfig.enabled === false) {
    return null;
  }

  return (
    <section
      id="cafe"
      className="relative w-full max-w-full py-20 sm:py-28 bg-neutral-950 text-white overflow-hidden border-t border-neutral-800"
    >
      {/* Background Graphic / Overlay */}
      {config.cafeBgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: `url(${config.cafeBgImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/90 to-neutral-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-black uppercase tracking-widest text-amber-400">
              <Coffee className="w-3.5 h-3.5" />
              <span>Absolute Gym Cafe</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              PERFORMANCE FUEL & CLEAN NUTRITION
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              {cafeConfig.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-white">Hours:</strong> {cafeConfig.hours}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? `${theme.accentBg} shadow-lg shadow-amber-500/10`
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sub-Filters: Dietary Tags & Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Dietary Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase mr-1 whitespace-nowrap">
                Filter by:
              </span>
              {DIETARY_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shakes, oats, bowls..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
            </div>
          </div>
        </div>

        {/* Menu Items: Horizontal Scroll on Mobile, Grid on Desktop */}
        {filteredItems.length > 0 ? (
          <>
            {/* Mobile Swipe Indicator Hint */}
            <div className="flex md:hidden items-center justify-between text-xs text-neutral-400 mb-3 px-1">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                <span>← Swipe fuel menu horizontally →</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {filteredItems.length} items
              </span>
            </div>

            <div className="w-full max-w-full overflow-hidden">
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 md:scroll-px-0 pb-6 md:pb-0 px-4 sm:px-6 md:px-0 scrollbar-none touch-auto">
                {filteredItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="group bg-neutral-900/90 rounded-3xl border border-neutral-800/90 hover:border-neutral-700 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 w-[82vw] sm:w-[320px] max-w-[340px] shrink-0 snap-center md:snap-align-none md:w-auto md:max-w-none md:shrink"
                    >
                  <div>
                    {/* Item Image with Badges */}
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-neutral-950 border border-neutral-800">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Tag badges top left */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {item.tags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-neutral-700 text-[10px] font-black uppercase tracking-wider text-amber-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Preparation time badge top right */}
                      {item.preparationTime && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-neutral-700 text-[10px] font-bold text-neutral-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{item.preparationTime}</span>
                        </div>
                      )}

                      {/* Macros overlay bar at bottom of image */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
                        {item.proteinGrams !== undefined && (
                          <div className="px-2 py-1 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center gap-1 shadow">
                            <Zap className="w-3.5 h-3.5 fill-black" />
                            <span>{item.proteinGrams}g Protein</span>
                          </div>
                        )}

                        {item.calories !== undefined && (
                          <div className="px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1 border border-neutral-700">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            <span>{item.calories} kcal</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category Label & Item Title */}
                    <div className="mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 block mb-0.5">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-black uppercase text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Additional Macro Nutrition Pills */}
                    {(item.carbsGrams !== undefined || item.fatsGrams !== undefined) && (
                      <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400 mb-4">
                        {item.carbsGrams !== undefined && (
                          <span>
                            <strong className="text-neutral-200">{item.carbsGrams}g</strong> Carbs
                          </span>
                        )}
                        {item.fatsGrams !== undefined && (
                          <span>
                            <strong className="text-neutral-200">{item.fatsGrams}g</strong> Fats
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-emerald-400 font-bold uppercase">
                          Clean Macros ✓
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Price & Quick Order Button */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Price</span>
                      <div className="text-xl font-black font-mono text-white">
                        {currency}{(item.price ?? 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOrderingItem(item)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-md ${theme.accentBg}`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Members Only - Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-neutral-900/50 rounded-3xl border border-neutral-800">
            <Coffee className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white uppercase">No cafe items found</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              No items match your selected filters. Try choosing "All Items" or reset your search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Items');
                setSelectedTag('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Dedicated Cafe Page Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              setCurrentPage('cafe');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:text-amber-400 transition-all shadow-lg"
          >
            <span>Explore Absolute Gym Cafe Full Menu & Online Ordering</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cafe Quality & Fresh Guarantee Strip */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white mb-1">Ultra-Filtered Whey Isolate</h4>
              <p className="text-neutral-400 leading-relaxed">
                Zero chalky fillers. We exclusively blend micro-filtered, 100% grass-fed whey isolate and plant proteins for instant bio-availability.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white mb-1">Organic Whole Foods</h4>
              <p className="text-neutral-400 leading-relaxed">
                Farm-fresh spinach, Hass avocados, raw oats, cold-pressed almond milk, and antioxidant berries delivered fresh every morning.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white mb-1">Post-Workout Ready on Exit</h4>
              <p className="text-neutral-400 leading-relaxed">
                Pre-order before your workout or cooldown, and your chilled shake or warm macro bowl will be waiting for you at the front desk counter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cafe Order Modal */}
      <CafeOrderModal
        item={orderingItem}
        isOpen={!!orderingItem}
        onClose={() => setOrderingItem(null)}
      />
    </section>
  );
};
