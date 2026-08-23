import { ThemeColor } from '../types';

export const themeStyles: Record<
  ThemeColor,
  {
    name: string;
    primaryHex: string;
    accentBg: string;
    accentHover: string;
    accentBorder: string;
    accentText: string;
    accentBadge: string;
    accentDot: string;
    glowClass: string;
    gradientBg: string;
    gradientText: string;
    accentRing: string;
  }
> = {
  amber: {
    name: 'Vibrant Orange & Amber',
    primaryHex: '#f97316',
    accentBg: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25',
    accentHover: 'hover:bg-orange-500',
    accentBorder: 'border-orange-500/40 hover:border-orange-500/80',
    accentText: 'text-orange-400',
    accentBadge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    accentDot: 'bg-orange-400',
    glowClass: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    gradientBg: 'from-orange-500/25 via-amber-500/10 to-transparent',
    gradientText: 'from-orange-400 via-amber-300 to-yellow-400',
    accentRing: 'ring-orange-500',
  },
  orange: {
    name: 'Vibrant Blaze Orange',
    primaryHex: '#ea580c',
    accentBg: 'bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white shadow-lg shadow-orange-600/30',
    accentHover: 'hover:bg-orange-600',
    accentBorder: 'border-orange-500/40 hover:border-orange-500/80',
    accentText: 'text-orange-500',
    accentBadge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    accentDot: 'bg-orange-500',
    glowClass: 'shadow-[0_0_30px_rgba(234,88,12,0.3)]',
    gradientBg: 'from-orange-600/25 via-orange-500/10 to-transparent',
    gradientText: 'from-orange-400 to-amber-400',
    accentRing: 'ring-orange-500',
  },
  crimson: {
    name: 'Vicious Crimson Red',
    primaryHex: '#ef4444',
    accentBg: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25',
    accentHover: 'hover:bg-red-600',
    accentBorder: 'border-red-500/30 hover:border-red-500/70',
    accentText: 'text-red-400',
    accentBadge: 'bg-red-500/15 text-red-400 border border-red-500/30',
    accentDot: 'bg-red-400',
    glowClass: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    gradientBg: 'from-red-600/25 via-red-600/10 to-transparent',
    gradientText: 'from-red-400 to-rose-400',
    accentRing: 'ring-red-500',
  },
  emerald: {
    name: 'Toxic Emerald Green',
    primaryHex: '#10b981',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 font-bold',
    accentHover: 'hover:bg-emerald-500',
    accentBorder: 'border-emerald-500/30 hover:border-emerald-500/70',
    accentText: 'text-emerald-400',
    accentBadge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    accentDot: 'bg-emerald-400',
    glowClass: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    gradientBg: 'from-emerald-500/25 via-emerald-500/10 to-transparent',
    gradientText: 'from-emerald-400 to-teal-300',
    accentRing: 'ring-emerald-500',
  },
  cyan: {
    name: 'Cyber Cyan & Ice',
    primaryHex: '#06b6d4',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/25 font-bold',
    accentHover: 'hover:bg-cyan-500',
    accentBorder: 'border-cyan-500/30 hover:border-cyan-500/70',
    accentText: 'text-cyan-400',
    accentBadge: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    accentDot: 'bg-cyan-400',
    glowClass: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    gradientBg: 'from-cyan-500/25 via-cyan-500/10 to-transparent',
    gradientText: 'from-cyan-400 to-sky-300',
    accentRing: 'ring-cyan-500',
  },
  violet: {
    name: 'Ultra Violet Power',
    primaryHex: '#8b5cf6',
    accentBg: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25',
    accentHover: 'hover:bg-violet-600',
    accentBorder: 'border-violet-500/30 hover:border-violet-500/70',
    accentText: 'text-violet-400',
    accentBadge: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
    accentDot: 'bg-violet-400',
    glowClass: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    gradientBg: 'from-violet-600/25 via-violet-600/10 to-transparent',
    gradientText: 'from-violet-400 to-fuchsia-400',
    accentRing: 'ring-violet-500',
  },
  gold: {
    name: 'Pure Championship Gold',
    primaryHex: '#eab308',
    accentBg: 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/25 font-bold',
    accentHover: 'hover:bg-yellow-500',
    accentBorder: 'border-yellow-500/30 hover:border-yellow-500/70',
    accentText: 'text-yellow-400',
    accentBadge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    accentDot: 'bg-yellow-400',
    glowClass: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    gradientBg: 'from-yellow-500/25 via-yellow-500/10 to-transparent',
    gradientText: 'from-yellow-400 to-amber-300',
    accentRing: 'ring-yellow-500',
  },
};
