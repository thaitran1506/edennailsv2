'use client';

import { useState } from 'react';

interface ContactFormProps {
  onSubmit: (data: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
          }`}
          placeholder="your.email@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Phone Number *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
            errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
          }`}
          placeholder="(555) 123-4567"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Preferred Service *
        </label>
        <select
          name="service"
          value={formData.service}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
            errors.service ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
          }`}
        >
          <option value="">Select a service</option>
          <option value="Classic Manicure">Classic Manicure - $35</option>
          <option value="Gel Manicure">Gel Manicure - $45</option>
          <option value="Luxury Pedicure">Luxury Pedicure - $55</option>
          <option value="Gel Pedicure">Gel Pedicure - $65</option>
          <option value="Nail Art Design">Nail Art Design - $25+</option>
          <option value="Nail Extensions">Nail Extensions - $85</option>
        </select>
        {errors.service && <p className="text-red-500 text-sm mt-2">{errors.service}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Special Requests
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
          placeholder="Any special requests, preferred dates, or additional notes..."
        />
      </div>
      
      <button
        type="submit"
        className="w-full btn-primary text-lg py-4"
      >
        Book Your Appointment
      </button>
    </form>
  );
} 