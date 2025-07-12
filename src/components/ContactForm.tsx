'use client';

import { useState, useEffect, useRef } from 'react';

interface ContactFormProps {
  onSubmit: (data: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  honeypot?: string; // Hidden field to catch bots
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    honeypot: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [localStorageAvailable, setLocalStorageAvailable] = useState<boolean>(true);
  const formRef = useRef<HTMLFormElement>(null);

  // Rate limiting: Max 3 submissions per hour per user
  const MAX_SUBMISSIONS_PER_HOUR = 3;
  const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
  const MIN_SUBMISSION_INTERVAL = 5000; // 5 seconds between submissions

  // Check if localStorage is available (Windows Chrome may have issues)
  const isLocalStorageAvailable = () => {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__localStorage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  };

  // Safe localStorage operations with fallbacks
  const safeGetItem = (key: string): string | null => {
    try {
      if (!localStorageAvailable) return null;
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage getItem failed:', e);
      return null;
    }
  };

  const safeSetItem = (key: string, value: string): boolean => {
    try {
      if (!localStorageAvailable) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage setItem failed:', e);
      return false;
    }
  };

  // Load submission history from localStorage
  useEffect(() => {
    const storageAvailable = isLocalStorageAvailable();
    setLocalStorageAvailable(storageAvailable);
    
    if (storageAvailable) {
      const savedSubmissions = safeGetItem('eden-nails-submissions');
      if (savedSubmissions) {
        try {
          const submissions = JSON.parse(savedSubmissions);
          if (Array.isArray(submissions)) {
            const now = Date.now();
            const recentSubmissions = submissions.filter((time: number) => 
              typeof time === 'number' && now - time < RATE_LIMIT_WINDOW
            );
            setSubmissionCount(recentSubmissions.length);
            setLastSubmissionTime(recentSubmissions[recentSubmissions.length - 1] || 0);
          }
        } catch (error) {
          console.warn('Error parsing submission history:', error);
          // Clear corrupted data
          safeSetItem('eden-nails-submissions', '[]');
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RATE_LIMIT_WINDOW]);

  // Save submission to localStorage
  const saveSubmission = () => {
    if (!localStorageAvailable) return;
    
    const now = Date.now();
    const savedSubmissions = safeGetItem('eden-nails-submissions');
    let submissions: number[] = [];
    
    if (savedSubmissions) {
      try {
        const parsed = JSON.parse(savedSubmissions);
        if (Array.isArray(parsed)) {
          submissions = parsed.filter(time => typeof time === 'number');
        }
      } catch (error) {
        console.warn('Error parsing submission history:', error);
      }
    }
    
    // Add current submission and filter out old ones
    submissions.push(now);
    submissions = submissions.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (safeSetItem('eden-nails-submissions', JSON.stringify(submissions))) {
      setSubmissionCount(submissions.length);
      setLastSubmissionTime(now);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    const now = Date.now();
    
    // Check rate limiting (only if localStorage is available)
    if (localStorageAvailable && submissionCount >= MAX_SUBMISSIONS_PER_HOUR) {
      newErrors.name = `Too many submissions. Please wait ${Math.ceil((RATE_LIMIT_WINDOW - (now - lastSubmissionTime)) / (60 * 1000))} minutes before trying again.`;
      return false;
    }
    
    // Check minimum interval between submissions (only if localStorage is available)
    if (localStorageAvailable && now - lastSubmissionTime < MIN_SUBMISSION_INTERVAL) {
      newErrors.name = 'Please wait a few seconds before submitting again.';
      return false;
    }
    
    // Check honeypot (bots will fill this field)
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      newErrors.name = 'Invalid submission detected.';
      return false;
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else {
      // Cross-platform phone validation - more robust regex
      const phoneDigits = formData.phone.replace(/[\s\-\(\)\.+]/g, '');
      
      // Check if it contains only digits and is reasonable length
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
      } else if (!/^\d+$/.test(phoneDigits)) {
        newErrors.phone = 'Phone number can only contain digits, spaces, dashes, parentheses, and plus signs';
      }
    }
    
    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    // Additional validation for message length
    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'Message must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitBooking = async (data: FormData) => {
    try {
      // Add additional headers for better cross-platform compatibility
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Add user agent info for debugging
      if (typeof navigator !== 'undefined') {
        headers['X-User-Platform'] = navigator.platform;
        headers['X-User-Agent'] = navigator.userAgent;
      }
      
      const response = await fetch('/api/book', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...data,
          clientInfo: {
            platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            localStorageAvailable,
            timestamp: new Date().toISOString()
          }
        }),
        // Add credentials for better cross-platform compatibility
        credentials: 'same-origin',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        return { 
          success: false, 
          error: `Server error (${response.status}): ${response.statusText}` 
        };
      }
      
      const result = await response.json();
      
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error || 'Submission failed' };
      }
    } catch (error) {
      console.error('Network error submitting booking:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { success: false, error: 'Network connection error. Please check your internet connection and try again.' };
      } else if (error instanceof SyntaxError) {
        return { success: false, error: 'Invalid response from server. Please try again.' };
      } else {
        return { success: false, error: 'Network error. Please try again.' };
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      
      try {
        // Add a small delay to prevent rapid submissions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Submit booking through API
        const result = await submitBooking(formData);
        
        if (result.success) {
          // Save submission to localStorage (if available)
          if (localStorageAvailable) {
            saveSubmission();
          }
          
          // Call the original onSubmit for any additional handling
          onSubmit(formData);
          
          setSubmitStatus('success');
          // Reset form
          setFormData({
            name: '',
            email: '',
            phone: '',
            service: '',
            message: '',
            honeypot: ''
          });
          
          // Reset form ref
          if (formRef.current) {
            formRef.current.reset();
          }
        } else {
          setSubmitStatus('error');
          // Show specific error message
          setErrors({ name: result.error });
        }
      } catch (error) {
        console.error('Submission error:', error);
        setSubmitStatus('error');
        setErrors({ name: 'An unexpected error occurred. Please try again.' });
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

  // Calculate remaining submissions (only if localStorage is available)
  const remainingSubmissions = localStorageAvailable 
    ? Math.max(0, MAX_SUBMISSIONS_PER_HOUR - submissionCount)
    : MAX_SUBMISSIONS_PER_HOUR;
  const timeUntilReset = localStorageAvailable 
    ? Math.max(0, RATE_LIMIT_WINDOW - (Date.now() - lastSubmissionTime))
    : 0;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Rate limiting info - only show if localStorage is available */}
      {localStorageAvailable && submissionCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm">
                Submissions this hour: {submissionCount}/{MAX_SUBMISSIONS_PER_HOUR}
              </p>
              <p className="text-blue-600 text-xs">
                {remainingSubmissions > 0 
                  ? `${remainingSubmissions} submissions remaining`
                  : `Rate limit resets in ${Math.ceil(timeUntilReset / (60 * 1000))} minutes`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show warning if localStorage is not available */}
      {!localStorageAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-yellow-600 text-xl mr-2">⚠</span>
            <p className="text-yellow-800 text-sm">
              Local storage is not available. Rate limiting may not work properly.
            </p>
          </div>
        </div>
      )}

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
      
      {/* Honeypot field - hidden from users but visible to bots */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      
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
          autoComplete="name"
          maxLength={50}
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
          autoComplete="email"
          maxLength={100}
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
          autoComplete="tel"
          maxLength={20}
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
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
            errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-300'
          }`}
          placeholder="Any special requests, preferred dates, or additional notes..."
          disabled={isSubmitting}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
          <p className="text-gray-500 text-xs ml-auto">
            {formData.message.length}/500 characters
          </p>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || (localStorageAvailable && submissionCount >= MAX_SUBMISSIONS_PER_HOUR)}
        className={`w-full btn-primary text-lg py-4 ${
          isSubmitting || (localStorageAvailable && submissionCount >= MAX_SUBMISSIONS_PER_HOUR)
            ? 'opacity-50 cursor-not-allowed' 
            : ''
        }`}
      >
        {isSubmitting 
          ? 'Submitting...' 
          : (localStorageAvailable && submissionCount >= MAX_SUBMISSIONS_PER_HOUR)
            ? 'Rate Limit Reached' 
            : 'Book Your Appointment'
        }
      </button>
      
      <p className="text-gray-500 text-xs text-center">
        By submitting this form, you agree to our booking terms and conditions.
      </p>
    </form>
  );
} 