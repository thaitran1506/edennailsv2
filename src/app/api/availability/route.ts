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

// Server-side function to fetch existing bookings from Google Sheets
async function getExistingBookingsServerSide(date: string): Promise<BookingData[]> {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    console.log(`Fetching bookings for date: ${date}`);
    
    // The Google Apps Script doesn't support date filtering, so we get all appointments
    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Google Apps Script response:', JSON.stringify(data, null, 2));
      
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
          
          // If it's a date object, convert to string
          if (appointmentDateStr.includes('/')) {
            const dateParts = appointmentDateStr.split('/');
            if (dateParts.length === 3) {
              const year = dateParts[2];
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              appointmentDateStr = `${year}-${month}-${day}`;
            }
          }
        }
        
        console.log(`Comparing appointment date: ${appointmentDateStr} with requested date: ${date}`);
        return appointmentDateStr === date;
      });
      
      console.log(`Filtered to ${filteredAppointments.length} appointments for ${date}`);
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

    for (const time of allTimeSlots) {
      if (!isTimeAvailable(date, time)) {
        continue; // Skip times that are too soon
      }

      // Count how many bookings exist for this time slot
      const bookingsAtThisTime = existingBookings.filter(
        (booking: BookingData) => {
          // Try different time formats
          const bookingTime = booking.appointmentTime;
          if (!bookingTime) return false;
          
          // Normalize time formats
          let normalizedBookingTime = bookingTime;
          if (typeof bookingTime === 'string') {
            // Remove any timezone info
            if (bookingTime.includes('T')) {
              const timePart = bookingTime.split('T')[1];
              normalizedBookingTime = timePart.split('.')[0].substring(0, 5);
            }
            // Handle different separators
            normalizedBookingTime = normalizedBookingTime.replace(/[.:]/g, ':');
          }
          
          const matches = normalizedBookingTime === time;
          
          if (matches) {
            console.log(`Found booking at ${time}: ${booking.customerName} (${booking.appointmentTime} -> ${normalizedBookingTime})`);
          }
          
          return matches;
        }
      );

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
