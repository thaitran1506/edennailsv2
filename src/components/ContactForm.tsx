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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const sendToGoogleSheets = async (data: FormData) => {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbymLLbLaEL5P44HTBN4EXATe4AiKjfAja2VG2XoNyoIgHu9pI-8B8PZ88BTbyFtu104/exec';
    
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return true; // If we reach here, the request was sent
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      
      try {
        // Send to Google Sheets
        const sheetsSuccess = await sendToGoogleSheets(formData);
        
        // Call the original onSubmit for any additional handling
        onSubmit(formData);
        
        if (sheetsSuccess) {
          setSubmitStatus('success');
          // Reset form
          setFormData({
            name: '',
            email: '',
            phone: '',
            service: '',
            message: ''
          });
        } else {
          setSubmitStatus('error');
        }
      } catch (error) {
        console.error('Submission error:', error);
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
      }
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
      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-2">✓</span>
            <p className="text-green-800 font-medium">Booking submitted successfully! We&apos;ll contact you soon to confirm.</p>
          </div>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-2">⚠</span>
            <p className="text-red-800 font-medium">There was an issue submitting your booking. Please try again or call us directly.</p>
          </div>
        </div>
      )}
      
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full btn-primary text-lg py-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Submitting...' : 'Book Your Appointment'}
      </button>
    </form>
  );
} 