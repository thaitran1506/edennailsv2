'use client';

import { useState } from 'react';
import { getMinBookingDate, getMaxBookingDate } from '../lib/bookingUtils';
import BookingConfirmationModal from './BookingConfirmationModal';
import SkeletonLoader from './SkeletonLoader';
import { AnimatedServiceCard, AnimatedTimeSlot, RippleButton, LoadingSpinner } from './MicroInteractions';

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
  { id: 'gel-pedicure', name: 'Gel Pedicure', price: '$50' },
  { id: 'full-set', name: 'Full Set', price: '$50' },
  { id: 'fill', name: 'Fill', price: '$40' },
  { id: 'dipping-powder', name: 'Dipping Powder', price: '$40' },
  { id: 'eden-signature-pedicure', name: 'Eden Signature Pedicure', price: '$50' },
  { id: 'pedicure-special', name: 'Pedicure Special', price: '$50' },
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
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return "Business Hours: Monday - Friday, 9:00 AM - 7:00 PM";
    } else if (dayOfWeek === 6) {
      return "Business Hours: Saturday, 10:00 AM - 6:00 PM";
    } else {
      return "Business Hours: Sunday, 10:00 AM - 6:00 PM";
    }
  };

  const loadAvailableSlots = async (date: string) => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(`/api/simple-book?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Simple API Response for date', date, ':', JSON.stringify(data, null, 2));
        console.log('Available time slots:', data.timeSlots);
        console.log('Total slots:', data.totalSlots);
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
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'date' && value) {
      await loadAvailableSlots(value);
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

      const response = await fetch('/api/simple-book', {
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
      
      // Refresh availability for the current date to show updated slot counts
      if (formData.date) {
        await loadAvailableSlots(formData.date);
      }

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
                <AnimatedServiceCard
                  key={service.id}
                  title={service.name}
                  price={service.price}
                  description={`Professional ${service.name.toLowerCase()} service`}
                  isSelected={formData.services.includes(service.id)}
                  onClick={() => handleServiceToggle(service.id)}
                />
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-[#181113] mb-3">
              Select Time *
            </label>
            {isLoadingSlots ? (
              <div className="space-y-4">
                <SkeletonLoader variant="timeSlot" />
                <div className="flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              </div>
            ) : availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {availableTimeSlots.map((slot) => (
                  <AnimatedTimeSlot
                    key={slot.time}
                    time={slot.time}
                    availableSlots={slot.availableSlots}
                    isSelected={formData.time === slot.time}
                    onClick={() => handleTimeSlotSelect(slot.time)}
                  />
                ))}
              </div>
            ) : formData.date ? (
              <div className="text-center py-8">
                <div className="text-[#88636f] mb-2">No available time slots for this date.</div>
                <div className="text-sm text-gray-400">Please try selecting a different date.</div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-[#88636f] mb-2">Please select a date to see available time slots.</div>
                <div className="text-sm text-gray-400">We'll show you all available appointments.</div>
              </div>
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
          <RippleButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || formData.services.length === 0}
            className="w-full py-4 px-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed btn-enhanced"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2 text-white" />
                Booking Appointment...
              </div>
            ) : (
              'Book Appointment'
            )}
          </RippleButton>
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