export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  originalPrice?: string;
  newPrice?: string;
  validUntil: string;
  image: string;
  category: PromotionCategory;
  isActive: boolean;
  priority?: number; // For ordering promotions
}

export type PromotionCategory = 'seasonal' | 'new-customer' | 'package' | 'referral' | 'loyalty' | 'holiday';

export interface PromotionConfig {
  categories: {
    [key in PromotionCategory]: {
      color: string;
      icon: string;
      label: string;
    };
  };
  defaultImage: string;
  maxPromotions: number;
}

// Promotion configuration - easy to modify
export const PROMOTION_CONFIG: PromotionConfig = {
  categories: {
    seasonal: {
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      label: 'SEASONAL'
    },
    'new-customer': {
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      label: 'NEW CUSTOMER'
    },
    package: {
      color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      label: 'PACKAGE'
    },
    referral: {
      color: 'bg-gradient-to-r from-orange-500 to-yellow-500',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      label: 'REFERRAL'
    },
    loyalty: {
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      label: 'LOYALTY'
    },
    holiday: {
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
      label: 'HOLIDAY'
    }
  },
  defaultImage: '/images/nail-art-1.jpg',
  maxPromotions: 6
};

// Promotion data - easy to add, remove, or modify
export const PROMOTIONS: Promotion[] = [
  {
    id: 'online-booking-discount',
    title: 'Online Booking Discount',
    description: 'Book your appointment online and save 10% on your service! Convenient and cost-effective.',
    discount: '10% OFF',
    validUntil: '2025-12-31',
    image: '/images/nail-art-1.jpg',
    category: 'new-customer',
    isActive: true,
    priority: 1
  },
  {
    id: 'bring-a-friend',
    title: 'Bring a Friend',
    description: 'Bring a friend and both get 10% off your next appointment! Share the beauty and save together.',
    discount: '10% OFF',
    validUntil: '2025-12-31',
    image: '/images/nail-art-2.jpg',
    category: 'referral',
    isActive: true,
    priority: 2
  },
  {
    id: 'multi-service-package',
    title: 'Multi-Service Package',
    description: 'Book 2 or more services and get 10% off your total bill! Perfect for a complete nail care experience.',
    discount: '10% OFF',
    validUntil: '2025-12-31',
    image: '/images/nail-art-3.jpg',
    category: 'package',
    isActive: true,
    priority: 3
  }
];

// Utility functions for promotion management
export const getActivePromotions = (): Promotion[] => {
  return PROMOTIONS
    .filter(promotion => promotion.isActive)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

export const getPromotionsByCategory = (category: PromotionCategory): Promotion[] => {
  return getActivePromotions().filter(promotion => promotion.category === category);
};

export const getPromotionById = (id: string): Promotion | undefined => {
  return PROMOTIONS.find(promotion => promotion.id === id);
};

export const getCategoryConfig = (category: PromotionCategory) => {
  return PROMOTION_CONFIG.categories[category];
};

export const isPromotionExpired = (validUntil: string): boolean => {
  const expiryDate = new Date(validUntil);
  const now = new Date();
  return expiryDate.getTime() < now.getTime();
};

export const getDaysUntilExpiry = (validUntil: string): number => {
  const expiryDate = new Date(validUntil);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatValidUntil = (validUntil: string): string => {
  const daysUntil = getDaysUntilExpiry(validUntil);
  
  if (daysUntil < 0) return 'Expired';
  if (daysUntil === 0) return 'Expires today';
  if (daysUntil === 1) return 'Expires tomorrow';
  if (daysUntil <= 7) return `Expires in ${daysUntil} days`;
  if (daysUntil <= 30) return `Expires in ${Math.ceil(daysUntil / 7)} weeks`;
  return `Expires in ${Math.ceil(daysUntil / 30)} months`;
};
