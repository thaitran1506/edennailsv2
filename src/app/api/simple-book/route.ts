import { NextResponse } from 'next/server';

// Simple in-memory storage for availability (same as simple-availability)
const availabilityStore = new Map<string, number>();

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.name || !body.email || !body.phone || !body.service || !body.date || !body.time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`=== Simple Booking Request ===`);
    console.log(`Customer: ${body.name}`);
    console.log(`Date: ${body.date}, Time: ${body.time}`);
    console.log(`Service: ${body.service}`);

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

    // Try to book the time slot
    const slotBooked = bookTimeSlot(body.date, body.time);
    
    if (!slotBooked) {
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
