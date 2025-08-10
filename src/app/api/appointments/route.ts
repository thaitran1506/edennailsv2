import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute

// Validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function validateDate(date: string): boolean {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
}

function validateTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': rateLimit.remaining.toString() } }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
        return NextResponse.json(
          { error: `Missing or invalid ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!validatePhone(body.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate date (must be today or future)
    if (!validateDate(body.date)) {
      return NextResponse.json(
        { error: 'Date must be today or in the future' },
        { status: 400 }
      );
    }

    // Validate time format
    if (!validateTime(body.time)) {
      return NextResponse.json(
        { error: 'Invalid time format' },
        { status: 400 }
      );
    }

    // Prepare appointment data
    const appointmentData = {
      timestamp: new Date().toISOString(),
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      service: body.service.trim(),
      date: body.date,
      time: body.time,
      specialRequest: body.specialRequest ? body.specialRequest.trim() : '',
      rawDate: body.date,
      rawTime: body.time,
      type: 'appointment'
    };

    // Send to Google Sheets
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (scriptUrl) {
      try {
        const sheetsResponse = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        });

        if (!sheetsResponse.ok) {
          console.error('Google Sheets response error:', sheetsResponse.status, sheetsResponse.statusText);
          // Continue with fallback even if Google Sheets fails
        } else {
          const sheetsResult = await sheetsResponse.text();
          console.log('Google Sheets response:', sheetsResult);
        }
      } catch (fetchError) {
        console.error('Primary fetch error to Google Sheets:', fetchError);
        // Continue with fallback
      }
    } else {
      console.warn('GOOGLE_APPS_SCRIPT_URL is not configured. Skipping Google Sheets sync.');
    }

    // Update rate limiting
    const currentRecord = rateLimitStore.get(clientIP);
    if (currentRecord) {
      currentRecord.count++;
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Appointment booked successfully!',
        appointmentId: `APPT-${Date.now()}`,
        rateLimitRemaining: rateLimit.remaining - 1
      },
      { 
        status: 200,
        headers: { 'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString() }
      }
    );

  } catch (error) {
    console.error('Appointment booking error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

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
    } as const;
    
    const dayConfig = businessHours[dayName as keyof typeof businessHours];
    
    if (dayConfig.closed) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        message: 'Closed on this day'
      });
    }
    
    const availableSlots: string[] = [];
    const [openHour, openMinute] = dayConfig.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayConfig.close.split(':').map(Number);
    
    const startTime = openHour * 60 + openMinute;
    const endTime = closeHour * 60 + closeMinute;
    
    // Generate 1-hour slots with availability info
    const slotsWithAvailability: Array<{ time: string; availableSpots: number; maxCapacity: number }> = [];
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
      
      if (isAvailable && isInFuture) {
        availableSlots.push(timeString);
        slotsWithAvailability.push({
          time: timeString,
          availableSpots,
          maxCapacity: MAX_APPOINTMENTS_PER_SLOT
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      availableSlots,
      slotsWithAvailability,
      maxTechnicians: MAX_TECHNICIANS,
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