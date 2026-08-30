import React, { useEffect, useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { Trainer } from '../types';
import {
  Award,
  Calendar,
  Star,
  Instagram,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Flame,
} from 'lucide-react';

export const CoachesPage: React.FC = () => {
  const { config, themeColor, setSelectedTrainerForModal, setIsTrialModalOpen } = useGym();
  const theme = themeStyles[themeColor];
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const allSpecialties = ['All', 'Powerlifting', 'HIIT', 'Boxing', 'Mobility', 'Nutrition', 'Conditioning', 'Physiotherapy', 'Bodybuilding'];

  const filteredTrainers = config.trainers.filter((t) => {
    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      t.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q) ||
      t.bio.toLowerCase().includes(q) ||
      t.certifications.some((c) => c.toLowerCase().includes(q)) ||
      t.specialties.some((s) => s.toLowerCase().includes(q));

    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white pt-6 pb-24">
      {/* Page Hero Header */}
      <div className="relative border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-16 sm:py-24 overflow-hidden">
        {config.trainersBgImage && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={config.trainersBgImage}
              alt="Coaches Background"
              className="w-full h-full object-cover opacity-15 filter blur-xs scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/90 to-neutral-950" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-5 ${theme.accentBadge}`}>
            <Award className="w-4 h-4" />
            <span>Master Coaches & Certified Trainers</span>
          </div>

          <h1 id="coaches-page-main-heading" className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white">
            Certified Coaches & <span className={`bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent`}>Trainers</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Train one-on-one with expert coaches, bodybuilders, lifting specialists, and physiotherapists dedicated to helping you reach your fitness goals.
          </p>


        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Control */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 mb-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coach by name, specialty, certification..."
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

            <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 self-end md:self-auto">
              <span className="text-white font-black">{filteredTrainers.length}</span>
              <span>coaches available for booking</span>
            </div>
          </div>
        </div>

        {/* Coaches Grid */}
        {filteredTrainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrainers.map((trainer: Trainer) => (
              <div
                key={trainer.id}
                id={`coaches-card-${trainer.id}`}
                onClick={() => setSelectedTrainerForModal(trainer)}
                className="group bg-neutral-900/90 rounded-3xl border border-neutral-800 hover:border-neutral-700 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer active:scale-[0.99] touch-manipulation select-none"
              >
                <div>
                  {/* Trainer Photo & Top Chips */}
                  <div className="relative h-80 overflow-hidden bg-neutral-950">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />

                    {/* Experience Badge */}
                    <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800 text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{trainer.experience} Experience</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                          {trainer.name}
                        </h3>
                        <p className={`text-xs font-black uppercase tracking-wider mt-0.5 ${theme.accentText}`}>
                          {trainer.role}
                        </p>
                      </div>

                      {trainer.instagram && (
                        <a
                          href={`https://instagram.com/${trainer.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-neutral-400 hover:text-white p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition"
                          title={`Instagram: ${trainer.instagram}`}
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                      {trainer.bio}
                    </p>

                    {/* Credentials */}
                    <div className="mt-4 pt-3 border-t border-neutral-800">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Accreditations & Certifications:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {trainer.certifications.map((cert, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-neutral-800 text-[10px] font-bold text-neutral-300 border border-neutral-700/60"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {trainer.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${theme.accentBadge}`}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-neutral-800">
            <Award className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase text-white">No Coaches Found</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              No coaches match "{searchQuery}" under the "{selectedSpecialty}" specialty.
            </p>
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition"
            >
              Reset Coach Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
