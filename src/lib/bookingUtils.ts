export interface TimeSlot {
  time: string;
  availableSlots: number;
  technicians: string[];
}

export interface BookingAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

export interface Technician {
  id: string;
  name: string;
  available: boolean;
}

export const TECHNICIANS: Technician[] = [
  { id: 'tech1', name: 'Sarah Chen', available: true },
  { id: 'tech2', name: 'Maria Rodriguez', available: true },
  { id: 'tech3', name: 'Jennifer Kim', available: true }
];

// Generate time slots from 9 AM to 7 PM in 30-minute increments
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

// Check if a time is at least 1 hour from now
export const isTimeAvailable = (date: string, time: string): boolean => {
  const now = new Date();
  const bookingDateTime = new Date(`${date}T${time}:00`);
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  
  return bookingDateTime >= oneHourFromNow;
};

// Get available time slots for a specific date
export const getAvailableTimeSlots = async (date: string): Promise<TimeSlot[]> => {
  const allTimeSlots = generateTimeSlots();
  const availableSlots: TimeSlot[] = [];

  // Get existing bookings for this date from Google Sheets
  const existingBookings = await getExistingBookings(date);

  for (const time of allTimeSlots) {
    if (!isTimeAvailable(date, time)) {
      continue; // Skip times that are too soon
    }

    // Count how many bookings exist for this time slot
    const bookingsAtThisTime = existingBookings.filter(
      booking => booking.appointmentTime === time
    );

    const availableSlotsCount = Math.max(0, 3 - bookingsAtThisTime.length);
    
    if (availableSlotsCount > 0) {
      availableSlots.push({
        time,
        availableSlots: availableSlotsCount,
        technicians: TECHNICIANS.map(tech => tech.name)
      });
    }
  }

  return availableSlots;
};

// Get existing bookings from Google Sheets
export const getExistingBookings = async (date: string): Promise<any[]> => {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    const response = await fetch(`${scriptUrl}?action=getBookings&date=${date}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return data.appointments || [];
    }
  } catch (error) {
    console.error('Error fetching existing bookings:', error);
  }
  
  return [];
};

// Check if a specific time slot is available
export const isSlotAvailable = async (date: string, time: string): Promise<boolean> => {
  const existingBookings = await getExistingBookings(date);
  const bookingsAtThisTime = existingBookings.filter(
    booking => booking.appointmentTime === time
  );
  
  return bookingsAtThisTime.length < 3;
};

// Get next available technician for a time slot
export const getNextAvailableTechnician = async (date: string, time: string): Promise<string> => {
  const existingBookings = await getExistingBookings(date);
  const bookingsAtThisTime = existingBookings.filter(
    booking => booking.appointmentTime === time
  );

  // Get technician IDs that are already booked
  const bookedTechnicianIds = bookingsAtThisTime.map(booking => booking.technicianId);
  
  // Find the first available technician
  const availableTechnician = TECHNICIANS.find(tech => 
    !bookedTechnicianIds.includes(tech.id)
  );

  return availableTechnician?.id || 'tech1'; // Fallback to first technician
};

// Format time for display
export const formatTimeForDisplay = (time: string): string => {
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
  return `${displayHour}:${minute} ${ampm}`;
};

// Get minimum booking date (today)
export const getMinBookingDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get maximum booking date (3 months from now)
export const getMaxBookingDate = (): string => {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  return maxDate.toISOString().split('T')[0];
};
