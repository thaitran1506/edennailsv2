import { NextResponse } from 'next/server';

// Simple in-memory storage for availability
const availabilityStore = new Map<string, number>();

// Initialize availability for a date if not exists
function initializeAvailabilityForDate(date: string) {
  const businessHours = {
    monday: { open: '10:00', close: '19:00' },
    tuesday: { open: '10:00', close: '19:00' },
    wednesday: { open: '10:00', close: '19:00' },
    thursday: { open: '10:00', close: '19:00' },
    friday: { open: '10:00', close: '20:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '11:00', close: '17:00' }
  };

  const requestedDate = new Date(date);
  const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayConfig = businessHours[dayName as keyof typeof businessHours];

  if (!dayConfig) {
    return [];
  }

  const [openHour, openMinute] = dayConfig.open.split(':').map(Number);
  const [closeHour, closeMinute] = dayConfig.close.split(':').map(Number);
  
  const startTime = openHour * 60 + openMinute;
  const endTime = closeHour * 60 + closeMinute;
  
  const timeSlots = [];
  
  // Generate 1-hour slots
  for (let time = startTime; time < endTime; time += 60) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const slotKey = `${date}-${timeString}`;
    
    // Initialize with 3 available slots if not exists
    if (!availabilityStore.has(slotKey)) {
      availabilityStore.set(slotKey, 3);
    }
    
    const availableSlots = availabilityStore.get(slotKey) || 0;
    
    // Check if slot is in the future
    const now = new Date();
    const slotDateTime = new Date(`${date}T${timeString}:00-07:00`);
    const isInFuture = slotDateTime.getTime() > now.getTime();
    
    if (isInFuture && availableSlots > 0) {
      timeSlots.push({
        time: timeString,
        availableSlots: availableSlots,
        technicians: ['Technician 1', 'Technician 2', 'Technician 3']
      });
    }
  }
  
  return timeSlots;
}

// Book a time slot (decrement availability)
function bookTimeSlot(date: string, time: string): boolean {
  const slotKey = `${date}-${time}`;
  const currentAvailability = availabilityStore.get(slotKey) || 0;
  
  if (currentAvailability > 0) {
    availabilityStore.set(slotKey, currentAvailability - 1);
    return true;
  }
  
  return false;
}

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
