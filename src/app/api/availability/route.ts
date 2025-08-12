import { NextRequest, NextResponse } from 'next/server';
import { generateTimeSlotsForDate, isTimeAvailable, TECHNICIANS } from '../../../lib/bookingUtils';

interface BookingData {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  technicianId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: number;
  service: string;
  specialRequests: string;
  bookingSubmittedAt: string;
  status: string;
}

// Simple in-memory cache (in production, use Redis or similar)
const cache = new Map<string, { data: BookingData[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Optimized server-side function to fetch existing bookings from Google Sheets
async function getExistingBookingsServerSide(date: string): Promise<BookingData[]> {
  try {
    // Check cache first
    const cacheKey = `bookings_${date}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Cache hit for ${date}`);
      return cached.data;
    }

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    console.log(`Fetching bookings for date: ${date}`);
    
    // The Google Apps Script doesn't support date filtering, so we get all appointments
    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Handle different response formats
      let appointments = [];
      if (data.appointments) {
        appointments = data.appointments;
      } else if (data.success && data.appointments) {
        appointments = data.appointments;
      } else if (Array.isArray(data)) {
        appointments = data;
      }
      
      console.log(`Found ${appointments.length} total appointments`);
      
      // Filter appointments by date
      const filteredAppointments = appointments.filter((appointment: { appointmentDate?: string }) => {
        if (!appointment.appointmentDate) return false;
        
        // Try to parse the appointment date
        let appointmentDateStr = appointment.appointmentDate;
        
        // Handle different date formats
        if (typeof appointmentDateStr === 'string') {
          // If it's an ISO string, extract just the date part
          if (appointmentDateStr.includes('T')) {
            appointmentDateStr = appointmentDateStr.split('T')[0];
          }
          
          // If it's already in YYYY-MM-DD format, use it directly
          if (/^\d{4}-\d{2}-\d{2}$/.test(appointmentDateStr)) {
            return appointmentDateStr === date;
          }
          
          // If it's a date object, convert to string
          if (appointmentDateStr.includes('/')) {
            const dateParts = appointmentDateStr.split('/');
            if (dateParts.length === 3) {
              // Handle MM/DD/YYYY format
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              const year = dateParts[2];
              appointmentDateStr = `${year}-${month}-${day}`;
            }
          }
          
          return appointmentDateStr === date;
        }
        
        return false;
      });
      
      console.log(`Filtered to ${filteredAppointments.length} appointments for ${date}`);
      
      // Cache the result
      cache.set(cacheKey, { data: filteredAppointments, timestamp: Date.now() });
      
      return filteredAppointments;
    } else {
      console.error('Google Apps Script error response:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching existing bookings server-side:', error);
  }
  
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Test the isTimeAvailable function
    console.log(`\n=== TESTING isTimeAvailable FUNCTION ===`);
    console.log(`isTimeAvailable function exists: ${typeof isTimeAvailable}`);
    const testResult = isTimeAvailable(date, '10:00');
    console.log(`Test result for ${date} 10:00: ${testResult}`);
    console.log(`=== END TEST ===\n`);

    console.log(`\n=== Availability Check for ${date} ===`);

    // Force clear all cache to ensure fresh data and debugging
    cache.clear();
    console.log(`All cache cleared to ensure fresh data`);

    // Get existing bookings server-side (no CORS issues)
    const existingBookings = await getExistingBookingsServerSide(date);
    
    console.log(`Total existing bookings for ${date}: ${existingBookings.length}`);
    
    // Generate all time slots
    const allTimeSlots = generateTimeSlotsForDate(date);
    const availableSlots = [];

    // Create a fast lookup map for bookings by time
    const bookingsByTime = new Map<string, BookingData[]>();
    existingBookings.forEach(booking => {
      if (booking.appointmentTime) {
        // Normalize time format quickly
        let normalizedTime = booking.appointmentTime;
        if (normalizedTime.includes('T')) {
          const timePart = normalizedTime.split('T')[1];
          normalizedTime = timePart.split('.')[0].substring(0, 5);
        }
        normalizedTime = normalizedTime.replace(/[.:]/g, ':');
        
        if (!bookingsByTime.has(normalizedTime)) {
          bookingsByTime.set(normalizedTime, []);
        }
        bookingsByTime.get(normalizedTime)!.push(booking);
      }
    });

    for (const time of allTimeSlots) {
      console.log(`\n=== DEBUGGING TIME SLOT: ${time} ===`);
      console.log(`All time slots: ${allTimeSlots.join(', ')}`);
      
      try {
        // TEMPORARY TEST: Skip the isTimeAvailable check to see if that's the issue
        console.log(`TEMPORARY TEST: Skipping isTimeAvailable check for ${time}`);
        const isAvailable = true; // Force all times to be available for testing
        console.log(`isTimeAvailable(${date}, ${time}) returned: ${isAvailable} (FORCED TRUE FOR TESTING)`);
        
        if (!isAvailable) {
          console.log(`Skipping ${time} - too soon`);
          continue; // Skip times that are too soon
        }
      } catch (error) {
        console.error(`Error in isTimeAvailable for ${time}:`, error);
        // Continue anyway to see what happens
      }

      // Count how many bookings exist for this time slot
      const bookingsAtThisTime = existingBookings.filter((appointment: { appointmentTime?: string }) => {
        if (!appointment.appointmentTime) return false;
        
        let appointmentTimeStr = appointment.appointmentTime;
        
        // Handle different time formats
        if (typeof appointmentTimeStr === 'string') {
          // If it's an ISO string with date, extract just the time part
          if (appointmentTimeStr.includes('T')) {
            const timePart = appointmentTimeStr.split('T')[1];
            if (timePart.includes(':')) {
              appointmentTimeStr = timePart.split(':').slice(0, 2).join(':');
            }
          }
          
          // If it's already in HH:MM format, use it directly
          if (/^\d{2}:\d{2}$/.test(appointmentTimeStr)) {
            return appointmentTimeStr === time;
          }
          
          // Handle other time formats if needed
          return appointmentTimeStr === time;
        }
        
        return false;
      });
      const availableSlotsCount = Math.max(0, 3 - bookingsAtThisTime.length);
      
      console.log(`Time ${time}: ${bookingsAtThisTime.length} bookings, ${availableSlotsCount} available`);
      
      if (availableSlotsCount > 0) {
        availableSlots.push({
          time,
          availableSlots: availableSlotsCount,
          technicians: TECHNICIANS.map(tech => tech.name),
          totalBookings: bookingsAtThisTime.length
        });
      }
    }

    console.log(`\nFinal result: ${availableSlots.length} available time slots`);

    return NextResponse.json({
      success: true,
      date,
      timeSlots: availableSlots,
      totalExistingBookings: existingBookings.length,
      cached: cache.has(`bookings_${date}`),
      debug: {
        allBookings: existingBookings,
        allTimeSlots: allTimeSlots
      }
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
