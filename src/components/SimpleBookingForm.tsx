'use client';

import { useState, useEffect } from 'react';

interface BookingData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface SimpleBookingFormProps {
  onSubmit: (data: BookingData) => Promise<void>;
}

export default function SimpleBookingForm({ onSubmit }: SimpleBookingFormProps) {
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    message: ''
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const services: Service[] = [
    { id: 'manicure', name: 'Manicure', price: 25, duration: 60 },
    { id: 'manicure-shellac', name: 'Manicure and Shellac', price: 35, duration: 60 },
    { id: 'pedicure', name: 'Pedicure', price: 35, duration: 60 },
    { id: 'eden-signature-pedicure', name: 'Eden Signature Pedicure', price: 50, duration: 60 },
    { id: 'pedicure-special', name: 'Pedicure Special', price: 50, duration: 60 },
    { id: 'hot-rock-pedicure', name: 'Hot Rock Pedicure', price: 60, duration: 60 },
    { id: 'full-set', name: 'Full Set', price: 55, duration: 60 },
    { id: 'fill', name: 'Fill', price: 45, duration: 60 },
    { id: 'dipping-powder', name: 'Dipping Powder', price: 50, duration: 60 }
  ];

  // Generate available dates (next 21 days, excluding past dates)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip if it's in the past
      if (date < today) continue;
      
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  // Load available time slots when date changes
  useEffect(() => {
    if (formData.date) {
      loadAvailableSlots(formData.date);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date]);

  const loadAvailableSlots = async (date: string) => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(`/api/appointments?date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.availableSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Reset time when date changes
    if (field === 'date' && value !== formData.date) {
      setFormData(prev => ({
        ...prev,
        time: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (!formData.time) {
      newErrors.time = 'Please select a time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit(formData);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          date: '',
          time: '',
          message: ''
        });
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Booking submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.service);
  const availableDates = generateAvailableDates();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Book Your Appointment</h2>
        <p className="text-gray-600">Fill out the form below to schedule your visit</p>
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-2">✓</span>
            <div>
              <p className="text-green-800 font-medium">Appointment Booked Successfully!</p>
              <p className="text-green-700 text-sm">Your appointment has been saved to our system.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-2">⚠</span>
            <p className="text-red-800 font-medium">There was an error booking your appointment. Please try again.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
              }`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
              }`}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
            }`}
            placeholder="your@email.com"
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Service Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Service *
          </label>
          <select
            value={formData.service}
            onChange={(e) => handleInputChange('service', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.service ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Choose a service...</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price} ({service.duration} min)
              </option>
            ))}
          </select>
          {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
          
          {selectedService && (
            <div className="mt-2 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>{selectedService.name}</strong> - ${selectedService.price} ({selectedService.duration} minutes)
              </p>
            </div>
          )}
        </div>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Date *
            </label>
            <select
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a date...</option>
              {availableDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Time *
            </label>
            <select
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                errors.time ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
              }`}
              disabled={isSubmitting || !formData.date}
            >
              <option value="">
                {!formData.date ? 'Select a date first...' : 
                 isLoadingSlots ? 'Loading times...' : 
                 'Choose a time...'}
              </option>
              {availableSlots.map((slot) => {
                const time = new Date(`2000-01-01T${slot}`);
                const formattedTime = time.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
                return (
                  <option key={slot} value={slot}>
                    {formattedTime}
                  </option>
                );
              })}
            </select>
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            
            {formData.date && availableSlots.length === 0 && !isLoadingSlots && (
              <p className="text-amber-600 text-sm mt-1">
                No available times for this date. Please choose another date.
              </p>
            )}
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Special Requests or Notes (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
            placeholder="Any special requests or things we should know..."
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isSubmitting ? 'Booking Your Appointment...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
} 