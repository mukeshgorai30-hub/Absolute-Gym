import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { themeStyles } from '../../utils/theme';
import { FAQ } from '../../types';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Sparkles,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Layers,
  BookOpen,
} from 'lucide-react';

const STANDARD_FAQ_CATEGORIES = [
  'General',
  'Memberships',
  'Classes',
  'Personal Training',
  'Facilities & Amenities',
  'Fuel Bar & Cafe',
  'Billing & Policies',
];

const PRESET_FAQS: Omit<FAQ, 'id'>[] = [
  {
    question: 'Do you offer locker rooms, showers, and steam suites?',
    answer: 'Yes! Our facility includes luxury locker rooms with private keyless electronic lockers, rainfall hot showers, premium organic grooming amenities, Finnish dry saunas, and steam rooms.',
    category: 'Facilities & Amenities',
  },
  {
    question: 'What is your guest pass policy for friends and family?',
    answer: 'VIP Elite members receive 2 complimentary guest passes per month. Additional day guest passes can be purchased at the front desk or booked online.',
    category: 'Memberships',
  },
  {
    question: 'What should I bring on my first workout visit?',
    answer: 'Please bring clean training shoes, comfortable workout attire, a water bottle, and a valid photo ID for verification. Complimentary fresh gym towels are provided at the entrance.',
    category: 'General',
  },
  {
    question: 'Are nutritional assessments and diet plans included?',
    answer: 'All new members receive a complimentary InBody 570 body composition analysis. Pro and VIP members also receive customized macronutrient coaching and ongoing meal guidance.',
    category: 'Personal Training',
  },
  {
    question: 'Is free parking available for members?',
    answer: 'Yes, we provide dedicated reserved multi-level parking with EV charging stations free of charge for all active members during their workout sessions.',
    category: 'Facilities & Amenities',
  },
  {
    question: 'Can I freeze or pause my gym membership if I travel?',
    answer: 'Yes! Members can freeze their account for up to 60 days per calendar year with a simple 7-day advance notice via our admin support or at the front desk.',
    category: 'Billing & Policies',
  },
];

interface FaqManagerTabProps {
  onNotify: (msg: string) => void;
}

