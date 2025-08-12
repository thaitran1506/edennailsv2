import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlots, generateTimeSlots, isTimeAvailable, TECHNICIANS } from '../../../lib/bookingUtils';

// Server-side function to fetch existing bookings from Google Sheets
async function getExistingBookingsServerSide(date: string) {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    const response = await fetch(`${scriptUrl}?action=getBookings&date=${date}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return data.appointments || [];
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

    // Get existing bookings server-side (no CORS issues)
    const existingBookings = await getExistingBookingsServerSide(date);
    
    // Generate all time slots
    const allTimeSlots = generateTimeSlots();
    const availableSlots = [];

    for (const time of allTimeSlots) {
      if (!isTimeAvailable(date, time)) {
        continue; // Skip times that are too soon
      }

      // Count how many bookings exist for this time slot
      const bookingsAtThisTime = existingBookings.filter(
        (booking: any) => booking.appointmentTime === time
      );

      const availableSlotsCount = Math.max(0, 3 - bookingsAtThisTime.length);
      
      if (availableSlotsCount > 0) {
        availableSlots.push({
          time,
          availableSlots: availableSlotsCount,
          technicians: TECHNICIANS.map(tech => tech.name),
          totalBookings: bookingsAtThisTime.length
        });
      }
    }

    return NextResponse.json({
      success: true,
      date,
      timeSlots: availableSlots,
      totalExistingBookings: existingBookings.length
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
