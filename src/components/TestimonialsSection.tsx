import React from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { Testimonial } from '../types';
import { Star, Quote, Trophy, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { config, themeColor } = useGym();
  const theme = themeStyles[themeColor];

  return (
    <section id="testimonials" className="w-full max-w-full py-12 sm:py-16 bg-neutral-900/40 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.testimonialsBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.testimonialsBgImage}
            alt="Testimonials Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-900/85 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${theme.accentBadge}`}>
            <Trophy className="w-3.5 h-3.5" />
            <span>Real Member Transformations</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Proven Results & Success Stories
          </h2>
        </div>

        {/* Mobile Swipe Indicator Hint */}
        <div className="flex md:hidden items-center justify-between text-xs text-neutral-400 mb-3 px-1">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
            <span>← Swipe stories horizontally →</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            {config.testimonials.length} reviews
          </span>
        </div>

        {/* Testimonials: Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 md:scroll-px-0 pb-6 md:pb-0 px-4 sm:px-6 md:px-0 scrollbar-none touch-auto">
            {config.testimonials.map((test: Testimonial) => (
              <div
                key={test.id}
                id={`testimonial-card-${test.id}`}
                className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-7 flex flex-col justify-between shadow-lg relative w-[82vw] sm:w-[320px] max-w-[340px] shrink-0 snap-center md:snap-align-none md:w-auto md:max-w-none md:shrink"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-neutral-800 pointer-events-none" />

                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-neutral-300 italic leading-relaxed">
                    "{test.quote}"
                  </p>

                  {/* Achievement Badge */}
                  {test.achievement && (
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{test.achievement}</span>
                    </div>
                  )}
                </div>

                {/* User Avatar & Name */}
                <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center gap-3">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-white uppercase">
                      {test.name}
                    </h4>
                    <p className="text-xs text-neutral-400 font-medium">
                      {test.membership}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
