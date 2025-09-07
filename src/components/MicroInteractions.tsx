'use client';

import { useState, useRef } from 'react';

// Ripple effect for buttons
export const useRipple = () => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return { ripples, createRipple, buttonRef };
};

// Ripple Button Component
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RippleButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  ...props 
}: RippleButtonProps) => {
  const { ripples, createRipple, buttonRef } = useRipple();

  const baseClasses = "relative overflow-hidden font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-[#eb477e] text-white hover:bg-[#d63d6e] focus:ring-[#eb477e] shadow-md hover:shadow-lg",
    secondary: "bg-white text-[#eb477e] border-2 border-[#eb477e] hover:bg-[#eb477e] hover:text-white focus:ring-[#eb477e]",
    ghost: "text-[#eb477e] hover:bg-[#eb477e] hover:bg-opacity-10 focus:ring-[#eb477e]"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-lg"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </button>
  );
};

// Animated Service Card
interface AnimatedServiceCardProps {
  title: string;
  price: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const AnimatedServiceCard = ({
  title,
  price,
  description,
  isSelected,
  onClick,
  className = ''
}: AnimatedServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative overflow-hidden cursor-pointer transition-all duration-300 ease-out
        border-2 rounded-lg p-4 md:p-6
        ${isSelected 
          ? 'border-[#eb477e] bg-[#eb477e] bg-opacity-5 scale-105 shadow-lg' 
          : 'border-gray-200 hover:border-[#eb477e] hover:bg-gray-50'
        }
        ${isHovered ? 'transform -translate-y-1' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#eb477e] rounded-full flex items-center justify-center animate-scale-in">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Hover effect overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-[#eb477e]/5 to-transparent
        opacity-0 transition-opacity duration-300
        ${isHovered ? 'opacity-100' : ''}
      `} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#181113] mb-1 sm:mb-0">
            {title}
          </h3>
          <div className="text-left sm:text-right">
            <div className="text-sm sm:text-base md:text-lg font-semibold text-[#eb477e]">
              {price}
            </div>
          </div>
        </div>

        <p className="text-[#88636f] text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Animated border */}
      <div className={`
        absolute inset-0 border-2 border-[#eb477e] rounded-lg
        opacity-0 transition-all duration-300
        ${isSelected ? 'opacity-100' : ''}
        ${isHovered ? 'opacity-50' : ''}
      `} />
    </div>
  );
};

// Animated Time Slot Button
interface AnimatedTimeSlotProps {
  time: string;
  availableSlots: number;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const AnimatedTimeSlot = ({
  time,
  availableSlots,
  isSelected,
  onClick,
  className = ''
}: AnimatedTimeSlotProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <button
      type="button"
      className={`
        time-slot-button relative overflow-hidden p-3 rounded-lg border-2 text-sm font-medium
        transition-all duration-200 ease-out transform
        ${isSelected 
          ? 'border-[#eb477e] bg-[#eb477e] text-white scale-105 shadow-md selected' 
          : 'border-gray-200 text-gray-800 bg-white hover:border-[#eb477e] hover:bg-gray-50 hover:text-gray-900'
        }
        ${isHovered ? 'scale-105' : ''}
        ${className}
      `}
      style={{
        color: isSelected ? '#ffffff' : '#1f2937',
        backgroundColor: isSelected ? '#eb477e' : '#ffffff',
        WebkitTextFillColor: isSelected ? '#ffffff' : '#1f2937'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10 time-slot-text">
        <div 
          className={isSelected ? 'text-white' : 'text-gray-800'}
          style={{ color: isSelected ? '#ffffff' : '#1f2937' }}
        >
          {formatTime(time)}
        </div>
        <div 
          className={`text-xs ${isSelected ? 'text-white opacity-75' : 'text-gray-600 opacity-75'}`}
          style={{ color: isSelected ? '#ffffff' : '#4b5563' }}
        >
          {availableSlots} slot{availableSlots !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Hover effect */}
      <div className={`
        absolute inset-0 bg-[#eb477e] opacity-0 transition-opacity duration-200
        ${isHovered && !isSelected ? 'opacity-10' : ''}
      `} />
    </button>
  );
};

// Loading Spinner with animation
export const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};
