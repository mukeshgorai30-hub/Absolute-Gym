export type ThemeColor = 'amber' | 'emerald' | 'crimson' | 'cyan' | 'violet' | 'gold' | 'orange';

export type LogoIconType = 
  | 'Dumbbell'
  | 'Flame'
  | 'Trophy'
  | 'Zap'
  | 'Shield'
  | 'Crown'
  | 'Sparkles'
  | 'HeartPulse'
  | 'Activity'
  | 'Target'
  | 'Swords'
  | 'Skull';

export interface LogoConfig {
  type: 'icon' | 'image';
  imageUrl?: string;
  iconName?: LogoIconType;
  icon?: LogoIconType;
  customColor?: string; // Custom hex or css color override
  bgColor?: string; // Background color for icon wrapper
  customBgColor?: string; // Custom background color
  shape?: 'rounded' | 'square' | 'circle' | 'transparent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface OperatingHours {
  monFri: string;
  saturday: string;
  sunday: string;
  holidays: string;
}

export interface GymStats {
  sqFt: string;
  sqFtLabel?: string;
  members: string;
  membersLabel?: string;
  trainersCount: string;
  trainersCountLabel?: string;
  satisfaction: string;
  satisfactionLabel?: string;
}

export type PackageDuration =
  | '1 Day'
  | '3 Days'
  | '7 Days'
  | '15 Days'
  | '1 Month'
  | '2 Months'
  | '3 Months'
  | '6 Months'
  | '1 Year'
  | '2 Years';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  duration?: PackageDuration | string;
  priceMonthly: number;
  priceYearly?: number; // billed annually per month or annual total
  popular?: boolean;
  badge?: string;
  features: string[];
  notIncluded?: string[];
  ctaText: string;
}

export interface SpaServiceItem {
  id: string;
  name: string;
  category: 'Massage' | 'Steam & Sauna' | 'Recovery Combo' | 'Express Therapy';
  duration: string; // e.g. "60 Min", "45 Min", "90 Min"
  description: string;
  memberPrice: number;
  nonMemberPrice: number;
  benefits?: string[];
  popular?: boolean;
  badge?: string;
}

export interface Trainer {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  experience: string;
  certifications: string[];
  bio: string;
  image: string;
  ratePerSession: number;
  instagram?: string;
  linkedin?: string;
  availableForBooking: boolean;
}

export type ClassCategory = 
  | 'Yoga & Mobility' 
  | 'Zumba & Dance' 
  | 'Strength' 
  | 'HIIT & Conditioning' 
  | 'Boxing / MMA' 
  | 'Spin & Cycle' 
  | 'CrossFit' 
  | 'Recovery & Spa'
  | 'Pilates & Aerobics';
export type ClassIntensity = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced' | 'High Intensity' | 'Extreme';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface GymClass {
  id: string;
  title: string;
  category: ClassCategory;
  trainerName: string;
  dayOfWeek: DayOfWeek;
  time: string;
  durationMinutes: number;
  intensity: ClassIntensity;
  capacity: number;
  reservedCount: number;
  room: string;
  description: string;
}

export interface GymAmenity {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  featured: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Gym Floor' | 'Recovery & Spa' | 'Classes & Studio' | 'Equipment';
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  membership: string;
  quote: string;
  rating: number;
  avatar: string;
  achievement: string;
  isGoogleReview?: boolean;
  googleReviewUrl?: string;
  reviewDate?: string;
}

export interface VideoReview {
  id: string;
  title: string;
  member: string;
  membership: string;
  avatar?: string;
  videoUrl: string;
  thumbnail: string;
  duration?: string;
  rating: number;
  tag: string;
  summary: string;
  date?: string;
}

export interface MemberLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'trial_pass' | 'membership_inquiry' | 'trainer_booking' | 'general_contact';
  planName?: string;
  trainerName?: string;
  preferredTime?: string;
  message?: string;
  status: 'new' | 'contacted' | 'enrolled' | 'archived';
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export type CafeCategory = 
  | 'Protein Shakes & Smoothies'
  | 'Pre-Workout & Energy'
  | 'Healthy Bowls & Meals'
  | 'Snacks & Protein Bars'
  | 'Cold Brew & Beverages';

export interface CafeItem {
  id: string;
  name: string;
  category: CafeCategory | string;
  price: number;
  description: string;
  image: string;
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
  tags?: string[];
  isAvailable: boolean;
  preparationTime?: string;
}

export interface CafeConfig {
  enabled: boolean;
  name: string;
  tagline: string;
  description: string;
  hours: string;
  items: CafeItem[];
}

export interface GymConfig {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  instagram?: string;
  gstin?: string;
  googleMapsEmbedUrl: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBgImage?: string;
  heroCtaText?: string;
  heroSecondaryCtaText?: string;
  
  // Section background images for all sections
  plansBgImage?: string;
  trainersBgImage?: string;
  scheduleBgImage?: string;
  amenitiesBgImage?: string;
  advisorBgImage?: string;
  bmiBgImage?: string;
  galleryBgImage?: string;
  testimonialsBgImage?: string;
  videoReviewsBgImage?: string;
  contactBgImage?: string;
  faqBgImage?: string;
  cafeBgImage?: string;

  // Custom Logo & Branding
  logo?: LogoConfig;
  customPrimaryColor?: string; // Optional custom hex accent (e.g. #ff0055)

  announcementText: string;
  showAnnouncement: boolean;
  themeColor: ThemeColor;
  currencySymbol: string;
  currencyCode: string;
  operatingHours: OperatingHours;
  stats: GymStats;
  plans: SubscriptionPlan[];
  spaServices?: SpaServiceItem[];
  trainers: Trainer[];
  classes: GymClass[];
  amenities: GymAmenity[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  videoReviews?: VideoReview[];
  faqs: FAQ[];
  cafe: CafeConfig;
  adminPin: string;
  adminEmail?: string;
  requireSupabaseAuth?: boolean;
}
