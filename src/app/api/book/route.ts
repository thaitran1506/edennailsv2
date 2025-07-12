import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for rate limiting (in production, use Redis or database)
const submissionStore = new Map<string, { count: number; lastSubmission: number }>();

// Rate limiting configuration
const MAX_SUBMISSIONS_PER_HOUR = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MIN_SUBMISSION_INTERVAL = 5000; // 5 seconds

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of submissionStore.entries()) {
    if (now - value.lastSubmission > RATE_LIMIT_WINDOW) {
      submissionStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

function getClientIdentifier(req: NextRequest): string {
  // Use IP address as primary identifier
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Add user agent for additional uniqueness
  const userAgent = req.headers.get('user-agent') || '';
  
  return `${ip}-${userAgent.substring(0, 50)}`;
}

function validateSubmission(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone number is required');
  }
  
  if (!data.service || typeof data.service !== 'string') {
    errors.push('Service selection is required');
  }
  
  // Check for honeypot field (bots will fill this)
  if (data.honeypot && typeof data.honeypot === 'string' && data.honeypot.trim() !== '') {
    errors.push('Bot detection triggered');
  }
  
  // Check message length
  if (data.message && typeof data.message === 'string' && data.message.length > 500) {
    errors.push('Message must be less than 500 characters');
  }
  
  // Check for suspicious patterns
  if (data.name && typeof data.name === 'string' && data.name.toLowerCase().includes('test')) {
    errors.push('Test submissions are not allowed');
  }
  
  if (data.email && typeof data.email === 'string' && data.email.toLowerCase().includes('test')) {
    errors.push('Test email addresses are not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(req: NextRequest) {
  console.log('🔵 Booking API called');
  
  try {
    const clientId = getClientIdentifier(req);
    const now = Date.now();
    
    console.log('🔵 Client ID:', clientId);
    
    // Check rate limiting
    const clientData = submissionStore.get(clientId);
    if (clientData) {
      // Check if within rate limit window
      if (now - clientData.lastSubmission < RATE_LIMIT_WINDOW) {
        // Check submission count
        if (clientData.count >= MAX_SUBMISSIONS_PER_HOUR) {
          console.log('🔴 Rate limit exceeded for client:', clientId);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Rate limit exceeded. Please wait before submitting again.',
              timeUntilReset: Math.ceil((RATE_LIMIT_WINDOW - (now - clientData.lastSubmission)) / (60 * 1000))
            },
            { status: 429 }
          );
        }
        
        // Check minimum interval
        if (now - clientData.lastSubmission < MIN_SUBMISSION_INTERVAL) {
          console.log('🔴 Minimum interval not met for client:', clientId);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Please wait a few seconds before submitting again.' 
            },
            { status: 429 }
          );
        }
      } else {
        // Reset count if outside window
        clientData.count = 0;
      }
    }
    
    // Parse request body
    const body = await req.json();
    console.log('🔵 Request body received:', JSON.stringify(body, null, 2));
    
    // Validate submission data
    const validation = validateSubmission(body);
    if (!validation.isValid) {
      console.log('🔴 Validation failed:', validation.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid submission data',
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    // Check for duplicate submission (same email + service within 1 hour)
    const duplicateKey = `${body.email}-${body.service}`;
    const duplicateData = submissionStore.get(duplicateKey);
    if (duplicateData && now - duplicateData.lastSubmission < RATE_LIMIT_WINDOW) {
      console.log('🔴 Duplicate submission detected:', duplicateKey);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Duplicate booking detected. You have already submitted a booking for this service recently.' 
        },
        { status: 409 }
      );
    }
    
    // Send to Google Sheets
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbymLLbLaEL5P44HTBN4EXATe4AiKjfAja2VG2XoNyoIgHu9pI-8B8PZ88BTbyFtu104/exec';
    
    const submissionData = {
      ...body,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      submissionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('🔵 Sending to Google Sheets:', scriptUrl);
    console.log('🔵 Submission data:', JSON.stringify(submissionData, null, 2));
    
    try {
      const sheetsResponse = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      console.log('🔵 Google Sheets response status:', sheetsResponse.status);
      console.log('🔵 Google Sheets response headers:', Object.fromEntries(sheetsResponse.headers.entries()));
      
      if (!sheetsResponse.ok) {
        const errorText = await sheetsResponse.text();
        console.error('🔴 Google Sheets error response:', errorText);
        
        // Try fallback approach with no-cors (like the original)
        console.log('🔵 Trying fallback approach with no-cors...');
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });
        console.log('🔵 Fallback request sent (no-cors)');
      } else {
        const responseText = await sheetsResponse.text();
        console.log('🔵 Google Sheets success response:', responseText);
      }
    } catch (fetchError) {
      console.error('🔴 Fetch error to Google Sheets:', fetchError);
      
      // Try fallback approach
      console.log('🔵 Trying fallback approach due to fetch error...');
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });
        console.log('🔵 Fallback request sent successfully');
      } catch (fallbackError) {
        console.error('🔴 Fallback also failed:', fallbackError);
        return NextResponse.json(
          { success: false, error: 'Failed to save booking. Please try again later.' },
          { status: 502 }
        );
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
    
    console.log('🔵 Booking processed successfully');
    return NextResponse.json(
      { 
        success: true, 
        message: 'Booking submitted successfully',
        submissionId: submissionData.submissionId
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('🔴 Booking API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to check rate limit status
export async function GET(req: NextRequest) {
  const clientId = getClientIdentifier(req);
  const clientData = submissionStore.get(clientId);
  const now = Date.now();
  
  if (!clientData || now - clientData.lastSubmission > RATE_LIMIT_WINDOW) {
    return NextResponse.json({
      submissions: 0,
      remaining: MAX_SUBMISSIONS_PER_HOUR,
      resetTime: null
    });
  }
  
  return NextResponse.json({
    submissions: clientData.count,
    remaining: Math.max(0, MAX_SUBMISSIONS_PER_HOUR - clientData.count),
    resetTime: new Date(clientData.lastSubmission + RATE_LIMIT_WINDOW).toISOString()
  });
} 