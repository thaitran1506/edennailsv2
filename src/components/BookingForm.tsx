'use client';

import { useState } from 'react';
import { formatTimeForDisplay, getMinBookingDate, getMaxBookingDate } from '../lib/bookingUtils';
import BookingConfirmationModal from './BookingConfirmationModal';

interface TimeSlot {
  time: string;
  availableSlots: number;
  technicians: string[];
}

interface Service {
  id: string;
  name: string;
  price: string;
}

const SERVICES: Service[] = [
  { id: 'manicure', name: 'Manicure', price: '$25' },
  { id: 'gel-manicure', name: 'Gel Manicure', price: '$35' },
  { id: 'pedicure', name: 'Pedicure', price: '$35' },
  { id: 'gel-pedicure', name: 'Gel Pedicure', price: '$45' },
  { id: 'full-set', name: 'Full Set', price: '$45' },
  { id: 'fill', name: 'Fill', price: '$35' },
  { id: 'eden-signature-pedicure', name: 'Eden Signature Pedicure', price: '$55' },
  { id: 'pedicure-special', name: 'Pedicure Special', price: '$40' },
];

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    services: [] as string[],
    specialRequests: ''
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    date: string;
    time: string;
    services: Service[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialRequests?: string;
  } | null>(null);

  const getBusinessHoursInfo = (date: string) => {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return "Business Hours: Monday - Thursday, 10:00 AM - 7:00 PM";
    } else if (dayOfWeek === 5) {
      return "Business Hours: Friday, 10:00 AM - 8:00 PM";
    } else if (dayOfWeek === 6) {
      return "Business Hours: Saturday, 9:00 AM - 6:00 PM";
    } else {
      return "Business Hours: Sunday, 11:00 AM - 5:00 PM";
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'date' && value) {
      setIsLoadingSlots(true);
      try {
        const cacheBuster = Date.now();
        const response = await fetch(`/api/availability?date=${value}&_t=${cacheBuster}`);
                        if (response.ok) {
                  const data = await response.json();
                  console.log('API Response for date', value, ':', JSON.stringify(data, null, 2));
                  console.log('Available time slots:', data.timeSlots);
                  console.log('Time slots details:', data.timeSlots.map((slot: { time: string; availableSlots: number; technicians: string[] }) => ({
                    time: slot.time,
                    availableSlots: slot.availableSlots,
                    technicians: slot.technicians
                  })));
                  console.log('Debug info:', JSON.stringify(data.debug, null, 2));
                  console.log('Total existing bookings:', data.totalExistingBookings);
                  console.log('Cached:', data.cached);
                  setAvailableTimeSlots(data.timeSlots || []);
                } else {
          console.error('Failed to fetch availability');
          setAvailableTimeSlots([]);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailableTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleTimeSlotSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.services.length === 0) {
      alert('Please select at least one service.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get selected services
      const selectedServices = SERVICES.filter(service => formData.services.includes(service.id));
      
      // Create a single booking with all services listed
      const bookingData = {
        ...formData,
        service: selectedServices.map(s => s.name).join(', '), // List all services in one field
        serviceNames: selectedServices.map(s => s.name), // Array of service names
        servicePrices: selectedServices.map(s => s.price), // Array of service prices
        totalPrice: selectedServices.reduce((total, service) => {
          const price = parseInt(service.price.replace('$', ''));
          return total + price;
        }, 0),
        serviceCount: selectedServices.length
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      // Show confirmation modal
      setConfirmationData({
        date: formData.date,
        time: formData.time,
        services: selectedServices,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        specialRequests: formData.specialRequests
      });
      setShowConfirmation(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        services: [],
        specialRequests: ''
      });
      setAvailableTimeSlots([]);

    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#181113] mb-4 font-elegant">Book Your Appointment</h2>
          <p className="text-[#88636f]">Choose your services and preferred time slot</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#181113] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb477e] focus:border-transparent text-[#181113]"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#181113] mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb477e] focus:border-transparent text-[#181113]"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#181113] mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb477e] focus:border-transparent text-[#181113]"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-[#181113] mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={getMinBookingDate()}
              max={getMaxBookingDate()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb477e] focus:border-transparent text-[#181113]"
            />
            {formData.date && (
              <p className="text-sm text-[#88636f] mt-2">{getBusinessHoursInfo(formData.date)}</p>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-[#181113] mb-3">
              Select Services *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICES.map((service) => (
                <div
                  key={service.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    formData.services.includes(service.id)
                      ? 'border-[#eb477e] bg-[#eb477e] bg-opacity-5'
                      : 'border-gray-200 hover:border-[#eb477e] hover:bg-gray-50'
                  }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                        formData.services.includes(service.id)
                          ? 'border-[#eb477e] bg-[#eb477e]'
                          : 'border-gray-300'
                      }`}>
                        {formData.services.includes(service.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                                             <div>
                         <h3 className="font-medium text-[#181113]">{service.name}</h3>
                       </div>
                    </div>
                    <span className="font-semibold text-[#eb477e]">{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-[#181113] mb-3">
              Select Time *
            </label>
            {isLoadingSlots ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#eb477e]"></div>
              </div>
            ) : availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handleTimeSlotSelect(slot.time)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                      formData.time === slot.time
                        ? 'border-[#eb477e] bg-[#eb477e] text-white'
                        : 'border-gray-200 hover:border-[#eb477e] hover:bg-gray-50'
                    }`}
                  >
                    <div>{formatTimeForDisplay(slot.time)}</div>
                    <div className="text-xs opacity-75">
                      {slot.availableSlots} slots
                    </div>
                  </button>
                ))}
              </div>
            ) : formData.date ? (
              <p className="text-center py-8 text-[#88636f]">No available time slots for this date.</p>
            ) : (
              <p className="text-center py-8 text-[#88636f]">Please select a date to see available time slots.</p>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label htmlFor="specialRequests" className="block text-sm font-medium text-[#181113] mb-2">
              Special Requests
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb477e] focus:border-transparent text-[#181113]"
              placeholder="Any special requests or notes..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || formData.services.length === 0}
            className="w-full bg-[#eb477e] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#d63d6e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Booking Appointment...
              </div>
            ) : (
              'Book Appointment'
            )}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmationData && (
        <BookingConfirmationModal
          isOpen={showConfirmation}
          onClose={closeConfirmation}
          appointment={confirmationData}
        />
      )}
    </>
  );
}