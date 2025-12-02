'use client';

import { Promotion } from '../../lib/promotions';
import PromotionCard from './PromotionCard';

interface PromotionGridProps {
  promotions: Promotion[];
  isVisible: boolean;
  onBookNow: () => void;
  className?: string;
}

export default function PromotionGrid({ promotions, isVisible, onBookNow, className = '' }: PromotionGridProps) {
  // If only one promotion, center it and make it larger
  const isSinglePromo = promotions.length === 1;
  
  return (
    <div className={`flex justify-center items-center mb-12 ${className}`}>
      <div className={`${
        isSinglePromo 
          ? 'w-full max-w-2xl' 
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full'
      }`}>
        {promotions.map((promotion, index) => (
          <div
            key={promotion.id}
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <PromotionCard
              promotion={promotion}
              onBookNow={onBookNow}
              className={isSinglePromo ? 'w-full' : ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
