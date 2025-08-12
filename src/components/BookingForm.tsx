'use client';

import { useState } from 'react';
import { generateTimeSlotsForDate, formatTimeForDisplay } from '../lib/bookingUtils';

interface TimeSlot {
  time: string;
  availableSlots: number;
  technicians: string[];
  totalBookings: number;
}

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    specialRequest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If date changed, fetch available time slots
    if (name === 'date' && value) {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setSubmitMessage('Appointment booked successfully! We will contact you to confirm.');
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
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to book appointment. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinBookingDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Book from tomorrow
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxBookingDate = () => {
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    return threeMonthsLater.toISOString().split('T')[0];
  };

  const getBusinessHoursInfo = (date: string) => {
    if (!date) return '';
    
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return 'Business Hours: 9:00 AM - 7:00 PM';
    } else {
      return 'Business Hours: 10:00 AM - 6:00 PM';
    }
  };

  return (
    <section id="booking" className="py-16 bg-white">
      <div className="flex justify-center items-center w-full">
        <div className="w-full px-4">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#181113] mb-4 font-elegant">Schedule Your Appointment</h2>
              <p className="text-lg text-[#88636f] max-w-md mx-auto">Book your appointment with our skilled technicians. Available slots are shown in real-time.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[#181113] mb-6 flex items-center">
                    <div className="w-8 h-8 bg-[#eb477e] rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#181113] mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#181113] mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#181113] mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[#181113] mb-6 flex items-center">
                    <div className="w-8 h-8 bg-[#eb477e] rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    Service & Schedule
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#181113] mb-2">Select Service *</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 appearance-none bg-no-repeat bg-[right_16px_center] text-[#181113] border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")" }}
                        required
                      >
                        <option value="">Choose a service</option>
                        <option value="Manicure">Manicure - $25</option>
                        <option value="Manicure and Shellac">Manicure and Shellac - $35</option>
                        <option value="Pedicure">Pedicure - $35</option>
                        <option value="Eden Signature Pedicure">Eden Signature Pedicure - $50</option>
                        <option value="Pedicure Special">Pedicure Special - $50</option>
                        <option value="Hot Rock Pedicure">Hot Rock Pedicure - $60</option>
                        <option value="Full Set">Full Set - $55+</option>
                        <option value="Fill">Fill - $45+</option>
                        <option value="Dipping Powder">Dipping Powder - $50+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#181113] mb-2">Preferred Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={getMinBookingDate()}
                        max={getMaxBookingDate()}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 text-[#181113] border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white"
                        required
                      />
                      {formData.date && (
                        <p className="text-sm text-[#88636f] mt-1">{getBusinessHoursInfo(formData.date)}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#181113] mb-2">Available Time Slots *</label>
                      {isLoadingSlots ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#eb477e] mx-auto mb-4"></div>
                          <p className="text-[#88636f]">Loading available time slots...</p>
                        </div>
                      ) : availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {availableTimeSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, time: slot.time }))}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                                formData.time === slot.time
                                  ? 'border-[#eb477e] bg-[#eb477e] text-white'
                                  : 'border-gray-200 bg-white text-[#181113] hover:border-[#eb477e] hover:bg-[#eb477e]/5'
                              }`}
                            >
                              <div className="font-semibold">{formatTimeForDisplay(slot.time)}</div>
                              <div className="text-xs opacity-75">{slot.availableSlots} slots</div>
                            </button>
                          ))}
                        </div>
                      ) : formData.date ? (
                        <div className="text-center py-8 text-[#88636f]">
                          <p>No available time slots for this date.</p>
                          <p className="text-sm mt-2">Please try a different date or contact us directly.</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-[#88636f]">
                          <p>Please select a date to see available time slots.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-[#181113] mb-6 flex items-center">
                    <div className="w-8 h-8 bg-[#eb477e] rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </div>
                    Special Requests
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-[#181113] mb-2">Additional Notes (Optional)</label>
                    <textarea
                      name="specialRequest"
                      value={formData.specialRequest}
                      onChange={handleChange}
                      placeholder="Any special requests, preferences, or notes for your appointment..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#eb477e]/20 resize-none text-[#181113] border-gray-200 bg-gray-50 focus:border-[#eb477e] focus:bg-white"
                    ></textarea>
                  </div>
                </div>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{submitMessage}</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{submitMessage}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#eb477e] to-[#d63d6e] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Book Appointment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}