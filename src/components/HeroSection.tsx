'use client';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

interface HeroSectionProps {
  onBookNow: () => void;
}

export default function HeroSection({ onBookNow }: HeroSectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  const featuredImages = Array.from({ length: 15 }, (_, i) => `/featuredDesigns/featured${i + 1}.jpg`);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = () => {
    if (selectedImage !== null) setSelectedImage((selectedImage + 1) % featuredImages.length);
  };

  const prevImage = () => {
    if (selectedImage !== null) setSelectedImage(selectedImage === 0 ? featuredImages.length - 1 : selectedImage - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedImage, closeLightbox]);

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="@container">
          <div className="@[480px]:p-4">
            <div className="relative flex min-h-[480px] flex-col gap-6 @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4 overflow-hidden group">
              <Image
                src="/hero/hero.jpg"
                alt="Eden Nails salon hero"
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ objectPosition: 'center 30%' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50 z-10"></div>
              <div className="relative z-20 flex flex-col gap-4 text-center">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">Welcome to Eden Nails</h1>
                <h2 className="text-white text-sm @[480px]:text-base opacity-90">Experience the art of nail care in a tranquil setting. Our skilled technicians are dedicated to exceptional service.</h2>
              </div>
              <button
                onClick={onBookNow}
                className="relative z-20 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#eb477e] text-white text-sm font-bold hover:bg-[#d63d6e] transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span className="truncate">Book Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Nail Designs */}
        <div id="gallery" className="transition-all duration-700">
          <div className="text-center mb-10">
            <h2 className="text-[#181113] text-[28px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Nail Designs</h2>
            <p className="text-[#181113] text-base px-4 max-w-2xl mx-auto opacity-80">Discover our latest nail art creations. Each design is crafted with precision and creativity.</p>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb477e]"></div>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            {featuredImages.map((src, index) => (
              <div
                key={src}
                className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${hoveredImage === index ? 'scale-105 shadow-2xl' : ''}`}
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={src}
                  alt={`Featured design ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-all duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-sm font-semibold mb-1">Design #{index + 1}</h3>
                    <p className="text-xs opacity-90">Click to view</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs text-white font-medium">{index + 1}/{featuredImages.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Salon */}
        <h2 className="text-[#181113] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Our Salon</h2>
        <div className="flex w-full grow bg-white @container p-4">
          <div className="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-[3/2] rounded-lg grid grid-cols-[2fr_1fr_1fr]">
            <div className="relative w-full h-full group">
              <Image
                src="/shoppic/shop1.jpg"
                alt="Salon Interior 1"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="relative w-full h-full col-span-2 row-span-2 group">
              <Image
                src="/shoppic/shop2.jpg"
                alt="Salon Interior 2"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeLightbox}>
          <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            <button onClick={closeLightbox} className="absolute -top-16 right-0 text-white hover:text-gray-300 transition-all duration-200 z-10 bg-black/50 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
              <Image src={featuredImages[selectedImage]} alt={`Featured design ${selectedImage + 1}`} fill sizes="(max-width: 768px) 100vw, 80vw" className="object-contain" priority />
            </div>
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-8">
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-full">
              <div className="text-sm font-medium">{selectedImage + 1} of {featuredImages.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
