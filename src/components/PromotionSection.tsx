'use client';

import { usePromotions } from '../hooks/usePromotions';
import PromotionHeader from './promotions/PromotionHeader';
import PromotionGrid from './promotions/PromotionGrid';

export default function PromotionSection() {
  const { promotions, isVisible, handleBookNow } = usePromotions();

  return (
    <section id="promotions" className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#eb477e] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PromotionHeader isVisible={isVisible} />
        <PromotionGrid 
          promotions={promotions} 
          isVisible={isVisible} 
          onBookNow={handleBookNow} 
        />
      </div>
    </section>
  );
}
