'use client';

import { useState } from 'react';

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AppointmentSchedulerProps {
  onSubmit: (data: AppointmentData) => void;
}

export default function AppointmentScheduler({ onSubmit }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    message: ''
  });
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Business hours configuration
  const businessHours = {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '19:00', closed: false },
    saturday: { open: '08:00', close: '17:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: false }
  };

  const services = [
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

  // Generate calendar dates (next 30 days)
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayConfig = businessHours[dayName as keyof typeof businessHours];
      
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        dayName,
        available: !dayConfig.closed,
        isToday: i === 0,
        isPast: false
      });
    }
    
    return dates;
  };

  // Generate time slots for selected date
  const generateTimeSlots = (date: string): TimeSlot[] => {
    if (!date) return [];
    
    const selectedDateObj = new Date(date);
    const dayName = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayConfig = businessHours[dayName as keyof typeof businessHours];
    
    if (dayConfig.closed) return [];
    
    const slots: TimeSlot[] = [];
    const [openHour, openMinute] = dayConfig.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayConfig.close.split(':').map(Number);
    
    const startTime = openHour * 60 + openMinute;
    const endTime = closeHour * 60 + closeMinute;
    
    // Generate 1-hour slots
    for (let time = startTime; time < endTime; time += 60) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if slot is in the past for today
      const now = new Date();
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);
      
      const isAvailable = slotDate > now;
      
      slots.push({
        time: timeString,
        available: isAvailable
      });
    }
    
    return slots;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!appointmentData.service) {
          newErrors.service = 'Please select a service';
        }
        break;
      case 2:
        if (!selectedDate) {
          newErrors.date = 'Please select a date';
        }
        if (!selectedTime) {
          newErrors.time = 'Please select a time';
        }
        break;
      case 3:
        if (!appointmentData.name.trim()) {
          newErrors.name = 'Name is required';
        }
        if (!appointmentData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appointmentData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!appointmentData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        setAppointmentData(prev => ({
          ...prev,
          date: selectedDate,
          time: selectedTime
        }));
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const finalData = {
        ...appointmentData,
        date: selectedDate,
        time: selectedTime
      };
      
      await onSubmit(finalData);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedDate('');
        setSelectedTime('');
        setAppointmentData({
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
      console.error('Appointment submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentData, value: string) => {
    setAppointmentData(prev => ({
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
  };

  const selectedService = services.find(s => s.id === appointmentData.service);
  const calendarDates = generateCalendarDates();
  const timeSlots = generateTimeSlots(selectedDate);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Step {currentStep} of 3: {
            currentStep === 1 ? 'Select Service' :
            currentStep === 2 ? 'Choose Date & Time' :
            'Contact Information'
          }
        </div>
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-2">✓</span>
            <div>
              <p className="text-green-800 font-medium">Appointment Booked Successfully!</p>
                              <p className="text-green-700 text-sm">We&apos;ll send you a confirmation email shortly.</p>
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

      {/* Step 1: Service Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Service</h2>
          
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  appointmentData.service === service.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => handleInputChange('service', service.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{service.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">${service.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {errors.service && <p className="text-red-500 text-sm">{errors.service}</p>}
          
          <button
            onClick={handleNext}
            className="w-full btn-primary py-3 text-lg"
            disabled={!appointmentData.service}
          >
            Continue to Date & Time
          </button>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Choose Date & Time</h2>
            <button
              onClick={handleBack}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back
            </button>
          </div>
          
          {selectedService && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-800">
                <strong>{selectedService.name}</strong> - ${selectedService.price} (60 min)
              </p>
            </div>
          )}

          {/* Calendar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {calendarDates.slice(0, 14).map((date) => (
                <button
                  key={date.date}
                  onClick={() => setSelectedDate(date.date)}
                  disabled={!date.available}
                  className={`p-3 text-sm rounded-lg transition-all duration-200 ${
                    selectedDate === date.date
                      ? 'bg-purple-600 text-white'
                      : date.available
                      ? 'bg-gray-100 hover:bg-purple-100 text-gray-800'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium">{date.display.split(' ')[1]}</div>
                  <div className="text-xs">{date.display.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Time</h3>
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 text-sm rounded-lg transition-all duration-200 ${
                      selectedTime === slot.time
                        ? 'bg-purple-600 text-white'
                        : slot.available
                        ? 'bg-gray-100 hover:bg-purple-100 text-gray-800'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}

          <button
            onClick={handleNext}
            className="w-full btn-primary py-3 text-lg"
            disabled={!selectedDate || !selectedTime}
          >
            Continue to Contact Info
          </button>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>
            <button
              onClick={handleBack}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back
            </button>
          </div>

          {/* Appointment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Appointment Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Service:</strong> {selectedService?.name}</p>
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time:</strong> {selectedTime}</p>

              <p><strong>Price:</strong> ${selectedService?.price}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={appointmentData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={appointmentData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={appointmentData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={appointmentData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Any special requests or notes..."
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full btn-primary py-4 text-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
          </button>
        </div>
      )}
    </div>
  );
} 