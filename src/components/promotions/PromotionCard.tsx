'use client';

import Image from 'next/image';
import { Promotion, getCategoryConfig, formatValidUntil } from '../../lib/promotions';
import { RippleButton } from '../MicroInteractions';

interface PromotionCardProps {
  promotion: Promotion;
  onBookNow: () => void;
  className?: string;
}

export default function PromotionCard({ promotion, onBookNow, className = '' }: PromotionCardProps) {
  const categoryConfig = getCategoryConfig(promotion.category);

  const CategoryIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryConfig.icon} />
    </svg>
  );

  return (
    <div className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden ${className}`}>
      {/* Category Badge */}
      <div className={`absolute top-4 left-4 z-10 ${categoryConfig.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
        <CategoryIcon />
        {categoryConfig.label}
      </div>

      {/* Discount Badge */}
      <div className="absolute top-4 right-4 z-10 bg-white text-[#eb477e] px-3 py-1 rounded-full text-sm font-bold shadow-lg">
        {promotion.discount}
      </div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={promotion.image}
          alt={promotion.title}
          width={400}
          height={192}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#181113] mb-2 group-hover:text-[#eb477e] transition-colors duration-300">
          {promotion.title}
        </h3>
        <p className="text-[#88636f] text-sm mb-4 leading-relaxed">
          {promotion.description}
        </p>

        {/* Pricing */}
        {promotion.originalPrice && promotion.newPrice && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold text-[#eb477e]">{promotion.newPrice}</span>
            <span className="text-sm text-gray-400 line-through">{promotion.originalPrice}</span>
          </div>
        )}

        {/* Valid Until */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatValidUntil(promotion.validUntil)}
          </span>
        </div>

        {/* CTA Button */}
        <RippleButton
          onClick={onBookNow}
          variant="primary"
          size="sm"
          className="w-full"
        >
          Book Now
        </RippleButton>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#eb477e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}
