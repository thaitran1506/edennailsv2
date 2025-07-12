import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for rate limiting and appointment tracking
const submissionStore = new Map<string, { count: number; lastSubmission: number }>();
const appointmentStore = new Map<string, { date: string; time: string; bookedAt: number }>();

// Rate limiting configuration
const MAX_APPOINTMENTS_PER_DAY = 5;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

// Clean up old entries
setInterval(() => {
  const now = Date.now();
  
  // Clean up rate limiting data
  for (const [key, value] of submissionStore.entries()) {
    if (now - value.lastSubmission > RATE_LIMIT_WINDOW) {
      submissionStore.delete(key);
    }
  }
  
  // Clean up old appointment slots (older than 7 days)
  for (const [key, value] of appointmentStore.entries()) {
    if (now - value.bookedAt > 7 * 24 * 60 * 60 * 1000) {
      appointmentStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

function getClientIdentifier(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  return `${ip}-${userAgent.substring(0, 50)}`;
}

function validateAppointmentData(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone number is required');
  } else {
    const phoneDigits = data.phone.replace(/[\s\-\(\)\.+]/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.push('Phone number must be 10-15 digits');
    } else if (!/^\d+$/.test(phoneDigits)) {
      errors.push('Phone number contains invalid characters');
    }
  }
  
  if (!data.service || typeof data.service !== 'string') {
    errors.push('Service selection is required');
  }
  
  if (!data.date || typeof data.date !== 'string') {
    errors.push('Appointment date is required');
  } else {
    const appointmentDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      errors.push('Appointment date cannot be in the past');
    }
    
    // Check if date is more than 30 days in the future
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (appointmentDate > maxDate) {
      errors.push('Appointment date cannot be more than 30 days in the future');
    }
  }
  
  if (!data.time || typeof data.time !== 'string') {
    errors.push('Appointment time is required');
  } else {
    // Validate time format (HH:MM)
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.time)) {
      errors.push('Invalid time format');
    }
  }
  
  // Validate message length if provided
  if (data.message && typeof data.message === 'string' && data.message.length > 500) {
    errors.push('Message must be less than 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isTimeSlotAvailable(date: string, time: string): boolean {
  const slotKey = `${date}-${time}`;
  return !appointmentStore.has(slotKey);
}

function bookTimeSlot(date: string, time: string): void {
  const slotKey = `${date}-${time}`;
  appointmentStore.set(slotKey, {
    date,
    time,
    bookedAt: Date.now()
  });
}

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req);
    const now = Date.now();
    
    // Check rate limiting
    const clientData = submissionStore.get(clientId);
    if (clientData) {
      if (now - clientData.lastSubmission < RATE_LIMIT_WINDOW) {
        if (clientData.count >= MAX_APPOINTMENTS_PER_DAY) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Daily appointment limit reached. Please try again tomorrow.',
              timeUntilReset: Math.ceil((RATE_LIMIT_WINDOW - (now - clientData.lastSubmission)) / (60 * 60 * 1000))
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
    
    // Validate appointment data
    const validation = validateAppointmentData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid appointment data: ' + validation.errors.join(', '),
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    // Check if time slot is available
    if (!isTimeSlotAvailable(body.date, body.time)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This time slot is no longer available. Please select a different time.' 
        },
        { status: 409 }
      );
    }
    
    // Check for duplicate appointment (same email + date)
    const duplicateKey = `${body.email}-${body.date}`;
    const duplicateData = submissionStore.get(duplicateKey);
    if (duplicateData && now - duplicateData.lastSubmission < RATE_LIMIT_WINDOW) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You already have an appointment scheduled for this date. Please choose a different date or contact us to modify your existing appointment.' 
        },
        { status: 409 }
      );
    }
    
    // Reserve the time slot
    bookTimeSlot(body.date, body.time);
    
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
      // Main appointment info (first columns)
      appointmentId: `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      clientPlatform: body.clientInfo?.platform || 'unknown',
      
      // Raw data for processing
      rawDate: body.date,
      rawTime: body.time,
      type: 'appointment'
    };
    
    // Send to Google Sheets
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbymLLbLaEL5P44HTBN4EXATe4AiKjfAja2VG2XoNyoIgHu9pI-8B8PZ88BTbyFtu104/exec';
    
    try {
      const sheetsResponse = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!sheetsResponse.ok) {
        console.warn('Google Sheets CORS response not OK:', sheetsResponse.status, sheetsResponse.statusText);
        
        // Try fallback approach with no-cors
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });
      }
    } catch (fetchError) {
      console.error('Primary fetch error to Google Sheets:', fetchError);
      
      // Try fallback approach
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        });
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        // Don't fail the appointment - we have the data locally
        console.warn('Appointment booked locally but may not have synced to Google Sheets');
      }
    }
    
    // Update rate limiting data
    if (clientData) {
      clientData.count += 1;
      clientData.lastSubmission = now;
    } else {
      submissionStore.set(clientId, { count: 1, lastSubmission: now });
    }
    
    // Track duplicate prevention
    submissionStore.set(duplicateKey, { count: 1, lastSubmission: now });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Appointment booked successfully! We will send you a confirmation email shortly.',
        appointmentId: appointmentData.appointmentId,
        appointmentDetails: {
          date: body.date,
          time: body.time,
          service: body.service
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Appointment booking API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// GET method to check available time slots
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
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
        availableSlots: [],
        message: 'Closed on this day'
      });
    }
    
    const availableSlots = [];
    const [openHour, openMinute] = dayConfig.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayConfig.close.split(':').map(Number);
    
    const startTime = openHour * 60 + openMinute;
    const endTime = closeHour * 60 + closeMinute;
    
    // Generate 1-hour slots
    for (let time = startTime; time < endTime; time += 60) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if slot is available
      const isAvailable = isTimeSlotAvailable(date, timeString);
      
      // Check if slot is in the past for today
      const now = new Date();
      const slotDateTime = new Date(date);
      slotDateTime.setHours(hour, minute, 0, 0);
      
      const isNotPast = slotDateTime > now;
      
      if (isAvailable && isNotPast) {
        availableSlots.push(timeString);
      }
    }
    
    return NextResponse.json({
      success: true,
      availableSlots,
      date,
      dayName
    });
    
  } catch (error) {
    console.error('Get availability API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get availability' },
      { status: 500 }
    );
  }
} 