'use client';

import { useState, useEffect } from 'react';
import { getActivePromotions, Promotion } from '../lib/promotions';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load active promotions
    const activePromotions = getActivePromotions();
    setPromotions(activePromotions);
  }, []);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('promotions');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    promotions,
    isVisible,
    handleBookNow,
    handleContact,
    // Utility functions
    refreshPromotions: () => setPromotions(getActivePromotions()),
    getPromotionCount: () => promotions.length,
    hasActivePromotions: () => promotions.length > 0
  };
};
