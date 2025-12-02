'use client';

import Image from 'next/image';
import { Promotion } from '../../lib/promotions';
import { RippleButton } from '../MicroInteractions';

interface PromotionCardProps {
  promotion: Promotion;
  onBookNow: () => void;
  className?: string;
}

export default function PromotionCard({ promotion, onBookNow, className = '' }: PromotionCardProps) {
  return (
    <div className={`group relative promotion-card-featured bg-white rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_rgba(235,71,126,0.3)] transition-all duration-500 transform hover:-translate-y-3 overflow-hidden ${className}`}>
      
      {/* Discount Badge - Enhanced */}
      <div className="absolute top-6 right-6 z-20 promotion-discount-badge text-white px-6 py-3 rounded-full text-2xl font-extrabold shadow-xl transform rotate-3">
        {promotion.discount}
      </div>
      
      {/* Sparkle Effect */}
      <div className="absolute top-4 left-4 z-10 w-16 h-16 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-md animate-pulse"></div>
      </div>

      {/* Image - Larger */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={promotion.image}
          alt={promotion.title}
          width={600}
          height={256}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        {/* Shimmer effect on image */}
        <div className="absolute inset-0 promotion-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Content - Enhanced */}
      <div className="p-8 bg-gradient-to-br from-white to-pink-50/30">
        <h3 className="text-3xl font-extrabold text-[#181113] mb-3 group-hover:text-[#eb477e] transition-colors duration-300 leading-tight">
          {promotion.title}
        </h3>
        <p className="text-[#88636f] text-base mb-6 leading-relaxed">
          {promotion.description}
        </p>

        {/* Pricing */}
        {promotion.originalPrice && promotion.newPrice && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-bold text-[#eb477e]">{promotion.newPrice}</span>
            <span className="text-lg text-gray-400 line-through">{promotion.originalPrice}</span>
          </div>
        )}

        {/* Urgency Indicator */}
        <div className="mb-6 p-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg border-l-4 border-orange-500">
          <p className="text-sm font-semibold text-orange-800">
            ⏰ Limited Time Offer - Book Now!
          </p>
        </div>

        {/* CTA Button - Larger */}
        <RippleButton
          onClick={onBookNow}
          variant="primary"
          size="lg"
          className="w-full py-4 text-lg font-bold transform group-hover:scale-105 transition-transform duration-300"
        >
          Book Your Appointment Now →
        </RippleButton>
      </div>

      {/* Hover Effect - Enhanced */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#eb477e]/10 via-[#ff6b9d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Glow effect on hover */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#eb477e] to-[#ff6b9d] rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}
