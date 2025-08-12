import { NextRequest, NextResponse } from 'next/server';
import { initializeAvailabilityForDate, bookTimeSlot } from '../../../lib/availabilityStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    console.log(`=== Simple Availability Check for ${date} ===`);
    
    const timeSlots = initializeAvailabilityForDate(date);
    
    console.log(`Generated ${timeSlots.length} available time slots`);
    
    return NextResponse.json({
      success: true,
      date,
      timeSlots,
      totalSlots: timeSlots.length
    });

  } catch (error) {
    console.error('Error in simple availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, time } = body;
    
    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    console.log(`=== Booking slot: ${date} at ${time} ===`);
    
    const success = bookTimeSlot(date, time);
    
    if (success) {
      console.log(`Successfully booked ${date} at ${time}`);
      return NextResponse.json({
        success: true,
        message: 'Slot booked successfully',
        date,
        time
      });
    } else {
      console.log(`Failed to book ${date} at ${time} - no availability`);
      return NextResponse.json({
        success: false,
        error: 'No availability for this time slot'
      }, { status: 409 });
    }

  } catch (error) {
    console.error('Error booking slot:', error);
    return NextResponse.json(
      { error: 'Failed to book slot' },
      { status: 500 }
    );
  }
}
