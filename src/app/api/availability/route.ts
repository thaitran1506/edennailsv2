import { NextRequest, NextResponse } from 'next/server';
import { generateTimeSlots, isTimeAvailable, TECHNICIANS } from '../../../lib/bookingUtils';

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
const cache = new Map<string, { data: any; timestamp: number }>();
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
      
      // Optimized date filtering - only process appointments for the requested date
      const filteredAppointments = appointments.filter((appointment: { appointmentDate?: string }) => {
        if (!appointment.appointmentDate) return false;
        
        // Fast date comparison - extract just the date part
        const appointmentDateStr = appointment.appointmentDate.split('T')[0];
        return appointmentDateStr === date;
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
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    console.log(`\n=== Availability Check for ${date} ===`);

    // Get existing bookings server-side (no CORS issues)
    const existingBookings = await getExistingBookingsServerSide(date);
    
    console.log(`Total existing bookings for ${date}: ${existingBookings.length}`);
    
    // Generate all time slots
    const allTimeSlots = generateTimeSlots();
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
      if (!isTimeAvailable(date, time)) {
        continue; // Skip times that are too soon
      }

      // Fast lookup instead of filtering
      const bookingsAtThisTime = bookingsByTime.get(time) || [];
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
