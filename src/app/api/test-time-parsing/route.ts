import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the time parsing logic with the actual Google Sheets data format
    const testBookings = [
      {
        appointmentTime: "1899-12-30T21:00:00.000Z",
        customerName: "Test Customer 1"
      },
      {
        appointmentTime: "1899-12-30T20:00:00.000Z", 
        customerName: "Test Customer 2"
      }
    ];

    const testTimes = ["21:00", "20:00", "19:00", "22:00"];

    const results = testTimes.map(targetTime => {
      const bookingsAtTime = testBookings.filter(booking => {
        let bookingTime = booking.appointmentTime;
        
        // Handle the weird Excel-style time format: "1899-12-30T21:00:00.000Z"
        if (bookingTime.includes('1899-12-30T')) {
          const timePart = bookingTime.split('T')[1];
          if (timePart.includes(':')) {
            bookingTime = timePart.split(':').slice(0, 2).join(':');
          }
        }
        
        return bookingTime === targetTime;
      });

      return {
        targetTime,
        parsedBookings: bookingsAtTime.length,
        bookingDetails: bookingsAtTime
      };
    });

    return NextResponse.json({
      success: true,
      testResults: results,
      explanation: "This tests the time parsing logic with the actual Google Sheets format"
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
