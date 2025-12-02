'use client';

import { useState, useEffect } from 'react';
import { RippleButton } from './MicroInteractions';

export default function TopPromoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner should be visible
    const checkVisibility = () => {
      const expiryDate = new Date('2025-12-20T23:59:59');
      const now = new Date();
      
      // Hide if expired
      if (now > expiryDate) {
        setIsVisible(false);
        document.body.classList.remove('has-promo-banner');
        return;
      }

      // Check if user has dismissed it
      const dismissed = localStorage.getItem('promoBannerDismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
        setIsVisible(false);
        document.body.classList.remove('has-promo-banner');
        return;
      }

      // Show banner if within date range
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
    localStorage.setItem('promoBannerDismissed', 'true');
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
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-shimmer-promo"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Promotion Message */}
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm sm:text-base font-bold leading-tight">
              🎉 <span className="inline-block animate-bounce">50% OFF</span> Online Bookings! 
              <span className="hidden sm:inline"> Limited time: Dec 1-20, 2025</span>
            </p>
            <p className="text-xs sm:text-sm opacity-90 mt-0.5 sm:hidden">
              Limited time: Dec 1-20, 2025
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
