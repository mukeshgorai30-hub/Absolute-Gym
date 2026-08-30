import React, { useEffect, useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { CafeItem } from '../types';
import { CafeOrderModal } from '../components/Modals/CafeOrderModal';
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
  Filter,
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

export const CafePage: React.FC = () => {
  const { config, themeColor } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderingItem, setOrderingItem] = useState<CafeItem | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const cafeConfig = config.cafe || {
    enabled: true,
    name: 'Absolute Gym Cafe',
    tagline: 'Precision Macro Meals, Whey Shakes & Performance Nutrition',
    description:
      'Get the nutrition you need before and after your workout with high-protein shakes, energy boosters, and healthy meals.',
    hours: '6:00 AM – 10:30 PM (Daily)',
    items: [],
  };

  const allItems = cafeConfig.items || [];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Items' || item.category === selectedCategory;

      const matchesTag =
        selectedTag === 'All' ||
        (item.tags && item.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [allItems, selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white pt-6 pb-24">
      {/* Page Hero Header */}
      <div className="relative border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-16 sm:py-24 overflow-hidden">
        {config.cafeBgImage && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={config.cafeBgImage}
              alt="Cafe Background"
              className="w-full h-full object-cover opacity-15 filter blur-xs scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/90 to-neutral-950" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-black uppercase tracking-wider text-amber-400 mb-5 shadow-lg">
            <Coffee className="w-4 h-4" />
            <span>Absolute Gym Cafe</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
            Absolute Gym Cafe
          </h1>

          <p className="mt-4 text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            {cafeConfig.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 shadow">
              <Clock className="w-4 h-4 text-amber-400" />
              <strong className="text-white">Kitchen Hours:</strong> {cafeConfig.hours}
            </span>
          </div>
        </div>
      </div>

      {/* Main Cafe Menu Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category & Search Filter Bar */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 mb-10 space-y-4 shadow-xl">
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
                      ? `${theme.accentBg} shadow-lg`
                      : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sub-Filters: Dietary Tags & Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-800/80">
            {/* Dietary Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase mr-1 whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {DIETARY_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow-md font-extrabold'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shakes, oats, macro bowls..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-neutral-900/90 rounded-3xl border border-neutral-800/90 hover:border-neutral-700 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Item Image with Badges */}
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-neutral-950 border border-neutral-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
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

                    {/* Preparation time badge */}
                    {item.preparationTime && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-neutral-700 text-[10px] font-bold text-neutral-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{item.preparationTime}</span>
                      </div>
                    )}

                    {/* Macros overlay bar */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
                      {item.proteinGrams !== undefined && (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center gap-1 shadow">
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

                  {/* Item Info */}
                  <div className="mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 block mb-0.5">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-black uppercase text-white group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Macros info pill */}
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

                {/* Card Bottom: Price & Quick Order */}
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
                    <span>Order at Cafe</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800">
            <Coffee className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
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
              className="mt-4 px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition"
            >
              Reset Filters
            </button>
          </div>
        )}


      </div>

      {/* Interactive Cafe Order Modal */}
      <CafeOrderModal
        item={orderingItem}
        isOpen={!!orderingItem}
        onClose={() => setOrderingItem(null)}
      />
    </div>
  );
};
