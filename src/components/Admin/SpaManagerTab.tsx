import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { SpaServiceItem } from '../../types';
import { defaultSpaServices } from '../../data/defaultGymData';
import {
  Droplets,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Zap,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
  SlidersHorizontal,
  X,
  User,
  Users,
  CheckCircle,
  Tag,
  Flame,
  Activity,
} from 'lucide-react';

const SPA_CATEGORIES = [
  'Massage',
  'Steam & Sauna',
  'Recovery Combo',
  'Express Therapy',
  'Holistic Wellness',
];

interface SpaManagerTabProps {
  onNotify: (msg: string) => void;
}

export const SpaManagerTab: React.FC<SpaManagerTabProps> = ({ onNotify }) => {
  const {
    config,
    themeColor,
    addSpaService,
    updateSpaService,
    deleteSpaService,
    resetSpaServices,
  } = useGym();
  const theme = themeStyles[themeColor];
  const currency = config.currencySymbol || '₹';

  const spaServices = config.spaServices && config.spaServices.length > 0
    ? config.spaServices
    : defaultSpaServices;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Form state
  const [editingItem, setEditingItem] = useState<SpaServiceItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Massage');
  const [formDuration, setFormDuration] = useState('60 Min');
  const [formMemberPrice, setFormMemberPrice] = useState(1200);
  const [formNonMemberPrice, setFormNonMemberPrice] = useState(1800);
  const [formDescription, setFormDescription] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formPopular, setFormPopular] = useState(false);

  const openAddModal = () => {
    setFormName('');
    setFormCategory('Massage');
    setFormDuration('60 Min');
    setFormMemberPrice(1200);
    setFormNonMemberPrice(1800);
    setFormDescription('');
    setFormBenefits('');
    setFormBadge('');
    setFormPopular(false);
    setEditingItem(null);
    setIsAddingNew(true);
  };

  const openEditModal = (item: SpaServiceItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category || 'Massage');
    setFormDuration(item.duration);
    setFormMemberPrice(item.memberPrice);
    setFormNonMemberPrice(item.nonMemberPrice);
    setFormDescription(item.description);
    setFormBenefits(item.benefits?.join(', ') || '');
    setFormBadge(item.badge || '');
    setFormPopular(item.popular || false);
    setIsAddingNew(false);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a service name.');
      return;
    }

    const benefitsArray = formBenefits
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (editingItem) {
      // Update existing item
      const updated: SpaServiceItem = {
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        duration: formDuration.trim() || '60 Min',
        memberPrice: Number(formMemberPrice) || 0,
        nonMemberPrice: Number(formNonMemberPrice) || 0,
        description: formDescription.trim(),
        benefits: benefitsArray,
        badge: formBadge.trim() || undefined,
        popular: formPopular,
      };
      updateSpaService(updated);
      onNotify(`Updated "${updated.name}" successfully!`);
    } else {
      // Add new item
      const newItem: SpaServiceItem = {
        id: `spa_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: formName.trim(),
        category: formCategory,
        duration: formDuration.trim() || '60 Min',
        memberPrice: Number(formMemberPrice) || 0,
        nonMemberPrice: Number(formNonMemberPrice) || 0,
        description: formDescription.trim(),
        benefits: benefitsArray,
        badge: formBadge.trim() || undefined,
        popular: formPopular,
      };
      addSpaService(newItem);
      onNotify(`Added "${newItem.name}" to Massage & Steam menu!`);
    }

    setIsAddingNew(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, name: string) => {
    deleteSpaService(id);
    setConfirmDeleteId(null);
    onNotify(`Removed "${name}" from table.`);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Reset all massage & steam table rows to the default 9 standard services?'
      )
    ) {
      resetSpaServices();
      onNotify('Restored default 9-row Massage & Steam table matrix.');
    }
  };

  // Filtered rows
  const filteredServices = spaServices.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory =
      selectedCategory === 'all' ||
      s.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Tab Header Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">
              Massage & Steam Spa CMS
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Edit, add, or customize rows in the 3-column Member vs Non-Member pricing table (8 to 9+ therapies).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition flex items-center gap-1.5 border border-neutral-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 9 Rows</span>
          </button>
          <button
            onClick={openAddModal}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${theme.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Spa Service</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] font-bold text-neutral-400 uppercase block">
            Total Services
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {spaServices.length} Rows
          </span>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] font-bold text-emerald-400 uppercase block">
            Avg. Member Price
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {currency}
            {Math.round(
              spaServices.reduce((acc, s) => acc + s.memberPrice, 0) /
                (spaServices.length || 1)
            )}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] font-bold text-neutral-400 uppercase block">
            Avg. Guest Price
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {currency}
            {Math.round(
              spaServices.reduce((acc, s) => acc + s.nonMemberPrice, 0) /
                (spaServices.length || 1)
            )}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase block">
            Avg. Member Savings
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            {currency}
            {Math.round(
              spaServices.reduce(
                (acc, s) => acc + (s.nonMemberPrice - s.memberPrice),
                0
              ) / (spaServices.length || 1)
            )}
          </span>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search therapy name, description..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? `${theme.accentBg}`
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            All Categories
          </button>
          {SPA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? `${theme.accentBg}`
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column CMS Table View */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/90 text-xs font-black uppercase tracking-wider text-neutral-300">
              <th className="py-3.5 px-4 w-[45%]">Column 1: Service Details</th>
              <th className="py-3.5 px-4 w-[18%] bg-emerald-950/30 text-emerald-300">
                Column 2: Member (₹)
              </th>
              <th className="py-3.5 px-4 w-[18%]">Column 3: Non-Member (₹)</th>
              <th className="py-3.5 px-4 w-[19%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 text-xs">
            {filteredServices.map((service, idx) => {
              const savings = service.nonMemberPrice - service.memberPrice;
              const isEven = idx % 2 === 0;

              return (
                <tr
                  key={service.id}
                  className={`transition-colors hover:bg-neutral-900/50 ${
                    isEven ? 'bg-neutral-950' : 'bg-neutral-900/20'
                  }`}
                >
                  {/* Column 1: Service Name, Duration, Category, Description, Benefits */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white uppercase">
                          {service.name}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-mono font-bold">
                          {service.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-300">
                          {service.category}
                        </span>
                        {service.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                              service.popular
                                ? theme.accentBg
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {service.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-400 text-[11px] leading-snug line-clamp-2">
                        {service.description}
                      </p>
                      {service.benefits && service.benefits.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {service.benefits.map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.2 rounded border border-neutral-800"
                            >
                              ✓ {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Column 2: Member Price */}
                  <td className="py-3.5 px-4 align-top bg-emerald-950/10">
                    <div className="font-mono text-base font-black text-emerald-400">
                      {currency}
                      {(service.memberPrice ?? 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-emerald-500/80 font-bold block">
                      Save {currency}
                      {savings}
                    </span>
                  </td>

                  {/* Column 3: Non-Member Price */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-mono text-base font-black text-neutral-200">
                      {currency}
                      {(service.nonMemberPrice ?? 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-neutral-500 block">Standard Rate</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                        title="Edit Row"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(service.id)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition"
                        title="Delete Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {confirmDeleteId === service.id && (
                      <div className="mt-2 p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-left space-y-1.5">
                        <span className="text-[10px] text-red-200 font-bold block">
                          Delete this row?
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteItem(service.id, service.name)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-500"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT SPA SERVICE ROW                           */}
      {/* ----------------------------------------------------------- */}
      {(isAddingNew || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl my-8">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingItem(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <h4 className="text-lg font-black uppercase text-white">
                {editingItem ? 'Edit Spa Service Row' : 'Add New Spa Service Row'}
              </h4>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Deep Tissue Sports Recovery Massage"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {SPA_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 60 Min, 45 Min, 90 Min"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Pricing: Member vs Non-Member */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div>
                  <label className="block text-xs font-black uppercase text-emerald-400 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Member Rate ({currency}) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formMemberPrice}
                    onChange={(e) => setFormMemberPrice(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-300 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Non-Member Rate ({currency}) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formNonMemberPrice}
                    onChange={(e) => setFormNonMemberPrice(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                  Therapeutic Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Targeted myofascial release, breaking down scar tissue..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Benefits (comma separated) */}
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                  Key Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  placeholder="Flushes lactic acid, Reduces DOMS soreness, Restores flexibility"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Badge & Popular Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                    Badge Text (optional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Athlete Choice, Best Value"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="form-popular-checkbox"
                    checked={formPopular}
                    onChange={(e) => setFormPopular(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <label
                    htmlFor="form-popular-checkbox"
                    className="text-xs font-bold text-neutral-300 cursor-pointer"
                  >
                    Highlight as Popular / Best-Seller
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.accentBg}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'Save Changes' : 'Add to Table'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
