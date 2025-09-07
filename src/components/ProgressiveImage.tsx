'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  onClick?: () => void;
  fill?: boolean;
  sizes?: string;
}

export default function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder,
  onClick,
  fill = false,
  sizes
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);


  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  const imageProps = {
    src,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    sizes,
    className: `transition-all duration-700 ease-out ${
      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
    } ${onClick ? 'cursor-pointer' : ''} ${className}`,
    ...(fill ? { fill: true } : { width, height })
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          {placeholder ? (
            <Image
              src={placeholder}
              alt="Loading placeholder"
              fill
              className="blur-sm scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
        </div>
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <Image {...imageProps} />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Failed to load</p>
          </div>
        </div>
      )}

      {/* Loading shimmer effect */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
    </div>
  );
}
