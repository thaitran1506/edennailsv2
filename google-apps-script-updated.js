function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Open the spreadsheet (replace with your actual sheet ID)
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Define the column mapping based on new structure
    const columnMapping = {
      'appointmentId': 1,      // Column A
      'status': 2,             // Column B  
      'appointmentDate': 3,    // Column C
      'appointmentTime': 4,    // Column D
      'service': 5,            // Column E
      'duration': 6,           // Column F
      'customerName': 7,       // Column G
      'customerEmail': 8,      // Column H
      'customerPhone': 9,      // Column I
      'specialRequests': 10,   // Column J
      'bookingSubmittedAt': 11, // Column K
      'clientPlatform': 12,    // Column L
      'rawDate': 13,           // Column M
      'rawTime': 14,           // Column N
      'type': 15               // Column O
    };
    
    // Check if this is appointment data (new format) or legacy booking data
    if (data.type === 'appointment') {
      // New appointment format
      const rowData = new Array(15).fill(''); // Create array with 15 empty elements
      
      // Map the data to the correct columns
      rowData[0] = data.appointmentId || '';
      rowData[1] = data.status || 'PENDING';
      rowData[2] = data.appointmentDate || '';
      rowData[3] = data.appointmentTime || '';
      rowData[4] = data.service || '';
      rowData[5] = data.duration || '1 hour';
      rowData[6] = data.customerName || '';
      rowData[7] = data.customerEmail || '';
      rowData[8] = data.customerPhone || '';
      rowData[9] = data.specialRequests || 'None';
      rowData[10] = data.bookingSubmittedAt || '';
      rowData[11] = data.clientPlatform || 'unknown';
      rowData[12] = data.rawDate || '';
      rowData[13] = data.rawTime || '';
      rowData[14] = data.type || 'appointment';
      
      // Add the row to the sheet
      sheet.appendRow(rowData);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Appointment data saved successfully',
          appointmentId: data.appointmentId
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else {
      // Legacy booking format (for backward compatibility)
      const legacyData = [
        data.submissionId || `LEGACY-${Date.now()}`,
        'PENDING',
        data.timestamp || new Date().toLocaleString(),
        '', // appointmentTime (empty for legacy)
        data.service || '',
        '1 hour',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.message || 'None',
        data.timestamp || new Date().toLocaleString(),
        data.clientPlatform || 'unknown',
        '', // rawDate (empty for legacy)
        '', // rawTime (empty for legacy)
        'legacy-booking'
      ];
      
      sheet.appendRow(legacyData);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Legacy booking data saved successfully'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to process request: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Function to get appointment data (for future features)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Convert to JSON format
    const headers = data[0];
    const rows = data.slice(1);
    
    const appointments = rows.map(row => {
      const appointment = {};
      headers.forEach((header, index) => {
        appointment[header] = row[index];
      });
      return appointment;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        appointments: appointments
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to format phone numbers (optional)
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone; // Return original if not 10 digits
} 