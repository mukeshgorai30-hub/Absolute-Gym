import React from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { GymLogo } from './GymLogo';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  ShieldCheck,
  Flame,
  ArrowUp,
  ShieldAlert,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    config,
    themeColor,
    setIsAdminOpen,
    setIsTrialModalOpen,
  } = useGym();
  const theme = themeStyles[themeColor];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full max-w-full overflow-hidden bg-neutral-950 text-white border-t border-neutral-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800/80">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <GymLogo size="md" showTagline={false} />

            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
              {config.tagline}. High-caliber Olympic training, boutique studios, sports recovery suites, and certified coaching tailored to serious lifters and professionals.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                id="footer-trial-pass-btn"
                onClick={() => setIsTrialModalOpen(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${theme.accentBg}`}
              >
                Claim Free 1-Day Pass
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 mb-4">
              Explore Facility
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <a href="#gallery" className="hover:text-white transition">
                  Inside Facility Showcase
                </a>
              </li>
              <li>
                <a href="#trainers" className="hover:text-white transition">
                  Coaches/trainer info
                </a>
              </li>
              <li>
                <a href="#plans" className="hover:text-white transition">
                  Membership Packages
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-white transition">
                  Class Timetable
                </a>
              </li>
              <li>
                <a href="#cafe" className="hover:text-white transition">
                  Absolute Gym Cafe
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition">
                  BMI & Calorie Tool
                </a>
              </li>
              <li>
                <a href="#ai-advisor" className="hover:text-white transition">
                  AI Workout Matcher
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours Summary */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 mb-4">
              Operating Hours
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex justify-between">
                <span>Mon – Fri:</span>
                <span className="text-neutral-200 font-semibold">{config.operatingHours.monFri}</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-neutral-200 font-semibold">{config.operatingHours.saturday}</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-neutral-200 font-semibold">{config.operatingHours.sunday}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Address */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300 mb-4">
              Address
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <a
                  href={
                    config.googleMapsEmbedUrl?.trim() ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition hover:underline"
                  title="Open location in Google Maps"
                >
                  {config.address}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <a href={`tel:${config.phone}`} className="hover:text-white transition">
                  {config.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-white transition">
                  {config.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} {config.name}. All Rights Reserved.</span>
            
            {/* Discreet Staff Portal Entry */}
            <button
              id="footer-staff-portal-btn"
              onClick={() => {
                window.location.hash = '#admin';
                window.dispatchEvent(new CustomEvent('open_apex_admin_portal'));
              }}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-400 transition cursor-pointer py-0.5 px-1.5 rounded hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
              title="Staff & Management Portal Access (or press Ctrl+Shift+A)"
            >
              <Lock className="w-3 h-3 text-neutral-400" />
              <span>Staff Login</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1.5"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
