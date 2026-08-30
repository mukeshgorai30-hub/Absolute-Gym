import React from 'react';
import { useGym } from '../context/GymContext';
import { Testimonial } from '../types';
import { Star, Quote, ExternalLink, ShieldCheck } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { config } = useGym();
  const mapsUrl = config.googleMapsEmbedUrl || 'https://maps.app.goo.gl/bpiN5hRb6Dd2VKig6';

  return (
    <section id="testimonials" className="w-full max-w-full py-14 sm:py-20 bg-neutral-900/50 text-white relative border-b border-neutral-800 overflow-hidden">
      {/* Dynamic Atmospheric Background Image */}
      {config.testimonialsBgImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={config.testimonialsBgImage}
            alt="Testimonials Atmospheric Background"
            className="w-full h-full object-cover opacity-10 filter blur-xs scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/95 via-neutral-900/90 to-neutral-950" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Testimonials
          </h2>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-between text-xs text-neutral-400 mb-3 px-1">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
            <span>← Swipe client reviews horizontally →</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            {config.testimonials.length} reviews
          </span>
        </div>

        {/* Reviews Cards: Horizontal Swipe on Mobile, Responsive Grid on Desktop */}
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 md:scroll-px-0 pb-6 md:pb-0 px-4 sm:px-6 md:px-0 scrollbar-none touch-auto">
            {config.testimonials.map((test: Testimonial) => (
              <div
                key={test.id}
                id={`google-review-card-${test.id}`}
                className="bg-neutral-900/90 rounded-2xl border border-neutral-800 hover:border-neutral-700/80 p-6 flex flex-col justify-between shadow-lg relative w-[84vw] sm:w-[340px] max-w-[360px] shrink-0 snap-center md:snap-align-none md:w-auto md:max-w-none md:shrink transition-all group hover:shadow-2xl"
              >
                {/* Header with Google icon & Quote icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[11px] font-black text-blue-600 shrink-0">
                      G
                    </span>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Google Review
                    </span>
                  </div>
                  <Quote className="w-6 h-6 text-neutral-800 group-hover:text-neutral-700 transition-colors pointer-events-none" />
                </div>

                <div>
                  {/* Rating Stars & Verified Chip */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-neutral-200 leading-relaxed font-normal">
                    "{test.quote}"
                  </p>
                </div>

                {/* Reviewer Profile & Maps Link */}
                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {test.avatar ? (
                      <img
                        src={test.avatar}
                        alt={test.name}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                        {test.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-white truncate">
                        {test.name}
                      </h4>
                      <p className="text-xs text-neutral-400 font-medium truncate flex items-center gap-1">
                        {test.membership}
                      </p>
                    </div>
                  </div>

                  <a
                    href={test.googleReviewUrl || mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-amber-400 transition-colors p-1.5 rounded-lg hover:bg-neutral-800 shrink-0"
                    title="View review on Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
