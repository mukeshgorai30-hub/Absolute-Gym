import React from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Trophy,
  Calendar,
  Flame,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { config, themeColor, setIsTrialModalOpen, setIsAIModalOpen } = useGym();
  const theme = themeStyles[themeColor];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative w-full max-w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-950 pt-8 pb-20 border-b border-neutral-800">
      {/* Background Graphic & Atmospheric Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={config.heroBgImage || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80"}
          alt="Gym Training Facility"
          className="w-full h-full object-cover object-center opacity-25 filter grayscale contrast-125 transition-opacity duration-300"
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/90" />
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b ${theme.gradientBg} blur-[120px] rounded-full pointer-events-none opacity-60`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Top Eyebrow Badge */}
        {config.heroBadge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 backdrop-blur-md mb-8">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wider text-neutral-200 uppercase">
              {config.heroBadge}
            </span>
          </div>
        )}

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase max-w-5xl leading-[1.05] font-sans">
          {config.heroHeadline || 'UNLEASH YOUR HIGHEST POTENTIAL'}
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl md:text-2xl text-neutral-300 max-w-3xl font-normal leading-relaxed">
          {config.heroSubtitle ||
            'Step into a world-class training sanctuary designed for real transformation. Elite strength platforms, immersive studio classes, infrared recovery suites, and personalized coach mastery.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            id="hero-claim-trial-btn"
            onClick={() => setIsTrialModalOpen(true)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-extrabold text-base tracking-wide uppercase transition-all transform hover:-translate-y-0.5 shadow-lg ${theme.accentBg}`}
          >
            <Flame className="w-5 h-5" />
            <span>{config.heroCtaText || 'Claim Free 1-Day VIP Pass'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-view-plans-btn"
            onClick={() => scrollToSection('plans')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-base tracking-wide transition transform hover:-translate-y-0.5"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>{config.heroSecondaryCtaText || 'Explore Plans & Pricing'}</span>
          </button>
        </div>

        {/* Stats Grid Strip */}
        <div className="mt-16 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 backdrop-blur-md shadow-2xl">
          <div className="text-center p-3 border-r border-neutral-800/60 last:border-r-0">
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${theme.accentText}`}>
              {config.stats.sqFt}
            </div>
            <div className="text-xs sm:text-sm font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              {config.stats.sqFtLabel || 'Training Facility'}
            </div>
          </div>
          <div className="text-center p-3 border-r border-neutral-800/60 md:border-r last:border-r-0">
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${theme.accentText}`}>
              {config.stats.members}
            </div>
            <div className="text-xs sm:text-sm font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              {config.stats.membersLabel || 'Active Lifters'}
            </div>
          </div>
          <div className="text-center p-3 border-r border-neutral-800/60 last:border-r-0">
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${theme.accentText}`}>
              {config.stats.trainersCount}
            </div>
            <div className="text-xs sm:text-sm font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              {config.stats.trainersCountLabel || 'Certified Coaches'}
            </div>
          </div>
          <div className="text-center p-3">
            <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${theme.accentText}`}>
              {config.stats.satisfaction}
            </div>
            <div className="text-xs sm:text-sm font-medium text-neutral-400 mt-1 uppercase tracking-wider">
              {config.stats.satisfactionLabel || '5-Star Satisfaction'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
