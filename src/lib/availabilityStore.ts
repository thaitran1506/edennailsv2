// Shared in-memory storage for availability across all API routes
export const availabilityStore = new Map<string, number>();

// Initialize availability for a date if not exists
export function initializeAvailabilityForDate(date: string) {
  const businessHours = {
    monday: { open: '10:00', close: '19:00' },
    tuesday: { open: '10:00', close: '19:00' },
    wednesday: { open: '10:00', close: '19:00' },
    thursday: { open: '10:00', close: '19:00' },
    friday: { open: '10:00', close: '20:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '11:00', close: '17:00' }
  };

  const requestedDate = new Date(date);
  const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayConfig = businessHours[dayName as keyof typeof businessHours];

  if (!dayConfig) {
    return [];
  }

  const [openHour, openMinute] = dayConfig.open.split(':').map(Number);
  const [closeHour, closeMinute] = dayConfig.close.split(':').map(Number);
  
  const startTime = openHour * 60 + openMinute;
  const endTime = closeHour * 60 + closeMinute;
  
  const timeSlots = [];
  
  // Generate 1-hour slots
  for (let time = startTime; time < endTime; time += 60) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const slotKey = `${date}-${timeString}`;
    
    // Initialize with 3 available slots if not exists
    if (!availabilityStore.has(slotKey)) {
      availabilityStore.set(slotKey, 3);
    }
    
    const availableSlots = availabilityStore.get(slotKey) || 0;
    
    // Check if slot is in the future
    const now = new Date();
    const slotDateTime = new Date(`${date}T${timeString}:00-07:00`);
    const isInFuture = slotDateTime.getTime() > now.getTime();
    
    if (isInFuture && availableSlots > 0) {
      timeSlots.push({
        time: timeString,
        availableSlots: availableSlots,
        technicians: ['Technician 1', 'Technician 2', 'Technician 3']
      });
    }
  }
  
  return timeSlots;
}

// Book a time slot (decrement availability)
export function bookTimeSlot(date: string, time: string): boolean {
  const slotKey = `${date}-${time}`;
  const currentAvailability = availabilityStore.get(slotKey) || 0;
  
  console.log(`Attempting to book ${slotKey}, current availability: ${currentAvailability}`);
  
  if (currentAvailability > 0) {
    availabilityStore.set(slotKey, currentAvailability - 1);
    console.log(`Successfully booked ${slotKey}, new availability: ${currentAvailability - 1}`);
    return true;
  }
  
  console.log(`Failed to book ${slotKey}, no availability`);
  return false;
}

// Get current availability for a specific slot
export function getSlotAvailability(date: string, time: string): number {
  const slotKey = `${date}-${time}`;
  return availabilityStore.get(slotKey) || 0;
}
