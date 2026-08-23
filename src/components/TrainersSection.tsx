import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { Trainer } from '../types';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Instagram,
  Sparkles,
  Star,
  Users,
  ChevronRight,
} from 'lucide-react';

export const TrainersSection: React.FC = () => {
  const { config, themeColor, setSelectedTrainerForModal } = useGym();
  const theme = themeStyles[themeColor];
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  // Extract unique specialties for filtering
  const allSpecialties = ['All', 'Powerlifting', 'HIIT', 'Boxing', 'Mobility', 'Nutrition', 'Conditioning'];

  const filteredTrainers = config.trainers.filter((t) => {
    if (selectedSpecialty === 'All') return true;
    return t.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
  });

  return (
    <section id="trainers" className="w-full max-w-full py-24 bg-neutral-900/50 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.trainersBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.trainersBgImage}
            alt="Trainers Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-900/85 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <Award className="w-3.5 h-3.5" />
            <span>Master Coaches & Physiologists</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Meet Our Coaches
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Our certified master trainers bring collegiate, professional sports, and clinical experience to accelerate your strength, physique, and movement quality.
          </p>

          {/* Specialty Filter Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {allSpecialties.map((spec) => (
              <button
                key={spec}
                id={`trainer-filter-${spec.toLowerCase()}`}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[40px] touch-manipulation active:scale-95 flex items-center justify-center ${
                  selectedSpecialty === spec
                    ? `${theme.accentBg} shadow-md`
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Swipe Indicator Hint */}
        <div className="flex md:hidden items-center justify-between text-xs text-neutral-400 mb-3 px-1">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
            <span>← Swipe coaches horizontally →</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            {filteredTrainers.length} coaches
          </span>
        </div>

        {/* Trainers: Smooth Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 md:scroll-px-0 pb-6 md:pb-0 px-4 sm:px-6 md:px-0 scrollbar-none touch-auto">
            {filteredTrainers.map((trainer: Trainer) => (
              <div
                key={trainer.id}
                id={`trainer-card-${trainer.id}`}
                onClick={() => setSelectedTrainerForModal(trainer)}
                className="group bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-neutral-700 overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer active:scale-[0.99] touch-manipulation select-none shadow-lg w-[82vw] sm:w-[320px] max-w-[340px] shrink-0 snap-center md:snap-align-none md:w-auto md:max-w-none md:shrink"
              >
              <div>
                {/* Trainer Photo & Overlay */}
                <div className="relative h-72 overflow-hidden bg-neutral-950">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />

                  {/* Experience Badge */}
                  <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800 text-[11px] font-bold text-neutral-200 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{trainer.experience}</span>
                  </div>

                  {/* Hourly Rate Chip */}
                  <div className="absolute top-3 right-3 bg-neutral-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800 text-[11px] font-black text-white">
                    {config.currencySymbol || '₹'}{(trainer.ratePerSession ?? 0).toLocaleString('en-IN')}/session
                  </div>
                </div>

                {/* Trainer Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-white tracking-tight uppercase">
                        {trainer.name}
                      </h3>
                      <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${theme.accentText}`}>
                        {trainer.role}
                      </p>
                    </div>

                    {trainer.instagram && (
                      <a
                        href={`https://instagram.com/${trainer.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-neutral-400 hover:text-white p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title={`Instagram: ${trainer.instagram}`}
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="mt-3 text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {trainer.bio}
                  </p>

                  {/* Certifications */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Credentials & Certs:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trainer.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/60 text-[10px] font-semibold text-neutral-300"
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
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.accentBadge}`}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <div className="p-6 pt-0">
                <button
                  id={`book-trainer-${trainer.id}-btn`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrainerForModal(trainer);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation active:scale-[0.98] ${theme.accentBg}`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};
