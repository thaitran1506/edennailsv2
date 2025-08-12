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

// Function to fetch actual bookings from Google Sheets
async function getGoogleSheetBookings(date: string): Promise<Array<{ appointmentTime: string; customerName: string }>> {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    console.log(`Fetching Google Sheet bookings for date: ${date}`);
    
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
      
      console.log(`Found ${appointments.length} total appointments in Google Sheets`);
      
      // Filter appointments by date
      const filteredAppointments = appointments.filter((appointment: { appointmentDate?: string; appointmentTime?: string }) => {
        if (!appointment.appointmentDate || !appointment.appointmentTime) return false;
        
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
      
      // Return appointments with time and customer info
      return filteredAppointments.map((appointment: { appointmentTime: string; customerName: string }) => ({
        appointmentTime: appointment.appointmentTime,
        customerName: appointment.customerName
      }));
      
    } else {
      console.error('Google Sheets error response:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching Google Sheet bookings:', error);
  }
  
  return [];
}

function isTimeSlotAvailable(date: string, time: string, googleSheetBookings: Array<{ appointmentTime: string; customerName: string }>): boolean {
  // Count bookings from Google Sheets for this time slot
  const googleSheetBookingsAtTime = googleSheetBookings.filter(booking => {
    let bookingTime = booking.appointmentTime;
    
    // Handle different time formats
    if (typeof bookingTime === 'string') {
      // If it's an ISO string with date, extract just the time part
      if (bookingTime.includes('T')) {
        const timePart = bookingTime.split('T')[1];
        if (timePart.includes(':')) {
          bookingTime = timePart.split(':').slice(0, 2).join(':');
        }
      }
      
      // If it's already in HH:MM format, use it directly
      if (/^\d{2}:\d{2}$/.test(bookingTime)) {
        return bookingTime === time;
      }
      
      // Handle other time formats if needed
      return bookingTime === time;
    }
    
    return false;
  });
  
  // Also check in-memory store (for new bookings in this session)
  const slotKey = `${date}-${time}`;
  const slotData = appointmentStore.get(slotKey);
  const inMemoryBookings = slotData ? slotData.appointments.length : 0;
  
  const totalBookings = googleSheetBookingsAtTime.length + inMemoryBookings;
  
  console.log(`Time ${time}: Google Sheet bookings: ${googleSheetBookingsAtTime.length}, In-memory: ${inMemoryBookings}, Total: ${totalBookings}, Available: ${totalBookings < MAX_APPOINTMENTS_PER_SLOT}`);
  
  return totalBookings < MAX_APPOINTMENTS_PER_SLOT;
}

function getAvailableSpots(date: string, time: string, googleSheetBookings: Array<{ appointmentTime: string; customerName: string }>): number {
  // Count bookings from Google Sheets for this time slot
  const googleSheetBookingsAtTime = googleSheetBookings.filter(booking => {
    let bookingTime = booking.appointmentTime;
    
    // Handle different time formats
    if (typeof bookingTime === 'string') {
      // If it's an ISO string with date, extract just the time part
      if (bookingTime.includes('T')) {
        const timePart = bookingTime.split('T')[1];
        if (timePart.includes(':')) {
          bookingTime = timePart.split(':').slice(0, 2).join(':');
        }
      }
      
      // If it's already in HH:MM format, use it directly
      if (/^\d{2}:\d{2}$/.test(bookingTime)) {
        return bookingTime === time;
      }
      
      // Handle other time formats if needed
      return bookingTime === time;
    }
    
    return false;
  });
  
  // Also check in-memory store (for new bookings in this session)
  const slotKey = `${date}-${time}`;
  const slotData = appointmentStore.get(slotKey);
  const inMemoryBookings = slotData ? slotData.appointments.length : 0;
  
  const totalBookings = googleSheetBookingsAtTime.length + inMemoryBookings;
  
  return Math.max(0, MAX_APPOINTMENTS_PER_SLOT - totalBookings);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    console.log(`\n=== Availability Check for ${date} ===`);

    // Fetch actual bookings from Google Sheets
    const googleSheetBookings = await getGoogleSheetBookings(date);

    // Generate business hours for the requested date
    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const businessHours = {
      monday: { open: '10:00', close: '19:00', closed: false },
      tuesday: { open: '10:00', close: '19:00', closed: false },
      wednesday: { open: '10:00', close: '19:00', closed: false },
      thursday: { open: '10:00', close: '19:00', closed: false },
      friday: { open: '10:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '11:00', close: '17:00', closed: false }
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
      
      // Check if slot is available using Google Sheets data
      const isAvailable = isTimeSlotAvailable(date, timeString, googleSheetBookings);
      const availableSpots = getAvailableSpots(date, timeString, googleSheetBookings);
      
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
      totalExistingBookings: googleSheetBookings.length,
      cached: false,
      debug: {
        dayName,
        businessHours: dayConfig,
        currentTime: new Date().toISOString(),
        googleSheetBookings: googleSheetBookings.length
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
