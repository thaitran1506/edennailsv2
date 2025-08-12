import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '../../../lib/bookingUtils';

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

    const availableSlots = await getAvailableTimeSlots(date);

    return NextResponse.json({
      success: true,
      date,
      timeSlots: availableSlots
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
