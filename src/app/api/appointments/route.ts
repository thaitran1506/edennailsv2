import { NextRequest, NextResponse } from 'next/server';
import { TECHNICIANS } from '../../../lib/bookingUtils';

interface BookingData {
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  technicianId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: number;
  service: string;
  specialRequests: string;
  bookingSubmittedAt: string;
  status: string;
  duration?: string;
  clientPlatform?: string;
  rawDate?: string;
  rawTime?: string;
  type?: string;
  technicianName?: string;
}

// Server-side function to fetch existing bookings from Google Sheets
async function getExistingBookingsServerSide(date: string): Promise<BookingData[]> {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    // The Google Apps Script doesn't support date filtering, so we get all appointments
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
      
      // Filter appointments by date
      const filteredAppointments = appointments.filter((appointment: { appointmentDate?: string }) => {
        if (!appointment.appointmentDate) return false;
        
        // Try to parse the appointment date
        let appointmentDateStr = appointment.appointmentDate;
        
        // Handle different date formats
        if (typeof appointmentDateStr === 'string') {
          // If it's an ISO string, extract just the date part
          if (appointmentDateStr.includes('T')) {
            appointmentDateStr = appointmentDateStr.split('T')[0];
          }
          
          // If it's a date object, convert to string
          if (appointmentDateStr.includes('/')) {
            const dateParts = appointmentDateStr.split('/');
            if (dateParts.length === 3) {
              const year = dateParts[2];
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              appointmentDateStr = `${year}-${month}-${day}`;
            }
          }
        }
        
        return appointmentDateStr === date;
      });
      
      return filteredAppointments;
    }
  } catch (error) {
    console.error('Error fetching existing bookings server-side:', error);
  }
  
  return [];
}

// Server-side function to check slot availability
async function isSlotAvailableServerSide(date: string, time: string): Promise<boolean> {
  try {
    const existingBookings = await getExistingBookingsServerSide(date);
    const bookingsAtThisTime = existingBookings.filter(
      (booking: BookingData) => booking.appointmentTime === time
    );
    
    return bookingsAtThisTime.length < 3;
  } catch (error) {
    console.error('Error checking slot availability server-side:', error);
    return false; // Assume not available if we can't check
  }
}

// Server-side function to get next available technician
async function getNextAvailableTechnicianServerSide(date: string, time: string): Promise<string> {
  try {
    const existingBookings = await getExistingBookingsServerSide(date);
    const bookingsAtThisTime = existingBookings.filter(
      (booking: BookingData) => booking.appointmentTime === time
    );

    // Get technician IDs that are already booked
    const bookedTechnicianIds = bookingsAtThisTime.map((booking: BookingData) => booking.technicianId);
    
    // Find the first available technician
    const availableTechnician = TECHNICIANS.find(tech => 
      !bookedTechnicianIds.includes(tech.id)
    );

    return availableTechnician?.id || 'tech1'; // Fallback to first technician
  } catch (error) {
    console.error('Error determining technician availability server-side:', error);
    // Use round-robin assignment based on time
    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'];
    const timeIndex = timeSlots.indexOf(time);
    const technicianIndex = timeIndex % TECHNICIANS.length;
    return TECHNICIANS[technicianIndex]?.id || 'tech1';
  }
}

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
    const isAvailable = await isSlotAvailableServerSide(body.date, body.time);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    // Get the next available technician
    const technicianId = await getNextAvailableTechnicianServerSide(body.date, body.time);
    const technician = TECHNICIANS.find(tech => tech.id === technicianId);

    // Prepare appointment data
    const appointmentData: BookingData = {
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