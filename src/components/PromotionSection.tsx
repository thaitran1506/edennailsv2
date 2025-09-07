'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { RippleButton } from './MicroInteractions';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  originalPrice?: string;
  newPrice?: string;
  validUntil: string;
  image: string;
  category: 'seasonal' | 'new-customer' | 'package' | 'referral';
  isActive: boolean;
}

const PROMOTIONS: Promotion[] = [
  {
    id: '1',
    title: 'New Year Special',
    description: 'Start 2025 with beautiful nails! Get 20% off your first visit.',
    discount: '20% OFF',
    originalPrice: '$50',
    newPrice: '$40',
    validUntil: '2025-01-31',
    image: '/images/nail-art-1.jpg',
    category: 'seasonal',
    isActive: true
  },
  {
    id: '2',
    title: 'Valentine\'s Day Package',
    description: 'Perfect for date night! Manicure + Pedicure combo with romantic nail art.',
    discount: '30% OFF',
    originalPrice: '$70',
    newPrice: '$49',
    validUntil: '2025-02-14',
    image: '/images/nail-art-2.jpg',
    category: 'package',
    isActive: true
  },
  {
    id: '3',
    title: 'Refer a Friend',
    description: 'Bring a friend and both get 15% off your next appointment!',
    discount: '15% OFF',
    validUntil: '2025-12-31',
    image: '/images/nail-art-3.jpg',
    category: 'referral',
    isActive: true
  },
  {
    id: '4',
    title: 'New Customer Welcome',
    description: 'First time visiting? Enjoy 25% off any service of your choice.',
    discount: '25% OFF',
    validUntil: '2025-12-31',
    image: '/images/nail-art-4.jpg',
    category: 'new-customer',
    isActive: true
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'seasonal':
      return 'bg-gradient-to-r from-red-500 to-pink-500';
    case 'new-customer':
      return 'bg-gradient-to-r from-green-500 to-emerald-500';
    case 'package':
      return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    case 'referral':
      return 'bg-gradient-to-r from-orange-500 to-yellow-500';
    default:
      return 'bg-gradient-to-r from-[#eb477e] to-[#d63d6e]';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'seasonal':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'new-customer':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      );
    case 'package':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'referral':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
  }
};

export default function PromotionSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

  const formatValidUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="promotions" className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#eb477e] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#181113] mb-4 font-elegant">
            Special Offers
          </h2>
          <p className="text-xl text-[#88636f] max-w-2xl mx-auto">
            Don't miss out on our amazing promotions! Book now and save on your next nail appointment.
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PROMOTIONS.map((promotion, index) => (
            <div
              key={promotion.id}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Category Badge */}
              <div className={`absolute top-4 left-4 z-10 ${getCategoryColor(promotion.category)} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                {getCategoryIcon(promotion.category)}
                {promotion.category.replace('-', ' ').toUpperCase()}
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
                  onClick={handleBookNow}
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
          ))}
        </div>

        {/* Featured Promotion Banner */}
        <div className={`relative bg-gradient-to-r from-[#eb477e] to-[#d63d6e] rounded-3xl p-8 md:p-12 text-white overflow-hidden transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '400ms' }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Limited Time Offer!
              </h3>
              <p className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl">
                Get 25% off your first visit when you book online. Perfect for trying our premium nail services!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <RippleButton
                  onClick={handleBookNow}
                  variant="secondary"
                  size="lg"
                  className="bg-white text-[#eb477e] hover:bg-gray-100"
                >
                  Book Your First Visit
                </RippleButton>
                <RippleButton
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  variant="secondary"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-[#eb477e]"
                >
                  Learn More
                </RippleButton>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
