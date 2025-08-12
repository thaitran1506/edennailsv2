import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || '2025-08-12';

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzem-hzGGuaR81oMojjoTAIU-0ypciqaBsQzNm6a5zczxytuZmAuRZBgsKtpNHvBnEu/exec';
    
    console.log(`Testing Google Apps Script for date: ${date}`);
    
    // Test different query parameters
    const tests = [
      { url: `${scriptUrl}?action=getBookings&date=${date}`, description: 'With action parameter' },
      { url: `${scriptUrl}?date=${date}`, description: 'Without action parameter' },
      { url: scriptUrl, description: 'No parameters' }
    ];

    const results = [];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.description}`);
        const response = await fetch(test.url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.text();
        console.log(`Response for ${test.description}:`, data);

        results.push({
          test: test.description,
          status: response.status,
          data: data,
          url: test.url
        });
      } catch (error) {
        results.push({
          test: test.description,
          error: error instanceof Error ? error.message : String(error),
          url: test.url
        });
      }
    }

    return NextResponse.json({
      success: true,
      date,
      results
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}
