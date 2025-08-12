import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for appointment tracking (shared with availability API)
const appointmentStore = new Map<string, { appointments: Array<{ appointmentId: string; bookedAt: number }> }>();

// Salon capacity configuration
const MAX_TECHNICIANS = 3; // Number of nail technicians available
const MAX_APPOINTMENTS_PER_SLOT = MAX_TECHNICIANS; // One appointment per technician

// Rate limiting configuration
const submissionStore = new Map<string, { count: number; lastSubmission: number }>();
const MAX_APPOINTMENTS_PER_DAY = 5;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function getClientIdentifier(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  return `${ip}-${userAgent.substring(0, 50)}`;
}

// Function to fetch actual bookings from Google Sheets (same as availability API)
async function getGoogleSheetBookings(date: string): Promise<Array<{ appointmentTime: string; customerName: string }>> {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    console.log(`Fetching Google Sheet bookings for date: ${date} in appointments API`);
    
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
      // Handle the weird Excel-style time format: "1899-12-30T21:00:00.000Z"
      if (bookingTime.includes('1899-12-30T')) {
        const timePart = bookingTime.split('T')[1];
        if (timePart.includes(':')) {
          bookingTime = timePart.split(':').slice(0, 2).join(':');
        }
      }
      // If it's an ISO string with date, extract just the time part
      else if (bookingTime.includes('T')) {
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
  
  console.log(`Appointments API - Time ${time}: Google Sheet bookings: ${googleSheetBookingsAtTime.length}, In-memory: ${inMemoryBookings}, Total: ${totalBookings}, Available: ${totalBookings < MAX_APPOINTMENTS_PER_SLOT}`);
  
  return totalBookings < MAX_APPOINTMENTS_PER_SLOT;
}

function bookTimeSlot(date: string, time: string, appointmentId: string): void {
  const slotKey = `${date}-${time}`;
  const existingSlot = appointmentStore.get(slotKey);
  
  if (existingSlot) {
    existingSlot.appointments.push({
      appointmentId,
      bookedAt: Date.now()
    });
  } else {
    appointmentStore.set(slotKey, {
      appointments: [{
        appointmentId,
        bookedAt: Date.now()
      }]
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req);
    const currentTime = Date.now();
    
    // Check rate limiting
    const clientData = submissionStore.get(clientId);
    if (clientData) {
      if (currentTime - clientData.lastSubmission < RATE_LIMIT_WINDOW) {
        if (clientData.count >= MAX_APPOINTMENTS_PER_DAY) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Daily appointment limit reached. Please try again tomorrow.',
              timeUntilReset: Math.ceil((RATE_LIMIT_WINDOW - (currentTime - clientData.lastSubmission)) / (60 * 60 * 1000))
            },
            { status: 429 }
          );
        }
      } else {
        clientData.count = 0;
      }
    }
    
    // Parse request body
    const body = await req.json();
    
    // Basic validation
    if (!body.name || !body.email || !body.phone || !body.service || !body.date || !body.time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if appointment is in the future
    const appointmentDateTime = new Date(`${body.date}T${body.time}:00-07:00`);
    const currentDateTime = new Date();
    
    if (appointmentDateTime.getTime() <= currentDateTime.getTime()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Appointments must be booked for a future time. Please select a later time.' 
        },
        { status: 400 }
      );
    }
    
    // Fetch Google Sheets data to check real-time availability
    const googleSheetBookings = await getGoogleSheetBookings(body.date);
    
    // Check if time slot is available using Google Sheets data
    if (!isTimeSlotAvailable(body.date, body.time, googleSheetBookings)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This time slot is no longer available. Please select a different time.' 
        },
        { status: 409 }
      );
    }
    
    // Generate appointment ID
    const appointmentId = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Reserve the time slot
    bookTimeSlot(body.date, body.time, appointmentId);
    
    // Update rate limiting
    if (clientData) {
      clientData.count++;
      clientData.lastSubmission = currentTime;
    } else {
      submissionStore.set(clientId, { count: 1, lastSubmission: currentTime });
    }
    
    // Format appointment date and time for better readability
    const appointmentDate = new Date(body.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = body.time.split(':').map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);
    const formattedTime = appointmentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Prepare appointment data for Google Sheets
    const appointmentData = {
      // Main appointment info
      appointmentId,
      status: 'PENDING',
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      service: body.service,
      duration: '1 hour',
      
      // Customer details
      customerName: body.name,
      customerEmail: body.email,
      customerPhone: body.phone,
      specialRequests: body.message || 'None',
      
      // System data
      bookingSubmittedAt: new Date().toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      clientPlatform: 'web',
      
      // Raw data for processing
      rawDate: body.date,
      rawTime: body.time,
      type: 'appointment'
    };
    
    // Send to Google Sheets
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    try {
      const sheetsResponse = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (sheetsResponse.ok) {
        const sheetsData = await sheetsResponse.json();
        console.log('Google Sheets response:', sheetsData);
        
        return NextResponse.json({
          success: true,
          message: 'Appointment booked successfully!',
          appointmentId,
          appointment: {
            date: formattedDate,
            time: formattedTime,
            service: body.service,
            customerName: body.name,
            customerEmail: body.email,
            customerPhone: body.phone
          }
        });
      } else {
        console.error('Google Sheets error:', sheetsResponse.status, sheetsResponse.statusText);
        return NextResponse.json(
          { success: false, error: 'Failed to save appointment to database' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save appointment to database' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 