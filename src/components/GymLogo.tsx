import React from 'react';
import { useGym } from '../context/GymContext';
import { themeStyles } from '../utils/theme';
import { LogoIconType } from '../types';
import {
  Dumbbell,
  Flame,
  Trophy,
  Zap,
  Shield,
  Crown,
  Sparkles,
  HeartPulse,
  Activity,
  Target,
  Swords,
  Skull,
} from 'lucide-react';

interface GymLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const renderLogoIcon = (iconName?: string, className: string = 'w-6 h-6') => {
  const normalized = (iconName || 'Dumbbell').toLowerCase();
  switch (normalized) {
    case 'flame':
      return <Flame className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'zap':
    case 'lightning':
      return <Zap className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'heartpulse':
    case 'heart':
      return <HeartPulse className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'target':
      return <Target className={className} />;
    case 'swords':
      return <Swords className={className} />;
    case 'skull':
      return <Skull className={className} />;
    case 'dumbbell':
    default:
      return <Dumbbell className={className} />;
  }
};

export const GymLogo: React.FC<GymLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
  onClick,
}) => {
  const { config, themeColor } = useGym();
  const theme = themeStyles[themeColor];
  const logo = config.logo || {
    type: 'icon',
    iconName: 'Dumbbell',
    shape: 'rounded',
  };

  const sizeClasses = {
    sm: {
      box: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm font-bold',
      tagline: 'text-[10px]',
    },
    md: {
      box: 'w-11 h-11',
      icon: 'w-6 h-6',
      text: 'text-lg sm:text-xl font-extrabold',
      tagline: 'text-xs',
    },
    lg: {
      box: 'w-14 h-14',
      icon: 'w-8 h-8',
      text: 'text-2xl font-black',
      tagline: 'text-sm',
    },
    xl: {
      box: 'w-20 h-20',
      icon: 'w-10 h-10',
      text: 'text-3xl font-black',
      tagline: 'text-base',
    },
  }[size];

  const shapeClass = {
    rounded: 'rounded-xl',
    square: 'rounded-none',
    circle: 'rounded-full',
    transparent: 'rounded-xl bg-transparent border-transparent',
  }[logo.shape || 'rounded'];

  const iconColor = logo.customColor || config.customPrimaryColor;
  const customColorStyle = iconColor ? { color: iconColor } : undefined;
  const bgCol = logo.customBgColor || logo.bgColor;
  const customBgStyle = bgCol ? { backgroundColor: bgCol } : undefined;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 group text-left ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Logo Graphic / Icon Container */}
      <div
        className={`${sizeClasses.box} ${shapeClass} ${
          logo.shape === 'transparent'
            ? ''
            : 'bg-neutral-900 border border-neutral-800'
        } flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-lg ${
          !iconColor ? theme.glowClass : ''
        }`}
        style={customBgStyle}
      >
        {logo.type === 'image' && logo.imageUrl ? (
          <img
            src={logo.imageUrl}
            alt={config.name}
            className="w-full h-full object-contain p-1"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to icon on image error
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`${sizeClasses.icon} flex items-center justify-center ${
              !iconColor ? theme.accentText : ''
            }`}
            style={customColorStyle}
          >
            {renderLogoIcon(logo.iconName || logo.icon || 'Dumbbell', sizeClasses.icon)}
          </div>
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="min-w-0">
          <div className={`${sizeClasses.text} tracking-tight text-white flex items-center gap-1.5 font-sans leading-tight truncate`}>
            {config.name}
          </div>
          {showTagline && config.tagline && (
            <p className={`${sizeClasses.tagline} text-neutral-400 font-medium tracking-wide hidden sm:block max-w-xs truncate mt-0.5`}>
              {config.tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
