import React from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { AppPage } from '../types/navigation';
import {
  Image as ImageIcon,
  Users,
  CreditCard,
  Calendar,
  Coffee,
  Calculator,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const ExplorePagesCards: React.FC = () => {
  const { config, themeColor, setCurrentPage } = useGym();
  const theme = themeStyles[themeColor];

  const cards: {
    page: AppPage;
    title: string;
    tagline: string;
    description: string;
    icon: React.ReactNode;
    image: string;
    stat: string;
    btnText: string;
  }[] = [
    {
      page: 'gallery',
      title: 'Inside Facility',
      tagline: 'Virtual Facility Tour & Showcase',
      description:
        'Explore 15,000+ sq ft of competition power racks, dedicated cardio zones, and Eucalyptus Steam Spa recovery.',
      icon: <ImageIcon className="w-6 h-6 text-amber-400" />,
      image:
        config.gallery?.[0]?.image ||
        config.galleryBgImage ||
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      stat: `${config.gallery?.length || 0} Facility Photos`,
      btnText: 'View Facility Gallery',
    },
    {
      page: 'coaches',
      title: 'Performance Coaches',
      tagline: 'Elite Strength & Nutrition Mentors',
      description:
        'Certified personal trainers and master coaches dedicated to your personalized progression and form mastery.',
      icon: <Users className="w-6 h-6 text-amber-400" />,
      image:
        config.trainers?.[0]?.image ||
        'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80',
      stat: `${config.trainers?.length || 0} Certified Trainers`,
      btnText: 'View Coaches & Bios',
    },
    {
      page: 'plans',
      title: 'Plans & Pricing',
      tagline: 'Flexible Memberships & Spa Passes',
      description:
        'Tiered subscriptions from 1-day drop-ins to 2-year transformation passes with Eucalyptus Steam Spa access.',
      icon: <CreditCard className="w-6 h-6 text-amber-400" />,
      image:
        config.plansBgImage ||
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      stat: `${config.plans?.length || 0} Membership Tiers`,
      btnText: 'Explore Plans & Rates',
    },
    {
      page: 'timings',
      title: 'Class Timings',
      tagline: 'Weekly Studio & Group Schedule',
      description:
        'Morning and evening high-energy sessions including Yoga, Zumba, HIIT, Power Spin, and functional mobility.',
      icon: <Calendar className="w-6 h-6 text-amber-400" />,
      image:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      stat: `${config.classes?.length || 0} Weekly Classes`,
      btnText: 'Check Weekly Timetable',
    },
    {
      page: 'cafe',
      title: 'Absolute Gym Cafe',
      tagline: 'Clean Nutrition & Fuel Bar',
      description:
        'Fresh whey isolates, macro-balanced protein bowls, sugar-free cold brews, and pre-workout hydration boosters.',
      icon: <Coffee className="w-6 h-6 text-amber-400" />,
      image:
        config.cafeBgImage ||
        'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      stat: `${config.cafe?.items?.length || 0} Fuel Bar Items`,
      btnText: 'Browse Fuel Bar Menu',
    },
    {
      page: 'calculator',
      title: 'BMI & Calorie Target',
      tagline: 'InBody & TDEE Macro Matrix',
      description:
        'Interactive Body Mass Index, maintenance calories, deficit targets, and protein/carb/fat splits for your goals.',
      icon: <Calculator className="w-6 h-6 text-amber-400" />,
      image:
        config.bmiBgImage ||
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      stat: 'Free Nutrition Matrix',
      btnText: 'Calculate BMI & Macros',
    },
  ];

  return (
    <section className="w-full max-w-full py-20 bg-neutral-950 text-white relative border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 ${theme.accentBadge}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Experience Hubs</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
            Explore <span className={theme.accentText}>{config.name}</span> Portals
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400">
            Select a dedicated portal below to tour the facility, meet our trainers, review membership rates, check group class timetables, order from the fuel cafe, or calculate your BMI.
          </p>
        </div>

        {/* 6 Portal Cards Responsive 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.page}
              onClick={() => {
                setCurrentPage(card.page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 p-5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
            >
              {/* Background Glow on Hover */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />

              <div>
                {/* Image & Icon Header */}
                <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-4 border border-neutral-800">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  
                  {/* Floating Icon Pill */}
                  <div className="absolute top-3 left-3 p-2 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-700/60 shadow-lg">
                    {card.icon}
                  </div>

                  {/* Stat Badge */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-neutral-900/90 backdrop-blur-md border border-neutral-700/60 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    {card.stat}
                  </div>
                </div>

                {/* Content */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 line-clamp-1">
                  {card.tagline}
                </div>
                <h3 className="text-lg font-black uppercase text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-5 line-clamp-3">
                  {card.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all ${theme.accentBg} group-hover:shadow-lg`}
              >
                <span>{card.btnText}</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
