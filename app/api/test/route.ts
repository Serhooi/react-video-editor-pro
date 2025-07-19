import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST API: Request received');
    
    // Get raw text first
    const text = await request.text();
    console.log('🧪 TEST API: Raw text:', text);
    
    if (!text || text.trim() === '') {
      return NextResponse.json({
        error: 'Empty request body',
        received: text
      }, { status: 400 });
    }
    
    // Try to parse JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json({
        error: 'Invalid JSON',
        received: text,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 });
    }
    
    console.log('🧪 TEST API: Parsed JSON:', json);
    
    return NextResponse.json({
      message: 'Request processed successfully',
      received: json,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🧪 TEST API: Error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}