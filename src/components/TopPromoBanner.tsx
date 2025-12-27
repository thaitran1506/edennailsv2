'use client';

import { useState, useEffect } from 'react';
import { RippleButton } from './MicroInteractions';

export default function TopPromoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner should be visible
    const checkVisibility = () => {
      // Happy Hours promotion is ongoing (no expiry date)
      // Check if user has dismissed it (using new key for Happy Hours promotion)
      const dismissed = localStorage.getItem('promoBannerDismissedHappyHours');
      if (dismissed === 'true') {
        setIsDismissed(true);
        setIsVisible(false);
        document.body.classList.remove('has-promo-banner');
        return;
      }

      // Show banner for ongoing Happy Hours promotion
      setIsVisible(true);
      document.body.classList.add('has-promo-banner');
    };

    checkVisibility();

    // Cleanup
    return () => {
      document.body.classList.remove('has-promo-banner');
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('promoBannerDismissedHappyHours', 'true');
    document.body.classList.remove('has-promo-banner');
  };

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="top-promo-banner sticky top-0 bg-gradient-to-r from-[#eb477e] via-[#ff6b9d] to-[#f97316] text-white py-2 px-4 relative overflow-hidden z-[60] animate-slide-down shadow-lg">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-promo"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Promotion Message */}
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm sm:text-base font-bold leading-tight">
              🎉 <span className="inline-block animate-bounce">20% OFF</span> Happy Hours (2pm-5pm)! 
              <span className="hidden sm:inline"> Book online during Happy Hours</span>
            </p>
            <p className="text-xs sm:text-sm opacity-90 mt-0.5 sm:hidden">
              Book online during Happy Hours
            </p>
          </div>
        </div>

        {/* Right: CTA Button and Close */}
        <div className="flex items-center gap-2">
          <RippleButton
            onClick={handleBookNow}
            variant="ghost"
            size="sm"
            className="bg-white text-[#eb477e] hover:bg-white/90 font-semibold text-sm px-4 py-1.5 whitespace-nowrap"
          >
            Book Now →
          </RippleButton>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
            aria-label="Close promotion banner"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
