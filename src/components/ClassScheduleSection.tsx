import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { DayOfWeek, GymClass } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Sparkles,
  Music,
  HeartPulse,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';

export const ClassScheduleSection: React.FC = () => {
  const { config, themeColor, setCurrentPage } = useGym();
  const theme = themeStyles[themeColor];

  const days: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Classes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'evening'>('all');

  const categories = [
    'All Classes',
    'Yoga & Mobility',
    'Zumba & Dance',
  ];

  const handleSelectCategory = (categoryName: 'Yoga & Mobility' | 'Zumba & Dance') => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    
    // Check if the current active day has classes for this category
    const hasCategoryOnActiveDay = config.classes.some(
      (c) => c.category === categoryName && c.dayOfWeek === activeDay
    );
    if (!hasCategoryOnActiveDay) {
      const dayWithClass = days.find((d) =>
        config.classes.some((c) => c.category === categoryName && c.dayOfWeek === d)
      );
      if (dayWithClass) {
        setActiveDay(dayWithClass);
      }
    }

    // Smoothly scroll down to the class timetable on mobile and desktop
    requestAnimationFrame(() => {
      const timetableEl = document.getElementById('schedule-timetable') || document.getElementById('schedule');
      if (timetableEl) {
        const yOffset = -90;
        const y = timetableEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  };

  // Helper to test morning vs evening
  const isMorning = (timeStr: string) => {
    return timeStr.toUpperCase().includes('AM');
  };

  const filteredClasses = config.classes.filter((cls: GymClass) => {
    const matchesDay = cls.dayOfWeek === activeDay;
    const matchesCategory =
      selectedCategory === 'All' ||
      selectedCategory === 'All Classes' ||
      cls.category === selectedCategory;
    
    // Time filter
    let matchesTime = true;
    if (timeFilter === 'morning') {
      matchesTime = isMorning(cls.time);
    } else if (timeFilter === 'evening') {
      matchesTime = !isMorning(cls.time);
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cls.title.toLowerCase().includes(q) ||
      cls.trainerName.toLowerCase().includes(q) ||
      cls.category.toLowerCase().includes(q) ||
      cls.room.toLowerCase().includes(q) ||
      cls.description.toLowerCase().includes(q);

    return matchesDay && matchesCategory && matchesTime && matchesSearch;
  });

  const yogaCount = config.classes.filter((c) => c.category === 'Yoga & Mobility').length;
  const zumbaCount = config.classes.filter((c) => c.category === 'Zumba & Dance').length;

  const getIntensityBadge = (intensity: string) => {
    switch (intensity) {
      case 'Extreme':
      case 'High Intensity':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Advanced':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Intermediate':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <section id="schedule" className="w-full max-w-full py-24 bg-neutral-950 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.scheduleBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.scheduleBgImage}
            alt="Schedule Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/85 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Class Timetable</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Class Timings & Studio Schedule
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Specialized studio sessions featuring <strong className="text-emerald-400">Yoga & Mobility</strong> and <strong className="text-amber-400">Zumba Dance Cardio</strong>. Reserve your spot online or drop in.
          </p>
        </div>

        {/* Quick Spotlight Callouts for Yoga & Zumba */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
          {/* Yoga Spotlight Card */}
          <button
            type="button"
            id="spotlight-card-yoga"
            onClick={() => handleSelectCategory('Yoga & Mobility')}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 touch-manipulation active:scale-[0.98] ${
              selectedCategory === 'Yoga & Mobility'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50'
                : 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black uppercase text-white">Yoga & Mobility</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300">
                    {yogaCount} Sessions
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Vinyasa, Power Yoga, Hatha & Restorative flexibility
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition ${
              selectedCategory === 'Yoga & Mobility' ? 'bg-emerald-500 text-black shadow-md' : 'bg-neutral-800 text-neutral-300'
            }`}>
              View Yoga
            </span>
          </button>

          {/* Zumba Spotlight Card */}
          <button
            type="button"
            id="spotlight-card-zumba"
            onClick={() => handleSelectCategory('Zumba & Dance')}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 touch-manipulation active:scale-[0.98] ${
              selectedCategory === 'Zumba & Dance'
                ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                : 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black uppercase text-white">Zumba & Dance Party</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300">
                    {zumbaCount} Sessions
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Latin, Reggaeton & Bollywood calorie-torching dance
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition ${
              selectedCategory === 'Zumba & Dance' ? 'bg-amber-500 text-black shadow-md' : 'bg-neutral-800 text-neutral-300'
            }`}>
              View Zumba
            </span>
          </button>
        </div>

        {/* Scroll Anchor for Mobile and Desktop navigation */}
        <div id="schedule-timetable" className="scroll-mt-28" />

        {/* Days of Week Tabs */}
        <div className="flex overflow-x-auto scrollbar-none gap-2 pb-2 mb-6 justify-start md:justify-center w-full max-w-full touch-auto">
          {days.map((day) => {
            const countForDay = config.classes.filter((c) => c.dayOfWeek === day).length;
            const isActive = activeDay === day;

            return (
              <button
                key={day}
                id={`schedule-tab-${day.toLowerCase()}`}
                onClick={() => setActiveDay(day)}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all min-h-[44px] touch-manipulation active:scale-95 flex items-center gap-2 ${
                  isActive
                    ? `${theme.accentBg} shadow-lg scale-105`
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-black/30 text-black font-bold' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {countForDay}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Time Filters & Category Filters Bar */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Yoga, Zumba, instructor..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Time of Day Filter */}
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl p-1 w-full sm:w-auto justify-center">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  timeFilter === 'all' ? `${theme.accentBg}` : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Timings
              </button>
              <button
                onClick={() => setTimeFilter('morning')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  timeFilter === 'morning' ? `${theme.accentBg}` : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Morning</span>
              </button>
              <button
                onClick={() => setTimeFilter('evening')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  timeFilter === 'evening' ? `${theme.accentBg}` : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Evening</span>
              </button>
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pt-2 border-t border-neutral-800/60">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`class-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat === 'Yoga & Mobility' && <HeartPulse className="w-3 h-3 text-emerald-400" />}
                  {cat === 'Zumba & Dance' && <Music className="w-3 h-3 text-amber-400" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-neutral-900/40 border border-neutral-800">
            <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-neutral-300">
              No classes scheduled for {activeDay} {selectedCategory !== 'All' ? `in ${selectedCategory}` : ''}
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              Try switching days or selecting another class category.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('All Classes');
                  setTimeFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls: GymClass) => {
              const spotsLeft = cls.capacity - cls.reservedCount;
              const isFull = spotsLeft <= 0;
              const percentFilled = Math.min(100, Math.round((cls.reservedCount / cls.capacity) * 100));
              const isYoga = cls.category === 'Yoga & Mobility';
              const isZumba = cls.category === 'Zumba & Dance';

              return (
                <div
                  key={cls.id}
                  id={`class-card-${cls.id}`}
                  className={`bg-neutral-900/90 rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg ${
                    isYoga
                      ? 'border-emerald-500/30 hover:border-emerald-500/60'
                      : isZumba
                      ? 'border-amber-500/30 hover:border-amber-500/60'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    {/* Category Highlight Tag & Time */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-base font-black text-white">
                        <Clock className={`w-4 h-4 ${isYoga ? 'text-emerald-400' : isZumba ? 'text-amber-400' : theme.accentText}`} />
                        <span>{cls.time}</span>
                        <span className="text-xs font-normal text-neutral-400">
                          ({cls.durationMinutes}m)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isYoga && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <HeartPulse className="w-2.5 h-2.5" />
                            <span>Yoga</span>
                          </span>
                        )}
                        {isZumba && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Music className="w-2.5 h-2.5" />
                            <span>Zumba</span>
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getIntensityBadge(cls.intensity)}`}>
                          {cls.intensity}
                        </span>
                      </div>
                    </div>

                    {/* Class Title */}
                    <h3 className="text-lg font-extrabold text-white tracking-tight uppercase">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {cls.description}
                    </p>

                    {/* Room & Trainer Details */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2 text-xs text-neutral-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Coach:</span>
                        </div>
                        <span className="font-bold text-white">{cls.trainerName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Location:</span>
                        </div>
                        <span className="font-semibold text-neutral-300">{cls.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dedicated Page Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              setCurrentPage('timings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs sm:text-sm font-black uppercase tracking-wider text-white hover:text-amber-400 transition-all shadow-lg"
          >
            <span>Open Dedicated Class Timetable & Filters</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

