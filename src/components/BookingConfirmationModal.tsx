'use client';

import { useEffect } from 'react';

interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    date: string;
    time: string;
    services: Service[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialRequests?: string;
  };
}

export default function BookingConfirmationModal({ 
  isOpen, 
  onClose, 
  appointment 
}: BookingConfirmationModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const totalDuration = appointment.services.reduce((total, service) => {
    const duration = parseInt(service.duration.split(' ')[0]);
    return total + duration;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-4">
        {/* Success Icon */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="text-center px-6 pb-4">
          <h2 className="text-2xl font-bold text-[#181113] mb-2">Appointment Confirmed!</h2>
          <p className="text-[#88636f]">Your booking has been successfully scheduled</p>
        </div>

        {/* Appointment Details */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-[#181113] mb-3">Appointment Summary</h3>
            
            {/* Date & Time */}
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-[#eb477e] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-[#181113]">{formatDate(appointment.date)}</p>
                <p className="text-sm text-[#88636f]">{formatTime(appointment.time)}</p>
              </div>
            </div>

            {/* Services */}
            <div className="mb-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#eb477e] mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-[#181113] mb-1">Services:</p>
                  {appointment.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center mb-1">
                      <span className="text-sm text-[#88636f]">{service.name}</span>
                      <span className="text-sm font-medium text-[#181113]">{service.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#eb477e] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-[#88636f]">Total Duration: {totalDuration} minutes</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#181113] mb-3">Your Information</h3>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium text-[#181113]">Name:</span> {appointment.customerName}</p>
              <p className="text-sm"><span className="font-medium text-[#181113]">Email:</span> {appointment.customerEmail}</p>
              <p className="text-sm"><span className="font-medium text-[#181113]">Phone:</span> {appointment.customerPhone}</p>
              {appointment.specialRequests && (
                <p className="text-sm"><span className="font-medium text-[#181113]">Special Requests:</span> {appointment.specialRequests}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-[#eb477e] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d63d6e] transition-colors duration-200 transform hover:scale-105"
            >
              Done
            </button>
            <button
              onClick={() => {
                onClose();
                // Scroll to booking section for another appointment
                const bookingSection = document.getElementById('booking');
                if (bookingSection) {
                  bookingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full bg-white text-[#eb477e] border-2 border-[#eb477e] py-3 px-6 rounded-lg font-medium hover:bg-[#eb477e] hover:text-white transition-all duration-200"
            >
              Book Another Appointment
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
