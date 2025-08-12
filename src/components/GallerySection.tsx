'use client';

import { useState, useEffect, useCallback } from 'react';

const galleryImages = [
  '/featuredDesigns/featured1.jpg',
  '/featuredDesigns/featured2.jpg',
  '/featuredDesigns/featured3.jpg',
  '/featuredDesigns/featured4.jpg',
  '/featuredDesigns/featured5.jpg',
  '/featuredDesigns/featured6.jpg',
  '/featuredDesigns/featured7.jpg',
  '/featuredDesigns/featured8.jpg',
  '/featuredDesigns/featured9.jpg',
  '/featuredDesigns/featured10.jpg',
  '/featuredDesigns/featured11.jpg',
  '/featuredDesigns/featured12.jpg',
  '/featuredDesigns/featured13.jpg',
  '/featuredDesigns/featured14.jpg',
  '/featuredDesigns/featured15.jpg',
];

export default function GallerySection() {
  const [currentImageSet, setCurrentImageSet] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle', 'fadeOut', 'fadeIn'

  // Create 9 different image sets by rotating through the gallery images
  const createImageSets = useCallback(() => {
    const sets = [];
    for (let i = 0; i < 9; i++) {
      const set = [];
      for (let j = 0; j < 9; j++) {
        const imageIndex = (i + j) % galleryImages.length;
        set.push(galleryImages[imageIndex]);
      }
      sets.push(set);
    }
    return sets;
  }, []);

  const imageSets = createImageSets();

  // Function to cycle through image sets with smooth transitions
  const cycleImages = useCallback(() => {
    if (isTransitioning) return; // Prevent multiple transitions
    
    setIsTransitioning(true);
    setAnimationPhase('fadeOut');
    
    // Fade out phase
    setTimeout(() => {
      setCurrentImageSet((prev) => (prev + 1) % imageSets.length);
      setAnimationPhase('fadeIn');
      
      // Fade in phase
      setTimeout(() => {
        setAnimationPhase('idle');
        setIsTransitioning(false);
      }, 400); // Fade in duration
    }, 300); // Fade out duration
  }, [imageSets.length, isTransitioning]);

  // Manual navigation with smooth transitions
  const goToImageSet = useCallback((index: number) => {
    if (isTransitioning || index === currentImageSet) return;
    
    setIsTransitioning(true);
    setAnimationPhase('fadeOut');
    
    setTimeout(() => {
      setCurrentImageSet(index);
      setAnimationPhase('fadeIn');
      
      setTimeout(() => {
        setAnimationPhase('idle');
        setIsTransitioning(false);
      }, 400);
    }, 300);
  }, [currentImageSet, isTransitioning]);

  // Auto-cycle images every 6 seconds (slightly longer for better UX)
  useEffect(() => {
    const interval = setInterval(cycleImages, 6000);
    return () => clearInterval(interval);
  }, [cycleImages]);

  // Get animation classes based on phase
  const getAnimationClasses = () => {
    const baseClasses = 'relative aspect-square overflow-hidden rounded-lg shadow-lg transition-all duration-500 ease-in-out';
    
    switch (animationPhase) {
      case 'fadeOut':
        return `${baseClasses} opacity-0 scale-95 transform -translate-y-2`;
      case 'fadeIn':
        return `${baseClasses} opacity-100 scale-100 transform translate-y-0`;
      default:
        return `${baseClasses} opacity-100 scale-100 transform translate-y-0`;
    }
  };

  return (
    <section id="gallery" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3x3 Grid Gallery */}
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          {imageSets[currentImageSet].map((image, index) => (
            <div
              key={`${currentImageSet}-${index}`}
              className={getAnimationClasses()}
              style={{
                transitionDelay: `${index * 30}ms`, // Staggered animation
                animationDelay: `${index * 30}ms`,
              }}
            >
              <img
                src={image}
                alt={`Nail design ${index + 1}`}
                className="w-full h-full object-cover transition-all duration-700 ease-out hover:scale-110 hover:rotate-1"
                loading="lazy"
              />
              {/* Enhanced overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500 ease-out flex items-end justify-center pb-4">
                <div className="text-white text-center transform translate-y-4 hover:translate-y-0 transition-transform duration-300">
                  <div className="text-sm font-semibold mb-1">Design {index + 1}</div>
                  <div className="text-xs opacity-90">Click to view</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Image Set Indicator */}
        <div className="flex justify-center mt-8 space-x-3">
          {imageSets.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImageSet(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ease-out transform hover:scale-110 ${
                index === currentImageSet
                  ? 'bg-[#eb477e] scale-125 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
              aria-label={`Go to image set ${index + 1}`}
            />
          ))}
        </div>

        {/* Enhanced Auto-play indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-3 text-sm text-[#88636f] bg-gray-50 px-4 py-2 rounded-full">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#eb477e] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#eb477e] rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-2 h-2 bg-[#eb477e] rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
            <span className="font-medium">Auto-cycling through designs</span>
          </div>
        </div>
      </div>
    </section>
  );
}
