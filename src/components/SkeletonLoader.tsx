'use client';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'button' | 'image' | 'timeSlot';
  lines?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  variant = 'text', 
  lines = 1, 
  className = '' 
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";
  
  switch (variant) {
    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`${baseClasses} h-4 ${
                index === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            />
          ))}
        </div>
      );
      
    case 'card':
      return (
        <div className={`${baseClasses} p-4 space-y-3 ${className}`}>
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className={`${baseClasses} h-5 w-3/4`} />
              <div className={`${baseClasses} h-4 w-1/2`} />
            </div>
            <div className={`${baseClasses} h-6 w-12`} />
          </div>
          <div className={`${baseClasses} h-3 w-full`} />
          <div className={`${baseClasses} h-3 w-2/3`} />
        </div>
      );
      
    case 'button':
      return (
        <div className={`${baseClasses} h-10 w-24 ${className}`} />
      );
      
    case 'image':
      return (
        <div className={`${baseClasses} aspect-square w-full ${className}`} />
      );
      
    case 'timeSlot':
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`${baseClasses} h-16 w-full`}
            />
          ))}
        </div>
      );
      
    default:
      return <div className={`${baseClasses} h-4 w-full ${className}`} />;
  }
}
