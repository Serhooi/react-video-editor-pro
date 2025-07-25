import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }
  
  // Add headers to allow cross-origin embedding for all routes
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  response.headers.delete('X-Frame-Options');
  response.headers.set('Content-Security-Policy', "frame-ancestors *;");
  
  // Force remove any blocking headers
  response.headers.delete('X-Content-Type-Options');
  response.headers.delete('Referrer-Policy');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};