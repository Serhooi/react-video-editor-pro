import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🐛 DEBUG PROGRESS: Request received');
  console.log('🐛 DEBUG PROGRESS: Headers:', Object.fromEntries(request.headers.entries()));
  console.log('🐛 DEBUG PROGRESS: Method:', request.method);
  console.log('🐛 DEBUG PROGRESS: URL:', request.url);
  
  try {
    // Try different ways to get the body
    const clonedRequest = request.clone();
    
    // Method 1: text()
    const text = await request.text();
    console.log('🐛 DEBUG PROGRESS: Body as text:', text);
    
    // Method 2: json() on cloned request
    try {
      const json = await clonedRequest.json();
      console.log('🐛 DEBUG PROGRESS: Body as JSON:', json);
    } catch (jsonError) {
      console.log('🐛 DEBUG PROGRESS: JSON parse failed:', jsonError);
    }
    
    return NextResponse.json({
      success: true,
      receivedText: text,
      textLength: text.length,
      isEmpty: !text || text.trim() === '',
      headers: Object.fromEntries(request.headers.entries())
    });
    
  } catch (error) {
    console.error('🐛 DEBUG PROGRESS: Error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}