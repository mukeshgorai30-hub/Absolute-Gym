import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { CafeItem, CafeCategory } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import {
  Coffee,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Zap,
  Flame,
  Clock,
  Sparkles,
  Save,
  Image,
  Eye,
  SlidersHorizontal,
  X,
  CheckCircle,
  Apple,
} from 'lucide-react';

const STANDARD_CATEGORIES: CafeCategory[] = [
  'Protein Shakes & Smoothies',
  'Pre-Workout & Energy',
  'Healthy Bowls & Meals',
  'Snacks & Protein Bars',
  'Cold Brew & Beverages',
];

const PRESET_CAFE_IMAGES = [
  {
    name: 'Protein Shake (Chocolate)',
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Green Detox Smoothie',
    url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Berry Protein Blast',
    url: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Cold Brew Coffee',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pre-Workout Fuel',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chicken Quinoa Bowl',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Vegan Power Bowl',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Protein Oats Jar',
    url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Protein / Keto Bar',
    url: 'https://images.unsplash.com/photo-1622484216850-4d4361541c88?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Hydration Coconut Slush',
    url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
  },
];

interface CafeManagerTabProps {
  onNotify: (msg: string) => void;
}

export const CafeManagerTab: React.FC<CafeManagerTabProps> = ({ onNotify }) => {
  const {
    config,
    updateConfig,
    themeColor,
    addCafeItem,
    updateCafeItem,
    deleteCafeItem,
    updateCafeConfig,
  } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  const cafeConfig = config.cafe || {
    enabled: true,
    name: 'Absolute Fuel Bar & Clean Cafe',
    tagline: 'Precision Macro Meals, Whey Shakes & Performance Nutrition',
    description:
      'Get the nutrition you need before and after your workout with high-protein shakes, energy boosters, and healthy meals.',
    hours: '6:00 AM – 10:30 PM (Daily)',
    items: [],
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CafeItem | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>(STANDARD_CATEGORIES[0]);
  const [formPrice, setFormPrice] = useState<number>(199);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(PRESET_CAFE_IMAGES[0].url);
  const [formCalories, setFormCalories] = useState<number>(350);
  const [formProtein, setFormProtein] = useState<number>(30);
  const [formCarbs, setFormCarbs] = useState<number>(35);
  const [formFats, setFormFats] = useState<number>(8);
  const [formPrepTime, setFormPrepTime] = useState('3-5 mins');
  const [formTags, setFormTags] = useState('High Protein, Bestseller');
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // Cafe General Settings fields
  const [cafeName, setCafeName] = useState(cafeConfig.name || 'Absolute Fuel Bar & Clean Cafe');
  const [cafeTagline, setCafeTagline] = useState(cafeConfig.tagline || '');
  const [cafeHours, setCafeHours] = useState(cafeConfig.hours || '6:00 AM – 10:30 PM (Daily)');
  const [cafeDesc, setCafeDesc] = useState(cafeConfig.description || '');
  const [cafeEnabled, setCafeEnabled] = useState(cafeConfig.enabled !== false);
  const [cafeBgImage, setCafeBgImage] = useState(config.cafeBgImage || '');

  const items = cafeConfig.items || [];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(STANDARD_CATEGORIES[0]);
    setFormPrice(199);
    setFormDescription('Delicious high-protein performance blend crafted with pure whey isolate.');
    setFormImage(PRESET_CAFE_IMAGES[0].url);
    setFormCalories(350);
    setFormProtein(35);
    setFormCarbs(30);
    setFormFats(6);
    setFormPrepTime('3-5 mins');
    setFormTags('High Protein, Bestseller');
    setFormIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CafeItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormCalories(item.calories || 0);
    setFormProtein(item.proteinGrams || 0);
    setFormCarbs(item.carbsGrams || 0);
    setFormFats(item.fatsGrams || 0);
    setFormPrepTime(item.preparationTime || '3-5 mins');
    setFormTags((item.tags || []).join(', '));
    setFormIsAvailable(item.isAvailable !== false);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter an item name');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      // Update
      const updated: CafeItem = {
        ...editingItem,
        name: formName,
        category: formCategory,
        price: Number(formPrice) || 0,
        description: formDescription,
        image: formImage || PRESET_CAFE_IMAGES[0].url,
        calories: Number(formCalories) || 0,
        proteinGrams: Number(formProtein) || 0,
        carbsGrams: Number(formCarbs) || 0,
        fatsGrams: Number(formFats) || 0,
        preparationTime: formPrepTime,
        tags: tagsArray,
        isAvailable: formIsAvailable,
      };
      updateCafeItem(updated);
      onNotify(`Updated "${updated.name}" menu item!`);
    } else {
      // Add new
      const newItem: CafeItem = {
        id: `cafe_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: formName,
        category: formCategory,
        price: Number(formPrice) || 0,
        description: formDescription,
        image: formImage || PRESET_CAFE_IMAGES[0].url,
        calories: Number(formCalories) || 0,
        proteinGrams: Number(formProtein) || 0,
        carbsGrams: Number(formCarbs) || 0,
        fatsGrams: Number(formFats) || 0,
        preparationTime: formPrepTime,
        tags: tagsArray,
        isAvailable: formIsAvailable,
      };
      addCafeItem(newItem);
      onNotify(`Added new cafe item "${newItem.name}"!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string, name: string) => {
    deleteCafeItem(id);
    onNotify(`Removed "${name}" from Cafe!`);
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCafeConfig({
      enabled: cafeEnabled,
      name: cafeName,
      tagline: cafeTagline,
      hours: cafeHours,
      description: cafeDesc,
    });
    updateConfig({
      cafeBgImage,
    });
    onNotify('Cafe settings and branding updated!');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coffee className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">
              Fuel Bar & Cafe Menu Manager
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your in-gym cafe items, protein shakes, macro bowls, prices in {currency}, images, and nutritional profiles.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition ${theme.accentBg}`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* General Cafe Settings Collapsible Card */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-black uppercase text-white tracking-wider">
              Cafe Corner Branding & Settings
            </h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={cafeEnabled}
              onChange={(e) => setCafeEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 bg-neutral-900 border-neutral-700"
            />
            <span>Enable Cafe Section on Website</span>
          </label>
        </div>

        <form onSubmit={handleSaveGeneralSettings} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Cafe Section Title:
              </label>
              <input
                type="text"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                placeholder="e.g. Absolute Fuel Bar & Clean Cafe"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Operating Hours:
              </label>
              <input
                type="text"
                value={cafeHours}
                onChange={(e) => setCafeHours(e.target.value)}
                placeholder="e.g. 6:00 AM – 10:30 PM (Daily)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <ImageUploadField
                label="Cafe Backdrop Image"
                value={cafeBgImage}
                onChange={(val) => setCafeBgImage(val)}
                aspectRatio="banner"
                helperText="Upload custom backdrop for cafe bar."
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
              Description / Tagline:
            </label>
            <textarea
              rows={2}
              value={cafeDesc}
              onChange={(e) => setCafeDesc(e.target.value)}
              placeholder="Fuel your workout before and refuel your muscles immediately after with our certified organic smoothies..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border border-neutral-700 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Cafe Branding</span>
            </button>
          </div>
        </form>
      </div>

      {/* Menu Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-amber-400 text-black shadow'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            All Categories ({items.length})
          </button>
          {STANDARD_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black shadow'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item or price..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
        </div>
      </div>

      {/* Menu Items Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition group"
          >
            <div className="space-y-3">
              {/* Image & Quick info */}
              <div className="relative h-36 w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-neutral-700">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                  {item.proteinGrams !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-black" />
                      {item.proteinGrams}g Protein
                    </span>
                  )}
                  {item.calories !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-black/80 text-neutral-200 text-[10px] font-bold border border-neutral-700">
                      {item.calories} kcal
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Price */}
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-black uppercase text-white line-clamp-1">{item.name}</h4>
                <span className="text-sm font-mono font-black text-amber-400 whitespace-nowrap">
                  {currency}{item.price}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {/* Tags & Prep time */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {item.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800"
                  >
                    {t}
                  </span>
                ))}
                {item.preparationTime && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-500 ml-auto flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {item.preparationTime}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-[11px] text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isAvailable !== false}
                  onChange={(e) => {
                    updateCafeItem({ ...item, isAvailable: e.target.checked });
                    onNotify(`Updated availability for "${item.name}"`);
                  }}
                  className="w-3.5 h-3.5 rounded text-amber-500 bg-neutral-900 border-neutral-700"
                />
                <span className={item.isAvailable !== false ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {item.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 transition"
                  title="Edit item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800">
          <Coffee className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white uppercase">No items in this category</h4>
          <p className="text-xs text-neutral-500 mt-1">Click "Add Menu Item" to add your first shake, bowl, or snack.</p>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="relative max-w-2xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 shadow-2xl space-y-6 my-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${theme.accentBg} text-black`}>
                  <Coffee className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-black uppercase text-white tracking-tight">
                  {editingItem ? `Edit Menu Item: ${editingItem.name}` : 'Add New Cafe Menu Item'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Item Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Item Name: <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Mass Monster Whey Isolate"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Category: <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {STANDARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Prep time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Price in {currency}: <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    placeholder="199"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Preparation Time:
                  </label>
                  <input
                    type="text"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    placeholder="e.g. 3-5 mins (or Ready to Eat)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Image Upload & HD Presets */}
              <ImageUploadField
                label="Item Image / Photo"
                value={formImage}
                onChange={(val) => setFormImage(val)}
                presets={PRESET_CAFE_IMAGES}
                aspectRatio="square"
                helperText="Upload photo of shake, bowl, or snack from your computer/device or pick a preset."
              />

              {/* Macro Nutritional Profile */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
                  Nutritional Macros Profile (Per Serving)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-0.5">
                      Protein (g):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formProtein}
                      onChange={(e) => setFormProtein(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-0.5">
                      Calories (kcal):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formCalories}
                      onChange={(e) => setFormCalories(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-0.5">
                      Carbs (g):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formCarbs}
                      onChange={(e) => setFormCarbs(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-0.5">
                      Fats (g):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formFats}
                      onChange={(e) => setFormFats(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Description & Ingredients:
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Double scoop Whey Isolate, ripe banana, peanut butter, rolled oats & unsweetened almond milk."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Tags & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Dietary Tags (Comma-separated):
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. High Protein, Bestseller, Sugar-Free, Keto"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsAvailable}
                      onChange={(e) => setFormIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-neutral-950 border-neutral-700"
                    />
                    <span>Item is currently In-Stock</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${theme.accentBg}`}
                >
                  {editingItem ? 'Update Menu Item' : 'Save & Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
