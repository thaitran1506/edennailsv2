'use client';

import { useState } from 'react';

export default function TestBooking() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBooking = async () => {
    setLoading(true);
    setResult('Testing...');
    
    const testData = {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      service: 'Classic Manicure',
      message: 'This is a sample booking',
      honeypot: ''
    };

    try {
      console.log('🔵 Test: Sending request to /api/book');
      
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('🔵 Test: Response status:', response.status);
      
      const data = await response.json();
      console.log('🔵 Test: Response data:', data);
      
      if (response.ok) {
        setResult(`✅ Success: ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('🔴 Test: Error:', error);
      setResult(`❌ Network Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Booking API Test</h1>
          
          <div className="space-y-6">
            <button
              onClick={testBooking}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Booking API'}
            </button>
            
            {result && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <p className="text-sm">{result}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p>This will test the booking API with sample data.</p>
              <p>Check the browser console for detailed logs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 