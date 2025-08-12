import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for appointment tracking
const appointmentStore = new Map<string, { appointments: Array<{ appointmentId: string; bookedAt: number }> }>();

// Salon capacity configuration
const MAX_TECHNICIANS = 3; // Number of nail technicians available
const MAX_APPOINTMENTS_PER_SLOT = MAX_TECHNICIANS; // One appointment per technician

// Clean up old appointment slots (older than 7 days)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of appointmentStore.entries()) {
    const filteredAppointments = value.appointments.filter(
      apt => now - apt.bookedAt <= 7 * 24 * 60 * 60 * 1000
    );
    if (filteredAppointments.length === 0) {
      appointmentStore.delete(key);
    } else {
      value.appointments = filteredAppointments;
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

function isTimeSlotAvailable(date: string, time: string): boolean {
  const slotKey = `${date}-${time}`;
  const slotData = appointmentStore.get(slotKey);
  
  if (!slotData) {
    return true; // No appointments booked for this slot
  }
  
  return slotData.appointments.length < MAX_APPOINTMENTS_PER_SLOT;
}

function getAvailableSpots(date: string, time: string): number {
  const slotKey = `${date}-${time}`;
  const slotData = appointmentStore.get(slotKey);
  
  if (!slotData) {
    return MAX_APPOINTMENTS_PER_SLOT;
  }
  
  return MAX_APPOINTMENTS_PER_SLOT - slotData.appointments.length;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    console.log(`\n=== Availability Check for ${date} ===`);

    // Generate business hours for the requested date
    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const businessHours = {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '08:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    };
    
    const dayConfig = businessHours[dayName as keyof typeof businessHours];
    
    if (dayConfig.closed) {
      return NextResponse.json({
        success: true,
        timeSlots: [],
        message: 'Closed on this day'
      });
    }
    
    const availableSlots = [];
    const [openHour, openMinute] = dayConfig.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayConfig.close.split(':').map(Number);
    
    const startTime = openHour * 60 + openMinute;
    const endTime = closeHour * 60 + closeMinute;
    
    // Generate 1-hour slots with availability info
    for (let time = startTime; time < endTime; time += 60) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if slot is available
      const isAvailable = isTimeSlotAvailable(date, timeString);
      const availableSpots = getAvailableSpots(date, timeString);
      
      // Check if slot is in the future (allow next available slot)
      const now = new Date();
      
      // Create slot datetime in Pacific Time
      const slotDateTime = new Date(`${date}T${timeString}:00-07:00`);
      
      // Allow booking if slot is in the future (next available slot)
      const isInFuture = slotDateTime.getTime() > now.getTime();
      
      console.log(`Time ${timeString}: available=${isAvailable}, spots=${availableSpots}, future=${isInFuture}`);
      
      if (isAvailable && isInFuture) {
        availableSlots.push({
          time: timeString,
          availableSlots: availableSpots,
          technicians: ['Technician 1', 'Technician 2', 'Technician 3']
        });
      }
    }

    console.log(`Final result: ${availableSlots.length} available time slots`);

    return NextResponse.json({
      success: true,
      date,
      timeSlots: availableSlots,
      totalExistingBookings: 0, // Using in-memory storage now
      cached: false,
      debug: {
        dayName,
        businessHours: dayConfig,
        currentTime: new Date().toISOString()
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
