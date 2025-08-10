'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  onBookNow: () => void;
}

export default function HeroSection({ onBookNow }: HeroSectionProps) {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    // Hero section animation
    const heroTimer = setTimeout(() => {
      setIsHeroVisible(true);
    }, 300);
    return () => clearTimeout(heroTimer);
  }, []);

  return (
    <div className="relative">
      {/* Hero Banner */}
      <div className={`relative h-[300px] sm:h-[350px] md:h-[400px] mb-8 transition-all duration-1000 transform ${
        isHeroVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}>
        <Image
          src="/hero/hero.jpg"
          alt="Eden Nails Salon"
          fill
          className="object-cover object-center transition-transform duration-700 hover:scale-105"
          priority
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 font-elegant transition-all duration-700 delay-300 ${
            isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Welcome to Eden Nails
          </h1>
          <p className={`text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl transition-all duration-700 delay-500 ${
            isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Where luxury meets artistry in every nail design
          </p>
          
          {/* Enhanced Book Your Appointment Button */}
          <button
            onClick={onBookNow}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={`relative overflow-hidden group px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <span className="relative z-10">Book Your Appointment</span>
            <div className={`absolute inset-0 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] transition-transform duration-300 ${
              isButtonHovered ? 'translate-x-0' : '-translate-x-full'
            }`}></div>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Animated Floating Elements */}
        <div className="absolute top-8 right-8 opacity-20 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-8 left-8 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-1/2 right-4 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-4 left-4 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
