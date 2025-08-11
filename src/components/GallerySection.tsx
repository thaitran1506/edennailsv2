'use client';

import { useState, useEffect } from 'react';

const galleryImages = [
  {
    id: 1,
    src: '/images/nail-art-1.jpg',
    alt: 'Elegant nail art design with floral patterns',
    category: 'Nail Art'
  },
  {
    id: 2,
    src: '/images/nail-art-2.jpg',
    alt: 'Creative nail art with geometric patterns',
    category: 'Nail Art'
  },
  {
    id: 3,
    src: '/images/nail-art-3.jpg',
    alt: 'Modern nail art with metallic accents',
    category: 'Nail Art'
  },
  {
    id: 4,
    src: '/images/nail-art-4.jpg',
    alt: 'Sophisticated nail art design',
    category: 'Nail Art'
  },
  {
    id: 5,
    src: '/images/manicure-process.jpg',
    alt: 'Professional manicure service',
    category: 'Manicure'
  },
  {
    id: 6,
    src: '/images/pedicure-service.jpg',
    alt: 'Luxurious pedicure treatment',
    category: 'Pedicure'
  },
  {
    id: 7,
    src: '/images/nail-salon-service.jpg',
    alt: 'Premium nail salon services',
    category: 'Salon Services'
  },
  {
    id: 8,
    src: '/featuredDesigns/featured1.jpg',
    alt: 'Featured nail design showcase',
    category: 'Featured Design'
  },
  {
    id: 9,
    src: '/featuredDesigns/featured2.jpg',
    alt: 'Elegant nail art masterpiece',
    category: 'Featured Design'
  },
  {
    id: 10,
    src: '/featuredDesigns/featured3.jpg',
    alt: 'Creative nail design inspiration',
    category: 'Featured Design'
  },
  {
    id: 11,
    src: '/featuredDesigns/featured4.jpg',
    alt: 'Professional nail artistry',
    category: 'Featured Design'
  },
  {
    id: 12,
    src: '/featuredDesigns/featured5.jpg',
    alt: 'Stunning nail art creation',
    category: 'Featured Design'
  }
];

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <section id="gallery" className="py-16 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#181113] mb-4 font-elegant">
            Our Gallery
          </h2>
          <p className="text-xl text-[#88636f] max-w-2xl mx-auto">
            Discover our stunning nail art creations and professional services
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
            {/* Image Container */}
            <div className="relative aspect-[4/3] sm:aspect-[16/9]">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentIndex 
                      ? 'opacity-100 translate-x-0' 
                      : index < currentIndex 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/800x600/f8f9fa/6c757d?text=Eden+Nails+Gallery';
                    }}
                  />
                  
                  {/* Image Overlay with Category */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <div className="absolute bottom-6 left-6">
                      <span className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[#181113] shadow-lg">
                        {image.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 group"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6 text-[#181113] group-hover:text-[#eb477e] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 group"
              aria-label="Next image"
            >
              <svg className="w-6 h-6 text-[#181113] group-hover:text-[#eb477e] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Auto-play Toggle */}
            <button
              onClick={toggleAutoPlay}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 group"
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? (
                <svg className="w-5 h-5 text-[#181113] group-hover:text-[#eb477e] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#181113] group-hover:text-[#eb477e] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Thumbnail Navigation */}
          <div className="mt-6">
            <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentIndex 
                      ? 'ring-2 ring-[#eb477e] ring-offset-2 scale-110' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/64x48/f8f9fa/6c757d?text=Gallery';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex justify-center space-x-1">
              {galleryImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-[#eb477e] w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Image Counter */}
          <div className="mt-4 text-center">
            <span className="text-sm text-[#88636f] font-medium">
              {currentIndex + 1} of {galleryImages.length}
            </span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-[#88636f] mb-6">
            Ready to create your own stunning nail art?
          </p>
          <a
            href="#booking"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book Your Appointment
          </a>
        </div>
      </div>
    </section>
  );
}
