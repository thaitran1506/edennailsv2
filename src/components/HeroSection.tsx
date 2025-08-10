'use client';

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface HeroSectionProps {
  onBookNow: () => void;
}

export default function HeroSection({ onBookNow }: HeroSectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<number | null>(null);

  const featuredImages = Array.from({ length: 15 }, (_, i) => `/featuredDesigns/featured${i + 1}.jpg`);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const galleryElement = document.getElementById('gallery');
    if (galleryElement) {
      observer.observe(galleryElement);
    }

    return () => {
      if (galleryElement) {
        observer.unobserve(galleryElement);
      }
    };
  }, []);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setImageLoadError(null);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    setImageLoadError(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback(() => {
    if (selectedImage !== null) {
      const nextIndex = (selectedImage + 1) % featuredImages.length;
      setSelectedImage(nextIndex);
      setImageLoadError(null);
    }
  }, [selectedImage, featuredImages.length]);

  const prevImage = useCallback(() => {
    if (selectedImage !== null) {
      const prevIndex = selectedImage === 0 ? featuredImages.length - 1 : selectedImage - 1;
      setSelectedImage(prevIndex);
      setImageLoadError(null);
    }
  }, [selectedImage, featuredImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, closeLightbox, nextImage, prevImage]);

  const handleImageError = (index: number) => {
    setImageLoadError(index);
    console.error(`Failed to load image: ${featuredImages[index]}`);
  };

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-2">
      {/* Hero Banner */}
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden mb-8">
          <Image
            src="/hero/hero.jpg"
            alt="Eden Nails Salon"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 font-elegant">Welcome to Eden Nails</h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8">Where luxury meets artistry</p>
              <button
                onClick={onBookNow}
                className="bg-[#eb477e] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-[#d63d6e] transition-colors duration-200 transform hover:scale-105"
              >
                Book Your Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Featured Nail Designs Gallery */}
        <div id="gallery" className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8">
            <h2 className="text-[#181113] text-xl sm:text-2xl md:text-[28px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Nail Designs</h2>
            <p className="text-[#181113] text-sm sm:text-base font-normal leading-normal px-4 max-w-2xl mx-auto">Discover our latest nail art creations. Each design is crafted with precision and creativity to bring your vision to life.</p>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb477e]"></div>
            </div>
          )}

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4 transition-all duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {featuredImages.map((src, index) => (
              <div
                key={src}
                className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${
                  hoveredImage === index ? 'scale-105 shadow-2xl -translate-y-2' : ''
                }`}
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => openLightbox(index)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Image
                  src={src}
                  alt={`Featured design ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={() => handleImageError(index)}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>

                {/* Image Counter */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {index + 1} / {featuredImages.length}
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] blur-xl scale-110 -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 text-white hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full p-2 backdrop-blur-sm"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full p-2 sm:p-3 backdrop-blur-sm"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full p-2 sm:p-3 backdrop-blur-sm"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image Container */}
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
              {imageLoadError === selectedImage ? (
                <div className="text-white text-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-base sm:text-lg">Failed to load image</p>
                  <p className="text-sm text-gray-400 mt-2">Image {selectedImage + 1} of {featuredImages.length}</p>
                </div>
              ) : (
                <Image
                  src={featuredImages[selectedImage]}
                  alt={`Featured design ${selectedImage + 1}`}
                  fill
                  className="object-contain"
                  priority
                  onError={() => handleImageError(selectedImage)}
                />
              )}
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 px-3 sm:px-4 py-1 sm:py-2 rounded-full backdrop-blur-sm">
              <p className="text-sm sm:text-lg font-semibold">Image {selectedImage + 1} of {featuredImages.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
