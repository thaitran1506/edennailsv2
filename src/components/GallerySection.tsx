'use client';

import { useState, useEffect, useCallback } from 'react';

const galleryImages = [
  '/images/featuredDesigns/design1.jpg',
  '/images/featuredDesigns/design2.jpg',
  '/images/featuredDesigns/design3.jpg',
  '/images/featuredDesigns/design4.jpg',
  '/images/featuredDesigns/design5.jpg',
  '/images/featuredDesigns/design6.jpg',
  '/images/featuredDesigns/design7.jpg',
  '/images/featuredDesigns/design8.jpg',
  '/images/featuredDesigns/design9.jpg',
  '/images/featuredDesigns/design10.jpg',
  '/images/featuredDesigns/design11.jpg',
  '/images/featuredDesigns/design12.jpg',
  '/images/featuredDesigns/design13.jpg',
  '/images/featuredDesigns/design14.jpg',
  '/images/featuredDesigns/design15.jpg',
];

export default function GallerySection() {
  const [currentImageSet, setCurrentImageSet] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Function to cycle through image sets
  const cycleImages = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageSet((prev) => (prev + 1) % imageSets.length);
      setIsTransitioning(false);
    }, 300); // Transition duration
  }, [imageSets.length]);

  // Auto-cycle images every 5 seconds
  useEffect(() => {
    const interval = setInterval(cycleImages, 5000);
    return () => clearInterval(interval);
  }, [cycleImages]);

  return (
    <section id="gallery" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#181113] mb-4 font-elegant">
            Our Gallery
          </h2>
          <p className="text-lg text-[#88636f] max-w-2xl mx-auto">
            Discover our stunning nail art designs and transformations. Each piece is crafted with precision and creativity.
          </p>
        </div>

        {/* 3x3 Grid Gallery */}
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          {imageSets[currentImageSet].map((image, index) => (
            <div
              key={`${currentImageSet}-${index}`}
              className={`relative aspect-square overflow-hidden rounded-lg shadow-lg transition-all duration-300 ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <img
                src={image}
                alt={`Nail design ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                loading="lazy"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-white text-center">
                  <div className="text-sm font-semibold">Design {index + 1}</div>
                  <div className="text-xs">Click to view</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Set Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {imageSets.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentImageSet(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageSet
                  ? 'bg-[#eb477e] scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image set ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-2 text-sm text-[#88636f]">
            <div className="w-2 h-2 bg-[#eb477e] rounded-full animate-pulse"></div>
            <span>Auto-cycling through designs</span>
          </div>
        </div>
      </div>
    </section>
  );
}
