'use client';

import { useState, useEffect, useCallback } from 'react';

const galleryImages = [
  {
    id: 1,
    src: '/featuredDesigns/featured1.jpg',
    alt: 'Featured nail design showcase - Elegant floral patterns',
    category: 'Featured Design'
  },
  {
    id: 2,
    src: '/featuredDesigns/featured2.jpg',
    alt: 'Featured nail design showcase - Creative geometric patterns',
    category: 'Featured Design'
  },
  {
    id: 3,
    src: '/featuredDesigns/featured3.jpg',
    alt: 'Featured nail design showcase - Modern metallic accents',
    category: 'Featured Design'
  },
  {
    id: 4,
    src: '/featuredDesigns/featured4.jpg',
    alt: 'Featured nail design showcase - Sophisticated nail art',
    category: 'Featured Design'
  },
  {
    id: 5,
    src: '/featuredDesigns/featured5.jpg',
    alt: 'Featured nail design showcase - Professional nail artistry',
    category: 'Featured Design'
  },
  {
    id: 6,
    src: '/featuredDesigns/featured6.jpg',
    alt: 'Featured nail design showcase - Stunning nail art creation',
    category: 'Featured Design'
  },
  {
    id: 7,
    src: '/featuredDesigns/featured7.jpg',
    alt: 'Featured nail design showcase - Elegant nail masterpiece',
    category: 'Featured Design'
  },
  {
    id: 8,
    src: '/featuredDesigns/featured8.jpg',
    alt: 'Featured nail design showcase - Creative design inspiration',
    category: 'Featured Design'
  },
  {
    id: 9,
    src: '/featuredDesigns/featured9.jpg',
    alt: 'Featured nail design showcase - Premium nail artistry',
    category: 'Featured Design'
  },
  {
    id: 10,
    src: '/featuredDesigns/featured10.jpg',
    alt: 'Featured nail design showcase - Beautiful nail art',
    category: 'Featured Design'
  },
  {
    id: 11,
    src: '/featuredDesigns/featured11.jpg',
    alt: 'Featured nail design showcase - Artistic nail design',
    category: 'Featured Design'
  },
  {
    id: 12,
    src: '/featuredDesigns/featured12.jpg',
    alt: 'Featured nail design showcase - Stunning nail creation',
    category: 'Featured Design'
  },
  {
    id: 13,
    src: '/featuredDesigns/featured13.jpg',
    alt: 'Featured nail design showcase - Elegant nail art',
    category: 'Featured Design'
  },
  {
    id: 14,
    src: '/featuredDesigns/featured14.jpg',
    alt: 'Featured nail design showcase - Professional design',
    category: 'Featured Design'
  },
  {
    id: 15,
    src: '/featuredDesigns/featured15.jpg',
    alt: 'Featured nail design showcase - Masterpiece nail art',
    category: 'Featured Design'
  }
];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<number | null>(null);

  useEffect(() => {
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
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    setImageLoadError(null);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback(() => {
    if (selectedImage !== null) {
      const nextIndex = (selectedImage + 1) % galleryImages.length;
      setSelectedImage(nextIndex);
      setImageLoadError(null);
    }
  }, [selectedImage, galleryImages.length]);

  const prevImage = useCallback(() => {
    if (selectedImage !== null) {
      const prevIndex = selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1;
      setSelectedImage(prevIndex);
      setImageLoadError(null);
    }
  }, [selectedImage, galleryImages.length]);

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
  };

  return (
    <>
      <section id="gallery" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Gallery Grid */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb477e]"></div>
              </div>
            )}

            <div className={`grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 transition-all duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${
                    hoveredImage === index ? 'scale-105 shadow-2xl -translate-y-2' : ''
                  }`}
                  onMouseEnter={() => setHoveredImage(index)}
                  onMouseLeave={() => setHoveredImage(null)}
                  onClick={() => openLightbox(index)}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={() => handleImageError(index)}
                  />

                  {/* Enhanced Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-2 sm:pb-4">
                    <div className="text-white text-center transform translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs sm:text-sm font-medium">View Design</p>
                    </div>
                  </div>

                  {/* Interactive Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>

                  {/* Image Counter */}
                  <div className="absolute top-1 sm:top-2 lg:top-3 right-1 sm:right-2 lg:right-3 bg-black bg-opacity-50 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                    {index + 1} / {galleryImages.length}
                  </div>

                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] blur-xl scale-110 -z-10 animate-pulse"></div>

                  {/* Corner accent */}
                  <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border-l-2 border-t-2 border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border-r-2 border-b-2 border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
              ))}
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

      {/* Enhanced Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fadeIn"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 text-white hover:text-gray-300 transition-all duration-200 bg-black bg-opacity-50 rounded-full p-2 backdrop-blur-sm hover:bg-opacity-70 hover:scale-110"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-all duration-200 bg-black bg-opacity-50 rounded-full p-2 sm:p-3 backdrop-blur-sm hover:bg-opacity-70 hover:scale-110"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gray-300 transition-all duration-200 bg-black bg-opacity-50 rounded-full p-2 sm:p-3 backdrop-blur-sm hover:bg-opacity-70 hover:scale-110"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              {imageLoadError === selectedImage ? (
                <div className="text-white text-center">
                  <p className="text-base sm:text-lg">Image failed to load</p>
                  <p className="text-sm opacity-75">Please try again later</p>
                </div>
              ) : (
                <img
                  src={galleryImages[selectedImage].src}
                  alt={galleryImages[selectedImage].alt}
                  className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                  onError={() => handleImageError(selectedImage)}
                />
              )}
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full backdrop-blur-sm">
              <span className="text-sm sm:text-lg font-medium">
                {selectedImage + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
