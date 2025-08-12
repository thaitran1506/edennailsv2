'use client';

import { useState } from 'react';
import { 
  getAvailableTimeSlots, 
  formatTimeForDisplay, 
  getMinBookingDate, 
  getMaxBookingDate, 
  TimeSlot,
  generateTimeSlots,
  isTimeAvailable,
  TECHNICIANS
} from '../lib/bookingUtils';

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  specialRequest: string;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<AppointmentData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    specialRequest: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<AppointmentData>>({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const services = [
    { title: "Manicure", price: "$25" },
    { title: "Manicure and Shellac", price: "$35" },
    { title: "Pedicure", price: "$35" },
    { title: "Eden Signature Pedicure", price: "$50" },
    { title: "Pedicure Special", price: "$50" },
    { title: "Hot Rock Pedicure", price: "$60" },
    { title: "Full Set", price: "$55+" },
    { title: "Fill", price: "$45+" },
    { title: "Dipping Powder", price: "$50+" }
  ];

  const validateForm = () => {
    const newErrors: Partial<AppointmentData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.service) newErrors.service = 'Please select a service';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear time selection when date changes
    if (name === 'date') {
      setFormData(prev => ({ ...prev, time: '' }));
      setAvailableTimeSlots([]);
      
      // Fetch available time slots for the selected date
      if (value) {
        setIsLoadingSlots(true);
        try {
          // Use server-side API instead of direct Google Sheets call
          const response = await fetch(`/api/availability?date=${value}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setAvailableTimeSlots(data.timeSlots);
            } else {
              console.error('Failed to fetch availability:', data.error);
              setAvailableTimeSlots([]);
            }
          } else {
            console.error('Failed to fetch availability:', response.status);
            setAvailableTimeSlots([]);
          }
        } catch (error) {
          console.error('Error fetching time slots:', error);
          setAvailableTimeSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      }
    }
    
    if (errors[name as keyof AppointmentData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          date: '',
          time: '',
          specialRequest: ''
        });
        setAvailableTimeSlots([]);
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        // Handle error response
        const errorMessage = result.error || 'Failed to book appointment. Please try again.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#181113] mb-4 font-elegant">
          Schedule Your Appointment
        </h2>
        <p className="text-lg text-[#88636f] max-w-md mx-auto">
          Book your appointment with our skilled technicians. Available slots are shown in real-time.
        </p>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-green-800 font-medium">Appointment booked successfully!</p>
              <p className="text-green-700 text-sm">We&apos;ll confirm your booking shortly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {/* Personal Information Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#181113] mb-6 flex items-center">
              <div className="w-8 h-8 bg-[#eb477e] rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#181113] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] ${
                    errors.name 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181113] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] ${
                    errors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#181113] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] ${
                    errors.phone 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white'
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Service & Schedule Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#181113] mb-6 flex items-center">
              <div className="w-8 h-8 bg-[#eb477e] rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Service & Schedule
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#181113] mb-2">
                  Select Service *
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 appearance-none bg-no-repeat bg-[right_16px_center] text-[#181113] ${
                    errors.service 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`
                  }}
                >
                  <option value="">Choose a service</option>
                  {services.map((service) => (
                    <option key={service.title} value={service.title}>
                      {service.title} - {service.price}
                    </option>
                  ))}
                </select>
                {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#181113] mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="date"
                  min={getMinBookingDate()}
                  max={getMaxBookingDate()}
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] ${
                    errors.date 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#181113] mb-2">
                  Available Time Slots *
                </label>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#eb477e]"></div>
                    <span className="ml-3 text-[#88636f]">Loading available times...</span>
                  </div>
                ) : availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: slot.time }))}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                          formData.time === slot.time
                            ? 'border-[#eb477e] bg-[#eb477e] text-white'
                            : 'border-gray-200 bg-gray-50 text-[#181113] hover:border-[#eb477e] hover:bg-white'
                        }`}
                      >
                        <div>{formatTimeForDisplay(slot.time)}</div>
                        <div className="text-xs opacity-75">
                          {slot.availableSlots} slot{slot.availableSlots !== 1 ? 's' : ''} available
                        </div>
                      </button>
                    ))}
                  </div>
                ) : formData.date ? (
                  <div className="text-center py-8 text-[#88636f]">
                    <p>No available time slots for this date.</p>
                    <p className="text-sm mt-1">Please select a different date.</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#88636f]">
                    <p>Please select a date to see available time slots.</p>
                  </div>
                )}
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>
          </div>

          {/* Special Requests Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#181113] mb-6 flex items-center">
              <div className="w-8 h-8 bg-[#eb477e] rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Special Requests
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-[#181113] mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="specialRequest"
                placeholder="Any special requests, preferences, or notes for your appointment..."
                value={formData.specialRequest}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 resize-none text-[#181113] ${
                  errors.specialRequest 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white'
                }`}
              />
              {errors.specialRequest && <p className="text-red-500 text-sm mt-1">{errors.specialRequest}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Booking Your Appointment...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Book Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}