import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { FAQ } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const { config, themeColor } = useGym();
  const theme = themeStyles[themeColor];
  const faqs = config.faqs || [];

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const categories = useMemo(() => {
    const list = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
    return ['All', ...list];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCat = activeCategory === 'All' || faq.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.category && faq.category.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="w-full max-w-full py-24 bg-neutral-900/40 text-white relative border-b border-neutral-800 overflow-hidden"
    >
      {/* Dynamic Atmospheric Background Image */}
      {config.faqBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.faqBgImage}
            alt="FAQ Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-900/85 to-neutral-950" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Everything you need to know about our memberships, facilities, personal training, and gym policies.
          </p>
        </div>

        {/* Category Filter Chips & Quick Search if multiple categories */}
        {categories.length > 2 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase whitespace-nowrap transition ${
                    activeCategory === cat
                      ? `${theme.accentBg} shadow-md`
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {faqs.length > 5 && (
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-500" />
              </div>
            )}
          </div>
        )}

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq: FAQ) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`bg-neutral-900/90 rounded-2xl border transition-all shadow-md overflow-hidden ${
                  isOpen ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-neutral-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      {faq.question}
                    </span>
                    {faq.category && (
                      <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                        {faq.category}
                      </span>
                    )}
                  </div>
                  <div
                    className={`p-1.5 rounded-full bg-neutral-800 text-neutral-300 shrink-0 transition-colors ${
                      isOpen ? theme.accentText : ''
                    }`}
                  >
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 text-sm text-neutral-300 border-t border-neutral-800/80 leading-relaxed animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="p-8 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800">
              <p className="text-sm text-neutral-400">No questions found matching your filter.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
