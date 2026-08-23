import React from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { GymAmenity } from '../types';
import {
  Dumbbell,
  Sparkles,
  Zap,
  Coffee,
  Shield,
  Lock,
  Activity,
  HeartPulse,
  Flame,
  CheckCircle2,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Dumbbell: <Dumbbell className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Coffee: <Coffee className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  Lock: <Lock className="w-6 h-6" />,
  Activity: <Activity className="w-6 h-6" />,
  HeartPulse: <HeartPulse className="w-6 h-6" />,
};

export const AmenitiesSection: React.FC = () => {
  const { config, themeColor, setIsTrialModalOpen } = useGym();
  const theme = themeStyles[themeColor];

  return (
    <section id="about" className="w-full max-w-full py-24 bg-neutral-900/40 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Anchor for backward compatibility */}
      <div id="amenities" className="absolute -top-20" />
      {/* Dynamic Atmospheric Background Image */}
      {config.amenitiesBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.amenitiesBgImage}
            alt="Amenities Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-900/85 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>World-Class Amenities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Engineered For Peak Performance
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            From precision Olympic lifting platforms to medical-grade contrast recovery and nutrition bars, every inch of {config.name || 'Absolute Gym'} is built without compromise.
          </p>
        </div>

        {/* Amenities Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.amenities.map((amenity: GymAmenity) => (
            <div
              key={amenity.id}
              id={`amenity-card-${amenity.id}`}
              className="group bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-neutral-700 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-md"
            >
              <div>
                {/* Amenity Image */}
                <div className="relative h-48 overflow-hidden bg-neutral-950">
                  <img
                    src={amenity.image}
                    alt={amenity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                  
                  {/* Floating Icon Badge */}
                  <div className={`absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-neutral-950/90 border border-neutral-800 flex items-center justify-center ${theme.accentText} backdrop-blur-md shadow-lg`}>
                    {iconMap[amenity.icon] || <Dumbbell className="w-5 h-5" />}
                  </div>

                  {amenity.featured && (
                    <div className="absolute top-3 right-3 bg-amber-500/90 text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      Elite Feature
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase group-hover:text-amber-400 transition-colors">
                    {amenity.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {amenity.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Available to Members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
