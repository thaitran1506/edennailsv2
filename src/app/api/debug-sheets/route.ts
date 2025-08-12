import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    console.log('=== DEBUG: Fetching raw Google Sheets data ===');
    
    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      
      console.log('=== DEBUG: Raw Google Sheets Response ===');
      console.log(JSON.stringify(data, null, 2));
      
      // Analyze the data structure
      let appointments = [];
      if (data.appointments) {
        appointments = data.appointments;
      } else if (data.success && data.appointments) {
        appointments = data.appointments;
      } else if (Array.isArray(data)) {
        appointments = data;
      }
      
      console.log(`=== DEBUG: Found ${appointments.length} total appointments ===`);
      
      // Log each appointment with its structure
      appointments.forEach((appointment: { appointmentDate?: string; appointmentTime?: string; customerName?: string }, index: number) => {
        console.log(`=== DEBUG: Appointment ${index + 1} ===`);
        console.log('Full appointment object:', JSON.stringify(appointment, null, 2));
        console.log('Keys:', Object.keys(appointment));
        console.log('appointmentDate type:', typeof appointment.appointmentDate);
        console.log('appointmentTime type:', typeof appointment.appointmentTime);
        console.log('appointmentDate value:', appointment.appointmentDate);
        console.log('appointmentTime value:', appointment.appointmentTime);
      });
      
      return NextResponse.json({
        success: true,
        totalAppointments: appointments.length,
        appointments: appointments,
        dataStructure: {
          hasAppointments: !!data.appointments,
          hasSuccess: !!data.success,
          isArray: Array.isArray(data),
          keys: Object.keys(data)
        }
      });
      
    } else {
      console.error('=== DEBUG: Google Sheets error ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('=== DEBUG: Fetch error ===');
    console.error(error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
