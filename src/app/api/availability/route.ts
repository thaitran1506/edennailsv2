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
    
    const response = await fetch(`${scriptUrl}?action=getBookings&date=${date}`, {
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
      
      console.log(`Found ${appointments.length} appointments for ${date}`);
      return appointments;
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
    
    console.log(`Total existing bookings: ${existingBookings.length}`);
    
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
          const matches = bookingTime === time || 
                         bookingTime === time.replace(':', '') ||
                         bookingTime === time.replace(':', '.');
          
          if (matches) {
            console.log(`Found booking at ${time}: ${booking.customerName} (${booking.appointmentTime})`);
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