export const FaqManagerTab: React.FC<FaqManagerTabProps> = ({ onNotify }) => {
  const { config, updateConfig, themeColor, addFAQ, updateFAQ, deleteFAQ } = useGym();
  const theme = themeStyles[themeColor];

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [faqBgImage, setFaqBgImage] = useState<string>(config.faqBgImage || '');
  const [showPresets, setShowPresets] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Form Fields
  const [formQuestion, setFormQuestion] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formAnswer, setFormAnswer] = useState('');

  // Expand state for preview in cards
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const faqs = config.faqs || [];

  // Available categories list
  const existingCategories = Array.from(
    new Set([...STANDARD_FAQ_CATEGORIES, ...faqs.map((f) => f.category).filter(Boolean)])
  );

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      (faq.category && faq.category.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setFormQuestion('');
    setFormCategory('General');
    setFormCustomCategory('');
    setFormAnswer('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    if (STANDARD_FAQ_CATEGORIES.includes(faq.category)) {
      setFormCategory(faq.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('Custom');
      setFormCustomCategory(faq.category);
    }
    setFormAnswer(faq.answer);
    setIsModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      alert('Please enter a question');
      return;
    }
    if (!formAnswer.trim()) {
      alert('Please enter an answer');
      return;
    }

    const finalCategory =
      formCategory === 'Custom' ? formCustomCategory.trim() || 'General' : formCategory;

    if (editingFaq) {
      const updated: FAQ = {
        ...editingFaq,
        question: formQuestion.trim(),
        category: finalCategory,
        answer: formAnswer.trim(),
      };
      updateFAQ(updated);
      onNotify('Updated FAQ entry successfully!');
    } else {
      const newFaq: FAQ = {
        id: `faq_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        question: formQuestion.trim(),
        category: finalCategory,
        answer: formAnswer.trim(),
      };
      addFAQ(newFaq);
      onNotify('Added new FAQ entry!');
    }

    setIsModalOpen(false);
  };

  const handleDeleteFaq = (id: string, question: string) => {
    if (confirm(`Are you sure you want to delete this FAQ?\n\n"${question}"`)) {
      deleteFAQ(id);
      onNotify('FAQ deleted successfully.');
    }
  };

  const handleAddPreset = (preset: Omit<FAQ, 'id'>) => {
    // Check if already exists
    const exists = faqs.some(
      (f) => f.question.toLowerCase().trim() === preset.question.toLowerCase().trim()
    );
    if (exists) {
      alert('This question already exists in your FAQ list.');
      return;
    }

    const newFaq: FAQ = {
      id: `faq_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      question: preset.question,
      answer: preset.answer,
      category: preset.category,
    };
    addFAQ(newFaq);
    onNotify(`Added question: "${preset.question.slice(0, 30)}..."`);
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const newFaqs = [...faqs];
    const temp = newFaqs[index];
    newFaqs[index] = newFaqs[targetIndex];
    newFaqs[targetIndex] = temp;

    updateConfig({ faqs: newFaqs });
    onNotify('Reordered FAQ items.');
  };

  const handleSaveBackground = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({ faqBgImage });
    onNotify('Updated FAQ atmospheric background image!');
  };

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">
              Frequently Asked Questions (FAQ) Manager
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Create, edit, reorder, or delete questions and answers shown in your website's FAQ accordion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{showPresets ? 'Hide Question Bank' : 'Preset Ideas Bank'}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition ${theme.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Preset Ideas Bank Drawer */}
      {showPresets && (
        <div className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">
                Recommended Gym FAQ Presets (1-Click Add)
              </h4>
            </div>
            <span className="text-[10px] text-neutral-500">
              Click any question below to immediately add it to your FAQ list
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {PRESET_FAQS.map((preset, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start justify-between gap-3 hover:border-neutral-700 transition"
              >
                <div className="space-y-1">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-black text-amber-400 font-bold uppercase border border-neutral-800">
                    {preset.category}
                  </span>
                  <h5 className="text-xs font-bold text-white line-clamp-1">{preset.question}</h5>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {preset.answer}
                  </p>
                </div>
                <button
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black text-[11px] font-bold shrink-0 border border-amber-500/20 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Background & Styling Settings */}
      <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-black uppercase text-white tracking-wider">
            FAQ Section Visual Atmosphere Background
          </h4>
        </div>
        <form onSubmit={handleSaveBackground} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={faqBgImage}
            onChange={(e) => setFaqBgImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 border border-neutral-700 transition shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Background</span>
          </button>
        </form>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-emerald-400 text-black shadow'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            All Questions ({faqs.length})
          </button>
          {existingCategories.map((cat) => {
            const count = faqs.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-400 text-black shadow'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
        </div>
      </div>

      {/* FAQs List Table / Cards */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const globalIndex = faqs.findIndex((f) => f.id === faq.id);
          const isExpanded = expandedFaqId === faq.id;

          return (
            <div
              key={faq.id}
              className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Question and Category */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-900 text-emerald-400 border border-neutral-800">
                        {faq.category || 'General'}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        Item #{globalIndex + 1}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white leading-snug">{faq.question}</h4>
                  </div>
                </div>

                {/* Actions: Reorder, Edit, Delete */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Reorder Up/Down */}
                  <button
                    onClick={() => handleMoveFaq(globalIndex, 'up')}
                    disabled={globalIndex === 0}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-800 transition"
                    title="Move Question Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveFaq(globalIndex, 'down')}
                    disabled={globalIndex === faqs.length - 1}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-neutral-800 transition"
                    title="Move Question Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Preview Accordion */}
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center gap-1 border border-neutral-800 transition"
                  >
                    <span>{isExpanded ? 'Hide' : 'Answer'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(faq)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteFaq(faq.id, faq.question)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Answer Content */}
              {isExpanded ? (
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 leading-relaxed animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Website Answer Preview:
                  </div>
                  {faq.answer}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed pl-11">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800">
            <HelpCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white uppercase">No Questions Found</h4>
            <p className="text-xs text-neutral-500 mt-1">
              {searchQuery
                ? 'No FAQ matched your search query.'
                : 'Click "Add Question" or pick from the "Preset Ideas Bank" above to populate your FAQ.'}
            </p>
          </div>
        )}
      </div>

      {/* ADD / EDIT FAQ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="relative max-w-xl w-full bg-neutral-900 rounded-3xl border border-neutral-800 p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase text-white tracking-tight">
                    {editingFaq ? 'Edit FAQ Question' : 'Create New FAQ Question'}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Provide clear, concise answers to build trust and eliminate member friction.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              {/* Question Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Question: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. Can I freeze or pause my membership when traveling?"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Category Select + Custom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Category: <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {STANDARD_FAQ_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                </div>

                {formCategory === 'Custom' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                      Custom Category Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      placeholder="e.g. Boxing Equipment"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                )}
              </div>

              {/* Answer Textarea */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Answer: <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide a comprehensive and welcoming explanation..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-neutral-500">
                  Live Accordion Preview:
                </span>
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">
                      {formQuestion || 'Your question will appear here...'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-black text-emerald-400 font-bold border border-neutral-800">
                      {formCategory === 'Custom' ? formCustomCategory || 'Custom' : formCategory}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-2">
                    {formAnswer || 'Your detailed answer will appear here...'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${theme.accentBg}`}
                >
                  {editingFaq ? 'Save FAQ Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
