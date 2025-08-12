import { NextRequest, NextResponse } from 'next/server';
import { isSlotAvailable, getNextAvailableTechnician, TECHNICIANS } from '../../../lib/bookingUtils';

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

    // Check if the time slot is still available
    const isAvailable = await isSlotAvailable(body.date, body.time);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    // Get the next available technician
    const technicianId = await getNextAvailableTechnician(body.date, body.time);
    const technician = TECHNICIANS.find(tech => tech.id === technicianId);

    // Prepare appointment data
    const appointmentData = {
      appointmentId: `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      appointmentDate: new Date(body.date + 'T' + body.time + ':00.000Z').toISOString(),
      appointmentTime: new Date('1899-12-30T' + body.time + ':00.000Z').toISOString(),
      service: body.service.trim(),
      duration: '1 hour',
      customerName: body.name.trim(),
      customerEmail: body.email.trim().toLowerCase(),
      customerPhone: parseInt(body.phone.replace(/[\s\-\(\)]/g, '')),
      specialRequests: body.specialRequest ? body.specialRequest.trim() : '',
      bookingSubmittedAt: new Date().toISOString(),
      clientPlatform: 'web',
      rawDate: new Date(body.date + 'T' + body.time + ':00.000Z').toISOString(),
      rawTime: new Date('1899-12-30T' + body.time + ':00.000Z').toISOString(),
      type: 'appointment',
      technicianId: technicianId,
      technicianName: technician?.name || 'Sarah Chen'
    };

    // Send to Google Sheets
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';

    try {
      const sheetsResponse = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!sheetsResponse.ok) {
        console.error('Google Sheets response error:', sheetsResponse.status, sheetsResponse.statusText);
        return NextResponse.json(
          { error: 'Failed to save booking. Please try again.' },
          { status: 500 }
        );
      } else {
        const sheetsResult = await sheetsResponse.text();
        console.log('Google Sheets response:', sheetsResult);
      }
    } catch (fetchError) {
      console.error('Primary fetch error to Google Sheets:', fetchError);
      return NextResponse.json(
        { error: 'Failed to save booking. Please try again.' },
        { status: 500 }
      );
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
        appointmentId: appointmentData.appointmentId,
        technicianName: appointmentData.technicianName,
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