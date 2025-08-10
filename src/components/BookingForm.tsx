'use client';

import { useState } from 'react';

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  specialRequest: string;
}

interface BookingFormProps {
  onSubmit: (data: AppointmentData) => Promise<void>;
}

export default function BookingForm({ onSubmit }: BookingFormProps) {
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

  // Use 24-hour values with 12-hour labels for API compatibility
  const timeSlots: Array<{ label: string; value: string }> = [
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '1:00 PM', value: '13:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: '5:00 PM', value: '17:00' },
    { label: '6:00 PM', value: '18:00' },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof AppointmentData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
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
      setTimeout(() => setIsSuccess(false), 5000); // Hide success message after 5 seconds
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-3 max-w-[960px] flex-1">
      <h2 className="text-[#181113] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-2 pt-3">Schedule Your Appointment</h2>
      <p className="text-[#181113] text-base font-normal leading-normal pb-2 pt-1 px-4 text-center">Ready to pamper yourself? Book your next nail service with us.</p>
      
      {isSuccess && (
        <div className="mx-4 mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800 font-medium">Appointment booked successfully! We'll confirm your booking shortly.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#181113] text-base font-medium leading-normal pb-1">Name</p>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181113] focus:outline-0 focus:ring-0 border h-12 placeholder:text-[#88636f] p-[12px] text-base font-normal leading-normal transition-colors duration-200 ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-[#e5dcdf] bg-white focus:border-[#eb477e]'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#181113] text-base font-medium leading-normal pb-1">Email</p>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181113] focus:outline-0 focus:ring-0 border h-12 placeholder:text-[#88636f] p-[12px] text-base font-normal leading-normal transition-colors duration-200 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-[#e5dcdf] bg-white focus:border-[#eb477e]'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#181113] text-base font-medium leading-normal pb-1">Phone Number</p>
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181113] focus:outline-0 focus:ring-0 border h-12 placeholder:text-[#88636f] p-[12px] text-base font-normal leading-normal transition-colors duration-200 ${
                errors.phone ? 'border-red-300 bg-red-50' : 'border-[#e5dcdf] bg-white focus:border-[#eb477e]'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#181113] text-base font-medium leading-normal pb-1">Service</p>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181113] focus:outline-0 focus:ring-0 border h-12 bg-[image:var(--select-button-svg)] bg-no-repeat bg-[right_12px_center] appearance-none pr-10 placeholder:text-[#88636f] p-[12px] text-base font-normal leading-normal transition-colors duration-200 ${
                errors.service ? 'border-red-300 bg-red-50' : 'border-[#e5dcdf] bg-white focus:border-[#eb477e]'
              }`}
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.title} value={service.title}>
                  {service.title} - {service.price}
                </option>
              ))}
            </select>
            {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service}</p>}
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#181113] text-base font-medium leading-normal pb-1">Date</p>
            <input
              type="date"
              name="date"
              min={getMinDate()}
              value={formData.date}
              onChange={handleChange}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181113] focus:outline-0 focus:ring-0 border h-12 placeholder:text-[#88636f] p-[12px] text-base font-normal leading-normal transition-colors duration-200 ${
                errors.date ? 'border-red-300 bg-red-50' : 'border-[#e5dcdf] bg-white focus:border-[#eb477e]'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#181113] text-base font-medium leading-normal pb-1">Time</p>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181113] focus:outline-0 focus:ring-0 border h-12 bg-[image:var(--select-button-svg)] bg-no-repeat bg-[right_12px_center] appearance-none pr-10 placeholder:text-[#88636f] p-[12px] text-base font-normal leading-normal transition-colors duration-200 ${
                errors.time ? 'border-red-300 bg-red-50' : 'border-[#e5dcdf] bg-white focus:border-[#eb477e]'
              }`}
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#181113] text-base font-medium leading-normal pb-1">Special Request (Optional)</p>
            <textarea
              name="specialRequest"
              placeholder="Any special requests or notes for your appointment..."
              value={formData.specialRequest}
              onChange={handleChange}
              rows={3}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181113] focus:outline-0 focus:ring-0 border placeholder:text-[#88636f] p-[12px] text-base font-normal leading-normal transition-colors duration-200 ${
                errors.specialRequest ? 'border-red-300 bg-red-50' : 'border-[#e5dcdf] bg-white focus:border-[#eb477e]'
              }`}
            />
            {errors.specialRequest && <p className="text-red-500 text-sm mt-1">{errors.specialRequest}</p>}
          </label>
        </div>

        <div className="flex px-4 py-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#eb477e] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d63d6e] transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Booking...
              </div>
            ) : (
              <span className="truncate">Book Appointment</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}