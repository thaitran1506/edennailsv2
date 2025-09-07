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
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ${className}`}>
      {promotions.map((promotion, index) => (
        <div
          key={promotion.id}
          className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <PromotionCard
            promotion={promotion}
            onBookNow={onBookNow}
          />
        </div>
      ))}
    </div>
  );
}
