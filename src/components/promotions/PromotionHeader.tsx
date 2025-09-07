'use client';

interface PromotionHeaderProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
}

export default function PromotionHeader({ 
  isVisible, 
  title = "Special Offers",
  subtitle = "Don't miss out on our amazing promotions! Book now and save on your next nail appointment."
}: PromotionHeaderProps) {
  return (
    <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] rounded-full mb-4">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <h2 className="text-4xl sm:text-5xl font-bold text-[#181113] mb-4 font-elegant">
        {title}
      </h2>
      <p className="text-xl text-[#88636f] max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
}
