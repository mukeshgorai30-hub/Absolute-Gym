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
  Music,
  HeartPulse,
  Sun,
  Moon,
  Flame,
  CheckCircle,
  Layers,
} from 'lucide-react';

export const ClassTimingsPage: React.FC = () => {
  const { config, themeColor } = useGym();
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

  // 1. Class type selection: 'yoga' | 'zumba'
  const [selectedClassType, setSelectedClassType] = useState<'yoga' | 'zumba'>('yoga');
  // 2. Timing selection: 'all' | 'morning' | 'evening'
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'evening'>('all');
  // 3. Weekday selection: Monday - Sunday
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const isMorning = (timeStr: string) => {
    return timeStr.toUpperCase().includes('AM');
  };

  const isYogaClass = (cls: GymClass) => {
    const text = `${cls.category} ${cls.title}`.toLowerCase();
    return text.includes('yoga') || text.includes('pranayama') || text.includes('vinyasa') || text.includes('hatha') || text.includes('yin') || text.includes('ashtanga');
  };

  const isZumbaClass = (cls: GymClass) => {
    const text = `${cls.category} ${cls.title}`.toLowerCase();
    return text.includes('zumba') || text.includes('dance') || text.includes('latin') || text.includes('bollywood');
  };

  const filteredClasses = config.classes.filter((cls: GymClass) => {
    // 1. Filter by Weekday
    const matchesDay = cls.dayOfWeek === activeDay;

    // 2. Filter by Class Type (Yoga / Zumba / All)
    let matchesType = true;
    if (selectedClassType === 'yoga') {
      matchesType = isYogaClass(cls);
    } else if (selectedClassType === 'zumba') {
      matchesType = isZumbaClass(cls);
    }

    // 3. Filter by Time (Morning / Evening / All)
    let matchesTime = true;
    if (timeFilter === 'morning') {
      matchesTime = isMorning(cls.time);
    } else if (timeFilter === 'evening') {
      matchesTime = !isMorning(cls.time);
    }

    // 4. Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cls.title.toLowerCase().includes(q) ||
      cls.trainerName.toLowerCase().includes(q) ||
      cls.category.toLowerCase().includes(q) ||
      cls.room.toLowerCase().includes(q) ||
      cls.description.toLowerCase().includes(q);

    return matchesDay && matchesType && matchesTime && matchesSearch;
  });

  // Calculate counts for badges
  const getDayCount = (day: DayOfWeek) => {
    return config.classes.filter((cls) => {
      if (cls.dayOfWeek !== day) return false;
      if (selectedClassType === 'yoga' && !isYogaClass(cls)) return false;
      if (selectedClassType === 'zumba' && !isZumbaClass(cls)) return false;
      if (timeFilter === 'morning' && !isMorning(cls.time)) return false;
      if (timeFilter === 'evening' && isMorning(cls.time)) return false;
      return true;
    }).length;
  };

  const totalYogaCount = config.classes.filter(isYogaClass).length;
  const totalZumbaCount = config.classes.filter(isZumbaClass).length;

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
      <div className="relative border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-14 sm:py-20 overflow-hidden">
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

          <p className="mt-4 text-base sm:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            High-energy studio workouts including <strong className="text-emerald-400">Power Yoga & Pranayama</strong> and <strong className="text-amber-400">Zumba Dance Cardio</strong> led by certified master instructors.
          </p>
        </div>
      </div>

      {/* Main Timetable Controls & Schedule */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* CONTROL BAR: Class Discipline, Timing Filters & Search */}
        <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Subtle top accent gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 opacity-80" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Step 1: Discipline Toggle (Yoga / Zumba) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                  Step 1 • Discipline
                </span>
                <span className="text-sm sm:text-base font-black uppercase text-white flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Choose Class</span>
                </span>
              </div>

              <div className="inline-flex p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-inner w-full sm:w-auto justify-center gap-1.5">
                <button
                  id="timings-filter-yoga"
                  onClick={() => setSelectedClassType('yoga')}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial touch-manipulation active:scale-95 ${
                    selectedClassType === 'yoga'
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-[1.02]'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Yoga</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedClassType === 'yoga' ? 'bg-black/20 text-black' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                  }`}>
                    {totalYogaCount}
                  </span>
                </button>

                <button
                  id="timings-filter-zumba"
                  onClick={() => setSelectedClassType('zumba')}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial touch-manipulation active:scale-95 ${
                    selectedClassType === 'zumba'
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25 scale-[1.02]'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Zumba</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedClassType === 'zumba' ? 'bg-black/20 text-black' : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                  }`}>
                    {totalZumbaCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Time of Day Filter */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center justify-between gap-3 lg:border-l lg:border-neutral-800 lg:pl-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                  Step 2 • Timing Slot
                </span>
                <span className="text-sm sm:text-base font-black uppercase text-white flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Time of Day</span>
                </span>
              </div>

              <div className="inline-flex p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-inner w-full sm:w-auto justify-center gap-1">
                <button
                  id="timings-slot-all"
                  onClick={() => setTimeFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition touch-manipulation ${
                    timeFilter === 'all'
                      ? 'bg-neutral-800 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  id="timings-slot-morning"
                  onClick={() => setTimeFilter('morning')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition touch-manipulation ${
                    timeFilter === 'morning'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Morning</span>
                </button>
                <button
                  id="timings-slot-evening"
                  onClick={() => setTimeFilter('evening')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition touch-manipulation ${
                    timeFilter === 'evening'
                      ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/50 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Evening</span>
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="lg:col-span-3 lg:border-l lg:border-neutral-800 lg:pl-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">
                Quick Search
              </span>
              <div className="relative w-full">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trainer, room, style..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs p-1"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTROL BAR 3: Weekdays (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
              Step 3: Select Day of Week
            </div>
            <div className="text-xs text-neutral-400">
              Showing schedule for <strong className="text-white uppercase">{activeDay}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {days.map((day) => {
              const countForDay = getDayCount(day);
              const isActive = activeDay === day;

              return (
                <button
                  key={day}
                  id={`class-timings-tab-${day.toLowerCase()}`}
                  onClick={() => setActiveDay(day)}
                  className={`p-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 border min-h-[58px] touch-manipulation active:scale-95 ${
                    isActive
                      ? `${theme.accentBg} border-transparent shadow-xl scale-[1.03]`
                      : 'bg-neutral-900 hover:bg-neutral-800/90 text-neutral-300 border-neutral-800'
                  }`}
                >
                  <span className="truncate">{day}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black/30 text-black' : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    {countForDay} {countForDay === 1 ? 'class' : 'classes'}
                  </span>
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
              No classes match your selected criteria on {activeDay}
            </h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              Try switching between Morning and Evening or select "All Classes" to see everything scheduled for {activeDay}.
            </p>
            <button
              onClick={() => {
                setSelectedClassType('all');
                setTimeFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition"
            >
              Reset Schedule Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredClasses.map((cls: GymClass) => {
              const isYoga = isYogaClass(cls);
              const isZumba = isZumbaClass(cls);
              const morning = isMorning(cls.time);

              return (
                <div
                  key={cls.id}
                  id={`class-timings-card-${cls.id}`}
                  className={`bg-neutral-900/90 rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl relative overflow-hidden ${
                    isYoga
                      ? 'border-emerald-500/40 hover:border-emerald-500/80 bg-gradient-to-b from-neutral-900 via-neutral-900 to-emerald-950/20'
                      : isZumba
                      ? 'border-amber-500/40 hover:border-amber-500/80 bg-gradient-to-b from-neutral-900 via-neutral-900 to-amber-950/20'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Top Header Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {/* Time Slot Pill */}
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl flex items-center gap-1.5 font-mono text-sm font-black ${
                          morning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {morning ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                          <span>{cls.time}</span>
                        </div>
                        <span className="text-xs text-neutral-400 font-medium">
                          ({cls.durationMinutes} min)
                        </span>
                      </div>

                      {/* Discipline & Intensity Badges */}
                      <div className="flex items-center gap-2">
                        {isYoga && (
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                            <HeartPulse className="w-3 h-3" />
                            <span>Yoga</span>
                          </span>
                        )}
                        {isZumba && (
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                            <Music className="w-3 h-3" />
                            <span>Zumba</span>
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getIntensityBadge(cls.intensity)}`}>
                          {cls.intensity}
                        </span>
                      </div>
                    </div>

                    {/* Class Title & Description */}
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                      {cls.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                      {cls.description}
                    </p>

                    {/* Room & Trainer Details */}
                    <div className="mt-6 pt-4 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase block font-bold">Instructor</span>
                          <span className="font-bold text-white">{cls.trainerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-300">
                        <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase block font-bold">Studio Room</span>
                          <span className="font-semibold text-neutral-200">{cls.room}</span>
                        </div>
                      </div>
                    </div>
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

