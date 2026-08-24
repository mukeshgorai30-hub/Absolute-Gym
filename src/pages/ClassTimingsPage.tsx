import React, { useEffect, useState } from 'react';
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
  Flame,
  CheckCircle,
} from 'lucide-react';

export const ClassTimingsPage: React.FC = () => {
  const { config, themeColor, setIsTrialModalOpen } = useGym();
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const categories = [
    'All Classes',
    'Yoga & Mobility',
    'Zumba & Dance',
    'Strength',
    'HIIT & Conditioning',
    'Boxing / MMA',
    'Spin & Cycle',
    'CrossFit',
    'Pilates & Aerobics',
  ];

  const isMorning = (timeStr: string) => {
    return timeStr.toUpperCase().includes('AM');
  };

  const filteredClasses = config.classes.filter((cls: GymClass) => {
    const matchesDay = cls.dayOfWeek === activeDay;
    const matchesCategory =
      selectedCategory === 'All' ||
      selectedCategory === 'All Classes' ||
      cls.category === selectedCategory;

    let matchesTime = true;
    if (timeFilter === 'morning') {
      matchesTime = isMorning(cls.time);
    } else if (timeFilter === 'evening') {
      matchesTime = !isMorning(cls.time);
    }

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
    <div className="w-full min-h-screen bg-neutral-950 text-white pt-6 pb-24">
      {/* Page Hero Header */}
      <div className="relative border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-16 sm:py-24 overflow-hidden">
        {config.scheduleBgImage && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={config.scheduleBgImage}
              alt="Schedule Background"
              className="w-full h-full object-cover opacity-15 filter blur-xs scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/90 to-neutral-950" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 ${theme.accentBadge}`}>
            <Calendar className="w-4 h-4" />
            <span>Weekly Class Schedule & Studio Timetable</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
            Class Timings
          </h1>

          <p className="mt-4 text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            High-energy studio workouts including <strong className="text-emerald-400">Power Yoga</strong>, <strong className="text-amber-400">Zumba Dance Cardio</strong>, HIIT conditioning, and Strength bootcamps led by master instructors.
          </p>

          {/* Quick Trial Pass Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className={`px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-xl ${theme.accentBg}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim Free 1-Day Studio Class Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Timetable Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Day Selector Tabs */}
        <div className="flex overflow-x-auto scrollbar-none gap-2 pb-2 mb-8 justify-start md:justify-center w-full max-w-full touch-auto">
          {days.map((day) => {
            const countForDay = config.classes.filter((c) => c.dayOfWeek === day).length;
            const isActive = activeDay === day;

            return (
              <button
                key={day}
                id={`class-timings-tab-${day.toLowerCase()}`}
                onClick={() => setActiveDay(day)}
                className={`px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all min-h-[48px] touch-manipulation active:scale-95 flex items-center gap-2.5 ${
                  isActive
                    ? `${theme.accentBg} shadow-xl scale-105`
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-black/30 text-black font-bold' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {countForDay}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 mb-10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Yoga, Zumba, HIIT, instructor..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Time of Day Filter */}
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 w-full sm:w-auto justify-center">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  timeFilter === 'all' ? `${theme.accentBg}` : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Timings
              </button>
              <button
                onClick={() => setTimeFilter('morning')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  timeFilter === 'morning' ? `${theme.accentBg}` : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Morning</span>
              </button>
              <button
                onClick={() => setTimeFilter('evening')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  timeFilter === 'evening' ? `${theme.accentBg}` : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Evening</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex overflow-x-auto scrollbar-none gap-2 pt-2 border-t border-neutral-800/80">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-black font-black shadow-md'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat === 'Yoga & Mobility' && <HeartPulse className="w-3 h-3 text-emerald-500" />}
                  {cat === 'Zumba & Dance' && <Music className="w-3 h-3 text-amber-500" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-neutral-900/40 border border-neutral-800">
            <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-lg font-black uppercase text-neutral-300">
              No classes scheduled for {activeDay} {selectedCategory !== 'All Classes' ? `in ${selectedCategory}` : ''}
            </h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              Try switching to another day or resetting your category and time filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Classes');
                setTimeFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition"
            >
              Reset Schedule Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls: GymClass) => {
              const isYoga = cls.category === 'Yoga & Mobility';
              const isZumba = cls.category === 'Zumba & Dance';

              return (
                <div
                  key={cls.id}
                  id={`class-timings-card-${cls.id}`}
                  className={`bg-neutral-900/90 rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl ${
                    isYoga
                      ? 'border-emerald-500/40 hover:border-emerald-500/70 bg-gradient-to-b from-neutral-900 via-neutral-900 to-emerald-950/20'
                      : isZumba
                      ? 'border-amber-500/40 hover:border-amber-500/70 bg-gradient-to-b from-neutral-900 via-neutral-900 to-amber-950/20'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    {/* Time & Category Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-base font-black text-white">
                        <Clock className={`w-4 h-4 ${isYoga ? 'text-emerald-400' : isZumba ? 'text-amber-400' : theme.accentText}`} />
                        <span>{cls.time}</span>
                        <span className="text-xs font-normal text-neutral-400">
                          ({cls.durationMinutes} min)
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

                    {/* Class Title & Description */}
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
                      {cls.description}
                    </p>

                    {/* Room & Trainer Details */}
                    <div className="mt-5 pt-4 border-t border-neutral-800 space-y-2.5 text-xs text-neutral-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Lead Instructor:</span>
                        </div>
                        <span className="font-bold text-white">{cls.trainerName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Studio Room:</span>
                        </div>
                        <span className="font-semibold text-neutral-300">{cls.room}</span>
                      </div>
                    </div>
                  </div>

                  {/* Drop-in / Reserve prompt */}
                  <div className="mt-6 pt-4 border-t border-neutral-800/80">
                    <button
                      onClick={() => setIsTrialModalOpen(true)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                        isYoga
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
                          : isZumba
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                          : `${theme.accentBg}`
                      }`}
                    >
                      Reserve Studio Spot
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
